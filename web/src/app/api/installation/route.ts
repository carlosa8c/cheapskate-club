import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { verifiedMessage } from "@/lib/installation-protocol";

export async function POST(request: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    return Response.json(
      { error: "Club connections are not configured yet." },
      { status: 503 }
    );
  let verified;
  try {
    const text = await request.text();
    if (text.length > 60000) throw Error();
    verified = verifiedMessage(JSON.parse(text));
  } catch {
    return Response.json(
      { error: "Invalid signed installation request." },
      { status: 400 }
    );
  }
  const client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // Proof of the installation key can recover its active pairing even if a
  // previous client version accidentally replaced its local pending ID.
  if (verified.message.action === "status") {
    const { data: installation, error: lookupError } = await client
      .from("club_installations")
      .select("owner_id,pairing_id,sequence_number,previous_hash")
      .eq("id", verified.message.installation_id)
      .eq("public_key", verified.key)
      .maybeSingle();
    if (lookupError)
      return Response.json(
        { error: "Connection lookup unavailable." },
        { status: 503 }
      );
    if (installation?.owner_id && installation.pairing_id) {
      const { data: profile, error: profileError } = await client
        .from("club_profiles")
        .select("id,handle,display_name")
        .eq("id", installation.owner_id)
        .single();
      if (profileError || !profile)
        return Response.json(
          { error: "Connection account unavailable." },
          { status: 503 }
        );
      return Response.json(
        {
          status: "connected",
          pairing_id: installation.pairing_id,
          account_id: profile.id,
          handle: profile.handle,
          name: profile.display_name,
          sequence: installation.sequence_number,
          previous_hash: installation.previous_hash,
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  const { data, error } = await client.rpc("club_installation_request", {
    message: verified.message,
    key_hex: verified.key,
    digest: verified.hash,
    sender: createHash("sha256")
      .update(
        process.env.SUPABASE_SERVICE_ROLE_KEY +
          ":" +
          (request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown")
      )
      .digest("hex"),
  });
  if (error) {
    const codes: Record<string, string> = {
      "Pairing expired": "pairing_expired",
      "Pairing revoked": "revoked",
      "Pairing inactive": "revoked",
      "Sharing is paused": "paused",
      "Already connected; disconnect first": "already_connected",
      "Installation key mismatch": "key_mismatch",
      "Too many pairing attempts; try later": "rate_limit",
    };
    return Response.json(
      {
        code: codes[error.message] || "conflict",
        error: "Club request could not be accepted.",
      },
      { status: 409 }
    );
  }

  // If sync succeeded, attach fresh profile info so local client stays in sync with account renames
  if (data && typeof data === "object" && verified.message.action === "sync") {
    try {
      const { data: inst } = await client
        .from("club_installations")
        .select("owner_id")
        .eq("id", verified.message.installation_id)
        .maybeSingle();
      if (inst?.owner_id) {
        const { data: prof } = await client
          .from("club_profiles")
          .select("handle,display_name")
          .eq("id", inst.owner_id)
          .maybeSingle();
        if (prof?.handle) {
          (data as Record<string, unknown>).handle = prof.handle;
          (data as Record<string, unknown>).name = prof.display_name;
        }
      }
    } catch {}
  }

  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}

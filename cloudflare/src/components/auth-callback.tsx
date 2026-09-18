"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export function AuthCallback({
  supabaseUrl,
  supabaseKey,
}: {
  supabaseUrl: string;
  supabaseKey: string;
}) {
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    async function exchange() {
      if (!supabaseUrl || !supabaseKey) {
        window.location.href = "/account";
        return;
      }

      try {
        const client = createClient(supabaseUrl, supabaseKey);
        const searchParams = new URLSearchParams(window.location.search);
        
        // 1. Check for provider error in query string
        const errorDesc = searchParams.get("error_description") || searchParams.get("error");
        if (errorDesc) {
          setErrorDetails(errorDesc);
          setStatus("error");
          setTimeout(() => {
            window.location.href = "/join?status=callback";
          }, 3000);
          return;
        }

        // 2. Check for PKCE authorization code
        const code = searchParams.get("code");
        if (code) {
          const { error: exchangeErr } = await client.auth.exchangeCodeForSession(code);
          if (exchangeErr) {
            console.error("Exchange error:", exchangeErr);
            setErrorDetails(exchangeErr.message);
            setStatus("error");
            setTimeout(() => {
              window.location.href = "/join?status=callback";
            }, 3000);
            return;
          }
        }

        // 3. Verify session was established (via code exchange or implicit hash)
        const { data: { session } } = await client.auth.getSession();
        if (session) {
          setStatus("success");
          const pairingId = localStorage.getItem("club_pairing");
          const destination = pairingId ? `/connect?id=${pairingId}` : "/account";
          window.location.href = destination;
          return;
        }

        // 4. Listen for auth change as a fallback if session is still processing
        const { data: authListener } = client.auth.onAuthStateChange((event, newSession) => {
          if (newSession) {
            authListener.subscription.unsubscribe();
            setStatus("success");
            const pairingId = localStorage.getItem("club_pairing");
            const destination = pairingId ? `/connect?id=${pairingId}` : "/account";
            window.location.href = destination;
          }
        });

        // Timeout fallback
        setTimeout(() => {
          window.location.href = "/account";
        }, 2000);

      } catch (err: any) {
        console.error("Auth callback error:", err);
        setErrorDetails(err.message || "Unexpected error");
        setStatus("error");
        setTimeout(() => {
          window.location.href = "/join?status=callback";
        }, 3000);
      }
    }

    exchange();
  }, [supabaseUrl, supabaseKey]);

  return (
    <section className="prose" style={{ textAlign: "center", margin: "80px auto" }}>
      <p className="eyebrow">THE CHEAPSKATE CLUB</p>
      <h1>
        {status === "error"
          ? "Sign-in issue"
          : status === "success"
          ? "Welcome to the Club!"
          : "Completing sign-in…"}
      </h1>
      <p className="lede">
        {status === "error"
          ? `We couldn’t complete sign-in: ${errorDetails}. Returning to join page…`
          : status === "success"
          ? "Redirecting to your account…"
          : "Authenticating with Supabase and preparing your corner of the club."}
      </p>
      {status === "processing" && (
        <div style={{ fontSize: "36px", margin: "24px 0" }} aria-hidden="true">
          ⏳
        </div>
      )}
    </section>
  );
}

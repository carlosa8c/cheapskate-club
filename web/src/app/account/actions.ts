"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authConfigured, supabase } from "@/lib/supabase";
import { profileInput } from "@/lib/profile-input";

export async function signIn(form: FormData) {
  const provider = form.get("provider");
  if (provider !== "x" && provider !== "github") redirect("/join?status=unavailable");
  if (!authConfigured() || !process.env.SITE_URL) redirect("/join?status=setup");
  const client = await supabase();
  const { data, error } = await client.auth.signInWithOAuth({
    provider,
    options: { redirectTo: new URL("/auth/callback", process.env.SITE_URL).toString() },
  });
  if (error || !data.url) redirect("/join?status=unavailable");
  redirect(data.url);
}
export async function signOut() {
  if (!authConfigured()) redirect("/join");
  const client = await supabase();
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) redirect("/account?status=signout-error");
  redirect("/join");
}
export async function saveProfile(form: FormData) {
  if (!authConfigured()) redirect("/join");
  const client = await supabase();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/join?status=expired");
  const profile = profileInput(form);
  if (!profile) redirect("/account?status=invalid");
  const { error } = await client.from("club_profiles").upsert({ id: user.id, ...profile }, { onConflict: "id" });
  if (error) redirect(`/account?status=${error.code === "23505" ? "taken" : "save-error"}`);
  revalidatePath("/");
  redirect("/account?status=saved");
}

export async function disconnectInstallation(form:FormData) {
 if(!authConfigured()) redirect("/join");
 const client=await supabase();
 const {error}=await client.rpc("club_revoke_installation",{installation:String(form.get("installation_id")||"")});
 redirect(`/account?status=${error?"disconnect-error":"disconnected"}`);
}

import { NextResponse, type NextRequest } from "next/server";
import { authConfigured, supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  // Fixed destination: callback parameters cannot redirect to another site.
  const origin = process.env.SITE_URL || request.nextUrl.origin;
  if (code && authConfigured()) {
    const client = await supabase();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/account", origin));
  }
  return NextResponse.redirect(new URL("/join?status=callback", origin));
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateUserTokens } from "@/lib/tokens";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Provision tokens for new users (idempotent - won't create duplicates)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await getOrCreateUserTokens(user.id);
        } catch (e) {
          console.error("Failed to provision user tokens:", e);
          // Don't block auth flow if token provisioning fails
        }
      }
      // Handle load balancer scenarios in production
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

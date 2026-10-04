# Google sign-in setup

The frontend supports Google registration/sign-in through Supabase Auth, PKCE,
session restoration and local-device logout. Google redirects back to the app
origin. Signed-out users cannot open operational screens. Account changes remount
the app; signed-in users load their authorized household through HouseholdGate.
Database/Storage persistence now requires the second migration described in
[supabase/README.md](../supabase/README.md). Google provider activation was confirmed
by the user's screenshot; full persistence rollout status is in [PRM.md](PRM.md).

## Account-owner setup (required before real login works)

1. In Google Cloud / Google Auth Platform configure branding, audience, and only
   `openid`, `email`, `profile` scopes. Create a Web application OAuth client.
2. Add the deployed app origin to authorized JavaScript origins. Add this exact
   authorized redirect URI:
   `https://jyuvonicssaegxwpjkwm.supabase.co/auth/v1/callback`.
3. In Supabase Authentication / Sign In / Providers / Google, enable Google and
   enter the client ID and client secret there. Never put the secret in Vite,
   source control, or chat. If Google's app is in Testing, add authorized testers.
4. In Supabase Authentication / URL Configuration set Site URL to the deployed
   app and allow its root URL as a redirect. For local development also allow
   `http://localhost:3000/`. Save, then redeploy the frontend with the existing
   public Vite variables.

## Acceptance check

Open the deployed app, continue with Google, consent as an allowed user, return
to the app, reload to check restoration, then log out and verify screens are
inaccessible. Also test canceled consent and a second account. This requires the
account owner's external provider setup; automated tests cannot certify it.

No Play Store packaging, payments, subscriptions, or monetization added here.
Reference: https://supabase.com/docs/guides/auth/social-login/auth-google

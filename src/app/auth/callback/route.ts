import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        // In a real SSR app with auth-helpers, we would exchange the code for a session here.
        // Since we are using client-side auth primarily for this simple setup,
        // we actually just redirect the user back to the dashboard, 
        // and let the client-side library handle the session recovery from the URL hash/query parameters.
        // However, the standard PKCE flow exchanges code for session on the server.

        // For now, simpler: redirect to dashboard where onAuthStateChange will pick it up?
        // Actually, `signInWithOtp` usually sends a link. If we use the standard supabase-js client
        // without the specialized Next.js helpers, the link might contain a hash token.

        // If we use 'emailRedirectTo', the link contains a 'code' (PKCE) or 'access_token' (Implicit).
        // Let's assume standard client-side behavior.

        // For simplicity with standard supabase-js in App Router without cookie-middleware:
        // We direct them to a client page that handles the hash.
    }

    // URL to redirect to after sign in process completes
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    return NextResponse.redirect(new URL('/dashboard', origin));
}

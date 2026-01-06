import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
    try {
        const { sessionId } = await req.json();

        // Check for key availability
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Missing Stripe Key' }, { status: 500 });
        }

        // Lazy initialize Stripe
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
        }

        // 1. Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
        }

        const userId = session.client_reference_id;

        // Calculate expiry
        const premiumUntil = new Date();
        premiumUntil.setDate(premiumUntil.getDate() + 7);

        // 2. Try to update Server-Side (Best Effort)
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        let serverUpdated = false;

        if (serviceRoleKey) {
            try {
                const { createClient } = await import('@supabase/supabase-js');
                const adminSupabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    serviceRoleKey
                );

                const { error } = await adminSupabase.auth.admin.updateUserById(
                    userId!,
                    { user_metadata: { premium_until: premiumUntil.toISOString() } }
                );

                if (!error) serverUpdated = true;
            } catch (e) {
                console.error("Server update failed (ignoring)", e);
            }
        }

        // Return the info so client can do it if server failed/skipped
        return NextResponse.json({
            success: true,
            premiumUntil: premiumUntil.toISOString(),
            serverUpdated
        });

    } catch (err: any) {
        console.error('Verify Payment Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

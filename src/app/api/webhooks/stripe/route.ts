import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase'; // We'll need a server-side client eventually, but using the lib for now or assuming admin role needed

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: '2025-01-27.acacia', // Rely on default
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    let event: Stripe.Event;

    try {
        if (!sig || !endpointSecret) throw new Error('Missing signature or secret');
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // userId was passed in client_reference_id
        const userId = session.client_reference_id;

        if (userId) {
            // Calculate 7 days from now
            const premiumUntil = new Date();
            premiumUntil.setDate(premiumUntil.getDate() + 7);

            // Update User Metadata in Supabase
            // NOTE: This usually requires SERVICE_ROLE_KEY to update other users.
            // For now, we will log it. In a real app, you'd use a supabase-admin client.
            console.log(`💰 Payment success for user ${userId}. Granting access until ${premiumUntil.toISOString()}`);

            // TODO: Real implementation with supabase-admin:
            // await supabaseAdmin.auth.updateUserById(userId, { user_metadata: { premium_until: premiumUntil.toISOString() } })
        }
    }

    return NextResponse.json({ received: true });
}

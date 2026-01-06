import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialized lazily inside handler

export async function POST(req: Request) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('MISSING STRIPE_SECRET_KEY in .env.local');
            return NextResponse.json({ error: 'Server configuration error: Missing Stripe Key. Please restart server.' }, { status: 500 });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            // apiVersion defaults to package version
        });

        const { userId, email, returnUrl } = await req.json();

        // Default to dashboard if no returnUrl provided
        const successBase = returnUrl || `${req.headers.get('origin')}/dashboard`;
        const cancelBase = returnUrl || `${req.headers.get('origin')}/dashboard`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'dkk',
                        product_data: {
                            name: '7 Dages Ubegrænset Adgang',
                            description: 'Få fuld adgang til Boligtjekker AI analyser i 7 dage.',
                        },
                        unit_amount: 9900, // 99.00 DKK
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${successBase}${successBase.includes('?') ? '&' : '?'}payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${cancelBase}${cancelBase.includes('?') ? '&' : '?'}payment=cancelled`,
            client_reference_id: userId,
            customer_email: email, // Pre-fill email in checkout
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe Checkout Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

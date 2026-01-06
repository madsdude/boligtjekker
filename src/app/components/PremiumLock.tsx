"use client";

import { useState, useEffect } from 'react';
import { Button } from './Button';

interface PremiumLockProps {
    children: React.ReactNode;
    title?: string;
}

export function PremiumLock({ children, title = "Lås op for detaljerne" }: PremiumLockProps) {
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            const { supabase } = await import('@/lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();

            // 1. Check if just returned from successful payment
            const params = new URLSearchParams(window.location.search);
            if (params.get('payment') === 'success') {
                setIsPremium(true);
                // Ideally, clear the param without reload
                window.history.replaceState({}, '', window.location.pathname);
                alert("Betalingen er modtaget! Din konto er nu låst op."); // Simpler feedback
            }

            // 2. Check Supabase User Metadata
            if (session?.user?.user_metadata?.premium_until) {
                const premiumUntil = new Date(session.user.user_metadata.premium_until);
                if (premiumUntil > new Date()) {
                    setIsPremium(true);
                }
            }

            setLoading(false);
        };

        checkStatus();
    }, []);

    const handlePayment = async () => {
        try {
            // Get user from Supabase to pass ID
            const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());

            if (!session?.user) {
                alert("Du skal være logget ind for at betale.");
                return;
            }

            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session.user.id,
                    email: session.user.email,
                    returnUrl: window.location.href // Send current page URL
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Payment initiation failed');
            }

            const { url } = await response.json();
            if (url) {
                window.location.href = url;
            } else {
                throw new Error('No checkout URL returned');
            }

        } catch (error) {
            console.error(error);
            alert("Der skete en fejl ved betalingen. Prøv igen.");
        }
    };

    if (loading) return null; // Or a skeleton

    if (isPremium) {
        return (
            <>
                {children}
                <div style={{ padding: '1rem', textAlign: 'center', opacity: 0.5 }}>
                    <button
                        onClick={() => {
                            localStorage.removeItem('boligtjekker_premium_until');
                            window.location.reload();
                        }}
                        style={{ fontSize: '0.75rem', textDecoration: 'underline', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
                    >
                        [DEBUG] Nulstil Adgang (Test)
                    </button>
                </div>
            </>
        );
    }

    return (
        <div style={{ position: 'relative' }}>
            {/* Blurred Content */}
            <div style={{ filter: 'blur(8px)', opacity: 0.5, pointerEvents: 'none', userSelect: 'none' }}>
                {children}
            </div>

            {/* Lock Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(10,10,20,0.8) 50%, rgba(10,10,20,1) 100%)'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ color: 'var(--secondary)', marginBottom: '2rem', maxWidth: '400px', textAlign: 'center' }}>
                    Få fuld adgang til dybdegående analyser, estimerede udbedringspriser og meget mere.
                </p>

                <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--primary)', background: 'rgba(79, 70, 229, 0.1)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--secondary)', textDecoration: 'line-through' }}>Normalpris per rapport: 249 kr.</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>
                            7 dages ubegrænset adgang
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800 }}>99 kr.</div>
                    </div>
                    <Button size="lg" onClick={handlePayment} style={{ width: '100%' }}>
                        Lås op nu 🔓
                    </Button>
                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.75rem', textAlign: 'center' }}>
                        Ingen binding. Engangsbetaling.
                    </p>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Ensure this uses your singleton

export function usePremiumStatus() {
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                // 1. Check current URL params for post-payment signal
                const params = new URLSearchParams(window.location.search);
                const paymentStatus = params.get('payment');
                const sessionId = params.get('session_id');

                if (paymentStatus === 'success' && sessionId) {
                    // Call our verification API
                    const res = await fetch('/api/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionId }),
                    });

                    if (res.ok) {
                        const { premiumUntil, serverUpdated } = await res.json();

                        // If server couldn't update (no admin key), do it from client
                        if (!serverUpdated && premiumUntil) {
                            console.log("Updating premium status from client...", premiumUntil);
                            await supabase.auth.updateUser({
                                data: { premium_until: premiumUntil }
                            });
                        }

                        setIsPremium(true);
                        // Reload session to get fresh metadata
                        await supabase.auth.refreshSession();

                        // Clean URL without reload
                        window.history.replaceState({}, '', window.location.pathname);
                        return; // Done
                    }
                }

                // 2. Check Supabase User Metadata (The source of truth)
                if (session?.user?.user_metadata?.premium_until) {
                    const premiumUntil = new Date(session.user.user_metadata.premium_until);
                    if (premiumUntil > new Date()) {
                        setIsPremium(true);
                    }
                }
            } catch (e) {
                console.error("Error checking premium status", e);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, []);

    return { isPremium, loading };
}

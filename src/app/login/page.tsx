"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '../components/Button';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;

            setMessage({
                type: 'success',
                text: 'Tjek din email for login-linket!'
            });
        } catch (error) {
            let errorMessage = error instanceof Error ? error.message : 'Der skete en fejl';

            if (errorMessage === 'Failed to fetch') {
                errorMessage = 'Kunne ikke forbinde til Databasen. Tjek om du har indsat dine Supabase Keys i .env.local filen?';
            }

            setMessage({
                type: 'error',
                text: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Log ind på Boligtjekker</h1>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="din@email.dk"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--foreground)'
                            }}
                        />
                    </div>

                    <Button disabled={loading} type="submit" className="w-full">
                        {loading ? 'Sender...' : 'Send Magic Link'}
                    </Button>
                </form>

                {message && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        backgroundColor: message.type === 'success' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                        color: message.type === 'success' ? '#4ade80' : '#f87171',
                        fontSize: '0.875rem'
                    }}>
                        {message.text}
                    </div>
                )}
            </div>

            <p style={{ marginTop: '2rem', color: 'var(--secondary)', fontSize: '0.875rem' }}>
                <a href="/" style={{ textDecoration: 'underline' }}>Tilbage til forsiden</a>
            </p>
        </div>
    );
}

"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from './Button';

export function AuthHeader() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Don't show on login page to avoid clutter
    if (pathname === '/login') return null;

    return (
        <header style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 50,
            pointerEvents: 'none' // Allow clicking through empty space
        }}>
            <div style={{ pointerEvents: 'auto' }}>
                <div
                    onClick={() => router.push('/')}
                    style={{
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    🏠 Boligtjekker AI
                </div>
            </div>

            <div style={{ pointerEvents: 'auto' }}>
                {user ? (
                    <Button variant="secondary" size="sm" onClick={() => router.push('/dashboard')} style={{
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-soft)'
                    }}>
                        👤 Min Side
                    </Button>
                ) : (
                    <Button variant="secondary" size="sm" onClick={() => router.push('/login')}>
                        🔑 Log ind
                    </Button>
                )}
            </div>
        </header>
    );
}

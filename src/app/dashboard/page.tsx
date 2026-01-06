"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Project, SavedComparison } from '../types';
import { Button } from '../components/Button';

export default function DashboardPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([]);
    const router = useRouter();

    useEffect(() => {
        // Check active session
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setUser(session.user);
            fetchProjects(session.user.id);
            fetchSavedComparisons(session.user.id);
        };

        checkUser();
    }, [router]);

    const fetchProjects = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase fetch error:', JSON.stringify(error, null, 2));
                throw error;
            }
            setProjects(data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedComparisons = async (userId: string) => {
        try {
            const res = await fetch(`/api/comparisons?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setSavedComparisons(data);
            }
        } catch (error) {
            console.error('Error fetching saved comparisons:', error);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const toggleProject = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedProjects.includes(id)) {
            setSelectedProjects(prev => prev.filter(p => p !== id));
        } else {
            if (selectedProjects.length >= 2) {
                alert("Du kan kun sammenligne 2 huse ad gangen.");
                return;
            }
            setSelectedProjects(prev => [...prev, id]);
        }
    };

    const handleCompare = () => {
        if (selectedProjects.length !== 2) return;
        router.push(`/compare?p1=${selectedProjects[0]}&p2=${selectedProjects[1]}`);
    };

    if (loading) {
        return <div style={{ padding: '4rem', textAlign: 'center' }}>Indlæser din profil...</div>;
    }

    return (
        <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '2rem',
            minHeight: '100vh',
            paddingBottom: '6rem'
        }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Min Side</h1>
                    <p style={{ color: 'var(--secondary)' }}>Velkommen, {user?.email}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="secondary" onClick={() => router.push('/')}>
                        Ny Analyse
                    </Button>
                    <Button variant="outline" onClick={handleSignOut}>
                        Log ud
                    </Button>
                </div>
            </header>

            <main>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Dine Boliganalyser</h2>
                <p style={{ color: 'var(--secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    Vælg to projekter for at sammenligne dem.
                </p>

                {projects.length === 0 ? (
                    <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary)' }}>
                        <p style={{ marginBottom: '1rem' }}>Du har ikke analyseret nogen boliger endnu.</p>
                        <Button onClick={() => router.push('/')}>Start din første analyse</Button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="glass-card"
                                style={{
                                    padding: '1.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    border: selectedProjects.includes(project.id) ? '1px solid var(--primary)' : '1px solid var(--border)',
                                    backgroundColor: selectedProjects.includes(project.id) ? 'rgba(79, 70, 229, 0.1)' : undefined
                                }}
                                onClick={() => router.push(`/project/${project.id}`)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div
                                        onClick={(e) => toggleProject(project.id, e)}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '6px',
                                            border: '1px solid var(--border)',
                                            background: selectedProjects.includes(project.id) ? 'var(--primary)' : 'rgba(0,0,0,0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {selectedProjects.includes(project.id) && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: 600, fontSize: '1.1rem' }}>{project.address || 'Ukendt Adresse'}</h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>
                                            {new Date(project.createdAt || project.created_at || new Date().toISOString()).toLocaleDateString()} • {project.files?.length || 0} fil(er)
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.75rem',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid var(--border)'
                                    }}>
                                        {project.status === 'completed' ? 'Færdig' : 'Behandles'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Saved Comparisons Section */}
                {savedComparisons.length > 0 && (
                    <section style={{ marginTop: '4rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Gemte Sammenligninger</h2>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {savedComparisons.map((comp) => {
                                const date = new Date(comp.created_at).toLocaleDateString();
                                const winner = comp.data.winner === 'A'
                                    ? (comp.projectA?.address || 'Hus A')
                                    : (comp.projectB?.address || 'Hus B');

                                return (
                                    <div
                                        key={comp.id}
                                        className="glass-card"
                                        style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <div>
                                            <h3 style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                                {comp.projectA?.address || 'Ukendt'} <span style={{ color: 'var(--secondary)' }}>vs</span> {comp.projectB?.address || 'Ukendt'}
                                            </h3>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>
                                                Gemt d. {date} • Vinder: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{winner || 'Ukendt'}</span>
                                            </p>
                                        </div>
                                        <Button variant="secondary" onClick={() => router.push(`/compare?p1=${comp.project_a_id}&p2=${comp.project_b_id}`)}>
                                            Se igen
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>

            {/* Floating Action Bar */}
            {selectedProjects.length === 2 && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--card-bg)', // Assuming this var exists, else fallback color
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--border)',
                    padding: '1rem 2rem',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    animation: 'slideUp 0.3s ease',
                    zIndex: 50
                }}>
                    <span style={{ fontWeight: 600 }}>2 boliger valgt</span>
                    <Button onClick={handleCompare} style={{ boxShadow: '0 0 20px rgba(79, 70, 229, 0.4)' }}>
                        Sammenlign nu ⚡
                    </Button>
                    <button
                        onClick={() => setSelectedProjects([])}
                        style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer' }}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}


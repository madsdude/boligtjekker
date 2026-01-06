"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '../components/Button';
import { Project } from '../types';
import { supabase } from '@/lib/supabase';

function ComparisonContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const p1Id = searchParams.get('p1');
    const p2Id = searchParams.get('p2');

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ projectA: Project, projectB: Project, comparison: any } | null>(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        if (!data) return;
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Du skal være logget ind for at gemme.');
                return;
            }

            const res = await fetch('/api/comparisons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session.user.id,
                    projectAId: p1Id,
                    projectBId: p2Id,
                    data: data.comparison
                })
            });

            if (!res.ok) throw new Error('Kunne ikke gemme');
            setSaved(true);
        } catch (err) {
            console.error(err);
            alert('Fejl ved gemning af sammenligning');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!p1Id || !p2Id) {
            setError('Mangler projekt IDer');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const res = await fetch('/api/compare', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ projectIds: [p1Id, p2Id] })
                });

                if (!res.ok) throw new Error('Kunne ikke hente sammenligning');

                const result = await res.json();
                setData(result);
            } catch (err: any) {
                setError(err.message || 'Der skete en fejl');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [p1Id, p2Id]);

    if (loading) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🤖 AI analyserer forskellene...</h2>
                <p style={{ color: 'var(--secondary)' }}>Dette kan tage et øjeblik. Vi gennemgår begge rapporter side om side.</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Fejl: {error}</h2>
                <Button onClick={() => router.push('/dashboard')}>Tilbage til oversigten</Button>
            </div>
        );
    }

    const { projectA, projectB, comparison } = data;
    const isAWinner = comparison.winner === 'A';

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <Button variant="secondary" onClick={() => router.back()} style={{ marginBottom: '2rem' }}>
                ← Tilbage
            </Button>

            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                    {projectA.address || 'Hus A'} <span style={{ color: 'var(--secondary)', fontWeight: 400 }}>vs</span> {projectB.address || 'Hus B'}
                </h1>
                <div style={{ display: 'inline-block', padding: '1rem 2rem', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '12px', border: '1px solid var(--primary)' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)' }}>
                        Vinder: {isAWinner ? (projectA.address || 'Hus A') : (projectB.address || 'Hus B')} 🏆
                    </span>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                    <Button
                        variant="secondary"
                        onClick={handleSave}
                        disabled={saving || saved}
                    >
                        {saved ? '✅ Gemt' : saving ? 'Gemmer...' : '💾 Gem Sammenligning'}
                    </Button>
                </div>
                <p style={{ marginTop: '1.5rem', maxWidth: '700px', marginInline: 'auto', lineHeight: '1.6', fontSize: '1.1rem' }}>
                    {comparison.winnerReason}
                </p>
                {comparison.costDifference !== 0 && (
                    <p style={{ marginTop: '1rem', color: comparison.costDifference > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                        💰 prisforskel i udbedringer: {Math.abs(comparison.costDifference).toLocaleString('da-DK')} kr.
                        {comparison.costDifference > 0 ? ` (Hus A er dyrest)` : ` (Hus B er dyrest)`}
                    </p>
                )}
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '4rem' }}>
                {/* HEADERS */}
                <div className="glass-card" style={{ padding: '2rem', borderTop: isAWinner ? '4px solid var(--primary)' : undefined }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{projectA.address}</h2>
                    <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        background: getConditionColor(projectA.report?.condition || ''),
                        color: 'white',
                        fontSize: '0.85rem'
                    }}>
                        Stand: {projectA.report?.condition || 'Ukendt'}
                    </span>
                    <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--secondary)' }}>Kontantpris:</span>
                            <span style={{ fontWeight: 600 }}>{projectA.report?.financials?.price ? `${projectA.report.financials.price.toLocaleString()} kr.` : 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--secondary)' }}>Ejerudgift/md:</span>
                            <span style={{ fontWeight: 600 }}>{projectA.report?.financials?.gross ? `${projectA.report.financials.gross.toLocaleString()} kr.` : 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--secondary)' }}>m²-pris:</span>
                            <span style={{ fontWeight: 600 }}>{projectA.report?.financials?.sqmPrice ? `${projectA.report.financials.sqmPrice.toLocaleString()} kr.` : 'N/A'}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Estimeret udbedring:</p>
                        <p style={{ fontSize: '1.25rem' }}>{projectA.report?.estimatedBudget?.min.toLocaleString()} - {projectA.report?.estimatedBudget?.max.toLocaleString()} kr.</p>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '2rem', borderTop: !isAWinner ? '4px solid var(--primary)' : undefined }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{projectB.address}</h2>
                    <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        background: getConditionColor(projectB.report?.condition || ''),
                        color: 'white',
                        fontSize: '0.85rem'
                    }}>
                        Stand: {projectB.report?.condition || 'Ukendt'}
                    </span>
                    <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--secondary)' }}>Kontantpris:</span>
                            <span style={{ fontWeight: 600 }}>{projectB.report?.financials?.price ? `${projectB.report.financials.price.toLocaleString()} kr.` : 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--secondary)' }}>Ejerudgift/md:</span>
                            <span style={{ fontWeight: 600 }}>{projectB.report?.financials?.gross ? `${projectB.report.financials.gross.toLocaleString()} kr.` : 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--secondary)' }}>m²-pris:</span>
                            <span style={{ fontWeight: 600 }}>{projectB.report?.financials?.sqmPrice ? `${projectB.report.financials.sqmPrice.toLocaleString()} kr.` : 'N/A'}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Estimeret udbedring:</p>
                        <p style={{ fontSize: '1.25rem' }}>{projectB.report?.estimatedBudget?.min.toLocaleString()} - {projectB.report?.estimatedBudget?.max.toLocaleString()} kr.</p>
                    </div>
                </div>
            </div>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Direkte Sammenligning</h3>
            <div style={{ display: 'grid', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
                {comparison.comparisonPoints.map((point: any, i: number) => (
                    <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontWeight: 600 }}>{point.category}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ flex: 1, textAlign: 'right', fontSize: '0.9rem' }}>{projectA.address?.split(',')[0]}</div>
                            <div style={{ flex: 2, display: 'flex', gap: '2px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${point.p1Score * 10}%`, background: isAWinner ? '#3b82f6' : '#9ca3af' }}></div>
                            </div>
                            <div style={{ fontWeight: 700 }}>{point.p1Score}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ flex: 1, textAlign: 'right', fontSize: '0.9rem' }}>{projectB.address?.split(',')[0]}</div>
                            <div style={{ flex: 2, display: 'flex', gap: '2px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${point.p2Score * 10}%`, background: !isAWinner ? '#3b82f6' : '#9ca3af' }}></div>
                            </div>
                            <div style={{ fontWeight: 700 }}>{point.p2Score}</div>
                        </div>
                        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--secondary)', fontStyle: 'italic' }}>
                            "{point.comment}"
                        </p>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>💡 Konklusion</h3>
                <p style={{ lineHeight: '1.6' }}>{comparison.recommendation}</p>
            </div>
        </div>
    );
}

function getConditionColor(condition: string) {
    switch (condition?.toLowerCase()) {
        case 'god': return '#10b981';
        case 'middel': return '#f59e0b';
        case 'dårlig':
        case 'kritisk': return '#ef4444';
        default: return '#6b7280';
    }
}

export default function ComparePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ComparisonContent />
        </Suspense>
    );
}

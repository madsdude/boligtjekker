"use client";

import React, { use } from 'react';
import { Project } from '../../types';
import { AnalysisResult } from '../../components/AnalysisResult';
import { PDFDownloadButton } from '../../components/PDFDownloadButton';
import { supabase } from '@/lib/supabase';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';


// Mock Data for "Project 1"
const MOCK_PROJECT_DETAILS: Project = {
    id: '1',
    address: 'Hovedgaden 1, 1234 By',
    files: [
        { id: 'f1', name: 'Salgsopstilling.pdf', size: 1024000, type: 'application/pdf' }
    ],
    status: 'completed',
    createdAt: '2025-01-04T10:00:00Z',
    report: {
        summary: 'En charmerende 70\'er villa med solidt murværk, men som viser tegn på alder. Tagkonstruktionen kræver opmærksomhed, og el-installationerne er af ældre dato. Energioptimering anbefales.',
        condition: 'middel',
        requiredRepairs: [
            { id: 'r1', title: 'Udskiftning af undertag', description: 'Undertaget er revnet eller mangler i flere sektioner. Risiko for vandskade.', priority: 'high', estimatedCost: 150000 },
            { id: 'r2', title: 'Opdatering af eltavle', description: 'Den oprindelige sikringsboks mangler HPFI-beskyttelse. Skal opdateres til lovlige standarder.', priority: 'high', estimatedCost: 25000 },
            { id: 'r3', title: 'Tætning af vinduer', description: 'Tætningslister omkring vinduer i stuen er mørnede. Varmetab konstateret.', priority: 'medium', estimatedCost: 15000 }
        ],
        estimatedBudget: { min: 200000, max: 350000, currency: 'DKK' }
    }
};

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [project, setProject] = React.useState<Project | null>(null);
    const [loading, setLoading] = React.useState(true);
    const { isPremium } = usePremiumStatus();

    React.useEffect(() => {
        const fetchProject = async () => {
            if (id === '1') {
                setProject(MOCK_PROJECT_DETAILS);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    console.error('Error fetching project:', error);
                    // Fallback regarding mock or empty
                }

                if (data) {
                    setProject(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);


    if (loading) {
        return <div style={{ padding: '4rem', textAlign: 'center' }}>Henter projekt data...</div>;
    }

    if (!project) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h2>Projekt ikke fundet</h2>
                <p>Kunne ikke finde analysen med ID: {id}</p>
                <a href="/" style={{ marginTop: '1rem', display: 'inline-block', color: 'var(--primary)' }}>Gå til forsiden</a>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '2rem',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
        }}>
            <header>
                <div style={{ marginBottom: '1rem' }} className="no-print">
                    <a href="/" style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>&larr; Tilbage til start</a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>{project.address}</h1>
                        <p style={{ color: 'var(--secondary)' }}>Analyserapport • {new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className="no-print" style={!isPremium ? { opacity: 0.5, pointerEvents: 'none', filter: 'grayscale(1)' } : {}}>
                            <PDFDownloadButton project={project} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>AI Tillidsscore</div>
                            <div style={{ fontWeight: 600, color: 'var(--primary)' }}>Høj (92%)</div>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {project.status === 'analyzing' ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--secondary)' }}>
                        <p>AI analyserer {project.files.length} dokumenter...</p>
                    </div>
                ) : project.report ? (
                    <AnalysisResult report={project.report} />
                ) : (
                    <p>Ingen rapport tilgængelig.</p>
                )}
            </main>
        </div>
    );
}

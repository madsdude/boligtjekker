import React from 'react';
import { AnalysisReport, RepairItem } from '../types';
import { Button } from './Button';
import { PremiumLock } from './PremiumLock';

interface AnalysisResultProps {
    report: AnalysisReport;
}

const ConditionBadge = ({ condition }: { condition: string }) => {
    const colors = {
        god: { bg: '#dcfce7', text: '#166534' },
        middel: { bg: '#fef9c3', text: '#854d0e' },
        dårlig: { bg: '#fee2e2', text: '#991b1b' },
        kritisk: { bg: '#7f1d1d', text: '#fca5a5' }
    };
    const c = colors[condition as keyof typeof colors] || colors.middel;

    return (
        <span style={{
            backgroundColor: c.bg,
            color: c.text,
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.05em'
        }}>
            {condition}
        </span>
    );
};

export const AnalysisResult = ({ report }: AnalysisResultProps) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Executive Summary */}
            <section className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Husets Tilstand</h2>
                    <ConditionBadge condition={report.condition} />
                </div>
                <p style={{ lineHeight: 1.6, fontSize: '1.125rem' }}>
                    {report.summary}
                </p>
            </section>

            {/* Premium: Deep Dive */}
            <PremiumLock title="Få det fulde overblik">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Budget Verification */}
                    <section className="glass-card" style={{
                        padding: '2rem',
                        textAlign: 'center',
                        background: 'linear-gradient(to bottom right, var(--surface), rgba(255,255,255,0.5))'
                    }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                            Estimeret Udbedringsbudget
                        </h3>
                        <div className="text-gradient" style={{ fontSize: '3rem', fontWeight: 800 }}>
                            {report.estimatedBudget.min.toLocaleString()} - {report.estimatedBudget.max.toLocaleString()}
                            <span style={{ fontSize: '1.5rem', marginLeft: '0.5rem', color: 'var(--secondary)', fontWeight: 500 }}>{report.estimatedBudget.currency}</span>
                        </div>
                        <p style={{ marginTop: '1rem', color: 'var(--secondary)', fontSize: '0.875rem' }}>
                            *Estimater baseret på gennemsnitlige markedspriser for materialer og arbejdsløn.
                        </p>
                    </section>

                    {/* Repair List */}
                    <section>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Nødvendige Reparationer</h3>
                        {report.requiredRepairs.length === 0 ? (
                            <p style={{ color: 'var(--secondary)', fontStyle: 'italic' }}>Ingen kritiske skader fundet i de uploadede dokumenter.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {report.requiredRepairs.map((item) => (
                                    <div key={item.id} className="glass-card" style={{
                                        padding: '1.5rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: '1rem',
                                        borderLeft: item.priority === 'high' ? '4px solid #ef4444' : '1px solid var(--surface-glass-border)'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                <h4 style={{ fontWeight: 600 }}>{item.title}</h4>
                                                {item.priority === 'high' && (
                                                    <span style={{ fontSize: '0.625rem', backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.125rem 0.375rem', borderRadius: '4px', fontWeight: 700 }}>HØJ PRIORITET</span>
                                                )}
                                            </div>
                                            <p style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>{item.description}</p>
                                        </div>
                                        <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                            <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>~{item.estimatedCost.toLocaleString()} kr</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Est. Pris</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </PremiumLock>

        </div>
    );
};

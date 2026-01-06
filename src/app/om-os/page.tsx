"use client";

import Link from 'next/link';

export default function AboutPage() {
    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '4rem 2rem',
            minHeight: '100vh',
        }}>
            <header style={{ marginBottom: '4rem' }}>
                <Link href="/" style={{
                    fontSize: '1rem',
                    color: 'var(--secondary)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '2rem'
                }}>
                    ← Tilbage til forsiden
                </Link>
                <h1 className="text-gradient" style={{
                    fontSize: '3rem',
                    fontWeight: 800,
                    marginBottom: '1rem',
                    lineHeight: 1.2
                }}>
                    Om Boligtjekker AI
                </h1>
                <p style={{ color: 'var(--secondary)', fontSize: '1.25rem' }}>
                    Gennemskuelighed i bolighandlen for alle.
                </p>
            </header>

            <div className="glass-card" style={{ padding: '3rem' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>Vores Mission</h2>
                    <p style={{ lineHeight: 1.8, color: 'var(--foreground)', marginBottom: '1rem' }}>
                        At købe bolig er en af livets største investeringer. Men det er også en proces fyldt med komplekse dokumenter, fagsprog og potentielle økonomiske fælder.
                    </p>
                    <p style={{ lineHeight: 1.8, color: 'var(--foreground)' }}>
                        Boligtjekker AI blev skabt med ét formål: <strong>At give køberen magten tilbage.</strong> Ved hjælp af avanceret kunstig intelligens gennemgår vi tusindvis af sider på sekunder, så du kan se præcis hvad du køber – uden at være byggeekspert.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>Teknologien</h2>
                    <p style={{ lineHeight: 1.8, color: 'var(--foreground)', marginBottom: '1rem' }}>
                        Vi benytter os af de nyeste sprogmodeller fra Google (Gemini Pro) til at analysere tekst og billeder i dine boligdokumenter.
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '1.5rem' }}>🤖</span>
                            <div>
                                <strong>Intelligent Analyse</strong>
                                <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Vi leder ikke bare efter nøgleord, men forstår sammenhængen i tilstandsrapporter og salgsopstillinger.</p>
                            </div>
                        </li>
                        <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '1.5rem' }}>⚡</span>
                            <div>
                                <strong>Lynhurtigt Overblik</strong>
                                <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Få et komplet resume af 50+ siders dokumentation på under 2 minutter.</p>
                            </div>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>Kontakt</h2>
                    <p style={{ lineHeight: 1.8, color: 'var(--foreground)' }}>
                        Har du spørgsmål, ris eller ros? Vi vil meget gerne høre fra dig.
                    </p>
                    <a href="mailto:kontakt@boligtjekker.ai" style={{
                        display: 'inline-block',
                        marginTop: '1rem',
                        color: '#4f46e5',
                        fontWeight: 600,
                        textDecoration: 'underline'
                    }}>
                        kontakt@boligtjekker.ai
                    </a>
                </section>
            </div>
        </div>
    );
}

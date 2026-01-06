"use client";

import Link from 'next/link';

export default function PrivacyPage() {
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
                    Privatlivspolitik
                </h1>
                <p style={{ color: 'var(--secondary)', fontSize: '1.25rem' }}>
                    Dine data er sikre hos os.
                </p>
            </header>

            <div className="glass-card" style={{ padding: '3rem' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>1. Dataansvar</h2>
                    <p style={{ lineHeight: 1.8, color: 'var(--foreground)', marginBottom: '1rem' }}>
                        Vi tager din databeskytelse alvorligt. Denne politik beskriver, hvordan vi indsamler og behandler oplysninger om dig.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>2. Indsamling af Dokumenter</h2>
                    <p style={{ lineHeight: 1.8, color: 'var(--foreground)', marginBottom: '1rem' }}>
                        Når du uploader dokumenter (tilstandsrapporter, salgsopstillinger mv.):
                    </p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: 'var(--foreground)', lineHeight: 1.8 }}>
                        <li>Dokumenterne sendes krypteret til vores server.</li>
                        <li>De analyseres midlertidigt af vores AI-modeller (Google Gemini).</li>
                        <li><strong>Vi gemmer ikke dine dokumenter.</strong> Så snart analysen er færdiggenereret, slettes filerne fra vores servere.</li>
                        <li>Selve analyserapporten gemmes på din brugerprofil, så du kan tilgå den senere.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>3. Betalingsoplysninger</h2>
                    <p style={{ lineHeight: 1.8, color: 'var(--foreground)', marginBottom: '1rem' }}>
                        Vi modtager og gemmer <strong>ikke</strong> dine kortoplysninger.
                    </p>
                    <p style={{ lineHeight: 1.8, color: 'var(--foreground)' }}>
                        Al betaling håndteres af vores betalingspartner, <strong>Stripe</strong>, som er en af verdens førende og mest sikre betalingsløsninger.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>4. Cookies</h2>
                    <p style={{ lineHeight: 1.8, color: 'var(--foreground)' }}>
                        Vi bruger kun strengt nødvendige cookies for at holde dig logget ind (via Supabase Auth) og huske dine sessioner. Vi bruger ikke tredjeparts-tracking cookies til reklamer.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>5. Kontakt</h2>
                    <p style={{ lineHeight: 1.8, color: 'var(--foreground)' }}>
                        Hvis du ønsker indsigt i de data vi har registreret om dig, eller ønsker dem slettet, kan du til enhver tid kontakte os på:
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

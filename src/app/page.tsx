"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project, UploadedFile, AnalysisReport } from './types';
import { Button } from './components/Button';
import { UploadZone } from './components/UploadZone';

// Initial projects can still be empty or mock
const INITIAL_PROJECTS: Project[] = [];

export default function Home() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stagedFiles, setStagedFiles] = useState<{ file: File; type: string }[]>([]);

  // Tabs: 'start' | 'guide' | 'pricing'
  const [activeTab, setActiveTab] = useState<'start' | 'guide' | 'pricing'>('start');
  const router = useRouter();

  const handleFilesSelected = (files: File[], forcedType?: string) => {
    // Add new files to staging
    const newStaged = files.map(f => ({
      file: f,
      type: forcedType || guessFileType(f.name)
    }));
    setStagedFiles(prev => [...prev, ...newStaged]);
  };

  const updateFileType = (index: number, newType: string) => {
    setStagedFiles(prev => prev.map((item, i) => i === index ? { ...item, type: newType } : item));
  };

  const removeStagedFile = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartAnalysis = async () => {
    if (stagedFiles.length === 0) return;

    setIsAnalyzing(true);
    setProgress(10);

    // Mock progress bar
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      // 1. Create a FormData object
      const formData = new FormData();
      stagedFiles.forEach(item => {
        formData.append('files', item.file);
      });

      // Pass metadata as a separate JSON field
      // We map by index order since formData 'files' are ordered
      const fileTypes = stagedFiles.map(item => item.type);
      formData.append('fileTypes', JSON.stringify(fileTypes));

      // Check for user session to associate project
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      if (session?.user) {
        formData.append('userId', session.user.id);
      }

      // 2. Call the API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Analysis failed');
      }

      const project: Project = await response.json();

      clearInterval(interval);
      setProgress(100);

      // Slight delay to show 100%
      setTimeout(() => {
        setIsAnalyzing(false);
        router.push(`/project/${project.id}`);
      }, 500);

    } catch (error) {
      console.error(error);
      clearInterval(interval);
      setIsAnalyzing(false);
      alert(`Fejl under analyse: ${error instanceof Error ? error.message : 'Ukendt fejl'}`);
    }
  };

  const handleOpenProject = (id: string) => {
    router.push(`/project/${id}`);
  };

  // Helper to guess type
  function guessFileType(filename: string): string {
    const lower = filename.toLowerCase();
    if (lower.includes('tilstand')) return 'Tilstandsrapport';
    if (lower.includes('el') && lower.includes('rapport')) return 'Elinstallationsrapport';
    if (lower.includes('energi')) return 'Energimærke';
    if (lower.includes('salg') || lower.includes('opstilling')) return 'Salgsopstilling';
    if (lower.includes('ejendomsdata')) return 'Ejendomsdatarapport';
    return 'Andet';
  }

  const DOCUMENT_TYPES = [
    'Salgsopstilling',
    'Tilstandsrapport',
    'Elinstallationsrapport',
    'Energimærke',
    'Ejendomsdatarapport',
    'Andet'
  ];

  const [inputType, setInputType] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');

  const handleUrlAnalysis = async () => {
    if (!urlInput) return;

    setIsAnalyzing(true);
    setProgress(10);

    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 90)); // Slower progress for URL fetch
    }, 500);

    try {
      // Check for user session
      let userId = null;
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      if (session?.user) {
        userId = session.user.id;
      }

      const response = await fetch('/api/analyze/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: urlInput,
          userId: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze URL');
      }

      const report: AnalysisReport = await response.json();

      // For URL analysis, we might assume a new project is created differently or we mock it here since the API returns a report directly?
      // Wait, the API returns a report, but the frontend expects to redirect to a project.
      // The current /api/analyze endpoint creates a project and returns it.
      // My new /api/analyze/url endpoint only returns the report.
      // I should update /api/analyze/url to also save the project like the main analyze route does.
      // OR, I can temporarily handle it by creating a project on the client side or just showing the report?
      // No, consistent behavior is better. I should update the API to save, but let's see what the main API does.
      // The main API returns a Project object.
      // Let's assume for now I'll just redirect to a result page with the report data passed? No, that's messy.
      // I must ensure /api/analyze/url returns a Project object.
      // I will fix the API endpoint in the next step. For now, let's just alert success or similar?
      // Actually, let's just finish the UI code first.

      // TEMPORARY FIX: Start analysis -> get report -> (Need to save it).
      // Let's assume the API *will* return a project.
      const project = report as unknown as Project; // Placeholder casting until API update

      // Actually, looking at the API code I wrote, it returns `report` which is `AnalysisReport`.
      // The `Project` type likely includes `id`.
      // If I want to redirect to `/project/:id`, I need an ID.
      // I should update the API to save the project to Supabase using the same logic as the file upload. 
      // Since I can't easily import the save logic (it might be in the route handler), I'll need to duplicate or refactor.

      // Let's mock the redirect for now or handle the response properly.
      // I'll leave the UI implementation here and then fix the API.

      clearInterval(interval);
      setProgress(100);

      // Force a client-side project creation or handle it.
      // For this step, I'll just error if no ID.
      if ((project as any).id) {
        setTimeout(() => {
          setIsAnalyzing(false);
          router.push(`/project/${(project as any).id}`);
        }, 500);
      } else {
        // Fallback if API hasn't been updated to save yet
        console.warn("API didn't return a project ID. Report:", report);
        setIsAnalyzing(false);
        alert("Analysen er færdig! (Men lagring fejlede - tjek konsol)");
      }

    } catch (error) {
      console.error(error);
      clearInterval(interval);
      setIsAnalyzing(false);
      alert(`Fejl under URL analyse: ${error instanceof Error ? error.message : 'Ukendt fejl'}`);
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '4rem 2rem',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: '4rem'
    }}>
      {/* Header */}
      <header style={{ textAlign: 'center' }}>
        <h1 className="text-gradient" style={{
          fontSize: '4rem',
          fontWeight: 800,
          letterSpacing: '-0.025em',
          marginBottom: '1.5rem',
          lineHeight: 1.1,
          backgroundImage: 'none',
          color: '#ffffff',
          WebkitTextFillColor: '#ffffff'
        }}>
          Boligtjekker AI
        </h1>
        <p style={{
          color: 'var(--secondary)',
          fontSize: '1.25rem',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          Upload salgsopstillinger, rapporter og dokumenter. Lad AI beregne de <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>skjulte omkostninger</span> ved din drømmebolig.
        </p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        {(['start', 'guide', 'pricing'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '999px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeTab === tab ? '1px solid var(--primary-gradient)' : '1px solid transparent',
              background: activeTab === tab ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab ? 'white' : 'var(--secondary)',
              transition: 'all 0.2s ease',
            }}
          >
            {tab === 'start' && 'Start Analyse'}
            {tab === 'guide' && 'Sådan virker det'}
            {tab === 'pricing' && 'Priser'}
          </button>
        ))}
      </div>

      <div style={{ minHeight: '400px' }}>
        {/* Main Action Area (Start Tab) */}
        {activeTab === 'start' && (
          <section style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', animation: 'fadeIn 0.3s ease' }}>
            {isAnalyzing ? (
              <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'bounce 1s infinite' }}>🤖</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Analyserer Dokumenter...</h3>
                <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>Vores AI gennemgår det med småt for at finde skjulte udgifter.</p>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-gradient)', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            ) : (
              <>
                {/* Input Type Toggle */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '1rem' }}>
                  <button
                    onClick={() => setInputType('file')}
                    style={{
                      padding: '0.5rem 1rem',
                      color: inputType === 'file' ? 'var(--foreground)' : 'var(--secondary)',
                      background: 'none',
                      border: 'none',
                      borderBottom: inputType === 'file' ? '2px solid white' : '2px solid transparent',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    📂 Upload Filer
                  </button>
                  <button
                    onClick={() => setInputType('url')}
                    style={{
                      padding: '0.5rem 1rem',
                      color: inputType === 'url' ? 'var(--foreground)' : 'var(--secondary)',
                      background: 'none',
                      border: 'none',
                      borderBottom: inputType === 'url' ? '2px solid white' : '2px solid transparent',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    🔗 Indsæt Link
                  </button>
                </div>

                {inputType === 'file' ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                      {/* Slot 1: Tilstandsrapport */}
                      <UploadZone
                        title="Tilstandsrapport"
                        description="Upload tilstandsrapporten her."
                        compact={true}
                        onFilesSelected={(files) => handleFilesSelected(files, 'Tilstandsrapport')}
                      />

                      {/* Slot 2: Elinstallationsrapport */}
                      <UploadZone
                        title="El-rapport"
                        description="Upload elinstallationsrapporten her."
                        compact={true}
                        onFilesSelected={(files) => handleFilesSelected(files, 'Elinstallationsrapport')}
                      />

                      {/* Slot 3: Salgsopstilling */}
                      <UploadZone
                        title="Salgsopstilling"
                        description="Upload salgsopstillingen her."
                        compact={true}
                        onFilesSelected={(files) => handleFilesSelected(files, 'Salgsopstilling')}
                      />

                      {/* Slot 4: Andet */}
                      <UploadZone
                        title="Øvrige Dokumenter"
                        description="Energimærke, billeder, plantegning osv."
                        compact={true}
                        onFilesSelected={(files) => handleFilesSelected(files, 'Andet')}
                      />
                    </div>

                    {stagedFiles.length > 0 && (
                      <div className="glass-card" style={{ padding: '2rem', animation: 'slideUp 0.3s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Valgte Filer ({stagedFiles.length})</h3>
                          <Button variant="secondary" size="sm" onClick={() => setStagedFiles([])}>Ryd alle</Button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                          {stagedFiles.map((item, index) => (
                            <div key={index} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              padding: '1rem',
                              backgroundColor: 'rgba(255,255,255,0.03)',
                              borderRadius: '0.5rem',
                              border: '1px solid var(--border)'
                            }}>
                              <div style={{ fontSize: '1.5rem' }}>
                                {item.type === 'Tilstandsrapport' ? '🏠' :
                                  item.type === 'Elinstallationsrapport' ? '⚡' :
                                    item.type === 'Salgsopstilling' ? '💰' : '📄'}
                              </div>
                              <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontWeight: 500 }}>{item.file.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                                  {(item.file.size / 1024 / 1024).toFixed(2)} MB • <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{item.type}</span>
                                </div>
                              </div>

                              <button
                                onClick={() => removeStagedFile(index)}
                                style={{
                                  padding: '0.5rem',
                                  color: '#ef4444',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '1.2rem'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                      <Button
                        onClick={handleStartAnalysis}
                        size="lg"
                        disabled={stagedFiles.length === 0}
                        style={{
                          fontSize: '1.25rem',
                          padding: '1rem 4rem',
                          opacity: stagedFiles.length === 0 ? 0.5 : 1,
                          cursor: stagedFiles.length === 0 ? 'not-allowed' : 'pointer',
                          boxShadow: '0 0 20px rgba(79, 70, 229, 0.4)'
                        }}
                      >
                        Start Analyse 🚀
                      </Button>
                      <p style={{ marginTop: '1rem', color: 'var(--secondary)', fontSize: '0.875rem' }}>
                        100% gratis i beta-perioden
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="glass-card" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 600 }}>Indsæt link til bolig</h3>
                    <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>
                      Kopier adressen fra Boliga eller Boligsiden, så henter vi automatisk oplysningerne.
                    </p>

                    <input
                      type="text"
                      placeholder="https://www.boliga.dk/bolig/..."
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '1rem 1.5rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        background: 'rgba(0,0,0,0.2)',
                        color: 'white',
                        fontSize: '1rem',
                        marginBottom: '2rem',
                        outline: 'none'
                      }}
                    />

                    <Button
                      onClick={handleUrlAnalysis}
                      size="lg"
                      disabled={!urlInput}
                      style={{
                        fontSize: '1.25rem',
                        padding: '1rem 4rem',
                        opacity: !urlInput ? 0.5 : 1,
                        cursor: !urlInput ? 'not-allowed' : 'pointer',
                        boxShadow: '0 0 20px rgba(79, 70, 229, 0.4)'
                      }}
                    >
                      Hent & Analyser 🚀
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* How it works Section (Guide Tab) */}
        {activeTab === 'guide' && (
          <section style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '2rem 0',
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '3rem', fontWeight: 700 }}>Sådan virker det</h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem'
            }}>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>1. Upload Dokumenter</h3>
                <p style={{ color: 'var(--secondary)' }}>
                  Upload tilstandsrapport, el-rapport eller salgsopstilling. Vi understøtter PDF og billeder.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>2. AI Analyse</h3>
                <p style={{ color: 'var(--secondary)' }}>
                  Vores intelligente AI gennemlæser hver side for at finde risici og skjulte omkostninger.
                </p>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💡</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>3. Få Overblik</h3>
                <p style={{ color: 'var(--secondary)' }}>
                  Modtag en letlæselig rapport med estimerede priser på udbedringer.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Pricing Section (Pricing Tab) */}
        {activeTab === 'pricing' && (
          <section style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '2rem 0',
            textAlign: 'center',
            marginBottom: '4rem',
            animation: 'fadeIn 0.3s ease'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 700 }}>Priser</h2>
            <p style={{ color: 'var(--secondary)', marginBottom: '3rem' }}>
              Gennemskuelige priser. Ingen binding.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {/* Free Tier */}
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'left', opacity: 0.8 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Basis</h3>
                <div style={{ fontSize: '2rem', fontWeight: 700, margin: '1rem 0' }}>0 kr.</div>
                <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  Perfekt til et hurtigt overblik.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li style={{ display: 'flex', gap: '0.5rem' }}><span>✅</span> Risikovurdering</li>
                  <li style={{ display: 'flex', gap: '0.5rem' }}><span>✅</span> 3 nøglepunkter</li>
                  <li style={{ display: 'flex', gap: '0.5rem' }}><span>❌</span> Ingen PDF rapport</li>
                </ul>
              </div>

              {/* Premium Tier (Beta Free) */}
              <div className="glass-card" style={{
                padding: '2rem',
                textAlign: 'left',
                position: 'relative',
                border: '2px solid var(--primary-gradient)', // Simulate gradient border differently if specific needed
                borderColor: '#4f46e5'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  background: 'var(--primary-gradient)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Mest Populær
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Premium</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '1rem 0' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 700 }}>0 kr.</span>
                  <span style={{ textDecoration: 'line-through', color: 'var(--secondary)' }}>249 kr.</span>
                </div>
                <p style={{ color: '#22c55e', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Gratis i Beta-perioden
                </p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li style={{ display: 'flex', gap: '0.5rem' }}><span>✅</span> Alt i Basis</li>
                  <li style={{ display: 'flex', gap: '0.5rem' }}><span>✅</span> Dybdegående analyse</li>
                  <li style={{ display: 'flex', gap: '0.5rem' }}><span>✅</span> Fuld PDF Rapport</li>
                  <li style={{ display: 'flex', gap: '0.5rem' }}><span>✅</span> Estimat på udbedringer</li>
                </ul>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        color: 'var(--secondary)',
        fontSize: '0.875rem',
        paddingTop: '2rem',
        borderTop: '1px solid var(--border)'
      }}>
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <a href="#" style={{ textDecoration: 'underline' }}>Om os</a>
          <a href="#" style={{ textDecoration: 'underline' }}>Privatlivspolitik</a>
          <a href="mailto:kontakt@boligtjekker.ai" style={{ textDecoration: 'underline' }}>Kontakt</a>
        </div>
        © {new Date().getFullYear()} Boligtjekker AI. Gør ejendomshandel gennemskueligt.
      </footer>
    </div>
  );
}

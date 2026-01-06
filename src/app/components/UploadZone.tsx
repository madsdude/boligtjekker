import React, { useState, useRef } from 'react';
import { Button } from './Button';

interface UploadZoneProps {
    onFilesSelected: (files: File[]) => void;
    title?: string;
    description?: string;
    compact?: boolean;
    accept?: string;
}

export const UploadZone = ({ onFilesSelected, title, description, compact = false, accept }: UploadZoneProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const badgeStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        color: 'var(--foreground)',
        fontWeight: 500,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: '0.5rem 1rem',
        borderRadius: '999px',
        border: '1px solid var(--border)'
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesSelected(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(Array.from(e.target.files));
        }
    };

    return (
        <div
            className="glass-card"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                border: '2px dashed transparent',
                backgroundImage: `linear-gradient(var(--surface-glass), var(--surface-glass)), var(--primary-gradient)`,
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                borderRadius: 'var(--radius)',
                padding: compact ? '2rem 1rem' : '4rem 2rem', // Smaller padding for compact
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isDragging ? 'var(--shadow-glow)' : 'var(--shadow-soft)',
                height: compact ? '100%' : 'auto', // Ensure full height in grid
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileInput}
                accept={accept || ".pdf,.doc,.docx,image/*"}
            />

            <div style={{
                marginBottom: compact ? '1rem' : '1.5rem',
                fontSize: compact ? '2.5rem' : '3.5rem',
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
            }}>
                {compact ? '📄' : '📂'}
            </div>

            <h3 className="text-gradient" style={{
                fontSize: compact ? '1.1rem' : '1.5rem',
                fontWeight: 700,
                marginBottom: '0.75rem',
                lineHeight: 1.2
            }}>
                {title || 'Træk og slip dine filer her'}
            </h3>

            <p style={{
                color: 'var(--secondary)',
                marginBottom: compact ? '1rem' : '2rem',
                maxWidth: '400px',
                fontSize: compact ? '0.875rem' : '1rem',
                lineHeight: 1.5
            }}>
                {description || 'Vi modtager PDF, DOCX og billeder. Upload Tilstandsrapport, El-rapport og Salgsopstilling for det bedste resultat.'}
            </p>

            {/* Trust Badges - Only show if NOT compact */}
            {!compact && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2rem',
                    flexWrap: 'wrap',
                    marginBottom: '2rem',
                    opacity: 0.9
                }}>
                    <div style={badgeStyle}>
                        <span style={{ fontSize: '1.2rem' }}>🔒</span>
                        <span>100% Krypteret</span>
                    </div>
                    <div style={badgeStyle}>
                        <span style={{ fontSize: '1.2rem' }}>🇪🇺</span>
                        <span>GDPR Compliant</span>
                    </div>
                    <div style={badgeStyle}>
                        <span style={{ fontSize: '1.2rem' }}>🗑️</span>
                        <span>Ingen gemt data</span>
                    </div>
                </div>
            )}

            {/* Disclaimer - Only show if NOT compact */}
            {!compact && (
                <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--secondary)',
                    marginBottom: '2rem',
                    maxWidth: '400px',
                    margin: '0 auto 2rem auto',
                    lineHeight: 1.5
                }}>
                    Vi sletter dine filer straks efter analysen er færdig.
                    <br />Ingen menneskelige øjne ser dine dokumenter.
                </p>
            )}

            <div style={{ display: 'inline-block' }}>
                <Button variant={compact ? "secondary" : "primary"} size={compact ? "sm" : "lg"} onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                }}>
                    {compact ? 'Vælg' : 'Vælg Filer'}
                </Button>
            </div>

            {/* Pricing Notice - Only show if NOT compact */}
            {!compact && (
                <p style={{
                    fontSize: '0.8rem',
                    color: '#22c55e', // Success green for positive reinforcement
                    marginTop: '1rem',
                    fontWeight: 500
                }}>
                    ✅ Ingen betaling påkrævet (Beta)
                </p>
            )}
        </div >
    );
};

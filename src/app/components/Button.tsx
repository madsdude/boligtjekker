import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    style,
    ...props
}: ButtonProps) => {

    const baseStyles: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius)',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background-color 0.2s, opacity 0.2s',
        border: '1px solid transparent',
        outline: 'none',
        fontFamily: 'var(--font-sans)',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
        primary: {
            backgroundColor: 'var(--primary)',
            color: '#fff',
            border: '1px solid var(--primary)',
        },
        secondary: {
            backgroundColor: 'var(--secondary)',
            color: '#fff',
            border: '1px solid var(--secondary)',
        },
        outline: {
            backgroundColor: 'transparent',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
        },
        ghost: {
            backgroundColor: 'transparent',
            color: 'var(--foreground)',
        },
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
        sm: { padding: '0.25rem 0.5rem', fontSize: '0.875rem' },
        md: { padding: '0.5rem 1rem', fontSize: '1rem' },
        lg: { padding: '0.75rem 1.5rem', fontSize: '1.125rem' },
    };

    // Hover/Active states would typically be handled with CSS classes/modules or CSS-in-JS libraries like styled-components.
    // Since we are using inline styles for a quick start without extra deps, we'll keep it simple.
    // For a real app, I'd suggest CSS Modules or Tailwind.

    return (
        <button
            style={{ ...baseStyles, ...variantStyles[variant], ...sizeStyles[size], ...style }}
            {...props}
        >
            {children}
        </button>
    );
};

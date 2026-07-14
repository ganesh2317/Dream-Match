import React from 'react';

/**
 * GlassCard component providing a consistent premium glassmorphic style.
 * 
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render inside the card
 * @param {string} [props.className] - Optional additional CSS class names
 * @param {React.CSSProperties} [props.style] - Optional inline style overrides
 */
const GlassCard = ({ children, className = '', style = {}, ...props }) => {
    return (
        <div
            className={`glass-panel ${className}`}
            style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                border: 'var(--glass-border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--glass-shadow)',
                color: 'var(--text-primary)',
                padding: '24px',
                transition: 'all var(--transition-normal)',
                ...style
            }}
            {...props}
        >
            {children}
        </div>
    );
};

export default GlassCard;

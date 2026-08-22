import React from 'react';

/**
 * @file GlassCard.jsx
 * GlassCard component providing a consistent premium glassmorphic style.
 *
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render inside the card
 * @param {string} [props.className] - Optional additional CSS class names
 * @param {React.CSSProperties} [props.style] - Optional inline style overrides
 * @param {'surface'|'float'|'overlay'|'whisper'} [props.level='float'] - Glass hierarchy level
 */
const GLASS_LEVELS = {
    surface: {
        background: 'var(--glass-surface-bg)',
        backdropFilter: 'var(--glass-surface-blur)',
        WebkitBackdropFilter: 'var(--glass-surface-blur)',
        border: 'var(--glass-surface-border)',
    },
    float: {
        background: 'var(--glass-float-bg)',
        backdropFilter: 'var(--glass-float-blur)',
        WebkitBackdropFilter: 'var(--glass-float-blur)',
        border: 'var(--glass-float-border)',
    },
    overlay: {
        background: 'var(--glass-overlay-bg)',
        backdropFilter: 'var(--glass-overlay-blur)',
        WebkitBackdropFilter: 'var(--glass-overlay-blur)',
        border: 'var(--glass-overlay-border)',
    },
    whisper: {
        background: 'var(--glass-whisper-bg)',
        backdropFilter: 'var(--glass-whisper-blur)',
        WebkitBackdropFilter: 'var(--glass-whisper-blur)',
        border: 'var(--glass-whisper-border)',
    },
};

const GlassCard = ({ children, className = '', style = {}, level = 'float', ...props }) => {
    const levelStyles = GLASS_LEVELS[level] || GLASS_LEVELS.float;
    return (
        <div
            className={`glass-panel ${className}`}
            style={{
                ...levelStyles,
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-high)',
                color: 'var(--text-primary)',
                padding: '24px',
                transition: 'box-shadow var(--transition-normal)',
                ...style
            }}
            {...props}
        >
            {children}
        </div>
    );
};

export default GlassCard;

import React from 'react';

const GlassCard = ({ children, className = '', style = {} }) => {
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
        >
            {children}
        </div>
    );
};

export default GlassCard;

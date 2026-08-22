import React, { useState } from 'react';

/**
 * Custom styled input component using the Dream Match design system.
 * Uses phosphor-blue focus ring and DM Sans font.
 */
const Input = ({ label, type = "text", placeholder, value, onChange, name, icon: Icon, style = {}, ...props }) => {
    const [focused, setFocused] = useState(false);

    return (
        <div style={{ marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {label && (
                <label style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    color: focused ? 'var(--phosphor)' : 'var(--text-secondary)',
                    marginLeft: '4px',
                    transition: 'color var(--transition-fast)',
                    letterSpacing: '0.02em'
                }}>
                    {label}
                </label>
            )}
            <div style={{ position: 'relative', width: '100%' }}>
                {Icon && (
                    <div style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: focused ? 'var(--phosphor)' : 'var(--fog)',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color var(--transition-fast)',
                        zIndex: 2,
                        pointerEvents: 'none'
                    }}>
                        <Icon size={17} />
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                        width: '100%',
                        fontFamily: 'var(--font-body)',
                        padding: '13px 16px',
                        paddingLeft: Icon ? '44px' : '16px',
                        borderRadius: 'var(--radius-md)',
                        border: focused ? '1px solid var(--phosphor)' : '1px solid var(--input-border)',
                        background: 'var(--input-bg)',
                        fontSize: 'var(--text-base)',
                        color: 'var(--text-primary)',
                        transition: 'all var(--transition-fast)',
                        boxShadow: focused ? 'var(--focus-ring)' : 'none',
                        outline: 'none',
                        ...style
                    }}
                    {...props}
                />
            </div>
        </div>
    );
};

export default Input;

import React, { useState } from 'react';

/**
 * Custom styled glassmorphic input component supporting leading icons and focus states.
 * 
 * @param {object} props - Component props
 * @param {string} [props.label] - Optional field label text
 * @param {string} [props.type='text'] - HTML input type string
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string|number} [props.value] - Controlled input value
 * @param {Function} [props.onChange] - Change event callback handler
 * @param {string} [props.name] - Input field name
 * @param {React.ElementType} [props.icon] - Lucide icon component reference
 * @param {React.CSSProperties} [props.style] - Style overrides
 */
const Input = ({ label, type = 'text', placeholder, value, onChange, name, icon: Icon, style = {}, ...props }) => {
    const [focused, setFocused] = useState(false);

    return (
        <div style={{ marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {label && (
                <label style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: focused ? 'var(--primary)' : 'var(--text-secondary)',
                    marginLeft: '4px',
                    transition: 'color var(--transition-fast)',
                    letterSpacing: '0.5px'
                }}>
                    {label}
                </label>
            )}
            <div style={{ position: 'relative', width: '100%' }}>
                {Icon && (
                    <div style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: focused ? 'var(--primary)' : 'var(--text-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color var(--transition-fast)',
                        zIndex: 2,
                        pointerEvents: 'none'
                    }}>
                        <Icon size={18} />
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
                        padding: '14px 16px',
                        paddingLeft: Icon ? '46px' : '16px',
                        borderRadius: 'var(--radius-md)',
                        border: focused ? '1px solid var(--primary)' : '1px solid var(--input-border)',
                        background: focused ? 'var(--card-subtle-bg)' : 'var(--input-bg)',
                        fontSize: '15px',
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

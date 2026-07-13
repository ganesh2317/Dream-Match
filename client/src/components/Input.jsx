import React, { useState } from 'react';

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
                    onFocus={(e) => {
                        setFocused(true);
                    }}
                    onBlur={(e) => {
                        setFocused(false);
                    }}
                    style={{
                        width: '100%',
                        padding: '14px 16px',
                        paddingLeft: Icon ? '46px' : '16px',
                        borderRadius: 'var(--radius-md)',
                        border: focused ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: focused ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.03)',
                        fontSize: '15px',
                        color: 'white',
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

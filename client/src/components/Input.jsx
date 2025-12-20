import React from 'react';

const Input = ({ label, type = 'text', placeholder, value, onChange, name, icon: Icon }) => {
    return (
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {label && (
                <label style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--ios-text-secondary)',
                    marginLeft: '4px'
                }}>
                    {label}
                </label>
            )}
            <div style={{ position: 'relative' }}>
                {Icon && (
                    <div style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--ios-gray)',
                        display: 'flex',
                        alignItems: 'center'
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
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        paddingLeft: Icon ? '40px' : '16px',
                        borderRadius: 'var(--border-radius-sm)',
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '16px',
                        color: 'var(--ios-text-primary)',
                        transition: 'background var(--transition-fast)',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    onFocus={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.8)'}
                    onBlur={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.5)'}
                />
            </div>
        </div>
    );
};

export default Input;

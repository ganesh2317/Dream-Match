import React from 'react';

const Input = ({ label, type = 'text', placeholder, value, onChange, name, icon: Icon, style = {} }) => {
    return (
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {label && (
                <label style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
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
                        color: 'rgba(255,255,255,0.5)',
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
                        borderRadius: '12px',
                        border: 'none',
                        background: 'rgba(0, 0, 0, 0.2)', // Default dark mode friendly background
                        fontSize: '16px',
                        color: 'white',
                        transition: 'all 0.2s',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                        ...style
                    }}
                    onFocus={(e) => {
                        e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                        e.target.style.boxShadow = '0 0 0 2px var(--primary)';
                    }}
                    onBlur={(e) => {
                        e.target.style.background = style.background || 'rgba(0, 0, 0, 0.2)';
                        e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.1)';
                    }}
                />
            </div>
        </div>
    );
};

export default Input;

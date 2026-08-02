import React from 'react';
import GlassCard from './GlassCard';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Sparkles, Trophy } from 'lucide-react';

/**
 * ProfileCompletionCard displays a smooth progress bar and interactive checklist
 * for tracking user profile completion percentage.
 * 
 * @param {Object} props
 * @param {Object} props.completion - Profile completion object { percentage, completed, remaining }
 */
const ProfileCompletionCard = ({ completion }) => {
    // Standard criteria mapping with display names matching required UI
    const allCriteria = [
        { id: 'Profile Picture', label: 'Profile Picture' },
        { id: 'Bio', label: 'Bio' },
        { id: 'Age', label: 'Age' },
        { id: 'Gender', label: 'Gender' },
        { id: 'First Dream', label: 'Post your first Dream' },
        { id: 'Follow Someone', label: 'Follow your first user' }
    ];

    // Compute status if completion prop passed or calculate dynamically
    const completedSet = new Set(completion?.completed || []);

    // Dynamic percentage calculation fallback if completion is undefined
    let percentage = completion?.percentage ?? 0;

    return (
        <GlassCard 
            style={{ 
                padding: '24px', 
                marginBottom: '24px', 
                borderRadius: 'var(--radius-xl)', 
                border: 'var(--glass-border)',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '12px',
                        background: percentage === 100 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: percentage === 100 ? 'var(--success)' : 'var(--primary)'
                    }}>
                        {percentage === 100 ? <Trophy size={20} /> : <Sparkles size={20} />}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                            Profile Completion
                        </h3>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                            {percentage === 100 
                                ? 'Your profile is 100% complete! Full Dream Match unlocked.'
                                : 'Complete your profile to unlock the full Dream Match experience.'}
                        </p>
                    </div>
                </div>

                {/* Percentage Badge */}
                <div style={{ 
                    fontSize: '22px', 
                    fontWeight: 900, 
                    color: percentage === 100 ? 'var(--success)' : 'var(--primary)',
                    background: percentage === 100 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                    padding: '6px 16px',
                    borderRadius: '100px',
                    border: percentage === 100 ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid rgba(99, 102, 241, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    {percentage}%
                </div>
            </div>

            {/* Smooth Animated Progress Bar */}
            <div style={{
                width: '100%',
                height: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '100px',
                overflow: 'hidden',
                marginBottom: '20px',
                position: 'relative'
            }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                        height: '100%',
                        borderRadius: '100px',
                        background: percentage === 100 
                            ? 'linear-gradient(90deg, #10b981 0%, #22c55e 100%)' 
                            : 'linear-gradient(90deg, var(--primary) 0%, #a855f7 100%)',
                        boxShadow: percentage === 100 
                            ? '0 0 12px rgba(34, 197, 94, 0.5)' 
                            : '0 0 12px var(--primary-glow)'
                    }}
                />
            </div>

            {/* Criteria Checklist Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px 20px'
            }}>
                {allCriteria.map((item) => {
                    const isDone = completedSet.has(item.id);
                    return (
                        <div 
                            key={item.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '13.5px',
                                fontWeight: isDone ? 600 : 500,
                                color: isDone ? 'var(--text-primary)' : 'var(--text-muted)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {isDone ? (
                                <CheckCircle2 
                                    size={18} 
                                    color="var(--success)" 
                                    style={{ flexShrink: 0 }}
                                />
                            ) : (
                                <Circle 
                                    size={18} 
                                    color="var(--text-dim)" 
                                    style={{ flexShrink: 0, opacity: 0.5 }}
                                />
                            )}
                            <span style={{ 
                                textDecoration: isDone ? 'none' : 'none',
                                opacity: isDone ? 1 : 0.75 
                            }}>
                                {isDone ? `✓ ${item.label}` : `○ ${item.label}`}
                            </span>
                        </div>
                    );
                })}
            </div>
        </GlassCard>
    );
};

export default ProfileCompletionCard;

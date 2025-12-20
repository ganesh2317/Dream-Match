import React from 'react';
import GlassCard from './GlassCard';
import { Flame } from 'lucide-react';

const Feed = ({ dreams, loading }) => {
    return (
        <>
            <h2 style={{ marginBottom: '24px' }}>Timeline</h2>

            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)' }}>
                    Loading dreams...
                </div>
            ) : dreams.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
                    No dreams logged yet.<br />Tap <b>Post Dream</b> to start your streak!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
                    {dreams.map((dream) => (
                        <GlassCard key={dream.id} style={{ transition: 'transform 0.2s' }} className="feed-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <img src={dream.userAvatar} style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{dream.username}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(dream.createdAt).toLocaleDateString()}</div>
                                </div>
                                {/* Show streak badge if user has one */}
                                {dream.userStreak > 0 && (
                                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#ffa502', background: 'rgba(255, 165, 0, 0.15)', padding: '6px 12px', borderRadius: '100px', border: '1px solid rgba(255, 165, 0, 0.2)' }}>
                                        <Flame size={14} fill="#ffa502" /> {dream.userStreak}
                                    </div>
                                )}
                            </div>

                            <div style={{ height: '400px', borderRadius: '16px', marginBottom: '20px', overflow: 'hidden', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <img src={dream.imageUrl} alt="dream" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 500, lineHeight: '1.5', color: 'rgba(255,255,255,0.9)' }}>{dream.description}</h3>
                        </GlassCard>
                    ))}
                </div>
            )}
        </>
    );
};

export default Feed;

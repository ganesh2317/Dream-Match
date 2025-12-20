import React from 'react';
import GlassCard from './GlassCard';
import { Bell } from 'lucide-react';

const Notifications = () => {
    // Currently hardcoded to empty as per request to show the empty state
    // In future this can take props
    const notifications = [];

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px' }}>Notifications</h2>

            {notifications.length === 0 ? (
                <GlassCard style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-secondary)' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px auto'
                    }}>
                        <Bell size={40} opacity={0.5} />
                    </div>
                    <h3 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>No notifications yet</h3>
                    <p>But soon you will find a match!</p>
                </GlassCard>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Placeholder for future notifications */}
                </div>
            )}
        </div>
    );
};

export default Notifications;

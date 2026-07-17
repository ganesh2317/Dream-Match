import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Sparkles, 
    Film, 
    MessageSquare, 
    Heart, 
    Bell, 
    BarChart2, 
    AlertOctagon, 
    Settings, 
    ShieldAlert, 
    ShieldCheck, 
    Trash2, 
    Ban, 
    Eye, 
    EyeOff, 
    Star, 
    Download, 
    RotateCcw, 
    ArrowLeft,
    Moon, 
    Sun, 
    Search,
    RefreshCw
} from 'lucide-react';
import { AdminLineChart, AdminBarChart } from '../components/AdminChart';

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users Management', icon: Users },
    { id: 'dreams', label: 'Dreams Moderation', icon: Sparkles },
    { id: 'visuals', label: 'Visuals Control', icon: Film },
    { id: 'messages', label: 'Messages Analytics', icon: MessageSquare },
    { id: 'matches', label: 'Match Analytics', icon: Heart },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'analytics', label: 'Audience Analytics', icon: BarChart2 },
    { id: 'errors', label: 'Error Monitor', icon: AlertOctagon },
    { id: 'settings', label: 'System Settings', icon: Settings }
];

/**
 * Admin Panel Dashboard component.
 * Exposes system telemetry, user/content moderation controls,
 * analytics tables, system settings, and centralized error logs
 * restricted to authorized administrators.
 */
const Admin = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [loading, setLoading] = useState(false);
    
    // State storage for different sections
    const [stats, setStats] = useState(null);
    const [usersData, setUsersData] = useState({ users: [], total: 0 });
    const [dreamsData, setDreamsData] = useState({ dreams: [], total: 0 });
    const [visualsData, setVisualsData] = useState({ visuals: [], total: 0 });
    const [msgStats, setMsgStats] = useState(null);
    const [matchStats, setMatchStats] = useState(null);
    const [notifStats, setNotifStats] = useState(null);
    const [advAnalytics, setAdvAnalytics] = useState(null);
    const [errorLogs, setErrorLogs] = useState([]);
    const [systemSettings, setSystemSettings] = useState(null);

    // Filter/Pagination parameters
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    
    const token = localStorage.getItem('token');

    // Fetch handlers
    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (e) {
            console.error('Error loading dashboard stats:', e);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`/api/admin/users?search=${searchQuery}&page=${page}&limit=8`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsersData(data);
            }
        } catch (e) {
            console.error('Error loading users:', e);
        }
    };

    const fetchDreams = async () => {
        try {
            const res = await fetch(`/api/admin/dreams?search=${searchQuery}&page=${page}&limit=8`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDreamsData(data);
            }
        } catch (e) {
            console.error('Error loading dreams:', e);
        }
    };

    const fetchVisuals = async () => {
        try {
            const res = await fetch(`/api/admin/visuals?page=${page}&limit=8`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setVisualsData(data);
            }
        } catch (e) {
            console.error('Error loading visuals:', e);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const [msgRes, matchRes, notifRes, advRes] = await Promise.all([
                fetch('/api/admin/messages', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/matches', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/notifications', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (msgRes.ok) setMsgStats(await msgRes.json());
            if (matchRes.ok) setMatchStats(await matchRes.json());
            if (notifRes.ok) setNotifStats(await notifRes.json());
            if (advRes.ok) setAdvAnalytics(await advRes.json());
        } catch (e) {
            console.error('Error loading analytics:', e);
        }
    };

    const fetchErrors = async () => {
        try {
            const res = await fetch('/api/admin/errors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setErrorLogs(data);
            }
        } catch (e) {
            console.error('Error loading error logs:', e);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSystemSettings(data);
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    };

    // Load active tab data
    const refreshData = async () => {
        setLoading(true);
        if (activeTab === 'dashboard') await fetchStats();
        if (activeTab === 'users') await fetchUsers();
        if (activeTab === 'dreams') await fetchDreams();
        if (activeTab === 'visuals') await fetchVisuals();
        if (activeTab === 'messages' || activeTab === 'matches' || activeTab === 'notifications' || activeTab === 'analytics') {
            await fetchAnalytics();
        }
        if (activeTab === 'errors') await fetchErrors();
        if (activeTab === 'settings') await fetchSettings();
        setLoading(false);
    };

    useEffect(() => {
        setPage(1);
        setSearchQuery('');
    }, [activeTab]);

    useEffect(() => {
        refreshData();
    }, [activeTab, page, searchQuery]);

    // Admin Operations API Callers
    const handleUserAction = async (userId, actionType) => {
        let endpoint = `/api/admin/users/${userId}/status`;
        let body = { status: actionType };

        if (actionType === 'DELETE') {
            if (!confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) return;
            endpoint = `/api/admin/users/${userId}`;
        }

        try {
            const res = await fetch(endpoint, {
                method: actionType === 'DELETE' ? 'DELETE' : 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: actionType !== 'DELETE' ? JSON.stringify(body) : undefined
            });

            if (res.ok) {
                alert(`Successfully processed action: ${actionType}`);
                refreshData();
            } else {
                const err = await res.json();
                alert(`Error: ${err.message}`);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDreamAction = async (dreamId, actionType, value) => {
        let endpoint = `/api/admin/dreams/${dreamId}`;
        let method = 'PUT';
        let body = {};

        if (actionType === 'FEATURE') {
            body.isFeatured = value;
        } else if (actionType === 'HIDE') {
            body.status = value ? 'HIDDEN' : 'VISIBLE';
        } else if (actionType === 'DELETE') {
            if (!confirm('Delete this dream from the database?')) return;
            method = 'DELETE';
        }

        try {
            const res = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: method !== 'DELETE' ? JSON.stringify(body) : undefined
            });

            if (res.ok) {
                refreshData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleVisualAction = async (dreamId, actionType) => {
        let endpoint = `/api/admin/visuals/${dreamId}`;
        let method = 'DELETE';

        if (actionType === 'RETRY') {
            endpoint = `/api/admin/visuals/${dreamId}/retry`;
            method = 'POST';
        }

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                alert(actionType === 'RETRY' ? 'Generation task queued' : 'Visual configuration deleted');
                refreshData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSettingChange = async (key, value) => {
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ key, value })
            });
            if (res.ok) {
                fetchSettings();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleClearErrors = async () => {
        if (!confirm('Clear all recorded system log files?')) return;
        try {
            const res = await fetch('/api/admin/errors', {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchErrors();
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Card styling utility for glassmorphism layout
    const glassStyle = {
        background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        border: isDarkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '24px',
        color: isDarkMode ? '#f8fafc' : '#0f172a',
        boxShadow: isDarkMode ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.03)',
        transition: 'all 0.3s ease'
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: isDarkMode ? '#030303' : '#f8fafc',
            color: isDarkMode ? '#f1f5f9' : '#1e293b',
            fontFamily: 'Outfit, Inter, sans-serif',
            transition: 'background 0.3s ease'
        }}>
            
            {/* Admin Left Sidebar */}
            <aside style={{
                width: '280px',
                borderRight: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                padding: '20px',
                gap: '16px',
                background: isDarkMode ? 'rgba(5,5,8,0.3)' : 'rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', marginBottom: '16px' }}>
                    <div style={{
                        padding: '10px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        borderRadius: '12px',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
                    }}>
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px' }}>DREAM MATCH</h1>
                        <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 800 }}>SYSTEM ADMIN</span>
                    </div>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: active ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)' : 'transparent',
                                    color: active ? '#c084fc' : (isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'),
                                    fontWeight: active ? '700' : '500',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '14px',
                                    transition: '0.2s',
                                    boxShadow: active ? (isDarkMode ? 'inset 0 1px 0 rgba(255,255,255,0.1)' : 'none') : 'none'
                                }}
                            >
                                <Icon size={18} color={active ? '#c084fc' : undefined} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'rgba(255,255,255,0.05)',
                            color: isDarkMode ? '#fff' : '#000',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <ArrowLeft size={16} /> Exit to Main Site
                    </button>
                    
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'transparent',
                            color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                        {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
                    </button>
                </div>
            </aside>

            {/* Work Content View Container */}
            <main style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* Header Panel */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '28px', fontWeight: 800 }}>{TABS.find(t => t.id === activeTab)?.label}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Real-time telemetry and management controls.</p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={refreshData}
                            style={{
                                padding: '10px 18px',
                                borderRadius: '10px',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: isDarkMode ? 'white' : 'black',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync Data
                        </button>
                    </div>
                </header>

                {/* Skeletons Loading View */}
                {loading && !stats && !usersData.users.length && !dreamsData.dreams.length && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
                        <div style={{ height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
                    </div>
                )}

                {/* Tab content rendering */}
                {!loading && activeTab === 'dashboard' && stats && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {/* Stats Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                            {[
                                { title: 'Total Users', val: stats.totals.totalUsers, desc: 'Registered accounts' },
                                { title: 'Active Status Users', val: stats.totals.activeUsers, desc: 'Accounts flag active' },
                                { title: 'New Users (7d)', val: stats.totals.newUsers, desc: 'Weekly growth' },
                                { title: 'Dreams Shared', val: stats.totals.totalDreams, desc: 'Visions logged' },
                                { title: 'Visual Videos', val: stats.totals.totalVisuals, desc: 'Completed MP4 builds' },
                                { title: 'Messages Count', val: stats.totals.totalMessages, desc: 'Chat message logs' },
                                { title: 'Match Pair Records', val: stats.totals.totalMatches, desc: 'Compatibility index' }
                            ].map((s, idx) => (
                                <div key={idx} style={glassStyle}>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{s.title}</div>
                                    <div style={{ fontSize: '32px', fontWeight: 800, margin: '12px 0 6px 0', color: 'var(--primary)' }}>{s.val}</div>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{s.desc}</div>
                                </div>
                            ))}
                        </div>

                        {/* Trend charts */}
                        <div style={glassStyle}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>Activity Growth Trends (7 Days)</h3>
                            <AdminLineChart 
                                data={stats.trends} 
                                dataKeys={['users', 'dreams', 'messages']} 
                                colors={['#6366f1', '#10b981', '#f59e0b']}
                                labels={['Users', 'Dreams', 'Messages']}
                            />
                        </div>
                    </div>
                )}

                {/* Users Management */}
                {activeTab === 'users' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search style={{ position: 'absolute', left: '14px', top: '13px', color: 'rgba(255,255,255,0.3)' }} size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by username, full name, or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 42px',
                                        borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={glassStyle}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 800 }}>
                                        <th style={{ padding: '12px' }}>USER</th>
                                        <th style={{ padding: '12px' }}>EMAIL</th>
                                        <th style={{ padding: '12px' }}>ROLE</th>
                                        <th style={{ padding: '12px' }}>STATUS</th>
                                        <th style={{ padding: '12px' }}>STREAK</th>
                                        <th style={{ padding: '12px' }}>JOINED</th>
                                        <th style={{ padding: '12px' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersData.users.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                                            <td style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.fullName}`} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }} />
                                                <div>
                                                    <div style={{ fontWeight: 700 }}>{u.fullName}</div>
                                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>@{u.username}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px' }}>{u.email || '-'}</td>
                                            <td style={{ padding: '12px' }}><span style={{ padding: '4px 8px', borderRadius: '8px', fontSize: '11px', background: u.role === 'ADMIN' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)', color: u.role === 'ADMIN' ? '#c084fc' : 'white', fontWeight: 700 }}>{u.role}</span></td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '8px',
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    background: u.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : (u.status === 'SUSPENDED' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
                                                    color: u.status === 'ACTIVE' ? '#10b981' : (u.status === 'SUSPENDED' ? '#f59e0b' : '#ef4444')
                                                }}>{u.status}</span>
                                            </td>
                                            <td style={{ padding: '12px' }}>🔥 {u.streakCount}</td>
                                            <td style={{ padding: '12px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {u.status === 'ACTIVE' ? (
                                                        <>
                                                            <button onClick={() => handleUserAction(u.id, 'SUSPENDED')} title="Suspend User" style={{ padding: '6px', background: 'rgba(245, 158, 11, 0.15)', border: 'none', borderRadius: '6px', color: '#f59e0b', cursor: 'pointer' }}><ShieldAlert size={14} /></button>
                                                            <button onClick={() => handleUserAction(u.id, 'BANNED')} title="Ban User" style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.15)', border: 'none', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}><Ban size={14} /></button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => handleUserAction(u.id, 'ACTIVE')} title="Activate User" style={{ padding: '6px', background: 'rgba(16, 185, 129, 0.15)', border: 'none', borderRadius: '6px', color: '#10b981', cursor: 'pointer' }}><ShieldCheck size={14} /></button>
                                                    )}
                                                    <button onClick={() => handleUserAction(u.id, 'DELETE')} title="Delete User" style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.15)', border: 'none', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {/* Pagination controls */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Total records: {usersData.total}</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>Prev</button>
                                    <button disabled={page * 8 >= usersData.total} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dreams Moderation */}
                {activeTab === 'dreams' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <Search style={{ position: 'absolute', left: '14px', top: '13px', color: 'rgba(255,255,255,0.3)' }} size={18} />
                            <input
                                type="text"
                                placeholder="Search dreams by description, theme, or author..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 42px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={glassStyle}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 800 }}>
                                        <th style={{ padding: '12px' }}>AUTHOR</th>
                                        <th style={{ padding: '12px' }}>VISION DESCRIPTION</th>
                                        <th style={{ padding: '12px' }}>THEME</th>
                                        <th style={{ padding: '12px' }}>STATUS</th>
                                        <th style={{ padding: '12px' }}>FEATURED</th>
                                        <th style={{ padding: '12px' }}>INTERACTIONS</th>
                                        <th style={{ padding: '12px' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dreamsData.dreams.map(d => (
                                        <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                                            <td style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <img src={d.user?.avatarUrl} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                                                <span style={{ fontWeight: 700 }}>@{d.user?.username}</span>
                                            </td>
                                            <td style={{ padding: '12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.description}</td>
                                            <td style={{ padding: '12px' }}>🏷️ {d.theme || 'None'}</td>
                                            <td style={{ padding: '12px' }}><span style={{ padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, background: d.status === 'VISIBLE' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: d.status === 'VISIBLE' ? '#10b981' : '#ef4444' }}>{d.status}</span></td>
                                            <td style={{ padding: '12px' }}>{d.isFeatured ? '⭐ Yes' : 'No'}</td>
                                            <td style={{ padding: '12px' }}>❤️ {d._count?.likes} | 💬 {d._count?.comments}</td>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => handleDreamAction(d.id, 'HIDE', d.status === 'VISIBLE')} style={{ padding: '6px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>
                                                        {d.status === 'VISIBLE' ? <EyeOff size={14} /> : <Eye size={14} />}
                                                    </button>
                                                    <button onClick={() => handleDreamAction(d.id, 'FEATURE', !d.isFeatured)} style={{ padding: '6px', background: 'rgba(250,204,21,0.15)', border: 'none', borderRadius: '6px', color: '#facc15', cursor: 'pointer' }}>
                                                        <Star size={14} fill={d.isFeatured ? '#facc15' : 'none'} />
                                                    </button>
                                                    <button onClick={() => handleDreamAction(d.id, 'DELETE')} style={{ padding: '6px', background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Total records: {dreamsData.total}</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>Prev</button>
                                    <button disabled={page * 8 >= dreamsData.total} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Visuals Control */}
                {activeTab === 'visuals' && (
                    <div style={glassStyle}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 800 }}>
                                    <th style={{ padding: '12px' }}>AUTHOR</th>
                                    <th style={{ padding: '12px' }}>MEDIA SOURCE</th>
                                    <th style={{ padding: '12px' }}>STATUS</th>
                                    <th style={{ padding: '12px' }}>PROVIDER</th>
                                    <th style={{ padding: '12px' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visualsData.visuals.map(v => (
                                    <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                                        <td style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <img src={v.user?.avatarUrl} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                                            <span style={{ fontWeight: 700 }}>@{v.user?.username}</span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {v.videoUrl ? (
                                                <a href={v.videoUrl} target="_blank" rel="noreferrer" style={{ color: '#6366f1', textDecoration: 'underline' }}>{v.videoUrl.substring(0, 45)}...</a>
                                            ) : (
                                                <span style={{ color: 'rgba(255,255,255,0.2)' }}>None</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '8px',
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                background: v.videoStatus === 'COMPLETED' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                                color: v.videoStatus === 'COMPLETED' ? '#10b981' : '#f59e0b'
                                            }}>{v.videoStatus || 'NONE'}</span>
                                        </td>
                                        <td style={{ padding: '12px' }}>🎬 {v.videoProvider || '-'}</td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => handleVisualAction(v.id, 'RETRY')} title="Retry Generation" style={{ padding: '6px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}><RotateCcw size={14} /></button>
                                                {v.videoUrl && (
                                                    <a href={v.videoUrl} download title="Download MP4" style={{ padding: '6px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Download size={14} /></a>
                                                )}
                                                <button onClick={() => handleVisualAction(v.id, 'DELETE')} title="Delete Visual" style={{ padding: '6px', background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Messages Analytics */}
                {activeTab === 'messages' && msgStats && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={glassStyle}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>Summary Metrics</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>ACTIVE CONVERSATIONS</div>
                                    <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px' }}>{msgStats.conversationCount}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>TOTAL MESSAGES ROUTED</div>
                                    <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px' }}>{msgStats.totalMessages}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>CHAT-ACTIVE USERS</div>
                                    <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px' }}>{msgStats.activeChatUsers}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Match Analytics */}
                {activeTab === 'matches' && matchStats && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={glassStyle}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Compatibility Breakdown</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>TOTAL COMPATIBLE MATCHES</div>
                                    <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px' }}>{matchStats.totalMatches}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>AVERAGE COMPATIBILITY SCORE</div>
                                    <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', color: '#10b981' }}>{(matchStats.avgCompatibilityScore * 100).toFixed(1)}%</div>
                                </div>
                            </div>
                        </div>

                        <div style={glassStyle}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Match Status Distributions</h3>
                            <AdminBarChart 
                                data={[
                                    { name: 'Pending', count: matchStats.pending },
                                    { name: 'Accepted', count: matchStats.accepted },
                                    { name: 'Rejected', count: matchStats.rejected }
                                ]}
                                color="#8b5cf6"
                            />
                        </div>
                    </div>
                )}

                {/* Notifications */}
                {activeTab === 'notifications' && notifStats && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={glassStyle}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Notification Channels</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>TOTAL SENT</div>
                                    <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px' }}>{notifStats.total}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>READ METRIC</div>
                                    <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px' }}>{notifStats.read}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>UNREAD METRIC</div>
                                    <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px' }}>{notifStats.unread}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Audience Analytics */}
                {activeTab === 'analytics' && advAnalytics && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            <div style={glassStyle}>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>DAILY ACTIVE USERS</div>
                                <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '10px' }}>{advAnalytics.activity.dailyUsers}</div>
                            </div>
                            <div style={glassStyle}>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>WEEKLY ACTIVE USERS</div>
                                <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '10px' }}>{advAnalytics.activity.weeklyUsers}</div>
                            </div>
                            <div style={glassStyle}>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>MONTHLY ACTIVE USERS</div>
                                <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '10px' }}>{advAnalytics.activity.monthlyUsers}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={glassStyle}>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Geographics Breakdown</h3>
                                <AdminBarChart data={advAnalytics.countries} color="#10b981" labelKey="name" valueKey="count" />
                            </div>

                            <div style={glassStyle}>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Device Analytics</h3>
                                <AdminBarChart data={advAnalytics.devices} color="#f59e0b" labelKey="name" valueKey="count" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Monitor */}
                {activeTab === 'errors' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleClearErrors}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: '10px',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: 'none',
                                    color: '#ef4444',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Clear Error History
                            </button>
                        </div>

                        <div style={glassStyle}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 800 }}>
                                        <th style={{ padding: '12px' }}>TYPE</th>
                                        <th style={{ padding: '12px' }}>ERROR MESSAGE</th>
                                        <th style={{ padding: '12px' }}>ENDPOINT</th>
                                        <th style={{ padding: '12px' }}>DATE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {errorLogs.map(log => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
                                            <td style={{ padding: '12px' }}><span style={{ padding: '3px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>{log.type}</span></td>
                                            <td style={{ padding: '12px', maxWidth: '350px', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px' }}>
                                                <div style={{ fontWeight: 700, color: '#ef4444' }}>{log.message}</div>
                                                {log.stack && (
                                                    <details style={{ marginTop: '8px', opacity: 0.7 }}>
                                                        <summary style={{ cursor: 'pointer', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Show stack trace</summary>
                                                        <pre style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '6px', marginTop: '6px', fontSize: '10px' }}>{log.stack}</pre>
                                                    </details>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px', fontFamily: 'monospace', color: '#c084fc' }}>{log.endpoint || '-'}</td>
                                            <td style={{ padding: '12px' }}>{new Date(log.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {errorLogs.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '40px', textAlignment: 'center', color: 'rgba(255,255,255,0.3)' }}>No backend error logs captured yet. System health looks excellent!</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* System Settings */}
                {activeTab === 'settings' && systemSettings && (
                    <div style={glassStyle}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Global Settings Controls</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>Maintenance Mode</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Blocks non-admin access and displays offline system screen.</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={systemSettings.maintenanceMode || false}
                                    onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>Allow Registration Flow</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Allows new users to create accounts on signup.</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={systemSettings.allowRegistrations || false}
                                    onChange={(e) => handleSettingChange('allowRegistrations', e.target.checked)}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>AI Image Generation Model</label>
                                <select
                                    value={systemSettings.aiImageProvider || 'pollinations'}
                                    onChange={(e) => handleSettingChange('aiImageProvider', e.target.value)}
                                    style={{
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white',
                                        outline: 'none',
                                        width: '240px'
                                    }}
                                >
                                    <option value="pollinations">Pollinations (Default)</option>
                                    <option value="openai">OpenAI DALL-E 3</option>
                                    <option value="flux">FLUX.1 Schnell</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>AI Video Generation Engine</label>
                                <select
                                    value={systemSettings.aiVideoProvider || 'luma'}
                                    onChange={(e) => handleSettingChange('aiVideoProvider', e.target.value)}
                                    style={{
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white',
                                        outline: 'none',
                                        width: '240px'
                                    }}
                                >
                                    <option value="luma">Luma Dream Machine (Local Ken Burns)</option>
                                    <option value="runway">Runway Gen-3 Alpha</option>
                                    <option value="sora">OpenAI Sora API</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Admin;

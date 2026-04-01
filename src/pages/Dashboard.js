import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { Users, FileText, TrendingUp, Clock, ArrowUpRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusConfig = {
    Active: { bg: '#E3F6E8', text: '#156D2E', dot: '#25B14C' },
    Draft: { bg: '#F4F9FB', text: '#30779E', dot: '#1e516e' },
    Pending: { bg: '#FFFCE0', text: '#8B7501', dot: '#FED206' },
    Expired: { bg: '#FCE4F2', text: '#890650', dot: '#E50A86' },
};

const MetricCard = ({ label, value, sub, icon: Icon, trend, color = '#36BEF6' }) => (
    <div style={{
        background: `linear-gradient(180deg, ${color}14 0%, #fff 40%)`,
        border: `1px solid ${color}33`,
        borderTop: `3px solid ${color}`,
        borderRadius: 16,
        padding: '32px 32px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        transition: 'transform 0.2s, box-shadow 0.2s',
    }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 24px ${color}1A`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: `${color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color
            }}>
                <Icon size={20} strokeWidth={2} />
            </div>
            {trend && (
                <span style={{ fontSize: 12, fontWeight: 600, color: '#25B14C', background: '#E3F6E8', padding: '4px 10px', borderRadius: 20 }}>
                    {trend}
                </span>
            )}
        </div>
        <div>
            <p style={{ fontSize: 13, color: '#1e516e', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 8px' }}>{label}</p>
            <p style={{ fontSize: 32, fontWeight: 700, color: '#1E516E', letterSpacing: '-0.02em', margin: 0, lineHeight: 1 }}>{value}</p>
        </div>
        {sub && <p style={{ fontSize: 13, color: '#1e516e', margin: 0 }}>{sub}</p>}
    </div>
);

const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] || statusConfig.Draft;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: cfg.bg, color: cfg.text,
            fontSize: 11, fontWeight: 600, padding: '3px 10px',
            borderRadius: 20, letterSpacing: '0.02em'
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
            {status}
        </span>
    );
};

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalClients: 0, activeClients: 0,
        totalContracts: 0, activeContracts: 0,
        totalRevenue: 0, recentContracts: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardService.getStats()
            .then(r => setStats(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#1e516e', gap: 12, fontWeight: 500 }}>
            <div style={{ width: 20, height: 20, border: '2px solid #CFE3EE', borderTopColor: '#1E516E', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Loading dashboard...
        </div>
    );

    return (
        <div style={{ padding: '40px 48px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1E516E', letterSpacing: '-0.02em', margin: 0 }}>Overview</h1>
                <p style={{ fontSize: 13, color: '#1e516e', marginTop: 4 }}>
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 48 }}>
                <MetricCard label="Total Clients" value={stats.totalClients} sub={`${stats.activeClients} active`} icon={Users} trend="↑ +3 this month" color="#36BEF6" />
                <MetricCard label="Contracts" value={stats.totalContracts} sub={`${stats.activeContracts} active`} icon={FileText} color="#FED206" />
                <MetricCard label="Monthly Revenue" value={`₹${((stats.totalRevenue || 0) / 100000).toFixed(1)}L`} sub="Current MRR" icon={TrendingUp} trend="↑ MRR" color="#25B14C" />
                <MetricCard label="Renewals Due" value="0" sub="Next 30 days" icon={Clock} color="#E50A86" />
            </div>

            {/* Main content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
                {/* Recent Contracts */}
                <div style={{ background: '#fff', border: '1px solid #E8F2F8', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #F4F9FB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1E516E', margin: 0 }}>Recent Contracts</h2>
                            <p style={{ fontSize: 12, color: '#1e516e', marginTop: 2 }}>Latest activity across all accounts</p>
                        </div>
                        <Link to="/contracts" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#1e516e', textDecoration: 'none' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#1E516E'}
                            onMouseLeave={e => e.currentTarget.style.color = '#1e516e'}>
                            View all <ChevronRight size={14} />
                        </Link>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#1E516E' }}>
                                {['Client', 'Period', 'Status', 'Value'].map(h => (
                                    <th key={h} style={{ padding: '10px 24px', textAlign: h === 'Value' ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: '#1e516e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentContracts?.length > 0 ? stats.recentContracts.map((c, i) => (
                                <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #F4F9FB' : 'none' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#F7FAFB'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '14px 24px', fontSize: 13, fontWeight: 600, color: '#1E516E' }}>{c.client?.name}</td>
                                    <td style={{ padding: '14px 24px', fontSize: 12, color: '#1e516e' }}>
                                        {c.startDate && new Date(c.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '14px 24px' }}><StatusBadge status={c.status} /></td>
                                    <td style={{ padding: '14px 24px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: '#1E516E' }}>₹{c.totalValue?.toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} style={{ padding: '48px 24px', textAlign: 'center', fontSize: 13, color: '#1E516E' }}>No recent contracts</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Quick Actions */}
                    <div style={{ background: '#fff', border: '1px solid #E8F2F8', borderRadius: 16, padding: '24px 24px 20px' }}>
                        <h2 style={{ fontSize: 13, fontWeight: 700, color: '#1E516E', margin: '0 0 16px' }}>Quick actions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { label: 'New contract', path: '/contracts', emoji: '📄' },
                                { label: 'Onboard client', path: '/clients', emoji: '🤝' },
                                { label: 'Track deliverables', path: '/deliverables', emoji: '📋' },
                            ].map(a => (
                                <Link key={a.path} to={a.path} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
                                    color: '#1A5D8B', fontSize: 13, fontWeight: 500,
                                    transition: 'background 0.15s',
                                    background: 'transparent'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#F4F9FB'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <span style={{ fontSize: 16 }}>{a.emoji}</span>
                                    <span style={{ flex: 1 }}>{a.label}</span>
                                    <ArrowUpRight size={13} style={{ color: '#1E516E' }} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Completion Rate */}
                    <div style={{ background: '#1E516E', borderRadius: 16, padding: '24px' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#30779E', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>Completion Rate</p>
                        <p style={{ fontSize: 36, fontWeight: 700, color: '#F4F9FB', letterSpacing: '-0.03em', margin: '0 0 20px' }}>67%</p>
                        <div style={{ background: '#114A72', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                            <div style={{ width: '67%', height: '100%', background: '#36BEF6', borderRadius: 4 }} />
                        </div>
                        <p style={{ fontSize: 11, color: '#30779E', margin: '10px 0 0' }}>Deliverables this month</p>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Dashboard;
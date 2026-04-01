import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, FileText, ClipboardCheck, LogOut } from 'lucide-react';

const menuGroups = [
    {
        // title: 'Main',
        items: [
            { name: 'Dashboard', path: '/', icon: LayoutDashboard },
            { name: 'Clients', path: '/clients', icon: Users },
            { name: 'Services', path: '/services', icon: Briefcase },
            { name: 'Contracts', path: '/contracts', icon: FileText },
            { name: 'Deliverables', path: '/deliverables', icon: ClipboardCheck },
            { name: 'Deliv. Dashboard', path: '/deliverables-dashboard', icon: LayoutDashboard },
        ]
    },
    {
        // title: 'Operations',
        items: [
            
        ]
    }
];

const Layout = ({ children, user, onLogout }) => {
    const location = useLocation();

    const initials = user?.employee_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AU';

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#F4F9FB', fontFamily: "'Outfit', sans-serif" }}>
            {/* Sidebar */}
            <div style={{
                width: 250, background: '#fff', borderRight: '1px solid #E8F2F8',
                display: 'flex', flexDirection: 'column', flexShrink: 0
            }}>
                {/* Logo */}
                <div style={{ padding: '24px 20px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{
                            width: 30, height: 30, background: 'conic-gradient(#36BEF6, #25B14C, #FED206, #E50A86, #712A84, #36BEF6)', borderRadius: 8,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(54, 190, 246, 0.4)'
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#1E516E', letterSpacing: '-0.03em' }}>ContractOS</span>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
                    {menuGroups.map(group => (
                        <div key={group.title} style={{ marginBottom: 28 }}>
                            <p style={{
                                fontSize: 9, fontWeight: 800, color: '#1E516E',
                                letterSpacing: '0.1em', textTransform: 'uppercase',
                                padding: '0 8px', marginBottom: 6
                            }}>{group.title}</p>
                            {group.items.map(item => {
                                const active = location.pathname === item.path;
                                const Icon = item.icon;
                                return (
                                    <Link key={item.name} to={item.path} style={{
                                        display: 'flex', alignItems: 'center', gap: 9,
                                        padding: '10px 10px', marginBottom: 2,
                                        textDecoration: 'none', transition: 'all 0.15s',
                                        background: 'transparent',
                                        // borderBottom: '1px solid #E8F2F8',
                                        borderLeft: active ? '3px solid #25B14C' : '3px solid transparent',
                                        color: active ? '#1E516E' : '#1e516e',
                                    }}
                                        onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#1E516E'; } }}
                                        onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#1e516e'; } }}>
                                        <Icon size={15} strokeWidth={active ? 2.5 : 1.8} />
                                        <span style={{ fontSize: 16, fontWeight: active ? 700 : 500 }}>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* User */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid #F4F9FB' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 30, height: 30, borderRadius: '50%', background: '#E8F2F8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, color: '#1e516e', flexShrink: 0
                        }}>{initials}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#1E516E', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.employee_name || 'Admin User'}
                            </p>
                        </div>
                        <button onClick={onLogout} title="Logout" style={{
                            background: 'none', border: 'none', padding: '4px', cursor: 'pointer',
                            color: '#1E516E', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#E50A86'; e.currentTarget.style.background = '#FCE4F2'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#1E516E'; e.currentTarget.style.background = 'none'; }}>
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main */}
            <main style={{ flex: 1, overflowY: 'auto', background: '#F4F9FB' }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
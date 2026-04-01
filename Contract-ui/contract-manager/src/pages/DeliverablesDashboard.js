import React, { useState, useEffect } from 'react';
import { deliverableService, contractService } from '../services/api';
import { CheckCircle, Clock, AlertCircle, Calendar, ChevronDown, Search, Layers } from 'lucide-react';

const T = {
    navy: '#1E516E',
    navyDark: '#17405A',
    blue: '#1e516e',
    blueLight: '#1e516e',
    bluePale: '#1E516E',
    edge: '#CFE3EE',
    fog: '#E8F2F8',
    mist: '#F4F9FB',
    white: '#FFFFFF',
    green: '#25B14C',
    yellow: '#D49E00',
    pink: '#C4116A',
};

const StatusPill = ({ status, overdue }) => {
    const resolved = overdue ? 'Overdue' : status;
    const map = {
        Completed: { color: T.green, icon: CheckCircle },
        Pending:   { color: T.yellow, icon: Clock },
        Overdue:   { color: T.pink, icon: AlertCircle },
    };
    const cfg = map[resolved] || map.Pending;
    const Icon = cfg.icon;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 99,
            border: `1px solid ${cfg.color}33`,
            background: `${cfg.color}0f`,
            color: cfg.color,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
        }}>
            <Icon size={11} strokeWidth={2.5} />
            {resolved}
        </span>
    );
};

const StatCard = ({ label, value, Icon, accent }) => (
    <div style={{
        background: T.white,
        border: `1px solid ${T.fog}`,
        borderRadius: 12,
        padding: '20px 22px',
        display: 'flex', alignItems: 'center', gap: 16,
    }}>
        <div style={{
            width: 38, height: 38, borderRadius: 9,
            background: T.mist,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accent || T.blue, flexShrink: 0,
        }}>
            <Icon size={17} strokeWidth={2} />
        </div>
        <div>
            <p style={{ fontSize: 22, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: T.bluePale, margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
        </div>
    </div>
);

const CompletionStrip = ({ pct, completed, total, overdue }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 12, color: T.bluePale, whiteSpace: 'nowrap' }}>
            {completed} / {total} completed
        </span>
        <div style={{ flex: 1, height: 3, borderRadius: 99, background: T.fog, overflow: 'hidden' }}>
            <div style={{
                width: `${pct}%`, height: '100%', borderRadius: 99,
                background: T.navy,
                transition: 'width 0.8s cubic-bezier(.16,1,.3,1)',
            }} />
        </div>
        <span style={{ fontSize: 12, color: T.bluePale, whiteSpace: 'nowrap' }}>{pct}%</span>
        {overdue > 0 && (
            <span style={{ fontSize: 12, fontWeight: 600, color: T.pink, whiteSpace: 'nowrap' }}>
                · {overdue} overdue
            </span>
        )}
    </div>
);

const SelectControl = ({ icon: Icon, value, onChange, children, minWidth = 140 }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: T.white, border: `1px solid ${T.fog}`,
        borderRadius: 9, padding: '7px 11px',
        minWidth, position: 'relative',
    }}>
        {Icon && <Icon size={13} color={T.bluePale} />}
        <select value={value} onChange={onChange} style={{
            border: 'none', background: 'transparent', outline: 'none',
            fontSize: 13, fontWeight: 600, color: T.navy,
            cursor: 'pointer', fontFamily: 'inherit', flex: 1,
            appearance: 'none', paddingRight: 16,
        }}>
            {children}
        </select>
        <ChevronDown size={11} color={T.bluePale} style={{ position: 'absolute', right: 9, pointerEvents: 'none' }} />
    </div>
);

const DeliverablesDashboard = () => {
    const [deliverables, setDeliverables] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedContractId, setSelectedContractId] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [mounted, setMounted] = useState(false);

    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const currentYear = new Date().getFullYear();
    const YEARS = [currentYear - 1, currentYear, currentYear + 1];

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => { fetchData(); }, [month, year]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [delivRes, contractRes] = await Promise.all([
                deliverableService.getFiltered(month, year),
                contractService.getAll(),
            ]);
            setDeliverables(delivRes.data);
            setContracts(contractRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isOverdue = (d) => d.status !== 'Completed' && new Date(d.dueDate) < new Date();

    const total = deliverables.length;
    const completed = deliverables.filter(d => d.status === 'Completed').length;
    const overdue = deliverables.filter(d => isOverdue(d)).length;
    const pending = total - completed - overdue;
    const pctDone = total ? Math.round((completed / total) * 100) : 0;

    const filtered = deliverables.filter(d => {
        const contractMatch = !selectedContractId || d.contract?.id === parseInt(selectedContractId);
        const statusMatch =
            statusFilter === 'All' ||
            (statusFilter === 'Completed' && d.status === 'Completed') ||
            (statusFilter === 'Overdue' && isOverdue(d)) ||
            (statusFilter === 'Pending' && d.status !== 'Completed' && !isOverdue(d));
        const searchMatch = !search ||
            d.contract?.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
            d.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
            d.subService?.name?.toLowerCase().includes(search.toLowerCase());
        return contractMatch && statusMatch && searchMatch;
    });

    const grouped = {};
    filtered.forEach(d => {
        const cKey = `c-${d.contract?.id}`;
        if (!grouped[cKey]) grouped[cKey] = { label: d.contract?.client?.name, contractId: d.contract?.id, services: {} };
        const sKey = d.subService ? `ss-${d.subService.id}` : `s-${d.service?.id}`;
        if (!grouped[cKey].services[sKey]) {
            grouped[cKey].services[sKey] = {
                name: d.subService ? d.subService.name : d.service?.name,
                isSub: !!d.subService,
                items: [],
            };
        }
        grouped[cKey].services[sKey].items.push(d);
    });

    return (
        <div style={{
            padding: '36px 44px',
            fontFamily: "'Outfit', sans-serif",
            minHeight: '100%',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.35s ease',
        }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 800, color: T.navy, letterSpacing: '-0.02em', margin: 0 }}>
                        Deliverables
                    </h1>
                    <p style={{ fontSize: 12, color: T.blueLight, marginTop: 3, margin: '3px 0 0' }}>
                        {MONTHS[month - 1]} {year}
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SelectControl icon={Calendar} value={month} onChange={e => setMonth(parseInt(e.target.value))} minWidth={128}>
                        {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </SelectControl>
                    <SelectControl value={year} onChange={e => setYear(parseInt(e.target.value))} minWidth={84}>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </SelectControl>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
                <StatCard label="Total"     value={total}     Icon={Layers}       />
                <StatCard label="Completed" value={completed} Icon={CheckCircle}  accent={T.green}  />
                <StatCard label="Pending"   value={pending}   Icon={Clock}        accent={T.yellow} />
                <StatCard label="Overdue"   value={overdue}   Icon={AlertCircle}  accent={T.pink}   />
            </div>

            {/* Completion strip */}
            <CompletionStrip pct={pctDone} completed={completed} total={total} overdue={overdue} />

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
                    <Search size={12} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.bluePale }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search client, service…"
                        style={{
                            width: '100%', padding: '8px 11px 8px 30px',
                            border: `1px solid ${T.fog}`, borderRadius: 9,
                            background: T.white, fontSize: 13, color: T.navy,
                            outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                        }}
                    />
                </div>

                <SelectControl value={selectedContractId} onChange={e => setSelectedContractId(e.target.value)} minWidth={170}>
                    <option value="">All contracts</option>
                    {contracts.map(c => <option key={c.id} value={c.id}>{c.client?.name} #{c.id}</option>)}
                </SelectControl>

                <div style={{ display: 'flex', gap: 4 }}>
                    {['All', 'Pending', 'Completed', 'Overdue'].map(s => {
                        const active = statusFilter === s;
                        return (
                            <button key={s} onClick={() => setStatusFilter(s)} style={{
                                padding: '6px 13px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                                border: `1px solid ${active ? T.navy : T.fog}`,
                                background: active ? T.navy : T.white,
                                color: active ? T.white : T.blueLight,
                                cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit',
                            }}>
                                {s}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Table */}
            <div style={{
                background: T.white,
                border: `1px solid ${T.fog}`,
                borderRadius: 12,
                overflow: 'hidden',
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: T.mist, borderBottom: `1px solid ${T.fog}` }}>
                            {['Client & Contract', 'Service / Sub-service', 'Period', 'Due Date', 'Status'].map(h => (
                                <th key={h} style={{
                                    padding: '10px 18px',
                                    textAlign: 'left',
                                    fontSize: 10, fontWeight: 700, color: T.bluePale,
                                    letterSpacing: '0.08em', textTransform: 'uppercase',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '56px 20px', textAlign: 'center', color: T.bluePale, fontSize: 13 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                        <div style={{ width: 14, height: 14, border: `2px solid ${T.fog}`, borderTopColor: T.navy, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                                        Loading…
                                    </div>
                                </td>
                            </tr>
                        ) : Object.keys(grouped).length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '56px 20px', textAlign: 'center', color: T.bluePale, fontSize: 13 }}>
                                    No deliverables found for this period
                                </td>
                            </tr>
                        ) : (
                            Object.values(grouped).map((contract, ci) => (
                                <React.Fragment key={ci}>
                                    {/* Contract group header */}
                                    <tr>
                                        <td colSpan={5} style={{
                                            padding: '9px 18px',
                                            background: T.mist,
                                            borderTop: ci > 0 ? `2px solid ${T.fog}` : 'none',
                                            borderBottom: `1px solid ${T.fog}`,
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>
                                                    {contract.label}
                                                </span>
                                                <span style={{
                                                    fontSize: 10, fontWeight: 600, color: T.bluePale,
                                                    fontFamily: 'monospace',
                                                }}>
                                                    #{contract.contractId?.toString().padStart(4, '0')}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>

                                    {Object.values(contract.services).map((svc, si) => (
                                        <React.Fragment key={si}>
                                            {svc.items
                                                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                                                .map((d, di) => {
                                                    const overdueBool = isOverdue(d);
                                                    return (
                                                        <tr key={d.id}
                                                            style={{ borderTop: `1px solid ${T.fog}`, transition: 'background .1s' }}
                                                            onMouseEnter={e => e.currentTarget.style.background = T.mist}
                                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                        >
                                                            <td style={{ padding: '12px 18px', verticalAlign: 'middle' }}>
                                                                {si === 0 && di === 0 ? (
                                                                    <div>
                                                                        <p style={{ fontSize: 13, fontWeight: 700, color: T.navy, margin: 0 }}>
                                                                            {d.contract?.client?.name}
                                                                        </p>
                                                                        <p style={{ fontSize: 11, color: T.blueLight, margin: '2px 0 0', fontFamily: 'monospace' }}>
                                                                            #{d.contract?.id}
                                                                        </p>
                                                                    </div>
                                                                ) : null}
                                                            </td>

                                                            <td style={{ padding: '12px 18px', verticalAlign: 'middle' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                    {svc.isSub && (
                                                                        <span style={{ width: 8, height: 1, background: T.edge, display: 'inline-block', flexShrink: 0 }} />
                                                                    )}
                                                                    <div>
                                                                        <p style={{ fontSize: 13, fontWeight: 600, color: T.navy, margin: 0 }}>{svc.name}</p>
                                                                        {svc.isSub && (
                                                                            <span style={{
                                                                                display: 'inline-block', marginTop: 2,
                                                                                fontSize: 10, fontWeight: 600, color: T.blueLight,
                                                                            }}>
                                                                                sub-service
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td style={{ padding: '12px 18px', fontSize: 12, color: T.blueLight, fontWeight: 500, verticalAlign: 'middle' }}>
                                                                {new Date(d.year, d.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
                                                            </td>

                                                            <td style={{ padding: '12px 18px', verticalAlign: 'middle' }}>
                                                                <span style={{
                                                                    fontSize: 12, fontWeight: overdueBool ? 700 : 400,
                                                                    color: overdueBool ? T.pink : T.blueLight,
                                                                    fontVariantNumeric: 'tabular-nums',
                                                                }}>
                                                                    {new Date(d.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </span>
                                                            </td>

                                                            <td style={{ padding: '12px 18px', verticalAlign: 'middle' }}>
                                                                <StatusPill status={d.status} overdue={overdueBool} />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>

                {!loading && filtered.length > 0 && (
                    <div style={{
                        padding: '11px 18px', borderTop: `1px solid ${T.fog}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: T.mist,
                    }}>
                        <p style={{ fontSize: 12, color: T.blueLight, margin: 0 }}>
                            Showing <strong style={{ color: T.navy }}>{filtered.length}</strong> of {total}
                        </p>
                        <div style={{ display: 'flex', gap: 14 }}>
                            {[
                                { label: 'Done', n: completed, color: T.green },
                                { label: 'Pending', n: pending, color: T.yellow },
                                { label: 'Overdue', n: overdue, color: T.pink },
                            ].map(s => (
                                <span key={s.label} style={{ fontSize: 12, color: T.blueLight, display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                                    <strong style={{ color: s.color }}>{s.n}</strong>&nbsp;{s.label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default DeliverablesDashboard;

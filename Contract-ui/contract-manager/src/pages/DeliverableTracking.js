import React, { useState, useEffect } from 'react';
import { contractService, deliverableService } from '../services/api';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

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

const DeliverableTracking = () => {
    const [contracts, setContracts] = useState([]);
    const [selectedContract, setSelectedContract] = useState(null);
    const [deliverables, setDeliverables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        try {
            const response = await contractService.getAll();
            const data = Array.isArray(response.data) ? response.data : [];
            setContracts(data);
            if (data.length > 0) {
                handleContractSelect(data[0]);
            }
        } catch (error) {
            console.error('Error fetching contracts:', error);
        }
    };

    const handleContractSelect = async (contract) => {
        setSelectedContract(contract);
        setLoading(true);
        try {
            const response = await deliverableService.getByContract(contract.id);
            setDeliverables(Array.isArray(response.data) ? response.data : []);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching deliverables:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (deliverable) => {
        const newStatus = deliverable.status === 'Completed' ? 'Pending' : 'Completed';
        try {
            await deliverableService.updateStatus(deliverable.id, newStatus);
            handleContractSelect(selectedContract);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const isOverdue = (d) => d.status !== 'Completed' && d.dueDate && new Date(d.dueDate) < new Date();

    const renderStatusIcon = (d) => {
        const status = d.status;
        const overdue = isOverdue(d);
        if (status === 'Completed') return <CheckCircle color={T.green} size={16} />;
        if (overdue) return <AlertCircle color={T.pink} size={16} />;
        return <Clock color={T.yellow} size={16} />;
    };

    const monthOptions = [
        'ALL',
        ...Array.from(new Set(
            (deliverables || []).map(d => `${d.year}-${String(d.month).padStart(2, '0')}`)
        ))
    ];

    const filteredDeliverables = selectedMonth === 'ALL'
        ? (deliverables || [])
        : (deliverables || []).filter(d =>
            `${d.year}-${String(d.month).padStart(2, '0')}` === selectedMonth
        );

    const groupedData = filteredDeliverables.reduce((acc, d) => {
        const serviceId = d.service?.id;
        if (!acc[serviceId]) {
            acc[serviceId] = {
                serviceName: d.service?.name,
                subServices: {},
                serviceItems: [],
            };
        }
        if (d.subService) {
            const subId = d.subService.id;
            if (!acc[serviceId].subServices[subId]) {
                acc[serviceId].subServices[subId] = {
                    name: d.subService.name,
                    items: []
                };
            }
            acc[serviceId].subServices[subId].items.push(d);
        } else {
            acc[serviceId].serviceItems.push(d);
        }
        return acc;
    }, {});

    const tableRows = [];
    Object.values(groupedData).forEach((service, idx) => {
        const hasSubServices = Object.keys(service.subServices).length > 0;
        const allSubDone = Object.values(service.subServices)
            .flatMap(ss => ss.items)
            .every(i => i.status === 'Completed');

        tableRows.push({ type: 'header', key: `header-${idx}`, service, hasSubServices, allSubDone });

        if (hasSubServices) {
            Object.values(service.subServices).forEach(ss => {
                ss.items.forEach(d => {
                    tableRows.push({ type: 'data', key: `data-${d.id}`, item: d, label: ss.name, isSub: true, serviceName: service.serviceName });
                });
            });
        } else {
            service.serviceItems.forEach(d => {
                tableRows.push({ type: 'data', key: `data-${d.id}`, item: d, label: service.serviceName, isSub: false, serviceName: service.serviceName });
            });
        }
    });

    const totalPages = Math.ceil(tableRows.length / itemsPerPage) || 1;
    const paginatedRows = tableRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div style={{ padding: '36px 48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: T.navy, letterSpacing: '-0.02em', margin: 0 }}>
                        Deliverable Tracking
                    </h1>
                    <p style={{ fontSize: 13, color: T.blue, marginTop: 4 }}>
                        Monitor and manage contract obligations
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <select
                        style={{ padding: '8px 12px', borderRadius: 10, border: `1px solid ${T.edge}`, fontSize: 13, fontWeight: 600, color: T.navy, outline: 'none' }}
                        onChange={(e) => handleContractSelect(contracts.find(c => c.id === parseInt(e.target.value)))}
                        value={selectedContract?.id || ''}
                    >
                        {contracts.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.client?.name} - Contract #{c.id}
                            </option>
                        ))}
                    </select>

                    <select
                        style={{ padding: '8px 12px', borderRadius: 10, border: `1px solid ${T.edge}`, fontSize: 13, fontWeight: 600, color: T.navy, outline: 'none' }}
                        value={selectedMonth}
                        onChange={(e) => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
                    >
                        {monthOptions.map(m => (
                            <option key={m} value={m}>
                                {m === 'ALL'
                                    ? 'All Months'
                                    : new Date(m + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '64px', color: T.navy, fontSize: 14, fontWeight: 500 }}>
                    <div style={{ width: 24, height: 24, border: `2px solid ${T.fog}`, borderTopColor: T.navy, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                    Loading deliverables...
                </div>
            ) : (
                <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.fog}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(26, 93, 139, 0.04)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: T.mist, borderBottom: `1px solid ${T.fog}` }}>
                                    {['Deliverable', 'Month/Year', 'Due Date', 'Status', 'Action'].map(h => (
                                        <th key={h} style={{ padding: '12px 20px', textAlign: h === 'Status' || h === 'Action' ? 'center' : 'left', fontSize: 11, fontWeight: 700, color: '#1e516e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedRows.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '48px', textAlign: 'center', color: T.blue, fontSize: 13 }}>No deliverables found.</td>
                                    </tr>
                                ) : paginatedRows.map(row => {
                                    if (row.type === 'header') {
                                        return (
                                            <tr key={row.key} style={{ background: T.mist }}>
                                                <td colSpan="5" style={{ padding: '10px 20px', fontWeight: 700, color: T.navy, fontSize: 13 }}>
                                                    {row.service.serviceName}
                                                    {row.hasSubServices && (
                                                        <span style={{
                                                            marginLeft: 12, padding: '2px 8px', borderRadius: 4, fontSize: 10,
                                                            background: row.allSubDone ? '#E3F6E8' : '#FFFCE0',
                                                            color: row.allSubDone ? '#156D2E' : '#8B7501'
                                                        }}>
                                                            {row.allSubDone ? 'Completed' : 'Pending'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    }

                                    const d = row.item;
                                    const overdue = isOverdue(d);
                                    const statusText = overdue ? 'Overdue' : d.status;
                                    const statusColor = d.status === 'Completed' ? T.green : overdue ? T.pink : T.yellow;

                                    return (
                                        <tr key={row.key} style={{ borderBottom: `1px solid ${T.fog}`, transition: 'background 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = T.mist}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '14px 20px', paddingLeft: row.isSub ? 36 : 20, fontSize: 13, color: T.navy, fontWeight: 600 }}>{row.label}</td>
                                            <td style={{ padding: '14px 20px', fontSize: 13, color: T.blue }}>
                                                {new Date(d.year, d.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '14px 20px', fontSize: 13, color: T.blue }}>
                                                {new Date(d.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '14px 20px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: statusColor }}>
                                                    {renderStatusIcon(d)}
                                                    {statusText}
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => toggleStatus(d)}
                                                    style={{
                                                        padding: '4px 12px', borderRadius: 8, border: 'none',
                                                        background: d.status === 'Completed' ? T.mist : '#E3F6E8',
                                                        color: d.status === 'Completed' ? T.navy : '#156D2E',
                                                        fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {d.status === 'Completed' ? 'Mark Pending' : 'Mark Done'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.mist }}>
                        <span style={{ fontSize: 12, color: T.blue }}>
                            Showing <strong>{tableRows.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, tableRows.length)}</strong> of <strong>{tableRows.length}</strong> Deliverables
                        </span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${T.edge}`, background: T.white, color: T.navy, fontSize: 12, fontWeight: 600, cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                            >
                                Previous
                            </button>
                            <span style={{ fontSize: 12, fontWeight: 600, color: T.navy }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${T.edge}`, background: T.white, color: T.navy, fontSize: 12, fontWeight: 600, cursor: currentPage === totalPages ? 'default' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default DeliverableTracking;
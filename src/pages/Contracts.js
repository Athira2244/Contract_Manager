import React, { useState, useEffect } from 'react';
import { contractService, clientService, serviceService } from '../services/api';
import { Plus, Trash2, X } from 'lucide-react';

const inputStyle = {
    width: '100%', padding: '9px 14px', borderRadius: 10,
    border: '1px solid #CFE3EE', background: '#fff',
    fontSize: 13, color: '#1E516E', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
};

const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: '#1e516e', letterSpacing: '0.06em',
    textTransform: 'uppercase', marginBottom: 6,
};

const statusStyle = (status) => {
    const map = {
        Active: { bg: '#E3F6E8', text: '#156D2E', dot: '#25B14C' },
        Draft: { bg: '#F4F9FB', text: '#1e516e', dot: '#1e516e' },
        Pending: { bg: '#FFFCE0', text: '#8B7501', dot: '#FED206' },
    };
    return map[status] || map.Draft;
};

const Contracts = () => {
    const [contracts, setContracts] = useState([]);
    const [clients, setClients] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isViewOnly, setIsViewOnly] = useState(false);

    const [formData, setFormData] = useState({
        client: '', startDate: '', endDate: '', status: 'Draft',
        paymentTerms: 'Net 30', billingFrequency: 'Monthly', contractServices: []
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [c, cl, s] = await Promise.all([contractService.getAll(), clientService.getAll(), serviceService.getAll()]);
            setContracts(c.data); setClients(cl.data); setServices(s.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const calculateMonths = (start, end) => {
        if (!start || !end) return 1;
        const s = new Date(start), e = new Date(end);
        const m = (e.getFullYear() - s.getFullYear()) * 12 - s.getMonth() + e.getMonth();
        return m <= 0 ? 1 : m + 1;
    };

    const handleServiceChange = (index, field, value) => {
        const updated = [...formData.contractServices];
        if (field === 'serviceId') {
            const sel = services.find(s => s.id === parseInt(value));
            updated[index] = { ...updated[index], serviceId: value, optedSubServiceIds: sel?.subServices?.map(ss => ss.id) || [], unitPrice: sel?.basePrice || 0 };
        } else if (field === 'optedSubServiceIds') {
            const sel = services.find(s => s.id === parseInt(updated[index].serviceId));
            updated[index] = { ...updated[index], optedSubServiceIds: value, unitPrice: sel?.subServices?.filter(ss => value.includes(ss.id)).reduce((s, ss) => s + ss.price, 0) || 0 };
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        setFormData({ ...formData, contractServices: updated });
    };

    const addServiceRow = () => setFormData({
        ...formData,
        contractServices: [...formData.contractServices, { serviceId: '', unitPrice: 0, employeeCount: 1, totalAmount: 0, optedSubServiceIds: [] }]
    });

    const removeServiceRow = (i) => setFormData({ ...formData, contractServices: formData.contractServices.filter((_, idx) => idx !== i) });

    const handleEdit = (contract) => {
        setFormData({
            id: contract.id, client: contract.client.id,
            startDate: contract.startDate, endDate: contract.endDate,
            status: contract.status, paymentTerms: contract.paymentTerms || 'Net 30',
            billingFrequency: contract.billingFrequency || 'Monthly',
            contractServices: contract.contractServices.map(cs => ({
                id: cs.id, serviceId: cs.service.id, unitPrice: cs.unitPrice,
                employeeCount: cs.employeeCount, totalAmount: cs.totalAmount,
                optedSubServiceIds: cs.optedSubServices?.map(ss => ss.id) || []
            }))
        });
        setIsViewOnly(false); setShowModal(true);
    };

    const handleView = (contract) => { handleEdit(contract); setIsViewOnly(true); };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this contract?')) return;
        try { await contractService.delete(id); fetchData(); }
        catch (e) { alert('Failed to delete.'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const months = calculateMonths(formData.startDate, formData.endDate);
        const payload = {
            ...formData,
            client: { id: parseInt(formData.client) },
            contractServices: formData.contractServices.map(cs => {
                const sel = services.find(s => s.id === parseInt(cs.serviceId));
                const isMonthly = sel?.pricingType === 'Monthly';
                const base = parseFloat(cs.unitPrice || 0);
                return {
                    id: cs.id, service: { id: parseInt(cs.serviceId) },
                    unitPrice: parseFloat(cs.unitPrice), employeeCount: parseInt(cs.employeeCount),
                    totalAmount: isMonthly ? base * months : base,
                    frequency: sel?.pricingType || 'Fixed',
                    optedSubServices: cs.optedSubServiceIds.map(id => ({ id }))
                };
            })
        };
        try {
            if (formData.id) await contractService.update(formData.id, payload);
            else await contractService.create(payload);
            setShowModal(false); fetchData();
            setFormData({ client: '', startDate: '', endDate: '', status: 'Draft', paymentTerms: 'Net 30', billingFrequency: 'Monthly', contractServices: [] });
        } catch (e) { console.error(e); alert('Failed to save.'); }
    };

    const totalValue = formData.contractServices.reduce((acc, cs) => {
        const sel = services.find(s => s.id === parseInt(cs.serviceId));
        const isMonthly = sel?.pricingType === 'Monthly';
        const months = calculateMonths(formData.startDate, formData.endDate);
        return acc + ((cs.unitPrice || 0) * (isMonthly ? months : 1));
    }, 0);

    return (
        <div style={{ padding: '40px 48px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1E516E', letterSpacing: '-0.02em', margin: 0 }}>Contracts</h1>
                    <p style={{ fontSize: 13, color: '#1e516e', marginTop: 4 }}>Active agreements, billing schedules and compliance</p>
                </div>
                <button onClick={() => {
                    setFormData({ client: '', startDate: '', endDate: '', status: 'Draft', paymentTerms: 'Net 30', billingFrequency: 'Monthly', contractServices: [] });
                    setIsViewOnly(false); setShowModal(true);
                }} style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px',
                    background: '#25B14C', color: '#fff', border: 'none', borderRadius: 10,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 177, 76, 0.3)', transition: 'all 0.2s'
                }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 177, 76, 0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 177, 76, 0.3)'; }}>
                    <Plus size={15} strokeWidth={2.5} /> New contract
                </button>
            </div>

            <div style={{ background: '#fff', border: '1px solid #E8F2F8', borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#1E516E' }}>
                            {['Ref', 'Client', 'Period', 'Value', 'Status', ''].map(h => (
                                <th key={h} style={{
                                    padding: '11px 20px', textAlign: h === '' ? 'right' : 'left',
                                    fontSize: 10, fontWeight: 700, color: '#1E516E',
                                    letterSpacing: '0.07em', textTransform: 'uppercase'
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#1E516E', fontSize: 13 }}>Loading...</td></tr>
                        ) : contracts.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#1E516E', fontSize: 13 }}>No contracts found</td></tr>
                        ) : contracts.map(contract => {
                            const cfg = statusStyle(contract.status);
                            return (
                                <tr key={contract.id} style={{ borderTop: '1px solid #F4F9FB' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#F7FAFB'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '14px 20px', fontSize: 11, fontFamily: 'monospace', color: '#1E516E' }}>
                                        #{contract.id?.toString().padStart(4, '0')}
                                    </td>
                                    <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#1E516E' }}>
                                        {contract.client?.name}
                                    </td>
                                    <td style={{ padding: '14px 20px', fontSize: 12, color: '#1e516e' }}>
                                        {new Date(contract.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        {' — '}
                                        {new Date(contract.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#1E516E' }}>
                                        ₹{contract.totalValue?.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 5,
                                            background: cfg.bg, color: cfg.text,
                                            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20
                                        }}>
                                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot }} />
                                            {contract.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                        <button onClick={() => handleView(contract)}
                                            style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 600, color: '#1e516e', cursor: 'pointer' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#1E516E'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#1e516e'}>
                                            Details →
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
                    backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 50, padding: 24
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 800,
                        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.12)'
                    }}>
                        <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid #E8F2F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                            <div>
                                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1E516E', margin: 0 }}>
                                    {isViewOnly ? 'Contract details' : formData.id ? 'Edit contract' : 'New contract'}
                                </h2>
                                {isViewOnly && formData.id && <p style={{ fontSize: 12, color: '#1e516e', marginTop: 3 }}>Ref #{formData.id?.toString().padStart(4, '0')}</p>}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {isViewOnly && (
                                    <button onClick={() => setIsViewOnly(false)} style={{
                                        padding: '8px 16px', background: '#F4F9FB', border: '1px solid #CFE3EE',
                                        borderRadius: 10, fontSize: 12, fontWeight: 600, color: '#1A5D8B', cursor: 'pointer'
                                    }}>Edit</button>
                                )}
                                <button onClick={() => setShowModal(false)} style={{
                                    background: '#F4F9FB', border: 'none', borderRadius: 8, width: 32, height: 32,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1e516e'
                                }}><X size={15} /></button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '28px 32px' }}>
                            {/* Client & Dates */}
                            <p style={{ ...labelStyle, color: '#1E516E', marginBottom: 16 }}>Contract basics</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>
                                <div style={{ gridColumn: '1 / 2' }}>
                                    <label style={labelStyle}>Client</label>
                                    <select required disabled={isViewOnly} style={inputStyle} value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })}>
                                        <option value="">Select client</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Start date</label>
                                    <input type="date" required disabled={isViewOnly} style={inputStyle} value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                                </div>
                                <div>
                                    <label style={labelStyle}>End date</label>
                                    <input type="date" required disabled={isViewOnly} style={inputStyle} value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                                </div>
                            </div>

                            {/* Terms */}
                            <p style={{ ...labelStyle, color: '#1E516E', marginBottom: 16 }}>Terms</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>
                                <div>
                                    <label style={labelStyle}>Status</label>
                                    <select disabled={isViewOnly} style={inputStyle} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option>Draft</option><option>Active</option><option>Pending</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Billing frequency</label>
                                    <select disabled={isViewOnly} style={inputStyle} value={formData.billingFrequency} onChange={e => setFormData({ ...formData, billingFrequency: e.target.value })}>
                                        <option>Monthly</option><option>Quarterly</option><option>Annually</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Payment terms</label>
                                    <select disabled={isViewOnly} style={inputStyle} value={formData.paymentTerms} onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}>
                                        <option>Net 15</option><option>Net 30</option><option>Net 60</option>
                                    </select>
                                </div>
                            </div>

                            {/* Services */}
                            <div style={{ borderTop: '1px solid #E8F2F8', paddingTop: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1E516E', margin: 0 }}>Services included</p>
                                    {!isViewOnly && (
                                        <button type="button" onClick={addServiceRow} style={{
                                            background: 'none', border: '1px solid #CFE3EE', padding: '5px 12px',
                                            borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#1A5D8B', cursor: 'pointer'
                                        }}>+ Add service</button>
                                    )}
                                </div>

                                {formData.contractServices.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '32px', border: '2px dashed #E8F2F8', borderRadius: 12, color: '#1E516E', fontSize: 13 }}>
                                        No services added. Click "Add service" to begin.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {formData.contractServices.map((item, index) => {
                                            const sel = services.find(s => s.id === parseInt(item.serviceId));
                                            const isMonthly = sel?.pricingType === 'Monthly';
                                            const months = calculateMonths(formData.startDate, formData.endDate);
                                            const lineTotal = (item.unitPrice || 0) * (isMonthly ? months : 1);

                                            return (
                                                <div key={index} style={{ background: '#F7FAFB', borderRadius: 14, border: '1px solid #E8F2F8', padding: '16px 18px' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px auto auto', gap: 12, alignItems: 'end', marginBottom: sel?.subServices?.length > 0 ? 14 : 0 }}>
                                                        <div>
                                                            <label style={{ ...labelStyle, fontSize: 10, marginBottom: 5 }}>Service</label>
                                                            <select disabled={isViewOnly} style={{ ...inputStyle, background: '#fff' }} value={item.serviceId} onChange={e => handleServiceChange(index, 'serviceId', e.target.value)}>
                                                                <option value="">Select...</option>
                                                                {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.pricingType})</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label style={{ ...labelStyle, fontSize: 10, marginBottom: 5 }}>Qty</label>
                                                            <input type="number" disabled={isViewOnly} style={{ ...inputStyle, background: '#fff' }} value={item.employeeCount} onChange={e => handleServiceChange(index, 'employeeCount', e.target.value)} />
                                                        </div>
                                                        <div>
                                                            <label style={{ ...labelStyle, fontSize: 10, marginBottom: 5 }}>Unit Price</label>
                                                            <input 
                                                                type="number" 
                                                                disabled={isViewOnly} 
                                                                style={{ ...inputStyle, background: item.optedSubServiceIds?.length > 0 ? '#F4F9FB' : '#fff' }} 
                                                                value={item.unitPrice} 
                                                                onChange={e => handleServiceChange(index, 'unitPrice', e.target.value)} 
                                                                readOnly={item.optedSubServiceIds?.length > 0}
                                                            />
                                                        </div>
                                                        <div style={{ paddingBottom: 2, textAlign: 'right', minWidth: 120 }}>
                                                            <p style={{ fontSize: 10, fontWeight: 700, color: '#1E516E', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 8px' }}>Total</p>
                                                            <p style={{ fontSize: 14, fontWeight: 700, color: '#1E516E', margin: 0 }}>
                                                                ₹{lineTotal.toLocaleString()}
                                                                {isMonthly && <span style={{ fontSize: 11, fontWeight: 400, color: '#1e516e' }}> ({months}mo)</span>}
                                                            </p>
                                                        </div>
                                                        {!isViewOnly && (
                                                            <button type="button" onClick={() => removeServiceRow(index)}
                                                                style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: '#1E516E', borderRadius: 6, alignSelf: 'flex-end' }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = '#FCE4F2'; e.currentTarget.style.color = '#E50A86'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#1E516E'; }}>
                                                                <Trash2 size={15} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {sel?.subServices?.length > 0 && (
                                                        <div style={{ borderTop: '1px solid #E8F2F8', paddingTop: 12 }}>
                                                            <p style={{ fontSize: 10, fontWeight: 700, color: '#1E516E', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Sub-services</p>
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                                                {sel.subServices.map(ss => (
                                                                    <label key={ss.id} style={{
                                                                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                                                                        background: '#fff', borderRadius: 8, border: '1px solid #E8F2F8',
                                                                        cursor: isViewOnly ? 'default' : 'pointer', fontSize: 12, color: '#1A5D8B'
                                                                    }}>
                                                                        <input type="checkbox" disabled={isViewOnly}
                                                                            checked={item.optedSubServiceIds?.includes(ss.id)}
                                                                            onChange={e => {
                                                                                const ids = item.optedSubServiceIds || [];
                                                                                handleServiceChange(index, 'optedSubServiceIds',
                                                                                    e.target.checked ? [...ids, ss.id] : ids.filter(id => id !== ss.id));
                                                                            }} />
                                                                        <span style={{ flex: 1 }}>{ss.name}</span>
                                                                        <span style={{ color: '#1e516e', fontSize: 11 }}>₹{ss.price}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {/* Total */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid #E8F2F8', marginTop: 4 }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: 11, color: '#1e516e', margin: '0 0 4px' }}>Total contract value</p>
                                                <p style={{ fontSize: 24, fontWeight: 700, color: '#1E516E', letterSpacing: '-0.02em', margin: 0 }}>₹{totalValue.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 24, borderTop: '1px solid #E8F2F8', marginTop: 24 }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{
                                    padding: '9px 20px', background: '#fff', border: '1px solid #CFE3EE',
                                    borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#1e516e', cursor: 'pointer'
                                }}>{isViewOnly ? 'Close' : 'Cancel'}</button>
                                {!isViewOnly && (
                                    <button type="submit" style={{
                                        padding: '9px 20px', background: '#25B14C', border: 'none',
                                        borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(37, 177, 76, 0.3)'
                                    }}>{formData.id ? 'Save changes' : 'Create contract'}</button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contracts;
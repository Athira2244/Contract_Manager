import React, { useState, useEffect } from 'react';
import { serviceService } from '../services/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const inputStyle = {
    width: '100%', padding: '9px 14px', borderRadius: 10,
    border: '1px solid #CFE3EE', background: '#fff',
    fontSize: 13, color: '#1E516E', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
};

const categoryColors = [
    { bg: '#EFF6FF', text: '#1D4ED8', border: '#DBEAFE' },
    { bg: '#F0FDF4', text: '#15803D', border: '#DCFCE7' },
    { bg: '#FDF4FF', text: '#7E22CE', border: '#F3E8FF' },
    { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
    { bg: '#F0FDFA', text: '#0F766E', border: '#CCFBF1' },
    { bg: '#FEF9C3', text: '#8B7501', border: '#FDE68A' },
];

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentService, setCurrentService] = useState({
        name: '', category: '', pricingType: 'Monthly', basePrice: 0, timeSpan: 'Monthly', subServices: []
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try { const r = await serviceService.getAll(); setServices(r.data); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubServiceChange = (index, field, value) => {
        const updated = [...currentService.subServices];
        updated[index] = { ...updated[index], [field]: value };
        const newBase = updated.reduce((s, ss) => s + parseFloat(ss.price || 0), 0);
        setCurrentService({ ...currentService, subServices: updated, basePrice: newBase });
    };

    const addSubService = () => setCurrentService({
        ...currentService,
        subServices: [...currentService.subServices, { name: '', price: 0, timeSpan: 'Monthly' }]
    });

    const removeSubService = (index) => {
        const updated = currentService.subServices.filter((_, i) => i !== index);
        setCurrentService({ ...currentService, subServices: updated, basePrice: updated.reduce((s, ss) => s + parseFloat(ss.price || 0), 0) });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...currentService, subServices: currentService.subServices.map(ss => ({ ...ss, price: parseFloat(ss.price) })) };
            if (currentService.id) await serviceService.update(currentService.id, payload);
            else await serviceService.create(payload);
            setShowModal(false);
            fetchServices();
            setCurrentService({ name: '', category: '', pricingType: 'Monthly', basePrice: 0, timeSpan: 'Monthly', subServices: [] });
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this service?')) return;
        try { await serviceService.delete(id); fetchServices(); }
        catch (e) { console.error(e); }
    };

    return (
        <div style={{ padding: '40px 48px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1E516E', letterSpacing: '-0.02em', margin: 0 }}>Service Catalog</h1>
                    <p style={{ fontSize: 13, color: '#1e516e', marginTop: 4 }}>Standard offerings and pricing models</p>
                </div>
                <button onClick={() => {
                    setCurrentService({ name: '', category: '', pricingType: 'Monthly', basePrice: 0, timeSpan: 'Monthly', subServices: [] });
                    setShowModal(true);
                }} style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px',
                    background: '#25B14C', color: '#fff', border: 'none', borderRadius: 10,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 177, 76, 0.3)', transition: 'all 0.2s'
                }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 177, 76, 0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 177, 76, 0.3)'; }}>
                    <Plus size={15} strokeWidth={2.5} /> New service
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '96px 0', color: '#1E516E', fontSize: 13 }}>Loading catalog...</div>
            ) : services.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '96px 0', border: '2px dashed #E8F2F8',
                    borderRadius: 20, color: '#1E516E', fontSize: 13
                }}>No services yet. Create your first service.</div>
            ) : (
                <div style={{ background: '#fff', border: '1px solid #E8F2F8', borderRadius: 16, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#1E516E' }}>
                                {['Service', 'Category', 'Pricing', 'Base Price', 'Sub-Services', ''].map(h => (
                                    <th key={h} style={{
                                        padding: '11px 20px', textAlign: h === '' ? 'right' : 'left',
                                        fontSize: 11, fontWeight: 700, color: '#1E516E',
                                        letterSpacing: '0.07em', textTransform: 'uppercase', whiteSpace: 'nowrap'
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service, idx) => {
                                const color = categoryColors[idx % categoryColors.length];
                                return (
                                    <tr key={service.id} style={{ borderTop: '1px solid #F4F9FB' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#F7FAFB'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '14px 20px' }}>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: '#1E516E' }}>{service.name}</span>
                                        </td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <span style={{
                                                display: 'inline-flex', padding: '3px 10px', borderRadius: 20,
                                                background: color.bg, color: color.text,
                                                fontSize: 11, fontWeight: 700, letterSpacing: '0.02em'
                                            }}>{service.category}</span>
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: 13, color: '#1A5D8B' }}>
                                            {service.pricingType}
                                            {service.timeSpan !== 'N/A' && <span style={{ fontSize: 11, color: '#1e516e', marginLeft: 6 }}>({service.timeSpan})</span>}
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#1E516E' }}>
                                            ₹{parseFloat(service.basePrice).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: 13, color: '#1e516e' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: 6,
                                                background: '#E8F2F8', color: '#1e516e',
                                                fontSize: 11, fontWeight: 600
                                            }}>{(service.subServices || []).length} items</span>
                                        </td>
                                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                <button onClick={() => { setCurrentService(service); setShowModal(true); }}
                                                    style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#1e516e' }}
                                                    onMouseEnter={e => e.currentTarget.style.color = '#1E516E'}
                                                    onMouseLeave={e => e.currentTarget.style.color = '#1e516e'}
                                                    title="Edit">
                                                    <Edit2 size={15} />
                                                </button>
                                                <button onClick={() => handleDelete(service.id)}
                                                    style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#1e516e' }}
                                                    onMouseEnter={e => e.currentTarget.style.color = '#E50A86'}
                                                    onMouseLeave={e => e.currentTarget.style.color = '#1e516e'}
                                                    title="Delete">
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
                    backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 50, padding: 24
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 640,
                        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.12)'
                    }}>
                        <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid #E8F2F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1E516E', margin: 0 }}>
                                {currentService.id ? 'Edit service' : 'New service'}
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{
                                background: '#F4F9FB', border: 'none', borderRadius: 8, width: 32, height: 32,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1e516e'
                            }}><X size={15} /></button>
                        </div>

                        <form onSubmit={handleSave} style={{ padding: '28px 32px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1e516e', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Service name</label>
                                    <input required style={inputStyle} value={currentService.name} onChange={e => setCurrentService({ ...currentService, name: e.target.value })} placeholder="e.g. Payroll Management" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1e516e', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Category</label>
                                    <input required style={inputStyle} value={currentService.category} onChange={e => setCurrentService({ ...currentService, category: e.target.value })} placeholder="e.g. Human Resources" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1e516e', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Pricing type</label>
                                    <select style={inputStyle} value={currentService.pricingType} onChange={e => setCurrentService({ ...currentService, pricingType: e.target.value })}>
                                        <option>Monthly</option>
                                        <option>Annual</option>
                                        <option>One-time</option>
                                        <option>Per Employee</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1e516e', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Deliverable frequency</label>
                                    <select style={inputStyle} value={currentService.timeSpan} onChange={e => setCurrentService({ ...currentService, timeSpan: e.target.value })}>
                                        <option>Monthly</option>
                                        <option>Quarterly</option>
                                        <option>Yearly</option>
                                        <option>N/A</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1e516e', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Base Price</label>
                                    <input 
                                        type="number" 
                                        style={{ ...inputStyle, background: currentService.subServices?.length > 0 ? '#F4F9FB' : '#fff' }} 
                                        value={currentService.basePrice} 
                                        onChange={e => setCurrentService({ ...currentService, basePrice: parseFloat(e.target.value || 0) })} 
                                        readOnly={currentService.subServices?.length > 0}
                                        placeholder="0.00" 
                                    />
                                    {currentService.subServices?.length > 0 && <p style={{ fontSize: 10, color: '#1e516e', marginTop: 4 }}>* Calculated from sub-services</p>}
                                </div>
                            </div>

                            {/* Sub-services */}
                            <div style={{ borderTop: '1px solid #E8F2F8', paddingTop: 24, marginBottom: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1E516E', margin: 0 }}>Sub-services</p>
                                    <button type="button" onClick={addSubService} style={{
                                        background: 'none', border: '1px solid #CFE3EE', padding: '5px 12px',
                                        borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#1A5D8B', cursor: 'pointer'
                                    }}>+ Add</button>
                                </div>

                                {currentService.subServices.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '24px', border: '2px dashed #E8F2F8', borderRadius: 12, color: '#1E516E', fontSize: 13 }}>
                                        No sub-services. Click "Add" to begin.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {currentService.subServices.map((ss, i) => (
                                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto 100px auto', gap: 10, alignItems: 'end', padding: '12px 14px', background: '#F7FAFB', borderRadius: 12, border: '1px solid #E8F2F8' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#1e516e', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Name</label>
                                                    <input required style={{ ...inputStyle, background: '#fff' }} value={ss.name} onChange={e => handleSubServiceChange(i, 'name', e.target.value)} placeholder="e.g. Tax Filing" />
                                                </div>
                                                <div style={{ width: 130 }}>
                                                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#1e516e', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Frequency</label>
                                                    <select style={{ ...inputStyle, background: '#fff' }} value={ss.timeSpan || 'Monthly'} onChange={e => handleSubServiceChange(i, 'timeSpan', e.target.value)}>
                                                        <option>Monthly</option>
                                                        <option>Quarterly</option>
                                                        <option>Yearly</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#1e516e', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Price (₹)</label>
                                                    <input type="number" required style={{ ...inputStyle, background: '#fff' }} value={ss.price} onChange={e => handleSubServiceChange(i, 'price', e.target.value)} />
                                                </div>
                                                <button type="button" onClick={() => removeSubService(i)} style={{
                                                    background: 'none', border: 'none', padding: '8px', cursor: 'pointer', color: '#1E516E', borderRadius: 8, alignSelf: 'flex-end', marginBottom: 1
                                                }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = '#FCE4F2'; e.currentTarget.style.color = '#E50A86'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#1E516E'; }}>
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {currentService.subServices.length > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingTop: 16, borderTop: '1px solid #E8F2F8' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: 11, color: '#1e516e', margin: '0 0 4px' }}>Total base price</p>
                                            <p style={{ fontSize: 20, fontWeight: 700, color: '#1E516E', letterSpacing: '-0.02em', margin: 0 }}>₹{currentService.basePrice.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 20, borderTop: '1px solid #E8F2F8', marginTop: 24 }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{
                                    padding: '9px 20px', background: '#fff', border: '1px solid #CFE3EE',
                                    borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#1e516e', cursor: 'pointer'
                                }}>Cancel</button>
                                <button type="submit" style={{
                                    padding: '9px 20px', background: '#25B14C', border: 'none',
                                    borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(37, 177, 76, 0.3)'
                                }}>Save service</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Services;
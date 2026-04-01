import React, { useState, useEffect } from 'react';
import { clientService } from '../services/api';
import { Plus, Search, X, ChevronDown } from 'lucide-react';

const inputStyle = {
    width: '100%', padding: '9px 14px', borderRadius: 10,
    border: '1px solid #CFE3EE', background: '#fff',
    fontSize: 13, color: '#1E516E', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
};

const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: '#1e516e', letterSpacing: '0.06em',
    textTransform: 'uppercase', marginBottom: 6,
};

const FormField = ({ label, required, children }) => (
    <div>
        <label style={labelStyle}>{label}{required && <span style={{ color: '#E50A86', marginLeft: 2 }}>*</span>}</label>
        {children}
    </div>
);

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [currentClient, setCurrentClient] = useState({
        name: '', gstin: '', pan: '', address: '', contactPerson: '', email: '', phone: '',
        status: 'Active', assignedSalesPerson: '', accountManager: ''
    });

    useEffect(() => { 
        fetchClients(); 
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const userId = user.user_id || user.emp_company_id || user.emp_pkey || user.id;
                const res = await fetch(`https://mpmv2o.mypayrollmaster.online/api/v2qa/employees_list?user_id=${userId}`);
                const data = await res.json();
                if (data && data.success === 1 && data.data) {
                    setEmployees(data.data);
                }
            }
        } catch (e) { console.error('Error fetching employees:', e); }
    };

    const fetchClients = async () => {
        try { const r = await clientService.getAll(); setClients(r.data); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (currentClient.id) await clientService.update(currentClient.id, currentClient);
            else await clientService.create(currentClient);
            setShowModal(false);
            fetchClients();
            resetForm();
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this client?')) return;
        try { await clientService.delete(id); fetchClients(); }
        catch (e) { console.error(e); }
    };

    const resetForm = () => setCurrentClient({
        name: '', gstin: '', pan: '', address: '', contactPerson: '',
        email: '', phone: '', status: 'Active', assignedSalesPerson: '', accountManager: ''
    });

    const filtered = clients.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.contactPerson?.toLowerCase().includes(search.toLowerCase())
    );

    const active = clients.filter(c => c.status === 'Active').length;

    const getEmployeeName = (val) => {
        if (!val) return '—';
        const emp = employees.find(e => String(e.emp_pkey) === String(val) || String(e.EmpName).trim() === String(val).trim());
        return emp ? emp.EmpName?.trim() : val;
    };

    return (
        <div style={{ padding: '40px 48px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1E516E', letterSpacing: '-0.02em', margin: 0 }}>Clients</h1>
                    <p style={{ fontSize: 13, color: '#1e516e', marginTop: 4 }}>{clients.length} total · {active} active</p>
                </div>
                <button onClick={() => { resetForm(); setShowModal(true); }} style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px',
                    background: '#25B14C', color: '#fff', border: 'none', borderRadius: 10,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em',
                    boxShadow: '0 4px 12px rgba(37, 177, 76, 0.3)', transition: 'all 0.2s'
                }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 177, 76, 0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 177, 76, 0.3)'; }}>
                    <Plus size={15} strokeWidth={2.5} /> New client
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                {[
                    { label: 'Total', value: clients.length, sub: 'All time' },
                    { label: 'Active', value: active, sub: 'Managed' },
                    { label: 'Live contracts', value: 18, sub: 'Executed' },
                    { label: 'Avg. value', value: '₹2.4L', sub: 'Per unit' },
                ].map(s => (
                    <div key={s.label} style={{ background: '#fff', border: '1px solid #E8F2F8', borderRadius: 14, padding: '20px 22px' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#1E516E', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 8px' }}>{s.label}</p>
                        <p style={{ fontSize: 26, fontWeight: 700, color: '#1E516E', letterSpacing: '-0.02em', margin: 0 }}>{s.value}</p>
                        <p style={{ fontSize: 11, color: '#1e516e', marginTop: 4 }}>{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#1E516E' }} />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or contact..."
                        style={{ ...inputStyle, paddingLeft: 36 }}
                    />
                </div>
                <select style={{ ...inputStyle, width: 140, cursor: 'pointer', borderColor: '#36BEF6', color: '#1E516E', fontWeight: 600, background: '#F4F9FB' }}>
                    <option>All statuses</option>
                    <option>Active</option>
                    <option>Inactive</option>
                </select>
            </div>

            {/* Table */}
            <div style={{ background: '#fff', border: '1px solid #E8F2F8', borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#F4F9FB', borderBottom: '1px solid #E8F2F8' }}>
                            {['Company', 'GSTIN', 'Contact', 'Account Mgr', 'Status', ''].map(h => (
                                <th key={h} style={{
                                    padding: '11px 20px', textAlign: h === '' ? 'right' : 'left',
                                    fontSize: 11, fontWeight: 700, color: '#1e516e',
                                    letterSpacing: '0.07em', textTransform: 'uppercase', whiteSpace: 'nowrap'
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', color: '#1E516E', fontSize: 13 }}>Loading...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', color: '#1E516E', fontSize: 13 }}>No clients found</td></tr>
                        ) : filtered.map(client => (
                            <tr key={client.id} style={{ borderTop: '1px solid #F4F9FB' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#F7FAFB'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '14px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 8,
                                            background: '#E8F2F8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 11, fontWeight: 700, color: '#1e516e', flexShrink: 0
                                        }}>
                                            {client.name?.slice(0, 2).toUpperCase()}
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1E516E' }}>{client.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '14px 20px', fontSize: 12, color: '#1e516e', fontFamily: 'monospace' }}>{client.gstin || '—'}</td>
                                <td style={{ padding: '14px 20px', fontSize: 13, color: '#1A5D8B' }}>{client.contactPerson || '—'}</td>
                                <td style={{ padding: '14px 20px', fontSize: 13, color: '#1A5D8B' }}>{getEmployeeName(client.accountManager)}</td>
                                <td style={{ padding: '14px 20px' }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 5,
                                        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                                        background: client.status === 'Active' ? '#E3F6E8' : '#F4F9FB',
                                        color: client.status === 'Active' ? '#156D2E' : '#1e516e',
                                    }}>
                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: client.status === 'Active' ? '#25B14C' : '#1e516e' }} />
                                        {client.status}
                                    </span>
                                </td>
                                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                    <button onClick={() => { setCurrentClient(client); setShowModal(true); }}
                                        style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 600, color: '#1e516e', cursor: 'pointer', letterSpacing: '-0.01em' }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#1E516E'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#1e516e'}>
                                        Edit →
                                    </button>
                                </td>
                            </tr>
                        ))}
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
                        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 720,
                        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.12)'
                    }}>
                        <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid #E8F2F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1E516E', margin: 0 }}>
                                    {currentClient.id ? 'Edit client' : 'New client'}
                                </h2>
                                <p style={{ fontSize: 12, color: '#1e516e', marginTop: 3 }}>Corporate details and internal assignment</p>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{
                                background: '#F4F9FB', border: 'none', borderRadius: 8, width: 32, height: 32,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1e516e'
                            }}><X size={15} /></button>
                        </div>

                        <form onSubmit={handleSave} style={{ padding: '28px 32px' }}>
                            {/* Corporate */}
                            <p style={{ ...labelStyle, marginBottom: 16, color: '#1E516E' }}>Corporate details</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>
                                <div style={{ gridColumn: '1 / 3' }}>
                                    <FormField label="Company name" required>
                                        <input required style={inputStyle} value={currentClient.name}
                                            onChange={e => setCurrentClient({ ...currentClient, name: e.target.value })}
                                            onFocus={e => e.target.style.borderColor = '#1E516E'}
                                            onBlur={e => e.target.style.borderColor = '#CFE3EE'} />
                                    </FormField>
                                </div>
                                <FormField label="Status">
                                    <select style={inputStyle} value={currentClient.status}
                                        onChange={e => setCurrentClient({ ...currentClient, status: e.target.value })}>
                                        <option>Active</option>
                                        <option>Inactive</option>
                                    </select>
                                </FormField>
                                <div style={{ gridColumn: '1 / 3' }}>
                                    <FormField label="GSTIN" required>
                                        <input required style={inputStyle} placeholder="15-character GST number"
                                            value={currentClient.gstin}
                                            onChange={e => setCurrentClient({ ...currentClient, gstin: e.target.value })}
                                            onFocus={e => e.target.style.borderColor = '#1E516E'}
                                            onBlur={e => e.target.style.borderColor = '#CFE3EE'} />
                                    </FormField>
                                </div>
                                <FormField label="PAN" required>
                                    <input required style={inputStyle} value={currentClient.pan}
                                        onChange={e => setCurrentClient({ ...currentClient, pan: e.target.value })}
                                        onFocus={e => e.target.style.borderColor = '#1E516E'}
                                        onBlur={e => e.target.style.borderColor = '#CFE3EE'} />
                                </FormField>
                            </div>

                            {/* Contact */}
                            <p style={{ ...labelStyle, marginBottom: 16, color: '#1E516E' }}>Contact details</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>
                                <FormField label="Contact person">
                                    <input style={inputStyle} value={currentClient.contactPerson}
                                        onChange={e => setCurrentClient({ ...currentClient, contactPerson: e.target.value })}
                                        onFocus={e => e.target.style.borderColor = '#1E516E'}
                                        onBlur={e => e.target.style.borderColor = '#CFE3EE'} />
                                </FormField>
                                <FormField label="Email">
                                    <input type="email" style={inputStyle} value={currentClient.email}
                                        onChange={e => setCurrentClient({ ...currentClient, email: e.target.value })}
                                        onFocus={e => e.target.style.borderColor = '#1E516E'}
                                        onBlur={e => e.target.style.borderColor = '#CFE3EE'} />
                                </FormField>
                                <FormField label="Phone">
                                    <input style={inputStyle} value={currentClient.phone}
                                        onChange={e => setCurrentClient({ ...currentClient, phone: e.target.value })}
                                        onFocus={e => e.target.style.borderColor = '#1E516E'}
                                        onBlur={e => e.target.style.borderColor = '#CFE3EE'} />
                                </FormField>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <FormField label="Address">
                                        <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={currentClient.address}
                                            onChange={e => setCurrentClient({ ...currentClient, address: e.target.value })}
                                            onFocus={e => e.target.style.borderColor = '#1E516E'}
                                            onBlur={e => e.target.style.borderColor = '#CFE3EE'} />
                                    </FormField>
                                </div>
                            </div>

                            {/* Assignment */}
                            <p style={{ ...labelStyle, marginBottom: 16, color: '#1E516E' }}>Internal assignment</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                                <FormField label="Sales person">
                                    <select style={inputStyle} value={currentClient.assignedSalesPerson}
                                        onChange={e => setCurrentClient({ ...currentClient, assignedSalesPerson: e.target.value })}>
                                        <option value="">Select...</option>
                                        {employees.map(emp => (
                                            <option key={emp.emp_pkey || Math.random()} value={emp.emp_pkey}>
                                                {emp.EmpName?.trim()}
                                            </option>
                                        ))}
                                    </select>
                                </FormField>
                                <FormField label="Account manager">
                                    <select style={inputStyle} value={currentClient.accountManager}
                                        onChange={e => setCurrentClient({ ...currentClient, accountManager: e.target.value })}>
                                        <option value="">Select...</option>
                                        {employees.map(emp => (
                                            <option key={emp.emp_pkey || Math.random()} value={emp.emp_pkey}>
                                                {emp.EmpName?.trim()}
                                            </option>
                                        ))}
                                    </select>
                                </FormField>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 20, borderTop: '1px solid #E8F2F8' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{
                                    padding: '9px 20px', background: '#fff', border: '1px solid #CFE3EE',
                                    borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#1e516e', cursor: 'pointer'
                                }}>Cancel</button>
                                <button type="submit" style={{
                                    padding: '9px 20px', background: '#25B14C', border: 'none',
                                    borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(37, 177, 76, 0.3)'
                                }}>Save client</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
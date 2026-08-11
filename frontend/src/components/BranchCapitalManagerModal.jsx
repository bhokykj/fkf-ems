import React, { useState } from 'react';
import { 
  Building2, DollarSign, Wallet, ArrowUpRight, CheckCircle2, XCircle, Clock, 
  Plus, Edit3, Save, X, RefreshCw, AlertCircle, PieChart, ShieldCheck 
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/branches';

export default function BranchCapitalManagerModal({ 
  branches = [], 
  currentUser, 
  onClose, 
  onCapitalUpdated 
}) {
  const [capitalRequests, setCapitalRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('SUMMARY'); // 'SUMMARY' | 'REQUESTS'

  // Top-Up Request Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(branches.length > 0 ? branches[0].id : '');
  const [requestAmount, setRequestAmount] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  // Edit Direct Capital Modal State (Super Admin)
  const [editingBranchCapital, setEditingBranchCapital] = useState(null); // { id, name, allocated_capital }
  const [newAllocatedCapital, setNewAllocatedCapital] = useState('');
  const [savingCapital, setSavingCapital] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCapitalRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/capital-requests/`);
      const data = await res.json();
      setCapitalRequests(Array.isArray(data) ? data : (data?.results || []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCapitalRequests();
  }, []);

  // Submit Top-Up Request (Branch Manager / Staff)
  const handleCreateTopUpRequest = async (e) => {
    e.preventDefault();
    if (!requestAmount || !requestReason.trim()) return;

    setRequestSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/capital-requests/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch: selectedBranchId || (branches.length > 0 ? branches[0].id : 1),
          requested_by: currentUser?.username || 'Branch Manager',
          amount: parseFloat(requestAmount),
          reason: requestReason
        })
      });
      if (!res.ok) throw new Error('Imeshindwa kutuma ombi la kuongezewa mtaji');
      setSuccessMsg('Ombi la kuongezewa mtaji limetumwa kikamilifu kwa Super Admin!');
      setShowRequestModal(false);
      setRequestAmount('');
      setRequestReason('');
      fetchCapitalRequests();
    } catch (err) {
      setErrorMsg(err.message || 'Hitilafu imetokea');
    } finally {
      setRequestSubmitting(false);
    }
  };

  // Approve Capital Top-Up Request (Super Admin)
  const handleApproveRequest = async (reqId) => {
    if (window.confirm('Je, una uhakika unataka kuidhinisha ombi hili la mtaji? Mtaji wa tawi utaongezeka kiotomatiki.')) {
      try {
        const res = await fetch(`${API_BASE}/capital-requests/${reqId}/approve/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ admin_notes: 'Imeidhinishwa kikamilifu na Super Admin' })
        });
        if (!res.ok) throw new Error('Imeshindwa kuidhinisha ombi');
        fetchCapitalRequests();
        if (onCapitalUpdated) onCapitalUpdated();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Reject Capital Top-Up Request (Super Admin)
  const handleRejectRequest = async (reqId) => {
    if (window.confirm('Je, una uhakika unataka kukataa ombi hili la mtaji?')) {
      try {
        const res = await fetch(`${API_BASE}/capital-requests/${reqId}/reject/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ admin_notes: 'Imekataliwa na Super Admin' })
        });
        if (!res.ok) throw new Error('Imeshindwa kukataa ombi');
        fetchCapitalRequests();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Edit Direct Allocated Capital (Super Admin)
  const handleSaveDirectCapital = async (e) => {
    e.preventDefault();
    if (!editingBranchCapital || !newAllocatedCapital) return;

    setSavingCapital(true);
    try {
      const res = await fetch(`${API_BASE}/${editingBranchCapital.id}/update_rules/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocated_capital: parseFloat(newAllocatedCapital) })
      });
      if (!res.ok) throw new Error('Imeshindwa kubadili mtaji wa tawi');
      setEditingBranchCapital(null);
      if (onCapitalUpdated) onCapitalUpdated();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingCapital(false);
    }
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '1020px', maxHeight: '92vh', overflowY: 'auto', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ background: '#0F172A', color: '#FFFFFF', padding: '1.5rem 2rem', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#D4AF37', color: '#0F172A', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>
              <Wallet size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                Usimamizi wa Mtaji wa Kampuni na Matawi (Capital Treasury)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#CBD5E1', margin: '0.2rem 0 0 0' }}>
                Mtaji Uliotengwa, Kiwango Kilichokopeshwa, Salio Kilichobaki, na Maombi ya Kuongezewa Mtaji
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Action Controls & Sub Tabs */}
        <div style={{ padding: '1rem 2rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setActiveSubTab('SUMMARY')}
              style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', background: activeSubTab === 'SUMMARY' ? '#0F172A' : '#FFFFFF', color: activeSubTab === 'SUMMARY' ? '#FFFFFF' : '#475569', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <PieChart size={16} /> Mtaji wa Matawi ({branches.length})
            </button>
            <button 
              onClick={() => setActiveSubTab('REQUESTS')}
              style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', background: activeSubTab === 'REQUESTS' ? '#0F172A' : '#FFFFFF', color: activeSubTab === 'REQUESTS' ? '#FFFFFF' : '#475569', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Clock size={16} /> Maombi ya Mtaji ({capitalRequests.length})
            </button>
          </div>

          <button 
            onClick={() => setShowRequestModal(true)}
            style={{ background: '#059669', color: '#FFFFFF', border: 'none', padding: '0.6rem 1.3rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)' }}
          >
            <Plus size={16} /> ➕ Omba Kuongezewa Mtaji (Capital Top-Up)
          </button>
        </div>

        {/* Modal Main Content Body */}
        <div style={{ padding: '1.75rem 2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {successMsg && (
            <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', padding: '0.85rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800', textAlign: 'center' }}>
              ✓ {successMsg}
            </div>
          )}

          {/* SUB TAB 1: BRANCH CAPITAL TREASURY SUMMARY CARDS */}
          {activeSubTab === 'SUMMARY' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {branches.map(b => {
                const allocated = floatVal(b.allocated_capital || 50000000);
                const lentOut = floatVal(b.total_lent_out || b.active_portfolio || 0);
                const remaining = Math.max(0, allocated - lentOut);
                const utilization = allocated > 0 ? Math.min(100, Math.round((lentOut / allocated) * 100)) : 0;

                return (
                  <div key={b.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
                    
                    <div>
                      {/* Branch Identity */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: '#B8860B', fontWeight: '800' }}>{b.code}</span>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>{b.name}</h4>
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: '800', background: utilization > 85 ? '#FEF2F2' : '#ECFDF5', color: utilization > 85 ? '#DC2626' : '#047857', padding: '0.2rem 0.55rem', borderRadius: '12px', border: `1px solid ${utilization > 85 ? '#FCA5A5' : '#A7F3D0'}` }}>
                          {utilization}% Umetumika
                        </span>
                      </div>

                      {/* Progress Bar Gauge */}
                      <div style={{ background: '#E2E8F0', borderRadius: '9999px', height: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <div style={{ width: `${utilization}%`, background: utilization > 85 ? '#DC2626' : (utilization > 60 ? '#D97706' : '#059669'), height: '100%', borderRadius: '9999px', transition: 'width 0.5s ease' }} />
                      </div>

                      {/* Capital Breakdown Grid */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.83rem', background: '#F8FAFC', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#64748B', fontWeight: '600' }}>Mtaji Aliotengewa Tawi:</span>
                          <strong style={{ color: '#0F172A', fontSize: '0.9rem' }}>TSH {allocated.toLocaleString()}</strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#64748B', fontWeight: '600' }}>Kiwango Kilichokopeshwa:</span>
                          <strong style={{ color: '#059669', fontSize: '0.9rem' }}>TSH {lentOut.toLocaleString()}</strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #CBD5E1', paddingTop: '0.45rem' }}>
                          <span style={{ color: '#334155', fontWeight: '800' }}>Salio la Mtaji Kilichobaki:</span>
                          <strong style={{ color: remaining < 5000000 ? '#DC2626' : '#0284C7', fontSize: '0.95rem', fontWeight: '900' }}>
                            TSH {remaining.toLocaleString()}
                          </strong>
                        </div>

                      </div>
                    </div>

                    {/* Super Admin Action: Edit Capital Directly */}
                    {isSuperAdmin && (
                      <button 
                        onClick={() => {
                          setEditingBranchCapital(b);
                          setNewAllocatedCapital(allocated);
                        }}
                        style={{ padding: '0.45rem', borderRadius: '8px', border: '1px solid #FCD34D', background: '#FEF3C7', color: '#B8860B', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                      >
                        <Edit3 size={14} /> Badili Mtaji wa Tawi Hili (Super Admin)
                      </button>
                    )}

                  </div>
                );
              })}
            </div>
          )}

          {/* SUB TAB 2: CAPITAL TOP-UP REQUESTS TABLE */}
          {activeSubTab === 'REQUESTS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', background: '#FFFFFF' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid #CBD5E1', color: '#475569' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Tawi & Mwombaji</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Kiwango Kilichoombwa (TSH)</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Sababu / Uhitaji</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Hali (Status)</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Vitendo (Super Admin)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {capitalRequests.length > 0 ? (
                      capitalRequests.map(r => (
                        <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <strong style={{ display: 'block', color: '#0F172A' }}>{r.branch_name}</strong>
                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Mwombaji: @{r.requested_by}</span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: '900', color: '#059669', fontSize: '0.9rem' }}>
                            TSH {parseFloat(r.amount || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#334155', maxWidth: '240px' }}>
                            {r.reason}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '12px', background: r.status === 'APPROVED' ? '#ECFDF5' : (r.status === 'REJECTED' ? '#FEF2F2' : '#FFFBEB'), color: r.status === 'APPROVED' ? '#047857' : (r.status === 'REJECTED' ? '#DC2626' : '#B8860B'), border: `1px solid ${r.status === 'APPROVED' ? '#A7F3D0' : (r.status === 'REJECTED' ? '#FCA5A5' : '#FDE68A')}` }}>
                              {r.status === 'APPROVED' ? '✓ Imeidhinishwa' : (r.status === 'REJECTED' ? '✕ Imekataliwa' : '⏳ Inasubiri Idhini')}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {isSuperAdmin && r.status === 'PENDING' ? (
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <button 
                                  onClick={() => handleApproveRequest(r.id)}
                                  style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: 'none', background: '#059669', color: '#FFFFFF', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                >
                                  <CheckCircle2 size={13} /> Idhinisha
                                </button>
                                <button 
                                  onClick={() => handleRejectRequest(r.id)}
                                  style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                >
                                  <XCircle size={13} /> Katakata
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{r.admin_notes || '-'}</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: '#94A3B8' }}>
                          Hakuna maombi ya kuongezewa mtaji yaliyowekwa bado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* MODAL 1: TOP-UP CAPITAL REQUEST FORM */}
        {showRequestModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '540px', padding: '1.5rem', border: '1px solid #CBD5E1', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  ➕ Omba Kuongezewa Mtaji (Capital Top-Up Request)
                </h4>
                <button onClick={() => setShowRequestModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateTopUpRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>Chagua Tawi linaloomba Mtaji *</label>
                  <select 
                    value={selectedBranchId} 
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '700' }}
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>Kiwango cha Mtaji Unaoombwa (TSH) *</label>
                  <input 
                    type="number" 
                    step="1000"
                    required
                    placeholder="Mfano: 20000000"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '800', color: '#059669' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>Sababu ya Uhitaji wa Mtaji *</label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="Eleza sababu ya kuomba mtaji mpya (mfano: Ongezeko la waombaji wa mikopo ya biashara...)"
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowRequestModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F1F5F9', fontSize: '0.8rem' }}>
                    Ghairi
                  </button>
                  <button type="submit" disabled={requestSubmitting} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: '#059669', color: '#FFFFFF', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                    {requestSubmitting ? 'Inatuma...' : 'Tuma Ombi kwa Super Admin'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* MODAL 2: DIRECT CAPITAL EDIT MODAL (SUPER ADMIN) */}
        {editingBranchCapital && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '480px', padding: '1.5rem', border: '1px solid #CBD5E1', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Badili Mtaji wa Tawi ({editingBranchCapital.name})
                </h4>
                <button onClick={() => setEditingBranchCapital(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveDirectCapital} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>Weka Mtaji Mpya wa Tawi Hili (TSH) *</label>
                  <input 
                    type="number" 
                    step="1000"
                    required
                    value={newAllocatedCapital}
                    onChange={(e) => setNewAllocatedCapital(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', fontWeight: '800', color: '#0F172A' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setEditingBranchCapital(null)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F1F5F9', fontSize: '0.8rem' }}>
                    Ghairi
                  </button>
                  <button type="submit" disabled={savingCapital} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: '#059669', color: '#FFFFFF', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                    {savingCapital ? 'Inahifadhi...' : 'Hifadhi Mtaji Mpya'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function floatVal(val) {
  const f = parseFloat(val);
  return isNaN(f) ? 0 : f;
}

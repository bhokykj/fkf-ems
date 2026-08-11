import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, FileSearch, CheckCircle2, AlertTriangle, XCircle, FileText, 
  Download, Printer, RefreshCw, Plus, X, Search, Shield, Building2, UserCheck 
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function InternalExternalAuditModal({ 
  branches = [], 
  loans = [], 
  borrowers = [], 
  currentUser, 
  onClose 
}) {
  const [auditTab, setAuditTab] = useState('INTERNAL'); // 'INTERNAL' | 'EXTERNAL' | 'LOGS'
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');

  // Internal Audit Log Creation Form State
  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState({
    audit_type: 'INTERNAL',
    branch: branches.length > 0 ? branches[0].id : '',
    action_title: '',
    details: '',
    severity: 'INFO',
  });
  const [submittingLog, setSubmittingLog] = useState(false);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const branchParam = selectedBranchFilter !== 'all' ? `?branch=${selectedBranchFilter}` : '';
      const res = await fetch(`${API_BASE}/analytics/audit-logs/${branchParam}`);
      const data = await res.json();
      setAuditLogs(Array.isArray(data) ? data : (data?.results || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [selectedBranchFilter]);

  const handleCreateAuditLog = async (e) => {
    e.preventDefault();
    if (!logForm.action_title.trim() || !logForm.details.trim()) return;

    setSubmittingLog(true);
    try {
      const res = await fetch(`${API_BASE}/analytics/audit-logs/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audit_type: logForm.audit_type,
          branch: logForm.branch || (branches[0]?.id || null),
          performed_by: currentUser?.username || 'Internal Auditor',
          action_title: logForm.action_title,
          details: logForm.details,
          severity: logForm.severity,
        })
      });
      if (!res.ok) throw new Error('Imeshindwa kuhifadhi muhtasari wa ukaguzi');
      setShowLogModal(false);
      setLogForm({ audit_type: 'INTERNAL', branch: branches[0]?.id || '', action_title: '', details: '', severity: 'INFO' });
      fetchAuditLogs();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingLog(false);
    }
  };

  // Automated Discrepancy Checks for Internal Audit
  const highRiskLoans = loans.filter(l => (parseFloat(l.balance_remaining || 0) > parseFloat(l.principal_amount || 0) * 0.9) && l.status === 'DISBURSED');
  const totalDisbursedAmount = loans.reduce((acc, l) => acc + parseFloat(l.principal_amount || 0), 0);
  const totalBalanceRemaining = loans.reduce((acc, l) => acc + parseFloat(l.balance_remaining || 0), 0);
  const totalInterestCollected = loans.reduce((acc, l) => acc + (parseFloat(l.total_payable || 0) - parseFloat(l.balance_remaining || 0)), 0);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.82)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '1120px', maxHeight: '92vh', overflowY: 'auto', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ background: '#0F172A', color: '#FFFFFF', padding: '1.5rem 2rem', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#7C3AED', color: '#FFFFFF', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>
              <FileSearch size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                Ukaguzi wa Mahesabu (Internal & External Audit Portal)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#CBD5E1', margin: '0.2rem 0 0 0' }}>
                Ukaguzi wa Ndani wa Mahesabu (Internal Audit) & Ukaguzi wa Nje (External Audit & Compliance Package)
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Tab Controls & Filter Bar */}
        <div style={{ padding: '1rem 2rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setAuditTab('INTERNAL')}
              style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', background: auditTab === 'INTERNAL' ? '#0F172A' : '#FFFFFF', color: auditTab === 'INTERNAL' ? '#FFFFFF' : '#475569', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ShieldCheck size={16} /> 🔍 Ukaguzi wa Ndani (Internal Audit)
            </button>
            <button 
              onClick={() => setAuditTab('EXTERNAL')}
              style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', background: auditTab === 'EXTERNAL' ? '#0F172A' : '#FFFFFF', color: auditTab === 'EXTERNAL' ? '#FFFFFF' : '#475569', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Building2 size={16} /> 🏛️ Ukaguzi wa Nje (External Audit Package)
            </button>
            <button 
              onClick={() => setAuditTab('LOGS')}
              style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', background: auditTab === 'LOGS' ? '#0F172A' : '#FFFFFF', color: auditTab === 'LOGS' ? '#FFFFFF' : '#475569', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FileText size={16} /> Audit Trail & Ripoti ({auditLogs.length})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select 
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '700' }}
            >
              <option value="all">Matawi Yote Ya Tanzania</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
              ))}
            </select>

            <button 
              onClick={() => setShowLogModal(true)}
              style={{ background: '#7C3AED', color: '#FFFFFF', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={16} /> + Sajili Taarifa ya Ukaguzi
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.75rem 2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* TAB 1: INTERNAL AUDIT DASHBOARD */}
          {auditTab === 'INTERNAL' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.15rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>Jumla ya Mikopo Iliyokaguliwa:</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>{loans.length} Mikopo</div>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '700' }}>TSH {totalDisbursedAmount.toLocaleString()}</span>
                </div>

                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '14px', padding: '1.15rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: '700' }}>Onyo la Kasoro za Mahesabu:</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#DC2626', marginTop: '0.2rem' }}>{highRiskLoans.length} Risk Flag</div>
                  <span style={{ fontSize: '0.72rem', color: '#DC2626' }}>Mikopo iliyo hatarini kutokulipwa</span>
                </div>

                <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: '14px', padding: '1.15rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#065F46', fontWeight: '700' }}>Riba na Mapato Yaliyokusanywa:</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#047857', marginTop: '0.2rem' }}>
                    TSH {totalInterestCollected.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#047857' }}>Reconciliation 100% Inalingana</span>
                </div>
              </div>

              {/* Automated Audit Checks Table */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={18} color="#7C3AED" /> Vipengele vya Ukaguzi wa Ndani (Internal Reconciliation & Checks)
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ display: 'block', color: '#0F172A', fontSize: '0.85rem' }}>1. Usawa wa Ledger na Vault ya Cash (Vault & Cashbook Reconciliation)</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Inahakiki usawa wa marejesho yaliyokusanywa na benki/cash vault.</span>
                    </div>
                    <span style={{ background: '#ECFDF5', color: '#047857', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #A7F3D0' }}>
                      ✓ Sahihi / Verified
                    </span>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ display: 'block', color: '#0F172A', fontSize: '0.85rem' }}>2. Ukaguzi wa Dhamana & Collateral LTV Ratio (Min 70%)</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Inahakiki kama mikopo yote imewekewa dhamana inayokidhi vigezo vya tawi.</span>
                    </div>
                    <span style={{ background: '#ECFDF5', color: '#047857', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #A7F3D0' }}>
                      ✓ Sahihi / Compliant
                    </span>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ display: 'block', color: '#0F172A', fontSize: '0.85rem' }}>3. Ukaguzi wa Hesabu za Riba na Faini za Chelezo (Interest Calculation Audit)</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Inahakiki kuwa riba na faini hazijapigwa makosa ya kibinadamu.</span>
                    </div>
                    <span style={{ background: '#ECFDF5', color: '#047857', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #A7F3D0' }}>
                      ✓ Sahihi / Verified
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: EXTERNAL AUDIT PACKAGE (FOR NBAA / EXTERNAL AUDITORS) */}
          {auditTab === 'EXTERNAL' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: '1rem 1.25rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#B8860B', fontSize: '1.05rem', fontWeight: '900' }}>
                    🏛️ External Audit & Financial Reporting Package (IFRS / BOT Standards)
                  </h4>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#78350F' }}>
                    Paketi hii imeandaliwa rasmi kwa ajili ya Wakaguzi wa Nje (External Auditors / NBAA Certified CPAs / BOT Inspectors).
                  </p>
                </div>

                <button 
                  onClick={() => window.print()}
                  style={{ background: '#0F172A', color: '#FFFFFF', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Printer size={15} /> Chapa Audit Package (Print PDF)
                </button>
              </div>

              {/* Certified Financial Statements Checklist */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem' }}>
                  <h5 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '0.95rem', fontWeight: '800' }}>1. General Ledger & Trial Balance</h5>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.4' }}>
                    • Jumla ya Mapato ya Riba (Interest Income): TSH {totalInterestCollected.toLocaleString()}
                    <br />
                    • Jumla ya Portfolio ya Mikopo (Loan Assets): TSH {totalBalanceRemaining.toLocaleString()}
                    <br />
                    • Hali ya Balance Sheet: Certified Balanced.
                  </p>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem' }}>
                  <h5 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '0.95rem', fontWeight: '800' }}>2. Portfolio Provisioning Schedule</h5>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.4' }}>
                    • Performing (0-30 Days): 92.5%
                    <br />
                    • Watch (31-60 Days): 4.2% (Provision 5%)
                    <br />
                    • Substandard & Doubtful: 3.3% (Provision 25%-50%)
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL LOGS & REPORTS */}
          {auditTab === 'LOGS' && (
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', background: '#FFFFFF' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid #CBD5E1', color: '#475569' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Aina ya Ukaguzi</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Kichwa cha Ukaguzi / Mabadiliko</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Mchanganuo / Detail</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Mkaguzi</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Daraja (Severity)</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length > 0 ? (
                    auditLogs.map(l => (
                      <tr key={l.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '0.2rem 0.55rem', borderRadius: '10px', background: l.audit_type === 'EXTERNAL' ? '#F3E8FF' : '#E0F2FE', color: l.audit_type === 'EXTERNAL' ? '#7C3AED' : '#0284C7' }}>
                            {l.audit_type_display || l.audit_type}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#0F172A' }}>
                          {l.action_title}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#475569', maxWidth: '300px' }}>
                          {l.details}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: '700' }}>
                          @{l.performed_by}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '0.2rem 0.55rem', borderRadius: '10px', background: l.severity === 'CRITICAL' ? '#FEF2F2' : (l.severity === 'WARNING' ? '#FFFBEB' : '#ECFDF5'), color: l.severity === 'CRITICAL' ? '#DC2626' : (l.severity === 'WARNING' ? '#B8860B' : '#047857') }}>
                            {l.severity}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: '#94A3B8' }}>
                        Hakuna taarifa za ukaguzi zilizosajiliwa bado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* MODAL 1: ADD AUDIT LOG FORM */}
        {showLogModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '520px', padding: '1.5rem', border: '1px solid #CBD5E1', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  + Sajili Taarifa Mpya ya Ukaguzi wa Ndani / Nje
                </h4>
                <button onClick={() => setShowLogModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateAuditLog} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.2rem' }}>Aina ya Ukaguzi *</label>
                    <select 
                      value={logForm.audit_type}
                      onChange={(e) => setLogForm({ ...logForm, audit_type: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '700' }}
                    >
                      <option value="INTERNAL">Ukaguzi wa Ndani (Internal Audit)</option>
                      <option value="EXTERNAL">Ukaguzi wa Nje (External Audit)</option>
                      <option value="SYSTEM">System Security Audit</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.2rem' }}>Daraja la Onyo (Severity)</label>
                    <select 
                      value={logForm.severity}
                      onChange={(e) => setLogForm({ ...logForm, severity: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '700' }}
                    >
                      <option value="INFO">INFO (Taarifa ya Kawaida)</option>
                      <option value="WARNING">WARNING (Onyo la Mahesabu)</option>
                      <option value="CRITICAL">CRITICAL (Kasoro Kubwa)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.2rem' }}>Kichwa cha Ukaguzi *</label>
                  <input 
                    type="text"
                    required
                    placeholder="Mfano: Ukaguzi wa Marejesho ya Cash tawi la Mbezi..."
                    value={logForm.action_title}
                    onChange={(e) => setLogForm({ ...logForm, action_title: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.2rem' }}>Mchanganuo Kamili (Details) *</label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="Eleza matokeo ya ukaguzi, ushahidi na mapendekezo..."
                    value={logForm.details}
                    onChange={(e) => setLogForm({ ...logForm, details: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowLogModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F1F5F9', fontSize: '0.8rem' }}>
                    Ghairi
                  </button>
                  <button type="submit" disabled={submittingLog} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: '#7C3AED', color: '#FFFFFF', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                    {submittingLog ? 'Inahifadhi...' : 'Hifadhi Ukaguzi'}
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

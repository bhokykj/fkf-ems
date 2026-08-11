import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, FileText, CheckCircle2, Plus, Upload, Calculator, Clock, Search } from 'lucide-react';

export default function CollateralManager({ collaterals, alerts, loans, onAddCollateral }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [newForm, setNewForm] = useState({
    loan: '',
    collateral_type: 'VEHICLE',
    title_deed_or_reg_number: '',
    description: '',
    estimated_market_value: '',
    insurance_policy_number: '',
    insurance_expiry_date: '',
    valuation_expiry_date: '',
    document_url: ''
  });

  const [computedLtv, setComputedLtv] = useState(0);

  const handleValuationChange = (val, loanId) => {
    const marketVal = parseFloat(val) || 0;
    const selectedLoan = loans.find(l => String(l.id) === String(loanId));
    if (selectedLoan && marketVal > 0) {
      const ltv = (selectedLoan.principal_amount / marketVal) * 100;
      setComputedLtv(ltv.toFixed(1));
    } else {
      setComputedLtv(0);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onAddCollateral({
      ...newForm,
      estimated_market_value: parseFloat(newForm.estimated_market_value),
      forced_sale_value: parseFloat(newForm.estimated_market_value) * 0.75
    });
    setShowAddModal(false);
  };

  const filteredCollaterals = collaterals.filter(c => {
    const matchesSearch = c.title_deed_or_reg_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.borrower_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || c.verification_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const expiringCount = alerts?.expiring_insurance?.length || 0;
  const highLtvCount = alerts?.high_ltv_warnings?.length || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner & Alert Center */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/fkf-logo.png" alt="FKF Micro-Credit" style={{ height: '48px', width: 'auto', borderRadius: '8px' }} />
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>Dhamana za Mikopo na LTV Risk Engine</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Usajili wa Kadi za Magari, Hati za Viwanja/Nyumba, na Ufuatiliaji wa Bima za Dhamana Tanzania
            </p>
          </div>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus size={18} /> Saji Dhamana Mpya
        </button>
      </div>

      {/* Real-time Expiry & High LTV Alert Banners */}
      {(expiringCount > 0 || highLtvCount > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          
          {expiringCount > 0 && (
            <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <div style={{ background: '#F59E0B', color: '#000', padding: '0.4rem', borderRadius: '8px' }}>
                <Clock size={20} />
              </div>
              <div>
                <h4 style={{ color: '#FBBF24', fontSize: '0.95rem' }}>Bima Inayomalizika Muda ({expiringCount})</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Bima za dhamana zifuatazo zinakwisha muda ndani ya siku 30 au zimeshapatwa na wakati.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {alerts.expiring_insurance.map(item => (
                    <span key={item.id} className="badge badge-warning">
                      {item.title_deed_or_reg_number} (Exp: {item.insurance_expiry_date})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {highLtvCount > 0 && (
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <div style={{ background: '#EF4444', color: '#fff', padding: '0.4rem', borderRadius: '8px' }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 style={{ color: '#F87171', fontSize: '0.95rem' }}>Hatari ya LTV Kuvuka Kipimo ({highLtvCount})</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Dhamana zilizozidi kiwango salama cha LTV (&gt; 75%).
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {alerts.high_ltv_warnings.map(item => (
                    <span key={item.id} className="badge badge-danger">
                      {item.title_deed_or_reg_number} (LTV: {item.calculated_ltv_pct}%)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Tafuta kwa Hati ya Kiwanja, Namba ya Gari au Jina la Mkopaji..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
          />
        </div>

        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '0.5rem 1rem', background: '#0F172A', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
        >
          <option value="ALL">Hali Zote za Uhakiki</option>
          <option value="VERIFIED">Imehakikiwa kikamilifu</option>
          <option value="PENDING">Inasubiri Ukaguzi</option>
          <option value="EXPIRED">Bima Imekwisha</option>
          <option value="FLAGGED">Ina Shida / Risk Flagged</option>
        </select>
      </div>

      {/* Collateral Items Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Dhamana & Namba ya Usajili</th>
              <th>Mkopaji & Namba ya Mkopo</th>
              <th>Aina ya Dhamana</th>
              <th>Thamani ya Soko (TSH)</th>
              <th>LTV Ratio</th>
              <th>Namba ya Bima</th>
              <th>Tarehe ya Kuisha Bima</th>
              <th>Hali</th>
              <th>Kadi / Hati</th>
            </tr>
          </thead>
          <tbody>
            {filteredCollaterals.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: '700', color: '#fff' }}>{c.title_deed_or_reg_number}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.description?.slice(0, 45)}...</div>
                </td>
                <td>
                  <div style={{ fontWeight: '600' }}>{c.borrower_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{c.loan_number}</div>
                </td>
                <td>
                  <span className="badge badge-info">{c.collateral_type_display}</span>
                </td>
                <td style={{ fontWeight: '600', color: '#34D399' }}>
                  TSH {parseFloat(c.estimated_market_value).toLocaleString()}
                </td>
                <td>
                  <span className={`badge ${c.calculated_ltv_pct <= 70 ? 'badge-success' : (c.calculated_ltv_pct <= 80 ? 'badge-warning' : 'badge-danger')}`}>
                    {c.calculated_ltv_pct}% LTV
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem' }}>
                  {c.insurance_policy_number || 'N/A'}
                </td>
                <td style={{ fontSize: '0.85rem', color: new Date(c.insurance_expiry_date) < new Date() ? '#F87171' : 'inherit' }}>
                  {c.insurance_expiry_date || 'N/A'}
                </td>
                <td>
                  {c.verification_status === 'VERIFIED' && <span className="badge badge-success">Imethibitishwa</span>}
                  {c.verification_status === 'EXPIRED' && <span className="badge badge-danger">Bima Imekwisha</span>}
                  {c.verification_status === 'PENDING' && <span className="badge badge-warning">Inasubiri</span>}
                  {c.verification_status === 'FLAGGED' && <span className="badge badge-danger">Ina Shida</span>}
                </td>
                <td>
                  {c.document_url ? (
                    <a href="#" onClick={(e) => { e.preventDefault(); alert(`Inafungua Hati/Kadi PDF: ${c.document_url}`); }} style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
                      <FileText size={16} /> Angalia Hati
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Hakuna Hati</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Collateral Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>Sajili Dhamana Mpya ya Mkopo</h3>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chagua Mkopo Unaohusika</label>
                <select 
                  required
                  value={newForm.loan} 
                  onChange={(e) => {
                    setNewForm(p => ({ ...p, loan: e.target.value }));
                    handleValuationChange(newForm.estimated_market_value, e.target.value);
                  }}
                  style={{ width: '100%', padding: '0.6rem', background: '#0F172A', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
                >
                  <option value="">-- Chagua Mkopo Active --</option>
                  {loans.map(l => (
                    <option key={l.id} value={l.id}>{l.loan_number} - {l.borrower_detail?.first_name} {l.borrower_detail?.last_name} (TSH {parseFloat(l.principal_amount).toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aina ya Dhamana</label>
                  <select 
                    value={newForm.collateral_type} 
                    onChange={(e) => setNewForm(p => ({ ...p, collateral_type: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem', background: '#0F172A', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
                  >
                    <option value="VEHICLE">Chombo cha Usafiri / Gari (Kadi)</option>
                    <option value="LAND_TITLE">Hati ya Kiwanja / Shamba</option>
                    <option value="COMMERCIAL_PROPERTY">Jengo la Biashara</option>
                    <option value="EQUIPMENT">Mitambo / Mashine</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Namba ya Usajili / Hati</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Mfano: T 894 DZA au Hati No. 4821" 
                    value={newForm.title_deed_or_reg_number}
                    onChange={(e) => setNewForm(p => ({ ...p, title_deed_or_reg_number: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Thamani ya Soko (TSH)</label>
                <input 
                  type="number" 
                  required 
                  value={newForm.estimated_market_value}
                  onChange={(e) => {
                    setNewForm(p => ({ ...p, estimated_market_value: e.target.value }));
                    handleValuationChange(e.target.value, newForm.loan);
                  }}
                  style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              {computedLtv > 0 && (
                <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calculator size={16} /> Kiwango cha LTV Ratio:
                  </span>
                  <span style={{ fontWeight: '800', color: computedLtv <= 75 ? '#34D399' : '#F87171', fontSize: '1.1rem' }}>
                    {computedLtv}%
                  </span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Namba ya Bima</label>
                  <input 
                    type="text" 
                    value={newForm.insurance_policy_number}
                    onChange={(e) => setNewForm(p => ({ ...p, insurance_policy_number: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tarehe ya Kuisha Bima</label>
                  <input 
                    type="date" 
                    required 
                    value={newForm.insurance_expiry_date}
                    onChange={(e) => setNewForm(p => ({ ...p, insurance_expiry_date: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Ghairi</button>
                <button type="submit" className="btn-primary">Hifadhi Dhamana</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

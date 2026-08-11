import React, { useState } from 'react';
import { Edit3, X, Save, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function EditLoanModal({ loan, onClose, onSave }) {
  const [principalAmount, setPrincipalAmount] = useState(loan?.principal_amount || '');
  const [interestRate, setInterestRate] = useState(loan?.interest_rate_pct || '20');
  const [tenureMonths, setTenureMonths] = useState(loan?.tenure_months || '1');
  const [status, setStatus] = useState(loan?.status || 'DISBURSED');
  const [balanceRemaining, setBalanceRemaining] = useState(loan?.balance_remaining || '');
  const [loading, setLoading] = useState(false);

  if (!loan) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const p = parseFloat(principalAmount || 0);
      const r = parseFloat(interestRate || 0);
      const totalPayable = p + (p * (r / 100));

      await onSave(loan.id, {
        principal_amount: p,
        interest_rate_pct: r,
        tenure_months: parseInt(tenureMonths, 10),
        status: status,
        total_payable: totalPayable,
        balance_remaining: balanceRemaining !== '' ? parseFloat(balanceRemaining) : totalPayable
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Hitilafu kutokea wakati wa kubadilisha mkopo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '520px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', overflow: 'hidden' }}>
        
        <div style={{ background: '#1E293B', color: '#FFFFFF', padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit3 size={20} color="#D4AF37" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Edit Mkopo LN-TZ-{loan.id}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B8860B', fontSize: '0.82rem' }}>
            <ShieldCheck size={16} />
            <span>Kipengele hiki kinaruhusiwa kwa Meneja wa Tawi na Super Admin. Uidhinishaji wa Mwisho unafanywa na Super Admin.</span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Kiasi cha Mkopo (Principal Amount TSH)</label>
            <input 
              type="number" 
              value={principalAmount} 
              onChange={(e) => setPrincipalAmount(e.target.value)} 
              required
              style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '800', color: '#0F172A' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Riba (%)</label>
              <input 
                type="number" 
                value={interestRate} 
                onChange={(e) => setInterestRate(e.target.value)} 
                required
                style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '800', color: '#0F172A' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Muda (Miezi)</label>
              <input 
                type="number" 
                value={tenureMonths} 
                onChange={(e) => setTenureMonths(e.target.value)} 
                required
                style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '800', color: '#0F172A' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Salio Linalobaki (Balance Remaining TSH)</label>
            <input 
              type="number" 
              value={balanceRemaining} 
              onChange={(e) => setBalanceRemaining(e.target.value)} 
              required
              style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '800', color: '#DC2626' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Hali ya Mkopo (Status)</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '700', color: '#0F172A' }}
            >
              <option value="PENDING_BRANCH_APPROVAL">PENDING_BRANCH_APPROVAL</option>
              <option value="PENDING_RISK_REVIEW">PENDING_RISK_REVIEW</option>
              <option value="APPROVED">APPROVED</option>
              <option value="DISBURSED">DISBURSED</option>
              <option value="REPAID">REPAID</option>
              <option value="DEFAULTED">DEFAULTED</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              Ghairi
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#059669' }}>
              <Save size={16} /> {loading ? 'Inahifadhi...' : 'Hifadhi Mabadiliko'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

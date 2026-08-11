import React, { useState } from 'react';
import { RefreshCw, X, CheckCircle2, Wallet, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function RenewLoanModal({ loan, onClose, onRenew }) {
  const [interestAmount, setInterestAmount] = useState(() => {
    if (!loan) return '0';
    const p = parseFloat(loan.principal_amount || 0);
    const r = parseFloat(loan.interest_rate_pct || 20);
    return (p * (r / 100)).toString();
  });
  const [paymentMethod, setPaymentMethod] = useState('MPESA');
  const [referenceNumber, setReferenceNumber] = useState(`RNW-TZ-${Math.floor(Math.random() * 900000 + 100000)}`);
  const [loading, setLoading] = useState(false);

  if (!loan) return null;

  const borrowerName = loan.borrower_detail ? `${loan.borrower_detail.first_name} ${loan.borrower_detail.last_name}` : `Mkopaji #${loan.borrower}`;
  const principal = parseFloat(loan.principal_amount || 0);
  const rate = parseFloat(loan.interest_rate_pct || 20);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onRenew(loan.id, {
        interest_paid: parseFloat(interestAmount),
        payment_method: paymentMethod,
        reference_number: referenceNumber
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Imeshindwa kurenew mkopo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '540px', background: '#FFFFFF', borderRadius: '24px', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', overflow: 'hidden' }}>
        
        {/* HEADER */}
        <div style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#FFFFFF', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <RefreshCw size={22} color="#FDE68A" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900' }}>Renew Mkopo LN-TZ-{loan.id}</h3>
              <span style={{ fontSize: '0.78rem', color: '#A7F3D0' }}>{borrowerName}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '1rem', color: '#065F46', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: '800', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} color="#059669" /> Jinsi Renewal Inavyofanya Kazi:
            </div>
            <span>Mteja analipa **Riba ya Mkopo pekee** (TZS {parseFloat(interestAmount).toLocaleString()}). Baada ya malipo haya, mkopo utaongezewa muda wa mwezi mwingine upya na salio litarudi mwanzo bila mteja kuomba mkopo mpya!</span>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Kiasi cha Mkopo (Principal)</span>
              <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A' }}>TZS {principal.toLocaleString()}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Kiwango cha Riba</span>
              <div style={{ fontSize: '1rem', fontWeight: '900', color: '#B8860B' }}>{rate}% ({loan.tenure_months} Miezi)</div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>
              Kiasi cha Riba kinacholipwa sasa (TSH)
            </label>
            <input 
              type="number" 
              value={interestAmount} 
              onChange={(e) => setInterestAmount(e.target.value)} 
              required
              style={{ width: '100%', padding: '0.7rem', border: '2px solid #059669', borderRadius: '10px', fontWeight: '900', color: '#059669', fontSize: '1.1rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Njia ya Malipo</label>
              <select 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '700', color: '#0F172A' }}
              >
                <option value="MPESA">M-Pesa Paybill (903012)</option>
                <option value="BANK_TRANSFER">Bank (NMB / CRDB)</option>
                <option value="CASH">Cash Counter (Tawi)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Kumbukumbu Namba (Ref)</label>
              <input 
                type="text" 
                value={referenceNumber} 
                onChange={(e) => setReferenceNumber(e.target.value)} 
                required
                style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '700', color: '#0F172A' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              Ghairi
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#059669', padding: '0.75rem' }}>
              <RefreshCw size={18} /> {loading ? 'Inaprocess...' : '🔄 Renew Mkopo Sasa'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

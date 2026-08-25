import React, { useState } from 'react';
import { Layers, Save, X, CheckCircle2, DollarSign } from 'lucide-react';

export default function BulkRepaymentModal({ loans, onClose, onRecordRepayment }) {
  const activeLoans = loans.filter(l => l.status === 'DISBURSED');
  const [entries, setEntries] = useState(
    activeLoans.slice(0, 5).map(l => ({
      loanId: l.id,
      borrowerName: l.borrower_detail ? `${l.borrower_detail.first_name} ${l.borrower_detail.last_name}` : `Loan #${l.id}`,
      amount: Math.round(parseFloat(l.total_payable || 0) / (l.tenure_months || 6)),
      channel: 'MPESA'
    }))
  );

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleAmountChange = (index, val) => {
    setEntries(prev => {
      const copy = [...prev];
      copy[index].amount = val;
      return copy;
    });
  };

  const handleChannelChange = (index, val) => {
    setEntries(prev => {
      const copy = [...prev];
      copy[index].channel = val;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      for (const entry of entries) {
        if (entry.amount > 0) {
          await onRecordRepayment({
            loan: entry.loanId,
            amount_paid: parseFloat(entry.amount),
            channel: entry.channel
          });
        }
      }
      setSuccessMsg('Marejesho ya Kikundi (Bulk Repayments) yamehifadhiwa kikamilifu!');
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: '#7C3AED', color: '#FFFFFF', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Add Bulk Repayments (Marejesho ya Pamoja / Kikundi)</h3>
              <p style={{ fontSize: '0.82rem', color: '#334155', margin: '0.15rem 0 0 0', fontWeight: '700' }}>Ingiza marejesho ya wakopaji wengi kwa mara moja</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#0F172A', cursor: 'pointer', borderRadius: '8px', padding: '0.35rem', display: 'flex', alignItems: 'center' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {successMsg && (
            <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', padding: '0.85rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800', textAlign: 'center' }}>
              {successMsg}
            </div>
          )}

          <table className="custom-table" style={{ width: '100%', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#F1F5F9' }}>
                <th style={{ color: '#0F172A' }}>Namba ya Mkopo</th>
                <th style={{ color: '#0F172A' }}>Mkopaji</th>
                <th style={{ color: '#0F172A' }}>Kiasi cha Rejesho (TSH)</th>
                <th style={{ color: '#0F172A' }}>Njia ya Malipo</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={entry.loanId}>
                  <td style={{ fontWeight: '800', color: '#D4AF37' }}>LN-TZ-{entry.loanId}</td>
                  <td style={{ fontWeight: '700', color: '#0F172A' }}>{entry.borrowerName}</td>
                  <td>
                    <input 
                      type="number" 
                      value={entry.amount} 
                      onChange={(e) => handleAmountChange(idx, e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', color: '#059669' }}
                    />
                  </td>
                  <td>
                    <select 
                      value={entry.channel} 
                      onChange={(e) => handleChannelChange(idx, e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem' }}
                    >
                      <option value="MPESA">M-Pesa / Mobile</option>
                      <option value="BANK_TRANSFER">Bank Deposit</option>
                      <option value="CASH">Cash Counter</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.65rem 1.2rem' }}>
              Ghairi
            </button>
            <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '0.65rem 1.5rem', background: '#7C3AED' }}>
              <Save size={16} /> {saving ? 'Inahifadhi Marejesho...' : 'Hifadhi Marejesho Yote'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { FilePlus, X, AlertCircle, DollarSign, Calendar, RefreshCw } from 'lucide-react';

export default function LoanApplicationModal({ borrowers, branches, loanProducts, onClose, onSubmit }) {
  const [borrowerId, setBorrowerId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [productId, setProductId] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [termMonths, setTermMonths] = useState(6);
  const [repaymentFrequency, setRepaymentFrequency] = useState('MONTHLY');
  const [fieldComment, setFieldComment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const branchProducts = (loanProducts || []).filter(p => !p.branch || String(p.branch) === String(branchId) || String(p.branch_id) === String(branchId));
  const selectedBranch = (branches || []).find(b => String(b.id) === String(branchId));

  const handleProductSelect = (e) => {
    const pId = e.target.value;
    setProductId(pId);
    const prod = (loanProducts || []).find(p => String(p.id) === String(pId));
    if (prod) {
      if (prod.max_amount) setPrincipalAmount(prod.max_amount);
      if (prod.repayment_frequency) {
        const freq = prod.repayment_frequency.toUpperCase();
        if (freq.includes('DAY') || freq.includes('SIKU')) setRepaymentFrequency('DAILY');
        else if (freq.includes('WEEK') || freq.includes('WIKI')) setRepaymentFrequency('WEEKLY');
        else setRepaymentFrequency('MONTHLY');
      }
    }
  };

  const handleBorrowerSelect = (e) => {
    const bId = e.target.value;
    setBorrowerId(bId);
    const bw = borrowers.find(b => String(b.id) === String(bId));
    if (bw && bw.branch) {
      setBranchId(bw.branch);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const amt = parseFloat(principalAmount);

    if (!fieldComment.trim()) {
      setErrorMsg('Ni LAZIMA kuandika maoni halisi ya ukaguzi wa nyanjani (Live Field Comment) kabla ya kuwasilisha ombi la mkopo.');
      return;
    }

    if (selectedBranch && amt > parseFloat(selectedBranch.max_loan_amount)) {
      setErrorMsg(`Kiasi cha mkopo TSH ${amt.toLocaleString()} kinazidi ukomo wa tawi la TSH ${parseFloat(selectedBranch.max_loan_amount).toLocaleString()}`);
      return;
    }

    onSubmit({
      borrower: borrowerId,
      branch: branchId,
      principal_amount: amt,
      term_months: parseInt(termMonths, 10),
      repayment_frequency: repaymentFrequency,
      field_comment: fieldComment,
      interest_rate_pct: selectedBranch ? parseFloat(selectedBranch.interest_rate_pct) : 14.5,
      penalty_type: selectedBranch ? selectedBranch.penalty_type : 'PERCENTAGE',
      penalty_value: selectedBranch ? parseFloat(selectedBranch.penalty_value) : 5.0,
      status: 'PENDING_RISK_REVIEW'
    });

    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '600px', padding: '1.75rem', border: '1.5px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)' }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/fkf-logo.png" alt="FKF Micro-Credit" style={{ height: '38px', width: 'auto', borderRadius: '6px' }} />
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                Ombi Jipya la Mkopo (New Loan Application)
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>
                Wasilisha ombi la mkopo kwa Mkopaji aliyesajiliwa
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', color: '#64748B', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5', color: '#DC2626', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '800' }}>
            <AlertCircle size={18} color="#DC2626" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>
              Mkopaji (Client / Borrower) *
            </label>
            <select 
              required
              value={borrowerId}
              onChange={handleBorrowerSelect}
              style={{ width: '100%', padding: '0.68rem 0.85rem', background: '#FFFFFF', border: '1.5px solid #94A3B8', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', fontWeight: '800' }}
            >
              <option value="">-- Chagua Mkopaji --</option>
              {borrowers.map(b => (
                <option key={b.id} value={b.id}>{b.first_name} {b.last_name} (NIDA: {b.id_number}) - Tawi: {b.branch_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>
              Tawi Linalotoa Mkopo *
            </label>
            <select 
              required
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              style={{ width: '100%', padding: '0.68rem 0.85rem', background: '#FFFFFF', border: '1.5px solid #94A3B8', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', fontWeight: '800' }}
            >
              <option value="">-- Chagua Tawi la Tanzania --</option>
              {branches.map(br => (
                <option key={br.id} value={br.id}>{br.name} (Max Limit: TSH {parseFloat(br.max_loan_amount).toLocaleString()} @ {br.interest_rate_pct}%)</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>
              Bidhaa ya Mkopo (Loan Product - {selectedBranch ? `Tawi la ${selectedBranch.name}` : 'Super Admin Approved'}) *
            </label>
            <select 
              required
              value={productId}
              onChange={handleProductSelect}
              style={{ width: '100%', padding: '0.68rem 0.85rem', background: '#FFFFFF', border: '1.5px solid #94A3B8', borderRadius: '10px', fontSize: '0.9rem', color: '#047857', fontWeight: '800' }}
            >
              <option value="">
                {selectedBranch ? `-- Chagua Product ya Mkopo (Tawi la ${selectedBranch.name}) --` : '-- Chagua Tawi Kwanza au Product --'}
              </option>
              {branchProducts.length > 0 ? (
                branchProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.product_name} ({p.product_code}) - Max TSH {parseFloat(p.max_amount || 0).toLocaleString()} @ {p.interest_rate_pct}%
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  -- Hakuna Bidhaa ya Mkopo Iliyosajiliwa kwa Tawi Hili ({selectedBranch?.name || 'Tawi Hili'}) --
                </option>
              )}
            </select>
          </div>

          {selectedBranch && (
            <div style={{ background: '#EFF6FF', padding: '0.85rem 1rem', borderRadius: '10px', border: '1.5px solid #BFDBFE', fontSize: '0.85rem', color: '#0F172A', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div>Riba ya Tawi: <strong style={{ color: '#1D4ED8', fontWeight: '900' }}>{selectedBranch.interest_rate_pct}% per term</strong></div>
              <div>Kanuni ya Faini: <strong style={{ color: '#B8860B', fontWeight: '900' }}>{selectedBranch.penalty_type} ({selectedBranch.penalty_value})</strong></div>
              <div>Ukomo wa Mkopo: <strong style={{ color: '#059669', fontWeight: '900' }}>TSH {parseFloat(selectedBranch.max_loan_amount).toLocaleString()}</strong></div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>
              Kiasi cha Mkopo (TSH) *
            </label>
            <input 
              type="number" 
              required
              step="50000"
              value={principalAmount}
              onChange={(e) => setPrincipalAmount(e.target.value)}
              placeholder="Mfano: 2500000"
              style={{ width: '100%', padding: '0.68rem 0.85rem', background: '#FFFFFF', border: '1.5px solid #94A3B8', borderRadius: '10px', fontSize: '0.9rem', color: '#059669', fontWeight: '900' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>
              Mzunguko wa Marejesho (Repayment Frequency) *
            </label>
            <select 
              value={repaymentFrequency}
              onChange={(e) => setRepaymentFrequency(e.target.value)}
              style={{ width: '100%', padding: '0.68rem 0.85rem', background: '#FFFFFF', border: '1.5px solid #94A3B8', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', fontWeight: '800' }}
            >
              <option value="DAILY">☀️ Kila Siku (Daily Repayment)</option>
              <option value="WEEKLY">📅 Kila Wiki (Weekly Repayment)</option>
              <option value="MONTHLY">📆 Kila Mwezi (Monthly Repayment)</option>
            </select>
          </div>

          <div style={{ background: '#F8FAFC', border: '1.5px solid #0284C7', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '900', color: '#0F172A' }}>
              💬 Maoni ya Ukaguzi wa Nyanjani (Live Field Comment - MANDATORY / LAZIMA) *
            </label>
            <textarea 
              required
              rows={3}
              value={fieldComment}
              onChange={(e) => setFieldComment(e.target.value)}
              placeholder="Andika maoni yako ya ukaguzi wa nyanjani hapa (mfano: Nimefika duka la mkopaji Kariakoo Mtaa wa Swahili, biashara ipo active, nyumba na dhamana zimehakikiwa...)"
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem', color: '#0F172A', fontWeight: '700' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: '800' }}>
              * Ombi la mkopo halitakubaliwa bila maoni halisi ya ukaguzi wa nyanjani.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ background: '#F8FAFC', border: '1.5px solid #94A3B8', color: '#0F172A', padding: '0.65rem 1.35rem', fontWeight: '800', borderRadius: '10px' }}>
              Ghairi
            </button>
            <button type="submit" style={{ background: '#059669', color: '#FFFFFF', border: '1px solid #047857', padding: '0.65rem 1.6rem', fontWeight: '900', fontSize: '0.92rem', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)' }}>
              Wasilisha Ombi
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

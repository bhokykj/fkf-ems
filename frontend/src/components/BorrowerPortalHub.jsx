import React, { useState, useMemo } from 'react';
import { 
  Wallet, FileText, CheckCircle2, AlertCircle, Clock, Plus, Printer, 
  DollarSign, ArrowUpRight, Calendar, Building2, User, Phone, ShieldCheck, 
  Sparkles, RefreshCw, Calculator, FileCheck, Layers, CreditCard, Send, CheckCheck, Landmark, Smartphone
} from 'lucide-react';
import CompanyHeaderBlock from './CompanyHeaderBlock';
import RenewLoanModal from './RenewLoanModal';

export default function BorrowerPortalHub({ currentUser, loans, borrowers, branches, onApplyLoan, onOpenCalculator, onRenewLoan }) {
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'my_loans' | 'payments' | 'schedule' | 'how_to_pay' | 'apply'
  const [renewLoanTarget, setRenewLoanTarget] = useState(null);
  const [selectedScheduleLoanId, setSelectedScheduleLoanId] = useState(null);

  // Application Form State
  const [applyAmount, setApplyAmount] = useState(500000);
  const [applyTermMonths, setApplyTermMonths] = useState(6);
  const [applyFrequency, setApplyFrequency] = useState('MONTHLY');
  const [applyPurpose, setApplyPurpose] = useState('');
  const [applyCollateral, setApplyCollateral] = useState('');
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applySuccessMsg, setApplySuccessMsg] = useState('');
  const [applyErrorMsg, setApplyErrorMsg] = useState('');

  // Payment Confirmation Form State
  const [txCode, setTxCode] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txMethod, setTxMethod] = useState('M-PESA');
  const [txSubmitting, setTxSubmitting] = useState(false);
  const [txSuccessMsg, setTxSuccessMsg] = useState('');

  // Find borrower profile matching currentUser
  const currentBorrower = borrowers.find(b => String(b.id) === String(currentUser?.borrower_id)) || 
                          borrowers.find(b => b.phone && currentUser?.phone_number && b.phone.includes(currentUser.phone_number.slice(-8))) ||
                          borrowers[0];

  // Filter loans for this borrower
  const myLoans = loans.filter(l => String(l.borrower) === String(currentBorrower?.id) || String(l.borrower_detail?.id) === String(currentBorrower?.id));
  
  // Find active loan or selected schedule loan
  const activeLoan = myLoans.find(l => l.status === 'DISBURSED' || l.status === 'PARTIALLY_PAID') || myLoans[0];
  const activeScheduleLoan = useMemo(() => {
    if (selectedScheduleLoanId) {
      const found = myLoans.find(l => String(l.id) === String(selectedScheduleLoanId));
      if (found) return found;
    }
    return activeLoan;
  }, [myLoans, selectedScheduleLoanId, activeLoan]);

  // Check if borrower has any active/pending loan (not rejected, not repaid)
  const hasActiveLoan = myLoans.some(l => !['REPAID', 'BRANCH_REJECTED', 'RISK_FAILED', 'REJECTED'].includes(l.status));
  // Clients are blocked if they have an active loan. Staff (Loan Officer, Manager, Admin) can still apply on their behalf.
  const canApply = !hasActiveLoan || (currentUser?.role && currentUser.role !== 'BORROWER');

  // Extract all repayments for this borrower
  const myRepayments = [];
  myLoans.forEach(loan => {
    if (loan.repayments && Array.isArray(loan.repayments)) {
      loan.repayments.forEach(r => {
        myRepayments.push({ ...r, loan_id: loan.id, loan_code: `LN-${loan.id}` });
      });
    }
  });

  // Calculate totals
  const totalLoanPayable = myLoans.reduce((acc, l) => acc + (parseFloat(l.total_payable || 0)), 0);
  const totalBalanceRemaining = myLoans.reduce((acc, l) => acc + (parseFloat(l.balance_remaining || 0)), 0);
  const totalRepaidAmount = Math.max(0, totalLoanPayable - totalBalanceRemaining);
  const repaymentPercentage = totalLoanPayable > 0 ? Math.min(100, Math.round((totalRepaidAmount / totalLoanPayable) * 100)) : 0;

  // DYNAMIC REPAYMENT SCHEDULE FOR SELECTED LOAN
  const loanSchedule = useMemo(() => {
    if (!activeScheduleLoan) return [];
    
    const principal = parseFloat(activeScheduleLoan.principal_amount || 0);
    const interestRate = parseFloat(activeScheduleLoan.interest_rate_pct || 0);
    const totalInterest = (principal * interestRate) / 100;
    const totalPayable = parseFloat(activeScheduleLoan.total_payable || (principal + totalInterest));
    const frequency = String(activeScheduleLoan.repayment_frequency || 'MONTHLY').toUpperCase();
    const termMonths = parseInt(activeScheduleLoan.tenure_months || activeScheduleLoan.term_months || 1, 10);

    let totalInstallments = termMonths;
    let daysStep = 30;

    if (frequency.includes('DAILY') || frequency.includes('SIKU')) {
      totalInstallments = termMonths * 30;
      daysStep = 1;
    } else if (frequency.includes('WEEKLY') || frequency.includes('WIKI')) {
      totalInstallments = termMonths * 4;
      daysStep = 7;
    } else {
      totalInstallments = termMonths;
      daysStep = 30;
    }

    const installmentAmount = totalInstallments > 0 ? totalPayable / totalInstallments : totalPayable;
    const principalPart = totalInstallments > 0 ? principal / totalInstallments : principal;
    const interestPart = totalInstallments > 0 ? totalInterest / totalInstallments : totalInterest;

    const rows = [];
    let remBal = totalPayable;
    const startDate = new Date(activeScheduleLoan.disbursed_at || activeScheduleLoan.created_at || Date.now());

    // Repaid amount for this loan
    const loanRepaid = activeScheduleLoan.repayments
      ? activeScheduleLoan.repayments.reduce((acc, r) => acc + parseFloat(r.amount_paid || 0), 0)
      : 0;

    for (let i = 1; i <= totalInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + (i * daysStep));
      remBal = Math.max(0, remBal - installmentAmount);

      rows.push({
        installment_no: i,
        due_date: dueDate.toLocaleDateString('sw-TZ', { day: '2-digit', month: 'short', year: 'numeric' }),
        installment_amount: installmentAmount,
        interest_part: interestPart,
        principal_part: principalPart,
        remaining_balance: remBal,
        is_paid: i <= Math.floor((loanRepaid / totalPayable) * totalInstallments)
      });
    }

    return rows;
  }, [activeScheduleLoan]);

  const handleSelfApplySubmit = async (e) => {
    e.preventDefault();
    setApplySubmitting(true);
    setApplySuccessMsg('');
    setApplyErrorMsg('');

    try {
      if (!currentBorrower) {
        throw new Error('Hujatambulishwa kwenye mfumo kama mkopaji halali.');
      }
      
      if (!canApply) {
        throw new Error('Hairuhusiwi kuomba mkopo mpya ukiwa bado una mkopo ambao haujakamilika.');
      }

      await onApplyLoan({
        borrower: currentBorrower.id,
        branch: currentBorrower.branch || (branches && branches[0]?.id),
        principal_amount: parseFloat(applyAmount),
        term_months: parseInt(applyTermMonths, 10),
        repayment_frequency: applyFrequency,
        loan_purpose: applyPurpose,
        collateral_notes: applyCollateral,
        interest_rate_pct: 15.0,
        status: 'PENDING_RISK_REVIEW'
      });

      setApplySuccessMsg('Ombi lako la mkopo limewasilishwa kikamilifu! Afisa wetu wa Mkopo atakupigia simu mara moja kuuhakiki.');
      setTimeout(() => {
        setActiveSubTab('my_loans');
      }, 2000);
    } catch (err) {
      setApplyErrorMsg(err?.message || 'Imeshindwa kuwasilisha ombi la mkopo.');
    } finally {
      setApplySubmitting(false);
    }
  };

  const handleTxSubmit = (e) => {
    e.preventDefault();
    setTxSubmitting(true);
    setTimeout(() => {
      setTxSubmitting(false);
      setTxSuccessMsg(`Taarifa za muamala (${txCode}) za TSH ${parseFloat(txAmount || 0).toLocaleString()} zimetumwa kikamilifu kwa Afisa wa Mkopo kuuhakiki!`);
      setTxCode('');
      setTxAmount('');
    }, 1000);
  };

  const handlePrintSchedule = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      
      {/* WELCOME PORTAL HEADER BANNER */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF', borderRadius: '24px', padding: '1.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.4)', position: 'relative', overflow: 'hidden' }}>
        
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', zIndex: 1 }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #1E293B, #0F172A)', border: '3px solid #D4AF37', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 0 4px rgba(212,175,55,0.25), 0 8px 20px rgba(0,0,0,0.4)' }}>
            {(currentBorrower?.photo_url || currentUser?.passport_photo) ? (
              <img
                src={currentBorrower?.photo_url || currentUser?.passport_photo}
                alt={currentBorrower?.first_name || currentUser?.first_name || 'Mteja'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div style={{ width: '100%', height: '100%', display: (currentBorrower?.photo_url || currentUser?.passport_photo) ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1E293B, #0F172A)' }}>
              <User size={34} color="#D4AF37" />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                Habari, {currentBorrower ? `${currentBorrower.first_name} ${currentBorrower.last_name}` : (currentUser?.first_name || 'Mteja')}! 👋
              </h2>
              <span className="badge badge-success" style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}>
                <ShieldCheck size={13} /> Mteja Aliyehakikiwa (NIDA)
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: '0.25rem 0 0 0' }}>
              Portal Rasmi ya Mkopaji | Tawi: <strong>{currentBorrower?.branch_name || 'Dar es Salaam'}</strong> | NIDA: <strong>{currentBorrower?.id_number || 'Verifying'}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
          <button onClick={onOpenCalculator} style={{ background: '#FEF3C7', border: '1px solid #FCD34D', color: '#B8860B', padding: '0.65rem 1.1rem', borderRadius: '12px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={17} color="#B8860B" /> Kikokotoo cha Mkopo
          </button>

          {canApply ? (
            <button onClick={() => setActiveSubTab('apply')} style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#FFFFFF', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '12px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)' }}>
              <Plus size={18} /> Omba Mkopo Mpya
            </button>
          ) : (
            <button disabled style={{ background: '#E2E8F0', color: '#94A3B8', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '12px', fontWeight: '900', fontSize: '0.88rem', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} /> Kamilisha Mkopo Wako
            </button>
          )}
        </div>

      </div>

      {/* PORTAL NAVIGATION PILLS */}
      <div style={{ display: 'flex', gap: '0.65rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveSubTab('overview')}
          style={{ padding: '0.65rem 1.1rem', borderRadius: '12px', border: activeSubTab === 'overview' ? '2px solid #0F172A' : '1px solid #CBD5E1', background: activeSubTab === 'overview' ? '#0F172A' : '#FFFFFF', color: activeSubTab === 'overview' ? '#D4AF37' : '#475569', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Wallet size={16} /> 📋 Dashboard ya Mteja
        </button>

        <button 
          onClick={() => setActiveSubTab('schedule')}
          style={{ padding: '0.65rem 1.1rem', borderRadius: '12px', border: activeSubTab === 'schedule' ? '2px solid #0284C7' : '1px solid #CBD5E1', background: activeSubTab === 'schedule' ? '#0284C7' : '#FFFFFF', color: activeSubTab === 'schedule' ? '#FFFFFF' : '#475569', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Calendar size={16} /> 📅 Ratiba ya Marejesho (Repayment Schedule)
        </button>

        <button 
          onClick={() => setActiveSubTab('how_to_pay')}
          style={{ padding: '0.65rem 1.1rem', borderRadius: '12px', border: activeSubTab === 'how_to_pay' ? '2px solid #B8860B' : '1px solid #CBD5E1', background: activeSubTab === 'how_to_pay' ? '#FEF3C7' : '#FFFFFF', color: activeSubTab === 'how_to_pay' ? '#B8860B' : '#475569', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <CreditCard size={16} color="#B8860B" /> 💳 Namna ya Kulipa Moja kwa Moja
        </button>

        <button 
          onClick={() => setActiveSubTab('my_loans')}
          style={{ padding: '0.65rem 1.1rem', borderRadius: '12px', border: activeSubTab === 'my_loans' ? '2px solid #0F172A' : '1px solid #CBD5E1', background: activeSubTab === 'my_loans' ? '#0F172A' : '#FFFFFF', color: activeSubTab === 'my_loans' ? '#D4AF37' : '#475569', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <FileText size={16} /> 📄 Mikopo Yangu ({myLoans.length})
        </button>

        <button 
          onClick={() => setActiveSubTab('payments')}
          style={{ padding: '0.65rem 1.1rem', borderRadius: '12px', border: activeSubTab === 'payments' ? '2px solid #0F172A' : '1px solid #CBD5E1', background: activeSubTab === 'payments' ? '#0F172A' : '#FFFFFF', color: activeSubTab === 'payments' ? '#D4AF37' : '#475569', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <CreditCard size={16} /> 🧾 Risiti za Malipo ({myRepayments.length})
        </button>

        {canApply && (
          <button 
            onClick={() => setActiveSubTab('apply')}
            style={{ padding: '0.65rem 1.1rem', borderRadius: '12px', border: activeSubTab === 'apply' ? '2px solid #059669' : '1px solid #CBD5E1', background: activeSubTab === 'apply' ? '#ECFDF5' : '#FFFFFF', color: activeSubTab === 'apply' ? '#047857' : '#475569', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} color="#059669" /> ➕ Omba Mkopo Mpya
          </button>
        )}
      </div>

      {/* SUB-TAB 1: OVERVIEW DASHBOARD */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* TOP METRIC CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            
            <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderLeft: '5px solid #DC2626', borderRadius: '18px', padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)' }}>
              <span style={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: '900', textTransform: 'uppercase' }}>Salio la Mkopo Unaodaiwa:</span>
              <strong style={{ fontSize: '1.65rem', fontWeight: '900', color: '#DC2626' }}>
                TZS {Math.round(totalBalanceRemaining).toLocaleString()}
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#7F1D1D', fontWeight: '800' }}>Jumla ya Salio linalobaki</span>
            </div>

            <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderLeft: '5px solid #059669', borderRadius: '18px', padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)' }}>
              <span style={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: '900', textTransform: 'uppercase' }}>Jumla Uliyokwisha Rejesha:</span>
              <strong style={{ fontSize: '1.65rem', fontWeight: '900', color: '#059669' }}>
                TZS {Math.round(totalRepaidAmount).toLocaleString()}
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#047857', fontWeight: '800' }}>{repaymentPercentage}% Umerejesha Tayari</span>
            </div>

            <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderLeft: '5px solid #0F172A', borderRadius: '18px', padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)' }}>
              <span style={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: '900', textTransform: 'uppercase' }}>Jumla ya Mkopo Wako:</span>
              <strong style={{ fontSize: '1.65rem', fontWeight: '900', color: '#0F172A' }}>
                TZS {Math.round(totalLoanPayable).toLocaleString()}
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: '800' }}>Mtaji + Riba ya Mkopo</span>
            </div>

            <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderLeft: '5px solid #0284C7', borderRadius: '18px', padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)' }}>
              <span style={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: '900', textTransform: 'uppercase' }}>Hali ya Mikopo Yako:</span>
              <strong style={{ fontSize: '1.25rem', fontWeight: '900', color: activeLoan ? '#047857' : '#B45309' }}>
                {activeLoan ? activeLoan.status_display || activeLoan.status : 'Hakuna Mkopo Active'}
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#0369A1', fontWeight: '800' }}>{myLoans.length} Idadi ya Mikopo Jumla</span>
            </div>

          </div>

          {/* QUICK PAYMENT CALLOUT CARD */}
          <div style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', border: '1px solid #FCD34D', borderRadius: '20px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: '#B8860B', color: '#FFFFFF', padding: '0.75rem', borderRadius: '14px' }}>
                <Smartphone size={28} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#78350F', margin: 0 }}>
                  Je, unahitaji kulipa rejesho lako kwa simu (M-Pesa / Tigo Pesa / Benki)?
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#92400E', margin: '0.2rem 0 0 0' }}>
                  Lipa kwa Lipa Namba <strong>903012</strong> (Reference: <strong>{currentBorrower?.phone || currentBorrower?.id_number}</strong>) au NMB Acc <strong>20110034892</strong>.
                </p>
              </div>
            </div>
            <button onClick={() => setActiveSubTab('how_to_pay')} style={{ background: '#78350F', color: '#FFFFFF', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} /> Tazama Namna ya Kulipa
            </button>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: REPAYMENT SCHEDULE (RATIBA YA MAREJESHO) */}
      {activeSubTab === 'schedule' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                📅 Ratiba Rasmi ya Marejesho (Repayment Schedule)
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                Mkopo #: <strong>LN-#{activeScheduleLoan?.id || 'Active'}</strong> | Kiasi cha Mkopo: <strong>TZS {parseFloat(activeScheduleLoan?.principal_amount || 0).toLocaleString()}</strong> | Riba: <strong>{activeScheduleLoan?.interest_rate_pct}%</strong> | Mzunguko: <strong>{activeScheduleLoan?.repayment_frequency || 'MONTHLY'}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <select 
                value={activeScheduleLoan?.id || ''} 
                onChange={(e) => setSelectedScheduleLoanId(e.target.value)}
                style={{ padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #0284C7', fontWeight: '800', background: '#F0F9FF', color: '#0369A1', fontSize: '0.82rem' }}
              >
                {myLoans.map(l => (
                  <option key={l.id} value={l.id}>
                    LN-#{l.id} - TZS {parseFloat(l.principal_amount || 0).toLocaleString()} ({l.repayment_frequency || 'MONTHLY'})
                  </option>
                ))}
              </select>

              <button onClick={handlePrintSchedule} className="btn-primary" style={{ padding: '0.55rem 1.1rem', background: '#059669' }}>
                <Printer size={16} /> Print Ratiba Hii
              </button>
            </div>
          </div>

          <div id="printable-borrower-schedule">
            <CompanyHeaderBlock 
              title="RATIBA YA REJESHO LA MKOPO WA MTEJA" 
              subtitle={`Mkopaji: ${currentBorrower?.first_name} ${currentBorrower?.last_name} | NIDA: ${currentBorrower?.id_number} | Simu: ${currentBorrower?.phone}`}
            />

            <table className="custom-table" style={{ width: '100%', fontSize: '0.85rem', marginTop: '1rem' }}>
              <thead>
                <tr style={{ background: '#F1F5F9' }}>
                  <th style={{ color: '#0F172A' }}>Rejesho #</th>
                  <th style={{ color: '#0F172A' }}>Tarehe ya Rejesho</th>
                  <th style={{ color: '#0F172A' }}>Kiasi cha Rejesho (TZS)</th>
                  <th style={{ color: '#0F172A' }}>Sehemu ya Riba (TZS)</th>
                  <th style={{ color: '#0F172A' }}>Sehemu ya Mtaji (TZS)</th>
                  <th style={{ color: '#0F172A' }}>Salio Linalobaki (TZS)</th>
                  <th style={{ color: '#0F172A' }}>Hali ya Rejesho</th>
                </tr>
              </thead>
              <tbody>
                {loanSchedule.map(row => (
                  <tr key={row.installment_no} style={{ background: row.is_paid ? '#ECFDF5' : '#FFFFFF' }}>
                    <td style={{ fontWeight: '800', color: '#0F172A' }}>Awamu ya {row.installment_no}</td>
                    <td style={{ color: '#475569' }}>{row.due_date}</td>
                    <td style={{ fontWeight: '900', color: '#059669' }}>TZS {Math.round(row.installment_amount).toLocaleString()}</td>
                    <td style={{ color: '#B8860B', fontWeight: '700' }}>TZS {Math.round(row.interest_part).toLocaleString()}</td>
                    <td style={{ color: '#0F172A', fontWeight: '700' }}>TZS {Math.round(row.principal_part).toLocaleString()}</td>
                    <td style={{ fontWeight: '800', color: '#64748B' }}>TZS {Math.round(row.remaining_balance).toLocaleString()}</td>
                    <td>
                      {row.is_paid ? (
                        <span className="badge badge-success" style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }}>
                          <CheckCheck size={13} /> Limelipwa (Paid)
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          <Clock size={13} /> Linalosubiriwa
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {loanSchedule.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                      Hakuna ratiba ya marejesho kwa sababu huna mkopo active.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* SUB-TAB 3: HOW TO PAY DIRECTLY (NAMNA YA KULIPA MOJA KWA MOJA) */}
      {activeSubTab === 'how_to_pay' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
            
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CreditCard size={24} color="#B8860B" /> Njia na Namna ya Kulipa Marejesho Yako Moja kwa Moja
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
                Unaweza kurejesha mkopo wako papo hapo kupitia Simu za Mkononi, Benki au Ofisi ya Tawi
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              
              {/* METHOD 1: MOBILE MONEY */}
              <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '18px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: '#ECFDF5', padding: '0.6rem', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                    <Smartphone size={24} color="#047857" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>1. Simu za Mkononi (Lipa Namba)</h4>
                    <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '700' }}>M-Pesa / Tigo Pesa / Airtel Money</span>
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div>Namba ya Kampuni (Paybill): <strong style={{ color: '#059669', fontSize: '1.1rem' }}>903012</strong></div>
                  <div>Kumbukumbu No (Reference): <strong style={{ color: '#0F172A' }}>{currentBorrower?.phone || currentBorrower?.id_number}</strong></div>
                  <div>Jina la Akaunti: <strong>FKF MICRO-CREDIT</strong></div>
                </div>

                <ol style={{ fontSize: '0.78rem', color: '#475569', paddingLeft: '1.2rem', margin: 0, lineHeight: '1.6' }}>
                  <li>Piga *150*00# (M-Pesa) au *150*01# (Tigo)</li>
                  <li>Chagua Lipa kwa M-Pesa / Lipa Namba</li>
                  <li>Ingiza Namba ya Kampuni <strong>903012</strong></li>
                  <li>Weka Reference: <strong>{currentBorrower?.phone || 'NIDA'}</strong></li>
                  <li>Weka Kiasi na Namba ya Siri uwasilishe!</li>
                </ol>
              </div>

              {/* METHOD 2: BANK TRANSFER */}
              <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '18px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: '#E0F2FE', padding: '0.6rem', borderRadius: '12px', border: '1px solid #7DD3FC' }}>
                    <Landmark size={24} color="#0369A1" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>2. Benki Transfer (Bank Account)</h4>
                    <span style={{ fontSize: '0.72rem', color: '#0284C7', fontWeight: '700' }}>NMB Bank / CRDB Bank / NBC</span>
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div>🏦 <strong>NMB Bank Account:</strong><br /><span style={{ fontSize: '1rem', fontWeight: '900', color: '#0284C7' }}>20110034892</span></div>
                  <div>🏦 <strong>CRDB Bank Account:</strong><br /><span style={{ fontSize: '1rem', fontWeight: '900', color: '#0369A1' }}>0150998471200</span></div>
                  <div>Jina la Akaunti: <strong>FKF MICRO-CREDIT LTD</strong></div>
                </div>

                <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0 }}>
                  Ukishatuma fedha kwa Benki, weka Kumbukumbu ya Muamala kwenye fomu hapo chini ili Afisa wetu wa Mkopo athibitishe risiti yako!
                </p>
              </div>

              {/* METHOD 3: BRANCH CASH OFFICE */}
              <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '18px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: '#FEF3C7', padding: '0.6rem', borderRadius: '12px', border: '1px solid #FCD34D' }}>
                    <Building2 size={24} color="#B8860B" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>3. Ofisi ya Tawi (Cash at Branch)</h4>
                    <span style={{ fontSize: '0.72rem', color: '#B8860B', fontWeight: '700' }}>Tawi la {currentBorrower?.branch_name || 'Dar es Salaam'}</span>
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#475569' }}>
                  <div>Anwani ya Tawi: <strong>21Msamaria street / Msakuzi Road</strong></div>
                  <div>S.L.P: <strong>P.O Box 9030 DSM, Tanzania</strong></div>
                  <div>Simu: <strong>+255790980123</strong></div>
                </div>

                <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0 }}>
                  Unaweza pia kufika moja kwa moja kwenye dirisha la Cashier la Tawi lako na kupewa Risiti halali yenye Muhuri.
                </p>
              </div>

            </div>

          </div>

          {/* SUBMIT TRANSACTION CONFIRMATION FORM */}
          <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '24px', padding: '2rem', maxWidth: '650px', width: '100%', margin: '0 auto', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)' }}>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Send size={22} color="#059669" />
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  Tuma Taarifa za Muamala Uliolipa (Submit Payment Confirmation)
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
                  Ukishalipa kwa M-Pesa au Benki, weka namba ya muamala hapa kuomba athibitishiwe risiti yako
                </p>
              </div>
            </div>

            {txSuccessMsg && (
              <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', padding: '0.85rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: '800', textAlign: 'center' }}>
                ✓ {txSuccessMsg}
              </div>
            )}

            <form onSubmit={handleTxSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>
                  Namba / Code ya Muamala (Transaction Reference Code):
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="Mfano: 9AB483920X au NMB-TX-84930" 
                  value={txCode} 
                  onChange={(e) => setTxCode(e.target.value.toUpperCase())} 
                  style={{ width: '100%', padding: '0.7rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.92rem', fontWeight: '800', color: '#0F172A' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>
                    Kiasi Ulicholipa (TSH):
                  </label>
                  <input 
                    type="number" 
                    required 
                    placeholder="Mfano: 150000" 
                    value={txAmount} 
                    onChange={(e) => setTxAmount(e.target.value)} 
                    style={{ width: '100%', padding: '0.7rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.92rem', fontWeight: '800', color: '#059669' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>
                    Njia Uliyotumia (Method):
                  </label>
                  <select 
                    value={txMethod} 
                    onChange={(e) => setTxMethod(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '700' }}
                  >
                    <option value="M-PESA">M-Pesa (Lipa Namba 903012)</option>
                    <option value="TIGO_PESA">Tigo Pesa (Lipa Namba 903012)</option>
                    <option value="AIRTEL_MONEY">Airtel Money</option>
                    <option value="NMB_BANK">NMB Bank (Acc: 20110034892)</option>
                    <option value="CRDB_BANK">CRDB Bank (Acc: 0150998471200)</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={txSubmitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '0.4rem', background: '#059669', fontSize: '0.92rem' }}>
                {txSubmitting ? <RefreshCw size={18} className="spin" /> : <Send size={18} />} Tuma Taarifa za Muamala
              </button>
            </form>

          </div>

        </div>
      )}

      {/* SUB-TAB 4: MY LOANS LIST */}
      {activeSubTab === 'my_loans' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Orodha ya Mikopo Yangu Yote ({myLoans.length})
            </h3>
            {canApply ? (
              <button onClick={() => setActiveSubTab('apply')} className="btn-primary" style={{ padding: '0.55rem 1rem', background: '#059669', fontSize: '0.82rem' }}>
                <Plus size={16} /> Omba Mkopo Mpya
              </button>
            ) : (
              <button disabled style={{ padding: '0.55rem 1rem', background: '#E2E8F0', color: '#94A3B8', border: 'none', borderRadius: '8px', fontSize: '0.82rem', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={16} /> Kamilisha Mkopo Wako
              </button>
            )}
          </div>

          <table className="custom-table" style={{ width: '100%', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th>Mkopo #</th>
                <th>Kiasi cha Mtaji</th>
                <th>Riba %</th>
                <th>Jumla Kuu</th>
                <th>Salio Linalobaki</th>
                <th>Mzunguko</th>
                <th>Hali (Status)</th>
                <th>Vitendo & Riba (Actions)</th>
              </tr>
            </thead>
            <tbody>
              {myLoans.map(loan => (
                <tr key={loan.id}>
                  <td style={{ fontWeight: '800', color: '#0F172A' }}>LN-#{loan.id}</td>
                  <td style={{ fontWeight: '700' }}>TZS {parseFloat(loan.principal_amount || 0).toLocaleString()}</td>
                  <td style={{ color: '#B8860B', fontWeight: '700' }}>{loan.interest_rate_pct}%</td>
                  <td style={{ fontWeight: '800', color: '#059669' }}>TZS {parseFloat(loan.total_payable || 0).toLocaleString()}</td>
                  <td style={{ fontWeight: '900', color: '#DC2626' }}>TZS {parseFloat(loan.balance_remaining || 0).toLocaleString()}</td>
                  <td><span className="badge badge-info">{loan.repayment_frequency || 'MONTHLY'}</span></td>
                  <td>
                    <span className={`badge ${loan.status === 'DISBURSED' ? 'badge-success' : 'badge-warning'}`}>
                      {loan.status_display || loan.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => setRenewLoanTarget(loan)} 
                        className="btn-secondary" 
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', background: '#ECFDF5', color: '#047857', border: '1px solid #6EE7B7', fontWeight: '800' }} 
                        title="Renew Mkopo kwa Kulipa Riba Tu"
                      >
                        <RefreshCw size={13} /> 🔄 Renew (Lipa Riba Tu)
                      </button>
                      <button 
                        onClick={() => setActiveSubTab('how_to_pay')} 
                        className="btn-secondary" 
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', background: '#FEF3C7', color: '#B8860B', border: '1px solid #FCD34D' }} 
                        title="Namna ya Kulipa Moja kwa Moja"
                      >
                        <CreditCard size={13} /> 💳 Lipa Rejesho
                      </button>
                      <button 
                        onClick={() => { setSelectedScheduleLoanId(loan.id); setActiveSubTab('schedule'); }} 
                        className="btn-secondary" 
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', background: '#F1F5F9', color: '#1E293B', border: '1px solid #CBD5E1' }} 
                        title="Ratiba ya Marejesho"
                      >
                        <Calendar size={13} /> 📅 Ratiba
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {myLoans.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                    Hujawahi kuomba mkopo wowote kwenye mfumo yetu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-TAB 5: MY REPAYMENT RECEIPTS */}
      {activeSubTab === 'payments' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Risiti Zote za Malipo Uliyofanya ({myRepayments.length})
            </h3>
          </div>

          <table className="custom-table" style={{ width: '100%', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th>Risiti #</th>
                <th>Tarehe ya Malipo</th>
                <th>Mkopo #</th>
                <th>Kiasi Ulicholipa (TZS)</th>
                <th>Njia ya Malipo</th>
                <th>Risiti</th>
              </tr>
            </thead>
            <tbody>
              {myRepayments.map((rep, idx) => (
                <tr key={rep.id || idx}>
                  <td style={{ fontWeight: '800', color: '#0F172A' }}>RCT-#{rep.id || (idx + 101)}</td>
                  <td>{rep.repayment_date || new Date().toLocaleDateString()}</td>
                  <td style={{ fontWeight: '700', color: '#0284C7' }}>{rep.loan_code}</td>
                  <td style={{ fontWeight: '900', color: '#059669', fontSize: '0.95rem' }}>
                    TZS {parseFloat(rep.amount_paid || 0).toLocaleString()}
                  </td>
                  <td>
                    <span className="badge badge-success" style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }}>
                      {rep.payment_method || 'CASH'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => window.print()} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                      <Printer size={13} /> Print Risiti
                    </button>
                  </td>
                </tr>
              ))}
              {myRepayments.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                    Bado hujafanya malipo yoyote ya marejesho.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* SUB-TAB 6: SELF LOAN APPLICATION FORM */}
      {activeSubTab === 'apply' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '24px', padding: '2rem', maxWidth: '750px', margin: '0 auto', width: '100%', boxShadow: '0 15px 35px -10px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={20} color="#059669" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0F172A', fontWeight: '900' }}>
                Fomu ya Kuomba Mkopo Mpya {(!hasActiveLoan && currentUser?.role && currentUser.role !== 'BORROWER') && '(Msaidizi)'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                Jaza taarifa kwa usahihi. Mkopo huu utapitiwa na Afisa wako wa Tawi.
              </p>
            </div>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: '0 0 1.5rem 0' }} />

          {!canApply ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
              <AlertCircle size={48} color="#EF4444" style={{ marginBottom: '1rem', display: 'inline-block' }} />
              <h4 style={{ color: '#991B1B', margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Hairuhusiwi Kuomba Mkopo Mpya</h4>
              <p style={{ color: '#B91C1C', margin: 0, fontSize: '0.95rem' }}>
                Una mkopo ambao unaendelea au unasubiri kuidhinishwa. Tafadhali kamilisha marejesho ya mkopo wako uliopo kabla ya kuomba mkopo mwingine.
              </p>
              <button onClick={() => setActiveSubTab('my_loans')} style={{ marginTop: '1.5rem', background: '#EF4444', color: '#FFF', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Tazama Mikopo Yangu
              </button>
            </div>
          ) : (
            <>
              {applyErrorMsg && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.85rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: '700' }}>
                  ⚠️ {applyErrorMsg}
                </div>
              )}

              {applySuccessMsg && (
                <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.9rem', fontWeight: '800', textAlign: 'center' }}>
                  ✓ {applySuccessMsg}
                </div>
              )}

              <form onSubmit={handleSelfApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* 1. KIASI CHA MKOPO */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.4rem' }}>
                    Kiasi cha Mkopo Unachoomba (TSH):
                  </label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#059669' }} />
                    <input 
                      type="number" 
                      required 
                      step="50000"
                      min="100000"
                      max="10000000"
                      value={applyAmount} 
                      onChange={(e) => setApplyAmount(e.target.value)} 
                      style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '1.1rem', fontWeight: '900', color: '#059669' }} 
                    />
                  </div>
                </div>

                {/* 2. MZUNGUKO WA MAREJESHO */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.4rem' }}>
                    Chagua Mzunguko wa Marejesho (Repayment Frequency):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setApplyFrequency('DAILY')}
                      style={{ padding: '0.85rem 0.5rem', borderRadius: '12px', border: applyFrequency === 'DAILY' ? '2px solid #059669' : '1px solid #CBD5E1', background: applyFrequency === 'DAILY' ? '#ECFDF5' : '#FFFFFF', color: applyFrequency === 'DAILY' ? '#047857' : '#475569', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }}
                    >
                      ☀️ Kila Siku (Daily)
                    </button>

                    <button
                      type="button"
                      onClick={() => setApplyFrequency('WEEKLY')}
                      style={{ padding: '0.85rem 0.5rem', borderRadius: '12px', border: applyFrequency === 'WEEKLY' ? '2px solid #0284C7' : '1px solid #CBD5E1', background: applyFrequency === 'WEEKLY' ? '#E0F2FE' : '#FFFFFF', color: applyFrequency === 'WEEKLY' ? '#0369A1' : '#475569', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }}
                    >
                      📅 Kila Wiki (Weekly)
                    </button>

                    <button
                      type="button"
                      onClick={() => setApplyFrequency('MONTHLY')}
                      style={{ padding: '0.85rem 0.5rem', borderRadius: '12px', border: applyFrequency === 'MONTHLY' ? '2px solid #B8860B' : '1px solid #CBD5E1', background: applyFrequency === 'MONTHLY' ? '#FEF3C7' : '#FFFFFF', color: applyFrequency === 'MONTHLY' ? '#B8860B' : '#475569', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }}
                    >
                      📆 Kila Mwezi (Monthly)
                    </button>
                  </div>
                </div>

                {/* 3. MUDA WA MKOPO (TERM IN MONTHS) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.4rem' }}>
                    Muda wa Mkopo (Miezi):
                  </label>
                  <select 
                    value={applyTermMonths} 
                    onChange={(e) => setApplyTermMonths(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '800', color: '#0F172A' }}
                  >
                    <option value="1">Mwezi 1 (Month 1)</option>
                    <option value="3">Miezi 3 (Months 3)</option>
                    <option value="6">Miezi 6 (Months 6)</option>
                    <option value="12">Miezi 12 (Year 1)</option>
                  </select>
                </div>

                {/* 4. SABABU YA MKOPO */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.4rem' }}>
                    Sababu ya Kuomba Mkopo (Purpose of Loan):
                  </label>
                  <textarea 
                    rows={3} 
                    required
                    placeholder="Mfano: Kuongeza mtaji wa duka langu la nguo Sokoni Kariakoo..."
                    value={applyPurpose} 
                    onChange={(e) => setApplyPurpose(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem' }}
                  />
                </div>

                {/* 5. MAELEZO YA DHAMANA */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.4rem' }}>
                    Dhamana Unayoweka (Collateral Offered):
                  </label>
                  <input 
                    type="text" 
                    placeholder="Mfano: Pikipiki ya Boxer MC 483-AAA, TV ya Samsung 55 Inch..."
                    value={applyCollateral} 
                    onChange={(e) => setApplyCollateral(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem' }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={applySubmitting} 
                  style={{ 
                    width: '100%', 
                    padding: '0.9rem', 
                    borderRadius: '12px', 
                    border: 'none', 
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
                    color: '#FFFFFF', 
                    fontWeight: '900', 
                    fontSize: '1rem', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.6rem',
                    boxShadow: '0 8px 20px -4px rgba(5, 150, 105, 0.4)',
                    marginTop: '0.5rem'
                  }}
                >
                  {applySubmitting ? <RefreshCw size={20} className="spin" /> : <Plus size={20} />} Wasilisha Ombi la Mkopo
                </button>

              </form>
            </>
          )}
        </div>
      )}

      {/* RENEW LOAN MODAL FOR BORROWER */}
      {renewLoanTarget && (
        <RenewLoanModal 
          loan={renewLoanTarget}
          onClose={() => setRenewLoanTarget(null)}
          onRenew={onRenewLoan}
        />
      )}

    </div>
  );
}

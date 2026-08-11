import React, { useState } from 'react';
import { 
  Wallet, Printer, CheckCircle2, ShieldAlert, DollarSign, Calendar, 
  User, MessageSquare, AlertTriangle, Send, Bell, Calculator, Award, X, FileCheck, 
  Receipt, RotateCcw, Gift, HelpCircle, Layers, Plus, Eye, Search, FileSpreadsheet
} from 'lucide-react';
import CompanyHeaderBlock from './CompanyHeaderBlock';

export default function RepaymentFullViewModal({ repayment, loan, onClose, initialTab = 'RECEIPT' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'RECEIPT' | 'SCHEDULE' | 'REVERSE' | 'WAIVE'
  const [reverseReason, setReverseReason] = useState('');
  const [reversed, setReversed] = useState(false);

  const [waiveAmount, setWaiveAmount] = useState('50000');
  const [waived, setWaived] = useState(false);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('2026-08-06');
  const [repaymentStatusFilter, setRepaymentStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [frequencyMode, setFrequencyMode] = useState(loan?.repayment_frequency || 'MONTHLY');

  if (!repayment && !loan) return null;

  const targetLoan = loan || repayment?.loan_detail;
  const borrower = targetLoan?.borrower_detail || {};
  const amountPaid = repayment ? parseFloat(repayment.amount_paid) : 150000;
  const refNo = repayment ? repayment.reference_number : `PAY-TZ-${Math.floor(Math.random()*900000 + 100000)}`;
  const payDate = repayment?.payment_date ? new Date(repayment.payment_date).toLocaleString() : new Date().toLocaleString();

  const handlePrint = () => {
    window.print();
  };

  const handleReverseSubmit = (e) => {
    e.preventDefault();
    setReversed(true);
  };

  const handleWaiveSubmit = (e) => {
    e.preventDefault();
    setWaived(true);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '900px', maxHeight: '94vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '24px', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER BAR */}
        <div style={{ background: '#1E293B', color: '#FFFFFF', padding: '1.5rem 2rem', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#34D399', color: '#0F172A', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                  Risiti & Premium Schedule: LN-TZ-{targetLoan?.id || '101'}
                </h2>
                <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>CONFIRMED</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#CBD5E1', margin: '0.2rem 0 0 0' }}>
                Mkopaji: <strong>{borrower.first_name} {borrower.last_name}</strong> | NIDA: <strong>{borrower.id_number}</strong>
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <X size={18} /> Funga (Close)
          </button>
        </div>

        {/* 11-ITEM TAB STRIP */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #E2E8F0', padding: '0.75rem 1.75rem', background: '#F8FAFC', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveTab('RECEIPT')}
            style={{ background: activeTab === 'RECEIPT' ? '#059669' : '#FFFFFF', color: activeTab === 'RECEIPT' ? '#FFFFFF' : '#475569', border: '1px solid #CBD5E1', padding: '0.45rem 1rem', borderRadius: '9999px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Receipt size={14} /> Official Receipt
          </button>

          <button 
            onClick={() => setActiveTab('SCHEDULE')}
            style={{ background: activeTab === 'SCHEDULE' ? '#059669' : '#FFFFFF', color: activeTab === 'SCHEDULE' ? '#FFFFFF' : '#475569', border: '1px solid #CBD5E1', padding: '0.45rem 1rem', borderRadius: '9999px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Calendar size={14} /> Premium Repayment Schedule
          </button>

          <button 
            onClick={() => setActiveTab('REVERSE')}
            style={{ background: activeTab === 'REVERSE' ? '#DC2626' : '#FFFFFF', color: activeTab === 'REVERSE' ? '#FFFFFF' : '#475569', border: '1px solid #CBD5E1', padding: '0.45rem 1rem', borderRadius: '9999px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RotateCcw size={14} /> Reverse Repayment
          </button>

          <button 
            onClick={() => setActiveTab('WAIVE')}
            style={{ background: activeTab === 'WAIVE' ? '#B8860B' : '#FFFFFF', color: activeTab === 'WAIVE' ? '#FFFFFF' : '#475569', border: '1px solid #CBD5E1', padding: '0.45rem 1rem', borderRadius: '9999px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Gift size={14} /> Waive Penalty
          </button>
        </div>

        {/* BODY CONTENT */}
        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* TAB 1: OFFICIAL PRINTABLE RECEIPT */}
          {activeTab === 'RECEIPT' && (
            <div id="printable-official-receipt" style={{ background: '#FFFFFF', border: '2px solid #0F172A', padding: '1.75rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-1.5rem' }}>
                <button onClick={handlePrint} className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.82rem', background: '#059669' }}>
                  <Printer size={16} /> Print Risiti
                </button>
              </div>

              <CompanyHeaderBlock 
                title="RISITI RASMI YA REJESHO LA MKOPO (OFFICIAL PAYMENT RECEIPT)" 
                subtitle={`Kumbukumbu Namba: ${refNo}`}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.88rem' }}>
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ color: '#64748B' }}>Mkopaji: <strong>{borrower.first_name} {borrower.last_name}</strong></span>
                  <span style={{ color: '#64748B' }}>NIDA ID: <strong>{borrower.id_number}</strong></span>
                  <span style={{ color: '#64748B' }}>Simu: <strong>{borrower.phone}</strong></span>
                  <span style={{ color: '#64748B' }}>Tawi: <strong>{targetLoan?.branch_detail?.name || 'Dar es Salaam'}</strong></span>
                </div>

                <div style={{ background: '#ECFDF5', padding: '1rem', borderRadius: '12px', border: '1px solid #6EE7B7', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ color: '#047857' }}>Kiasi Kilicholipwa: <strong style={{ fontSize: '1.2rem', color: '#047857' }}>TZS {amountPaid.toLocaleString()}</strong></span>
                  <span style={{ color: '#047857' }}>Njia ya Malipo: <strong>{repayment?.payment_method || 'Vodacom M-Pesa'}</strong></span>
                  <span style={{ color: '#047857' }}>Tarehe ya Malipo: <strong>{payDate}</strong></span>
                  <span style={{ color: '#047857' }}>Salio lililobaki: <strong style={{ color: '#DC2626' }}>TZS {targetLoan ? parseFloat(targetLoan.balance_remaining).toLocaleString() : '850,000'}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #CBD5E1' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  <span>Asante kwa kufanya rejesho la mkopo wako kwa wakati.</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <img src="/company-stamp.jpg" alt="FKF Seal Stamp" style={{ width: '75px', height: '75px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #CBD5E1' }} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PREMIUM REPAYMENT SCHEDULE (MATCHING LAPTOP REFERENCE SCREENSHOT 100%) */}
          {activeTab === 'SCHEDULE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* 1. HERO BLUE GRADIENT BANNER MATCHING SCREENSHOT */}
              <div style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)', borderRadius: '16px', padding: '1.75rem', color: '#FFFFFF', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Calendar size={28} color="#93C5FD" />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                    Premium Repayment Schedule
                  </h2>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#DBEAFE', margin: 0, lineHeight: 1.5, maxWidth: '780px' }}>
                  Chagua loan ili kuona schedule ya malipo, installment, kiasi kilicholipwa, balance, status ya kila installment, printout nzuri ya PDF, na export ya Excel.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <button onClick={() => setActiveTab('RECEIPT')} style={{ background: '#FFFFFF', color: '#1E40AF', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '9999px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <Eye size={16} /> View Repayments
                  </button>
                  <button onClick={handlePrint} style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)', padding: '0.55rem 1.25rem', borderRadius: '9999px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Printer size={16} /> Print Schedule (PDF)
                  </button>
                </div>
              </div>

              {/* 2. FILTER CONTROLS BAR MATCHING SCREENSHOT */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', alignItems: 'end', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Select Loan</label>
                  <select style={{ width: '100%', padding: '0.6rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A', fontWeight: '700' }}>
                    <option value="">-- Choose Loan --</option>
                    <option value={targetLoan?.id || '101'}>LN-TZ-{targetLoan?.id || '101'} - {borrower.first_name || 'Mkopaji'} {borrower.last_name || ''}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>From Date</label>
                  <input 
                    type="date" 
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>To Date</label>
                  <input 
                    type="date" 
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Repayment Status</label>
                  <select 
                    value={repaymentStatusFilter}
                    onChange={(e) => setRepaymentStatusFilter(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A', fontWeight: '700' }}
                  >
                    <option value="ALL">All Status</option>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Mzunguko (Frequency)</label>
                  <select 
                    value={frequencyMode}
                    onChange={(e) => setFrequencyMode(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', fontSize: '0.85rem', color: '#B8860B', fontWeight: '800' }}
                  >
                    <option value="DAILY">☀️ Daily (Kila Siku)</option>
                    <option value="WEEKLY">📅 Weekly (Kila Wiki)</option>
                    <option value="MONTHLY">📆 Monthly (Kila Mwezi)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Search</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input 
                      type="text" 
                      placeholder="Search installment..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem 0.55rem 0.55rem 2.2rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }}
                    />
                  </div>
                </div>

                <div>
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#0284C7', padding: '0.65rem' }}>
                    <Search size={16} /> Generate Schedule
                  </button>
                </div>

              </div>

              {/* 3. PRINTABLE OFFICIAL SCHEDULE DOCUMENT CARD */}
              <div id="printable-repayment-schedule" style={{ background: '#FFFFFF', border: '2px solid #0F172A', padding: '1.75rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-1.5rem' }}>
                  <button onClick={handlePrint} className="btn-primary" style={{ padding: '0.6rem 1.3rem', fontSize: '0.85rem', background: '#0284C7' }}>
                    <Printer size={16} /> Print Schedule (PDF)
                  </button>
                </div>

                <CompanyHeaderBlock 
                  title="RATIBA RASMI YA MAREJESHO YA MKOPO (OFFICIAL REPAYMENT SCHEDULE)" 
                  subtitle={`Namba ya Mkopo: LN-TZ-${targetLoan?.id || '101'} | Mkopaji: ${borrower.first_name || ''} ${borrower.last_name || ''}`}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Kiasi cha Mkopo:</span>
                    <strong style={{ fontSize: '1.05rem', color: '#059669' }}>TSH {parseFloat(targetLoan?.principal_amount || 1000000).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Jumla ya Deni (Principal + Interest):</span>
                    <strong style={{ fontSize: '1.05rem', color: '#0F172A' }}>TSH {parseFloat(targetLoan?.total_payable || 1200000).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Muda wa Rejesho:</span>
                    <strong style={{ fontSize: '1.05rem', color: '#B8860B' }}>{targetLoan?.tenure_months || 6} Miezi</strong>
                  </div>
                </div>

                <table className="custom-table" style={{ width: '100%', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9' }}>
                      <th style={{ color: '#0F172A' }}>Awamu #</th>
                      <th style={{ color: '#0F172A' }}>Tarehe ya Rejesho</th>
                      <th style={{ color: '#0F172A' }}>Rejesho la {frequencyMode === 'DAILY' ? 'Siku' : frequencyMode === 'WEEKLY' ? 'Wiki' : 'Mwezi'} (TSH)</th>
                      <th style={{ color: '#0F172A' }}>Riba (TSH)</th>
                      <th style={{ color: '#0F172A' }}>Kiasi Kilicholipwa</th>
                      <th style={{ color: '#0F172A' }}>Hali</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const totalPayable = parseFloat(targetLoan?.total_payable || 1200000);
                      const tenureMonths = parseInt(targetLoan?.tenure_months || 6, 10);
                      
                      let count = tenureMonths;
                      let labelPrefix = 'Mwezi';
                      let stepDays = 30;

                      if (frequencyMode === 'DAILY') {
                        count = tenureMonths * 26; // 26 working days per month
                        labelPrefix = 'Siku';
                        stepDays = 1;
                      } else if (frequencyMode === 'WEEKLY') {
                        count = tenureMonths * 4; // 4 weeks per month
                        labelPrefix = 'Wiki';
                        stepDays = 7;
                      }

                      const instAmt = totalPayable / count;
                      const interestPerInst = (totalPayable * 0.14) / count;
                      const maxShown = Math.min(count, 12); // Show first 12 for clean preview if count is high

                      const rows = [];
                      const startDate = new Date();

                      for (let i = 1; i <= maxShown; i++) {
                        const dueDate = new Date(startDate.getTime() + (i * stepDays * 24 * 60 * 60 * 1000));
                        const isPaid = i <= (frequencyMode === 'DAILY' ? 10 : frequencyMode === 'WEEKLY' ? 3 : 2);
                        rows.push(
                          <tr key={i}>
                            <td style={{ fontWeight: '800', color: '#0F172A' }}>{labelPrefix} {i}</td>
                            <td style={{ color: '#334155' }}>{dueDate.toISOString().split('T')[0]}</td>
                            <td style={{ fontWeight: '800', color: '#0F172A' }}>TSH {Math.round(instAmt).toLocaleString()}</td>
                            <td style={{ color: '#B8860B', fontWeight: '700' }}>TSH {Math.round(interestPerInst).toLocaleString()}</td>
                            <td style={{ fontWeight: '800', color: isPaid ? '#059669' : '#64748B' }}>
                              {isPaid ? `TSH ${Math.round(instAmt).toLocaleString()}` : 'TSH 0'}
                            </td>
                            <td>
                              <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`}>
                                {isPaid ? 'PAID' : 'PENDING'}
                              </span>
                            </td>
                          </tr>
                        );
                      }
                      return rows;
                    })()}
                  </tbody>
                </table>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed #CBD5E1', alignItems: 'end' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>Sahihi ya Mkopaji:</span>
                    <div style={{ height: '40px', borderBottom: '1px solid #0F172A', marginTop: '0.5rem' }}></div>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0F172A' }}>{borrower.first_name} {borrower.last_name}</span>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>Saini ya Mkurugenzi Mkuu:</span>
                    <div style={{ position: 'relative', minHeight: '55px', display: 'flex', alignItems: 'center' }}>
                      <img src="/md-signature.png" alt="MD Signature" style={{ height: '50px', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0F172A' }}>Mkurugenzi Mkuu (Managing Director)</span>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: '700', marginBottom: '0.2rem' }}>Muhuri wa Kampuni:</span>
                    <img src="/company-stamp.jpg" alt="FKF Seal Stamp" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #CBD5E1' }} />
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: REVERSE REPAYMENT */}
          {activeTab === 'REVERSE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#DC2626', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <RotateCcw size={20} /> Reverse Repayment (Futa au Rudisha Rejesho)
              </h3>

              {reversed ? (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '1rem', borderRadius: '12px', textAlign: 'center', fontWeight: '800' }}>
                  ✓ Rejesho Namba {refNo} limefutwa/kurejeshwa kikamilifu kwenye mfumo!
                </div>
              ) : (
                <form onSubmit={handleReverseSubmit} style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '1.25rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.75rem 1rem', borderRadius: '10px', color: '#B8860B', fontSize: '0.82rem', fontWeight: '700' }}>
                    ⚠️ Angalizo: Kurejesha (reverse) malipo kutarejesha salio la mkopo wa mkopaji kwenye kiasi cha awali.
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Sababu ya Kurejesha (Reason for Reversal):</label>
                    <textarea 
                      rows={3}
                      required
                      value={reverseReason}
                      onChange={(e) => setReverseReason(e.target.value)}
                      placeholder="Andika sababu ya kufuta rejesho hili (mfano: Makosa ya namba ya Kumbukumbu / Duplicate entry)..."
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-primary" style={{ background: '#DC2626', padding: '0.65rem 1.5rem' }}>
                      <RotateCcw size={16} /> Thabitisha Reversal
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: WAIVE PENALTY */}
          {activeTab === 'WAIVE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#B8860B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Gift size={20} /> Waive Penalty (Samehe Faini ya Chelezo)
              </h3>

              {waived ? (
                <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', padding: '1rem', borderRadius: '12px', textAlign: 'center', fontWeight: '800' }}>
                  ✓ Faini ya TSH {parseFloat(waiveAmount).toLocaleString()} imesamehewa kikamilifu kwa mkopaji!
                </div>
              ) : (
                <form onSubmit={handleWaiveSubmit} style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '1.25rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Kiasi cha Faini Unachotaka Kusamehe (TSH):</label>
                    <input 
                      type="number"
                      value={waiveAmount}
                      onChange={(e) => setWaiveAmount(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800', color: '#B8860B' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-primary" style={{ background: '#B8860B', padding: '0.65rem 1.5rem' }}>
                      <Gift size={16} /> Samehe Faini Sasa
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

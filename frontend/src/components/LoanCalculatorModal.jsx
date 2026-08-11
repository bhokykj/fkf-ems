import React, { useState, useMemo } from 'react';
import { Calculator, X, Printer, Calendar, DollarSign, Percent, Clock, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import CompanyHeaderBlock from './CompanyHeaderBlock';

export default function LoanCalculatorModal({ onClose }) {
  // Calculator Form State
  const [principal, setPrincipal] = useState(1000000);
  const [interestRate, setInterestRate] = useState(15);
  const [tenureValue, setTenureValue] = useState(6); // duration
  const [repaymentFrequency, setRepaymentFrequency] = useState('MONTHLY'); // 'DAILY' | 'WEEKLY' | 'MONTHLY'

  // Presets
  const quickAmounts = [100000, 500000, 1000000, 2500000, 5000000, 10000000];
  const quickRates = [5, 10, 12, 15, 18, 20];

  // Dynamic Calculation
  const calculation = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const rPct = parseFloat(interestRate) || 0;
    const t = parseInt(tenureValue, 10) || 1;

    // Total interest amount
    const totalInterest = (p * rPct) / 100;
    const totalPayable = p + totalInterest;

    let totalInstallments = t;
    let frequencyName = 'Kila Mwezi';
    let daysStep = 30;

    if (repaymentFrequency === 'DAILY') {
      totalInstallments = t; // total days
      frequencyName = 'Kila Siku';
      daysStep = 1;
    } else if (repaymentFrequency === 'WEEKLY') {
      totalInstallments = t; // total weeks
      frequencyName = 'Kila Wiki';
      daysStep = 7;
    } else {
      totalInstallments = t; // total months
      frequencyName = 'Kila Mwezi';
      daysStep = 30;
    }

    const installmentAmount = totalInstallments > 0 ? totalPayable / totalInstallments : totalPayable;
    const principalPerInstallment = totalInstallments > 0 ? p / totalInstallments : p;
    const interestPerInstallment = totalInstallments > 0 ? totalInterest / totalInstallments : totalInterest;

    // Generate repayment schedule rows
    const schedule = [];
    let remainingBalance = totalPayable;
    const startDate = new Date();

    for (let i = 1; i <= totalInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + (i * daysStep));
      
      remainingBalance = Math.max(0, remainingBalance - installmentAmount);

      schedule.push({
        installment_no: i,
        due_date: dueDate.toLocaleDateString('sw-TZ', { day: '2-digit', month: 'short', year: 'numeric' }),
        installment_amount: installmentAmount,
        principal_part: principalPerInstallment,
        interest_part: interestPerInstallment,
        remaining_balance: remainingBalance
      });
    }

    return {
      principal: p,
      interestRate: rPct,
      totalInterest,
      totalPayable,
      installmentAmount,
      totalInstallments,
      frequencyName,
      schedule
    };
  }, [principal, interestRate, tenureValue, repaymentFrequency]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="modal-content" style={{ maxWidth: '1050px', width: '100%', maxHeight: '92vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '24px', border: '2px solid #0F172A', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', color: '#0F172A' }}>
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF', padding: '1.25rem 1.75rem', borderRadius: '20px 20px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '0.6rem', borderRadius: '12px', display: 'flex' }}>
              <Calculator size={26} color="#D4AF37" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                Kikokotoo cha Mikopo (FKF Loan Calculator)
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#CBD5E1', margin: '0.15rem 0 0 0' }}>
                Kukokotoa Marejesho kwa Siku, Wiki au Mwezi, Kiasi cha Mkopo na Riba
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={handlePrint} className="btn-primary" style={{ padding: '0.5rem 0.95rem', background: '#059669', fontSize: '0.82rem' }}>
              <Printer size={15} /> Print Ratiba
            </button>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            {/* LEFT COLUMN: INPUT CONTROLS */}
            <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '18px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: 0, borderBottom: '1px solid #E2E8F0', paddingBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="#B8860B" /> Ingiza Taarifa za Mkopo
              </h4>

              {/* 1. FREQUENCY SELECTOR (SIKU, WIKI, MWEZI) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem' }}>
                  Aina ya Mzunguko wa Marejesho (Repayment Frequency):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setRepaymentFrequency('DAILY')}
                    style={{ padding: '0.75rem 0.5rem', borderRadius: '12px', border: repaymentFrequency === 'DAILY' ? '2px solid #059669' : '1px solid #CBD5E1', background: repaymentFrequency === 'DAILY' ? '#ECFDF5' : '#FFFFFF', color: repaymentFrequency === 'DAILY' ? '#047857' : '#475569', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }}
                  >
                    ☀️ Siku (Daily)
                  </button>

                  <button
                    type="button"
                    onClick={() => setRepaymentFrequency('WEEKLY')}
                    style={{ padding: '0.75rem 0.5rem', borderRadius: '12px', border: repaymentFrequency === 'WEEKLY' ? '2px solid #0284C7' : '1px solid #CBD5E1', background: repaymentFrequency === 'WEEKLY' ? '#E0F2FE' : '#FFFFFF', color: repaymentFrequency === 'WEEKLY' ? '#0369A1' : '#475569', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }}
                  >
                    📅 Wiki (Weekly)
                  </button>

                  <button
                    type="button"
                    onClick={() => setRepaymentFrequency('MONTHLY')}
                    style={{ padding: '0.75rem 0.5rem', borderRadius: '12px', border: repaymentFrequency === 'MONTHLY' ? '2px solid #B8860B' : '1px solid #CBD5E1', background: repaymentFrequency === 'MONTHLY' ? '#FEF3C7' : '#FFFFFF', color: repaymentFrequency === 'MONTHLY' ? '#B8860B' : '#475569', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }}
                  >
                    📆 Mwezi (Monthly)
                  </button>
                </div>
              </div>

              {/* 2. KIASI CHA MKOPO (LOAN PRINCIPAL) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A' }}>
                    Kiasi cha Mkopo (Loan Principal TZS):
                  </label>
                  <strong style={{ fontSize: '1.1rem', color: '#059669', fontWeight: '900' }}>
                    TZS {parseFloat(principal || 0).toLocaleString()}
                  </strong>
                </div>

                <div style={{ position: 'relative' }}>
                  <DollarSign size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#059669' }} />
                  <input 
                    type="number" 
                    step="50000"
                    value={principal} 
                    onChange={(e) => setPrincipal(e.target.value)} 
                    style={{ width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.5rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '1rem', fontWeight: '800', color: '#0F172A' }} 
                  />
                </div>

                {/* Range Slider for Principal */}
                <input 
                  type="range" 
                  min="50000" 
                  max="20000000" 
                  step="50000" 
                  value={principal} 
                  onChange={(e) => setPrincipal(e.target.value)}
                  style={{ width: '100%', marginTop: '0.5rem', accentColor: '#059669', cursor: 'pointer' }}
                />

                {/* Quick Principal Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                  {quickAmounts.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPrincipal(amt)}
                      style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: Number(principal) === amt ? '#0F172A' : '#FFFFFF', color: Number(principal) === amt ? '#D4AF37' : '#475569', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      {amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. RIBA YA MKOPO (INTEREST RATE %) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F172A' }}>
                    Riba ya Mkopo (% Loan Interest Rate):
                  </label>
                  <strong style={{ fontSize: '1.1rem', color: '#B8860B', fontWeight: '900' }}>
                    {interestRate}%
                  </strong>
                </div>

                <div style={{ position: 'relative' }}>
                  <Percent size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#B8860B' }} />
                  <input 
                    type="number" 
                    step="0.5"
                    value={interestRate} 
                    onChange={(e) => setInterestRate(e.target.value)} 
                    style={{ width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.5rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '1rem', fontWeight: '800', color: '#0F172A' }} 
                  />
                </div>

                {/* Range Slider for Interest */}
                <input 
                  type="range" 
                  min="1" 
                  max="40" 
                  step="0.5" 
                  value={interestRate} 
                  onChange={(e) => setInterestRate(e.target.value)}
                  style={{ width: '100%', marginTop: '0.5rem', accentColor: '#B8860B', cursor: 'pointer' }}
                />

                {/* Quick Rate Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                  {quickRates.map(rt => (
                    <button
                      key={rt}
                      type="button"
                      onClick={() => setInterestRate(rt)}
                      style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: Number(interestRate) === rt ? '#B8860B' : '#FFFFFF', color: Number(interestRate) === rt ? '#FFFFFF' : '#475569', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      {rt}%
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. MUDA WA MKOPO (TENURE DURATION) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.4rem' }}>
                  Muda wa Mkopo (Idadi ya {repaymentFrequency === 'DAILY' ? 'Siku' : repaymentFrequency === 'WEEKLY' ? 'Wiki' : 'Miezi'}):
                </label>
                <div style={{ position: 'relative' }}>
                  <Clock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#0284C7' }} />
                  <input 
                    type="number" 
                    min="1"
                    max="365"
                    value={tenureValue} 
                    onChange={(e) => setTenureValue(e.target.value)} 
                    style={{ width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.5rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '1rem', fontWeight: '800', color: '#0F172A' }} 
                  />
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: CALCULATION RESULTS SUMMARY */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* PRIMARY STAT CARD */}
              <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF', borderRadius: '18px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Kiasi cha Rejesho kwa {calculation.frequencyName}:
                </span>
                
                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  TZS {Math.round(calculation.installmentAmount).toLocaleString()}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#94A3B8', display: 'block' }}>Kiasi cha Mkopo (Mtaji):</span>
                    <strong style={{ color: '#FFFFFF' }}>TZS {calculation.principal.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94A3B8', display: 'block' }}>Riba ya Jumla ({calculation.interestRate}%):</span>
                    <strong style={{ color: '#D4AF37' }}>+ TZS {Math.round(calculation.totalInterest).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94A3B8', display: 'block' }}>Jumla ya Kurejesha:</span>
                    <strong style={{ color: '#34D399', fontSize: '1rem' }}>TZS {Math.round(calculation.totalPayable).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94A3B8', display: 'block' }}>Idadi ya Marejesho:</span>
                    <strong style={{ color: '#FFFFFF' }}>{calculation.totalInstallments} {calculation.frequencyName}</strong>
                  </div>
                </div>
              </div>

              {/* INSTALLMENT BREAKDOWN MINI CARD */}
              <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <h5 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#047857', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} color="#047857" /> Mchanganuo wa Kila Rejesho:
                </h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#065F46' }}>
                  <span>Sehemu ya Mtaji:</span>
                  <strong>TZS {Math.round(calculation.principal / calculation.totalInstallments).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#065F46' }}>
                  <span>Sehemu ya Riba:</span>
                  <strong>TZS {Math.round(calculation.totalInterest / calculation.totalInstallments).toLocaleString()}</strong>
                </div>
              </div>

            </div>

          </div>

          {/* RATIBA NZIMA YA MAREJESHO (REPAYMENT SCHEDULE TABLE) */}
          <div id="printable-loan-schedule" style={{ marginTop: '1rem' }}>
            
            <CompanyHeaderBlock 
              title="RATIBA YA REJESHO LA MKOPO (LOAN REPAYMENT SCHEDULE)" 
              subtitle={`Kipimo cha Mzunguko: ${calculation.frequencyName} | Mkopo: TZS ${calculation.principal.toLocaleString()} @ Riba ${calculation.interestRate}%`}
            />

            <div style={{ marginTop: '1rem' }}>
              <table className="custom-table" style={{ width: '100%', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9' }}>
                    <th style={{ color: '#0F172A' }}>Rejesho #</th>
                    <th style={{ color: '#0F172A' }}>Tarehe ya Rejesho</th>
                    <th style={{ color: '#0F172A' }}>Kiasi cha Rejesho (TZS)</th>
                    <th style={{ color: '#0F172A' }}>Sehemu ya Riba (TZS)</th>
                    <th style={{ color: '#0F172A' }}>Sehemu ya Mtaji (TZS)</th>
                    <th style={{ color: '#0F172A' }}>Salio la Mkopo (TZS)</th>
                  </tr>
                </thead>
                <tbody>
                  {calculation.schedule.map((row) => (
                    <tr key={row.installment_no}>
                      <td style={{ fontWeight: '800', color: '#0F172A' }}>Awamu ya {row.installment_no}</td>
                      <td style={{ color: '#475569' }}>{row.due_date}</td>
                      <td style={{ fontWeight: '900', color: '#059669' }}>TZS {Math.round(row.installment_amount).toLocaleString()}</td>
                      <td style={{ color: '#B8860B', fontWeight: '700' }}>TZS {Math.round(row.interest_part).toLocaleString()}</td>
                      <td style={{ color: '#0F172A', fontWeight: '700' }}>TZS {Math.round(row.principal_part).toLocaleString()}</td>
                      <td style={{ fontWeight: '800', color: '#64748B' }}>TZS {Math.round(row.remaining_balance).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#FEF3C7', fontWeight: '900' }}>
                    <td colSpan="2" style={{ color: '#B8860B', textTransform: 'uppercase' }}>Jumla Kuu (Total Payable):</td>
                    <td style={{ color: '#059669', fontSize: '1rem' }}>TZS {Math.round(calculation.totalPayable).toLocaleString()}</td>
                    <td style={{ color: '#B8860B' }}>TZS {Math.round(calculation.totalInterest).toLocaleString()}</td>
                    <td style={{ color: '#0F172A' }}>TZS {calculation.principal.toLocaleString()}</td>
                    <td>-</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

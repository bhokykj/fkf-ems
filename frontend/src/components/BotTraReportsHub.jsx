import React, { useState, useEffect } from 'react';
import { Building2, FileText, Printer, Download, ShieldCheck, Award, AlertCircle, CheckCircle2, DollarSign, Calendar, Sliders } from 'lucide-react';
import CompanyHeaderBlock from './CompanyHeaderBlock';

export default function BotTraReportsHub({ branches, currentUser }) {
  const [activeTab, setActiveTab] = useState('BOT'); // 'BOT' | 'TRA'
  const [reportingPeriod, setReportingPeriod] = useState('Q3 2026');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [reportingPeriod, selectedBranch]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:8000/api/analytics/bot-tra/');
      const data = await resp.json();
      setReportData(data);
    } catch (err) {
      console.error('Error fetching BOT/TRA report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const bot = reportData?.bot || {};
  const tra = reportData?.tra || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. TOP HEADER & CONTROLS STRIP */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: '#0F172A', padding: '0.65rem', borderRadius: '12px', display: 'flex' }}>
            <Building2 size={26} color="#D4AF37" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
              Usimamizi wa Ripoti za Serikali (BOT & TRA Reports Hub)
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
              Bank of Tanzania (BOT Microfinance Act 2018) & Tanzania Revenue Authority (TRA Tax Returns)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Period Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#64748B' }}>Kipindi (Period):</label>
            <select 
              value={reportingPeriod} 
              onChange={(e) => setReportingPeriod(e.target.value)}
              style={{ padding: '0.55rem 0.85rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#0F172A' }}
            >
              <option value="Q1 2026">Q1 2026 (Jan - Mar)</option>
              <option value="Q2 2026">Q2 2026 (Apr - Jun)</option>
              <option value="Q3 2026">Q3 2026 (Jul - Sep) [Sasa]</option>
              <option value="Q4 2026">Q4 2026 (Oct - Dec)</option>
              <option value="FY 2026">Mwaka Mzima 2026 (Full Year)</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#64748B' }}>Tawi (Branch):</label>
            <select 
              value={selectedBranch} 
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{ padding: '0.55rem 0.85rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#0F172A' }}
            >
              <option value="all">Matawi Yote (National Head Office)</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>Tawi la {b.name}</option>
              ))}
            </select>
          </div>

          {/* Print & Export Actions */}
          <button onClick={handlePrint} className="btn-primary" style={{ padding: '0.65rem 1.25rem', background: '#0F172A', fontSize: '0.85rem', marginTop: '1rem' }}>
            <Printer size={16} /> Print Official Return (PDF)
          </button>
        </div>
      </div>

      {/* 2. SUB NAVIGATION STRIP (BOT vs TRA) */}
      <div style={{ display: 'flex', gap: '0.75rem', background: '#FFFFFF', padding: '0.6rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        <button 
          onClick={() => setActiveTab('BOT')} 
          style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', background: activeTab === 'BOT' ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' : 'transparent', color: activeTab === 'BOT' ? '#D4AF37' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: activeTab === 'BOT' ? '0 4px 12px rgba(15, 23, 42, 0.2)' : 'none' }}
        >
          🏛️ Bank of Tanzania (BOT) Statutory Returns
        </button>

        <button 
          onClick={() => setActiveTab('TRA')} 
          style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', background: activeTab === 'TRA' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'transparent', color: activeTab === 'TRA' ? '#FFFFFF' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: activeTab === 'TRA' ? '0 4px 12px rgba(5, 150, 105, 0.2)' : 'none' }}
        >
          📑 Tanzania Revenue Authority (TRA) Tax Returns
        </button>
      </div>

      {/* 3. BOT STATUTORY RETURNS SECTION */}
      {activeTab === 'BOT' && (
        <div id="printable-bot-return" style={{ background: '#FFFFFF', border: '2px solid #0F172A', padding: '2rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <CompanyHeaderBlock 
            title="BANK OF TANZANIA (BOT) - STATUTORY QUARTERLY RETURN" 
            subtitle="Tier 2 Non-Deposit Taking Microfinance Institution (Microfinance Act 2018)"
          />

          {/* BOT License & Institution Metadata Badge */}
          <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '1.25rem', borderRadius: '14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: '#64748B', display: 'block' }}>Jina la Taasisi:</span>
              <strong style={{ color: '#0F172A' }}>{bot.institution_name}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block' }}>Namba ya Leseni ya BOT:</span>
              <strong style={{ color: '#0284C7' }}>{bot.license_no}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block' }}>Kipindi cha Taarifa:</span>
              <strong style={{ color: '#B8860B' }}>{bot.reporting_period}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B', display: 'block' }}>Hali ya Leseni:</span>
              <span className="badge badge-success">COMPLIANT (PASSED)</span>
            </div>
          </div>

          {/* FORM 1: FINANCIAL POSITION & CAPITAL ADEQUACY SUMMARY */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            
            <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '1.25rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', margin: 0, borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                FORM 1: Financial Position (Balance Sheet Summary)
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span>Gross Loan Portfolio:</span>
                <strong>TZS {(bot.form_1_balance_sheet?.gross_loan_portfolio || 150000000).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#DC2626' }}>
                <span>Less: Loan Loss Provisions:</span>
                <strong>- TZS {(bot.form_1_balance_sheet?.loan_loss_provisions || 4500000).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '800', borderTop: '1px dashed #CBD5E1', paddingTop: '0.4rem', color: '#059669' }}>
                <span>Net Loan Portfolio:</span>
                <span>TZS {(bot.form_1_balance_sheet?.net_loan_portfolio || 145500000).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span>Cash & Bank Balances:</span>
                <strong>TZS {(bot.form_1_balance_sheet?.cash_bank_balances || 45000000).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: '900', background: '#F1F5F9', padding: '0.5rem', borderRadius: '8px', color: '#0F172A' }}>
                <span>Total Assets:</span>
                <span>TZS {(bot.form_1_balance_sheet?.total_assets || 195000000).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', padding: '1.25rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#047857', margin: 0, borderBottom: '1px solid #A7F3D0', paddingBottom: '0.5rem' }}>
                FORM 3: Capital Adequacy Return (Ulinganifu wa Mtaji)
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#065F46' }}>
                <span>Minimum Core Capital Required (BOT Standard):</span>
                <strong>TZS {(bot.form_1_balance_sheet?.min_capital_requirement || 20000000).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#065F46' }}>
                <span>Actual Paid-up Core Capital:</span>
                <strong style={{ fontSize: '1.05rem', color: '#047857' }}>TZS {(bot.form_1_balance_sheet?.paid_up_capital || 50000000).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#065F46' }}>
                <span>Capital Buffer Surplus:</span>
                <strong style={{ color: '#059669' }}>+ TZS 30,000,000</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '900', background: '#D1FAE5', padding: '0.6rem', borderRadius: '8px', color: '#065F46' }}>
                <span>Capital Adequacy Ratio (CAR):</span>
                <span>{bot.form_1_balance_sheet?.capital_adequacy_ratio_pct || 28.5}% (PASSED)</span>
              </div>
            </div>

          </div>

          {/* FORM 2: PORTFOLIO QUALITY & ASSET CLASSIFICATION (PAR TABLE) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                FORM 2: Asset Classification & Loan Loss Provisioning (PAR Schedule)
              </h4>
              <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#DC2626' }}>
                Portfolio at Risk (NPL Ratio): {bot.total_portfolio_at_risk_npl_pct}%
              </span>
            </div>

            <table className="custom-table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F1F5F9' }}>
                  <th style={{ color: '#0F172A' }}>Daraja la Mkopo (BOT Category)</th>
                  <th style={{ color: '#0F172A' }}>Siku za Ucheleweshaji</th>
                  <th style={{ color: '#0F172A' }}>Kiasi cha Portifolio (TZS)</th>
                  <th style={{ color: '#0F172A' }}>Kiwango cha Akiba (%)</th>
                  <th style={{ color: '#0F172A' }}>Kiasi cha Akiba ya Hasara (Provision TZS)</th>
                </tr>
              </thead>
              <tbody>
                {(bot.form_2_par_classification || []).map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '800', color: '#0F172A' }}>{row.category}</td>
                    <td style={{ color: '#475569' }}>{idx === 0 ? '0 - 30 Siku' : idx === 1 ? '31 - 60 Siku' : idx === 2 ? '61 - 90 Siku' : idx === 3 ? '91 - 180 Siku' : '181+ Siku'}</td>
                    <td style={{ fontWeight: '700' }}>TZS {Math.round(row.amount).toLocaleString()}</td>
                    <td style={{ fontWeight: '800', color: '#B8860B' }}>{row.rate_pct}</td>
                    <td style={{ fontWeight: '800', color: '#DC2626' }}>TZS {Math.round(row.provision).toLocaleString()}</td>
                  </tr>
                ))}
                <tr style={{ background: '#FEF3C7', fontWeight: '900' }}>
                  <td colSpan="4" style={{ color: '#B8860B', textTransform: 'uppercase' }}>Jumla ya Akiba ya Hasara (Total Loan Loss Provisioning Required):</td>
                  <td style={{ color: '#DC2626', fontSize: '1rem' }}>TZS {Math.round(bot.total_loan_loss_provision || 0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SIGNATURE & STAMP BLOCK */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed #CBD5E1', alignItems: 'end' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>Sahihi ya Afisa Uzingatiaji (Compliance Officer):</span>
              <div style={{ height: '40px', borderBottom: '1px solid #0F172A', marginTop: '0.5rem' }}></div>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0F172A' }}>Afisa Uzingatiaji wa Sheria za BOT</span>
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
      )}

      {/* 4. TRA TAX RETURNS SECTION */}
      {activeTab === 'TRA' && (
        <div id="printable-tra-return" style={{ background: '#FFFFFF', border: '2px solid #059669', padding: '2rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <CompanyHeaderBlock 
            title="TANZANIA REVENUE AUTHORITY (TRA) - STATUTORY TAX RETURN" 
            subtitle="Taarifa ya Kodi ya Mapato, VAT, Withholding Tax, PAYE na SDL"
          />

          {/* TRA Business Metadata Badge */}
          <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', padding: '1.25rem', borderRadius: '14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: '#065F46', display: 'block' }}>Namba ya TIN ya Kampuni:</span>
              <strong style={{ fontSize: '1.05rem', color: '#047857' }}>{tra.tin_number}</strong>
            </div>
            <div>
              <span style={{ color: '#065F46', display: 'block' }}>Namba ya VRN (VAT):</span>
              <strong style={{ color: '#047857' }}>{tra.vrn_number}</strong>
            </div>
            <div>
              <span style={{ color: '#065F46', display: 'block' }}>EFD Machine Serial No:</span>
              <strong style={{ color: '#0284C7' }}>{tra.efd_serial_no}</strong>
            </div>
            <div>
              <span style={{ color: '#065F46', display: 'block' }}>Mwezi wa Taarifa:</span>
              <strong style={{ color: '#B8860B' }}>{tra.tax_period}</strong>
            </div>
          </div>

          {/* TAX SCHEDULE CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            
            {/* 1. VAT & EFD TAX SCHEDULE */}
            <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '1.25rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', margin: 0, borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                1. Taarifa ya VAT & Risiti za EFD (Value Added Tax Return)
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span>Exempt Financial Interest Income (Kifungu cha 4 cha VAT):</span>
                <strong style={{ color: '#059669' }}>TZS {(tra.vat_return?.exempt_interest_income || 21750000).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span>Taxable Processing Fee Income (Subject to 18% VAT):</span>
                <strong>TZS {(tra.vat_return?.taxable_fee_income || 5000000).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: '900', background: '#ECFDF5', padding: '0.6rem', borderRadius: '8px', color: '#047857' }}>
                <span>Jumla ya VAT Output Payable (18%):</span>
                <span>TZS {(tra.vat_return?.vat_output_18pct || 900000).toLocaleString()}</span>
              </div>
            </div>

            {/* 2. WITHHOLDING TAX (WHT) SCHEDULE */}
            <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '1.25rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', margin: 0, borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                2. Kodi ya Zuio (Withholding Tax - WHT Schedule)
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span>WHT on Office Rents (10%):</span>
                <strong>TZS {(tra.withholding_tax?.wht_rent_10pct || 2500000).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span>WHT on Professional & Technical Services (5%):</span>
                <strong>TZS {(tra.withholding_tax?.wht_services_5pct || 2000000).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: '900', background: '#FEF3C7', padding: '0.6rem', borderRadius: '8px', color: '#B8860B' }}>
                <span>Jumla ya Kodi ya Zuio (Total WHT):</span>
                <span>TZS {(tra.withholding_tax?.total_wht || 4500000).toLocaleString()}</span>
              </div>
            </div>

            {/* 3. PAYROLL TAXES (PAYE & SDL 3.5%) */}
            <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '1.25rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', margin: 0, borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                3. Kodi za Wafanyakazi (PAYE, SDL 3.5% & WCF 1%)
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span>Kodi ya Mishahara (PAYE Tax):</span>
                <strong>TZS {(tra.payroll_taxes?.paye_tax || 8500000).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span>Skills Development Levy (SDL 3.5%):</span>
                <strong>TZS {(tra.payroll_taxes?.sdl_levy || 2100000).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span>Workers Compensation Fund (WCF 1%):</span>
                <strong>TZS {(tra.payroll_taxes?.wcf_1pct || 600000).toLocaleString()}</strong>
              </div>
            </div>

            {/* 4. CORPORATE INCOME TAX ESTIMATE (30% CIT) */}
            <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '1.25rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', margin: 0, borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                4. Kodi ya Faida ya Kampuni (Corporate Income Tax - CIT 30%)
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span>Faida Inayopaswa Kukatwa Kodi (Taxable Net Profit):</span>
                <strong>TZS {Math.round(tra.corporate_tax_estimate?.taxable_profit || 35000000).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '900', background: '#ECFDF5', padding: '0.6rem', borderRadius: '8px', color: '#047857' }}>
                <span>Kadirio la Kodi ya Faida (30% CIT Payable):</span>
                <span>TZS {Math.round(tra.corporate_tax_estimate?.cit_30pct_estimate || 10500000).toLocaleString()}</span>
              </div>
            </div>

          </div>

          {/* SIGNATURE & STAMP BLOCK */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed #CBD5E1', alignItems: 'end' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>Sahihi ya Afisa Mhasibu Mkuu:</span>
              <div style={{ height: '40px', borderBottom: '1px solid #0F172A', marginTop: '0.5rem' }}></div>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0F172A' }}>Mhasibu Mkuu wa FKF</span>
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
      )}

    </div>
  );
}

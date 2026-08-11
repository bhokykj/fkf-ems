import React, { useState } from 'react';
import { DollarSign, X, CheckCircle2, Building2, Smartphone, Landmark, Printer, FileText, AlertCircle, ShieldCheck } from 'lucide-react';
import CompanyHeaderBlock from './CompanyHeaderBlock';

export default function DisburseLoanModal({ loan, onClose, onConfirmDisburse }) {
  const [channel, setChannel] = useState('MOBILE_MONEY'); // 'CASH' | 'MOBILE_MONEY' | 'BANK'
  const borrower = loan?.borrower_detail || {};

  // Mobile Money fields
  const [mobileProvider, setMobileProvider] = useState('M-Pesa'); // 'M-Pesa' | 'Tigo Pesa' | 'Airtel Money' | 'HaloPesa' | 'AzamPesa'
  const [mobileNumber, setMobileNumber] = useState(borrower.phone || '');
  const [mobileAccountName, setMobileAccountName] = useState(`${borrower.first_name || ''} ${borrower.last_name || ''}`);
  const [mobileRefCode, setMobileRefCode] = useState(`TXN-MP-${Math.floor(Math.random()*900000+100000)}`);

  // Bank Transfer fields
  const [bankName, setBankName] = useState('CRDB Bank Plc');
  const [accountNumber, setAccountNumber] = useState('0150298374100');
  const [accountName, setAccountName] = useState(`${borrower.first_name || ''} ${borrower.last_name || ''}`);
  const [bankRefCode, setBankRefCode] = useState(`TISS-TZ-${Math.floor(Math.random()*900000+100000)}`);

  // Cash fields
  const [tellerName, setTellerName] = useState('Afisa Mweka Hazina (Teller)');
  const [tellerRole, setTellerRole] = useState('Mweka Hazina / Teller');
  const [disbursedBranch, setDisbursedBranch] = useState(loan?.branch_detail?.name || 'Tawi la Dar es Salaam HQ');
  const [cashVoucherNo, setCashVoucherNo] = useState(`VOUCH-${Math.floor(Math.random()*900000+100000)}`);

  // Fees & Deductions
  const principal = parseFloat(loan?.principal_amount || 1000000);
  const processingFee = principal * 0.02; // 2% processing fee
  const insuranceFee = principal * 0.01;  // 1% insurance
  const netDisbursed = principal - processingFee - insuranceFee;

  const [disbursedSuccess, setDisbursedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const disburseDetails = {
      disbursement_method: channel === 'BANK' ? 'BANK_TRANSFER' : channel === 'CASH' ? 'CASH' : 'MOBILE_MONEY',
      disbursement_provider: channel === 'MOBILE_MONEY' ? mobileProvider : channel === 'BANK' ? bankName : 'Tawi Cash Vault',
      disbursement_account_no: channel === 'MOBILE_MONEY' ? mobileNumber : channel === 'BANK' ? accountNumber : cashVoucherNo,
      disbursed_by_staff_name: channel === 'CASH' ? tellerName : 'Afisa Mikopo (Loan Officer)',
      disbursed_by_staff_role: channel === 'CASH' ? tellerRole : 'Branch Management',
      disbursed_branch_name: disbursedBranch,
      channel,
      principal,
      processingFee,
      insuranceFee,
      netDisbursed,
      reference: channel === 'MOBILE_MONEY' ? mobileRefCode : channel === 'BANK' ? bankRefCode : cashVoucherNo,
      provider: channel === 'MOBILE_MONEY' ? mobileProvider : channel === 'BANK' ? bankName : 'Tawi Cash Vault',
      recipient: channel === 'MOBILE_MONEY' ? `${mobileAccountName} (${mobileNumber})` : channel === 'BANK' ? `${accountName} (${accountNumber})` : tellerName
    };
    onConfirmDisburse(loan.id, disburseDetails);
    setDisbursedSuccess(true);
  };

  const handlePrintVoucher = () => {
    window.print();
  };

  if (!loan) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1100, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="modal-content" style={{ maxWidth: '750px', width: '100%', maxHeight: '92vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '24px', border: '2px solid #0F172A', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', color: '#0F172A' }}>
        
        {/* Header Strip */}
        <div style={{ background: '#0F172A', color: '#FFFFFF', padding: '1.25rem 1.75rem', borderRadius: '20px 20px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#059669', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
              <DollarSign size={22} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                Utoaji wa Fedha za Mkopo (Loan Disbursement)
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Mkopo Namba: LN-TZ-{loan.id} • Mkopaji: {borrower.first_name} {borrower.last_name}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {disbursedSuccess ? (
            /* PRINTABLE DISBURSEMENT VOUCHER RECEIPT */
            <div id="printable-disbursement-voucher" style={{ background: '#FFFFFF', border: '2px solid #0F172A', padding: '1.75rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-1rem' }}>
                <button onClick={handlePrintVoucher} className="btn-primary" style={{ padding: '0.6rem 1.3rem', fontSize: '0.85rem', background: '#059669' }}>
                  <Printer size={16} /> Print Disbursement Voucher (PDF)
                </button>
              </div>

              <CompanyHeaderBlock 
                title="HATI RASMI YA UTOAJI WA FEDHA (LOAN DISBURSEMENT VOUCHER)" 
                subtitle={`Voucher Namba: DISB-TZ-${loan.id} | Tarehe: ${new Date().toLocaleDateString()}`}
              />

              <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', padding: '1.25rem', borderRadius: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ color: '#047857', display: 'block' }}>Mkopaji (Beneficiary):</span>
                  <strong style={{ fontSize: '1.1rem', color: '#047857' }}>{borrower.first_name} {borrower.last_name}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#065F46' }}>NIDA: {borrower.id_number} • Simu: {borrower.phone}</div>
                </div>
                <div>
                  <span style={{ color: '#047857', display: 'block' }}>Kiasi Halisi Kilichotolewa (Net Disbursed):</span>
                  <strong style={{ fontSize: '1.3rem', color: '#047857' }}>TZS {netDisbursed.toLocaleString()}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#065F46' }}>Kiasi cha Mkopo: TZS {principal.toLocaleString()}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.85rem' }}>
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ color: '#64748B' }}>Njia ya Malipo: <strong style={{ color: '#0F172A' }}>{channel === 'MOBILE_MONEY' ? '📱 Simu ya Mkononi' : channel === 'BANK' ? '🏦 Bank Transfer' : '💵 Cash / Pesa Taslimu'}</strong></span>
                  <span style={{ color: '#64748B' }}>Mtoa Huduma: <strong style={{ color: '#0F172A' }}>{channel === 'MOBILE_MONEY' ? mobileProvider : channel === 'BANK' ? bankName : 'Tawi Vault'}</strong></span>
                  <span style={{ color: '#64748B' }}>Kumbukumbu / Ref Code: <strong style={{ color: '#0284C7' }}>{channel === 'MOBILE_MONEY' ? mobileRefCode : channel === 'BANK' ? bankRefCode : cashVoucherNo}</strong></span>
                </div>

                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ color: '#64748B' }}>Ada ya Processing (2%): <strong>TZS {processingFee.toLocaleString()}</strong></span>
                  <span style={{ color: '#64748B' }}>Ada ya Bima (1%): <strong>TZS {insuranceFee.toLocaleString()}</strong></span>
                  <span style={{ color: '#64748B' }}>Hali ya Utowaji: <strong style={{ color: '#059669' }}>✓ DISBURSED SUCCESSFUL</strong></span>
                </div>
              </div>

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
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0F172A' }}>Mkurugenzi Mkuu (MD)</span>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: '700', marginBottom: '0.2rem' }}>Muhuri wa Kampuni:</span>
                  <img src="/company-stamp.jpg" alt="FKF Seal Stamp" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #CBD5E1' }} />
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button onClick={onClose} className="btn-secondary" style={{ padding: '0.6rem 2rem' }}>
                  Funga Ukurasa (Close)
                </button>
              </div>
            </div>

          ) : (

            /* FORM TO SELECT CHANNEL & ENTER PAYMENT CODES */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem' }}>Kiasi cha Mkopo:</span>
                  <strong style={{ fontSize: '1.1rem', color: '#0F172A' }}>TZS {principal.toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem' }}>Makato (Processing + Insurance):</span>
                  <strong style={{ fontSize: '1.1rem', color: '#DC2626' }}>- TZS {(processingFee + insuranceFee).toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem' }}>Kiasi cha Kutuma kwa Mkopaji:</span>
                  <strong style={{ fontSize: '1.25rem', color: '#059669' }}>TZS {netDisbursed.toLocaleString()}</strong>
                </div>
              </div>

              {/* Step 1: Select Channel */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.6rem' }}>
                  Chagua Njia ya Kutuma/Kutoa Fedha (Disbursement Channel):
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  
                  {/* Channel Option 1: Mobile Money */}
                  <div 
                    onClick={() => setChannel('MOBILE_MONEY')} 
                    style={{ background: channel === 'MOBILE_MONEY' ? '#ECFDF5' : '#F8FAFC', border: channel === 'MOBILE_MONEY' ? '2px solid #059669' : '1px solid #CBD5E1', padding: '1rem', borderRadius: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                  >
                    <Smartphone size={28} color={channel === 'MOBILE_MONEY' ? '#059669' : '#64748B'} />
                    <span style={{ fontWeight: '800', fontSize: '0.88rem', color: channel === 'MOBILE_MONEY' ? '#047857' : '#334155' }}>Simu ya Mkononi</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>M-Pesa, Tigo, Airtel, Halo, Azam</span>
                  </div>

                  {/* Channel Option 2: Bank Transfer */}
                  <div 
                    onClick={() => setChannel('BANK')} 
                    style={{ background: channel === 'BANK' ? '#EFF6FF' : '#F8FAFC', border: channel === 'BANK' ? '2px solid #0284C7' : '1px solid #CBD5E1', padding: '1rem', borderRadius: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                  >
                    <Landmark size={28} color={channel === 'BANK' ? '#0284C7' : '#64748B'} />
                    <span style={{ fontWeight: '800', fontSize: '0.88rem', color: channel === 'BANK' ? '#0369A1' : '#334155' }}>Benki (Bank Transfer)</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>CRDB, NMB, NBC, KCB, Absa</span>
                  </div>

                  {/* Channel Option 3: Cash */}
                  <div 
                    onClick={() => setChannel('CASH')} 
                    style={{ background: channel === 'CASH' ? '#FEF3C7' : '#F8FAFC', border: channel === 'CASH' ? '2px solid #B8860B' : '1px solid #CBD5E1', padding: '1rem', borderRadius: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                  >
                    <Building2 size={28} color={channel === 'CASH' ? '#B8860B' : '#64748B'} />
                    <span style={{ fontWeight: '800', fontSize: '0.88rem', color: channel === 'CASH' ? '#B8860B' : '#334155' }}>Cash / Pesa Taslimu</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Vault ya Tawi / Kaunta</span>
                  </div>

                </div>
              </div>

              {/* Step 2: Channel Specific Fields */}

              {/* MOBILE MONEY FIELDS */}
              {channel === 'MOBILE_MONEY' && (
                <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', padding: '1.25rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#047857', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    📱 Maelezo ya Simu ya Mkononi (Mobile Wallet Details):
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#065F46', marginBottom: '0.3rem' }}>Mtoa Huduma (Mobile Operator):</label>
                      <select 
                        value={mobileProvider} 
                        onChange={(e) => setMobileProvider(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', background: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A', fontWeight: '700' }}
                      >
                        <option value="M-Pesa">Vodacom M-Pesa</option>
                        <option value="Tigo Pesa">Tigo Pesa / MixByYas</option>
                        <option value="Airtel Money">Airtel Money</option>
                        <option value="HaloPesa">HaloPesa (Halotel)</option>
                        <option value="AzamPesa">AzamPesa</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#065F46', marginBottom: '0.3rem' }}>Namba ya Simu ya Mkopaji:</label>
                      <input 
                        type="text" 
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', background: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A', fontWeight: '700' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#065F46', marginBottom: '0.3rem' }}>Jina kwenye Akaunti ya Simu:</label>
                      <input 
                        type="text" 
                        required
                        value={mobileAccountName}
                        onChange={(e) => setMobileAccountName(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', background: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#065F46', marginBottom: '0.3rem' }}>Kumbukumbu / Ref Code (Transaction ID):</label>
                      <input 
                        type="text" 
                        required
                        value={mobileRefCode}
                        onChange={(e) => setMobileRefCode(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', background: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '8px', fontSize: '0.85rem', color: '#059669', fontWeight: '800' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* BANK TRANSFER FIELDS */}
              {channel === 'BANK' && (
                <div style={{ background: '#EFF6FF', border: '1px solid #93C5FD', padding: '1.25rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E40AF', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    🏦 Maelezo ya Akaunti ya Benki (Bank Account Details):
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#1E3A8A', marginBottom: '0.3rem' }}>Jina la Benki (Bank Name):</label>
                      <select 
                        value={bankName} 
                        onChange={(e) => setBankName(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', background: '#FFFFFF', border: '1px solid #BFDBFE', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A', fontWeight: '700' }}
                      >
                        <option value="CRDB Bank Plc">CRDB Bank Plc</option>
                        <option value="NMB Bank Plc">NMB Bank Plc</option>
                        <option value="NBC Tanzania">NBC Tanzania</option>
                        <option value="KCB Bank Tanzania">KCB Bank Tanzania</option>
                        <option value="Absa Bank Tanzania">Absa Bank Tanzania</option>
                        <option value="Stanbic Bank">Stanbic Bank Tanzania</option>
                        <option value="Equity Bank Tanzania">Equity Bank Tanzania</option>
                        <option value="Azania Bank">Azania Bank</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#1E3A8A', marginBottom: '0.3rem' }}>Namba ya Akaunti (Account Number):</label>
                      <input 
                        type="text" 
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', background: '#FFFFFF', border: '1px solid #BFDBFE', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A', fontWeight: '700' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#1E3A8A', marginBottom: '0.3rem' }}>Jina la Mmiliki wa Akaunti:</label>
                      <input 
                        type="text" 
                        required
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', background: '#FFFFFF', border: '1px solid #BFDBFE', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#1E3A8A', marginBottom: '0.3rem' }}>Ref Namba ya Risiti ya Benki (TISS/EFT Ref):</label>
                      <input 
                        type="text" 
                        required
                        value={bankRefCode}
                        onChange={(e) => setBankRefCode(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', background: '#FFFFFF', border: '1px solid #BFDBFE', borderRadius: '8px', fontSize: '0.85rem', color: '#0284C7', fontWeight: '800' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CASH FIELDS */}
              {channel === 'CASH' && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '1.25rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#B8860B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    💵 Malipo ya Cash Vault (Cash Disbursement at Branch):
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#92400E', marginBottom: '0.3rem' }}>Jina la Afisa Aliyekabidhi Cash:</label>
                      <input 
                        type="text" 
                        required
                        value={tellerName}
                        onChange={(e) => setTellerName(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', background: '#FFFFFF', border: '1px solid #FCD34D', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A', fontWeight: '700' }}
                        placeholder="Mfano: Juma Ally Mwakipesile"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#92400E', marginBottom: '0.3rem' }}>Cheo cha Afisa Aliyekabidhi Cash:</label>
                      <input 
                        type="text" 
                        required
                        value={tellerRole}
                        onChange={(e) => setTellerRole(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', background: '#FFFFFF', border: '1px solid #FCD34D', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A', fontWeight: '700' }}
                        placeholder="Mfano: Afisa Mweka Hazina / Branch Manager"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#92400E', marginBottom: '0.3rem' }}>Tawi Aliyopokelea Pesa Taslimu (Branch):</label>
                      <input 
                        type="text" 
                        required
                        value={disbursedBranch}
                        onChange={(e) => setDisbursedBranch(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', background: '#FFFFFF', border: '1px solid #FCD34D', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A', fontWeight: '700' }}
                        placeholder="Mfano: Tawi la Dar es Salaam HQ"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#92400E', marginBottom: '0.3rem' }}>Namba ya Hati ya Cashier (Voucher No):</label>
                      <input 
                        type="text" 
                        required
                        value={cashVoucherNo}
                        onChange={(e) => setCashVoucherNo(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', background: '#FFFFFF', border: '1px solid #FCD34D', borderRadius: '8px', fontSize: '0.85rem', color: '#B8860B', fontWeight: '800' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.65rem 1.5rem' }}>
                  Ghairi (Cancel)
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.8rem', background: '#059669', fontSize: '0.9rem', fontWeight: '800' }}>
                  <CheckCircle2 size={18} /> Thabitisha & Disburse TZS {netDisbursed.toLocaleString()}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}

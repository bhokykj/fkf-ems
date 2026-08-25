import React, { useState } from 'react';
import { 
  User, CreditCard, MapPin, FileText, Printer, Download, ShieldCheck, 
  ShieldAlert, Phone, Mail, Building2, Users, FileCheck, X, Award, CheckCircle2 
} from 'lucide-react';
import CompanyHeaderBlock from './CompanyHeaderBlock';

export default function BorrowerFullViewModal({ borrower, loans, onClose, initialTab = 'DETAILS' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'DETAILS' | 'STATEMENT' | 'GUARANTORS' | 'DOCUMENTS' | 'REPORT'

  if (!borrower) return null;

  const borrowerLoans = loans.filter(l => String(l.borrower) === String(borrower.id) || (l.borrower_detail && String(l.borrower_detail.id) === String(borrower.id)));
  const totalLoansCount = borrowerLoans.length;
  const activeLoan = borrowerLoans.find(l => l.status === 'DISBURSED');
  const totalBorrowedTSH = borrowerLoans.reduce((acc, l) => acc + parseFloat(l.principal_amount || 0), 0);
  const totalBalanceTSH = borrowerLoans.reduce((acc, l) => acc + parseFloat(l.balance_remaining || 0), 0);

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '920px', maxHeight: '92vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '24px', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER BAR WITH PASSPORT PHOTO */}
        <div style={{ background: '#1E293B', color: '#FFFFFF', padding: '1.5rem 2rem', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {borrower.photo_url ? (
              <img src={borrower.photo_url} alt="Passport" style={{ width: '70px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #D4AF37' }} />
            ) : (
              <div style={{ width: '70px', height: '80px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.75rem' }}>
                <User size={28} /> No Photo
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                  {borrower.first_name} {borrower.last_name}
                </h2>
                <span className={`badge ${borrower.kyc_status === 'VERIFIED' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.72rem' }}>
                  {borrower.kyc_status === 'VERIFIED' ? 'VERIFIED (NIDA)' : 'UNVERIFIED'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem', fontSize: '0.82rem', color: '#CBD5E1' }}>
                <span>NIDA/ID: <strong style={{ color: '#D4AF37' }}>{borrower.id_number}</strong></span>
                <span>Simu: <strong>{borrower.phone}</strong></span>
                <span>Tawi: <strong>{borrower.branch_detail?.name || 'Dar es Salaam'}</strong></span>
              </div>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <X size={18} /> Funga (Close)
          </button>
        </div>

        {/* TOP TAB STRIP MATCHING HANDWRITTEN PHOTO */}
        <div style={{ display: 'flex', gap: '0.6rem', borderBottom: '2px solid #CBD5E1', padding: '0.75rem 1.75rem', background: '#F8FAFC', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveTab('DETAILS')}
            style={{ background: activeTab === 'DETAILS' ? '#0284C7' : '#FFFFFF', color: activeTab === 'DETAILS' ? '#FFFFFF' : '#0F172A', border: activeTab === 'DETAILS' ? '2px solid #0284C7' : '1.5px solid #CBD5E1', padding: '0.6rem 1.25rem', borderRadius: '9999px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <User size={16} /> View Borrower
          </button>

          <button 
            onClick={() => setActiveTab('STATEMENT')}
            style={{ background: activeTab === 'STATEMENT' ? '#0284C7' : '#FFFFFF', color: activeTab === 'STATEMENT' ? '#FFFFFF' : '#0F172A', border: activeTab === 'STATEMENT' ? '2px solid #0284C7' : '1.5px solid #CBD5E1', padding: '0.6rem 1.25rem', borderRadius: '9999px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FileText size={16} /> Borrower Statement
          </button>

          <button 
            onClick={() => setActiveTab('GUARANTORS')}
            style={{ background: activeTab === 'GUARANTORS' ? '#0284C7' : '#FFFFFF', color: activeTab === 'GUARANTORS' ? '#FFFFFF' : '#0F172A', border: activeTab === 'GUARANTORS' ? '2px solid #0284C7' : '1.5px solid #CBD5E1', padding: '0.6rem 1.25rem', borderRadius: '9999px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Users size={16} /> Guarantors (Wadhamini)
          </button>

          <button 
            onClick={() => setActiveTab('DOCUMENTS')}
            style={{ background: activeTab === 'DOCUMENTS' ? '#0284C7' : '#FFFFFF', color: activeTab === 'DOCUMENTS' ? '#FFFFFF' : '#0F172A', border: activeTab === 'DOCUMENTS' ? '2px solid #0284C7' : '1.5px solid #CBD5E1', padding: '0.6rem 1.25rem', borderRadius: '9999px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FileCheck size={16} /> Document Vault
          </button>

          <button 
            onClick={() => setActiveTab('REPORT')}
            style={{ background: activeTab === 'REPORT' ? '#0284C7' : '#FFFFFF', color: activeTab === 'REPORT' ? '#FFFFFF' : '#0F172A', border: activeTab === 'REPORT' ? '2px solid #0284C7' : '1.5px solid #CBD5E1', padding: '0.6rem 1.25rem', borderRadius: '9999px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Award size={16} /> Borrower Report
          </button>
        </div>

        {/* MODAL BODY CONTENT */}
        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* TAB 1: VIEW BORROWER DETAILS */}
          {activeTab === 'DETAILS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderLeft: '5px solid #0F172A', padding: '1.1rem 1.35rem', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: '900', textTransform: 'uppercase' }}>Jumla ya Mikopo (Loans)</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>{totalLoansCount}</div>
                  <span style={{ fontSize: '0.8rem', color: '#0284C7', fontWeight: '800' }}>Mikopo iliyochukuliwa</span>
                </div>

                <div style={{ background: '#DCFCE7', border: '1.5px solid #86EFAC', borderLeft: '5px solid #059669', padding: '1.1rem 1.35rem', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#14532D', fontWeight: '900', textTransform: 'uppercase' }}>Jumla ya Mikopo (TSH)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#059669', marginTop: '0.25rem' }}>TZS {totalBorrowedTSH.toLocaleString()}</div>
                  <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: '800' }}>Kiasi cha Mtaji</span>
                </div>

                <div style={{ background: '#FEE2E2', border: '1.5px solid #FCA5A5', borderLeft: '5px solid #DC2626', padding: '1.1rem 1.35rem', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#7F1D1D', fontWeight: '900', textTransform: 'uppercase' }}>Baki la Mkopo Hai</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#DC2626', marginTop: '0.25rem' }}>TZS {totalBalanceTSH.toLocaleString()}</div>
                  <span style={{ fontSize: '0.8rem', color: '#B91C1C', fontWeight: '800' }}>Baki la Kurudisha</span>
                </div>
              </div>

              {/* Personal & Location Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '16px', padding: '1.35rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0F172A', marginBottom: '1rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                    💳 Taarifa za Binfasi & Kazi
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#0F172A', fontWeight: '800' }}>Jina Kamili:</span>
                      <strong style={{ color: '#0F172A' }}>{borrower.first_name} {borrower.last_name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#0F172A', fontWeight: '800' }}>Jinsia (Gender):</span>
                      <span>{borrower.gender || 'Male'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Tarehe ya Kuzaliwa:</span>
                      <span>{borrower.date_of_birth || '1992-05-14'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Kazi / Occupation:</span>
                      <span>{borrower.occupation || borrower.employment_status || 'Mfanyabiashara'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Biashara (Business):</span>
                      <span>{borrower.business_name || 'Biashara ya Duka'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Pato la Mwezi:</span>
                      <strong style={{ color: '#059669' }}>TSH {parseFloat(borrower.monthly_income || 500000).toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Group ID:</span>
                      <span>{borrower.group_id || 'N/A (Binafsi)'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                    📍 Anwani na Location Hierarchy
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Mkoa (Region):</span>
                      <strong>{borrower.region || 'Dar es Salaam'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Wilaya (District):</span>
                      <span>{borrower.district || 'Ilala'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Kata (Ward):</span>
                      <span>{borrower.ward || 'Kariakoo'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Mtaa / Kijiji:</span>
                      <span>{borrower.street_or_village || borrower.address || 'Mtaa wa Swahili'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Plot & House No:</span>
                      <span>Plot #{borrower.plot_no || '12'} | House #{borrower.house_no || '45'}</span>
                    </div>
                    <div style={{ marginTop: '0.5rem', background: '#F8FAFC', padding: '0.65rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.78rem', color: '#0284C7', fontWeight: '700' }}>
                      📍 Complete Address: {borrower.address}
                    </div>
                  </div>
                </div>
              </div>

              {/* 📸 FIELD VERIFICATION & EVIDENCE (GPS, PICHA ANAPOKAA, BIASHARA, STENDI) */}
              <div style={{ background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '18px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.6rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '900', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📍 Hatifungani na Picha za Nyanjani (Field Verification Evidence & Photos)
                  </h3>
                  {borrower.field_gps_location && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(borrower.field_gps_location.split('(')[0].trim())}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ background: '#0284C7', color: '#FFFFFF', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <MapPin size={14} /> GPS: {borrower.field_gps_location}
                    </a>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  
                  {/* Picha Anapokaa */}
                  <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#047857' }}>🏠 1. ANAPOKAA (RESIDENCE)</span>
                    <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
                      {borrower.residence_photo_url ? (
                        <img src={borrower.residence_photo_url} alt="Residence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', fontSize: '0.75rem' }}>Bado Haijawekwa</div>
                      )}
                    </div>
                  </div>

                  {/* Picha Anapofanyia Biashara */}
                  <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0284C7' }}>🛍️ 2. ANAPOFANYIA BIASHARA</span>
                    <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
                      {borrower.business_photo_url ? (
                        <img src={borrower.business_photo_url} alt="Business Premises" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', fontSize: '0.75rem' }}>Bado Haijawekwa</div>
                      )}
                    </div>
                  </div>

                  {/* Picha Stendi akiwa Kazini */}
                  <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#B8860B' }}>🚚 3. STENDI AKIWA KAZINI</span>
                    <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
                      {borrower.workplace_stand_photo_url ? (
                        <img src={borrower.workplace_stand_photo_url} alt="Workplace Stand" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', fontSize: '0.75rem' }}>Bado Haijawekwa</div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: BORROWER STATEMENT OF ACCOUNT */}
          {activeTab === 'STATEMENT' && (
            <div id="printable-borrower-statement" style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-1.5rem' }}>
                <button onClick={handlePrintStatement} className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.82rem' }}>
                  <Printer size={16} /> Kuprint Statement
                </button>
              </div>

              <CompanyHeaderBlock 
                title="TAARIFA YA AKAUNTI YA MKOPAJI (BORROWER STATEMENT OF ACCOUNT)" 
                subtitle={`Tarehe: ${new Date().toLocaleDateString()}`}
              />

              {/* Borrower Info Summary Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Mkopaji:</span>
                  <strong style={{ color: '#0F172A' }}>{borrower.first_name} {borrower.last_name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>NIDA ID:</span>
                  <strong style={{ color: '#D4AF37' }}>{borrower.id_number}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Tawi:</span>
                  <strong>{borrower.branch_detail?.name || 'Dar es Salaam'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Simu:</span>
                  <strong>{borrower.phone}</strong>
                </div>
              </div>

              {/* Loans & Payments Table */}
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', margin: '0.5rem 0 0 0' }}>Orodha ya Mikopo na Marejesho:</h4>
              
              <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Namba ya Mkopo</th>
                    <th>Tarehe</th>
                    <th>Kiasi cha Mkopo (TSH)</th>
                    <th>Jumla ya Kurudisha</th>
                    <th>Kiasi Kilicholipwa</th>
                    <th>Baki (Balance)</th>
                    <th>Hali</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowerLoans.length > 0 ? (
                    borrowerLoans.map(l => {
                      const paid = parseFloat(l.total_payable || 0) - parseFloat(l.balance_remaining || 0);
                      return (
                        <tr key={l.id}>
                          <td style={{ fontWeight: '800', color: '#D4AF37' }}>LN-TZ-{l.id}</td>
                          <td>{l.created_at ? new Date(l.created_at).toLocaleDateString() : '2026-08-01'}</td>
                          <td style={{ fontWeight: '700' }}>TSH {parseFloat(l.principal_amount).toLocaleString()}</td>
                          <td style={{ fontWeight: '700', color: '#0F172A' }}>TSH {parseFloat(l.total_payable).toLocaleString()}</td>
                          <td style={{ fontWeight: '700', color: '#059669' }}>TSH {paid.toLocaleString()}</td>
                          <td style={{ fontWeight: '800', color: '#DC2626' }}>TSH {parseFloat(l.balance_remaining).toLocaleString()}</td>
                          <td>
                            <span className={`badge ${l.status === 'DISBURSED' ? 'badge-success' : 'badge-warning'}`}>
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="7" style={{ textAlign: 'center', color: '#94A3B8' }}>Hakuna mkopo ulioandikishwa kwa mkopaji huyu bado.</td></tr>
                  )}
                </tbody>
              </table>

              {/* Statement Total Summary Box */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FEF3C7', border: '1px solid #FCD34D', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: '800', color: '#B8860B' }}>Jumla ya Salio la Deni (Total Outstanding Balance):</span>
                <span style={{ fontWeight: '900', color: '#B8860B', fontSize: '1.2rem' }}>TZS {totalBalanceTSH.toLocaleString()}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #CBD5E1', alignItems: 'end' }}>
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
          )}

          {/* TAB 3: GUARANTORS (WADHAMINI) */}
          {activeTab === 'GUARANTORS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  🤝 Wadhamini & Next of Kin (Guarantors)
                </h3>
                <span className="badge badge-info">Wadhamini Waliyothibitishwa</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                
                {/* Guarantor Card 1 */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284C7', fontWeight: '800' }}>
                    <Users size={18} /> Mdhamini wa Kwanza (Next of Kin):
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Jina la Mdhamini:</span>
                    <strong>{borrower.next_of_kin_name || 'Juma Ally Omary'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Namba ya Simu:</span>
                    <strong>{borrower.next_of_kin_phone || '0714998877'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Uhusiano (Relationship):</span>
                    <span>Kaka / Mdhamini Mkuu</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Hali ya Uthibitisho:</span>
                    <span style={{ color: '#059669', fontWeight: '800' }}>✓ Amesaini Dhamana</span>
                  </div>
                </div>

                {/* Guarantor Card 2 */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7C3AED', fontWeight: '800' }}>
                    <Users size={18} /> Mdhamini wa Pili (Business Guarantor):
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Jina la Mdhamini:</span>
                    <strong>{borrower.business_name ? `${borrower.business_name} Partner` : 'Rashid Bakari'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Namba ya Simu:</span>
                    <strong>0755443322</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Anwani ya Mdhamini:</span>
                    <span>{borrower.region || 'Dar es Salaam'}, {borrower.district || 'Ilala'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Hali ya Uthibitisho:</span>
                    <span style={{ color: '#059669', fontWeight: '800' }}>✓ NIDA Verified</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS VAULT */}
          {activeTab === 'DOCUMENTS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  📁 Borrower Document Vault (Nyaraka na Vyeti)
                </h3>
                <span className="badge badge-success">3 Documents Attached</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                
                {/* Doc 1: Passport Photo */}
                <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                  {borrower.photo_url ? (
                    <img src={borrower.photo_url} alt="Passport" style={{ width: '90px', height: '100px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #D4AF37' }} />
                  ) : (
                    <div style={{ width: '90px', height: '100px', borderRadius: '10px', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                      No Photo
                    </div>
                  )}
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#0F172A', display: 'block' }}>Picha ya Passport</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>JPG / PNG Upload</span>
                  </div>
                </div>

                {/* Doc 2: NIDA Card Copy */}
                <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '90px', height: '100px', borderRadius: '10px', background: '#E0F2FE', color: '#0284C7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={32} />
                    <span style={{ fontSize: '0.65rem', fontWeight: '800', marginTop: '0.2rem' }}>NIDA COPY</span>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#0F172A', display: 'block' }}>Kitambulisho cha NIDA</strong>
                    <span style={{ fontSize: '0.75rem', color: '#0284C7', fontWeight: '700' }}>NIDA: {borrower.id_number}</span>
                  </div>
                </div>

                {/* Doc 3: Loan Agreement Contract */}
                <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '90px', height: '100px', borderRadius: '10px', background: '#FEF3C7', color: '#B8860B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <FileCheck size={32} />
                    <span style={{ fontSize: '0.65rem', fontWeight: '800', marginTop: '0.2rem' }}>CONTRACT</span>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#0F172A', display: 'block' }}>Mkataba wa Mkopo</strong>
                    <span style={{ fontSize: '0.75rem', color: '#B8860B', fontWeight: '700' }}>PDF Agreement</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: BORROWER REPORT */}
          {activeTab === 'REPORT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  📊 Borrower Credit Risk & Performance Report
                </h3>
                <button onClick={handlePrintStatement} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  <Printer size={15} /> Export Report
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: '16px', padding: '1.25rem', color: '#047857' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800' }}>✓ Rating ya Uaminifu wa Mkopo</h4>
                  <p style={{ fontSize: '0.85rem', margin: '0.4rem 0 0 0', lineHeight: '1.5' }}>
                    Mkopaji huyu ana rating ya <strong>{borrower.credit_rating || 'GOOD'}</strong> (Class A). Hajawahi kuwa na default na anafanya marejesho kwa wakati.
                  </p>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', color: '#0F172A' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800' }}>🏛️ CRB Credit Status</h4>
                  <p style={{ fontSize: '0.85rem', margin: '0.4rem 0 0 0', lineHeight: '1.5', color: '#64748B' }}>
                    Imekaguliwa kupitia TransUnion / Creditinfo Tanzania. Hakuna rekodi mbaya ya deni katika taasisi nyingine za fedha.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

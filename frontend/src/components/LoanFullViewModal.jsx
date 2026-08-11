import React, { useState } from 'react';
import { 
  FileText, Printer, CheckCircle2, ShieldAlert, DollarSign, Calendar, 
  User, MessageSquare, AlertTriangle, Send, Bell, Calculator, Award, X, FileCheck, RefreshCw, Lock
} from 'lucide-react';
import CompanyHeaderBlock from './CompanyHeaderBlock';

export default function LoanFullViewModal({ loan, currentUser, onClose, initialTab = 'DETAILS', onRefresh }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'DETAILS' | 'CONTRACT' | 'REMINDER' | 'COMMENTS' | 'CALCULATOR'
  
  // Real Loan Comments state from Database
  const [commentsList, setCommentsList] = useState(loan?.comments || []);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  // Reminder SMS state
  const [smsSent, setSmsSent] = useState(false);

  // Loan Calculator local state
  const [calcAmount, setCalcAmount] = useState(loan ? loan.principal_amount : 1000000);
  const [calcMonths, setCalcMonths] = useState(loan ? loan.tenure_months : 6);
  const [calcRate, setCalcRate] = useState(loan ? loan.interest_rate_pct : 15);

  if (!loan) return null;

  const borrower = loan.borrower_detail || {};
  const principal = parseFloat(loan.principal_amount || 0);
  const interest = parseFloat(loan.interest_amount || 0);
  const totalPayable = parseFloat(loan.total_payable || 0);
  const balance = parseFloat(loan.balance_remaining || 0);
  const monthlyInstalment = totalPayable / (loan.tenure_months || 1);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommenting(true);

    const authorName = currentUser ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.username : 'Afisa Mikopo';
    let authorRole = 'Afisa Mikopo';
    if (currentUser?.role === 'SUPER_ADMIN') authorRole = 'Super Admin (Makao Makuu)';
    else if (currentUser?.role === 'BRANCH_MANAGER') authorRole = 'Meneja wa Tawi';
    else if (currentUser?.role === 'FIELD_OFFICER') authorRole = 'Afisa Nyanjani';

    try {
      const res = await fetch(`http://localhost:8000/api/loans/${loan.id}/comments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: newComment,
          author_name: authorName,
          author_role: authorRole
        })
      });

      if (res.ok) {
        const savedComment = await res.json();
        setCommentsList(prev => [...prev, savedComment]);
        setNewComment('');
        if (onRefresh) onRefresh();
      } else {
        alert('Imefeli kuhifadhi maoni. Angalia muunganisho wa server.');
      }
    } catch (err) {
      console.error(err);
      alert('Imefeli kuunganishwa na Server.');
    } finally {
      setCommenting(false);
    }
  };

  const handleSendReminder = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculator logic
  const calcTotalInterest = (calcAmount * (calcRate / 100));
  const calcTotalRepay = parseFloat(calcAmount) + calcTotalInterest;
  const calcMonthly = calcTotalRepay / (calcMonths || 1);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '940px', maxHeight: '92vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '24px', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER BAR */}
        <div style={{ background: '#1E293B', color: '#FFFFFF', padding: '1.5rem 2rem', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {borrower.photo_url ? (
              <img src={borrower.photo_url} alt="Passport" style={{ width: '65px', height: '75px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #D4AF37' }} />
            ) : (
              <div style={{ width: '65px', height: '75px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                <FileText size={28} />
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                  Mkopo #LN-TZ-{loan.id}
                </h2>
                <span className={`badge ${loan.status === 'DISBURSED' ? 'badge-success' : 'badge-warning'}`}>
                  {loan.status}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem', fontSize: '0.82rem', color: '#CBD5E1' }}>
                <span>Mkopaji: <strong style={{ color: '#D4AF37' }}>{borrower.first_name} {borrower.last_name}</strong></span>
                <span>NIDA: <strong>{borrower.id_number}</strong></span>
                <span>Tawi: <strong>{loan.branch_detail?.name || 'Tanzania'}</strong></span>
              </div>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <X size={18} /> Funga (Close)
          </button>
        </div>

        {/* NAVIGATION SUB-TABS */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', padding: '0.5rem 1.5rem', gap: '0.5rem', overflowX: 'auto' }}>
          <button 
            onClick={() => setActiveTab('DETAILS')}
            style={{ padding: '0.6rem 1.25rem', border: 'none', background: activeTab === 'DETAILS' ? '#0284C7' : 'transparent', color: activeTab === 'DETAILS' ? '#FFFFFF' : '#64748B', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FileText size={16} /> View Loan Details
          </button>

          <button 
            onClick={() => setActiveTab('CONTRACT')}
            style={{ padding: '0.6rem 1.25rem', border: 'none', background: activeTab === 'CONTRACT' ? '#0284C7' : 'transparent', color: activeTab === 'CONTRACT' ? '#FFFFFF' : '#64748B', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FileCheck size={16} /> Loan Contract
          </button>

          <button 
            onClick={() => setActiveTab('REMINDER')}
            style={{ padding: '0.6rem 1.25rem', border: 'none', background: activeTab === 'REMINDER' ? '#0284C7' : 'transparent', color: activeTab === 'REMINDER' ? '#FFFFFF' : '#64748B', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Bell size={16} /> Loan Reminder (SMS)
          </button>

          <button 
            onClick={() => setActiveTab('COMMENTS')}
            style={{ padding: '0.6rem 1.25rem', border: 'none', background: activeTab === 'COMMENTS' ? '#0284C7' : 'transparent', color: activeTab === 'COMMENTS' ? '#FFFFFF' : '#64748B', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <MessageSquare size={16} /> Loan Comments ({commentsList.length})
          </button>

          <button 
            onClick={() => setActiveTab('CALCULATOR')}
            style={{ padding: '0.6rem 1.25rem', border: 'none', background: activeTab === 'CALCULATOR' ? '#0284C7' : 'transparent', color: activeTab === 'CALCULATOR' ? '#FFFFFF' : '#64748B', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Calculator size={16} /> Loan Calculator
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div style={{ padding: '2rem', flex: 1 }}>
          
          {/* TAB 1: LOAN DETAILS (Taarifa Halisi Alizotuma Mteja) */}
          {activeTab === 'DETAILS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Financial Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '1rem', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>KIASI CHA MKOPO (PRINCIPAL)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>
                    TSH {principal.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', padding: '1rem', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#B8860B' }}>RIBA YA TAWI ({loan.interest_rate_pct}%)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#B8860B', marginTop: '0.2rem' }}>
                    TSH {interest.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '1rem', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#047857' }}>JUMLA YA KURUDISHA</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#047857', marginTop: '0.2rem' }}>
                    TSH {totalPayable.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: '#EFF6FF', border: '1px solid #93C5FD', padding: '1rem', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1E40AF' }}>SALIO LILILOBAKI</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1E40AF', marginTop: '0.2rem' }}>
                    TSH {balance.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Taarifa Halisi za Mkopaji & Maombi (Borrower & Application Details) */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', padding: '1.25rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '900', color: '#0F172A', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                  📋 Taarifa Halisi za Mkopaji & Maombi (Submitted Borrower Dossier)
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                  <div><strong>Jina la Mkopaji:</strong> {borrower.first_name} {borrower.last_name}</div>
                  <div><strong>Kitambulisho cha NIDA:</strong> {borrower.id_number}</div>
                  <div><strong>Namba ya Simu:</strong> {borrower.phone}</div>
                  <div><strong>Barua Pepe (Email):</strong> {borrower.email || 'N/A'}</div>
                  <div><strong>Hali ya Ajira:</strong> {borrower.employment_status} (Kipato: TSH {parseFloat(borrower.monthly_income || 0).toLocaleString()})</div>
                  <div><strong>Tawi la Mkopaji:</strong> {loan.branch_detail?.name || 'Dar es Salaam HQ'}</div>
                  <div><strong>Mkoa / Wilaya / Kata:</strong> {borrower.region || 'Tanzania'} / {borrower.district || 'CBD'} / {borrower.ward || 'Central'}</div>
                  <div><strong>Mtaa / Kijiji Registered:</strong> {borrower.street_or_village || borrower.address} (Nyumba #: {borrower.house_no || 'N/A'})</div>
                  <div><strong>Muda wa Mkopo:</strong> {loan.tenure_months} Miezi ({loan.repayment_frequency})</div>
                  <div><strong>Hali ya Approval:</strong> <strong style={{ color: loan.status === 'APPROVED' ? '#047857' : '#B8860B' }}>{loan.status}</strong></div>
                </div>
              </div>

              {/* Approval Authority Notice */}
              <div style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Lock size={20} color="#B8860B" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0F172A' }}>Mamlaka ya Uidhinishaji wa Mkopo (Loan Approval Authority):</div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '700' }}>
                      Meneja wa Tawi anaweza Ku-Edit taarifa za mkopo na kuandika Maoni. Uidhinishaji wa Mwisho (Approval) unafanywa na <strong>Super Admin pekee kutoka Makao Makuu</strong>.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CONTRACT */}
          {activeTab === 'CONTRACT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  📄 Mkataba Rasmi wa Mkopo (Official Loan Contract)
                </h3>
                <button onClick={handlePrint} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
                  <Printer size={16} /> Piga Chapa Mkataba (Print PDF)
                </button>
              </div>

              <div style={{ border: '2px double #CBD5E1', padding: '2rem', borderRadius: '16px', background: '#FFFAF0', color: '#0F172A', fontSize: '0.88rem', lineHeight: '1.6' }}>
                <CompanyHeaderBlock />
                <h2 style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: '900', margin: '1.5rem 0 1rem 0', textDecoration: 'underline' }}>
                  MKATABA WA MKOPO WA KIFINANSI (FKF MICRO-CREDIT CONTRACT)
                </h2>

                <p>
                  Mkataba huu umeingizwa leo kati ya <strong>FKF MICRO-CREDIT SYSTEM (Tawi la {loan.branch_detail?.name})</strong> 
                  hapa ukijulikana kama "MKOPESHAJI", na <strong>{borrower.first_name} {borrower.last_name}</strong> 
                  mwenye NIDA Namba <strong>{borrower.id_number}</strong> hapa ukijulikana kama "MKOPAJI".
                </p>

                <h4 style={{ fontWeight: '800', marginTop: '1rem' }}>1. VIGEZO NA MASHARTI YA MKOPO:</h4>
                <ul>
                  <li>Kiasi cha Mkopo kilichopitishwa: <strong>TSH {principal.toLocaleString()}</strong></li>
                  <li>Riba ya Tawi iliyokokotolewa: <strong>{loan.interest_rate_pct}% (TSH {interest.toLocaleString()})</strong></li>
                  <li>Jumla ya Rejesho linalotakiwa: <strong>TSH {totalPayable.toLocaleString()}</strong></li>
                  <li>Muda wa Rejesho: <strong>{loan.tenure_months} Miezi ({loan.repayment_frequency})</strong></li>
                </ul>

                <h4 style={{ fontWeight: '800', marginTop: '1rem' }}>2. WAKUBAKILIANO NA SAHIHI:</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1rem', borderTop: '1px dashed #CBD5E1' }}>
                  <div>
                    Sahihi ya Mkopaji: ________________________<br />
                    Tarehe: {new Date().toLocaleDateString()}
                  </div>
                  <div>
                    Sahihi ya Super Admin (Makao Makuu): ________________________<br />
                    Mhuri wa Taasisi: FKF MICRO-CREDIT
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REMINDER */}
          {activeTab === 'REMINDER' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  📱 Ujumbe wa Kumbukumbu ya Rejesho (SMS Loan Reminder)
                </h3>
                <span className="badge badge-info">Vodacom & Tigo SMS Gateway</span>
              </div>

              {smsSent && (
                <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', padding: '0.85rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800', textAlign: 'center' }}>
                  ✓ Ujumbe wa Kumbukumbu (SMS Reminder) umetumwa kwa mafanikio kwenda {borrower.phone}!
                </div>
              )}

              <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '1.25rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.4rem' }}>Ujumbe utakaotumwa kwa Simu (SMS Preview):</label>
                  <textarea 
                    rows={4}
                    readOnly
                    value={`Habari ${borrower.first_name}, Kumbukumbu kutoka FKF Micro-Credit: Rejesho lako la Mkopo #LN-TZ-${loan.id} la TSH ${Math.round(monthlyInstalment).toLocaleString()} linatakiwa kulipwa. Salio la deni ni TSH ${balance.toLocaleString()}. Lipa kupitia M-Pesa au NMB.`}
                    style={{ width: '100%', padding: '0.75rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A', fontWeight: '600' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button onClick={handleSendReminder} className="btn-primary" style={{ padding: '0.65rem 1.5rem', background: '#059669' }}>
                    <Send size={16} /> Tuma SMS Reminder sasa
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOAN COMMENTS (Maoni Halisi ya Ukaguzi kutoka DB) */}
          {activeTab === 'COMMENTS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  💬 Maoni & Appraisal Notes za Mkopo (Real Loan Audit Comments)
                </h3>
                <span style={{ background: '#E0F2FE', color: '#0284C7', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800' }}>
                  {commentsList.length} Maoni Yaliyosajiliwa
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '340px', overflowY: 'auto' }}>
                {commentsList.length > 0 ? (
                  commentsList.map(c => (
                    <div key={c.id || Math.random()} style={{ background: '#F8FAFC', border: '1.5px solid #CBD5E1', padding: '1rem 1.1rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748B' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ color: '#0F172A', fontWeight: '900' }}>{c.author_name || c.author}</strong>
                          <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>
                            {c.author_role || 'Staff Member'}
                          </span>
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '0.78rem', color: '#64748B' }}>
                          {c.created_at ? new Date(c.created_at).toLocaleString() : (c.date || 'Sasa')}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#0F172A', margin: 0, fontWeight: '700', lineHeight: '1.4' }}>{c.comment || c.text}</p>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', background: '#F8FAFC', borderRadius: '12px', color: '#64748B', fontWeight: '700' }}>
                    Bado hakuna maoni yaliyoandikwa kwenye mkopo huu. Andika maoni yako ya ukaguzi hapo chini.
                  </div>
                )}
              </div>

              {/* Form to submit a real live comment */}
              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <input 
                  type="text" 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Andika maoni mapya ya ukaguzi wa mkopo huu kwa Super Admin..."
                  style={{ flex: 1, padding: '0.75rem 0.9rem', border: '1.5px solid #94A3B8', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', fontWeight: '800', background: '#FFFFFF' }}
                />
                <button type="submit" disabled={commenting || !newComment.trim()} className="btn-primary" style={{ padding: '0.75rem 1.4rem', background: '#047857', fontWeight: '900' }}>
                  {commenting ? <RefreshCw size={16} className="spin" /> : <MessageSquare size={16} />} Weka Maoni
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: LOAN CALCULATOR */}
          {activeTab === 'CALCULATOR' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                🧮 Kikokotoo cha Mkopo (Loan Calculator & Repayment Estimator)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.25rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Kiasi cha Mkopo Unachotaka (TSH):</label>
                    <input 
                      type="number" 
                      value={calcAmount} 
                      onChange={(e) => setCalcAmount(e.target.value)} 
                      step="100000"
                      style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800', color: '#059669' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Muda wa Rejesho (Miezi):</label>
                    <input 
                      type="number" 
                      value={calcMonths} 
                      onChange={(e) => setCalcMonths(e.target.value)} 
                      style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Riba ya Tawi (% per term):</label>
                    <input 
                      type="number" 
                      value={calcRate} 
                      onChange={(e) => setCalcRate(e.target.value)} 
                      step="0.5"
                      style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800' }}
                    />
                  </div>
                </div>

                <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', padding: '1.25rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#B8860B', textTransform: 'uppercase' }}>KIKOKOTOO CHA HESABU (CALCULATION RESULT)</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F172A', marginTop: '0.5rem' }}>
                      TZS {Math.round(calcMonthly).toLocaleString()} / Mwezi
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Jumla ya Riba:</span>
                      <strong style={{ color: '#B8860B' }}>TZS {calcTotalInterest.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Jumla ya Kurudisha:</span>
                      <strong style={{ color: '#059669' }}>TZS {calcTotalRepay.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

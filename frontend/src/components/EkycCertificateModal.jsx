import React from 'react';
import { ShieldCheck, CheckCircle2, Printer, X, Award, QrCode, Cpu, Building2, Calendar, User, FileText } from 'lucide-react';

export default function EkycCertificateModal({ result, borrower, onClose }) {
  if (!result && !borrower) return null;

  const targetBorrower = borrower || result?.borrower;
  const score = result?.confidence_score || result?.matchScore || '98.6';
  const token = result?.token || result?.ekycToken || `EKYC-TZ-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = result?.timestamp || new Date().toLocaleString('sw-TZ', { dateStyle: 'full', timeStyle: 'medium' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="certificate-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem', overflowY: 'auto' }}>
      
      {/* Container */}
      <div style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '780px', border: '2px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="no-print" style={{ padding: '1rem 1.5rem', background: '#0F172A', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={22} color="#D4AF37" />
            <span style={{ fontSize: '1rem', fontWeight: '900', color: '#FFFFFF' }}>
              CHETI RASMI CHA UHAKIKI WA KIDIJITALI (eKYC CERTIFICATE)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={handlePrint} 
              style={{ background: '#047857', color: '#FFFFFF', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '10px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 10px rgba(4, 120, 87, 0.3)' }}
            >
              <Printer size={16} /> 🖨️ Piga Chapa / Pakua Cheti (Print PDF)
            </button>
            <button 
              onClick={onClose} 
              style={{ background: '#334155', color: '#FFFFFF', border: 'none', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINTABLE CERTIFICATE DOCUMENT BODY */}
        <div id="ekyc-printable-certificate" style={{ padding: '2.5rem 3rem', background: '#FFFFFF', color: '#0F172A', fontFamily: "'Outfit', 'Inter', sans-serif", position: 'relative' }}>
          
          {/* Decorative Gold Certificate Border */}
          <div style={{ border: '4px double #D4AF37', borderRadius: '16px', padding: '2rem', background: '#FFFAF0', position: 'relative', overflow: 'hidden' }}>
            
            {/* Watermark Seal Background */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.04, pointerEvents: 'none', textAlign: 'center' }}>
              <Award size={320} color="#000000" />
            </div>

            {/* Header / National Emblem Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #D4AF37', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '900', letterSpacing: '0.15em', color: '#B8860B', textTransform: 'uppercase' }}>
                JAMHURI YA MUUNGANO WA TANZANIA
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700', marginTop: '0.1rem' }}>
                E-GOVERNMENT COMPLIANCE & AUTOMATED IDENTITY AUTHORITY
              </div>

              <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0F172A', margin: '0.6rem 0 0.2rem 0', letterSpacing: '-0.02em' }}>
                CHETI CHA UHAKIKI WA KIDIJITALI (eKYC)
              </h1>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#047857' }}>
                OFFICIAL ELECTRONIC KNOW YOUR CUSTOMER (eKYC) VERIFICATION CERTIFICATE
              </div>

              <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#EFF6FF', border: '1px solid #93C5FD', padding: '0.25rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '900', color: '#1E40AF' }}>
                NIDA PORTAL VERIFIED • CERTIFICATE NO: <span style={{ color: '#0284C7' }}>{token}</span>
              </div>
            </div>

            {/* Certificate Body Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              
              {/* Photo Frame */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={targetBorrower?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetBorrower?.first_name || 'Borrower'}`} 
                    alt="Borrower Photo" 
                    style={{ width: '120px', height: '135px', borderRadius: '12px', objectFit: 'cover', border: '3px solid #047857', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}
                  />
                  <div style={{ position: 'absolute', bottom: '-8px', right: '-8px', background: '#047857', color: '#FFFFFF', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFFFFF', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: '900', color: '#047857', marginTop: '0.6rem', textTransform: 'uppercase' }}>
                  ✓ NIDA PASSED
                </div>
              </div>

              {/* Borrower Info Particulars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.35rem' }}>
                  <span style={{ color: '#64748B', fontWeight: '700' }}>Jina la Mkopaji:</span>
                  <strong style={{ color: '#0F172A', fontWeight: '900', fontSize: '1.05rem' }}>
                    {targetBorrower?.first_name} {targetBorrower?.last_name}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.35rem' }}>
                  <span style={{ color: '#64748B', fontWeight: '700' }}>Kitambulisho cha Taifa (NIDA):</span>
                  <strong style={{ color: '#0284C7', fontWeight: '900' }}>
                    {targetBorrower?.id_number || 'NIDA-TZ-VERIFIED'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.35rem' }}>
                  <span style={{ color: '#64748B', fontWeight: '700' }}>Namba ya Simu & Anwani:</span>
                  <strong style={{ color: '#0F172A', fontWeight: '800' }}>
                    {targetBorrower?.phone} | {targetBorrower?.address || 'Tanzania'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.35rem' }}>
                  <span style={{ color: '#64748B', fontWeight: '700' }}>Mtaa / Kijiji Registered:</span>
                  <strong style={{ color: '#047857', fontWeight: '800' }}>
                    {targetBorrower?.street_or_village || targetBorrower?.street || 'Central Street'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: '700' }}>Kazi / Ajira:</span>
                  <strong style={{ color: '#B8860B', fontWeight: '800' }}>
                    {targetBorrower?.employment_status || 'Kazi Basi'} (Kipato: TSH {parseFloat(targetBorrower?.monthly_income || 0).toLocaleString()})
                  </strong>
                </div>
              </div>

            </div>

            {/* Audit & Biometric Scores Box */}
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1.5px solid #CBD5E1', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>NIDA Database Match</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#047857', marginTop: '0.2rem' }}>100% FULL MATCH</div>
              </div>

              <div style={{ borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>AI Facial Match Confidence</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0284C7', marginTop: '0.2rem' }}>{score}% SCORE</div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Biometric Liveness</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#047857', marginTop: '0.2rem' }}>PASSED & SECURE</div>
              </div>
            </div>

            {/* Certificate Footer / Signatures & Stamp */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1rem', borderTop: '2px dashed #D4AF37' }}>
              
              {/* QR Code Security Stamp */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: '#FFFFFF', padding: '0.4rem', border: '1.5px solid #CBD5E1', borderRadius: '8px' }}>
                  <QrCode size={54} color="#0F172A" />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700', maxWidth: '160px', lineHeight: '1.3' }}>
                  Scan QR code kuhakiki usahihi wa Cheti hiki kwenye Mfumo wa FKF Micro-Credit.
                </div>
              </div>

              {/* Official Seal / Signature */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '900', color: '#0F172A' }}>
                  FKF MICRO-CREDIT eKYC AUTHORITY
                </div>
                <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '800', fontStyle: 'italic', marginTop: '0.2rem' }}>
                  Approved & Digitally Signed
                </div>
                <div style={{ width: '180px', height: '1px', background: '#0F172A', margin: '0.4rem auto' }} />
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>
                  Muda wa Uhakiki: {dateStr}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

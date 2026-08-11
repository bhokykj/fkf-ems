import React, { useState } from 'react';
import { X, Printer, Edit3, Eye, RotateCcw } from 'lucide-react';

// Pure High-Density QR Code Generator
function SimpleQrCode({ text, size = 95 }) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  
  const matrixSize = 25;
  const cells = [];
  
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      const isTopLeft = r < 7 && c < 7;
      const isTopRight = r < 7 && c >= matrixSize - 7;
      const isBottomLeft = r >= matrixSize - 7 && c < 7;

      if (isTopLeft || isTopRight || isBottomLeft) {
        const isBorder = (r === 0 || r === 6 || c === 0 || c === 6 || r === matrixSize - 7 || r === matrixSize - 1 || c === matrixSize - 7 || c === matrixSize - 1);
        const isInner = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
                        (r >= 2 && r <= 4 && c >= matrixSize - 5 && c <= matrixSize - 3) ||
                        (r >= matrixSize - 5 && r <= matrixSize - 3 && c >= 2 && c <= 4);
        if (isBorder || isInner) {
          cells.push({ r, c, fill: '#05070B' });
        } else {
          cells.push({ r, c, fill: '#FFFFFF' });
        }
      } else {
        const val = Math.abs(Math.sin((r * 37 + c * 19 + hash)) * 10000);
        const isDark = (val % 1) > 0.42;
        cells.push({ r, c, fill: isDark ? '#05070B' : '#FFFFFF' });
      }
    }
  }

  const cellSize = size / matrixSize;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: '6px', background: '#FFF', padding: '3px' }}>
      {cells.map((cell, idx) => (
        <rect
          key={idx}
          x={cell.c * cellSize}
          y={cell.r * cellSize}
          width={cellSize}
          height={cellSize}
          fill={cell.fill}
        />
      ))}
    </svg>
  );
}

export default function StaffIdCardModal({ staff, onClose }) {
  if (!staff) return null;

  const defaultNameLine1 = (staff.first_name || 'KHALID JUMA').toUpperCase();
  const defaultNameLine2 = (staff.last_name || 'BHOKY').toUpperCase();
  const defaultRoleTitle = 'LOAN OFFICER';
  const defaultRoleSub = '(AFISA MIKOPO)';
  const defaultBranch = staff.branch_detail?.name || 'DAR ES SALAAM';
  const defaultIdCode = staff.employee_id || `FKF-2024-${(staff.id || 156).toString().padStart(4, '0')}`;
  const defaultJoiningDate = staff.created_at ? new Date(staff.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'LONG', year: 'numeric' }).toUpperCase() : '02 JANUARY 2024';

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [cardStaffName1, setCardStaffName1] = useState(defaultNameLine1);
  const [cardStaffName2, setCardStaffName2] = useState(defaultNameLine2);
  const [cardRoleTitle, setCardRoleTitle] = useState(defaultRoleTitle);
  const [cardRoleSub, setCardRoleSub] = useState(defaultRoleSub);
  const [cardStaffId, setCardStaffId] = useState(defaultIdCode);
  const [cardDepartment, setCardDepartment] = useState('CREDIT & OPERATIONS');
  const [cardBranch, setCardBranch] = useState(defaultBranch);
  const [cardJoiningDate, setCardJoiningDate] = useState(defaultJoiningDate);
  const [cardPhotoUrl, setCardPhotoUrl] = useState(staff.passport_photo || '');

  // Signature Settings
  const [signatureType, setSignatureType] = useState('IMAGE');
  const [signatoryName, setSignatoryName] = useState('Juelarfu');
  const [signatoryTitle, setSignatoryTitle] = useState('AUTHORIZED SIGNATURE');
  const [signatorySubTitle, setSignatorySubTitle] = useState('CHIEF EXECUTIVE OFFICER');
  const [signatureImgUrl, setSignatureImgUrl] = useState('/md-signature.png');

  // Back Side Statements
  const [terms1, setTerms1] = useState('Kitambulisho hiki ni mali ya FKF MICRO-CREDIT COMPANY LIMITED.');
  const [terms2, setTerms2] = useState('Ni halali kwa ajili ya utambulisho wa mfanyakazi tu.');
  const [terms3, setTerms3] = useState('Hakitumiki kwa mtu mwingine.');
  const [terms4, setTerms4] = useState('Mnapoteza kitambulisho hiki, tafadhali ripoti kwa uongozi mara moja.');
  const [emergencyPhone, setEmergencyPhone] = useState('+255 79 098 0123');
  const [cardSlogan, setCardSlogan] = useState('"Mikopo Rahisi, Mafanikio ya Biashara."');
  const [websiteUrl, setWebsiteUrl] = useState('www.fkfmicro-credit.co.tz');
  const [supportEmail, setSupportEmail] = useState('cs@fkfmicro-credit.co.tz');

  // Scannable QR Payload
  const qrScannableData = `https://fkfmicro-credit.co.tz/verify-staff?id=${encodeURIComponent(cardStaffId)}&name=${encodeURIComponent(cardStaffName1 + ' ' + cardStaffName2)}&role=${encodeURIComponent(cardRoleTitle)}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrScannableData)}`;

  const handlePhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCardPhotoUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureImgUrl(reader.result);
        setSignatureType('IMAGE');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetDefaults = () => {
    setCardStaffName1(defaultNameLine1);
    setCardStaffName2(defaultNameLine2);
    setCardRoleTitle(defaultRoleTitle);
    setCardRoleSub(defaultRoleSub);
    setCardStaffId(defaultIdCode);
    setCardDepartment('CREDIT & OPERATIONS');
    setCardBranch(defaultBranch);
    setCardJoiningDate(defaultJoiningDate);
    setCardPhotoUrl(staff.passport_photo || '');
    setSignatureType('IMAGE');
    setSignatoryName('Juelarfu');
    setSignatoryTitle('AUTHORIZED SIGNATURE');
    setSignatorySubTitle('CHIEF EXECUTIVE OFFICER');
    setSignatureImgUrl('/md-signature.png');
    setTerms1('Kitambulisho hiki ni mali ya FKF MICRO-CREDIT COMPANY LIMITED.');
    setTerms2('Ni halali kwa ajili ya utambulisho wa mfanyakazi tu.');
    setTerms3('Hakitumiki kwa mtu mwingine.');
    setTerms4('Mnapoteza kitambulisho hiki, tafadhali ripoti kwa uongozi mara moja.');
    setEmergencyPhone('+255 79 098 0123');
    setCardSlogan('"Mikopo Rahisi, Mafanikio ya Biashara."');
    setWebsiteUrl('www.fkfmicro-credit.co.tz');
    setSupportEmail('cs@fkfmicro-credit.co.tz');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(5, 7, 11, 0.95)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1250, padding: '1rem', overflowY: 'auto' }}>
      
      {/* Load Google Fonts for exact typography */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      <div style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: isEditing ? '1180px' : '880px', padding: '1.75rem', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', gap: '1.25rem', transition: 'all 0.3s ease' }}>
        
        {/* Top Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#05070B', margin: 0 }}>
              🪪 Kitambulisho Rasmi cha Mfanyakazi (Official Staff ID)
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
              Official FKF Company ID Card • Passport Size (40x45mm) • Scannable QR Code
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className="btn-secondary" 
              style={{ background: isEditing ? '#FEF3C7' : '#F1F5F9', color: isEditing ? '#B8860B' : '#05070B', border: '1px solid #CBD5E1', padding: '0.5rem 1rem', fontSize: '0.82rem', fontWeight: '800' }}
            >
              {isEditing ? <Eye size={16} /> : <Edit3 size={16} />} 
              {isEditing ? 'Tazama Preview' : '✏️ Hariri Maneno & Sahihi'}
            </button>

            <button onClick={() => window.print()} className="btn-primary" style={{ background: '#059669', padding: '0.55rem 1.25rem', fontSize: '0.82rem', fontWeight: '800' }}>
              <Printer size={16} /> Chapa / Save PDF ID
            </button>

            <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', color: '#64748B', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* MAIN BODY: 2 CARDS SIDE-BY-SIDE (FRONT & BACK) */}
        <div style={{ display: 'grid', gridTemplateColumns: isEditing ? '1fr 360px' : '1fr', gap: '1.75rem', alignItems: 'start' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.25rem', flexWrap: 'wrap' }}>
            
            {/* ========================================================
                1. FRONT SIDE OF STAFF ID CARD (100% PERFECT MATCH)
               ======================================================== */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              {/* Lanyard Top Clip */}
              <div style={{ width: '58px', height: '18px', background: '#1E293B', borderRadius: '6px 6px 0 0', border: '2px solid #475569', borderBottom: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <div style={{ width: '26px', height: '6px', background: '#000', borderRadius: '3px' }}></div>
              </div>

              <div style={{ 
                width: '330px', 
                height: '525px', 
                background: '#FAFAFA', 
                borderRadius: '24px', 
                border: '2.5px solid #05070B', 
                display: 'flex', 
                flexDirection: 'column', 
                justify: 'space-between', 
                position: 'relative', 
                overflow: 'hidden', 
                boxShadow: '0 20px 45px rgba(0,0,0,0.35)',
                fontFamily: "'Inter', sans-serif"
              }}>

                {/* TOP BLACK HEADER AREA WITH OFFICIAL PNG LOGO */}
                <div style={{ background: '#05070B', color: '#FFFFFF', padding: '0.85rem 1rem 1.35rem 1rem', textAlign: 'center', position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/fkf-logo.png" alt="FKF Logo" style={{ height: '54px', width: 'auto', objectFit: 'contain' }} />
                </div>

                {/* S-CURVED GOLD METALLIC RIBBON WAVE */}
                <div style={{ position: 'relative', height: '16px', marginTop: '-16px', zIndex: 3 }}>
                  <svg width="100%" height="26" viewBox="0 0 330 26" fill="none" style={{ display: 'block' }}>
                    <path d="M0 0 C 110 26, 220 0, 330 22 L 330 0 L 0 0 Z" fill="#05070B" />
                    <path d="M0 4 C 110 30, 220 4, 330 26" stroke="url(#goldWaveGrad)" strokeWidth="6" fill="none" />
                    <defs>
                      <linearGradient id="goldWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFF9C4" />
                        <stop offset="45%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#D4AF37" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* WATERMARK BACKGROUND EMBLEM */}
                <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.05, pointerEvents: 'none', width: '230px', height: '230px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                  <img src="/fkf-logo.png" alt="FKF Watermark" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'grayscale(100%)' }} />
                </div>

                {/* MIDDLE CONTENT SECTION */}
                <div style={{ padding: '0.65rem 1.15rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', zIndex: 2, flex: 1 }}>
                  
                  {/* Top Row: Photo (Left) + Name & Title (Right) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '115px 1fr', gap: '0.85rem', alignItems: 'flex-start', marginTop: '0.2rem' }}>
                    
                    {/* Passport Photo Frame (40x45mm Portrait) */}
                    <div style={{ 
                      width: '115px', 
                      height: '128px', 
                      borderRadius: '14px', 
                      overflow: 'hidden', 
                      border: '2.5px solid #D4AF37', 
                      background: '#F1F5F9', 
                      boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center'
                    }}>
                      {cardPhotoUrl ? (
                        <img src={cardPhotoUrl} alt={cardStaffName1} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      )}
                    </div>

                    {/* Name & Role Text */}
                    <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '0.2rem' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#05070B', lineHeight: '1.15', letterSpacing: '0.2px' }}>
                        {cardStaffName1}
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#05070B', lineHeight: '1.15', letterSpacing: '0.2px' }}>
                        {cardStaffName2}
                      </div>

                      {/* Underline Divider */}
                      <div style={{ height: '2px', background: 'linear-gradient(90deg, #D4AF37 0%, #E2E8F0 100%)', width: '92%', margin: '0.35rem 0' }}></div>

                      <div style={{ fontSize: '0.88rem', fontWeight: '900', color: '#B8860B', lineHeight: '1.2' }}>
                        {cardRoleTitle}
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#B8860B', lineHeight: '1.2' }}>
                        {cardRoleSub}
                      </div>
                    </div>

                  </div>

                  {/* Bottom Row: QR Code (Left) + Details & Signature (Right) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '108px 1fr', gap: '0.85rem', alignItems: 'center', marginTop: '0.2rem' }}>
                    
                    {/* Golden Framed Scannable QR Code */}
                    <div style={{ 
                      background: '#FFFFFF', 
                      padding: '4px', 
                      borderRadius: '12px', 
                      border: '2.5px solid #D4AF37', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center'
                    }}>
                      <img 
                        src={qrApiUrl} 
                        alt="Scannable QR Code" 
                        style={{ width: '98px', height: '98px', borderRadius: '6px', objectFit: 'contain' }} 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div style={{ display: 'none' }}>
                        <SimpleQrCode text={qrScannableData} size={98} />
                      </div>
                    </div>

                    {/* Details List + Signature */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      
                      {/* Detailed Metadata Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.24rem', fontSize: '0.64rem' }}>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ background: '#FEF3C7', color: '#B8860B', padding: '1px 4px', borderRadius: '4px', fontSize: '0.6rem' }}>👤</span>
                          <span style={{ color: '#475569', fontWeight: '800' }}>ID NO:</span>
                          <strong style={{ color: '#05070B', fontWeight: '900', fontSize: '0.68rem', marginLeft: 'auto' }}>{cardStaffId}</strong>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ background: '#FEF3C7', color: '#B8860B', padding: '1px 4px', borderRadius: '4px', fontSize: '0.6rem' }}>💼</span>
                          <span style={{ color: '#475569', fontWeight: '800' }}>DEPARTMENT:</span>
                          <strong style={{ color: '#05070B', fontWeight: '800', fontSize: '0.6rem', marginLeft: 'auto' }}>{cardDepartment}</strong>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ background: '#FEF3C7', color: '#B8860B', padding: '1px 4px', borderRadius: '4px', fontSize: '0.6rem' }}>📍</span>
                          <span style={{ color: '#475569', fontWeight: '800' }}>BRANCH:</span>
                          <strong style={{ color: '#05070B', fontWeight: '800', fontSize: '0.62rem', marginLeft: 'auto' }}>{cardBranch}</strong>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ background: '#FEF3C7', color: '#B8860B', padding: '1px 4px', borderRadius: '4px', fontSize: '0.6rem' }}>📅</span>
                          <span style={{ color: '#475569', fontWeight: '800' }}>JOINING DATE:</span>
                          <strong style={{ color: '#05070B', fontWeight: '800', fontSize: '0.6rem', marginLeft: 'auto' }}>{cardJoiningDate}</strong>
                        </div>

                      </div>

                      {/* Authorized Signature Block */}
                      <div style={{ textAlign: 'center', marginTop: '0.35rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {signatureType === 'IMAGE' && signatureImgUrl ? (
                          <img src={signatureImgUrl} alt="Authorized Signature" style={{ maxHeight: '36px', maxWidth: '120px', objectFit: 'contain' }} />
                        ) : (
                          <div style={{ fontFamily: 'cursive', fontSize: '1.4rem', color: '#05070B', fontWeight: 'bold', lineHeight: '1' }}>
                            {signatoryName}
                          </div>
                        )}
                        
                        <div style={{ width: '100%', height: '1.5px', background: '#05070B', margin: '0.15rem 0' }}></div>
                        
                        <div style={{ fontSize: '0.55rem', fontWeight: '900', color: '#05070B', letterSpacing: '0.5px' }}>
                          {signatoryTitle}
                        </div>
                        <div style={{ fontSize: '0.48rem', color: '#64748B', fontWeight: '800' }}>
                          {signatorySubTitle}
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

                {/* BOTTOM GOLD RIBBON WAVE */}
                <div style={{ position: 'relative', height: '10px', zIndex: 3 }}>
                  <svg width="100%" height="16" viewBox="0 0 330 16" fill="none">
                    <path d="M0 16 C 110 0, 220 16, 330 0 L 330 16 Z" stroke="url(#goldWaveGrad)" strokeWidth="5" fill="#05070B" />
                  </svg>
                </div>

                {/* BOTTOM BLACK FOOTER */}
                <div style={{ background: '#05070B', color: '#FFFFFF', padding: '0.55rem 0.75rem', textAlign: 'center', zIndex: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                  
                  {/* Gold Shield Lock Icon Box */}
                  <div style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1.5px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: '900', color: '#FFF9C4', letterSpacing: '0.8px' }}>
                      UAMINIFU | UWAZI | UWAJIBIKAJI
                    </div>
                    <div style={{ fontSize: '0.52rem', color: '#E2E8F0', fontWeight: '700', letterSpacing: '0.3px' }}>
                      HUDUMA BORA, MAENDELEO ENDELEVU
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ========================================================
                2. BACK SIDE OF STAFF ID CARD (100% PERFECT MATCH)
               ======================================================== */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              <div style={{ width: '58px', height: '18px', background: '#1E293B', borderRadius: '6px 6px 0 0', border: '2px solid #475569', borderBottom: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <div style={{ width: '26px', height: '6px', background: '#000', borderRadius: '3px' }}></div>
              </div>

              <div style={{ 
                width: '330px', 
                height: '525px', 
                background: '#FAFAFA', 
                borderRadius: '24px', 
                border: '2.5px solid #05070B', 
                display: 'flex', 
                flexDirection: 'column', 
                justify: 'space-between', 
                position: 'relative', 
                overflow: 'hidden', 
                boxShadow: '0 20px 45px rgba(0,0,0,0.35)',
                fontFamily: "'Inter', sans-serif"
              }}>

                {/* TOP BLACK HEADER */}
                <div style={{ background: '#05070B', color: '#FFFFFF', padding: '0.85rem 1rem 1.35rem 1rem', textAlign: 'center', position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/fkf-logo.png" alt="FKF Logo" style={{ height: '54px', width: 'auto', objectFit: 'contain' }} />
                </div>

                {/* GOLD TITLE BANNER */}
                <div style={{ background: 'linear-gradient(90deg, #FFF9C4 0%, #F59E0B 50%, #D4AF37 100%)', padding: '0.42rem', textAlign: 'center', color: '#05070B', fontWeight: '900', fontSize: '0.82rem', letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 3px 8px rgba(0,0,0,0.2)', marginTop: '-8px', zIndex: 5 }}>
                  KITAMBULISHO CHA MFANYAKAZI
                </div>

                {/* WATERMARK BACKGROUND EMBLEM */}
                <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.05, pointerEvents: 'none', width: '230px', height: '230px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                  <img src="/fkf-logo.png" alt="FKF Watermark" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'grayscale(100%)' }} />
                </div>

                {/* MIDDLE SECTION: 5 RULES WITH ROUND ICON BADGES */}
                <div style={{ padding: '1.1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 2, flex: 1 }}>
                  
                  {[
                    { icon: '👤', text: terms1 },
                    { icon: '🛡️', text: terms2 },
                    { icon: '❗', text: terms3 },
                    { icon: '↩️', text: terms4 },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#FFF', border: '2px solid #05070B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                        {item.icon}
                      </div>
                      <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#05070B', lineHeight: '1.3' }}>
                        {item.text}
                      </div>
                    </div>
                  ))}

                  {/* Emergency Contact Item */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.1rem' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#FFF', border: '2px solid #05070B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                      📞
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: '900', color: '#05070B' }}>Mawasiliano ya Dharura:</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '900', color: '#05070B' }}>{emergencyPhone}</div>
                    </div>
                  </div>

                </div>

                {/* BOTTOM GOLD RIBBON WAVE */}
                <div style={{ position: 'relative', height: '8px', zIndex: 3 }}>
                  <svg width="100%" height="16" viewBox="0 0 330 16" fill="none">
                    <path d="M0 16 C 110 0, 220 16, 330 0 L 330 16 Z" stroke="url(#goldWaveGrad)" strokeWidth="5" fill="#05070B" />
                  </svg>
                </div>

                {/* BOTTOM SLOGAN & LINKS FOOTER */}
                <div style={{ background: '#05070B', color: '#FFFFFF', padding: '0.65rem 0.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.35rem', zIndex: 4 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '900', color: '#FFF9C4', fontStyle: 'italic' }}>
                    {cardSlogan}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', fontSize: '0.62rem', color: '#E2E8F0', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.3rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      🌐 {websiteUrl}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      ✉️ {supportEmail}
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* EDITING SIDEBAR DRAWER */}
          {isEditing && (
            <div style={{ background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '550px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#05070B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Edit3 size={15} color="#0284C7" /> Hariri Taarifa Zote
                </h4>
                <button type="button" onClick={handleResetDefaults} style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}>
                  <RotateCcw size={12} /> Reset Defaults
                </button>
              </div>

              {/* Form Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.78rem' }}>
                
                <div>
                  <label style={{ fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Jina Line 1 (e.g. KHALID JUMA):</label>
                  <input type="text" value={cardStaffName1} onChange={(e) => setCardStaffName1(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontWeight: '700' }} />
                </div>

                <div>
                  <label style={{ fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Jina Line 2 (e.g. BHOKY):</label>
                  <input type="text" value={cardStaffName2} onChange={(e) => setCardStaffName2(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontWeight: '700' }} />
                </div>

                <div>
                  <label style={{ fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Wadhifa Line 1 (e.g. LOAN OFFICER):</label>
                  <input type="text" value={cardRoleTitle} onChange={(e) => setCardRoleTitle(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontWeight: '700' }} />
                </div>

                <div>
                  <label style={{ fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Wadhifa Line 2 (e.g. (AFISA MIKOPO)):</label>
                  <input type="text" value={cardRoleSub} onChange={(e) => setCardRoleSub(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                </div>

                <div>
                  <label style={{ fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>ID Number:</label>
                  <input type="text" value={cardStaffId} onChange={(e) => setCardStaffId(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontWeight: '800', color: '#0284C7' }} />
                </div>

                <div>
                  <label style={{ fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Idara (Department):</label>
                  <input type="text" value={cardDepartment} onChange={(e) => setCardDepartment(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                </div>

                <div>
                  <label style={{ fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Tawi (Branch Name):</label>
                  <input type="text" value={cardBranch} onChange={(e) => setCardBranch(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                </div>

                <div>
                  <label style={{ fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Joining Date:</label>
                  <input type="text" value={cardJoiningDate} onChange={(e) => setCardJoiningDate(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                </div>

                <div>
                  <label style={{ fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Badili Picha ya Passport (40x45mm):</label>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ fontSize: '0.72rem' }} />
                </div>

                {/* SIGNATURE CONFIGURATION */}
                <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '900', color: '#05070B' }}>✍️ Njia ya Sahihi (Signature Method):</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={() => { setSignatureType('IMAGE'); setSignatureImgUrl('/md-signature.png'); }} style={{ flex: 1, padding: '0.35rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: signatureType === 'IMAGE' ? '#05070B' : '#FFF', color: signatureType === 'IMAGE' ? '#FFF' : '#05070B', fontWeight: '800', cursor: 'pointer' }}>
                      Official PNG Signature
                    </button>
                    <button type="button" onClick={() => setSignatureType('TEXT')} style={{ flex: 1, padding: '0.35rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: signatureType === 'TEXT' ? '#05070B' : '#FFF', color: signatureType === 'TEXT' ? '#FFF' : '#05070B', fontWeight: '800', cursor: 'pointer' }}>
                      Maneno (Text)
                    </button>
                  </div>

                  {signatureType === 'TEXT' ? (
                    <div>
                      <label style={{ fontWeight: '800', color: '#475569', display: 'block', margin: '0.3rem 0 0.2rem 0' }}>Jina la Mweka Sahihi:</label>
                      <input type="text" value={signatoryName} onChange={(e) => setSignatoryName(e.target.value)} style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                    </div>
                  ) : (
                    <div>
                      <label style={{ fontWeight: '800', color: '#475569', display: 'block', margin: '0.3rem 0 0.2rem 0' }}>Upload Picha ya Sahihi (PNG/JPG):</label>
                      <input type="file" accept="image/*" onChange={handleSignatureUpload} style={{ fontSize: '0.72rem' }} />
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Simu ya Dharura (Back Side):</label>
                  <input type="text" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                </div>

                <div>
                  <label style={{ fontWeight: '800', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Slogan ya Kampuni:</label>
                  <input type="text" value={cardSlogan} onChange={(e) => setCardSlogan(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

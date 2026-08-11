import React from 'react';

export default function CompanyHeaderBlock({ title, subtitle, showLogo = true, alignment = 'center' }) {
  return (
    <div style={{ display: 'flex', flexDirection: alignment === 'center' ? 'column' : 'row', alignItems: alignment === 'center' ? 'center' : 'flex-start', justifyContent: 'space-between', borderBottom: '2px solid #0F172A', paddingBottom: '1.25rem', marginBottom: '1.25rem', textAlign: alignment === 'center' ? 'center' : 'left', gap: '1rem' }}>
      
      {showLogo && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: alignment === 'center' ? 'center' : 'flex-start' }}>
          <img 
            src="/fkf-logo.png" 
            alt="FKF Micro-Credit Logo" 
            style={{ height: '75px', width: 'auto', objectFit: 'contain', borderRadius: '8px' }} 
          />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
          FKF MICRO-CREDIT
        </h2>
        <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <span>21Msamaria street / Msakuzi Road</span>
          <span>P.O Box 9030 DSM, Tanzania</span>
          <span>Tel/Whatsapp: <a href="https://wa.me/255790980123" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}><strong>+255790980123</strong></a></span>
          <span>E-mail: <a href="mailto:cs@fkfmicro-credit.co.tz" style={{ color: 'inherit', textDecoration: 'underline' }}><strong>cs@fkfmicro-credit.co.tz</strong></a></span>
          <span>Web: <a href="https://www.fkfmicro-credit.co.tz" target="_blank" rel="noreferrer" style={{ color: '#0284C7', textDecoration: 'underline' }}><strong>www.fkfmicro-credit.co.tz</strong></a></span>
        </div>

        {title && (
          <div style={{ marginTop: '0.6rem', background: '#F8FAFC', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #CBD5E1', display: 'inline-block' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0284C7', margin: 0, textTransform: 'uppercase' }}>
              {title}
            </h3>
            {subtitle && <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>{subtitle}</span>}
          </div>
        )}
      </div>

    </div>
  );
}

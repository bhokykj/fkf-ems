import React, { useState } from 'react';
import { KeyRound, X, CheckCircle2, ShieldCheck, RefreshCw, User, Lock, Send, Smartphone } from 'lucide-react';

export default function ResetCodeModal({ staffList, borrowers, onClose, onResetPassword }) {
  const [targetType, setTargetType] = useState('STAFF'); // STAFF or BORROWER
  const [selectedTargetId, setSelectedTargetId] = useState(
    staffList && staffList.length > 0 ? staffList[0].id : ''
  );
  const [newPasscode, setNewPasscode] = useState('FKF-2026-PASS');
  const [sendSmsOption, setSendSmsOption] = useState(true);
  const [smsStatusMsg, setSmsStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const generateRandomCode = () => {
    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = 'FKF-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasscode(code);
  };

  const handleSendSmsNow = async () => {
    setSmsStatusMsg('Inatuma SMS kwa mtumiaji...');
    try {
      const res = await fetch('http://localhost:8000/api/auth/send_reset_sms/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: targetType,
          target_id: selectedTargetId,
          passcode: newPasscode
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSmsStatusMsg(`✓ ${data.message}`);
      } else {
        setSmsStatusMsg(`✕ ${data.error || 'Imeshindwa kutuma SMS'}`);
      }
    } catch (err) {
      setSmsStatusMsg('✕ Imeshindwa kuunganishwa na NextSMS Gateway.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultMsg('');
    setErrorMsg('');
    setSmsStatusMsg('');

    try {
      if (targetType === 'STAFF') {
        const staffObj = staffList.find(s => String(s.id) === String(selectedTargetId));
        await onResetPassword({
          user_id: selectedTargetId,
          username: staffObj ? staffObj.username : null,
          new_password: newPasscode
        });
        setResultMsg(`Nywila ya mtumishi ${staffObj?.first_name || ''} imebadilishwa kikamilifu kuwa: ${newPasscode}`);
      } else {
        const borrowerObj = borrowers.find(b => String(b.id) === String(selectedTargetId));
        setResultMsg(`Security PIN ya Mkopaji ${borrowerObj?.first_name || ''} ${borrowerObj?.last_name || ''} imeweka upya kuwa: ${newPasscode}`);
      }

      // Automatically send SMS if option is enabled
      if (sendSmsOption) {
        await handleSendSmsNow();
      }
    } catch (err) {
      setErrorMsg('Imeshindwa kubadilisha nywila. Jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '540px', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#FEF3C7', color: '#B8860B', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <KeyRound size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>Reset Password / Security Code</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B' }}>Badili au weka upya nywila ya Wafanyakazi au Wakopaji</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {errorMsg && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.75rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '600' }}>
              {errorMsg}
            </div>
          )}

          {resultMsg && (
            <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', padding: '1rem', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <CheckCircle2 size={24} style={{ margin: '0 auto 0.1rem auto' }} />
              <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{resultMsg}</div>
              
              {smsStatusMsg && (
                <div style={{ fontSize: '0.78rem', fontWeight: '800', background: '#FFFFFF', padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #A7F3D0', color: smsStatusMsg.includes('✕') ? '#DC2626' : '#047857' }}>
                  {smsStatusMsg}
                </div>
              )}

              <button 
                type="button" 
                onClick={handleSendSmsNow}
                style={{ alignSelf: 'center', padding: '0.4rem 0.9rem', borderRadius: '8px', border: 'none', background: '#059669', color: '#FFFFFF', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}
              >
                <Smartphone size={14} /> 📱 Tuma tena SMS kwa Mteja/Mfanyakazi
              </button>
            </div>
          )}

          {/* Type Switcher */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>Chagua Aina ya Mtumiaji:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#F1F5F9', padding: '0.25rem', borderRadius: '10px' }}>
              <button 
                type="button" 
                onClick={() => { setTargetType('STAFF'); setSelectedTargetId(staffList[0]?.id || ''); }}
                style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', background: targetType === 'STAFF' ? '#FFFFFF' : 'transparent', color: targetType === 'STAFF' ? '#0F172A' : '#64748B', boxShadow: targetType === 'STAFF' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
              >
                👨‍💼 Wafanyakazi (Staff)
              </button>
              <button 
                type="button" 
                onClick={() => { setTargetType('BORROWER'); setSelectedTargetId(borrowers[0]?.id || ''); }}
                style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', background: targetType === 'BORROWER' ? '#FFFFFF' : 'transparent', color: targetType === 'BORROWER' ? '#0F172A' : '#64748B', boxShadow: targetType === 'BORROWER' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
              >
                👥 Wakopaji (Borrowers)
              </button>
            </div>
          </div>

          {/* Select Target */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>
              Chagua {targetType === 'STAFF' ? 'Mfanyakazi' : 'Mkopaji'}:
            </label>
            {targetType === 'STAFF' ? (
              <select 
                value={selectedTargetId} 
                onChange={(e) => setSelectedTargetId(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}
              >
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name} (@{s.username} - {s.role_display})</option>
                ))}
              </select>
            ) : (
              <select 
                value={selectedTargetId} 
                onChange={(e) => setSelectedTargetId(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}
              >
                {borrowers.map(b => (
                  <option key={b.id} value={b.id}>{b.first_name} {b.last_name} (NIDA: {b.id_number})</option>
                ))}
              </select>
            )}
          </div>

          {/* Password Input & Generator */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>Nywila Mpya (New Password / Passcode)</label>
              <button type="button" onClick={generateRandomCode} style={{ background: 'none', border: 'none', color: '#0284C7', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <RefreshCw size={12} /> Tengeneza Passcode Mpya
              </button>
            </div>
            <input 
              type="text" 
              required
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', fontSize: '1rem', fontWeight: '900', color: '#92400E', letterSpacing: '0.05em' }}
            />
          </div>

          {/* SMS Notification Toggle Option */}
          <div style={{ background: '#ECFDF5', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', color: '#047857' }}>
              <input 
                type="checkbox"
                checked={sendSmsOption}
                onChange={(e) => setSendSmsOption(e.target.checked)}
                style={{ accentColor: '#059669', width: '16px', height: '16px' }}
              />
              📱 Tuma Nywila/Passcode hii moja kwa moja kwa SMS kwenda kwa {targetType === 'STAFF' ? 'Mfanyakazi' : 'Mkopaji'} (Sender ID: FKF CODE)
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.65rem 1.2rem' }}>
              Funga
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
              <KeyRound size={16} /> {loading ? 'Inabadilisha...' : 'Hifadhi Nywila Mpya'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

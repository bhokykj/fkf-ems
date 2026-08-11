import React, { useState } from 'react';
import { UserCheck, X, Save, ShieldCheck, Upload, Image as ImageIcon } from 'lucide-react';

export default function EditStaffModal({ staffUser, branches, onClose, onSave }) {
  const [username, setUsername] = useState(staffUser?.username || '');
  const [firstName, setFirstName] = useState(staffUser?.first_name || '');
  const [lastName, setLastName] = useState(staffUser?.last_name || '');
  const [email, setEmail] = useState(staffUser?.email || '');
  const [phone, setPhone] = useState(staffUser?.phone_number || '');
  const [role, setRole] = useState(staffUser?.role || 'LOAN_OFFICER');
  const [branchId, setBranchId] = useState(staffUser?.branch || branches[0]?.id || '');
  const [passportPhoto, setPassportPhoto] = useState(staffUser?.passport_photo || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!staffUser) return null;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const compressedDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxWidth = 500;
            const maxHeight = 600;
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
      setPassportPhoto(compressedDataUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone,
        role,
        branch_id: branchId,
        passport_photo: passportPhoto,
        user_role: 'SUPER_ADMIN'
      };
      if (newPassword && newPassword.trim() !== '') {
        payload.password = newPassword;
      }
      await onSave(staffUser.id, payload);
      onClose();
    } catch (err) {
      alert(err.message || 'Imeshindwa ku-update taarifa za mtumishi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '600px', background: '#FFFFFF', borderRadius: '24px', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', overflow: 'hidden' }}>
        
        {/* HEADER */}
        <div style={{ background: '#1E293B', color: '#FFFFFF', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserCheck size={22} color="#D4AF37" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900' }}>Edit Akaunti & Passport Size (Super Admin)</h3>
              <span style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>@{staffUser.username} ({staffUser.role})</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem', maxHeight: '82vh', overflowY: 'auto' }}>
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B8860B', fontSize: '0.82rem' }}>
            <ShieldCheck size={18} />
            <span>Kama Super Admin, una uwezo wa kubadilisha Cheo, Tawi, Jina, Passport Size na Password ya Mtumishi.</span>
          </div>

          {/* PASSPORT SIZE PHOTO UPLOADER BOX */}
          <div style={{ background: '#F8FAFC', border: '2px dashed #CBD5E1', borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              {passportPhoto ? (
                <img src={passportPhoto} alt="Passport Size" style={{ width: '85px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #D4AF37', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
              ) : (
                <div style={{ width: '85px', height: '100px', borderRadius: '8px', background: '#E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.7rem', border: '1px solid #CBD5E1' }}>
                  <ImageIcon size={24} />
                  <span>No Photo</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>
                📸 Picha ya Passport Size ya Mfanyakazi
              </label>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Pakia picha mpya ya passport size ya Mfanyakazi (PNG au JPG).
              </span>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: '#0284C7', color: '#FFFFFF', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', width: 'fit-content' }}>
                <Upload size={15} /> Badilisha Picha Ya Passport
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '800', color: '#0F172A' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Cheo / Wadhifa (Role)</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '700', color: '#0F172A' }}>
                <option value="LOAN_OFFICER">Afisa Mkopo (Loan Officer)</option>
                <option value="BRANCH_MANAGER">Meneja wa Tawi (Branch Manager)</option>
                <option value="RISK_OFFICER">Afisa Risk (Risk Officer)</option>
                <option value="SUPER_ADMIN">Super Admin (Mkuu wa Mfumo)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Jina la Kwanza</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '700', color: '#0F172A' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Jina la Pili</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '700', color: '#0F172A' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Namba ya Simu</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '700', color: '#059669' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Tawi la Mtumishi</label>
              <select value={branchId} onChange={(e) => setBranchId(e.target.value)} style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '700', color: '#0F172A' }}>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Badilisha Password (Hiari - Acha wazi kama hutaki kubadili)</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Weka password mpya" style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '700', color: '#0F172A' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              Ghairi
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#059669', padding: '0.75rem' }}>
              <Save size={18} /> {loading ? 'Inahifadhi...' : 'Hifadhi Mabadiliko'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

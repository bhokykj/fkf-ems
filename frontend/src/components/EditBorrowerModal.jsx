import React, { useState } from 'react';
import { Edit3, X, Save, ShieldCheck, Upload, Image as ImageIcon } from 'lucide-react';

export default function EditBorrowerModal({ borrower, onClose, onSave }) {
  const [firstName, setFirstName] = useState(borrower?.first_name || '');
  const [lastName, setLastName] = useState(borrower?.last_name || '');
  const [phone, setPhone] = useState(borrower?.phone || '');
  const [email, setEmail] = useState(borrower?.email || '');
  const [idNumber, setIdNumber] = useState(borrower?.id_number || '');
  const [address, setAddress] = useState(borrower?.address || '');
  const [occupation, setOccupation] = useState(borrower?.occupation || '');
  const [monthlyIncome, setMonthlyIncome] = useState(borrower?.monthly_income || '');
  const [kycStatus, setKycStatus] = useState(borrower?.kyc_status || 'VERIFIED');
  const [groupId, setGroupId] = useState(borrower?.group_id || '');
  const [photoUrl, setPhotoUrl] = useState(borrower?.photo_url || '');
  const [loading, setLoading] = useState(false);

  if (!borrower) return null;

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
      setPhotoUrl(compressedDataUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(borrower.id, {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        email: email,
        id_number: idNumber,
        address: address,
        occupation: occupation,
        monthly_income: parseFloat(monthlyIncome || 0),
        kyc_status: kycStatus,
        group_id: groupId,
        photo_url: photoUrl
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Imeshindwa ku-update taarifa za mkopaji.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '640px', background: '#FFFFFF', borderRadius: '24px', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', overflow: 'hidden' }}>
        
        {/* HEADER */}
        <div style={{ background: '#1E293B', color: '#FFFFFF', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Edit3 size={22} color="#D4AF37" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900' }}>Badilisha Taarifa & Passport Size (Super Admin)</h3>
              <span style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>{borrower.first_name} {borrower.last_name} (ID: #{borrower.id})</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem', maxHeight: '82vh', overflowY: 'auto' }}>
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B8860B', fontSize: '0.82rem' }}>
            <ShieldCheck size={18} />
            <span>Kama Super Admin, una uwezo wa kubadilisha Taarifa zote na Picha ya Passport Size ya Mkopaji hapa.</span>
          </div>

          {/* PASSPORT SIZE PHOTO UPLOADER BOX */}
          <div style={{ background: '#F8FAFC', border: '2px dashed #CBD5E1', borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              {photoUrl ? (
                <img src={photoUrl} alt="Passport Size" style={{ width: '85px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #D4AF37', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
              ) : (
                <div style={{ width: '85px', height: '100px', borderRadius: '8px', background: '#E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.7rem', border: '1px solid #CBD5E1' }}>
                  <ImageIcon size={24} />
                  <span>No Photo</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>
                📸 Picha ya Passport Size ya Mkopaji
              </label>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Pakia picha mpya ya passport size ya Mkopaji (PNG au JPG).
              </span>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: '#0284C7', color: '#FFFFFF', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', width: 'fit-content' }}>
                <Upload size={15} /> Badilisha Picha Ya Passport
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
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
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Barua Pepe (Email)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '700', color: '#0F172A' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Namba ya NIDA (Vitambulisho)</label>
              <input type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '800', color: '#B8860B' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Kazi / Biashara</label>
              <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '700', color: '#0F172A' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Anwani / Mahali Anapoishi</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '700', color: '#0F172A' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Pato la Mwezi (TSH)</label>
              <input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} required style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '800', color: '#059669' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Hali ya KYC</label>
              <select value={kycStatus} onChange={(e) => setKycStatus(e.target.value)} style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '700', color: '#0F172A' }}>
                <option value="VERIFIED">VERIFIED (NIDA)</option>
                <option value="PENDING">PENDING (Inahakikiwa)</option>
                <option value="REJECTED">REJECTED (Imekataliwa)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Kikundi (Group ID)</label>
              <input type="text" value={groupId} onChange={(e) => setGroupId(e.target.value)} placeholder="mf. Kikundi A" style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '700', color: '#0F172A' }} />
            </div>
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

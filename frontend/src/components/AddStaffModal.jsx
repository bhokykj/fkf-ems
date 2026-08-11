import React, { useState } from 'react';
import { UserPlus, UserCheck, X, Building2, Shield, Lock, Mail, User, Camera, Image, Upload } from 'lucide-react';

export default function AddStaffModal({ branches, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    username: '',
    password: 'password123',
    first_name: '',
    last_name: '',
    email: '',
    employee_id: '',
    phone_number: '',
    passport_photo: '',
    role: 'LOAN_OFFICER',
    branch: branches && branches.length > 0 ? branches[0].id : ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
      setFormData(p => ({ ...p, passport_photo: compressedDataUrl }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await onSubmit(formData);
      setSuccessMsg('Mfanyakazi mpya amesajiliwa kikamilifu!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err?.message || 'Imeshindwa kusajili mfanyakazi mpya.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#1E293B', color: '#D4AF37', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>Sajili Mfanyakazi Mpya (Add Staff)</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B' }}>Panga mfanyakazi mpya pamoja na picha ya Passport Size</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.75rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '600' }}>
              {error}
            </div>
          )}

          {successMsg && (
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', padding: '0.75rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '700', textAlign: 'center' }}>
              {successMsg}
            </div>
          )}

          {/* PASSPORT SIZE PHOTO UPLOADER BOX */}
          <div style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ position: 'relative', width: '90px', height: '110px', background: '#E2E8F0', borderRadius: '12px', border: '2px solid #0F172A', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {formData.passport_photo ? (
                <img src={formData.passport_photo} alt="Staff Passport Size" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#64748B', padding: '0.5rem' }}>
                  <User size={36} color="#94A3B8" />
                  <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: '800', marginTop: '0.2rem' }}>PASSPORT</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexGrow: 1 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Camera size={16} color="#D4AF37" /> Picha ya Passport Size (Staff Passport Photo):
              </label>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                Weka picha rasmi ya mfanyakazi (Passport Size photo) kwa ajili ya vitambulisho na profile ya mfumo.
              </p>
              
              <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#0F172A', color: '#FFFFFF', padding: '0.55rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', width: 'fit-content', marginTop: '0.3rem' }}>
                <Upload size={14} color="#D4AF37" /> {formData.passport_photo ? 'Badilisha Picha ya Passport' : 'Weka Picha ya Passport'}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Jina la Kwanza (First Name)</label>
              <input 
                type="text" 
                required 
                placeholder="mf. Juma" 
                value={formData.first_name} 
                onChange={(e) => setFormData(p => ({ ...p, first_name: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Jina la Pili / Ukoo (Last Name)</label>
              <input 
                type="text" 
                required 
                placeholder="mf. Rashid" 
                value={formData.last_name} 
                onChange={(e) => setFormData(p => ({ ...p, last_name: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Username (Jina la Kuingilia)</label>
              <input 
                type="text" 
                required 
                placeholder="mf. juma_rashid" 
                value={formData.username} 
                onChange={(e) => setFormData(p => ({ ...p, username: e.target.value.toLowerCase().trim() }))}
                style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Nywila (Password)</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Barua Pepe (Email Address)</label>
              <input 
                type="email" 
                placeholder="mf. juma@fkf-microcredit.co.tz" 
                value={formData.email} 
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Namba ya Mfanyakazi (Employee ID)</label>
              <input 
                type="text" 
                placeholder="mf. EMP-TZ-108" 
                value={formData.employee_id} 
                onChange={(e) => setFormData(p => ({ ...p, employee_id: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}
              />
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.3rem' }}>1. Wadhifa (Staff Role)</label>
              <select 
                value={formData.role} 
                onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#B8860B' }}
              >
                <option value="BRANCH_MANAGER">Meneja wa Tawi (Branch Manager)</option>
                <option value="LOAN_OFFICER">Afisa Mkopo (Loan Officer)</option>
                <option value="RISK_OFFICER">Afisa Risk & Auditing (Risk Officer)</option>
                <option value="SUPER_ADMIN">IT / Super Admin (Makao Makuu)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.3rem' }}>2. Chagua Tawi (Assigned Branch)</label>
              <select 
                value={formData.branch} 
                onChange={(e) => setFormData(p => ({ ...p, branch: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
              >
                {branches && branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.7rem 1.25rem' }}>
              Ghairi (Cancel)
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0.7rem 1.5rem' }}>
              <UserPlus size={16} /> {loading ? 'Inasajili...' : 'Sajili Mfanyakazi'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

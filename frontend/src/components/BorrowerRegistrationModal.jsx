import React, { useState, useEffect } from 'react';
import { CreditCard, MapPin, User, ImageIcon, Lock, Info, X, Check } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/branches';

export default function BorrowerRegistrationModal({ currentUser, branches, onClose, onSubmit }) {
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [streets, setStreets] = useState([]);

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    gender: '- Select -',
    date_of_birth: '',
    status: 'Pending',
    email: '',
    occupation: '',
    business_name: '',
    monthly_income: '',
    id_type: '- Select -',
    id_number: '',
    next_of_kin_name: '',
    next_of_kin_phone: '',
    branch: branches && branches.length > 0 ? branches[0].id : '',
    group_id: '',
    region: '',
    district: '',
    ward: '',
    street_or_village: '',
    plot_no: '',
    house_no: '',
    username: '',
    password: '',
    confirm_password: '',
    photo_url: ''
  });

  const [photoPreview, setPhotoPreview] = useState('');
  const [photoFileName, setPhotoFileName] = useState('No file chosen');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Fetch Tanzania Location Tables
    Promise.all([
      fetch(`${API_BASE}/regions/`).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE}/districts/`).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE}/wards/`).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE}/streets/`).then(r => r.json()).catch(() => [])
    ]).then(([regRes, distRes, wardRes, strRes]) => {
      setRegions(Array.isArray(regRes) ? regRes : (regRes?.results || []));
      setDistricts(Array.isArray(distRes) ? distRes : (distRes?.results || []));
      setWards(Array.isArray(wardRes) ? wardRes : (wardRes?.results || []));
      setStreets(Array.isArray(strRes) ? strRes : (strRes?.results || []));
    });
  }, []);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setForm(p => ({ ...p, photo_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedRegionObj = regions.find(r => String(r.id) === String(form.region) || r.name === form.region);
  const filteredDistricts = districts.filter(d => !form.region || String(d.region) === String(selectedRegionObj?.id) || d.region_name === form.region);
  
  const selectedDistrictObj = districts.find(d => String(d.id) === String(form.district) || d.name === form.district);
  const filteredWards = wards.filter(w => !form.district || String(w.district) === String(selectedDistrictObj?.id) || w.district_name === form.district);

  const selectedWardObj = wards.find(w => String(w.id) === String(form.ward) || w.name === form.ward);
  const filteredStreets = streets.filter(s => !form.ward || String(s.ward) === String(selectedWardObj?.id) || s.ward_name === form.ward);

  // Address Preview Calculation
  const regName = selectedRegionObj?.name || (form.region && form.region !== '- Select Region --' ? form.region : '');
  const distName = selectedDistrictObj?.name || (form.district && form.district !== '- Select District --' ? form.district : '');
  const wardName = selectedWardObj?.name || (form.ward && form.ward !== '- Select Ward --' ? form.ward : '');
  const streetName = form.street_or_village && form.street_or_village !== '- Select Street/Village --' ? form.street_or_village : '';

  const addressParts = [
    regName,
    distName,
    wardName,
    streetName,
    form.plot_no ? `Plot No. ${form.plot_no}` : '',
    form.house_no ? `House No. ${form.house_no}` : ''
  ].filter(Boolean);

  const addressPreview = addressParts.length > 0 ? addressParts.join(', ') : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (form.password && form.confirm_password && form.password !== form.confirm_password) {
      setErrorMsg('Nywila hazina usawa (Passwords do not match)');
      return;
    }

    setSubmitLoading(true);

    const nameParts = form.full_name.trim().split(' ');
    const first_name = nameParts[0] || 'Mkopaji';
    const last_name = nameParts.slice(1).join(' ') || 'FKF';

    const payload = {
      first_name,
      last_name,
      phone: form.phone,
      gender: form.gender,
      date_of_birth: form.date_of_birth || null,
      status: form.status,
      email: form.email,
      occupation: form.occupation,
      business_name: form.business_name,
      monthly_income: parseFloat(form.monthly_income) || 500000.00,
      id_type: form.id_type,
      id_number: form.id_number || `NIDA-${Math.floor(Math.random()*90000000+10000000)}`,
      next_of_kin_name: form.next_of_kin_name,
      next_of_kin_phone: form.next_of_kin_phone,
      branch: form.branch || (branches && branches[0] ? branches[0].id : 1),
      group_id: form.group_id,
      region: regName,
      district: distName,
      ward: wardName,
      street_or_village: streetName,
      plot_no: form.plot_no,
      house_no: form.house_no,
      address: addressPreview || `${regName || 'Dar es Salaam'}, ${distName || 'Ilala'}`,
      username: form.username,
      photo_url: form.photo_url,
      created_by_officer_id: currentUser?.id || null,
      created_by_officer_name: currentUser ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.username : null
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setErrorMsg('Imeshindwa kuhifadhi taarifa za mkopaji');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '780px', maxHeight: '92vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '24px', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header Bar */}
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CreditCard size={20} color="#0284C7" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Borrower Details (Usajili wa Mkopaji Mpya)</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {errorMsg && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          {/* SECTION 1: BORROWER DETAILS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px dashed #E2E8F0', paddingBottom: '0.4rem' }}>
              <CreditCard size={18} color="#0284C7" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Borrower Details</h3>
            </div>

            {/* Row 1: Full Name & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Full Name *</label>
                <input type="text" required placeholder="mf. Amina Saidi Juma" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Phone *</label>
                <input type="text" required placeholder="07XXXXXXXX" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }} />
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>Mfano: 07XXXXXXXX au +255XXXXXXXXX</span>
              </div>
            </div>

            {/* Row 2: Gender, Date of Birth, Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Gender</label>
                <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }}>
                  <option value="- Select -">-- Select --</option>
                  <option value="Male">Male (Mwanaume)</option>
                  <option value="Female">Female (Mwanamke)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Date of Birth</label>
                <input type="date" value={form.date_of_birth} onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }}>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Active">Active</option>
                </select>
              </div>
            </div>

            {/* Row 3: Email & Occupation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Email</label>
                <input type="email" placeholder="mfano@gmail.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Occupation</label>
                <input type="text" placeholder="Kazi / Shughuli" value={form.occupation} onChange={e => setForm(p => ({ ...p, occupation: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }} />
              </div>
            </div>

            {/* Row 4: Business Name & Monthly Income */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Business Name</label>
                <input type="text" placeholder="Jina la Biashara" value={form.business_name} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Monthly Income</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRight: 'none', padding: '0.65rem 0.85rem', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>TZS</span>
                  <input type="number" required placeholder="850000" value={form.monthly_income} onChange={e => setForm(p => ({ ...p, monthly_income: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderTopRightRadius: '10px', borderBottomRightRadius: '10px', fontSize: '0.88rem', color: '#059669', fontWeight: '700' }} />
                </div>
              </div>
            </div>

            {/* Row 5: ID Type & ID Number */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>ID Type</label>
                <select value={form.id_type} onChange={e => setForm(p => ({ ...p, id_type: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }}>
                  <option value="- Select -">-- Select --</option>
                  <option value="NIDA">NIDA (National ID)</option>
                  <option value="Passport">Passport</option>
                  <option value="Driver License">Driver's License</option>
                  <option value="Voter ID">Voter ID (Pasi ya Mpiga Kura)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>ID Number</label>
                <input type="text" required placeholder="19900101-11101-00001-20" value={form.id_number} onChange={e => setForm(p => ({ ...p, id_number: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A', fontWeight: '700' }} />
              </div>
            </div>

            {/* Row 6: Next of Kin Name & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Next of Kin Name</label>
                <input type="text" placeholder="Jina la Mthamini / Ndugu" value={form.next_of_kin_name} onChange={e => setForm(p => ({ ...p, next_of_kin_name: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Next of Kin Phone</label>
                <input type="text" placeholder="07XXXXXXXX" value={form.next_of_kin_phone} onChange={e => setForm(p => ({ ...p, next_of_kin_phone: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }} />
              </div>
            </div>

            {/* Row 7: Branch & Group ID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Branch *</label>
                <select required value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }}>
                  <option value="">-- Select Branch --</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Group ID</label>
                <input type="text" placeholder="ID ya Kikundi (Kama Yupo Group)" value={form.group_id} onChange={e => setForm(p => ({ ...p, group_id: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }} />
              </div>
            </div>
          </div>

          {/* SECTION 2: ADDRESS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px dashed #E2E8F0', paddingBottom: '0.4rem' }}>
              <MapPin size={18} color="#0284C7" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Address</h3>
            </div>

            {/* Address Row 1: Region, District, Ward */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Region *</label>
                <select value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value, district: '', ward: '', street_or_village: '' }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }}>
                  <option value="">-- Select Region --</option>
                  {regions.map(r => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>District *</label>
                <select value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value, ward: '', street_or_village: '' }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }}>
                  <option value="">-- Select District --</option>
                  {filteredDistricts.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Ward *</label>
                <select value={form.ward} onChange={e => setForm(p => ({ ...p, ward: e.target.value, street_or_village: '' }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }}>
                  <option value="">-- Select Ward --</option>
                  {filteredWards.map(w => (
                    <option key={w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address Row 2: Street/Village, Plot No, House No */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Street / Village *</label>
                <select value={form.street_or_village} onChange={e => setForm(p => ({ ...p, street_or_village: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A', fontWeight: '700' }}>
                  <option value="">-- Select Street/Village --</option>
                  {filteredStreets.length > 0 ? (
                    filteredStreets.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))
                  ) : streets.length > 0 ? (
                    streets.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.ward_name || s.ward})</option>
                    ))
                  ) : (
                    <>
                      <option value="Mtaa wa Swahili">Mtaa wa Swahili</option>
                      <option value="Mtaa wa Uhuru">Mtaa wa Uhuru</option>
                      <option value="Mtaa wa Lindi">Mtaa wa Lindi</option>
                      <option value="Mtaa wa Livingstone">Mtaa wa Livingstone</option>
                      <option value="Mtaa wa Nyamwezi">Mtaa wa Nyamwezi</option>
                      <option value="Mtaa wa Mkunguni">Mtaa wa Mkunguni</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Plot No</label>
                <input type="text" placeholder="Plot No." value={form.plot_no} onChange={e => setForm(p => ({ ...p, plot_no: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>House No</label>
                <input type="text" placeholder="House No." value={form.house_no} onChange={e => setForm(p => ({ ...p, house_no: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }} />
              </div>
            </div>

            {/* Address Preview Box */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.1rem 1.25rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0F172A' }}>Address Preview:</span>
              <div>
                {addressPreview ? (
                  <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: '700', display: 'inline-block' }}>
                    {addressPreview}
                  </span>
                ) : (
                  <span style={{ background: '#F1F5F9', color: '#94A3B8', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: '600', display: 'inline-block' }}>
                    Hakuna address bado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: BORROWER ACCOUNT DETAILS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.4rem' }}>
              <User size={18} color="#0284C7" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Borrower Account Details</h3>
            </div>

            {/* Username & Password Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Username</label>
                <input type="text" placeholder="username" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }} />
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>Ukiacha tupu, mfumo utatengeneza yenyewe.</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Password *</label>
                <input type="password" required placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Confirm Password *</label>
                <input type="password" required placeholder="••••••••" value={form.confirm_password} onChange={e => setForm(p => ({ ...p, confirm_password: e.target.value }))} style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A' }} />
              </div>
            </div>

            {/* Photo Upload Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Photo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '0.4rem 0.75rem', width: '100%', maxWidth: '380px' }}>
                  <label htmlFor="borrower-photo-upload" style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', color: '#334155' }}>
                    Choose File
                  </label>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', marginLeft: '0.75rem' }}>{photoFileName}</span>
                  <input id="borrower-photo-upload" type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
                </div>

                {photoPreview && (
                  <img src={photoPreview} alt="Passport Preview" style={{ width: '45px', height: '52px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #D4AF37' }} />
                )}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>Picha iwe chini ya 2MB</span>
            </div>

          </div>

          {/* SUBMIT BUTTON */}
          <button type="submit" disabled={submitLoading} style={{ background: '#0284C7', color: '#FFFFFF', border: 'none', padding: '0.9rem 1.5rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: 'fit-content' }}>
            <Lock size={18} /> {submitLoading ? 'Inahifadhi...' : 'Save Borrower + Create Account'}
          </button>

          {/* SECTION 4: MAELEKEZO NOTICE BOX */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284C7', fontWeight: '800', fontSize: '0.9rem' }}>
              <Info size={18} /> Maelekezo
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
              Borrower akiongezwa hapa:
            </p>
            <ul style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, paddingLeft: '1.25rem', lineHeight: '1.5' }}>
              <li>atawekwa kwenye <strong>borrowers</strong></li>
              <li>atatengenezewa <strong>account kwenye users</strong></li>
              <li><strong>username/password</strong> vitatumika kuingia</li>
              <li>ataweza kufungua <strong>borrower dashboard</strong></li>
              <li>address zinatoka kwenye database tables: regions, districts, wards, streets</li>
            </ul>
          </div>

        </form>

      </div>
    </div>
  );
}

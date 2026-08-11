import React, { useState, useEffect } from 'react';
import { Building2, Save, X, Percent, DollarSign, ShieldAlert, CheckCircle2, MapPin } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/branches';

export default function BranchSettingsModal({ branch, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: branch?.name || '',
    code: branch?.code || '',
    location: branch?.location || '',
    region: branch?.region || 'Dar es Salaam',
    district: branch?.district || 'Ilala',
    ward: branch?.ward || 'Kariakoo',
    street_or_village: branch?.street_or_village || 'Mtaa wa Swahili',
    block_number: branch?.block_number || 'Block A',
    house_number: branch?.house_number || 'Nyumba No 12',
    max_loan_amount: branch?.max_loan_amount || 5000000,
    interest_rate_pct: branch?.interest_rate_pct || 14.5,
    penalty_type: branch?.penalty_type || 'PERCENTAGE',
    penalty_value: branch?.penalty_value || 5.0,
    require_collateral: branch?.require_collateral ?? true,
    collateral_min_ltv_pct: branch?.collateral_min_ltv_pct || 70.0,
    is_active: branch?.is_active ?? true
  });

  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [streets, setStreets] = useState([]);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(branch.id, formData);
      setSuccessMsg('Taarifa na mipango ya tawi zimehifadhiwa kikamilifu!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const selectedRegionObj = regions.find(r => r.name === formData.region);
  const filteredDistricts = districts.filter(d => !formData.region || String(d.region) === String(selectedRegionObj?.id) || d.region_name === formData.region);
  
  const selectedDistrictObj = districts.find(d => d.name === formData.district);
  const filteredWards = wards.filter(w => !formData.district || String(w.district) === String(selectedDistrictObj?.id) || w.district_name === formData.district);

  const selectedWardObj = wards.find(w => w.name === formData.ward);
  const filteredStreets = streets.filter(s => !formData.ward || String(s.ward) === String(selectedWardObj?.id) || s.ward_name === formData.ward);

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/fkf-logo.png" alt="FKF Micro-Credit" style={{ height: '38px', width: 'auto', borderRadius: '6px' }} />
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                Badili Taarifa za Tawi (Edit Branch Settings)
              </h3>
              <p style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1D4ED8', margin: 0 }}>
                {branch ? `${branch.name} (${branch.code})` : 'Tawi la Tanzania'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', color: '#64748B', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} />
          </button>
        </div>

        {successMsg && (
          <div style={{ background: '#DCFCE7', border: '1.5px solid #86EFAC', color: '#166534', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '800' }}>
            <CheckCircle2 size={18} color="#166534" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Section 1: Basic Identity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>Jina la Tawi (Branch Name) *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.65rem', background: '#F8FAFC', border: '1.5px solid #94A3B8', borderRadius: '8px', color: '#0F172A', fontWeight: '800', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>Kodi ya Tawi (Branch Code) *</label>
              <input 
                type="text" 
                name="code" 
                value={formData.code} 
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.65rem', background: '#F8FAFC', border: '1.5px solid #94A3B8', borderRadius: '8px', color: '#1D4ED8', fontWeight: '900', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* Section 2: Tanzania Location Hierarchy */}
          <div style={{ background: '#F8FAFC', padding: '1.1rem', borderRadius: '14px', border: '1.5px solid #CBD5E1' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0284C7', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={18} color="#0284C7" /> Eneo la Tawi Tanzania (Location Hierarchy)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>Mkoa (Region)</label>
                <select name="region" value={formData.region} onChange={handleChange} style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1.5px solid #94A3B8', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem', fontWeight: '800' }}>
                  {regions.map(r => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>Wilaya (District)</label>
                <select name="district" value={formData.district} onChange={handleChange} style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1.5px solid #94A3B8', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem', fontWeight: '800' }}>
                  {filteredDistricts.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>Kata (Ward)</label>
                <select name="ward" value={formData.ward} onChange={handleChange} style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1.5px solid #94A3B8', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem', fontWeight: '800' }}>
                  {filteredWards.map(w => (
                    <option key={w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>Mtaa / Kijiji (Street/Village) *</label>
                <select name="street_or_village" value={formData.street_or_village} onChange={handleChange} style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1.5px solid #94A3B8', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem', fontWeight: '800' }}>
                  {filteredStreets.length > 0 ? (
                    filteredStreets.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="Mtaa wa Swahili">Mtaa wa Swahili</option>
                      <option value="Mtaa wa Uhuru">Mtaa wa Uhuru</option>
                      <option value="Mtaa wa Lindi">Mtaa wa Lindi</option>
                      <option value="Mtaa wa Livingstone">Mtaa wa Livingstone</option>
                      <option value="Mtaa wa Nyamwezi">Mtaa wa Nyamwezi</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Manual Fields: Block Number & House Number */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>Kitalu / Block Number (Block No) *</label>
                <input 
                  type="text" 
                  name="block_number" 
                  value={formData.block_number} 
                  onChange={handleChange}
                  placeholder="mf. Block A / Plot 45"
                  style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1.5px solid #94A3B8', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem', fontWeight: '800' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>Namba ya Nyumba (House No) *</label>
                <input 
                  type="text" 
                  name="house_number" 
                  value={formData.house_number} 
                  onChange={handleChange}
                  placeholder="mf. Nyumba No 12B"
                  style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1.5px solid #94A3B8', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem', fontWeight: '800' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Loan Parameters */}
          <div style={{ background: '#F8FAFC', padding: '1.1rem', borderRadius: '14px', border: '1.5px solid #CBD5E1' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#B8860B', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldAlert size={18} color="#B8860B" /> Masharti ya Mkopo (Dynamic Branch Parameters)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>Kiwango cha Juu cha Mkopo (TSH)</label>
                <input 
                  type="number" 
                  name="max_loan_amount" 
                  value={formData.max_loan_amount} 
                  onChange={handleChange}
                  step="100000"
                  style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1.5px solid #94A3B8', borderRadius: '8px', color: '#059669', fontWeight: '900', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>Riba ya Tawi (% per term)</label>
                <input 
                  type="number" 
                  name="interest_rate_pct" 
                  value={formData.interest_rate_pct} 
                  onChange={handleChange}
                  step="0.1"
                  style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1.5px solid #94A3B8', borderRadius: '8px', color: '#0F172A', fontWeight: '900', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>Aina ya Faini (Penalty Type)</label>
                <select 
                  name="penalty_type" 
                  value={formData.penalty_type} 
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1.5px solid #94A3B8', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem', fontWeight: '800' }}
                >
                  <option value="PERCENTAGE">Percentage (%) ya Marejesho</option>
                  <option value="FLAT">Flat Rate (Kiasi cha TSH)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>
                  Kiasi cha Faini {formData.penalty_type === 'PERCENTAGE' ? '(%)' : '(TSH)'}
                </label>
                <input 
                  type="number" 
                  name="penalty_value" 
                  value={formData.penalty_value} 
                  onChange={handleChange}
                  step="0.5"
                  style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1.5px solid #94A3B8', borderRadius: '8px', color: '#0F172A', fontWeight: '900', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.8rem' }}>
                <input 
                  type="checkbox" 
                  id="require_collateral" 
                  name="require_collateral" 
                  checked={formData.require_collateral} 
                  onChange={handleChange}
                  style={{ width: '20px', height: '20px', accentColor: '#1D4ED8', cursor: 'pointer' }}
                />
                <label htmlFor="require_collateral" style={{ fontSize: '0.9rem', fontWeight: '900', color: '#0F172A', cursor: 'pointer' }}>Lazima Kuweka Dhamana</label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>Hali ya Tawi (Status)</label>
                <select name="is_active" value={formData.is_active ? 'true' : 'false'} onChange={e => setFormData(p => ({ ...p, is_active: e.target.value === 'true' }))} style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1.5px solid #94A3B8', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem', fontWeight: '800' }}>
                  <option value="true">Linafanya Kazi (Active)</option>
                  <option value="false">Limesimamishwa (Inactive)</option>
                </select>
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', padding: '0.6rem 1.25rem', fontWeight: '800' }}>Ghairi</button>
            <button type="submit" className="btn-primary" disabled={saving} style={{ background: '#0284C7', padding: '0.6rem 1.5rem', fontWeight: '900', fontSize: '0.9rem' }}>
              <Save size={16} /> {saving ? 'Inahifadhi...' : 'Hifadhi Mabadiliko ya Tawi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Building2, MapPin, X, Plus, Check, DollarSign, Percent, ShieldCheck } from 'lucide-react';

const TANZANIA_REGIONS = [
  'Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Mbeya', 
  'Morogoro', 'Tanga', 'Kilimanjaro', 'Songwe', 'Kigoma', 
  'Tabora', 'Ruvuma', 'Kagera', 'Iringa', 'Shinyanga', 
  'Manyara', 'Mara', 'Geita', 'Katavi', 'Njombe', 
  'Lindi', 'Mtwara', 'Unguja / Zanzibar', 'Pemba'
];

export default function NewBranchModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    region: 'Dar es Salaam',
    district: '',
    ward: '',
    street_or_village: 'Mtaa wa Swahili',
    block_number: 'Block A',
    house_number: 'Nyumba No 12',
    max_loan_amount: '5000000',
    interest_rate_pct: '14.5',
    penalty_type: 'PERCENTAGE',
    penalty_value: '5.0',
    require_collateral: true,
    collateral_min_ltv_pct: '70.0'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fullLocation = `${formData.street_or_village}, Kata ya ${formData.ward}, Wilaya ya ${formData.district}, ${formData.region}`;

    try {
      await onSubmit({
        ...formData,
        location: fullLocation,
        max_loan_amount: parseFloat(formData.max_loan_amount),
        interest_rate_pct: parseFloat(formData.interest_rate_pct),
        penalty_value: parseFloat(formData.penalty_value),
        collateral_min_ltv_pct: parseFloat(formData.collateral_min_ltv_pct)
      });
      onClose();
    } catch (err) {
      setError('Imeshindwa kusajili tawi jipya. Hakikisha kodi ya tawi haijarudiwa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        
        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#1E293B', color: '#D4AF37', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>Sajili Tawi Jipya la Tanzania</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B' }}>Ingiza taarifa za eneo, mkoa, wilaya na vigezo vya mkopo</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.75rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '600' }}>
              {error}
            </div>
          )}

          {/* Section 1: Taarifa za Tawi */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#D4AF37', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building2 size={16} /> 1. Taarifa za Tawi (Branch Info)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Jina la Tawi</label>
                <input 
                  type="text" 
                  required 
                  placeholder="mf. Morogoro Branch" 
                  value={formData.name} 
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Kodi ya Tawi (Branch Code)</label>
                <input 
                  type="text" 
                  required 
                  placeholder="mf. BR-MRG-06" 
                  value={formData.code} 
                  onChange={(e) => setFormData(p => ({ ...p, code: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Eneo / Location (Mkoa, Wilaya, Kata, Mtaa/Kijiji) */}
          <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0284C7', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} /> 2. Sajili Location ya Tanzania (Mkoa, Wilaya, Kata, Mtaa)
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Mkoa (Region)</label>
                <select 
                  value={formData.region} 
                  onChange={(e) => setFormData(p => ({ ...p, region: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}
                >
                  {TANZANIA_REGIONS.map(reg => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Wilaya (District)</label>
                <input 
                  type="text" 
                  required 
                  placeholder="mf. Ilala / Nyamagana / Arusha CBD" 
                  value={formData.district} 
                  onChange={(e) => setFormData(p => ({ ...p, district: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Kata (Ward)</label>
                <input 
                  type="text" 
                  required 
                  placeholder="mf. Kariakoo / Area D" 
                  value={formData.ward} 
                  onChange={(e) => setFormData(p => ({ ...p, ward: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Mtaa / Kijiji (Street/Village) *</label>
                <select 
                  value={formData.street_or_village} 
                  onChange={(e) => setFormData(p => ({ ...p, street_or_village: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}
                >
                  <option value="Mtaa wa Swahili">Mtaa wa Swahili</option>
                  <option value="Mtaa wa Uhuru">Mtaa wa Uhuru</option>
                  <option value="Mtaa wa Lindi">Mtaa wa Lindi</option>
                  <option value="Mtaa wa Livingstone">Mtaa wa Livingstone</option>
                  <option value="Mtaa wa Nyamwezi">Mtaa wa Nyamwezi</option>
                  <option value="Mtaa wa Mkunguni">Mtaa wa Mkunguni</option>
                  <option value="Mtaa wa Sikukuu">Mtaa wa Sikukuu</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Kitalu / Block Number (Block No) *</label>
                <input 
                  type="text" 
                  placeholder="mf. Block A / Plot 45" 
                  value={formData.block_number} 
                  onChange={(e) => setFormData(p => ({ ...p, block_number: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Namba ya Nyumba (House No) *</label>
                <input 
                  type="text" 
                  placeholder="mf. Nyumba No 12B" 
                  value={formData.house_number} 
                  onChange={(e) => setFormData(p => ({ ...p, house_number: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Masharti na Ukomo wa Mkopo TSH */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#059669', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <DollarSign size={16} /> 3. Ukomo wa Mkopo & Riba ya Tawi (TSH Rules)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Ukomo wa Mkopo (Max Cap TSH)</label>
                <input 
                  type="number" 
                  required 
                  step="500000"
                  value={formData.max_loan_amount} 
                  onChange={(e) => setFormData(p => ({ ...p, max_loan_amount: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#059669' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Riba ya Kila Mwezi (%)</label>
                <input 
                  type="number" 
                  required 
                  step="0.1"
                  value={formData.interest_rate_pct} 
                  onChange={(e) => setFormData(p => ({ ...p, interest_rate_pct: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Aina ya Faini ya Chelezo</label>
                <select 
                  value={formData.penalty_type} 
                  onChange={(e) => setFormData(p => ({ ...p, penalty_type: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                >
                  <option value="PERCENTAGE">Asilimia ya Mkopo (%)</option>
                  <option value="FLAT">Kiasi Maalum (Flat TSH)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Kiasi/Asilimia ya Faini</label>
                <input 
                  type="number" 
                  required 
                  step="0.1"
                  value={formData.penalty_value} 
                  onChange={(e) => setFormData(p => ({ ...p, penalty_value: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#D97706' }}
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.7rem 1.25rem' }}>
              Ghairi (Cancel)
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0.7rem 1.5rem' }}>
              <Plus size={16} /> {loading ? 'Inasajili...' : 'Hifadhi Tawi Jipya'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Edit3, Save, X, Coins, ShieldCheck, FileText, Trash2 } from 'lucide-react';

export default function EditLoanProductModal({ product, branches, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    branch: '',
    product_code: '',
    product_name: '',
    description: '',
    min_amount: '',
    max_amount: '',
    min_duration: 1,
    max_duration: 12,
    interest_rate_pct: '',
    interest_type: 'Flat',
    penalty_rate: '',
    penalty_type: 'Percentage',
    repayment_frequency: 'Monthly',
    status: 'Active',
    processing_fee: '0.00',
    insurance_fee: '0.00',
    vat_pct: '0.00',
    grace_days: 0,
    guarantor_required: 'Yes',
    no_of_guarantors: 1,
    collateral_required: 'No',
    req_nida: 'Required',
    req_tin: 'Not Required',
    req_kadi_ya_chama: 'Not Required',
    req_leseni_ya_biashara: 'Not Required',
    req_picha_ya_biashara: 'Not Required'
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        branch: product.branch || (branches && branches.length > 0 ? branches[0].id : ''),
        product_code: product.product_code || '',
        product_name: product.product_name || '',
        description: product.description || '',
        min_amount: product.min_amount || '0.00',
        max_amount: product.max_amount || '5000000.00',
        min_duration: product.min_duration || 1,
        max_duration: product.max_duration || 12,
        interest_rate_pct: product.interest_rate_pct || '14.50',
        interest_type: product.interest_type || 'Flat',
        penalty_rate: product.penalty_rate || '5.00',
        penalty_type: product.penalty_type || 'Percentage',
        repayment_frequency: product.repayment_frequency || 'Monthly',
        status: product.status || 'Active',
        processing_fee: product.processing_fee || '0.00',
        insurance_fee: product.insurance_fee || '0.00',
        vat_pct: product.vat_pct || '0.00',
        grace_days: product.grace_days || 0,
        guarantor_required: product.guarantor_required || 'Yes',
        no_of_guarantors: product.no_of_guarantors || 1,
        collateral_required: product.collateral_required || 'No',
        req_nida: product.req_nida || 'Required',
        req_tin: product.req_tin || 'Not Required',
        req_kadi_ya_chama: product.req_kadi_ya_chama || 'Not Required',
        req_leseni_ya_biashara: product.req_leseni_ya_biashara || 'Not Required',
        req_picha_ya_biashara: product.req_picha_ya_biashara || 'Not Required'
      });
    }
  }, [product, branches]);

  if (!product) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      await onSubmit(product.id, formData);
      setSuccessMsg('Taarifa za Bidhaa ya Mkopo zimebadilishwa kikamilifu!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Imeshindwa kubadilisha taarifa za product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '720px', maxHeight: '92vh', overflowY: 'auto', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: '#FEF3C7', color: '#B8860B', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Edit3 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Badilisha Bidhaa ya Mkopo ({product.product_code})</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Edit Loan Product Parameters & Interest Rates</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {successMsg && (
            <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', padding: '0.85rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800', textAlign: 'center' }}>
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.85rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          {/* Section 1: Basic Product Identity */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Coins size={16} color="#0284C7" /> Identity & Code ya Product
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Product Code *</label>
                <input type="text" name="product_code" value={formData.product_code} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Jina la Product (Product Name) *</label>
                <input type="text" name="product_name" value={formData.product_name} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }} />
              </div>
            </div>
            <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Tawi Inapohusika (Branch)</label>
                <select name="branch" value={formData.branch} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}>
                  {branches && branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Maelezo ya Product (Description)</label>
                <textarea name="description" rows="2" value={formData.description} onChange={handleChange} placeholder="Weka maelezo ya kina ya bidhaa hii..." style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', resize: 'vertical' }} />
              </div>
            </div>
          </div>

          {/* Section 2: Amounts & Interest Rates */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Coins size={16} color="#059669" /> Viwango vya Fedha na Riba (%)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Kiwango cha Chini (Min Amount TSH)</label>
                <input type="number" step="0.01" name="min_amount" value={formData.min_amount} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Kiwango cha Juu (Max Amount TSH)</label>
                <input type="number" step="0.01" name="max_amount" value={formData.max_amount} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Riba (%) *</label>
                <input type="number" step="0.01" name="interest_rate_pct" value={formData.interest_rate_pct} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Aina ya Riba</label>
                <select name="interest_type" value={formData.interest_type} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}>
                  <option value="Flat">Flat Rate</option>
                  <option value="Reducing">Reducing Balance</option>
                  <option value="Compound">Compound</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Mzunguko (Frequency)</label>
                <select name="repayment_frequency" value={formData.repayment_frequency} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}>
                  <option value="Monthly">Kila Mwezi (Monthly)</option>
                  <option value="Weekly">Kila Wiki (Weekly)</option>
                  <option value="Daily">Kila Siku (Daily)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Muda wa Chini (Min Months)</label>
                <input type="number" name="min_duration" value={formData.min_duration} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Muda wa Juu (Max Months)</label>
                <input type="number" name="max_duration" value={formData.max_duration} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }} />
              </div>
            </div>
          </div>

          {/* Section 3: Status & Fees */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="#D97706" /> Hali ya Product & Ada (Fees)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Hali (Status)</label>
                <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '700' }}>
                  <option value="Active">Inafanya Kazi (Active)</option>
                  <option value="Inactive">Imesimamishwa (Inactive)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Faini ya Chelezo (%)</label>
                <input type="number" step="0.01" name="penalty_rate" value={formData.penalty_rate} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Ada ya Processing (TSH)</label>
                <input type="number" step="0.01" name="processing_fee" value={formData.processing_fee} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F1F5F9', color: '#475569', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}>
              Ghafri / Ghairi
            </button>
            <button type="submit" disabled={saving} style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none', background: '#059669', color: '#FFFFFF', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Save size={16} /> {saving ? 'Inahifadhi...' : 'Hifadhi Mabadiliko'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

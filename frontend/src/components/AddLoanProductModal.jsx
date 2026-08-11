import React, { useState } from 'react';
import { PlusCircle, Save, X, Coins, Users, FileText, CheckCircle2 } from 'lucide-react';

export default function AddLoanProductModal({ branches, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    branch: branches && branches.length > 0 ? branches[0].id : '',
    product_code: 'MF-BIASHARA-01',
    product_name: 'BIASHARA LOAN',
    description: 'Maelezo ya product hii...',
    min_amount: '0.00',
    max_amount: '5000000.00',
    min_duration: 1,
    max_duration: 12,
    interest_rate_pct: '14.50',
    interest_type: 'Flat',
    penalty_rate: '5.00',
    penalty_type: 'Percentage',
    repayment_frequency: 'Monthly',
    status: 'Active',
    
    // Fees & Grace Period
    processing_fee: '0.00',
    insurance_fee: '0.00',
    vat_pct: '0.00',
    grace_days: 0,
    
    // Guarantor & Collateral
    guarantor_required: 'Yes',
    no_of_guarantors: 1,
    collateral_required: 'No',
    
    // Required Documents
    req_nida: 'Required',
    req_tin: 'Not Required',
    req_kadi_ya_chama: 'Not Required',
    req_leseni_ya_biashara: 'Not Required',
    req_picha_ya_biashara: 'Not Required'
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
      await onSubmit(formData);
      setSuccessMsg('Product ya Mkopo imesajiliwa kikamilifu!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Hitilafu imetokea wakati wa kuhifadhi product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '720px', maxHeight: '92vh', overflowY: 'auto', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: '#2563EB', color: '#FFFFFF', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '800' }}>
              +
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Add Loan Product</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Form */}
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

          {/* 1. Branch selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Branch</label>
            <select name="branch" value={formData.branch} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }}>
              <option value="">-- Chagua Branch --</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>

          {/* Product Code */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Product Code</label>
            <input type="text" name="product_code" value={formData.product_code} onChange={handleChange} required style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }} />
          </div>

          {/* Product Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Product Name</label>
            <input type="text" name="product_name" value={formData.product_name} onChange={handleChange} required style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }} />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Description</label>
            <textarea rows={3} name="description" value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }} />
          </div>

          {/* Min Amount & Max Amount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Min Amount</label>
              <input type="text" name="min_amount" value={formData.min_amount} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Max Amount</label>
              <input type="text" name="max_amount" value={formData.max_amount} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }} />
            </div>
          </div>

          {/* Min Duration & Max Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Min Duration</label>
              <input type="number" name="min_duration" value={formData.min_duration} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Max Duration</label>
              <input type="number" name="max_duration" value={formData.max_duration} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }} />
            </div>
          </div>

          {/* Interest Rate % & Interest Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Interest Rate %</label>
              <input type="text" name="interest_rate_pct" value={formData.interest_rate_pct} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Interest Type</label>
              <select name="interest_type" value={formData.interest_type} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }}>
                <option value="Flat">Flat</option>
                <option value="Reducing Balance">Reducing Balance</option>
              </select>
            </div>
          </div>

          {/* Penalty Rate & Penalty Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Penalty Rate</label>
              <input type="text" name="penalty_rate" value={formData.penalty_rate} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Penalty Type</label>
              <select name="penalty_type" value={formData.penalty_type} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }}>
                <option value="Percentage">Percentage</option>
                <option value="Flat Amount">Flat Amount</option>
              </select>
            </div>
          </div>

          {/* Repayment & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Repayment</label>
              <select name="repayment_frequency" value={formData.repayment_frequency} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }}>
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Daily">Daily</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* SECTION: Fees & Grace Period */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#2563EB', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Coins size={18} /> Fees & Grace Period
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Processing Fee</label>
                <input type="text" name="processing_fee" value={formData.processing_fee} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Insurance Fee</label>
                <input type="text" name="insurance_fee" value={formData.insurance_fee} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>VAT %</label>
                <input type="text" name="vat_pct" value={formData.vat_pct} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Grace Days</label>
                <input type="number" name="grace_days" value={formData.grace_days} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }} />
              </div>
            </div>
          </div>

          {/* SECTION: Guarantor & Collateral */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#2563EB', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={18} /> Guarantor & Collateral
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Guarantor Required</label>
                <select name="guarantor_required" value={formData.guarantor_required} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>No. of Guarantors</label>
                <input type="number" name="no_of_guarantors" value={formData.no_of_guarantors} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Collateral Required</label>
              <select name="collateral_required" value={formData.collateral_required} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          {/* SECTION: Required Documents */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#2563EB', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={18} /> Required Documents
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>NIDA/ID</label>
                <select name="req_nida" value={formData.req_nida} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }}>
                  <option value="Required">Required</option>
                  <option value="Not Required">Not Required</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>TIN</label>
                <select name="req_tin" value={formData.req_tin} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }}>
                  <option value="Not Required">Not Required</option>
                  <option value="Required">Required</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Kadi ya Chama</label>
                <select name="req_kadi_ya_chama" value={formData.req_kadi_ya_chama} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }}>
                  <option value="Not Required">Not Required</option>
                  <option value="Required">Required</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Leseni ya Biashara</label>
                <select name="req_leseni_ya_biashara" value={formData.req_leseni_ya_biashara} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }}>
                  <option value="Not Required">Not Required</option>
                  <option value="Required">Required</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Picha ya Biashara</label>
              <select name="req_picha_ya_biashara" value={formData.req_picha_ya_biashara} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A' }}>
                <option value="Not Required">Not Required</option>
                <option value="Required">Required</option>
              </select>
            </div>
          </div>

          {/* Submit Action Button */}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button 
              type="submit" 
              disabled={saving} 
              style={{ width: '100%', padding: '0.8rem', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <Save size={18} /> {saving ? 'Inahifadhi Product...' : '💾 Save Product'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

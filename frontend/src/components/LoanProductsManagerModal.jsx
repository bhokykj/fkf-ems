import React, { useState } from 'react';
import { Package, Plus, Edit3, Trash2, X, Coins, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import EditLoanProductModal from './EditLoanProductModal';

export default function LoanProductsManagerModal({
  loanProducts,
  branches,
  currentUser,
  userBranchId,
  onClose,
  onOpenAddModal,
  onEditProduct,
  onDeleteProduct
}) {
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.username === 'admin' || currentUser?.is_superuser;

  // Filter products for branch if user is not superadmin
  const visibleProducts = (loanProducts || []).filter(p => {
    if (isSuperAdmin) return true; // Super Admin sees all
    if (!userBranchId || userBranchId === 'all') return true;
    return !p.branch || String(p.branch) === String(userBranchId) || String(p.branch_id) === String(userBranchId);
  });

  const filteredProducts = visibleProducts.filter(p => 
    p.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.product_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id, name) => {
    if (window.confirm(`Je, una uhakika unataka kufuta product hii ya mkopo "${name}"?`)) {
      try {
        await onDeleteProduct(id);
      } catch (err) {
        alert(err.message || 'Imeshindwa kufuta product.');
      }
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '960px', maxHeight: '92vh', overflowY: 'auto', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#047857', color: '#FFFFFF', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Orodha na Usimamizi wa Bidhaa za Mikopo</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>Manage Loan Products - View, Create, Edit & Delete Products</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}>
            <X size={22} />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div style={{ padding: '1rem 1.75rem', background: '#FFFFFF', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Tafuta kulingana na jina au code..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', width: '280px', fontWeight: '700' }}
          />

          {isSuperAdmin ? (
            <button 
              onClick={onOpenAddModal}
              style={{ background: '#059669', color: '#FFFFFF', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)' }}
            >
              <Plus size={16} /> + Sajili Loan Product Mpya (Super Admin Only)
            </button>
          ) : (
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.45rem 0.85rem', borderRadius: '8px', color: '#1D4ED8', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="#1D4ED8" /> Bidhaa Zilizoidhinishwa na Super Admin Kwa Tawi Hili
            </div>
          )}
        </div>

        {/* Modal Content - Product Cards Grid */}
        <div style={{ padding: '1.75rem', background: '#F8FAFC', flex: 1 }}>
          {filteredProducts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {filteredProducts.map(p => (
                <div key={p.id} style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)' }}>
                  
                  <div>
                    {/* Header: Name & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#0284C7', background: '#E0F2FE', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #BAE6FD' }}>
                          {p.product_code}
                        </span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginTop: '0.35rem', margin: 0 }}>
                          {p.product_name}
                        </h4>
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', background: p.status === 'Active' ? '#ECFDF5' : '#FEF2F2', color: p.status === 'Active' ? '#047857' : '#DC2626', padding: '0.2rem 0.5rem', borderRadius: '12px', border: `1px solid ${p.status === 'Active' ? '#A7F3D0' : '#FCA5A5'}` }}>
                        {p.status || 'Active'}
                      </span>
                    </div>

                    {p.description && (
                      <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.85rem', lineHeight: '1.3' }}>
                        {p.description}
                      </p>
                    )}

                    {/* Details Badges */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.78rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Riba (%):</span>
                        <strong style={{ color: '#059669' }}>{p.interest_rate_pct}% ({p.interest_type || 'Flat'})</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Kiasi cha Mkopo:</span>
                        <strong style={{ color: '#0F172A' }}>
                          {parseFloat(p.min_amount || 0).toLocaleString()} - {parseFloat(p.max_amount || 0).toLocaleString()} TSH
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Muda (Tenure):</span>
                        <strong style={{ color: '#334155' }}>
                          {p.min_duration} - {p.max_duration} Miezi ({p.repayment_frequency || 'Monthly'})
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Faini / Penalty:</span>
                        <strong style={{ color: '#D97706' }}>{p.penalty_rate}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete Buttons (Super Admin Only) */}
                  {isSuperAdmin && (
                    <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                      <button 
                        onClick={() => setEditingProduct(p)}
                        style={{ flex: 1, padding: '0.45rem', borderRadius: '8px', border: '1px solid #FCD34D', background: '#FEF3C7', color: '#B8860B', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                      >
                        <Edit3 size={14} /> Badili (Edit)
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id, p.product_name)}
                        style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                      >
                        <Trash2 size={14} /> Futa
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#FFFFFF', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
              <Package size={42} color="#94A3B8" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#334155' }}>Hakuna Product ya Mkopo Iliyosajiliwa Bado</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
                Bonyeza kitufe cha chini kusajili bidhaa mpya ya mkopo kwa ajili ya wateja na matawi.
              </p>
              <button 
                onClick={onOpenAddModal}
                style={{ background: '#059669', color: '#FFFFFF', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={16} /> + Sajili Loan Product Mpya
              </button>
            </div>
          )}
        </div>

        {/* Edit Modal Popup */}
        {editingProduct && (
          <EditLoanProductModal 
            product={editingProduct}
            branches={branches}
            onClose={() => setEditingProduct(null)}
            onSubmit={async (id, payload) => {
              await onEditProduct(id, payload);
              setEditingProduct(null);
            }}
          />
        )}

      </div>
    </div>
  );
}

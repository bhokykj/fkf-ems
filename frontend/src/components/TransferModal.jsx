import React, { useState } from 'react';
import { ArrowRightLeft, Building2, UserCheck, X, Shield, Users, Info, FileText } from 'lucide-react';

export default function TransferModal({ staffList, borrowers, branches, onClose, onTransferStaff, onTransferBorrower }) {
  const [transferType, setTransferType] = useState('STAFF'); // STAFF or BORROWER
  
  const [selectedStaffId, setSelectedStaffId] = useState(staffList && staffList.length > 0 ? staffList[0].id : '');
  const [newStaffBranchId, setNewStaffBranchId] = useState(branches && branches.length > 0 ? branches[0].id : '');
  const [newStaffRole, setNewStaffRole] = useState('BRANCH_MANAGER');

  const [selectedBorrowerId, setSelectedBorrowerId] = useState(borrowers && borrowers.length > 0 ? borrowers[0].id : '');
  const [newBorrowerBranchId, setNewBorrowerBranchId] = useState(branches && branches.length > 0 ? branches[0].id : '');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const selectedBorrowerObj = borrowers.find(b => String(b.id) === String(selectedBorrowerId));
  const activeLoansCount = selectedBorrowerObj?.loans_count || 0;
  const currentBranchName = selectedBorrowerObj?.branch_detail?.name || 'Tawi la Zamani';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    try {
      if (transferType === 'STAFF') {
        await onTransferStaff({
          user_id: selectedStaffId,
          new_branch_id: newStaffBranchId,
          new_role: newStaffRole
        });
        const staffObj = staffList.find(s => String(s.id) === String(selectedStaffId));
        const branchObj = branches.find(b => String(b.id) === String(newStaffBranchId));
        setSuccessMsg(`Mfanyakazi ${staffObj?.first_name || ''} amehamishwa kikamilifu kwenda tawi la ${branchObj?.name || ''}!`);
      } else {
        await onTransferBorrower(selectedBorrowerId, newBorrowerBranchId);
        const borrowerObj = borrowers.find(b => String(b.id) === String(selectedBorrowerId));
        const branchObj = branches.find(b => String(b.id) === String(newBorrowerBranchId));
        setSuccessMsg(`Mkopaji ${borrowerObj?.first_name || ''} ${borrowerObj?.last_name || ''} (pamoja na mikopo yake yote) amehamishwa kikamilifu kwenda tawi la ${branchObj?.name || ''}!`);
      }
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '620px', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#F3E8FF', color: '#7C3AED', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRightLeft size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>Transfer Branch, Staff & Borrower Roles</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B' }}>Hamisha Wafanyakazi au Wakopaji (na Mikopo yao) kati ya Matawi</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {successMsg && (
            <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', padding: '0.85rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800', textAlign: 'center' }}>
              {successMsg}
            </div>
          )}

          {/* Type Switcher */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>Aina ya Uhamisho (Transfer Type):</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#F1F5F9', padding: '0.25rem', borderRadius: '10px' }}>
              <button 
                type="button" 
                onClick={() => setTransferType('STAFF')}
                style={{ padding: '0.6rem', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', background: transferType === 'STAFF' ? '#FFFFFF' : 'transparent', color: transferType === 'STAFF' ? '#0F172A' : '#64748B', boxShadow: transferType === 'STAFF' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
              >
                👨‍💼 Kuhamisha Mfanyakazi & Wadhifa
              </button>
              <button 
                type="button" 
                onClick={() => setTransferType('BORROWER')}
                style={{ padding: '0.6rem', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', background: transferType === 'BORROWER' ? '#FFFFFF' : 'transparent', color: transferType === 'BORROWER' ? '#0F172A' : '#64748B', boxShadow: transferType === 'BORROWER' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
              >
                👥 Kuhamisha Mkopaji (na Mkopo wake)
              </button>
            </div>
          </div>

          {/* Mode 1: Staff Transfer */}
          {transferType === 'STAFF' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Chagua Mfanyakazi (Staff Member):</label>
                <select 
                  value={selectedStaffId} 
                  onChange={(e) => {
                    setSelectedStaffId(e.target.value);
                    const st = staffList.find(s => String(s.id) === String(e.target.value));
                    if (st) {
                      if (st.branch) setNewStaffBranchId(st.branch);
                      if (st.role) setNewStaffRole(st.role);
                    }
                  }}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}
                >
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name} (@{s.username} - {s.role_display})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Tawi Jipya (New Branch):</label>
                  <select 
                    value={newStaffBranchId} 
                    onChange={(e) => setNewStaffBranchId(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700' }}
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Wadhifa Jipya (New Staff Role):</label>
                  <select 
                    value={newStaffRole} 
                    onChange={(e) => setNewStaffRole(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#B8860B' }}
                  >
                    <option value="BRANCH_MANAGER">Meneja wa Tawi (Branch Manager)</option>
                    <option value="LOAN_OFFICER">Afisa Mkopo (Loan Officer)</option>
                    <option value="RISK_OFFICER">Afisa Risk & Auditing (Risk Officer)</option>
                    <option value="SUPER_ADMIN">IT / Super Admin (HQ)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Borrower Transfer (With Active Loan Support) */}
          {transferType === 'BORROWER' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Chagua Mkopaji Unayetaka Kumuhamisha:</label>
                <select 
                  value={selectedBorrowerId} 
                  onChange={(e) => setSelectedBorrowerId(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}
                >
                  {borrowers.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.first_name} {b.last_name} (NIDA: {b.id_number}) - Tawi: {b.branch_detail?.name || 'Tanzania'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBorrowerObj && (
                <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '0.85rem 1rem', borderRadius: '12px', fontSize: '0.8rem', color: '#334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span>Tawi la Sasa: <strong style={{ color: '#0F172A' }}>{currentBranchName}</strong></span>
                    <span>Anwani: <strong style={{ color: '#64748B' }}>{selectedBorrowerObj.address}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontWeight: '700', marginTop: '0.3rem' }}>
                    <FileText size={14} /> Taarifa ya Mkopo: Mkopaji huyu ana mikopo {activeLoansCount > 0 ? activeLoansCount : 'hai/ya zamani'}. Mikopo yote itahamishwa pia kwenda tawi jipya!
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>Tawi Jipya Analohamishiwa (Destination Branch):</label>
                <select 
                  value={newBorrowerBranchId} 
                  onChange={(e) => setNewBorrowerBranchId(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#0284C7' }}
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code}) - {b.location}</option>
                  ))}
                </select>
              </div>

              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.78rem', color: '#1E40AF', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <span>
                  <strong>Angalizo la Uhamisho:</strong> Hata kama mkopaji tayari ana mkopo hai (Active Loan) kutoka tawi la zamani, kumbu kumbu zote za marejesho, faili lake, na balance itahamishiwa kwenye tawi jipya kiotomatiki.
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.65rem 1.2rem' }}>
              Ghairi
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0.65rem 1.5rem', background: '#7C3AED' }}>
              <ArrowRightLeft size={16} /> {loading ? 'Inahamisha...' : 'Kamilisha Uhamisho'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

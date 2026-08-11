import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Wallet, Users, Car, HeartPulse, ShieldCheck, CreditCard, 
  FileText, Plus, Edit3, CheckCircle2, XCircle, Clock, X, Printer, Building2, PhoneCall
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/auth';

export default function PayrollManagerModal({ 
  staffList = [], 
  branches = [], 
  currentUser, 
  onClose, 
  onStaffUpdated 
}) {
  const [activeTab, setActiveTab] = useState('PAYROLL'); // 'PAYROLL' | 'FIELD_EXPENSES' | 'RATES'
  
  // Filter out any borrower accounts - strictly FKF Micro-Credit Staff members only
  const actualStaff = (staffList || []).filter(s => s.role !== 'BORROWER');
  
  // Field Expenses State
  const [fieldExpenses, setFieldExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  
  // Edit Payroll Sub-Modal State
  const [editingStaff, setEditingStaff] = useState(null);
  const [payrollForm, setPayrollForm] = useState({
    basic_salary: 0,
    transport_allowance: 0,
    housing_allowance: 0,
    field_allowance: 0,
    payment_method: 'MOBILE_MONEY',
    payment_provider: 'M-Pesa',
    payment_account_no: '',
    nssf_number: '',
    nhif_number: '',
    enable_nssf: true,
    enable_nhif: true,
  });
  const [savingPayroll, setSavingPayroll] = useState(false);

  // Payslip Preview Modal
  const [selectedPayslipStaff, setSelectedPayslipStaff] = useState(null);

  // New Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    staff: staffList.length > 0 ? staffList[0].id : '',
    branch: branches.length > 0 ? branches[0].id : 1,
    category: 'FIELD_TRANSPORT',
    title: '',
    amount: '',
    receipt_no: '',
  });
  const [submittingExpense, setSubmittingExpense] = useState(false);

  const fetchFieldExpenses = async () => {
    setExpensesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/field-expenses/`);
      const data = await res.json();
      setFieldExpenses(Array.isArray(data) ? data : (data?.results || []));
    } catch (err) {
      console.error(err);
    } finally {
      setExpensesLoading(false);
    }
  };

  useEffect(() => {
    fetchFieldExpenses();
  }, []);

  const handleOpenEditPayroll = (staff) => {
    setEditingStaff(staff);
    setPayrollForm({
      basic_salary: staff.basic_salary || 0,
      transport_allowance: staff.transport_allowance || 0,
      housing_allowance: staff.housing_allowance || 0,
      field_allowance: staff.field_allowance || 0,
      payment_method: staff.payment_method || 'MOBILE_MONEY',
      payment_provider: staff.payment_provider || 'M-Pesa',
      payment_account_no: staff.payment_account_no || staff.phone_number || '',
      nssf_number: staff.nssf_number || '',
      nhif_number: staff.nhif_number || '',
      enable_nssf: staff.enable_nssf !== undefined ? staff.enable_nssf : true,
      enable_nhif: staff.enable_nhif !== undefined ? staff.enable_nhif : true,
    });
  };

  const handleSavePayroll = async (e) => {
    e.preventDefault();
    if (!editingStaff) return;

    setSavingPayroll(true);
    try {
      const res = await fetch(`${API_BASE}/staff/${editingStaff.id}/payroll/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basic_salary: parseFloat(payrollForm.basic_salary || 0),
          transport_allowance: parseFloat(payrollForm.transport_allowance || 0),
          housing_allowance: parseFloat(payrollForm.housing_allowance || 0),
          field_allowance: parseFloat(payrollForm.field_allowance || 0),
          payment_method: payrollForm.payment_method,
          payment_provider: payrollForm.payment_provider,
          payment_account_no: payrollForm.payment_account_no,
          nssf_number: payrollForm.nssf_number,
          nhif_number: payrollForm.nhif_number,
          enable_nssf: payrollForm.enable_nssf,
          enable_nhif: payrollForm.enable_nhif,
        })
      });
      if (!res.ok) throw new Error('Imeshindwa kuhifadhi taarifa za payroll');
      setEditingStaff(null);
      if (onStaffUpdated) onStaffUpdated();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingPayroll(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.title.trim() || !expenseForm.amount) return;

    setSubmittingExpense(true);
    try {
      const res = await fetch(`${API_BASE}/field-expenses/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff: expenseForm.staff || (staffList[0]?.id || 1),
          branch: expenseForm.branch || (branches[0]?.id || 1),
          category: expenseForm.category,
          title: expenseForm.title,
          amount: parseFloat(expenseForm.amount),
          receipt_no: expenseForm.receipt_no,
        })
      });
      if (!res.ok) throw new Error('Imeshindwa kuhifadhi matumizi');
      setShowAddExpenseModal(false);
      setExpenseForm({ staff: staffList[0]?.id || '', branch: branches[0]?.id || 1, category: 'FIELD_TRANSPORT', title: '', amount: '', receipt_no: '' });
      fetchFieldExpenses();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleApproveExpense = async (expId) => {
    try {
      const res = await fetch(`${API_BASE}/field-expenses/${expId}/approve/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved_by: currentUser?.username || 'Super Admin' })
      });
      if (!res.ok) throw new Error('Imeshindwa kuidhinisha matumizi');
      fetchFieldExpenses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRejectExpense = async (expId) => {
    try {
      const res = await fetch(`${API_BASE}/field-expenses/${expId}/reject/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved_by: currentUser?.username || 'Super Admin' })
      });
      if (!res.ok) throw new Error('Imeshindwa kukataa matumizi');
      fetchFieldExpenses();
    } catch (err) {
      alert(err.message);
    }
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.82)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '1120px', maxHeight: '92vh', overflowY: 'auto', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ background: '#0F172A', color: '#FFFFFF', padding: '1.5rem 2rem', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#059669', color: '#FFFFFF', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                Usimamizi wa Mishahara & Matumizi ya Kiofisi (Payroll & Field Expenses)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#CBD5E1', margin: '0.2rem 0 0 0' }}>
                Mishahara, Posho, Makato ya NSSF & Bima ya Afya (NHIF), Matumizi ya Nje ya Ofisi na Payslips
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation Controls */}
        <div style={{ padding: '1rem 2rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setActiveTab('PAYROLL')}
              style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', background: activeTab === 'PAYROLL' ? '#0F172A' : '#FFFFFF', color: activeTab === 'PAYROLL' ? '#FFFFFF' : '#475569', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <DollarSign size={16} /> Mishahara & Statutory ({actualStaff.length})
            </button>
            <button 
              onClick={() => setActiveTab('FIELD_EXPENSES')}
              style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', background: activeTab === 'FIELD_EXPENSES' ? '#0F172A' : '#FFFFFF', color: activeTab === 'FIELD_EXPENSES' ? '#FFFFFF' : '#475569', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Car size={16} /> Matumizi ya Nje / Field Expenses ({fieldExpenses.length})
            </button>
            <button 
              onClick={() => setActiveTab('RATES')}
              style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', background: activeTab === 'RATES' ? '#0F172A' : '#FFFFFF', color: activeTab === 'RATES' ? '#FFFFFF' : '#475569', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <HeartPulse size={16} /> NSSF & NHIF Rules
            </button>
          </div>

          {activeTab === 'FIELD_EXPENSES' && (
            <button 
              onClick={() => setShowAddExpenseModal(true)}
              style={{ background: '#059669', color: '#FFFFFF', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={16} /> 🚗 Weka Matumizi ya Nje / Field Expense
            </button>
          )}
        </div>

        {/* Main Content Area */}
        <div style={{ padding: '1.75rem 2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* TAB 1: PAYROLL & STATUTORY DEDUCTIONS TABLE */}
          {activeTab === 'PAYROLL' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', background: '#FFFFFF' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid #CBD5E1', color: '#475569' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Mtumishi</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Basic Salary (TSH)</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Posho Total (TSH)</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Makato (NSSF 10% / NHIF 3%)</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Net Salary (TSH)</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Kipokeleo Cha Mshahara</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Vitendo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actualStaff.length > 0 ? (
                      actualStaff.map(s => {
                        const basic = floatVal(s.basic_salary);
                        const poshoSum = floatVal(s.transport_allowance) + floatVal(s.housing_allowance) + floatVal(s.field_allowance);
                        const nssf = s.enable_nssf ? basic * 0.10 : 0;
                        const nhif = s.enable_nhif ? basic * 0.03 : 0;
                        const totalDeductions = nssf + nhif;
                        const netPayable = (basic + poshoSum) - totalDeductions;

                        return (
                          <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <strong style={{ display: 'block', color: '#0F172A' }}>{s.first_name || s.username} {s.last_name || ''}</strong>
                              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{s.role_display} | ID: {s.employee_id || `#${s.id}`}</span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#0F172A' }}>
                              TSH {basic.toLocaleString()}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: '#059669', fontWeight: '700' }}>
                              TSH {poshoSum.toLocaleString()}
                              <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748B' }}>
                                (Usafiri: {s.transport_allowance || 0}, Field: {s.field_allowance || 0})
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: '#DC2626', fontSize: '0.78rem' }}>
                              <div>NSSF (10%): TSH {nssf.toLocaleString()} {s.nssf_number ? `(#${s.nssf_number})` : ''}</div>
                              <div>NHIF (3%): TSH {nhif.toLocaleString()} {s.nhif_number ? `(#${s.nhif_number})` : ''}</div>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: '900', color: '#0284C7', fontSize: '0.95rem' }}>
                              TSH {netPayable.toLocaleString()}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem' }}>
                              <span style={{ fontWeight: '800', color: '#0F172A', display: 'block' }}>
                                {s.payment_provider || 'M-Pesa'} ({s.payment_method === 'BANK_ACCOUNT' ? 'Benki' : 'Simu'})
                              </span>
                              <span style={{ color: '#64748B' }}>Acc/Phone: {s.payment_account_no || s.phone_number || '-'}</span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                {isSuperAdmin && (
                                  <button 
                                    onClick={() => handleOpenEditPayroll(s)}
                                    style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#0F172A', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                  >
                                    <Edit3 size={12} /> Badili
                                  </button>
                                )}
                                <button 
                                  onClick={() => setSelectedPayslipStaff(s)}
                                  style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #6EE7B7', background: '#ECFDF5', color: '#047857', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                >
                                  <FileText size={12} /> Payslip
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#94A3B8' }}>
                          Hakuna wafanyakazi waliosajiliwa bado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: FIELD & OUT-OF-OFFICE EXPENSES TABLE */}
          {activeTab === 'FIELD_EXPENSES' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', background: '#FFFFFF' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid #CBD5E1', color: '#475569' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Mtumishi & Tawi</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Aina ya Matumizi</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Maelezo ya Kazi</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Kiasi (TSH)</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Hali (Status)</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Vitendo (Super Admin)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldExpenses.length > 0 ? (
                      fieldExpenses.map(e => (
                        <tr key={e.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <strong style={{ display: 'block', color: '#0F172A' }}>{e.staff_name || e.staff_username}</strong>
                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Tawi: {e.branch_name}</span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#334155' }}>
                            {e.category_display || e.category}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                            {e.title}
                            {e.receipt_no && <span style={{ display: 'block', fontSize: '0.7rem', color: '#94A3B8' }}>Risiti: #{e.receipt_no}</span>}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: '900', color: '#059669', fontSize: '0.9rem' }}>
                            TSH {parseFloat(e.amount || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '12px', background: e.status === 'APPROVED' ? '#ECFDF5' : (e.status === 'REJECTED' ? '#FEF2F2' : '#FFFBEB'), color: e.status === 'APPROVED' ? '#047857' : (e.status === 'REJECTED' ? '#DC2626' : '#B8860B'), border: `1px solid ${e.status === 'APPROVED' ? '#A7F3D0' : (e.status === 'REJECTED' ? '#FCA5A5' : '#FDE68A')}` }}>
                              {e.status === 'APPROVED' ? '✓ Imeidhinishwa & Kulipwa' : (e.status === 'REJECTED' ? '✕ Imekataliwa' : '⏳ Inasubiri Idhini')}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {isSuperAdmin && e.status === 'PENDING' ? (
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <button 
                                  onClick={() => handleApproveExpense(e.id)}
                                  style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: 'none', background: '#059669', color: '#FFFFFF', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}
                                >
                                  Idhinisha & Lipa
                                </button>
                                <button 
                                  onClick={() => handleRejectExpense(e.id)}
                                  style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}
                                >
                                  Katakata
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{e.approved_by || '-'}</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#94A3B8' }}>
                          Hakuna matumizi ya field yaliyowekwa bado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TANZANIA STATUTORY RULES (NSSF & NHIF) */}
          {activeTab === 'RATES' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#0F172A' }}>
                  <ShieldCheck size={20} color="#059669" />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '900', margin: 0 }}>NSSF (National Social Security Fund)</h4>
                </div>
                <p style={{ fontSize: '0.83rem', color: '#475569', lineHeight: '1.5' }}>
                  Sheria ya Hifadhi ya Jamii Tanzania:
                  <br />
                  • <strong>Makato ya Mtumishi:</strong> 10% ya Mshahara wa Msingi (Basic Salary).
                  <br />
                  • <strong>Mchango wa Mwajiri (FKF):</strong> 10% ya Mshahara wa Msingi.
                  <br />
                  • <strong>Jumla ya Mchango kwa NSSF:</strong> 20%.
                </p>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#0F172A' }}>
                  <HeartPulse size={20} color="#DC2626" />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '900', margin: 0 }}>Bima ya Afya (NHIF / Health Insurance)</h4>
                </div>
                <p style={{ fontSize: '0.83rem', color: '#475569', lineHeight: '1.5' }}>
                  Bima ya Afya ya Wafanyakazi Tanzania:
                  <br />
                  • <strong>Makato ya Mtumishi:</strong> 3% ya Mshahara wa Msingi.
                  <br />
                  • <strong>Mchango wa Mwajiri (FKF):</strong> 3% ya Mshahara wa Msingi.
                  <br />
                  • <strong>Bima Inayoshughulikia:</strong> Matibabu ya hospitali kwa mtumishi na wategemezi wake.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* MODAL 1: EDIT STAFF PAYROLL FORM */}
        {editingStaff && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', border: '1px solid #CBD5E1', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  ✏️ Badili Payroll ya {editingStaff.first_name || editingStaff.username} ({editingStaff.role_display})
                </h4>
                <button onClick={() => setEditingStaff(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSavePayroll} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Basic Salary */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>Mshahara wa Msingi (Basic Salary TSH) *</label>
                  <input 
                    type="number" 
                    step="1000"
                    required
                    value={payrollForm.basic_salary}
                    onChange={(e) => setPayrollForm({ ...payrollForm, basic_salary: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', fontWeight: '800' }}
                  />
                </div>

                {/* Posho Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '0.2rem' }}>Posho ya Usafiri (TSH)</label>
                    <input 
                      type="number" 
                      value={payrollForm.transport_allowance}
                      onChange={(e) => setPayrollForm({ ...payrollForm, transport_allowance: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '0.2rem' }}>Posho ya Nyumba (TSH)</label>
                    <input 
                      type="number" 
                      value={payrollForm.housing_allowance}
                      onChange={(e) => setPayrollForm({ ...payrollForm, housing_allowance: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '0.2rem' }}>Posho ya Field (TSH)</label>
                    <input 
                      type="number" 
                      value={payrollForm.field_allowance}
                      onChange={(e) => setPayrollForm({ ...payrollForm, field_allowance: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                {/* Payment Method & Provider */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.2rem' }}>Kipokeleo cha Mshahara</label>
                    <select 
                      value={payrollForm.payment_method}
                      onChange={(e) => setPayrollForm({ ...payrollForm, payment_method: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '700' }}
                    >
                      <option value="MOBILE_MONEY">Mitandao ya Simu (Mobile Money)</option>
                      <option value="BANK_ACCOUNT">Akaunti ya Benki (Bank Transfer)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.2rem' }}>Jina la Benki / Mtandao</label>
                    <input 
                      type="text"
                      placeholder="Mfano: M-Pesa, NMB, CRDB, Tigo Pesa..."
                      value={payrollForm.payment_provider}
                      onChange={(e) => setPayrollForm({ ...payrollForm, payment_provider: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.2rem' }}>Namba ya Akaunti / Simu ya Kupokelea Mshahara</label>
                  <input 
                    type="text"
                    placeholder="Mfano: 0790980123 au 20110034892"
                    value={payrollForm.payment_account_no}
                    onChange={(e) => setPayrollForm({ ...payrollForm, payment_account_no: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                {/* Statutory Numbers (NSSF & NHIF) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '0.2rem' }}>Namba ya NSSF</label>
                    <input 
                      type="text"
                      placeholder="Namba ya NSSF"
                      value={payrollForm.nssf_number}
                      onChange={(e) => setPayrollForm({ ...payrollForm, nssf_number: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '0.2rem' }}>Namba ya Bima ya Afya (NHIF)</label>
                    <input 
                      type="text"
                      placeholder="Namba ya NHIF"
                      value={payrollForm.nhif_number}
                      onChange={(e) => setPayrollForm({ ...payrollForm, nhif_number: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={payrollForm.enable_nssf}
                      onChange={(e) => setPayrollForm({ ...payrollForm, enable_nssf: e.target.checked })}
                    />
                    Kukata NSSF (10%)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={payrollForm.enable_nhif}
                      onChange={(e) => setPayrollForm({ ...payrollForm, enable_nhif: e.target.checked })}
                    />
                    Kukata Bima ya Afya (3%)
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setEditingStaff(null)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F1F5F9', fontSize: '0.8rem' }}>
                    Ghairi
                  </button>
                  <button type="submit" disabled={savingPayroll} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: '#059669', color: '#FFFFFF', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                    {savingPayroll ? 'Inahifadhi...' : 'Hifadhi Payroll'}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* MODAL 2: ADD FIELD EXPENSE FORM */}
        {showAddExpenseModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '520px', padding: '1.5rem', border: '1px solid #CBD5E1', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  🚗 Weka Matumizi ya Nje ya Ofisi / Field Expense
                </h4>
                <button onClick={() => setShowAddExpenseModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.2rem' }}>Mtumishi *</label>
                    <select 
                      value={expenseForm.staff} 
                      onChange={(e) => setExpenseForm({ ...expenseForm, staff: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                    >
                      {actualStaff.map(s => (
                        <option key={s.id} value={s.id}>{s.first_name || s.username} {s.last_name || ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.2rem' }}>Tawi *</label>
                    <select 
                      value={expenseForm.branch} 
                      onChange={(e) => setExpenseForm({ ...expenseForm, branch: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.2rem' }}>Aina ya Matumizi *</label>
                  <select 
                    value={expenseForm.category} 
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '700' }}
                  >
                    <option value="FIELD_TRANSPORT">Usafiri wa Field / Nauli</option>
                    <option value="FUEL">Mafuta ya Pikipiki / Gari</option>
                    <option value="LODGING">Lodging / Malazi</option>
                    <option value="MEALS">Chakula Nje ya Ofisi</option>
                    <option value="OFFICE_STATIONERY">Vifaa vya Ofisi / Printing</option>
                    <option value="CLIENT_MEETING">Mkutano wa Wateja / Kikundi</option>
                    <option value="OTHER">Matumizi Mengineyo</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.2rem' }}>Maelezo ya Matumizi *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Mfano: Nauli ya kwenda kukagua dhamana tawi la Tegeta..."
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.2rem' }}>Kiasi cha Fedha (TSH) *</label>
                    <input 
                      type="number" 
                      required
                      placeholder="Mfano: 35000"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '800', color: '#059669' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.2rem' }}>Namba ya Risiti (Hiari)</label>
                    <input 
                      type="text" 
                      placeholder="Mfano: REC-9082"
                      value={expenseForm.receipt_no}
                      onChange={(e) => setExpenseForm({ ...expenseForm, receipt_no: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowAddExpenseModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F1F5F9', fontSize: '0.8rem' }}>
                    Ghairi
                  </button>
                  <button type="submit" disabled={submittingExpense} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: '#059669', color: '#FFFFFF', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                    {submittingExpense ? 'Inahifadhi...' : 'Weka Matumizi'}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* MODAL 3: PAYSLIP PREVIEW MODAL */}
        {selectedPayslipStaff && (
          <PayslipModal staff={selectedPayslipStaff} onClose={() => setSelectedPayslipStaff(null)} />
        )}

      </div>
    </div>
  );
}

// Clean Printable Payslip Component for Tanzania
function PayslipModal({ staff, onClose }) {
  const basic = floatVal(staff.basic_salary);
  const poshoSum = floatVal(staff.transport_allowance) + floatVal(staff.housing_allowance) + floatVal(staff.field_allowance);
  const gross = basic + poshoSum;
  const nssf = staff.enable_nssf ? basic * 0.10 : 0;
  const nhif = staff.enable_nhif ? basic * 0.03 : 0;
  const totalDeductions = nssf + nhif;
  const netPayable = gross - totalDeductions;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '650px', padding: '2rem', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        
        {/* Company Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #0F172A', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <h2 style={{ color: '#0F172A', fontSize: '1.4rem', fontWeight: '900', margin: 0 }}>FKF MICRO-CREDIT SYSTEM</h2>
          <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0.2rem 0' }}>
            21Msamaria street / Msakuzi Road, P.O Box 9030 DSM, Tanzania
          </p>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', background: '#F1F5F9', padding: '0.25rem 0.75rem', borderRadius: '12px', color: '#0F172A' }}>
            SLIP YA MSHAHARA (EMPLOYEE PAYSLIP)
          </span>
        </div>

        {/* Employee Info Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
          <div><strong>Jina la Mtumishi:</strong> {staff.first_name || staff.username} {staff.last_name || ''}</div>
          <div><strong>Wadhifa (Role):</strong> {staff.role_display}</div>
          <div><strong>Namba ya Mtumishi:</strong> {staff.employee_id || `#${staff.id}`}</div>
          <div><strong>Tawi:</strong> {staff.branch_detail?.name || 'Dar es Salaam HQ'}</div>
          <div><strong>Namba ya NSSF:</strong> {staff.nssf_number || 'N/A'}</div>
          <div><strong>Namba ya NHIF:</strong> {staff.nhif_number || 'N/A'}</div>
        </div>

        {/* Earnings & Deductions Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
          
          {/* EARNINGS */}
          <div style={{ border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '10px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#059669', borderBottom: '1px solid #A7F3D0', paddingBottom: '0.3rem' }}>
              VIPENGELE VYA MAPATO (EARNINGS)
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span>Mshahara wa Msingi:</span>
              <strong>TSH {basic.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span>Posho ya Usafiri:</span>
              <span>TSH {floatVal(staff.transport_allowance).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span>Posho ya Nyumba/Chakula:</span>
              <span>TSH {floatVal(staff.housing_allowance).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span>Posho ya Field:</span>
              <span>TSH {floatVal(staff.field_allowance).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', paddingTop: '0.4rem', marginTop: '0.4rem', fontWeight: '800' }}>
              <span>Jumla ya Pato (Gross):</span>
              <strong style={{ color: '#059669' }}>TSH {gross.toLocaleString()}</strong>
            </div>
          </div>

          {/* DEDUCTIONS */}
          <div style={{ border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '10px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#DC2626', borderBottom: '1px solid #FCA5A5', paddingBottom: '0.3rem' }}>
              MAKATO YA STATUTORI (DEDUCTIONS)
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span>NSSF (10%):</span>
              <span>TSH {nssf.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span>NHIF Bima ya Afya (3%):</span>
              <span>TSH {nhif.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', paddingTop: '0.4rem', marginTop: '0.4rem', fontWeight: '800' }}>
              <span>Jumla ya Makato:</span>
              <strong style={{ color: '#DC2626' }}>TSH {totalDeductions.toLocaleString()}</strong>
            </div>
          </div>

        </div>

        {/* Net Salary Highlight */}
        <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#047857', fontWeight: '800' }}>MSHAHARA WA WAVU (NET PAYABLE):</span>
            <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#047857' }}>
              TSH {netPayable.toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#334155' }}>
            <strong>Njia ya Malipo:</strong> {staff.payment_provider || 'M-Pesa'}
            <br />
            <span>Acc/Phone: {staff.payment_account_no || staff.phone_number || '-'}</span>
          </div>
        </div>

        {/* Actions: Print & Close */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button onClick={() => window.print()} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Printer size={14} /> Chapa Payslip (Print)
          </button>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: '#0F172A', color: '#FFFFFF', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>
            Funga
          </button>
        </div>

      </div>
    </div>
  );
}

function floatVal(val) {
  const f = parseFloat(val);
  return isNaN(f) ? 0 : f;
}

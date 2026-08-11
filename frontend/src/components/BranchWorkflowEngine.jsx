import React, { useState } from 'react';
import { 
  Users, FileText, CheckCircle2, DollarSign, Wallet, ShieldAlert, ShieldCheck, 
  Plus, Search, RefreshCw, UserPlus, Upload, Image as ImageIcon, Eye, Printer, 
  ArrowUpRight, AlertTriangle, Check, Clock, UserCheck, Edit3, X, Sparkles,
  FileCheck, Award, Ban, Moon, UserX, Folder, Bell, Calculator, MessageSquare, Package,
  Receipt, RotateCcw, Gift, HelpCircle, Layers, Calendar, Trash2, MapPin
} from 'lucide-react';
import LoanApplicationModal from './LoanApplicationModal';
import BorrowerRegistrationModal from './BorrowerRegistrationModal';
import BorrowerFullViewModal from './BorrowerFullViewModal';
import LoanFullViewModal from './LoanFullViewModal';
import RepaymentFullViewModal from './RepaymentFullViewModal';
import BulkRepaymentModal from './BulkRepaymentModal';
import DisburseLoanModal from './DisburseLoanModal';
import EditLoanModal from './EditLoanModal';
import RenewLoanModal from './RenewLoanModal';
import EditBorrowerModal from './EditBorrowerModal';
import FieldVerificationEvidenceModal from './FieldVerificationEvidenceModal';

export default function BranchWorkflowEngine({
  currentUser,
  branches,
  borrowers,
  loans,
  loanProducts = [],
  onRefresh,
  onCreateBorrower,
  onUpdateBorrower,
  onDeleteBorrower,
  onCreateLoan,
  onEditLoan,
  onDeleteLoan,
  onRenewLoan,
  onApproveLoan,
  onBranchApproveLoan,
  onBranchRejectLoan,
  onRiskPassLoan,
  onRiskFailLoan,
  onDisburseLoan,
  onRecordRepayment,
  onFlagDefault,
  onVerifyKyc
}) {
  const [subTab, setSubTab] = useState('BORROWERS');
  const [selectedBranchId, setSelectedBranchId] = useState(
    currentUser?.role === 'SUPER_ADMIN' ? 'all' : (currentUser?.branch || '')
  );

  // Sub-filter tabs inside BORROWERS section:
  const [borrowerSubFilter, setBorrowerSubFilter] = useState('ALL');

  // Sub-filter tabs inside LOANS section (12 items):
  const [loanSubFilter, setLoanSubFilter] = useState('ALL');

  // Sub-filter tabs inside REPAYMENTS section (11 items):
  const [repaymentSubFilter, setRepaymentSubFilter] = useState('ALL');

  // Selected Borrower, Loan & Repayment for Full View Modals
  const [fullViewBorrower, setFullViewBorrower] = useState(null);
  const [fullViewBorrowerTab, setFullViewBorrowerTab] = useState('DETAILS');

  const [fullViewLoan, setFullViewLoan] = useState(null);
  const [fullViewLoanTab, setFullViewLoanTab] = useState('DETAILS');

  const [fullViewRepayment, setFullViewRepayment] = useState(null);
  const [fullViewRepaymentLoan, setFullViewRepaymentLoan] = useState(null);
  const [fullViewRepaymentTab, setFullViewRepaymentTab] = useState('RECEIPT');

  // Show Loan Products Modal & Bulk Repayments Modal states
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showBulkRepaymentsModal, setShowBulkRepaymentsModal] = useState(false);
  const [disburseLoanTarget, setDisburseLoanTarget] = useState(null);
  const [editLoanTarget, setEditLoanTarget] = useState(null);
  const [renewLoanTarget, setRenewLoanTarget] = useState(null);
  const [editBorrowerTarget, setEditBorrowerTarget] = useState(null);
  const [fieldEvidenceTarget, setFieldEvidenceTarget] = useState(null);

  // Filter loans and borrowers by branch & Loan Officer scope safely
  const currentBranch = (selectedBranchId === 'all' || !selectedBranchId)
    ? { name: 'Matawi Yote (Makao Makuu)', code: 'HQ-ALL' }
    : (branches.find(b => String(b.id) === String(selectedBranchId)) || branches[0] || { name: 'Dar es Salaam HQ', code: 'BR-DAR-01' });
  const isOfficer = currentUser?.role === 'LOAN_OFFICER' || currentUser?.role === 'FIELD_OFFICER';

  const branchBorrowers = borrowers.filter(b => {
    // If logged in as Loan Officer / Field Officer, show ONLY borrowers registered by this officer!
    if (isOfficer) {
      if (b.created_by_officer_id && String(b.created_by_officer_id) !== String(currentUser?.id)) {
        return false;
      }
    }
    if (!selectedBranchId || selectedBranchId === 'all' || selectedBranchId === 'undefined' || selectedBranchId === 'null') return true;
    const bId = typeof b.branch === 'object' ? b.branch?.id : b.branch;
    return String(bId) === String(selectedBranchId) || (b.branch_detail && String(b.branch_detail.id) === String(selectedBranchId));
  });

  const branchLoans = loans.filter(l => {
    // If logged in as Loan Officer / Field Officer, show ONLY loans registered/created by this officer!
    if (isOfficer) {
      if (l.created_by_officer_id && String(l.created_by_officer_id) !== String(currentUser?.id)) {
        return false;
      }
    }
    if (!selectedBranchId || selectedBranchId === 'all' || selectedBranchId === 'undefined' || selectedBranchId === 'null') return true;
    const lId = typeof l.branch === 'object' ? l.branch?.id : l.branch;
    return String(lId) === String(selectedBranchId) || (l.branch_detail && String(l.branch_detail.id) === String(selectedBranchId));
  });

  // Filtered borrowers according to sub-filter bar
  const displayedBorrowers = branchBorrowers.filter(b => {
    const bLoans = branchLoans.filter(l => String(l.borrower) === String(b.id) || (l.borrower_detail && String(l.borrower_detail.id) === String(b.id)));
    const hasActiveLoan = bLoans.some(l => l.status === 'DISBURSED');
    const isDefaulted = bLoans.some(l => l.status === 'DEFAULTED');

    if (borrowerSubFilter === 'BLACKLISTED') return isDefaulted || b.kyc_status === 'REJECTED';
    if (borrowerSubFilter === 'INACTIVE') return !hasActiveLoan;
    if (borrowerSubFilter === 'GROUPS') return b.group_id && b.group_id.trim() !== '';
    return true;
  });

  // Filtered loans according to 12-item sub-filter bar
  const displayedLoans = branchLoans.filter(l => {
    if (loanSubFilter === 'APPLICATIONS') return l.status.includes('PENDING');
    if (loanSubFilter === 'ACTIVE') return l.status === 'DISBURSED';
    if (loanSubFilter === 'ARREARS') return l.status === 'DEFAULTED' || parseFloat(l.balance_remaining || 0) > parseFloat(l.total_payable || 0);
    if (loanSubFilter === 'MATURITY') return l.status === 'DEFAULTED';
    return true;
  });

  // Active Disbursed / Payable Loans
  const activeDisbursedLoans = branchLoans.filter(l => l.status === 'DISBURSED' || l.status === 'APPROVED' || l.status === 'PARTIALLY_PAID');
  const eligibleRepaymentLoans = activeDisbursedLoans.length > 0 ? activeDisbursedLoans : branchLoans;
  const noRepaymentLoans = branchLoans.filter(l => parseFloat(l.balance_remaining || 0) === parseFloat(l.total_payable || 0));

  const [showBorrowerModal, setShowBorrowerModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedLoanForRepayment, setSelectedLoanForRepayment] = useState(null);
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [repaymentChannel, setRepaymentChannel] = useState('CASH');

  const pendingApprovals = branchLoans.filter(l => 
    l.status === 'PENDING_BRANCH_APPROVAL' || l.status === 'PENDING_RISK_REVIEW'
  );

  const openBorrowerModal = (borrowerObj, tabName = 'DETAILS') => {
    setFullViewBorrower(borrowerObj);
    setFullViewBorrowerTab(tabName);
  };

  const openLoanModal = (loanObj, tabName = 'DETAILS') => {
    setFullViewLoan(loanObj);
    setFullViewLoanTab(tabName);
  };

  const openRepaymentModal = (repaymentObj, loanObj, tabName = 'RECEIPT') => {
    setFullViewRepayment(repaymentObj);
    setFullViewRepaymentLoan(loanObj);
    setFullViewRepaymentTab(tabName);
  };

  const handleRepaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLoanForRepayment || !repaymentAmount) return;
    await onRecordRepayment({
      loan: selectedLoanForRepayment.id,
      amount_paid: parseFloat(repaymentAmount),
      channel: repaymentChannel
    });
    setSelectedLoanForRepayment(null);
    setRepaymentAmount('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* HEADER BAR FOR WORKFLOW (DARK SLATE CARD FOR HIGH CONTRAST) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#1E293B', color: '#FFFFFF', padding: '1.25rem 1.75rem', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
            <Users color="#D4AF37" size={26} /> Usimamizi wa Wakopaji na Mikopo ya Tawi
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: '0.3rem 0 0 0' }}>
            Tawi la sasa: <strong style={{ color: '#D4AF37' }}>{currentBranch?.name || 'Tanzania'} ({currentBranch?.code})</strong>
          </p>
        </div>

        {currentUser?.role === 'SUPER_ADMIN' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#CBD5E1', fontWeight: '600' }}>Chagua Tawi:</span>
            <select 
              value={selectedBranchId} 
              onChange={(e) => setSelectedBranchId(e.target.value)}
              style={{ padding: '0.55rem 0.95rem', background: '#0F172A', border: '1px solid #475569', borderRadius: '10px', color: '#FFFFFF', fontSize: '0.88rem', fontWeight: '700' }}
            >
              <option value="all">Matawi Yote (Makao Makuu)</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TOP PILL NAVIGATION FOR WORKFLOW SUB-TABS */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', background: '#FFFFFF', padding: '0.85rem 1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <button 
          onClick={() => setSubTab('BORROWERS')}
          style={{ padding: '0.65rem 1.3rem', fontSize: '0.85rem', fontWeight: '800', borderRadius: '10px', cursor: 'pointer', border: subTab === 'BORROWERS' ? 'none' : '1px solid #CBD5E1', background: subTab === 'BORROWERS' ? '#1E293B' : '#F8FAFC', color: subTab === 'BORROWERS' ? '#FFFFFF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Users size={16} /> Wakopaji (Borrowers) ({branchBorrowers.length})
        </button>

        <button 
          onClick={() => setSubTab('APPLICATIONS')}
          style={{ padding: '0.65rem 1.3rem', fontSize: '0.85rem', fontWeight: '800', borderRadius: '10px', cursor: 'pointer', border: subTab === 'APPLICATIONS' ? 'none' : '1px solid #CBD5E1', background: subTab === 'APPLICATIONS' ? '#1E293B' : '#F8FAFC', color: subTab === 'APPLICATIONS' ? '#FFFFFF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <FileText size={16} /> Mikopo (LOANS Suite) ({branchLoans.length})
        </button>

        <button 
          onClick={() => setSubTab('APPROVALS')}
          style={{ padding: '0.65rem 1.3rem', fontSize: '0.85rem', fontWeight: '800', borderRadius: '10px', cursor: 'pointer', border: subTab === 'APPROVALS' ? 'none' : '1px solid #CBD5E1', background: subTab === 'APPROVALS' ? '#1E293B' : '#F8FAFC', color: subTab === 'APPROVALS' ? '#FFFFFF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <UserCheck size={16} /> Uidhinishaji ({pendingApprovals.length})
        </button>

        <button 
          onClick={() => setSubTab('REPAYMENTS')}
          style={{ padding: '0.65rem 1.3rem', fontSize: '0.85rem', fontWeight: '800', borderRadius: '10px', cursor: 'pointer', border: subTab === 'REPAYMENTS' ? 'none' : '1px solid #CBD5E1', background: subTab === 'REPAYMENTS' ? '#1E293B' : '#F8FAFC', color: subTab === 'REPAYMENTS' ? '#FFFFFF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Wallet size={16} /> Marejesho (REPAYMENT Suite)
        </button>
      </div>

      {/* 1. BORROWERS TAB */}
      {subTab === 'BORROWERS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#0F172A', fontWeight: '900', margin: 0 }}>Taarifa za Wakopaji (BORROWERS MANAGEMENT)</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>View Borrower, Add Borrower, Statements, Blacklisted, Inactive, Guarantors, Documents & Reports</p>
            </div>
            <button onClick={() => setShowBorrowerModal(true)} className="btn-primary" style={{ padding: '0.7rem 1.3rem', fontSize: '0.88rem' }}>
              <UserPlus size={16} /> + Add Borrower (Msajili Mkopaji Mpya)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', background: '#FFFFFF', padding: '0.85rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <button onClick={() => setBorrowerSubFilter('ALL')} style={{ padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', background: borrowerSubFilter === 'ALL' ? '#0284C7' : '#F8FAFC', color: borrowerSubFilter === 'ALL' ? '#FFFFFF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Eye size={14} /> View Borrower ({branchBorrowers.length})
            </button>
            <button onClick={() => setShowBorrowerModal(true)} style={{ padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid #059669', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', background: '#059669', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Plus size={14} /> Add Borrower
            </button>
            <button onClick={() => setBorrowerSubFilter('GROUPS')} style={{ padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', background: borrowerSubFilter === 'GROUPS' ? '#7C3AED' : '#F8FAFC', color: borrowerSubFilter === 'GROUPS' ? '#FFFFFF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Users size={14} /> Borrower Group
            </button>
            <button onClick={() => { if (branchBorrowers.length > 0) openBorrowerModal(branchBorrowers[0], 'STATEMENT'); }} style={{ padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid #B8860B', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', background: '#B8860B', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FileText size={14} /> Borrower Statements
            </button>
            <button onClick={() => setBorrowerSubFilter('BLACKLISTED')} style={{ padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid #FECDD3', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', background: borrowerSubFilter === 'BLACKLISTED' ? '#E11D48' : '#FEF2F2', color: borrowerSubFilter === 'BLACKLISTED' ? '#FFFFFF' : '#DC2626', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Ban size={14} /> Blacklisted Borrowers
            </button>
            <button onClick={() => setBorrowerSubFilter('INACTIVE')} style={{ padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', background: borrowerSubFilter === 'INACTIVE' ? '#475569' : '#F8FAFC', color: borrowerSubFilter === 'INACTIVE' ? '#FFFFFF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Moon size={14} /> Inactive Borrowers
            </button>
            <button onClick={() => { if (branchBorrowers.length > 0) openBorrowerModal(branchBorrowers[0], 'GUARANTORS'); }} style={{ padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', background: '#F8FAFC', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Users size={14} /> Guarantors
            </button>
            <button onClick={() => { if (branchBorrowers.length > 0) openBorrowerModal(branchBorrowers[0], 'DOCUMENTS'); }} style={{ padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', background: '#F8FAFC', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Folder size={14} /> Document
            </button>
            <button onClick={() => { if (branchBorrowers.length > 0) openBorrowerModal(branchBorrowers[0], 'REPORT'); }} style={{ padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', background: '#F8FAFC', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Award size={14} /> Report
            </button>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', overflowX: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Passport</th>
                  <th>Jina Kamili</th>
                  <th>NIDA ID</th>
                  <th>Group ID</th>
                  <th>Simu & Email</th>
                  <th>Anwani / Location</th>
                  <th>Pato (TSH)</th>
                  <th>Uhakiki KYC</th>
                  <th>Vitendo na Taarifa (Actions)</th>
                </tr>
              </thead>
              <tbody>
                {displayedBorrowers.map(b => (
                  <tr key={b.id}>
                    <td>
                      {b.photo_url ? (
                        <img src={b.photo_url} alt={`${b.first_name}`} style={{ width: '48px', height: '54px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #D4AF37' }} />
                      ) : (
                        <div style={{ width: '48px', height: '54px', borderRadius: '6px', background: '#F1F5F9', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.7rem' }}>No Photo</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: '800', color: '#0F172A' }}>{b.first_name} {b.last_name}</div>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{b.occupation || b.employment_status}</span>
                    </td>
                    <td style={{ color: '#B8860B', fontWeight: '800' }}>{b.id_number}</td>
                    <td>
                      <span style={{ background: '#F3E8FF', color: '#7C3AED', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #D8B4FE' }}>
                        {b.group_id || 'Binafsi'}
                      </span>
                    </td>
                    <td>
                      <div style={{ color: '#0F172A', fontWeight: '700' }}>{b.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{b.email || 'Hakuna email'}</div>
                    </td>
                    <td style={{ color: '#334155', minWidth: '220px' }}>
                      <div style={{ fontWeight: '500' }}>{b.address || 'Nyanjani'}</div>
                      <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.35rem', borderRadius: '4px', background: b.field_gps_location ? '#ECFDF5' : '#F1F5F9', color: b.field_gps_location ? '#047857' : '#94A3B8', border: `1px solid ${b.field_gps_location ? '#A7F3D0' : '#E2E8F0'}`, fontWeight: '700' }} title={b.field_gps_location || 'GPS haijachukuliwa'}>
                          📍 GPS
                        </span>
                        <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.35rem', borderRadius: '4px', background: b.residence_photo_url ? '#ECFDF5' : '#F1F5F9', color: b.residence_photo_url ? '#047857' : '#94A3B8', border: `1px solid ${b.residence_photo_url ? '#A7F3D0' : '#E2E8F0'}`, fontWeight: '700' }}>
                          🏠 Residence
                        </span>
                        <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.35rem', borderRadius: '4px', background: b.business_photo_url ? '#ECFDF5' : '#F1F5F9', color: b.business_photo_url ? '#047857' : '#94A3B8', border: `1px solid ${b.business_photo_url ? '#A7F3D0' : '#E2E8F0'}`, fontWeight: '700' }}>
                          🛍️ Business
                        </span>
                        <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.35rem', borderRadius: '4px', background: b.workplace_stand_photo_url ? '#ECFDF5' : '#F1F5F9', color: b.workplace_stand_photo_url ? '#047857' : '#94A3B8', border: `1px solid ${b.workplace_stand_photo_url ? '#A7F3D0' : '#E2E8F0'}`, fontWeight: '700' }}>
                          🚚 Stand
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight: '800', color: '#059669' }}>TSH {parseFloat(b.monthly_income || 500000).toLocaleString()}</td>
                    <td>
                      <button onClick={() => onVerifyKyc ? onVerifyKyc(b) : null} style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', border: 'none', cursor: 'pointer', background: b.kyc_status === 'VERIFIED' ? '#ECFDF5' : '#FEF2F2', color: b.kyc_status === 'VERIFIED' ? '#047857' : '#DC2626', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ShieldCheck size={12} /> {b.kyc_status === 'VERIFIED' ? 'Verified (NIDA)' : 'Haja-hakikiwa'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <button onClick={() => openBorrowerModal(b, 'DETAILS')} className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: '#0284C7', color: '#FFFFFF', border: 'none' }} title="View Borrower Details">
                          <Eye size={13} /> View
                        </button>
                        <button onClick={() => openBorrowerModal(b, 'STATEMENT')} className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: '#B8860B', color: '#FFFFFF', border: 'none' }} title="Borrower Statement">
                          <FileText size={13} /> Statement
                        </button>
                        <button onClick={() => openBorrowerModal(b, 'DOCUMENTS')} className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: '#F1F5F9', color: '#1E293B', border: '1px solid #CBD5E1' }} title="Document Vault">
                          <Folder size={13} /> Nyaraka
                        </button>
                        <button onClick={() => setFieldEvidenceTarget(b)} className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: '#ECFDF5', color: '#047857', border: '1px solid #6EE7B7', fontWeight: '800' }} title="FIELD GPS & Picha za Anapokaa/Biashara/Stendi">
                          <MapPin size={13} /> 📍 Nyanjani & GPS
                        </button>
                        <button onClick={() => setShowLoanModal(true)} className="btn-primary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}>
                          Omba Mkopo
                        </button>
                        {currentUser?.role === 'SUPER_ADMIN' && (
                          <>
                            <button onClick={() => setEditBorrowerTarget(b)} className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: '#FEF3C7', color: '#B8860B', border: '1px solid #FCD34D' }} title="Edit Borrower (Super Admin)">
                              <Edit3 size={13} /> Edit
                            </button>
                            <button onClick={() => onDeleteBorrower && onDeleteBorrower(b.id)} className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5' }} title="Delete Borrower (Super Admin)">
                              <Trash2 size={13} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. LOANS TAB */}
      {subTab === 'APPLICATIONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#0F172A', fontWeight: '900', margin: 0 }}>Usimamizi wa Mikopo (LOANS MANAGEMENT SUITE)</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>View Loans, Loan Applications, Products, Approve, Contract, Reminder, Active, Arrears, Maturity, Comments, Report & Calculator</p>
            </div>
            <button onClick={() => setShowLoanModal(true)} className="btn-primary" style={{ padding: '0.7rem 1.3rem', fontSize: '0.88rem' }}>
              <Plus size={16} /> + Ombi Jipya la Mkopo (Loan Application)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', background: '#FFFFFF', padding: '0.85rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <button onClick={() => setLoanSubFilter('ALL')} style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: loanSubFilter === 'ALL' ? '#0284C7' : '#F8FAFC', color: loanSubFilter === 'ALL' ? '#FFFFFF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Eye size={13} /> View Loans ({branchLoans.length})
            </button>
            <button onClick={() => setLoanSubFilter('APPLICATIONS')} style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: loanSubFilter === 'APPLICATIONS' ? '#0284C7' : '#F8FAFC', color: loanSubFilter === 'APPLICATIONS' ? '#FFFFFF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <FileText size={13} /> Loan Applications ({pendingApprovals.length})
            </button>
            <button onClick={() => setShowProductsModal(true)} style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #0284C7', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: '#0284C7', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Package size={13} /> Loan Products
            </button>
            <button onClick={() => setSubTab('APPROVALS')} style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #B8860B', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: '#B8860B', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} /> Approve Loans
            </button>
            <button onClick={() => { if (branchLoans.length > 0) openLoanModal(branchLoans[0], 'CONTRACT'); }} style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: '#F8FAFC', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <FileCheck size={13} /> Loan Contract
            </button>
            <button onClick={() => { if (branchLoans.length > 0) openLoanModal(branchLoans[0], 'REMINDER'); }} style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #059669', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: '#059669', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Bell size={13} /> Loan Reminder
            </button>
            <button onClick={() => setLoanSubFilter('ACTIVE')} style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: loanSubFilter === 'ACTIVE' ? '#059669' : '#F8FAFC', color: loanSubFilter === 'ACTIVE' ? '#FFFFFF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Sparkles size={13} /> Active Loans ({activeDisbursedLoans.length})
            </button>
            <button onClick={() => setLoanSubFilter('ARREARS')} style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #FECDD3', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: loanSubFilter === 'ARREARS' ? '#DC2626' : '#FEF2F2', color: loanSubFilter === 'ARREARS' ? '#FFFFFF' : '#DC2626', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <AlertTriangle size={13} /> Loans in Arrears
            </button>
            <button onClick={() => setLoanSubFilter('MATURITY')} style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: loanSubFilter === 'MATURITY' ? '#D97706' : '#F8FAFC', color: loanSubFilter === 'MATURITY' ? '#FFFFFF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={13} /> Past Maturity Date
            </button>
            <button onClick={() => { if (branchLoans.length > 0) openLoanModal(branchLoans[0], 'COMMENTS'); }} style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: '#F8FAFC', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <MessageSquare size={13} /> Loan Comments
            </button>
            <button onClick={() => { if (branchLoans.length > 0) openLoanModal(branchLoans[0], 'DETAILS'); }} style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: '#F8FAFC', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Award size={13} /> Loan Report
            </button>
            <button onClick={() => { if (branchLoans.length > 0) openLoanModal(branchLoans[0], 'CALCULATOR'); }} style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #D4AF37', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: '#D4AF37', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calculator size={13} /> Loan Calculator
            </button>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', overflowX: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Passport</th>
                  <th>Namba ya Mkopo</th>
                  <th>Mkopaji</th>
                  <th>Kiasi cha Mkopo (TSH)</th>
                  <th>Riba (%)</th>
                  <th>Muda</th>
                  <th>Jumla ya Kurudisha</th>
                  <th>Baki (Balance)</th>
                  <th>Hali</th>
                  <th>Vitendo na Mkataba (Actions)</th>
                </tr>
              </thead>
              <tbody>
                {displayedLoans.map(l => (
                  <tr key={l.id}>
                    <td>
                      {l.borrower_detail?.photo_url ? (
                        <img src={l.borrower_detail.photo_url} alt="Passport" style={{ width: '40px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #D4AF37' }} />
                      ) : (
                        <div style={{ width: '40px', height: '45px', borderRadius: '6px', background: '#F1F5F9', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.7rem' }}>No Photo</div>
                      )}
                    </td>
                    <td style={{ color: '#B8860B', fontWeight: '800' }}>LN-TZ-{l.id}</td>
                    <td>
                      <div style={{ fontWeight: '800', color: '#0F172A' }}>{l.borrower_detail ? `${l.borrower_detail.first_name} ${l.borrower_detail.last_name}` : `Mkopaji #${l.borrower}`}</div>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{l.borrower_detail?.phone}</span>
                    </td>
                    <td style={{ fontWeight: '800', color: '#059669' }}>TSH {parseFloat(l.principal_amount).toLocaleString()}</td>
                    <td style={{ color: '#334155' }}>{l.interest_rate_pct}%</td>
                    <td style={{ color: '#334155' }}>{l.tenure_months} Miezi</td>
                    <td style={{ fontWeight: '800', color: '#0F172A' }}>TSH {parseFloat(l.total_payable).toLocaleString()}</td>
                    <td style={{ fontWeight: '800', color: '#DC2626' }}>TSH {parseFloat(l.balance_remaining).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${l.status === 'DISBURSED' ? 'badge-success' : l.status.includes('PENDING') ? 'badge-warning' : 'badge-danger'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <button onClick={() => openLoanModal(l, 'DETAILS')} className="btn-secondary" style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem', background: '#0284C7', color: '#FFFFFF', border: 'none' }} title="View Loan Details">
                          <Eye size={12} /> View
                        </button>
                        <button onClick={() => openLoanModal(l, 'CONTRACT')} className="btn-secondary" style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem', background: '#F1F5F9', color: '#1E293B', border: '1px solid #CBD5E1' }} title="Print Loan Contract">
                          <FileCheck size={12} /> Mkataba
                        </button>
                        <button onClick={() => openLoanModal(l, 'REMINDER')} className="btn-secondary" style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem', background: '#059669', color: '#FFFFFF', border: 'none' }} title="Send SMS Reminder">
                          <Bell size={12} /> SMS
                        </button>
                        <button onClick={() => openLoanModal(l, 'CALCULATOR')} className="btn-secondary" style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem', background: '#D4AF37', color: '#0F172A', border: 'none' }} title="Loan Calculator">
                          <Calculator size={12} /> Calculator
                        </button>
                        <button onClick={() => setRenewLoanTarget(l)} className="btn-secondary" style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem', background: '#ECFDF5', color: '#047857', border: '1px solid #6EE7B7' }} title="Renew Loan (Pay Interest Only)">
                          <RefreshCw size={12} /> Renew
                        </button>

                        {currentUser?.role === 'SUPER_ADMIN' && (
                          <>
                            <button onClick={() => setEditLoanTarget(l)} className="btn-secondary" style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem', background: '#FEF3C7', color: '#B8860B', border: '1px solid #FCD34D' }} title="Edit Loan (Super Admin)">
                              <Edit3 size={12} /> Edit
                            </button>
                            <button onClick={() => onDeleteLoan && onDeleteLoan(l.id)} className="btn-secondary" style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5' }} title="Delete Loan (Super Admin)">
                              <Trash2 size={12} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. APPROVALS TAB – MULTI-STAGE WORKFLOW */}
      {subTab === 'APPROVALS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* WORKFLOW PIPELINE HEADER */}
          <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)', borderRadius: '16px', padding: '1.5rem', color: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck color="#D4AF37" size={24} /> Mfumo wa Uidhinishaji wa Mikopo (Multi-Stage Approval)
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#CBD5E1', margin: '0 0 1.25rem 0' }}>Hatua 4 za kuidhinisha mkopo: Ombi → Branch Approval → Risk Review → Super Admin Final</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {[
                { step: '1', label: 'Ombi la Mkopo', status: 'PENDING_BRANCH_APPROVAL', color: '#F59E0B', icon: '📋' },
                { step: '2', label: 'Branch Approval', status: 'PENDING_RISK_REVIEW', color: '#3B82F6', icon: '🏦' },
                { step: '3', label: 'Risk Review', status: 'RISK_APPROVED', color: '#8B5CF6', icon: '🔍' },
                { step: '4', label: 'Final Approval', status: 'APPROVED', color: '#10B981', icon: '✅' },
              ].map(s => (
                <div key={s.step} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center', border: `1px solid ${s.color}44` }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: s.color }}>HATUA {s.step}</div>
                  <div style={{ fontSize: '0.75rem', color: '#E2E8F0', marginTop: '0.15rem' }}>{s.label}</div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '0.1rem', fontFamily: 'monospace' }}>
                    {branchLoans.filter(l => l.status === s.status).length} mkopo(s)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LOAN CARDS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(370px, 1fr))', gap: '1.25rem' }}>
            {branchLoans.filter(l => l.status !== 'REPAID').map(l => {
              const isBranchManager = currentUser?.role === 'BRANCH_MANAGER';
              const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
              const canBranchApprove = (isBranchManager || isSuperAdmin) && l.status === 'PENDING_BRANCH_APPROVAL';
              const canBranchReject  = (isBranchManager || isSuperAdmin) && ['PENDING_BRANCH_APPROVAL', 'PENDING_RISK_REVIEW'].includes(l.status);
              const canRiskPass      = (isBranchManager || isSuperAdmin) && ['PENDING_RISK_REVIEW', 'BRANCH_APPROVED'].includes(l.status);
              const canRiskFail      = (isBranchManager || isSuperAdmin) && ['PENDING_RISK_REVIEW', 'BRANCH_APPROVED'].includes(l.status);
              const canSuperApprove  = isSuperAdmin && ['RISK_APPROVED', 'PENDING_RISK_REVIEW', 'BRANCH_APPROVED', 'PENDING_BRANCH_APPROVAL'].includes(l.status);
              const canDisburse      = (isBranchManager || isSuperAdmin) && l.status === 'APPROVED';

              const statusConfig = {
                'PENDING_BRANCH_APPROVAL': { label: 'Inasubiri Branch Approval', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
                'BRANCH_APPROVED':         { label: 'Imeidhinishwa na Tawi', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
                'BRANCH_REJECTED':         { label: 'Imekataliwa na Tawi', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
                'PENDING_RISK_REVIEW':     { label: 'Inasubiri Risk Review', color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
                'RISK_APPROVED':           { label: '✅ Risk Review: Imepita', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
                'RISK_FAILED':             { label: '❌ Risk Review: Imeshindwa', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
                'APPROVED':                { label: '🏆 Imeidhinishwa Kikamilifu', color: '#047857', bg: '#ECFDF5', border: '#6EE7B7' },
                'DISBURSED':               { label: '💵 Fedha Zimetolewa', color: '#065F46', bg: '#D1FAE5', border: '#6EE7B7' },
                'DEFAULTED':               { label: '⚠️ Imeshindwa Kulipa', color: '#B45309', bg: '#FEF3C7', border: '#FCD34D' },
              };
              const sc = statusConfig[l.status] || { label: l.status, color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' };

              return (
                <div key={l.id} style={{ background: '#FFFFFF', border: `1px solid ${sc.border}`, borderRadius: '18px', padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', borderTop: `4px solid ${sc.color}` }}>

                  {/* LOAN HEADER */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ color: '#0F172A', fontSize: '1.05rem', fontWeight: '900', margin: 0 }}>LN-TZ-{l.id}</h4>
                      <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>
                        {l.borrower_detail ? `${l.borrower_detail.first_name} ${l.borrower_detail.last_name}` : `Mkopaji #${l.borrower}`}
                      </span>
                      {l.branch_detail && <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.1rem' }}>🏢 {l.branch_detail.name}</div>}
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '0.35rem 0.7rem', borderRadius: '9999px', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, textAlign: 'center', maxWidth: '130px' }}>
                      {sc.label}
                    </span>
                  </div>

                  {/* LOAN FINANCIALS */}
                  <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem', fontSize: '0.8rem' }}>
                    <span style={{ color: '#64748B' }}>Kiasi:</span>
                    <strong style={{ color: '#059669', textAlign: 'right' }}>TSH {parseFloat(l.principal_amount || 0).toLocaleString()}</strong>
                    <span style={{ color: '#64748B' }}>Riba ({l.interest_rate_pct}%):</span>
                    <strong style={{ color: '#B8860B', textAlign: 'right' }}>TSH {parseFloat(l.interest_amount || 0).toLocaleString()}</strong>
                    <span style={{ color: '#64748B' }}>Jumla Kurudisha:</span>
                    <strong style={{ color: '#0F172A', textAlign: 'right' }}>TSH {parseFloat(l.total_payable || 0).toLocaleString()}</strong>
                  </div>

                  {/* APPROVAL TRAIL (show who did what) */}
                  {(l.branch_reviewed_by || l.risk_reviewed_by) && (
                    <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '0.65rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ fontWeight: '800', color: '#0369A1', marginBottom: '0.2rem' }}>📋 Rekodi ya Ukaguzi:</div>
                      {l.branch_reviewed_by && (
                        <div style={{ color: '#0369A1' }}>
                          🏦 <strong>Branch {l.branch_review_decision === 'APPROVED' ? '✅' : '❌'}:</strong> {l.branch_reviewed_by} · {l.branch_review_notes || 'Hakuna maelezo'}
                        </div>
                      )}
                      {l.risk_reviewed_by && (
                        <div style={{ color: '#6D28D9' }}>
                          🔍 <strong>Risk {l.risk_review_decision === 'PASSED' ? '✅' : '❌'}:</strong> {l.risk_reviewed_by} · {l.risk_review_notes || 'Hakuna maelezo'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* DISBURSEMENT INFO (when disbursed) */}
                  {l.status === 'DISBURSED' && (
                    <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.65rem', borderRadius: '10px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ fontWeight: '800', color: '#047857' }}>💵 {l.disbursement_method === 'CASH' ? 'CASH TASLIMU' : l.disbursement_method === 'BANK_TRANSFER' ? 'BANK TRANSFER' : 'MOBILE MONEY'}</div>
                      <div style={{ color: '#065F46' }}><strong>Namba:</strong> {l.disbursement_account_no || l.borrower_detail?.phone || '—'}</div>
                      <div style={{ color: '#065F46' }}><strong>Afisa:</strong> {l.disbursed_by_staff_name || 'Branch Manager'} ({l.disbursed_by_staff_role || '—'})</div>
                    </div>
                  )}

                  {/* ===== ACTION BUTTONS ===== */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>

                    {/* STEP 2: BRANCH APPROVAL BUTTONS (Branch Manager only) */}
                    {canBranchApprove && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => {
                            const notes = window.prompt(`✅ BRANCH APPROVAL\nLN-TZ-${l.id} – ${l.borrower_detail?.first_name || ''} ${l.borrower_detail?.last_name || ''}\nTSH ${parseFloat(l.principal_amount||0).toLocaleString()}\n\nAndika maelezo ya Branch Approval (au bonyeza OK bila maelezo):`);
                            if (notes !== null) onBranchApproveLoan(l.id, notes || '');
                          }}
                          style={{ flex: 1, padding: '0.65rem 0.75rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1E40AF, #3B82F6)', color: '#FFFFFF', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                        >
                          <CheckCircle2 size={15} /> Branch Approval ✅
                        </button>
                        <button
                          onClick={() => {
                            const reason = window.prompt(`❌ BRANCH REJECTION\nLN-TZ-${l.id} – ${l.borrower_detail?.first_name || ''} ${l.borrower_detail?.last_name || ''}\n\nToa sababu ya kukataa mkopo huu:`);
                            if (reason !== null && reason.trim()) onBranchRejectLoan(l.id, reason);
                            else if (reason !== null) alert('Tafadhali toa sababu ya kukataa mkopo.');
                          }}
                          style={{ flex: 1, padding: '0.65rem 0.75rem', borderRadius: '10px', outline: 'none', background: '#FEF2F2', color: '#DC2626', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', border: '2px solid #FCA5A5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                        >
                          <X size={15} /> Branch Reject ❌
                        </button>
                      </div>
                    )}

                    {/* STEP 3: RISK REVIEW BUTTONS (Branch Manager only, after Branch Approval) */}
                    {canRiskPass && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => {
                            const notes = window.prompt(`🔍 RISK REVIEW – PASS\nLN-TZ-${l.id} – ${l.borrower_detail?.first_name || ''} ${l.borrower_detail?.last_name || ''}\nTSH ${parseFloat(l.principal_amount||0).toLocaleString()}\n\nAndika maelezo ya Risk Review (au bonyeza OK):`);
                            if (notes !== null) onRiskPassLoan(l.id, notes || '');
                          }}
                          style={{ flex: 1, padding: '0.65rem 0.75rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #5B21B6, #8B5CF6)', color: '#FFFFFF', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                        >
                          <ShieldCheck size={15} /> Risk Review: Imepita ✅
                        </button>
                        <button
                          onClick={() => {
                            const reason = window.prompt(`❌ RISK REVIEW – FAIL\nLN-TZ-${l.id} – ${l.borrower_detail?.first_name || ''} ${l.borrower_detail?.last_name || ''}\n\nToa sababu ya kushindwa Risk Review:`);
                            if (reason !== null && reason.trim()) onRiskFailLoan(l.id, reason);
                            else if (reason !== null) alert('Tafadhali toa sababu ya kushindwa kwenye Risk Review.');
                          }}
                          style={{ flex: 1, padding: '0.65rem 0.75rem', borderRadius: '10px', outline: 'none', background: '#FFF7ED', color: '#C2410C', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', border: '2px solid #FDBA74', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                        >
                          <ShieldAlert size={15} /> Risk Review: Fail ❌
                        </button>
                      </div>
                    )}

                    {/* STEP 4: SUPER ADMIN FINAL APPROVAL (Super Admin only, after Risk Review) */}
                    {canSuperApprove && (
                      <button
                        onClick={() => {
                          const confirm = window.confirm(`🏆 FINAL APPROVAL – SUPER ADMIN\n\nLN-TZ-${l.id} – ${l.borrower_detail?.first_name || ''} ${l.borrower_detail?.last_name || ''}\nTSH ${parseFloat(l.principal_amount||0).toLocaleString()}\nHali: ${l.status}\n\nUnathibitisha kuidhinisha mkopo huu kikamilifu?`);
                          if (confirm) onApproveLoan(l.id);
                        }}
                        style={{ padding: '0.7rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #065F46, #059669)', color: '#FFFFFF', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}
                      >
                        <Award size={16} /> Idhinisha Mkopo Kikamilifu (Super Admin HQ) 🏆
                      </button>
                    )}

                    {/* STATUS BADGES for locked states */}
                    {!canBranchApprove && !canRiskPass && !canSuperApprove && !canDisburse && l.status === 'PENDING_BRANCH_APPROVAL' && (
                      <div style={{ padding: '0.6rem', borderRadius: '10px', background: '#FEF9C3', border: '1px solid #FDE047', color: '#854D0E', fontSize: '0.8rem', fontWeight: '700', textAlign: 'center' }}>
                        ⏳ Inasubiri Branch Manager aidulushe mkopo huu
                      </div>
                    )}
                    {!canBranchApprove && !canRiskPass && !canSuperApprove && !canDisburse && l.status === 'PENDING_RISK_REVIEW' && (
                      <div style={{ padding: '0.6rem', borderRadius: '10px', background: '#F3E8FF', border: '1px solid #DDD6FE', color: '#6D28D9', fontSize: '0.8rem', fontWeight: '700', textAlign: 'center' }}>
                        🔍 Inasubiri Risk Review na Meneja wa Tawi
                      </div>
                    )}
                    {l.status === 'RISK_APPROVED' && !canSuperApprove && (
                      <div style={{ padding: '0.6rem', borderRadius: '10px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', fontSize: '0.8rem', fontWeight: '700', textAlign: 'center' }}>
                        ✅ Imepita Risk Review – Inasubiri Final Approval ya Super Admin
                      </div>
                    )}
                    {l.status === 'BRANCH_REJECTED' && (
                      <div style={{ padding: '0.6rem', borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', fontSize: '0.8rem', fontWeight: '700', textAlign: 'center' }}>
                        ❌ Imekataliwa na Meneja wa Tawi
                      </div>
                    )}
                    {l.status === 'RISK_FAILED' && (
                      <div style={{ padding: '0.6rem', borderRadius: '10px', background: '#FFF7ED', border: '1px solid #FDBA74', color: '#C2410C', fontSize: '0.8rem', fontWeight: '700', textAlign: 'center' }}>
                        ❌ Imeshindwa Risk Review – Haitaendelea Makao Makuu
                      </div>
                    )}

                    {/* DISBURSE (After Final Approval) */}
                    {canDisburse && (
                      <button onClick={() => setDisburseLoanTarget(l)} style={{ padding: '0.7rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #047857, #10B981)', color: '#FFFFFF', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                        <DollarSign size={16} /> Toa Fedha (Disburse Loan)
                      </button>
                    )}

                    {/* FLAG DEFAULT */}
                    {l.status === 'DISBURSED' && (
                      <button onClick={() => onFlagDefault(l.id)} style={{ padding: '0.55rem', borderRadius: '10px', border: '2px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        <AlertTriangle size={14} /> Flag Default
                      </button>
                    )}

                    {/* VIEW FULL DETAILS */}
                    <button onClick={() => openLoanModal(l, 'DETAILS')} style={{ padding: '0.55rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                      <Eye size={14} /> Tazama Taarifa Kamili
                    </button>

                  </div>
                </div>
              );
            })}
          </div>

          {branchLoans.filter(l => l.status !== 'REPAID').length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
              <UserCheck size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p style={{ fontWeight: '700' }}>Hakuna Mikopo Inayohitaji Maamuzi kwa Sasa</p>
            </div>
          )}
        </div>
      )}

      {/* 4. REPAYMENTS TAB WITH ALL 11 HANDWRITTEN REQUIREMENTS */}
      {subTab === 'REPAYMENTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#0F172A', fontWeight: '900', margin: 0 }}>Usimamizi wa Marejesho (REPAYMENT MANAGEMENT SUITE)</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>View Repayments, Add Repayments, Bulk Repayments, Approve, No Repayment, Receipt, Statements, Schedules, Reverse & Waive Penalty</p>
            </div>

            <button onClick={() => setShowBulkRepaymentsModal(true)} className="btn-primary" style={{ padding: '0.7rem 1.3rem', fontSize: '0.88rem', background: '#7C3AED' }}>
              <Layers size={16} /> + Add Bulk Repayments (Group)
            </button>
          </div>

          {/* HANDWRITTEN 11-ITEM REPAYMENT SUB-NAVIGATION STRIP MATCHING USER PHOTO */}
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', background: '#FFFFFF', padding: '0.85rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            
            <button 
              onClick={() => setRepaymentSubFilter('ALL')} 
              style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: repaymentSubFilter === 'ALL' ? '#059669' : '#F8FAFC', color: repaymentSubFilter === 'ALL' ? '#FFFFFF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Eye size={13} /> View Repayments
            </button>

            <button 
              onClick={() => setSelectedLoanForRepayment(activeDisbursedLoans[0] || null)} 
              style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #059669', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: '#059669', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Plus size={13} /> Add Repayments
            </button>

            <button 
              onClick={() => setShowBulkRepaymentsModal(true)} 
              style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #7C3AED', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: '#7C3AED', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Layers size={13} /> Add Bulk Repayments
            </button>

            <button 
              onClick={() => setRepaymentSubFilter('APPROVE')} 
              style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #B8860B', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: repaymentSubFilter === 'APPROVE' ? '#B8860B' : '#F8FAFC', color: repaymentSubFilter === 'APPROVE' ? '#FFFFFF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <CheckCircle2 size={13} /> Approve Repayment
            </button>

            <button 
              onClick={() => setRepaymentSubFilter('NO_REPAYMENT')} 
              style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #FECDD3', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: repaymentSubFilter === 'NO_REPAYMENT' ? '#DC2626' : '#FEF2F2', color: repaymentSubFilter === 'NO_REPAYMENT' ? '#FFFFFF' : '#DC2626', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <AlertTriangle size={13} /> No Repayment ({noRepaymentLoans.length})
            </button>

            <button 
              onClick={() => {
                if (activeDisbursedLoans.length > 0) openRepaymentModal(null, activeDisbursedLoans[0], 'RECEIPT');
              }} 
              style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: '#F8FAFC', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Receipt size={13} /> Receipt
            </button>

            <button 
              onClick={() => {
                if (branchBorrowers.length > 0) openBorrowerModal(branchBorrowers[0], 'STATEMENT');
              }} 
              style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: '#F8FAFC', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <FileText size={13} /> Statements
            </button>

            <button 
              onClick={() => {
                if (activeDisbursedLoans.length > 0) openRepaymentModal(null, activeDisbursedLoans[0], 'SCHEDULE');
              }} 
              style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: '#F8FAFC', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Calendar size={13} /> Repayment Schedules
            </button>

            {currentUser?.role === 'SUPER_ADMIN' && (
              <>
                <button 
                  onClick={() => {
                    if (activeDisbursedLoans.length > 0) openRepaymentModal(null, activeDisbursedLoans[0], 'REVERSE');
                  }} 
                  style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #FCA5A5', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <RotateCcw size={13} /> Reverse Repayment
                </button>

                <button 
                  onClick={() => {
                    if (activeDisbursedLoans.length > 0) openRepaymentModal(null, activeDisbursedLoans[0], 'WAIVE');
                  }} 
                  style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #FDE68A', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: '#FFFBEB', color: '#B8860B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Gift size={13} /> Waive Penalty
                </button>
              </>
            )}

            <button 
              onClick={() => setRepaymentSubFilter('UNALLOCATED')} 
              style={{ padding: '0.45rem 0.9rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', background: repaymentSubFilter === 'UNALLOCATED' ? '#0284C7' : '#F8FAFC', color: repaymentSubFilter === 'UNALLOCATED' ? '#FFFFFF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <HelpCircle size={13} /> Unallocated Payments
            </button>

          </div>

          {/* Single Form & Loans Matrix Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: '1rem', color: '#0F172A', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Plus size={18} /> Fomu ya Weka Rejesho (Single Entry)
              </h4>
              
              <form onSubmit={handleRepaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.4rem' }}>Chagua Mkopo Hai (Active Loan)</label>
                  <select 
                    value={selectedLoanForRepayment?.id || ''} 
                    onChange={(e) => {
                      const l = eligibleRepaymentLoans.find(loan => String(loan.id) === e.target.value);
                      setSelectedLoanForRepayment(l || null);
                    }}
                    required
                    style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontWeight: '700' }}
                  >
                    <option value="">-- Chagua Mkopo --</option>
                    {eligibleRepaymentLoans.map(l => (
                      <option key={l.id} value={l.id}>
                        LN-TZ-{l.id} - {l.borrower_detail ? `${l.borrower_detail.first_name} ${l.borrower_detail.last_name}` : `#${l.borrower}`} (Baki: TSH {parseFloat(l.balance_remaining || 0).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.4rem' }}>Kiasi cha Rejesho (TSH)</label>
                  <input 
                    type="number" 
                    value={repaymentAmount} 
                    onChange={(e) => setRepaymentAmount(e.target.value)} 
                    placeholder="mf. 150000"
                    required
                    style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#059669', fontWeight: '800', fontSize: '1rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.4rem' }}>Njia ya Malipo (Channel)</label>
                  <select 
                    value={repaymentChannel} 
                    onChange={(e) => setRepaymentChannel(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontWeight: '700' }}
                  >
                    <option value="MPESA">M-Pesa / Mobile Money</option>
                    <option value="BANK_TRANSFER">Bank Deposit / NMB / CRDB</option>
                    <option value="CASH">Cash Counter (Tawi)</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center', background: '#059669' }}>
                  <Wallet size={16} /> Hifadhi Rejesho Sasa
                </button>
              </form>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', overflowX: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: '1rem', color: '#0F172A', fontWeight: '800', marginBottom: '1rem' }}>Mikopo Inayoendelea Kurejeshwa & Risiti</h4>
              
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Mkopo</th>
                    <th>Mkopaji</th>
                    <th>Jumla ya Deni</th>
                    <th>Baki (Balance)</th>
                    <th>Hali</th>
                    <th>Vitendo na Risiti (Actions)</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleRepaymentLoans.map(l => (
                    <tr key={l.id}>
                      <td style={{ color: '#B8860B', fontWeight: '800' }}>LN-TZ-{l.id}</td>
                      <td style={{ color: '#0F172A', fontWeight: '700' }}>{l.borrower_detail ? `${l.borrower_detail.first_name} ${l.borrower_detail.last_name}` : `#${l.borrower}`}</td>
                      <td style={{ fontWeight: '800', color: '#0F172A' }}>TSH {parseFloat(l.total_payable).toLocaleString()}</td>
                      <td style={{ fontWeight: '800', color: '#DC2626' }}>TSH {parseFloat(l.balance_remaining).toLocaleString()}</td>
                      <td><span className="badge badge-success">DISBURSED</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <button onClick={() => openRepaymentModal(null, l, 'RECEIPT')} className="btn-secondary" style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem', background: '#059669', color: '#FFFFFF', border: 'none' }} title="Print Receipt">
                            <Receipt size={12} /> Risiti
                          </button>
                          <button onClick={() => openRepaymentModal(null, l, 'SCHEDULE')} className="btn-secondary" style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem', background: '#F1F5F9', color: '#1E293B', border: '1px solid #CBD5E1' }} title="Repayment Schedule">
                            <Calendar size={12} /> Ratiba
                          </button>
                          {currentUser?.role === 'SUPER_ADMIN' && (
                            <button onClick={() => openRepaymentModal(null, l, 'REVERSE')} className="btn-secondary" style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5' }} title="Reverse Payment">
                              <RotateCcw size={12} /> Reverse
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* MODALS */}
      {showBorrowerModal && (
        <BorrowerRegistrationModal 
          currentUser={currentUser}
          branches={branches}
          onClose={() => setShowBorrowerModal(false)}
          onSubmit={onCreateBorrower}
        />
      )}

      {fullViewBorrower && (
        <BorrowerFullViewModal
          borrower={fullViewBorrower}
          loans={loans}
          initialTab={fullViewBorrowerTab}
          onClose={() => setFullViewBorrower(null)}
        />
      )}

      {fullViewLoan && (
        <LoanFullViewModal
          loan={fullViewLoan}
          currentUser={currentUser}
          initialTab={fullViewLoanTab}
          onClose={() => setFullViewLoan(null)}
          onRefresh={onRefresh}
        />
      )}

      {fullViewRepaymentLoan && (
        <RepaymentFullViewModal
          repayment={fullViewRepayment}
          loan={fullViewRepaymentLoan}
          initialTab={fullViewRepaymentTab}
          onClose={() => {
            setFullViewRepayment(null);
            setFullViewRepaymentLoan(null);
          }}
        />
      )}

      {showBulkRepaymentsModal && (
        <BulkRepaymentModal
          loans={loans}
          onClose={() => setShowBulkRepaymentsModal(false)}
          onRecordRepayment={onRecordRepayment}
        />
      )}

      {showLoanModal && (
        <LoanApplicationModal 
          borrowers={branchBorrowers} 
          branches={branches} 
          loanProducts={loanProducts}
          onClose={() => setShowLoanModal(false)} 
          onSubmit={onCreateLoan} 
        />
      )}

      {/* LOAN PRODUCTS MODAL (CATALOGUE) */}
      {showProductsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #CBD5E1', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={22} color="#0284C7" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Bidhaa za Mikopo Zilizosajiliwa na Super Admin</h3>
              </div>
              <button onClick={() => setShowProductsModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {(() => {
                const activeBranchProducts = (loanProducts || []).filter(p => 
                  !selectedBranchId || selectedBranchId === 'all' || !p.branch || String(p.branch) === String(selectedBranchId) || String(p.branch_id) === String(selectedBranchId) || (p.branch_detail && String(p.branch_detail.id) === String(selectedBranchId))
                );
                return activeBranchProducts.length > 0 ? (
                  activeBranchProducts.map(p => (
                    <div key={p.id} style={{ background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '14px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#0284C7', background: '#E0F2FE', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                          {p.product_code || 'CODE'}
                        </span>
                        <span style={{ fontSize: '0.7rem', fontWeight: '800', background: '#ECFDF5', color: '#047857', padding: '0.15rem 0.45rem', borderRadius: '12px' }}>
                          {p.status || 'Active'}
                        </span>
                      </div>
                      <strong style={{ fontSize: '1rem', color: '#0F172A', fontWeight: '900' }}>{p.product_name || p.name}</strong>
                      <span style={{ fontSize: '0.82rem', color: '#059669', fontWeight: '800' }}>
                        Kiwango cha Juu: TSH {parseFloat(p.max_amount || p.maxAmount || 0).toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#B8860B', fontWeight: '800' }}>
                        Riba: {p.interest_rate_pct || p.interest}%
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>
                        Muda: {p.min_duration || 1} - {p.max_duration || 12} Miezi ({p.repayment_frequency || 'Monthly'})
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', background: '#F8FAFC', borderRadius: '12px', color: '#64748B', fontWeight: '700' }}>
                    Hakuna Bidhaa ya Mkopo Iliyosajiliwa kwa Tawi Hili ({currentBranch?.name}) kwa Sasa.
                  </div>
                );
              })()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setShowProductsModal(false)} className="btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                Funga Catalogue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. DISBURSEMENT MODAL (CASH, MOBILE MONEY, BANK TRANSFER) */}
      {disburseLoanTarget && (
        <DisburseLoanModal 
          loan={disburseLoanTarget}
          onClose={() => setDisburseLoanTarget(null)}
          onConfirmDisburse={(loanId, details) => {
            onDisburseLoan(loanId);
            setDisburseLoanTarget(null);
          }}
        />
      )}

      {/* 10. EDIT LOAN MODAL (SUPER ADMIN) */}
      {editLoanTarget && (
        <EditLoanModal 
          loan={editLoanTarget}
          onClose={() => setEditLoanTarget(null)}
          onSave={onEditLoan}
        />
      )}

      {/* 11. RENEW LOAN MODAL */}
      {renewLoanTarget && (
        <RenewLoanModal 
          loan={renewLoanTarget}
          onClose={() => setRenewLoanTarget(null)}
          onRenew={onRenewLoan}
        />
      )}

      {/* 12. EDIT BORROWER MODAL (SUPER ADMIN) */}
      {editBorrowerTarget && (
        <EditBorrowerModal 
          borrower={editBorrowerTarget}
          onClose={() => setEditBorrowerTarget(null)}
          onSave={onUpdateBorrower}
        />
      )}

      {/* 13. FIELD VERIFICATION & EVIDENCE MODAL (GPS, RESIDENCE, BUSINESS, STAND PHOTOS) */}
      {fieldEvidenceTarget && (
        <FieldVerificationEvidenceModal 
          borrower={fieldEvidenceTarget}
          onClose={() => setFieldEvidenceTarget(null)}
          onSave={async (borrowerId, data) => {
            if (onUpdateBorrower) {
              await onUpdateBorrower(borrowerId, data);
            }
          }}
        />
      )}

    </div>
  );
}

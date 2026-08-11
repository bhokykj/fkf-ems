import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, FileText, PieChart, ShieldAlert, ShieldCheck, CheckCircle, 
  Plus, Search, RefreshCw, ChevronRight, AlertTriangle, ArrowUpRight, 
  Layers, Lock, Sliders, LogOut, CheckCircle2, DollarSign, Wallet,
  User, Key, LogIn, CheckCheck, Award, CreditCard, Sparkles, Activity, MapPin, UserPlus, KeyRound, ArrowRightLeft, Trash2, Package, Calendar,
  Eye, EyeOff, Calculator, Edit3, FileSearch, Briefcase
} from 'lucide-react';

import BranchSettingsModal from './components/BranchSettingsModal';
import ProfitLossReport from './components/ProfitLossReport';
import CollateralManager from './components/CollateralManager';
import CrbIntegrationHub from './components/CrbIntegrationHub';
import LoanApplicationModal from './components/LoanApplicationModal';
import BranchWorkflowEngine from './components/BranchWorkflowEngine';
import NewBranchModal from './components/NewBranchModal';
import AddStaffModal from './components/AddStaffModal';
import ResetCodeModal from './components/ResetCodeModal';
import KycVerificationModal from './components/KycVerificationModal';
import TransferModal from './components/TransferModal';
import LocationManagementModal from './components/LocationManagementModal';
import AddLoanProductModal from './components/AddLoanProductModal';
import LoanProductsManagerModal from './components/LoanProductsManagerModal';
import BranchCapitalManagerModal from './components/BranchCapitalManagerModal';
import PayrollManagerModal from './components/PayrollManagerModal';
import InternalExternalAuditModal from './components/InternalExternalAuditModal';
import NextSMSGatewayModal from './components/NextSMSGatewayModal';
import BotTraReportsHub from './components/BotTraReportsHub';
import LoanCalculatorModal from './components/LoanCalculatorModal';
import EditStaffModal from './components/EditStaffModal';
import PublicJobBoardModal from './components/PublicJobBoardModal';
import HRRecruitmentModal from './components/HRRecruitmentModal';
import BorrowerPortalHub from './components/BorrowerPortalHub';
import StaffIdCardModal from './components/StaffIdCardModal';

const API_BASE = 'http://localhost:8000/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('fkf_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('fkf_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [loginForm, setLoginForm] = useState({ username: 'admin', password: 'password123' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');

  const [branches, setBranches] = useState([]);
  const [loans, setLoans] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [collaterals, setCollaterals] = useState([]);
  const [collateralAlerts, setCollateralAlerts] = useState({ expiring_insurance: [], high_ltv_warnings: [] });
  const [pnlData, setPnlData] = useState(null);
  const [crbHistory, setCrbHistory] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [loanProducts, setLoanProducts] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [loginRoleTab, setLoginRoleTab] = useState('STAFF'); // 'STAFF' | 'BORROWER'
  const [editingBranch, setEditingBranch] = useState(null);
  const [editingStaffUser, setEditingStaffUser] = useState(null);
  const [showNewBranchModal, setShowNewBranchModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showResetCodeModal, setShowResetCodeModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAddLoanProductModal, setShowAddLoanProductModal] = useState(false);
  const [showLoanProductsManagerModal, setShowLoanProductsManagerModal] = useState(false);
  const [showCapitalManagerModal, setShowCapitalManagerModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showNextSMSModal, setShowNextSMSModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showJobBoardModal, setShowJobBoardModal] = useState(false);
  const [showHRRecruitmentModal, setShowHRRecruitmentModal] = useState(false);
  const [selectedKycBorrower, setSelectedKycBorrower] = useState(null);
  const [selectedStaffIdCard, setSelectedStaffIdCard] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState('LOGIN'); // 'LOGIN' | 'OTP_VERIFY' | 'FORGOT_PASSWORD_STEP1' | 'FORGOT_PASSWORD_STEP2'
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [otpPhoneMsg, setOtpPhoneMsg] = useState('');
  const [pendingUsername, setPendingUsername] = useState('');

  // Forgot password state
  const [forgotQuery, setForgotQuery] = useState('');
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

  const handleLoginSubmit = async (e, direct = false) => {
    if (e) e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password,
          direct_login: direct
        })
      });
      const data = await res.json();

      if (res.ok && direct && data.success && data.user) {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('fkf_auth', 'true');
        localStorage.setItem('fkf_user', JSON.stringify(data.user));

        if (data.user.role === 'SUPER_ADMIN') {
          setSelectedBranchFilter('all');
          setActiveTab('dashboard');
        } else {
          setSelectedBranchFilter(data.user.branch || 'all');
          setActiveTab('workflow');
        }
        setAuthMode('LOGIN');
        setLoginLoading(false);
        return;
      } else if (res.ok && data.otp_required) {
        setAuthMode('OTP_VERIFY');
        setPendingUsername(data.username);
        setOtpPhoneMsg(data.message || `Code ya uhakiki imetumwa kwa SMS (Sender ID: FKF CODE) kwenda ${data.masked_phone}.`);
        setLoginLoading(false);
        return;
      } else if (data.error) {
        setLoginError(data.error);
      } else {
        setLoginError('Imefeli kuingia. Angalia Username na Password.');
      }
    } catch (err) {
      setLoginError('Imefeli kuunganishwa na Server.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch(`${API_BASE}/auth/verify_otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: pendingUsername,
          otp_code: otpCodeInput
        })
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('fkf_auth', 'true');
        localStorage.setItem('fkf_user', JSON.stringify(data.user));

        if (data.user.role === 'SUPER_ADMIN') {
          setSelectedBranchFilter('all');
          setActiveTab('dashboard');
        } else {
          setSelectedBranchFilter(data.user.branch || 'all');
          setActiveTab('workflow');
        }
        setAuthMode('LOGIN');
        setOtpCodeInput('');
      } else {
        setLoginError(data.error || 'Code ya uhakiki (OTP Code) si sahihi.');
      }
    } catch (err) {
      setLoginError('Imefeli kuhakiki OTP Code.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotPasswordSendOtp = async (e) => {
    if (e) e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch(`${API_BASE}/auth/forgot_password/send_otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username_or_phone: forgotQuery })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPendingUsername(data.username);
        setForgotMsg(data.message);
        setAuthMode('FORGOT_PASSWORD_STEP2');
      } else {
        setLoginError(data.error || 'Akaunti haikupatikana.');
      }
    } catch (err) {
      setLoginError('Imefeli kutuma Code kwa SMS.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotPasswordReset = async (e) => {
    if (e) e.preventDefault();
    if (forgotNewPassword !== forgotConfirmPassword) {
      setLoginError('Password mpya na confirmation hazifanani!');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch(`${API_BASE}/auth/forgot_password/reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: pendingUsername,
          otp_code: forgotOtpCode,
          new_password: forgotNewPassword
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setForgotSuccessMsg(data.message || 'Password yako imebadilishwa kikamilifu! Sasa unaweza kuingia.');
        setAuthMode('LOGIN');
        setForgotOtpCode('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
      } else {
        setLoginError(data.error || 'Imefeli kubadilisha password.');
      }
    } catch (err) {
      setLoginError('Hitilafu kwenye mfumo wa kubadilisha password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const getDashboardTitle = () => {
    if (!currentUser) return 'Dashboard ya Super Admin';
    switch (currentUser.role) {
      case 'SUPER_ADMIN':
        return 'Dashboard ya Super Admin';
      case 'BRANCH_MANAGER':
        return 'Dashboard ya Branch Manager';
      case 'LOAN_OFFICER':
        return 'Dashboard ya Loan Officer';
      case 'FIELD_OFFICER':
        return 'Dashboard ya Afisa Nyanjani';
      case 'BORROWER':
        return 'Dashboard ya Mteja';
      default:
        return `Dashboard ya ${currentUser.role_display || 'Super Admin'}`;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('fkf_auth');
    localStorage.removeItem('fkf_user');
    setLoginForm({ username: 'admin', password: 'password123' });
  };

  const fetchAllData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const branchRes = await fetch(`${API_BASE}/branches/`).then(r => r.json()).catch(() => []);
      const branchList = Array.isArray(branchRes?.results) ? branchRes.results : (Array.isArray(branchRes) ? branchRes : []);
      setBranches(branchList);

      const filterVal = typeof selectedBranchFilter === 'object' ? (selectedBranchFilter?.id || 'all') : selectedBranchFilter;
      const branchParam = (!filterVal || filterVal === 'all' || filterVal === 'undefined' || filterVal === 'null') ? '' : `?branch=${filterVal}`;
      
      const [loanRes, bwRes, colRes, alertRes, pnlRes, crbRes, staffRes, productRes, vacRes, appRes] = await Promise.all([
        fetch(`${API_BASE}/loans/${branchParam}`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/loans/borrowers/${branchParam}`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/collaterals/${branchParam}`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/collaterals/alerts/`).then(r => r.json()).catch(() => ({ expiring_insurance: [], high_ltv_warnings: [] })),
        fetch(`${API_BASE}/analytics/pnl/${branchParam}`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/crb/`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/auth/staff/`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/loans/products/${branchParam}`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/auth/vacancies/`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/auth/job-applications/`).then(r => r.json()).catch(() => [])
      ]);

      setLoans(Array.isArray(loanRes?.results) ? loanRes.results : (Array.isArray(loanRes) ? loanRes : []));
      setBorrowers(Array.isArray(bwRes?.results) ? bwRes.results : (Array.isArray(bwRes) ? bwRes : []));
      setCollaterals(Array.isArray(colRes?.results) ? colRes.results : (Array.isArray(colRes) ? colRes : []));
      setCollateralAlerts(alertRes && typeof alertRes === 'object' ? alertRes : { expiring_insurance: [], high_ltv_warnings: [] });
      setPnlData(pnlRes && typeof pnlRes === 'object' ? pnlRes : null);
      setCrbHistory(Array.isArray(crbRes?.results) ? crbRes.results : (Array.isArray(crbRes) ? crbRes : []));
      const rawStaff = Array.isArray(staffRes) ? staffRes : [];
      setStaffUsers(rawStaff.filter(u => u.role !== 'BORROWER'));
      setLoanProducts(Array.isArray(productRes?.results) ? productRes.results : (Array.isArray(productRes) ? productRes : []));
      setVacancies(Array.isArray(vacRes?.results) ? vacRes.results : (Array.isArray(vacRes) ? vacRes : []));
      setApplications(Array.isArray(appRes?.results) ? appRes.results : (Array.isArray(appRes) ? appRes : []));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated, selectedBranchFilter]);

  const handleUpdateBranchRules = async (branchId, formData) => {
    await fetch(`${API_BASE}/branches/${branchId}/update_rules/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    fetchAllData();
  };

  const handleCreateBranch = async (branchData) => {
    const res = await fetch(`${API_BASE}/branches/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branchData)
    });
    if (!res.ok) throw new Error('Imeshindwa kusajili tawi');
    fetchAllData();
  };

  const handleDeleteBranch = async (branchId, branchName) => {
    if (!window.confirm(`Je, una uhakika unataka kufuta tawi la "${branchName}"? Tawi hili litafutwa kabisa kwenye mfumo.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/branches/${branchId}/`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Imeshindwa kufuta tawi');
      fetchAllData();
    } catch (err) {
      alert('Hitilafu: Imeshindwa kufuta tawi hili.');
    }
  };

  const handleCreateStaff = async (staffData) => {
    const payload = {
      ...staffData,
      branch_id: staffData.branch_id || staffData.branch
    };
    const res = await fetch(`${API_BASE}/auth/create_staff/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    let data = {};
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Hitilafu ya Server (${res.status}): Imeshindwa kusajili mtumishi.`);
    }
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Imeshindwa kusajili mfanyakazi mpya.');
    }
    fetchAllData();
  };

  const handleCreateLoanProduct = async (productData) => {
    const res = await fetch(`${API_BASE}/loans/products/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Imeshindwa kusajili loan product');
    fetchAllData();
  };

  const handleEditLoanProduct = async (id, productData) => {
    const res = await fetch(`${API_BASE}/loans/products/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Imeshindwa kubadilisha taarifa za loan product');
    }
    fetchAllData();
  };

  const handleDeleteLoanProduct = async (id) => {
    const res = await fetch(`${API_BASE}/loans/products/${id}/`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Imeshindwa kufuta product ya mkopo');
    fetchAllData();
  };

  const handleResetPassword = async (payload) => {
    const res = await fetch(`${API_BASE}/auth/reset_password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Imeshindwa kubadilisha nywila');
    fetchAllData();
  };

  const handleTransferStaff = async (payload) => {
    const res = await fetch(`${API_BASE}/auth/transfer_staff/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Imeshindwa kuhamisha mtumishi');
    fetchAllData();
  };

  const handleVerifyKyc = async (borrowerId, payload) => {
    const res = await fetch(`${API_BASE}/loans/borrowers/${borrowerId}/verify_kyc/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Imeshindwa kuhakiki KYC');
    fetchAllData();
  };

  const handleTransferBorrower = async (borrowerId, newBranchId) => {
    const res = await fetch(`${API_BASE}/loans/borrowers/${borrowerId}/transfer_branch/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_branch_id: newBranchId })
    });
    if (!res.ok) throw new Error('Imeshindwa kuhamisha mkopaji');
    fetchAllData();
  };

  const handleCreateBorrower = async (borrowerData) => {
    const payload = {
      ...borrowerData,
      created_by_officer_id: borrowerData.created_by_officer_id || currentUser?.id || null,
      created_by_officer_name: borrowerData.created_by_officer_name || (currentUser ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() : null)
    };
    await fetch(`${API_BASE}/loans/borrowers/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    fetchAllData();
  };

  const handleUpdateBorrower = async (borrowerId, updatedData) => {
    await fetch(`${API_BASE}/loans/borrowers/${borrowerId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    fetchAllData();
  };

  const handleDeleteBorrower = async (borrowerId) => {
    if (!window.confirm(`Je, una uhakika unataka kufuta Mkopaji huyu kabisa kwenye mfumo? Mikopo na akaunti yake yote itafutwa!`)) {
      return;
    }
    const res = await fetch(`${API_BASE}/loans/borrowers/${borrowerId}/`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_role: currentUser?.role || 'SUPER_ADMIN' })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(`Hitilafu: ${data.error || 'Imeshindwa kufuta mkopaji'}`);
      return;
    }
    alert('Mkopaji amefutwa kikamilifu!');
    fetchAllData();
  };

  const handleEditStaff = async (staffId, payload) => {
    const res = await fetch(`${API_BASE}/auth/staff/${staffId}/edit/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, user_role: currentUser?.role || 'SUPER_ADMIN' })
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Imeshindwa ku-update mtumishi');
    }
    alert('Taarifa za mtumishi zimehifadhiwa kikamilifu!');
    fetchAllData();
  };

  const handleDeleteStaff = async (staffId, username) => {
    if (!window.confirm(`Je, una uhakika unataka kufuta Mtumishi @${username} kabisa kwenye mfumo?`)) {
      return;
    }
    const res = await fetch(`${API_BASE}/auth/staff/${staffId}/delete/`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_role: currentUser?.role || 'SUPER_ADMIN' })
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      alert(`Hitilafu: ${data.error || 'Imeshindwa kufuta mtumishi'}`);
      return;
    }
    alert(`Mtumishi @${username} amefutwa kikamilifu!`);
    fetchAllData();
  };

  const handleApproveLoan = async (loanId) => {
    const res = await fetch(`${API_BASE}/loans/${loanId}/approve/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_role: currentUser?.role || 'SUPER_ADMIN' })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { alert(data.error || 'Imeshindwa kuidhinisha mkopo'); return; }
    fetchAllData();
  };

  const handleBranchApproveLoan = async (loanId, notes = '') => {
    const reviewerName = `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 'Meneja wa Tawi';
    const res = await fetch(`${API_BASE}/loans/${loanId}/branch_approve/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_role: currentUser?.role, reviewer_name: reviewerName, notes })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { alert(data.error || 'Imeshindwa kufanya Branch Approval'); return; }
    fetchAllData();
  };

  const handleBranchRejectLoan = async (loanId, reason = '') => {
    const reviewerName = `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 'Meneja wa Tawi';
    const res = await fetch(`${API_BASE}/loans/${loanId}/branch_reject/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_role: currentUser?.role, reviewer_name: reviewerName, notes: reason })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { alert(data.error || 'Imeshindwa kukataa mkopo'); return; }
    fetchAllData();
  };

  const handleRiskPassLoan = async (loanId, notes = '') => {
    const reviewerName = `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 'Meneja wa Tawi';
    const res = await fetch(`${API_BASE}/loans/${loanId}/risk_pass/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_role: currentUser?.role, reviewer_name: reviewerName, notes })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { alert(data.error || 'Imeshindwa kufanya Risk Review Pass'); return; }
    fetchAllData();
  };

  const handleRiskFailLoan = async (loanId, reason = '') => {
    const reviewerName = `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 'Meneja wa Tawi';
    const res = await fetch(`${API_BASE}/loans/${loanId}/risk_fail/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_role: currentUser?.role, reviewer_name: reviewerName, notes: reason })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { alert(data.error || 'Imeshindwa kufanya Risk Review Fail'); return; }
    fetchAllData();
  };

  const handleDisburseLoan = async (loanId, payload = {}) => {
    await fetch(`${API_BASE}/loans/${loanId}/disburse/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    fetchAllData();
  };

  const handleEditLoan = async (loanId, updatedData) => {
    const res = await fetch(`${API_BASE}/loans/${loanId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updatedData, user_role: currentUser?.role || 'SUPER_ADMIN' })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Imeshindwa kubadilisha mkopo');
    }
    fetchAllData();
  };

  const handleDeleteLoan = async (loanId) => {
    if (!window.confirm(`Je, una uhakika unataka kufuta Mkopo LN-TZ-${loanId} kabisa kwenye mfumo? Hatua hii hairejelewi!`)) {
      return;
    }
    const res = await fetch(`${API_BASE}/loans/${loanId}/`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_role: currentUser?.role || 'SUPER_ADMIN' })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(`Hitilafu: ${data.error || 'Imeshindwa kufuta mkopo'}`);
      return;
    }
    alert(`Mkopo LN-TZ-${loanId} amefutwa kikamilifu!`);
    fetchAllData();
  };

  const handleCreateVacancy = async (payload) => {
    const res = await fetch(`${API_BASE}/auth/vacancies/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Imeshindwa kusajili vacancy');
    fetchAllData();
  };

  const handleUpdateVacancy = async (vacId, payload) => {
    const res = await fetch(`${API_BASE}/auth/vacancies/${vacId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Imeshindwa kubadilisha vacancy');
    fetchAllData();
  };

  const handleDeleteVacancy = async (vacId) => {
    if (!window.confirm('Je, una uhakika unataka kufuta Tangazo hili la Kazi?')) return;
    const res = await fetch(`${API_BASE}/auth/vacancies/${vacId}/`, {
      method: 'DELETE'
    });
    if (!res.ok) alert('Imeshindwa kufuta vacancy');
    fetchAllData();
  };

  const handleDeleteJobApp = async (appId) => {
    if (!window.confirm('Je, una uhakika unataka kufuta Ombi hili la Kazi?')) return;
    const res = await fetch(`${API_BASE}/auth/job-applications/${appId}/`, {
      method: 'DELETE'
    });
    if (!res.ok) alert('Imeshindwa kufuta ombi');
    fetchAllData();
  };

  const handleSubmitJobApplication = async (payload) => {
    const res = await fetch(`${API_BASE}/auth/job-applications/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Imeshindwa kuwasilisha ombi');
    fetchAllData();
    return data;
  };

  const handleUpdateJobAppStatus = async (appId, payload) => {
    await fetch(`${API_BASE}/auth/job-applications/${appId}/update_status/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    fetchAllData();
  };

  const handleScheduleInterview = async (appId, payload) => {
    await fetch(`${API_BASE}/auth/job-applications/${appId}/schedule_interview/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    fetchAllData();
  };

  const handleConvertCandidateToEmployee = async (appId, payload) => {
    const res = await fetch(`${API_BASE}/auth/job-applications/${appId}/convert_to_employee/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Imeshindwa kusajili mtumishi');
    alert(`Mwombaji amesajiliwa kikamilifu kama Mtumishi rasmi wa FKF MICRO-CREDIT!`);
    fetchAllData();
  };

  const handleRenewLoan = async (loanId, renewalData) => {
    const res = await fetch(`${API_BASE}/loans/${loanId}/renew_loan/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(renewalData)
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Imeshindwa kurenew mkopo');
    }
    alert(data.message || `Mkopo LN-TZ-${loanId} umefanyiwa Renewal upya!`);
    fetchAllData();
  };

  const handleRecordRepayment = async (repaymentData) => {
    const res = await fetch(`${API_BASE}/loans/repayments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(repaymentData)
    }).then(r => r.json());
    fetchAllData();
    return res;
  };

  const handleFlagDefault = async (loanId) => {
    await fetch(`${API_BASE}/loans/${loanId}/flag_default/`, { method: 'POST' });
    fetchAllData();
  };

  const handleCreateLoan = async (loanData) => {
    const payload = {
      ...loanData,
      created_by_officer_id: loanData.created_by_officer_id || currentUser?.id || null,
      created_by_officer_name: loanData.created_by_officer_name || (currentUser ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() : null)
    };
    await fetch(`${API_BASE}/loans/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    fetchAllData();
  };

  const handleAddCollateral = async (colData) => {
    await fetch(`${API_BASE}/collaterals/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(colData)
    });
    fetchAllData();
  };

  const handleRunCRBCheck = async (borrowerId, provider) => {
    const res = await fetch(`${API_BASE}/crb/execute_check/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ borrower_id: borrowerId, provider })
    }).then(r => r.json());
    fetchAllData();
    return res;
  };

  // Safe Array References & Loan Officer Scope Filtering
  const isOfficerRole = currentUser?.role === 'LOAN_OFFICER' || currentUser?.role === 'FIELD_OFFICER';

  const rawLoans = Array.isArray(loans) ? loans : [];
  const rawBorrowers = Array.isArray(borrowers) ? borrowers : [];

  const safeLoans = rawLoans.filter(l => {
    if (isOfficerRole) {
      if (l.created_by_officer_id && String(l.created_by_officer_id) !== String(currentUser?.id)) return false;
    }
    return true;
  });

  const safeBorrowers = rawBorrowers.filter(b => {
    if (isOfficerRole) {
      if (b.created_by_officer_id && String(b.created_by_officer_id) !== String(currentUser?.id)) return false;
    }
    return true;
  });

  const safeBranches = Array.isArray(branches) ? branches : [];
  const safeCollaterals = Array.isArray(collaterals) ? collaterals : [];
  const safeStaff = Array.isArray(staffUsers) ? staffUsers : [];

  // LOGIN SCREEN
  if (!isAuthenticated || !currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.15) 0%, #090D16 70%)' }}>
        <div style={{ width: '100%', maxWidth: '460px', padding: '2.5rem', background: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img src="/fkf-logo.png" alt="FKF Logo" style={{ height: '75px', borderRadius: '12px', marginBottom: '1rem' }} />
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A' }}>FKF MICRO-CREDIT</h1>
            <p style={{ fontSize: '0.85rem', color: '#D4AF37', marginTop: '0.2rem', fontWeight: '700' }}>SYSTEM (fkf-ems)</p>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.15rem', fontWeight: '700' }}>Enterprise Management System</p>
          </div>

          {forgotSuccessMsg && (
            <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', padding: '0.75rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.82rem', textAlign: 'center', fontWeight: '700' }}>
              ✓ {forgotSuccessMsg}
            </div>
          )}

          {loginError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.75rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.82rem', textAlign: 'center', fontWeight: '600' }}>
              ⚠️ {loginError}
            </div>
          )}

          {/* SEGMENTED TAB SWITCHER FOR LOGIN TYPE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#F1F5F9', padding: '0.35rem', borderRadius: '14px', marginBottom: '1.5rem', border: '1px solid #E2E8F0' }}>
            <button
              type="button"
              onClick={() => { setLoginRoleTab('STAFF'); setLoginForm({ username: 'admin', password: 'password123' }); setLoginError(''); }}
              style={{
                padding: '0.65rem 0.5rem',
                borderRadius: '10px',
                border: 'none',
                background: loginRoleTab === 'STAFF' ? '#1E293B' : 'transparent',
                color: loginRoleTab === 'STAFF' ? '#D4AF37' : '#64748B',
                fontWeight: '900',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease',
                boxShadow: loginRoleTab === 'STAFF' ? '0 4px 10px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Building2 size={15} /> Super Admin / Staff
            </button>
            <button
              type="button"
              onClick={() => { setLoginRoleTab('BORROWER'); setLoginForm({ username: '0673449030', password: 'password123' }); setLoginError(''); }}
              style={{
                padding: '0.65rem 0.5rem',
                borderRadius: '10px',
                border: 'none',
                background: loginRoleTab === 'BORROWER' ? '#059669' : 'transparent',
                color: loginRoleTab === 'BORROWER' ? '#FFFFFF' : '#64748B',
                fontWeight: '900',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease',
                boxShadow: loginRoleTab === 'BORROWER' ? '0 4px 10px rgba(5, 150, 105, 0.2)' : 'none'
              }}
            >
              <User size={15} /> Akaunti ya Mteja
            </button>
          </div>

          {/* MODE 1: LOGIN (USERNAME & PASSWORD) */}
          {authMode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#0F172A', marginBottom: '0.4rem', fontWeight: '800' }}>
                  {loginRoleTab === 'STAFF' ? 'Username (Jina la Mtumishi / Super Admin)' : 'Namba ya Simu / NIDA (Akaunti ya Mteja)'}
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: loginRoleTab === 'STAFF' ? '#D4AF37' : '#059669' }} />
                  <input 
                    type="text" 
                    required 
                    placeholder={loginRoleTab === 'STAFF' ? "e.g. admin" : "e.g. 0790980123 au NIDA"} 
                    value={loginForm.username} 
                    onChange={(e) => setLoginForm(p => ({ ...p, username: e.target.value }))} 
                    style={{ width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.5rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontWeight: '700' }} 
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: '800' }}>Password (Namba ya Siri)</label>
                  <button type="button" onClick={() => { setAuthMode('FORGOT_PASSWORD_STEP1'); setLoginError(''); }} style={{ background: 'transparent', border: 'none', color: '#0284C7', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                    Umesahau Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Key size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: loginRoleTab === 'STAFF' ? '#D4AF37' : '#059669' }} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="••••••••" 
                    value={loginForm.password} 
                    onChange={(e) => setLoginForm(p => ({ ...p, password: e.target.value }))} 
                    style={{ width: '100%', padding: '0.7rem 2.8rem 0.7rem 2.5rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '0.95rem', fontWeight: '700' }} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', padding: '0.2rem' }}
                    title={showPassword ? "Funga Namba ya Siri (Hide Password)" : "Onesha Namba ya Siri (Show Password)"}
                  >
                    {showPassword ? <EyeOff size={18} color="#0F172A" /> : <Eye size={18} color="#64748B" />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {/* Vibrant Emerald-Gold Premium SMS Login Button */}
                <button 
                  type="submit" 
                  onClick={(e) => handleLoginSubmit(e, false)} 
                  disabled={loginLoading} 
                  style={{ 
                    width: '100%', 
                    justifyContent: 'center', 
                    padding: '0.9rem 1.25rem', 
                    fontSize: '0.95rem', 
                    fontWeight: '900', 
                    background: loginRoleTab === 'STAFF' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)', 
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 8px 20px -4px rgba(5, 150, 105, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {loginLoading ? <RefreshCw size={18} className="spin" /> : <Sparkles size={18} color="#D4AF37" />} 📲 Tuma SMS kwa Code & Ingia
                </button>

                <button 
                  type="button" 
                  onClick={(e) => handleLoginSubmit(e, true)} 
                  disabled={loginLoading} 
                  style={{ 
                    width: '100%', 
                    padding: '0.8rem 1.25rem', 
                    borderRadius: '12px', 
                    border: '1px solid #CBD5E1', 
                    background: '#F8FAFC', 
                    color: '#0F172A', 
                    fontWeight: '800', 
                    fontSize: '0.88rem', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem' 
                  }}
                >
                  <LogIn size={16} color="#0F172A" /> ⚡ Ingia Moja kwa Moja (Direct Login)
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: OTP VERIFICATION SCREEN */}
          {authMode === 'OTP_VERIFY' && (
            <form onSubmit={handleVerifyOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', padding: '0.85rem', borderRadius: '12px', textAlign: 'center', fontSize: '0.82rem', color: '#047857', fontWeight: '700' }}>
                📲 {otpPhoneMsg}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#0F172A', marginBottom: '0.4rem', fontWeight: '800', textAlign: 'center' }}>
                  Ingiza Code uliyotumiwa kwa SMS (6-Digit OTP Code):
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={20} style={{ position: 'absolute', left: '14px', top: '14px', color: '#047857' }} />
                  <input 
                    type="text" 
                    required 
                    maxLength={6}
                    placeholder="Mfano: 483920" 
                    value={otpCodeInput} 
                    onChange={(e) => setOtpCodeInput(e.target.value)} 
                    style={{ width: '100%', padding: '0.8rem 0.75rem 0.8rem 2.8rem', background: '#F8FAFC', border: '2px solid #047857', borderRadius: '12px', color: '#0F172A', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '0.2em', textAlign: 'center' }} 
                  />
                </div>
              </div>

              <button type="submit" disabled={loginLoading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem', background: '#047857' }}>
                {loginLoading ? <RefreshCw size={18} className="spin" /> : <ShieldCheck size={18} />} Thibitisha Code & Ingia Mfomoni
              </button>

              <button type="button" onClick={() => { setAuthMode('LOGIN'); setLoginError(''); }} style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'center', marginTop: '0.5rem' }}>
                ← Rudi Nyuma (Rudi kwenye Login)
              </button>
            </form>
          )}

          {/* MODE 3: FORGOT PASSWORD - STEP 1 (ENTER USERNAME/PHONE) */}
          {authMode === 'FORGOT_PASSWORD_STEP1' && (
            <form onSubmit={handleForgotPasswordSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>Kusahau Password (Reset via SMS)</h3>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>Ingiza Username au Namba ya Simu iliyosajiliwa kutoa Code ya kubadilisha Password.</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', marginBottom: '0.4rem', fontWeight: '600' }}>Username au Namba ya Simu</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#D4AF37' }} />
                  <input type="text" required placeholder="e.g. admin au 0790980123" value={forgotQuery} onChange={(e) => setForgotQuery(e.target.value)} style={{ width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.5rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A' }} />
                </div>
              </div>

              <button type="submit" disabled={loginLoading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem', background: '#0284C7' }}>
                {loginLoading ? <RefreshCw size={18} className="spin" /> : <Sparkles size={18} />} Tuma Code ya Reset kwa SMS
              </button>

              <button type="button" onClick={() => { setAuthMode('LOGIN'); setLoginError(''); }} style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'center', marginTop: '0.5rem' }}>
                ← Rudi Nyuma kwenye Login
              </button>
            </form>
          )}

          {/* MODE 4: FORGOT PASSWORD - STEP 2 (ENTER OTP & NEW PASSWORD) */}
          {authMode === 'FORGOT_PASSWORD_STEP2' && (
            <form onSubmit={handleForgotPasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#E0F2FE', border: '1px solid #38BDF8', padding: '0.85rem', borderRadius: '12px', textAlign: 'center', fontSize: '0.82rem', color: '#0369A1', fontWeight: '700' }}>
                📲 {forgotMsg}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '0.3rem', fontWeight: '700' }}>Code ya SMS (6-Digit Reset OTP Code)</label>
                <input type="text" required maxLength={6} placeholder="Mfano: 593021" value={forgotOtpCode} onChange={(e) => setForgotOtpCode(e.target.value)} style={{ width: '100%', padding: '0.65rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontWeight: '800', textAlign: 'center', letterSpacing: '0.15em' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '0.3rem', fontWeight: '700' }}>Password Mpya (New Password)</label>
                <input type="password" required placeholder="••••••••" value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} style={{ width: '100%', padding: '0.65rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A', marginBottom: '0.3rem', fontWeight: '700' }}>Rudia Password Mpya (Confirm Password)</label>
                <input type="password" required placeholder="••••••••" value={forgotConfirmPassword} onChange={(e) => setForgotConfirmPassword(e.target.value)} style={{ width: '100%', padding: '0.65rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A' }} />
              </div>

              <button type="submit" disabled={loginLoading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem', background: '#059669' }}>
                {loginLoading ? <RefreshCw size={18} className="spin" /> : <ShieldCheck size={18} />} Badilisha Password (Reset Password)
              </button>

              <button type="button" onClick={() => { setAuthMode('LOGIN'); setLoginError(''); }} style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'center', marginTop: '0.5rem' }}>
                ← Ghafri / Rudi Nyuma kwenye Login
              </button>
            </form>
          )}

        </div>
      </div>
    );
  }



  const pendingApprovalsCount = safeLoans.filter(l => l.status === 'PENDING_BRANCH_APPROVAL' || l.status === 'PENDING_RISK_REVIEW').length;
  const activeDisbursedCount = safeLoans.filter(l => l.status === 'DISBURSED').length;
  const totalCollectionsTSH = safeLoans.reduce((acc, l) => acc + (parseFloat(l.total_payable || 0) - parseFloat(l.balance_remaining || 0)), 0);

  const initialFirst = currentUser?.first_name ? currentUser.first_name[0] : 'U';
  const initialLast = currentUser?.last_name ? currentUser.last_name[0] : 'A';
  const fullName = `${currentUser?.first_name || 'Mtumiaji'} ${currentUser?.last_name || 'FKF'}`;
  const roleDisplay = currentUser?.role_display || 'Staff';

  const borrowerProfile = currentUser?.role === 'BORROWER'
    ? (safeBorrowers.find(b => String(b.id) === String(currentUser?.borrower_id)) || 
       safeBorrowers.find(b => b.phone && currentUser?.phone_number && b.phone.includes(currentUser.phone_number.slice(-8))))
    : null;
  const userPhoto = borrowerProfile?.photo_url || currentUser?.passport_photo;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F1F5F9' }}>
      
      {/* 1. TOP ANNOUNCEMENT STRIP (WITH OFFICIAL COMPANY ADDRESS) */}
      <div className="top-announcement-strip">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={14} color="#D4AF37" />
          <span>FKF MICRO-CREDIT • 21Msamaria Street/ Msakuzi Road, P.o Box 9030, Dar es Salaam Tanzania</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.75rem' }}>
          <a href="https://wa.me/255790980123" target="_blank" rel="noreferrer" style={{ color: '#FFFFFF', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            Tel/Whatsapp: <strong style={{ textDecoration: 'underline' }}>255790980123</strong>
          </a>
          <a href="mailto:cs@fkfmicro-credit.co.tz" style={{ color: '#FFFFFF', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            Email: <strong style={{ textDecoration: 'underline' }}>cs@fkfmicro-credit.co.tz</strong>
          </a>
          <a href="https://www.fkfmicro-credit.co.tz" target="_blank" rel="noreferrer" style={{ color: '#D4AF37', fontWeight: '700', textDecoration: 'none' }}>
            www.fkfmicro-credit.co.tz
          </a>
        </div>
      </div>

      {/* 2. MAIN APPLICATION HEADER */}
      <header className="main-app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          
          {/* Logo & System Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img 
              src="/fkf-logo.png" 
              alt="FKF Logo" 
              style={{ height: '58px', width: 'auto', borderRadius: '12px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))' }} 
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em' }}>
                  FKF MICRO-CREDIT
                </h1>
                <span style={{ background: '#1E293B', color: '#D4AF37', fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                  SYSTEM
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600', marginTop: '0.1rem', lineHeight: '1.3' }}>
                21Msamaria Street/ Msakuzi Road,<br />
                P.o Box 9030, Dar es Salaam Tanzania
              </p>
            </div>
          </div>

          {/* User Capsule & Branch Filter & Logout Button (Matching Laptop Photo) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            
            {currentUser?.role === 'SUPER_ADMIN' ? (
              <select value={selectedBranchFilter} onChange={(e) => setSelectedBranchFilter(e.target.value)} style={{ padding: '0.45rem 0.85rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#0F172A', fontSize: '0.82rem', fontWeight: '600' }}>
                <option value="all">Makao Makuu (Matawi Yote)</option>
                {safeBranches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            ) : (
              <span className="badge badge-info" style={{ padding: '0.45rem 0.85rem' }}>
                <Building2 size={14} /> Tawi: {currentUser?.branch_detail?.name || 'Tanzania'}
              </span>
            )}

            {/* Profile Pill Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '0.35rem 0.85rem', borderRadius: '9999px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1E293B', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem', overflow: 'hidden', border: '1.5px solid #D4AF37' }}>
                {userPhoto ? (
                  <img src={userPhoto} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>{initialFirst}{initialLast}</>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0F172A' }}>
                  {fullName}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#B8860B', fontWeight: '700' }}>
                  {roleDisplay} (FKF)
                </span>
              </div>
            </div>

            {/* Logout Pill Button (Matching Laptop Photo `[-> Kutoka (Logout)]`) */}
            <button 
              onClick={handleLogout}
              style={{ background: '#FFF1F2', border: '1px solid #FECDD3', color: '#E11D48', padding: '0.45rem 0.9rem', borderRadius: '9999px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <LogOut size={14} /> [→ Kutoka (Logout)]
            </button>

          </div>
        </div>
      </header>

      {/* 3. HORIZONTAL NAV PILL TABS FOR STAFF (HIDDEN FOR BORROWERS) */}
      {currentUser?.role !== 'BORROWER' && (
        <nav className="nav-pill-bar">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`nav-pill-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <Activity size={16} /> {getDashboardTitle()}
        </button>

        <button 
          onClick={() => setActiveTab('workflow')}
          className={`nav-pill-btn ${activeTab === 'workflow' ? 'active' : ''}`}
        >
          <Users size={16} /> Usajili wa Wakopaji <span className="nav-pill-count">{safeBorrowers.length}</span>
        </button>

        <button 
          onClick={() => setActiveTab('workflow')}
          className={`nav-pill-btn ${activeTab === 'loans' ? 'active' : ''}`}
        >
          <FileText size={16} /> Mikopo na Marejesho
        </button>

        <button 
          onClick={() => setActiveTab('crb')}
          className={`nav-pill-btn ${activeTab === 'crb' ? 'active' : ''}`}
        >
          <ShieldAlert size={16} /> ⚡ eKYC, Vitambulisho & CRB
        </button>

        <button 
          onClick={() => setActiveTab('collateral')}
          className={`nav-pill-btn ${activeTab === 'collateral' ? 'active' : ''}`}
        >
          <ShieldCheck size={16} /> Bima & Dhamana <span className="nav-pill-count">{collateralAlerts.total_alerts_count || 0}</span>
        </button>

        {currentUser?.role === 'SUPER_ADMIN' && (
          <button 
            onClick={() => setShowNextSMSModal(true)}
            className="nav-pill-btn"
            style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', fontWeight: '800' }}
          >
            <Sparkles size={16} color="#059669" /> 📱 NextSMS Gateway
          </button>
        )}

        <button 
          onClick={() => setShowCalculatorModal(true)}
          className="nav-pill-btn"
          style={{ background: '#FEF3C7', border: '1px solid #FCD34D', color: '#B8860B', fontWeight: '900' }}
        >
          <Calculator size={16} color="#B8860B" /> 🧮 Kikokotoo cha Mkopo
        </button>

        <button 
          onClick={() => setShowJobBoardModal(true)}
          className="nav-pill-btn"
          style={{ background: '#EFF6FF', border: '1px solid #93C5FD', color: '#1E40AF', fontWeight: '800' }}
        >
          <Briefcase size={16} color="#1E40AF" /> 👔 Omba Kazi (Job Portal)
        </button>

        {currentUser?.role === 'SUPER_ADMIN' && (
          <button 
            onClick={() => setShowHRRecruitmentModal(true)}
            className="nav-pill-btn"
            style={{ background: '#F3E8FF', border: '1px solid #D8B4FE', color: '#6B21A8', fontWeight: '900' }}
          >
            <Users size={16} color="#6B21A8" /> 👔 HR Recruitment & ATS ({applications.length})
          </button>
        )}

        {currentUser?.role === 'SUPER_ADMIN' && (
          <button 
            onClick={() => setActiveTab('bot_tra')}
            className={`nav-pill-btn ${activeTab === 'bot_tra' ? 'active' : ''}`}
            style={{ background: activeTab === 'bot_tra' ? '#0F172A' : '#F8FAFC', color: activeTab === 'bot_tra' ? '#D4AF37' : '#0F172A', fontWeight: '800', border: '1px solid #CBD5E1' }}
          >
            <Building2 size={16} color={activeTab === 'bot_tra' ? '#D4AF37' : '#0F172A'} /> 🏛️ Ripoti za BOT & TRA
          </button>
        )}

        {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'BRANCH_MANAGER') && (
          <button 
            onClick={() => setActiveTab('pnl')}
            className={`nav-pill-btn ${activeTab === 'pnl' ? 'active' : ''}`}
          >
            <PieChart size={16} /> Taarifa za Fedha (TSH)
          </button>
        )}

        {currentUser?.role === 'SUPER_ADMIN' && (
          <button 
            onClick={() => setActiveTab('branches')}
            className={`nav-pill-btn ${activeTab === 'branches' ? 'active' : ''}`}
          >
            <Sliders size={16} /> Usimamizi wa Vikundi & Matawi
          </button>
        )}
      </nav>
      )}

      {/* 4. MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '1.75rem 2rem', maxWidth: '1600px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '1rem', color: '#64748B' }}>
            <RefreshCw size={36} className="spin" color="#D4AF37" />
            <p style={{ fontWeight: '600' }}>Inapakia Mfumo wa FKF Micro-Credit Tanzania...</p>
          </div>
        ) : currentUser?.role === 'BORROWER' ? (
          <BorrowerPortalHub 
            currentUser={currentUser} 
            loans={safeLoans} 
            borrowers={safeBorrowers} 
            branches={safeBranches} 
            onApplyLoan={handleCreateLoan} 
            onOpenCalculator={() => setShowCalculatorModal(true)} 
            onRenewLoan={handleRenewLoan}
          />
        ) : (
          <>
            {/* HERO WELCOME BANNER (EXACTLY MATCHING LAPTOP PHOTO) */}
            {activeTab === 'dashboard' && (
              <>
                <div className="hero-welcome-card">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: '700px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #D4AF37', color: '#D4AF37', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '800', width: 'fit-content', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {getDashboardTitle().toUpperCase()}
                    </div>
                    
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
                      Karibu, {fullName} wa FKF Micro-Credit 👋
                    </h2>
                    
                    <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: '1.5' }}>
                      Tathmini ya kiufundi ya Umoja wa Micro-Credit na Taasisi za Fedha za Mikoa ya Dar es Salaam, Arusha, Mwanza, Dodoma na Mbeya. Fuatilia usajili, mikopo, na makusanyo ya fedha.
                    </p>
                  </div>

                  {/* Right Actions inside Hero Card (Matching Photo) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button onClick={() => setActiveTab('workflow')} className="btn-primary" style={{ padding: '0.7rem 1.25rem', fontSize: '0.85rem' }}>
                      ⚡ Uhakiki wa Usajili ({pendingApprovalsCount})
                    </button>
                    <button onClick={() => setActiveTab('pnl')} className="btn-secondary" style={{ padding: '0.7rem 1.25rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                      📊 Ripoti ya P&L TSH
                    </button>
                  </div>
                </div>

                {/* STAT SUMMARY CARDS GRID (EXACTLY MATCHING LAPTOP PHOTO) */}
                <div className="stat-summary-grid">
                  
                  {/* Card 1: WAKOPAJI WALIO-ACTIVE */}
                  <div className="stat-card-white">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        WAKOPAJI WALIO-ACTIVE
                      </span>
                      <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F172A' }}>
                        {safeBorrowers.length}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckCheck size={14} /> Iliyoingizwa NIDA
                      </span>
                    </div>
                    <div className="stat-icon-circle" style={{ background: '#E6FFFA', color: '#0D9488' }}>
                      <Users size={24} />
                    </div>
                  </div>

                  {/* Card 2: MIKOPO YENYE REJESHO */}
                  <div className="stat-card-white">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        MIKOPO YENYE REJESHO
                      </span>
                      <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F172A' }}>
                        {activeDisbursedCount}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#0284C7', fontWeight: '600' }}>
                        Mikopo Hai Tanzania TSH
                      </span>
                    </div>
                    <div className="stat-icon-circle" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                      <FileText size={24} />
                    </div>
                  </div>

                  {/* Card 3: MAKUSANYO YA BENKI & SIMU */}
                  <div className="stat-card-white">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        MAKUSANYO YA BENKI & SIMU
                      </span>
                      <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#B8860B' }}>
                        TZS {totalCollectionsTSH.toLocaleString()}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>
                        Vodacom M-Pesa & Selcom API
                      </span>
                    </div>
                    <div className="stat-icon-circle" style={{ background: '#FEF3C7', color: '#B8860B' }}>
                      <Wallet size={24} />
                    </div>
                  </div>

                  {/* Card 4: MAOMBI ZINAZOSUBIRI */}
                  <div className="stat-card-white">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        MAOMBI ZINAZOSUBIRI
                      </span>
                      <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0F172A' }}>
                        {pendingApprovalsCount}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: '600' }}>
                        Zinazosubiri uidhinishaji
                      </span>
                    </div>
                    <div className="stat-icon-circle" style={{ background: '#F3E8FF', color: '#7C3AED' }}>
                      <CheckCircle2 size={24} />
                    </div>
                  </div>

                </div>

                {/* EXECUTIVE P&L & WORKFLOW DASHBOARD PREVIEW */}
                {pnlData && (
                  <ProfitLossReport pnlData={pnlData} onFilterChange={(f) => fetchAllData()} />
                )}
              </>
            )}

            {/* WORKFLOW ENGINE TAB */}
            {activeTab === 'workflow' && (
              <BranchWorkflowEngine 
                currentUser={currentUser}
                branches={safeBranches}
                borrowers={safeBorrowers}
                loans={safeLoans}
                loanProducts={loanProducts}
                onRefresh={fetchAllData}
                onCreateBorrower={handleCreateBorrower}
                onUpdateBorrower={handleUpdateBorrower}
                onDeleteBorrower={handleDeleteBorrower}
                onCreateLoan={handleCreateLoan}
                onEditLoan={handleEditLoan}
                onDeleteLoan={handleDeleteLoan}
                onRenewLoan={handleRenewLoan}
                onApproveLoan={handleApproveLoan}
                onBranchApproveLoan={handleBranchApproveLoan}
                onBranchRejectLoan={handleBranchRejectLoan}
                onRiskPassLoan={handleRiskPassLoan}
                onRiskFailLoan={handleRiskFailLoan}
                onDisburseLoan={handleDisburseLoan}
                onRecordRepayment={handleRecordRepayment}
                onFlagDefault={handleFlagDefault}
                onVerifyKyc={(b) => setSelectedKycBorrower(b)}
              />
            )}

            {/* PNL TAB */}
            {activeTab === 'pnl' && pnlData && (
              <ProfitLossReport pnlData={pnlData} onFilterChange={(f) => fetchAllData()} />
            )}

            {/* SUPER ADMIN BRANCHES & STAFF MANAGEMENT TAB */}
            {activeTab === 'branches' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A' }}>Usimamizi wa Matawi ya Tanzania & Wafanyakazi</h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Sajili matawi mapya, futa tawi, panga maeneo (Mkoa, Wilaya, Kata, Mtaa), ongeza Wafanyakazi, Loan Products, Reset Passcode & Transfer Branch</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setShowLocationModal(true)} className="btn-secondary" style={{ padding: '0.65rem 1.1rem', fontSize: '0.82rem', background: '#E0F2FE', color: '#0284C7', border: '1px solid #7DD3FC' }}>
                      <MapPin size={16} /> 📍 Locations Management
                    </button>
                    <button onClick={() => setShowNewBranchModal(true)} className="btn-primary" style={{ padding: '0.65rem 1.1rem', fontSize: '0.82rem' }}>
                      <Building2 size={16} /> + Sajili Tawi Jipya
                    </button>
                    <button onClick={() => setShowLoanProductsManagerModal(true)} className="btn-secondary" style={{ padding: '0.65rem 1.1rem', fontSize: '0.82rem', background: '#ECFDF5', color: '#047857', border: '1px solid #6EE7B7' }}>
                      <Package size={16} /> 📦 Manage Loan Product ({loanProducts.length})
                    </button>
                    <button onClick={() => setShowAddStaffModal(true)} className="btn-secondary" style={{ padding: '0.65rem 1.1rem', fontSize: '0.82rem', background: '#1E293B', color: '#D4AF37', border: '1px solid #D4AF37' }}>
                      <UserPlus size={16} /> + Add Staff
                    </button>
                    <button onClick={() => setShowResetCodeModal(true)} className="btn-secondary" style={{ padding: '0.65rem 1.1rem', fontSize: '0.82rem', background: '#FEF3C7', color: '#B8860B', border: '1px solid #FCD34D' }}>
                      <KeyRound size={16} /> 🔑 Reset Code
                    </button>
                    <button onClick={() => setShowTransferModal(true)} className="btn-secondary" style={{ padding: '0.65rem 1.1rem', fontSize: '0.82rem', background: '#F3E8FF', color: '#7C3AED', border: '1px solid #DDD6FE' }}>
                      <ArrowRightLeft size={16} /> 🔄 Transfer Branch & Roles
                    </button>
                    <button onClick={() => setShowCapitalManagerModal(true)} className="btn-secondary" style={{ padding: '0.65rem 1.1rem', fontSize: '0.82rem', background: '#FFFBEB', color: '#B8860B', border: '1px solid #FDE68A', fontWeight: '900' }}>
                      <Wallet size={16} /> 💼 Usimamizi wa Mtaji (Capital Treasury)
                    </button>
                    <button onClick={() => setShowPayrollModal(true)} className="btn-secondary" style={{ padding: '0.65rem 1.1rem', fontSize: '0.82rem', background: '#ECFDF5', color: '#047857', border: '1px solid #6EE7B7', fontWeight: '900' }}>
                      <DollarSign size={16} /> 💵 Mishahara & Posho (Payroll)
                    </button>
                    <button onClick={() => setShowAuditModal(true)} className="btn-secondary" style={{ padding: '0.65rem 1.1rem', fontSize: '0.82rem', background: '#F3E8FF', color: '#7C3AED', border: '1px solid #DDD6FE', fontWeight: '900' }}>
                      <FileSearch size={16} /> 🔍 Ukaguzi wa Mahesabu (Internal & External Audit)
                    </button>
                  </div>
                </div>

                {/* Branches Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                  {safeBranches.map(b => {
                    const branchStaff = safeStaff.filter(u => u.branch === b.id || (u.branch_detail && u.branch_detail.id === b.id));
                    return (
                      <div key={b.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div>
                              <h3 style={{ color: '#0F172A', fontSize: '1.15rem', fontWeight: '800' }}>{b.name}</h3>
                              <span style={{ fontSize: '0.75rem', color: '#B8860B', fontWeight: '800' }}>{b.code}</span>
                            </div>
                            <span className={`badge ${b.is_active ? 'badge-success' : 'badge-danger'}`}>
                              {b.is_active ? 'Linafanya Kazi' : 'Limesimamishwa'}
                            </span>
                          </div>

                          {/* Location Hierarchy Badges */}
                          <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '1rem', fontSize: '0.78rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0284C7', fontWeight: '800', marginBottom: '0.35rem' }}>
                              <MapPin size={14} /> Location ya Tanzania:
                            </div>
                            <div style={{ color: '#334155', lineHeight: '1.4' }}>
                              <strong>Mkoa:</strong> {b.region || 'Tanzania'} | <strong>Wilaya:</strong> {b.district || 'CBD'} | <strong>Kata:</strong> {b.ward || 'Central'}
                              <br />
                              <span style={{ color: '#64748B' }}>Mtaa/Kijiji: {b.street_or_village || b.location}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem', color: '#64748B' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Ukomo wa Mkopo (Cap):</span>
                              <strong style={{ color: '#059669' }}>TSH {parseFloat(b.max_loan_amount || 0).toLocaleString()}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Riba ya Tawi:</span>
                              <strong style={{ color: '#0F172A' }}>{b.interest_rate_pct}%</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Faini ya Chelezo:</span>
                              <strong style={{ color: '#D97706' }}>{b.penalty_type} ({b.penalty_value})</strong>
                            </div>
                          </div>

                          {/* Branch Capital Treasury Summary Block */}
                          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.65rem 0.85rem', borderRadius: '10px', marginTop: '0.6rem', fontSize: '0.78rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                              <span style={{ color: '#B8860B', fontWeight: '700' }}>Mtaji wa Tawi (Capital):</span>
                              <strong style={{ color: '#0F172A' }}>TSH {parseFloat(b.allocated_capital || 50000000).toLocaleString()}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                              <span style={{ color: '#64748B' }}>Zilizokopeshwa (Lent Out):</span>
                              <strong style={{ color: '#059669' }}>TSH {parseFloat(b.total_lent_out || b.active_portfolio || 0).toLocaleString()}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #FCD34D', paddingTop: '0.2rem' }}>
                              <span style={{ color: '#0F172A', fontWeight: '800' }}>Salio Kilichobaki (Remaining):</span>
                              <strong style={{ color: '#0284C7', fontWeight: '900' }}>TSH {parseFloat(b.remaining_capital || (parseFloat(b.allocated_capital || 50000000) - parseFloat(b.total_lent_out || 0))).toLocaleString()}</strong>
                            </div>
                          </div>

                          {/* Staff Assigned to this branch */}
                          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed #E2E8F0' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
                              <Users size={14} /> Wafanyakazi Wasiopungua ({branchStaff.length}):
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                              {branchStaff.length > 0 ? (
                                branchStaff.map(st => (
                                  <span key={st.id} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', color: '#0F172A', fontWeight: '600' }}>
                                    {st.first_name} ({st.role_display})
                                  </span>
                                ))
                              ) : (
                                <span style={{ fontSize: '0.72rem', color: '#94A3B8', italic: 'true' }}>Hakuna mfanyakazi aliyepangwa bado</span>
                              )}
                            </div>
                          </div>

                        </div>

                        {/* Action Buttons: Edit Rules & Delete Branch */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <button onClick={() => setEditingBranch(b)} className="btn-secondary" style={{ justifyContent: 'center', fontSize: '0.8rem' }}>
                            <Sliders size={16} /> Badili Masharti
                          </button>
                          <button 
                            onClick={() => handleDeleteBranch(b.id, b.name)} 
                            style={{ background: '#FFF1F2', border: '1px solid #FECDD3', color: '#E11D48', padding: '0.5rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            title="Futa Tawi Hili"
                          >
                            <Trash2 size={16} /> Futa Tawi
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Staff Members Table */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', marginTop: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      <Users size={20} color="#0284C7" /> Orodha ya Wafanyakazi Wote na Wafanyabiashara ({safeStaff.length})
                    </h3>
                    <button onClick={() => setShowAddStaffModal(true)} className="btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
                      <UserPlus size={14} /> + Add New Staff
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Passport</th>
                          <th>Jina la Mtumishi</th>
                          <th>Username</th>
                          <th>Wadhifa / Role</th>
                          <th>Tawi</th>
                          <th>Namba ya Simu</th>
                          <th>Vitendo (Actions)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {safeStaff.map(st => (
                          <tr key={st.id}>
                            <td>
                              {st.passport_photo ? (
                                <img src={st.passport_photo} alt={st.username} style={{ width: '40px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #D4AF37' }} />
                              ) : (
                                <div style={{ width: '40px', height: '45px', borderRadius: '6px', background: '#F1F5F9', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.65rem' }}>No Photo</div>
                              )}
                            </td>
                            <td style={{ fontWeight: '800', color: '#0F172A' }}>{st.first_name} {st.last_name}</td>
                            <td style={{ color: '#0284C7', fontWeight: '700' }}>@{st.username}</td>
                            <td>
                              <span className="badge badge-info">{st.role_display || st.role}</span>
                            </td>
                            <td style={{ color: '#334155', fontWeight: '600' }}>{st.branch_detail?.name || 'Head Office'}</td>
                            <td style={{ color: '#059669', fontWeight: '700' }}>{st.phone_number || '-'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <button onClick={() => setSelectedStaffIdCard(st)} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #93C5FD' }} title="Tazama Kitambulisho chenye QR Code">
                                  🪪 Kitambulisho (ID)
                                </button>
                                <button onClick={() => setEditingStaffUser(st)} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#FEF3C7', color: '#B8860B', border: '1px solid #FCD34D' }}>
                                  <Edit3 size={12} /> Edit
                                </button>
                                <button onClick={() => handleDeleteStaff(st.id, st.username)} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5' }}>
                                  <Trash2 size={12} /> Delete
                                </button>
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

            {/* BOT & TRA TAB */}
            {activeTab === 'bot_tra' && (
              <BotTraReportsHub 
                branches={safeBranches} 
                currentUser={currentUser} 
              />
            )}

            {/* COLLATERAL TAB */}
            {activeTab === 'collateral' && (
              <CollateralManager 
                collaterals={safeCollaterals} 
                alerts={collateralAlerts}
                loans={safeLoans}
                onAddCollateral={handleAddCollateral}
              />
            )}

            {/* CRB TAB */}
            {activeTab === 'crb' && (
              <CrbIntegrationHub 
                borrowers={safeBorrowers} 
                crbHistory={crbHistory}
                onRunCheck={handleRunCRBCheck}
                onVerifyKyc={handleVerifyKyc}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {showLocationModal && (
        <LocationManagementModal
          onClose={() => setShowLocationModal(false)}
          onLocationsUpdated={() => fetchAllData()}
        />
      )}

      {showAddLoanProductModal && (
        <AddLoanProductModal
          branches={safeBranches}
          onClose={() => setShowAddLoanProductModal(false)}
          onSubmit={handleCreateLoanProduct}
        />
      )}

      {showNewBranchModal && (
        <NewBranchModal 
          onClose={() => setShowNewBranchModal(false)}
          onSubmit={handleCreateBranch}
        />
      )}

      {showAddStaffModal && (
        <AddStaffModal 
          branches={safeBranches}
          onClose={() => setShowAddStaffModal(false)}
          onSubmit={handleCreateStaff}
        />
      )}

      {editingStaffUser && (
        <EditStaffModal
          staffUser={editingStaffUser}
          branches={safeBranches}
          onClose={() => setEditingStaffUser(null)}
          onSave={handleEditStaff}
        />
      )}

      {showResetCodeModal && (
        <ResetCodeModal
          staffList={safeStaff}
          borrowers={safeBorrowers}
          onClose={() => setShowResetCodeModal(false)}
          onResetPassword={handleResetPassword}
        />
      )}

      {showTransferModal && (
        <TransferModal
          staffList={safeStaff}
          borrowers={safeBorrowers}
          branches={safeBranches}
          onClose={() => setShowTransferModal(false)}
          onTransferStaff={handleTransferStaff}
          onTransferBorrower={handleTransferBorrower}
        />
      )}

      {selectedKycBorrower && (
        <KycVerificationModal
          borrower={selectedKycBorrower}
          onClose={() => setSelectedKycBorrower(null)}
          onVerify={handleVerifyKyc}
        />
      )}

      {editingBranch && (
        <BranchSettingsModal 
          branch={editingBranch} 
          onClose={() => setEditingBranch(null)} 
          onSave={handleUpdateBranchRules} 
        />
      )}

      {showLoanModal && (
        <LoanApplicationModal 
          borrowers={safeBorrowers} 
          branches={safeBranches} 
          loanProducts={loanProducts}
          onClose={() => setShowLoanModal(false)} 
          onSubmit={handleCreateLoan} 
        />
      )}

      {showNextSMSModal && (
        <NextSMSGatewayModal 
          borrowers={safeBorrowers} 
          loans={safeLoans} 
          onClose={() => setShowNextSMSModal(false)} 
        />
      )}

      {showCalculatorModal && (
        <LoanCalculatorModal 
          onClose={() => setShowCalculatorModal(false)} 
        />
      )}

      {showLoanProductsManagerModal && (
        <LoanProductsManagerModal
          loanProducts={loanProducts}
          branches={safeBranches}
          currentUser={currentUser}
          userBranchId={typeof selectedBranchFilter === 'object' ? selectedBranchFilter?.id : selectedBranchFilter}
          onClose={() => setShowLoanProductsManagerModal(false)}
          onOpenAddModal={() => {
            setShowLoanProductsManagerModal(false);
            setShowAddLoanProductModal(true);
          }}
          onEditProduct={handleEditLoanProduct}
          onDeleteProduct={handleDeleteLoanProduct}
        />
      )}

      {showCapitalManagerModal && (
        <BranchCapitalManagerModal
          branches={safeBranches}
          currentUser={currentUser}
          onClose={() => setShowCapitalManagerModal(false)}
          onCapitalUpdated={fetchAllData}
        />
      )}

      {showPayrollModal && (
        <PayrollManagerModal
          staffList={staffUsers}
          branches={safeBranches}
          currentUser={currentUser}
          onClose={() => setShowPayrollModal(false)}
          onStaffUpdated={fetchAllData}
        />
      )}

      {showAuditModal && (
        <InternalExternalAuditModal
          branches={safeBranches}
          loans={loans}
          borrowers={borrowers}
          currentUser={currentUser}
          onClose={() => setShowAuditModal(false)}
        />
      )}

      {showJobBoardModal && (
        <PublicJobBoardModal
          vacancies={vacancies}
          branches={safeBranches}
          onClose={() => setShowJobBoardModal(false)}
          onSubmitApplication={handleSubmitJobApplication}
        />
      )}

      {showHRRecruitmentModal && (
        <HRRecruitmentModal
          vacancies={vacancies}
          applications={applications}
          branches={safeBranches}
          onClose={() => setShowHRRecruitmentModal(false)}
          onCreateVacancy={handleCreateVacancy}
          onUpdateVacancy={handleUpdateVacancy}
          onDeleteVacancy={handleDeleteVacancy}
          onDeleteJobApp={handleDeleteJobApp}
          onUpdateAppStatus={handleUpdateJobAppStatus}
          onScheduleInterview={handleScheduleInterview}
          onConvertToEmployee={handleConvertCandidateToEmployee}
        />
      )}

      {selectedStaffIdCard && (
        <StaffIdCardModal
          staff={selectedStaffIdCard}
          onClose={() => setSelectedStaffIdCard(null)}
        />
      )}
    </div>
  );
}

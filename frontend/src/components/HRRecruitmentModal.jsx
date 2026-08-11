import React, { useState } from 'react';
import { 
  Users, Briefcase, Plus, Search, Filter, CheckCircle2, XCircle, Clock, 
  Calendar, Phone, Mail, FileText, Download, Award, ShieldCheck, Printer,
  UserCheck, Sparkles, Send, Eye, X, Edit3, Trash2, Building, GraduationCap, ChevronRight
} from 'lucide-react';
import CompanyHeaderBlock from './CompanyHeaderBlock';

export default function HRRecruitmentModal({ 
  vacancies = [], 
  applications = [], 
  branches = [], 
  onClose, 
  onCreateVacancy,
  onUpdateVacancy,
  onDeleteVacancy,
  onDeleteJobApp,
  onUpdateAppStatus, 
  onScheduleInterview, 
  onConvertToEmployee 
}) {
  const [activeTab, setActiveTab] = useState('PIPELINE'); // 'PIPELINE' | 'VACANCIES'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Candidate for Deep View / Action Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);

  // New Vacancy Form Modal State
  const [showNewVacancyModal, setShowNewVacancyModal] = useState(false);
  const [vTitle, setVTitle] = useState('Afisa Mikopo (Loan Officer)');
  const [vCode, setVCode] = useState(`VAC-2026-${Math.floor(Math.random()*900+100)}`);
  const [vGrade, setVGrade] = useState('Grade 1');
  const [vDept, setVDept] = useState('Operations');
  const [vBranchId, setVBranchId] = useState(branches[0]?.id || '');
  const [vEmpType, setVEmpType] = useState('FULL_TIME');
  const [vDeadline, setVDeadline] = useState('2026-08-30');
  const [vFlyer, setVFlyer] = useState('');
  const [vDesc, setVDesc] = useState('Usimamizi wa usajili wa wakopaji, uhakiki wa dhamana na ufuatiliaji wa marejesho.');

  // Interview Schedule Form State
  const [interviewDate, setInterviewDate] = useState('2026-08-20 10:00 AM');
  const [interviewVenue, setInterviewVenue] = useState('Ofisi Kuu ya FKF Micro-Credit / Google Meet');

  // Convert to Employee Form State
  const [empRole, setEmpRole] = useState('LOAN_OFFICER');
  const [empSalary, setEmpSalary] = useState('800000');
  const [empBranchId, setEmpBranchId] = useState(branches[0]?.id || '');

  // Filtered Applications
  const filteredApps = applications.filter(app => {
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      app.full_name?.toLowerCase().includes(q) || 
      app.phone?.includes(q) || 
      app.application_no?.toLowerCase().includes(q) ||
      app.job_title?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // HR Stats calculations
  const totalApps = applications.length;
  const newApps = applications.filter(a => a.status === 'SUBMITTED').length;
  const shortlistedCount = applications.filter(a => a.status === 'SHORTLISTED').length;
  const interviewCount = applications.filter(a => a.status === 'INTERVIEW').length;
  const selectedCount = applications.filter(a => a.status === 'SELECTED' || a.status === 'JOB_OFFER').length;
  const hiredCount = applications.filter(a => a.status === 'HIRED').length;
  const rejectedCount = applications.filter(a => a.status === 'REJECTED').length;

  const handleFlyerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVFlyer(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateVacancySubmit = (e) => {
    e.preventDefault();
    onCreateVacancy({
      job_code: vCode,
      title: vTitle,
      job_grade: vGrade,
      department: vDept,
      branch: vBranchId || null,
      employment_type: vEmpType,
      deadline: vDeadline,
      description: vDesc,
      flyer_attachment: vFlyer,
      status: 'OPEN'
    });
    setShowNewVacancyModal(false);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    await onScheduleInterview(selectedApp.id, {
      interview_date: interviewDate,
      interview_venue: interviewVenue
    });
    setShowInterviewModal(false);
  };

  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    await onConvertToEmployee(selectedApp.id, {
      role: empRole,
      basic_salary: parseFloat(empSalary || 800000),
      branch_id: empBranchId
    });
    setShowConvertModal(false);
  };

  const handlePrintOffer = () => {
    window.print();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '1150px', maxHeight: '92vh', overflowY: 'auto', border: '2px solid #0F172A', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', color: '#0F172A' }}>
        
        {/* Header Strip */}
        <div style={{ background: '#0F172A', color: '#FFFFFF', padding: '1.25rem 1.75rem', borderRadius: '20px 20px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#059669', padding: '0.55rem', borderRadius: '12px', display: 'flex' }}>
              <Users size={24} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                👔 HR RECRUITMENT & APPLICANT TRACKING SYSTEM (ATS)
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Usimamizi wa Maombi ya Kazi, Usaili, Job Offer Letters na Usajili wa Wafanyakazi Wapya FKF
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* HR STATS DASHBOARD SUMMARY CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.9rem' }}>
            <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B' }}>TOTAL MAOMBI</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A' }}>{totalApps}</div>
            </div>

            <div style={{ background: '#EFF6FF', padding: '0.85rem', borderRadius: '14px', border: '1px solid #93C5FD', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#1E40AF' }}>MAOMBI MAPYA</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1D4ED8' }}>{newApps}</div>
            </div>

            <div style={{ background: '#FEF3C7', padding: '0.85rem', borderRadius: '14px', border: '1px solid #FCD34D', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#92400E' }}>SHORTLISTED</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#B8860B' }}>{shortlistedCount}</div>
            </div>

            <div style={{ background: '#F3E8FF', padding: '0.85rem', borderRadius: '14px', border: '1px solid #D8B4FE', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#6B21A8' }}>USAILI (INTERVIEW)</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#7E22CE' }}>{interviewCount}</div>
            </div>

            <div style={{ background: '#ECFDF5', padding: '0.85rem', borderRadius: '14px', border: '1px solid #6EE7B7', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#047857' }}>SELECTED / OFFER</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#059669' }}>{selectedCount}</div>
            </div>

            <div style={{ background: '#F0FDF4', padding: '0.85rem', borderRadius: '14px', border: '2px solid #16A34A', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#15803D' }}>AMEAJIRIWA (HIRED)</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#166534' }}>{hiredCount}</div>
            </div>

            <div style={{ background: '#FEF2F2', padding: '0.85rem', borderRadius: '14px', border: '1px solid #FCA5A5', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#991B1B' }}>REJECTED</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#DC2626' }}>{rejectedCount}</div>
            </div>
          </div>

          {/* MAIN TABS: PIPELINE vs VACANCIES */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E2E8F0', pb: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => setActiveTab('PIPELINE')}
                style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', background: activeTab === 'PIPELINE' ? '#0F172A' : '#F1F5F9', color: activeTab === 'PIPELINE' ? '#FFFFFF' : '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Users size={16} /> Pipeline ya Waombaji ({applications.length})
              </button>

              <button 
                onClick={() => setActiveTab('VACANCIES')}
                style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', background: activeTab === 'VACANCIES' ? '#0F172A' : '#F1F5F9', color: activeTab === 'VACANCIES' ? '#FFFFFF' : '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Briefcase size={16} /> Nafasi za Kazi Zilizotangazwa ({vacancies.length})
              </button>
            </div>

            {activeTab === 'VACANCIES' && (
              <button onClick={() => setShowNewVacancyModal(true)} className="btn-primary" style={{ padding: '0.55rem 1.2rem', background: '#059669', fontSize: '0.85rem' }}>
                <Plus size={16} /> Tangaza Nafasi Mpya (New Vacancy)
              </button>
            )}
          </div>

          {/* TAB 1: PIPELINE PIPELINE TRACKING & KANBAN TABLE */}
          {activeTab === 'PIPELINE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              {/* Filter Strip & Search Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#F8FAFC', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                
                {/* Search Bar */}
                <div style={{ position: 'relative', width: '280px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tafuta Jina, Simu, NIDA au Nafasi..."
                    style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', background: '#FFFFFF' }}
                  />
                </div>

                {/* Status Pills */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'ALL', label: 'Zote' },
                    { id: 'SUBMITTED', label: 'Mapya' },
                    { id: 'UNDER_REVIEW', label: 'Under Review' },
                    { id: 'SHORTLISTED', label: 'Shortlisted' },
                    { id: 'INTERVIEW', label: 'Usaili (Interview)' },
                    { id: 'SELECTED', label: 'Selected' },
                    { id: 'JOB_OFFER', label: 'Job Offer' },
                    { id: 'HIRED', label: 'Hired (Wafanyakazi)' },
                    { id: 'REJECTED', label: 'Rejected' },
                  ].map(st => (
                    <button 
                      key={st.id}
                      onClick={() => setStatusFilter(st.id)}
                      style={{ padding: '0.4rem 0.75rem', borderRadius: '9999px', border: '1px solid #CBD5E1', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', background: statusFilter === st.id ? '#059669' : '#FFFFFF', color: statusFilter === st.id ? '#FFFFFF' : '#475569' }}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

              </div>

              {/* Applications Table */}
              <div style={{ overflowX: 'auto', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', fontSize: '0.72rem', color: '#64748B', textAlign: 'left' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Ombi ID & Mwombaji</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Nafasi & Tawi</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Elimu & Uzoefu</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Hali ya Ombi (Status)</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Tarehe</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Hatua za HR (Actions)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                          Hakuna maombi ya kazi yanayoendana na vigezo ulivyochagua.
                        </td>
                      </tr>
                    ) : filteredApps.map(app => (
                      <tr key={app.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: '800', color: '#0F172A' }}>{app.full_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#0284C7' }}>{app.application_no} • Simu: {app.phone}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>NIDA: {app.nida_number || 'N/A'}</div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: '800', color: '#059669' }}>{app.job_title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Idara: {app.department} • {app.branch_name}</div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: '700', color: '#0F172A' }}>{app.education_level} ({app.course_name || 'N/A'})</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{app.previous_company ? `${app.previous_role} @ ${app.previous_company}` : 'Hakuna Uzoefu Wa Awali'}</div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span className={`badge ${app.status === 'HIRED' ? 'badge-success' : app.status === 'REJECTED' ? 'badge-danger' : app.status === 'INTERVIEW' ? 'badge-warning' : 'badge-info'}`}>
                            {app.status_display || app.status}
                          </span>
                          {app.interview_date && (
                            <div style={{ fontSize: '0.72rem', color: '#7E22CE', marginTop: '0.2rem', fontWeight: '700' }}>
                              📅 Usaili: {app.interview_date}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: '#64748B' }}>
                          {new Date(app.created_at).toLocaleDateString()}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            
                            {/* View Full Application */}
                            <button onClick={() => setSelectedApp(app)} className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} title="Tazama Fomu Kamili">
                              <Eye size={13} /> Details
                            </button>

                            {/* Shortlist */}
                            {app.status === 'SUBMITTED' && (
                              <button onClick={() => onUpdateAppStatus(app.id, { status: 'SHORTLISTED', hr_notes: 'Shortlisted kwa usaili' })} className="btn-primary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: '#B8860B' }}>
                                Shortlist
                              </button>
                            )}

                            {/* Schedule Interview */}
                            {(app.status === 'SHORTLISTED' || app.status === 'SUBMITTED') && (
                              <button onClick={() => { setSelectedApp(app); setShowInterviewModal(true); }} className="btn-primary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: '#7E22CE' }}>
                                <Calendar size={13} /> Usaili (Interview)
                              </button>
                            )}

                            {/* Job Offer */}
                            {(app.status === 'INTERVIEW' || app.status === 'SHORTLISTED') && (
                              <button onClick={() => { setSelectedApp(app); setShowOfferModal(true); }} className="btn-primary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: '#0284C7' }}>
                                <FileText size={13} /> Job Offer
                              </button>
                            )}

                            {/* Convert to Staff */}
                            {app.status !== 'HIRED' && (
                              <button onClick={() => { setSelectedApp(app); setShowConvertModal(true); }} className="btn-primary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: '#059669' }}>
                                <UserCheck size={13} /> Sajili Mtumishi
                              </button>
                            )}

                            {/* Delete Application */}
                            <button onClick={() => onDeleteJobApp(app.id)} className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#DC2626', borderColor: '#FCA5A5' }} title="Futa Ombi Hili">
                              <Trash2 size={13} /> Futa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 2: VACANCIES MANAGEMENT */}
          {activeTab === 'VACANCIES' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {vacancies.map(vac => (
                <div key={vac.id} style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#FEF3C7', color: '#92400E', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                      {vac.job_code}
                    </span>
                    <span className="badge badge-success">
                      {vac.status}
                    </span>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>{vac.title}</h4>
                    <div style={{ fontSize: '0.78rem', color: '#0284C7', fontWeight: '700' }}>Idara: {vac.department} • Grade: {vac.job_grade}</div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div>📍 Tawi: {vac.branch_name || 'Dar es Salaam HQ'}</div>
                    <div>👥 Waombaji Walioomba: <strong style={{ color: '#059669' }}>{vac.applications_count || 0} candidates</strong></div>
                  </div>

                  {vac.flyer_attachment && (
                    <div style={{ marginTop: '0.2rem' }}>
                      {vac.flyer_attachment.startsWith('data:image') || (vac.flyer_attachment.startsWith('http') && !vac.flyer_attachment.endsWith('.pdf')) ? (
                        <img src={vac.flyer_attachment} alt="Job Advert Poster" style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #CBD5E1' }} />
                      ) : (
                        <a href={vac.flyer_attachment} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #93C5FD', fontSize: '0.75rem', fontWeight: '800', color: '#1D4ED8', textDecoration: 'none' }}>
                          📄 Poster/Flyer ya Tangazo (PDF/Image)
                        </a>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', pt: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
                    <button onClick={() => onDeleteVacancy(vac.id)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem', color: '#DC2626', borderColor: '#FCA5A5' }}>
                      <Trash2 size={14} /> Futa Tangazo (Delete)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* MODAL 1: NEW VACANCY POSTING FORM */}
      {showNewVacancyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '600px', border: '1px solid #CBD5E1', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', pb: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>📢 Tangaza Nafasi Mpya ya Kazi (Job Vacancy)</h3>
              <button onClick={() => setShowNewVacancyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateVacancySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700' }}>Job Title: *</label>
                  <input type="text" required value={vTitle} onChange={(e) => setVTitle(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '700' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700' }}>Job Code: *</label>
                  <input type="text" required value={vCode} onChange={(e) => setVCode(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '800', color: '#0284C7' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700' }}>Idara (Department):</label>
                  <select value={vDept} onChange={(e) => setVDept(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}>
                    <option value="Operations">Operations / Mikopo</option>
                    <option value="Finance">Finance & Accounting</option>
                    <option value="Risk & Compliance">Risk & Compliance</option>
                    <option value="IT">IT & Systems</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700' }}>Tawi (Branch Location):</label>
                  <select value={vBranchId} onChange={(e) => setVBranchId(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700' }}>🖼️ Pakia Bango/Poster lililodesigniwa la Tangazo la Kazi (JPG / PNG / PDF):</label>
                  <input 
                    type="file" 
                    accept="image/*,.pdf" 
                    onChange={handleFlyerUpload} 
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', background: '#F8FAFC' }} 
                  />
                  {vFlyer && (
                    <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#059669', fontWeight: '800' }}>
                      ✓ Bango/Poster la Tangazo Limepakiwa Kikamilifu!
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700' }}>Maelezo ya Kazi (Job Description):</label>
                <textarea rows={3} value={vDesc} onChange={(e) => setVDesc(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', pt: '0.5rem' }}>
                <button type="button" onClick={() => setShowNewVacancyModal(false)} className="btn-secondary" style={{ padding: '0.6rem 1.2rem' }}>Ghairi</button>
                <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem', background: '#059669' }}>Chapisha Vacancy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SCHEDULE INTERVIEW MODAL */}
      {showInterviewModal && selectedApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '520px', border: '1px solid #CBD5E1', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', pb: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#7E22CE', margin: 0 }}>📅 Ratibu Usaili (Schedule Interview)</h3>
              <button onClick={() => setShowInterviewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#F3E8FF', padding: '0.75rem', borderRadius: '10px', fontSize: '0.82rem', color: '#6B21A8', fontWeight: '700' }}>
                Mwombaji: {selectedApp.full_name} ({selectedApp.phone}) • Nafasi: {selectedApp.job_title}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700' }}>Tarehe na Muda wa Usaili: *</label>
                <input type="text" required value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} placeholder="2026-08-20 saa 4:00 Asubuhi" style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '700' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700' }}>Ukumbi au Google Meet Link: *</label>
                <input type="text" required value={interviewVenue} onChange={(e) => setInterviewVenue(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }} />
              </div>

              <div style={{ background: '#ECFDF5', padding: '0.65rem', borderRadius: '8px', fontSize: '0.75rem', color: '#047857', fontWeight: '700' }}>
                📱 Ujumbe wa mwaliko wa usaili utatumwa kiotomatiki kwa SMS kwenda kwa mwombaji via NextSMS Gateway!
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowInterviewModal(false)} className="btn-secondary" style={{ padding: '0.6rem 1.2rem' }}>Ghairi</button>
                <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem', background: '#7E22CE' }}>Tuma Mwaliko wa Usaili</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PRINTABLE JOB OFFER LETTER */}
      {showOfferModal && selectedApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', border: '2px solid #0F172A', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={handlePrintOffer} className="btn-primary" style={{ padding: '0.6rem 1.3rem', background: '#059669', fontSize: '0.85rem' }}>
                <Printer size={16} /> Print Job Offer Letter (PDF)
              </button>
              <button onClick={() => setShowOfferModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div id="printable-job-offer-letter" style={{ background: '#FFFFFF', padding: '1.5rem', border: '1px solid #CBD5E1', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.88rem' }}>
              
              <CompanyHeaderBlock 
                title="BARUA RASMI YA OFER YA AJIRA (JOB OFFER LETTER)" 
                subtitle={`Kumbukumbu Namba: FKF/HR/OFFER/2026/${String(selectedApp.id).padStart(3, '0')} | Tarehe: ${new Date().toLocaleDateString()}`}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div><strong>Kwa:</strong> {selectedApp.full_name}</div>
                <div><strong>Anuani:</strong> {selectedApp.address || 'Dar es Salaam, Tanzania'}</div>
                <div><strong>Simu:</strong> {selectedApp.phone} | <strong>NIDA:</strong> {selectedApp.nida_number || 'N/A'}</div>
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A', margin: 0, textDecoration: 'underline' }}>
                YAH: OFER YA AJIRA KATIKA NAFASI YA {selectedApp.job_title.toUpperCase()} ({selectedApp.department.toUpperCase()})
              </h4>

              <p style={{ margin: 0, lineHeight: '1.6' }}>
                Tunayofuraha kukufahamisha kwamba kufuatia ombi lako la kazi na usaili uliofanyika, Uongozi wa <strong>FKF MICRO-CREDIT</strong> umekuchagua kujiunga na taasisi yetu katika nafasi ya <strong>{selectedApp.job_title}</strong> katika Tawi la <strong>{selectedApp.branch_name}</strong>.
              </p>

              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>• <strong>Mshahara wa Msingi (Basic Salary):</strong> TZS {parseFloat(selectedApp.offered_salary || 800000).toLocaleString()} kwa mwezi.</div>
                <div>• <strong>Aina ya Ajira:</strong> {selectedApp.employment_type || 'Full Time'}</div>
                <div>• <strong>Mahali pa Kazi:</strong> FKF Micro-Credit, {selectedApp.branch_name}</div>
                <div>• <strong>Faida Nyingine:</strong> Bima ya Afya (NHIF 3%), Hifadhi ya Jamii (NSSF 10%), na Posho ya Kazi.</div>
              </div>

              <p style={{ margin: 0, lineHeight: '1.6' }}>
                Tafadhali thibitisha kukubali kwako kwa kutia saini barua hii na kuirudisha katika Idara ya Rasilimali Watu (HR) ndani ya siku saba (7).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '1.5rem', pt: '1rem', borderTop: '1px dashed #CBD5E1' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>Sahihi ya Mwombaji:</span>
                  <div style={{ height: '40px', borderBottom: '1px solid #0F172A', marginTop: '0.5rem' }}></div>
                  <span style={{ fontSize: '0.78rem', fontWeight: '800' }}>{selectedApp.full_name}</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700' }}>Saini ya Mkurugenzi Mkuu:</span>
                  <div style={{ height: '40px', borderBottom: '1px solid #0F172A', marginTop: '0.5rem' }}>
                    <img src="/md-signature.png" alt="MD Signature" style={{ height: '45px', objectFit: 'contain' }} />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: '800' }}>Mkurugenzi Mkuu (MD)</span>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '700', display: 'block', mb: '0.2rem' }}>Muhuri wa Kampuni:</span>
                  <img src="/company-stamp.jpg" alt="Company Stamp" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: 1-CLICK CONVERT CANDIDATE TO EMPLOYEE */}
      {showConvertModal && selectedApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '540px', border: '1px solid #CBD5E1', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', pb: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#059669', margin: 0 }}>👨‍💼 Sajili Mwombaji Huyu Kama Mtumishi Rasmi</h3>
              <button onClick={() => setShowConvertModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleConvertSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#ECFDF5', padding: '0.85rem', borderRadius: '12px', fontSize: '0.85rem', color: '#047857' }}>
                <div><strong>Mwombaji:</strong> {selectedApp.full_name} ({selectedApp.phone})</div>
                <div><strong>Nafasi ya Ombi:</strong> {selectedApp.job_title}</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700' }}>Cheo / Role Mfomoni: *</label>
                <select value={empRole} onChange={(e) => setEmpRole(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '700' }}>
                  <option value="LOAN_OFFICER">Afisa Mikopo (Loan Officer)</option>
                  <option value="BRANCH_MANAGER">Meneja wa Tawi (Branch Manager)</option>
                  <option value="RISK_OFFICER">Afisa Riski (Risk Officer)</option>
                  <option value="SUPER_ADMIN">IT / Super Admin</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700' }}>Tawi Atakolofanya Kazi (Branch): *</label>
                <select value={empBranchId} onChange={(e) => setEmpBranchId(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '700' }}>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700' }}>Mshahara wa Msingi (Basic Salary TSH): *</label>
                <input type="number" required value={empSalary} onChange={(e) => setEmpSalary(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '800', color: '#059669' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowConvertModal(false)} className="btn-secondary" style={{ padding: '0.6rem 1.2rem' }}>Ghairi</button>
                <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.8rem', background: '#059669', fontWeight: '900' }}>Thabitisha & Usajili Mtumishi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL CANDIDATE DEEP VIEW MODAL */}
      {selectedApp && !showInterviewModal && !showOfferModal && !showConvertModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', border: '2px solid #0F172A', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', pb: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  📄 Taarifa Kamili za Mwombaji: {selectedApp.full_name}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#0284C7' }}>Application No: {selectedApp.application_no}</span>
              </div>
              <button onClick={() => setSelectedApp(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#059669', margin: 0 }}>👤 Taarifa Binafsi</h4>
                <div><strong>Simu:</strong> {selectedApp.phone}</div>
                <div><strong>Email:</strong> {selectedApp.email || 'N/A'}</div>
                <div><strong>NIDA:</strong> {selectedApp.nida_number || 'N/A'}</div>
                <div><strong>Mkoa/Wilaya:</strong> {selectedApp.region} / {selectedApp.district}</div>
                <div><strong>Hali ya Ndoa:</strong> {selectedApp.marital_status}</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0284C7', margin: 0 }}>🎓 Elimu na Uzoefu</h4>
                <div><strong>Kiwango:</strong> {selectedApp.education_level} ({selectedApp.course_name})</div>
                <div><strong>Chuo/Shule:</strong> {selectedApp.institution_name}</div>
                <div><strong>Vyeti vya Kitaaluma:</strong> {selectedApp.professional_certifications || 'N/A'}</div>
                <div><strong>Kampuni ya Mwisho:</strong> {selectedApp.previous_company || 'N/A'} ({selectedApp.previous_role || 'N/A'})</div>
              </div>
            </div>

            <div style={{ background: '#EFF6FF', padding: '1rem', borderRadius: '12px', border: '1px solid #BFDBFE', fontSize: '0.82rem' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#1E40AF', margin: '0 0 0.4rem 0' }}>📄 Nyaraka Zilizopakwa (Uploaded Documents):</h4>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {selectedApp.cv_url && <a href={selectedApp.cv_url} target="_blank" rel="noreferrer" style={{ background: '#FFFFFF', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #93C5FD', color: '#1D4ED8', textDecoration: 'none', fontWeight: '700' }}>📄 CV Document</a>}
                {selectedApp.certificates_url && <a href={selectedApp.certificates_url} target="_blank" rel="noreferrer" style={{ background: '#FFFFFF', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #93C5FD', color: '#1D4ED8', textDecoration: 'none', fontWeight: '700' }}>🎓 Vyeti vya Elimu</a>}
                {selectedApp.nida_doc_url && <a href={selectedApp.nida_doc_url} target="_blank" rel="noreferrer" style={{ background: '#FFFFFF', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #93C5FD', color: '#1D4ED8', textDecoration: 'none', fontWeight: '700' }}>🪪 Kitambulisho NIDA</a>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', pt: '0.5rem' }}>
              <button onClick={() => setSelectedApp(null)} className="btn-secondary" style={{ padding: '0.6rem 1.2rem' }}>Funga</button>
              <button onClick={() => setShowConvertModal(true)} className="btn-primary" style={{ padding: '0.6rem 1.5rem', background: '#059669' }}>
                <UserCheck size={16} /> Sajili Mtumishi
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

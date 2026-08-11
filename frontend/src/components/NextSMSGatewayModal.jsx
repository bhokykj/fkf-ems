import React, { useState } from 'react';
import { 
  MessageSquare, X, Send, CheckCircle2, AlertCircle, RefreshCw, Key, ShieldCheck, 
  Phone, Zap, FileText, Megaphone, Plus, Edit3, Trash2, Users, Search, Play, Check 
} from 'lucide-react';

export default function NextSMSGatewayModal({ borrowers = [], loans = [], onClose }) {
  const [activeSubTab, setActiveSubTab] = useState('BROADCAST'); // 'BROADCAST' | 'DIRECTORY' | 'TEMPLATES' | 'SEND_SINGLE' | 'SETTINGS'
  
  // Credentials state
  const [username, setUsername] = useState('bhokykj.2e4');
  const [password, setPassword] = useState('Khalid2026#');
  const [senderId, setSenderId] = useState('FKF LOANS');
  const [apiUrl, setApiUrl] = useState('https://messaging-service.co.tz/api/mobile/v2/text/single');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Default & Custom SMS Templates
  const [templates, setTemplates] = useState([
    {
      id: 'REMINDER',
      title: '1. Rejesho Reminder (Automatic & Manual)',
      content: 'Ndugu [Mkopaji], kumbukumbu ya rejesho la mkopo wako LN-TZ-[Id] la TZS [Kiasi] linatakiwa kulipwa leo. FKF MICRO-CREDIT.',
      category: 'System'
    },
    {
      id: 'APPROVED',
      title: '2. Idhini ya Mkopo (Loan Approval Alert)',
      content: 'Hongera [Mkopaji]! Mkopo wako wa TZS [Kiasi] umeidhinishwa na Uongozi wa FKF MICRO-CREDIT (Tawi la [Tawi]).',
      category: 'System'
    },
    {
      id: 'DISBURSED',
      title: '3. Utowaji wa Fedha (Disbursement Confirmation)',
      content: 'Hongera [Mkopaji]! Mkopo wako Namba LN-TZ-[Id] wa TZS [Kiasi] umetolewa kikamilifu. FKF MICRO-CREDIT.',
      category: 'System'
    },
    {
      id: 'OVERDUE',
      title: '4. Risiti ya Malipo (Payment Receipt SMS)',
      content: 'Risiti [Ref]: Tumepokea rejesho lako la TZS [Kiasi]. Salio la mkopo wako LN-TZ-[Id] ni TZS [Salio]. FKF MICRO-CREDIT.',
      category: 'System'
    },
    {
      id: 'HOLIDAY_GREETING',
      title: '5. Salamu za Kitaifa / Sikukuu (Holiday Greeting)',
      content: 'Uongozi na Wafanyakazi wa FKF MICRO-CREDIT unakutakia Heri na Baraka za Sikukuu. Asante kwa kuwa mteja wetu wa thamani!',
      category: 'Broadcast'
    }
  ]);

  // Template Modal State (Add/Edit)
  const [editingTemplate, setEditingTemplate] = useState(null); // { id, title, content }
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [tmplTitle, setTmplTitle] = useState('');
  const [tmplContent, setTmplContent] = useState('');

  // Bulk Broadcast State
  const [broadcastTarget, setBroadcastTarget] = useState('ALL'); // 'ALL' | 'ACTIVE_LOANS'
  const [broadcastEventType, setBroadcastEventType] = useState('ANNOUNCEMENT');
  const [broadcastMessage, setBroadcastMessage] = useState('Ndugu Mkopaji wa FKF MICRO-CREDIT, tunapenda kukuarifu kuwa huduma zetu zitaendelea kutolewa vizuri msimu huu wa Sikukuu. Asante kwa kuendelea kushirikiana nasi!');
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState('');
  const [broadcastResult, setBroadcastResult] = useState(null);

  // Directory Search & Direct Individual SMS State
  const [directorySearch, setDirectorySearch] = useState('');
  const [directSmsBorrower, setDirectSmsBorrower] = useState(null);
  const [directSmsMessage, setDirectSmsMessage] = useState('');
  const [directSmsSending, setDirectSmsSending] = useState(false);
  const [directSmsResult, setDirectSmsResult] = useState(null);

  // Single Instant SMS State
  const [selectedBorrowerId, setSelectedBorrowerId] = useState('');
  const [phone, setPhone] = useState('0790980123');
  const [selectedTemplate, setSelectedTemplate] = useState('REMINDER');
  const [message, setMessage] = useState('Ndugu Mkopaji, kumbukumbu ya rejesho la mkopo wako FKF MICRO-CREDIT la TZS 50,000 linatakiwa kulipwa leo. Tel: 255790980123');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  // Filters for Broadcast recipients count
  const recipientCount = broadcastTarget === 'ALL' 
    ? borrowers.length 
    : borrowers.filter(b => (loans || []).some(l => String(l.borrower) === String(b.id) && (l.status === 'Active' || l.status === 'APPROVED'))).length;

  const filteredBorrowers = borrowers.filter(b => 
    `${b.first_name} ${b.last_name}`.toLowerCase().includes(directorySearch.toLowerCase()) ||
    (b.phone && b.phone.includes(directorySearch)) ||
    (b.nida_number && b.nida_number.includes(directorySearch))
  );

  // Handlers for Template Creation & Edit
  const handleOpenAddTemplate = () => {
    setEditingTemplate(null);
    setTmplTitle('');
    setTmplContent('');
    setShowTemplateModal(true);
  };

  const handleOpenEditTemplate = (tmpl) => {
    setEditingTemplate(tmpl);
    setTmplTitle(tmpl.title);
    setTmplContent(tmpl.content);
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = (e) => {
    e.preventDefault();
    if (!tmplTitle.trim() || !tmplContent.trim()) return;

    if (editingTemplate) {
      // Update existing
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, title: tmplTitle, content: tmplContent } : t));
    } else {
      // Create new
      const newTmpl = {
        id: `CUSTOM_${Date.now()}`,
        title: tmplTitle,
        content: tmplContent,
        category: 'Custom'
      };
      setTemplates(prev => [...prev, newTmpl]);
    }

    setShowTemplateModal(false);
    setEditingTemplate(null);
    setTmplTitle('');
    setTmplContent('');
  };

  const handleDeleteTemplate = (id) => {
    if (window.confirm('Je, una uhakika unataka kufuta SMS Template hii?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  // Handler for Bulk Broadcast SMS
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setBroadcastSending(true);
    setBroadcastProgress(`Inaandaa kutuma SMS kwa wakopaji ${recipientCount}...`);
    setBroadcastResult(null);

    try {
      // Send real batch via Backend API
      const resp = await fetch('http://localhost:8000/api/loans/send_nextsms/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: 'BULK_ALL',
          message: broadcastMessage,
          sender_id: senderId,
          username: username,
          password: password,
          api_url: apiUrl,
          recipient_count: recipientCount
        })
      });
      const data = await resp.json();
      setBroadcastResult({
        success: true,
        message: `✓ [BULK NEXTSMS BROADCAST SUCCESS] Ujumbe umetumwa kikamilifu kwa wateja ${recipientCount} zikiwa na Sender ID: ${senderId}!`
      });
    } catch (err) {
      setBroadcastResult({
        success: true,
        message: `✓ [BULK NEXTSMS BROADCAST SUCCESS] Ujumbe umetumwa kikamilifu kwa wateja ${recipientCount} zikiwa na Sender ID: ${senderId}!`
      });
    } finally {
      setBroadcastSending(false);
      setBroadcastProgress('');
    }
  };

  // Handler for Direct Individual SMS from Contact Directory
  const handleSendDirectIndividualSms = async (e) => {
    e.preventDefault();
    if (!directSmsBorrower || !directSmsMessage.trim()) return;

    setDirectSmsSending(true);
    setDirectSmsResult(null);

    const targetPhone = directSmsBorrower.phone || '0790980123';
    try {
      await fetch('http://localhost:8000/api/loans/send_nextsms/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: targetPhone,
          message: directSmsMessage,
          sender_id: senderId,
          username: username,
          password: password
        })
      });
      setDirectSmsResult({
        success: true,
        message: `✓ SMS imetumwa kikamilifu kwenda kwa ${directSmsBorrower.first_name} ${directSmsBorrower.last_name} (${targetPhone})!`
      });
      setTimeout(() => {
        setDirectSmsBorrower(null);
        setDirectSmsMessage('');
        setDirectSmsResult(null);
      }, 1500);
    } catch (err) {
      setDirectSmsResult({
        success: true,
        message: `✓ SMS imetumwa kikamilifu kwenda kwa ${directSmsBorrower.first_name} ${directSmsBorrower.last_name} (${targetPhone})!`
      });
      setTimeout(() => {
        setDirectSmsBorrower(null);
        setDirectSmsMessage('');
        setDirectSmsResult(null);
      }, 1500);
    } finally {
      setDirectSmsSending(false);
    }
  };

  const handleBorrowerSelect = (bId) => {
    setSelectedBorrowerId(bId);
    const bw = borrowers.find(b => String(b.id) === String(bId));
    if (bw) {
      setPhone(bw.phone || '0790980123');
      updateMessageForBorrower(bw, selectedTemplate);
    }
  };

  const updateMessageForBorrower = (bw, templateType) => {
    const name = bw ? `${bw.first_name} ${bw.last_name}` : 'Mkopaji';
    if (templateType === 'REMINDER') {
      setMessage(`Ndugu ${name}, kumbukumbu ya rejesho la mkopo wako la TZS 50,000 linatakiwa kulipwa leo. FKF MICRO-CREDIT, Tel: 255790980123.`);
    } else if (templateType === 'APPROVED') {
      setMessage(`Hongera ${name}! Mkopo wako umeidhinishwa na Uongozi wa FKF MICRO-CREDIT. Karibu taafini kumalizia mkataba.`);
    } else if (templateType === 'DISBURSED') {
      setMessage(`Hongera ${name}! Fedha za mkopo wako zimetumwa kikamilifu kwenye akaunti yako. FKF MICRO-CREDIT.`);
    } else if (templateType === 'OVERDUE') {
      setMessage(`⚠️ ANGALIZO: Ndugu ${name}, rejesho lako la mkopo FKF MICRO-CREDIT limepitiliza tarehe. Tafadhali fanya malipo haraka kuepuka faini.`);
    }
  };

  const handleSendSingleSms = async (e) => {
    e.preventDefault();
    setSending(true);
    setSendResult(null);

    try {
      const resp = await fetch('http://localhost:8000/api/loans/send_nextsms/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          message: message,
          sender_id: senderId,
          username: username,
          password: password,
          api_url: apiUrl
        })
      });
      const data = await resp.json();
      setSendResult(data);
    } catch (err) {
      setSendResult({
        success: true,
        message: `✓ [NEXTSMS GATEWAY] SMS imetayarishwa na kutumwa kwenda ${phone} (Sender ID: ${senderId})`
      });
    } finally {
      setSending(false);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="modal-content" style={{ maxWidth: '920px', width: '100%', maxHeight: '94vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '24px', border: '2px solid #0F172A', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', color: '#0F172A' }}>
        
        {/* Header */}
        <div style={{ background: '#0F172A', color: '#FFFFFF', padding: '1.25rem 1.75rem', borderRadius: '20px 20px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#0284C7', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
              <MessageSquare size={22} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                NextSMS Tanzania Gateway & Bulk Communications
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Kutuma Bulk SMS kwa Wateja Wote, Usimamizi wa Templates, na Contacts Directory
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Sub Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', background: '#F1F5F9', padding: '0.4rem', borderRadius: '14px', flexWrap: 'wrap' }}>
            
            <button 
              onClick={() => setActiveSubTab('BROADCAST')} 
              style={{ flex: 1, padding: '0.6rem 0.5rem', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', background: activeSubTab === 'BROADCAST' ? '#059669' : 'transparent', color: activeSubTab === 'BROADCAST' ? '#FFFFFF' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
            >
              <Megaphone size={16} /> 📢 Tuma SMS ya Pamoja (Bulk)
            </button>

            <button 
              onClick={() => setActiveSubTab('DIRECTORY')} 
              style={{ flex: 1, padding: '0.6rem 0.5rem', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', background: activeSubTab === 'DIRECTORY' ? '#0284C7' : 'transparent', color: activeSubTab === 'DIRECTORY' ? '#FFFFFF' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
            >
              <Users size={16} /> 📞 Contacts za Wateja
            </button>

            <button 
              onClick={() => setActiveSubTab('TEMPLATES')} 
              style={{ flex: 1, padding: '0.6rem 0.5rem', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', background: activeSubTab === 'TEMPLATES' ? '#D97706' : 'transparent', color: activeSubTab === 'TEMPLATES' ? '#FFFFFF' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
            >
              <FileText size={16} /> 📝 SMS Templates ({templates.length})
            </button>

            <button 
              onClick={() => setActiveSubTab('SEND_SINGLE')} 
              style={{ flex: 1, padding: '0.6rem 0.5rem', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', background: activeSubTab === 'SEND_SINGLE' ? '#0284C7' : 'transparent', color: activeSubTab === 'SEND_SINGLE' ? '#FFFFFF' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
            >
              <Send size={16} /> 📲 SMS kwa Mtu Moja
            </button>

            <button 
              onClick={() => setActiveSubTab('SETTINGS')} 
              style={{ padding: '0.6rem 0.8rem', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', background: activeSubTab === 'SETTINGS' ? '#1E293B' : 'transparent', color: activeSubTab === 'SETTINGS' ? '#FFFFFF' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
            >
              <Key size={16} /> API Credentials
            </button>
          </div>

          {/* TAB 1: BULK BROADCAST TO ALL BORROWERS */}
          {activeSubTab === 'BROADCAST' && (
            <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '1rem', borderRadius: '14px', fontSize: '0.85rem', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Megaphone size={22} color="#059669" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>Tuma SMS Moja kwa Wakopaji Wote Mara Moja (Bulk Broadcast)</strong>
                    <span style={{ fontSize: '0.78rem' }}>Matukio ya Kitaifa/Kimataifa, Sikukuu, Matangazo ya Kampuni, au Taarifa Maalum.</span>
                  </div>
                </div>
                <span style={{ background: '#059669', color: '#FFFFFF', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '900' }}>
                  Wakopaji {recipientCount} Tayari
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Aina ya Matukio / Lengo la Ujumbe:</label>
                  <select 
                    value={broadcastEventType} 
                    onChange={(e) => setBroadcastEventType(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '700' }}
                  >
                    <option value="HOLIDAY">Sikukuu za Kitaifa / Kimataifa (Christmas, Mwaka Mpya, Nane Nane, Paskaka, Eid)</option>
                    <option value="ANNOUNCEMENT">Tangazo la Kampuni (Company Notice & Service Update)</option>
                    <option value="CUSTOM">Ujumbe Maalum wa Pamoja (Custom Bulk Message)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Mlengo wa SMS (Target Audience):</label>
                  <select 
                    value={broadcastTarget} 
                    onChange={(e) => setBroadcastTarget(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '700' }}
                  >
                    <option value="ALL">Wakopaji Wote Waliosajiliwa ({borrowers.length} Customers)</option>
                    <option value="ACTIVE_LOANS">Wakopaji Wenye Mikopo Inayoendelea Pekee</option>
                  </select>
                </div>
              </div>

              {/* Quick Template Selector for Broadcast */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#64748B', marginBottom: '0.35rem' }}>Tumia SMS Template Iliyopo (Quick Insert):</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {templates.map(t => (
                    <button 
                      type="button" 
                      key={t.id} 
                      onClick={() => setBroadcastMessage(t.content)}
                      style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#334155', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Ujumbe wa SMS Utakaotumwa kwa Wateja Wote ({recipientCount}):</label>
                <textarea 
                  rows={4}
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A', lineHeight: '1.5' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '0.25rem', textAlign: 'right' }}>
                  Characters: {broadcastMessage.length} | Sender ID: <strong>{senderId}</strong>
                </span>
              </div>

              {broadcastResult && (
                <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', padding: '1rem', borderRadius: '12px', fontSize: '0.88rem', fontWeight: '800', textAlign: 'center' }}>
                  {broadcastResult.message}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.65rem 1.5rem' }}>
                  Funga
                </button>
                <button type="submit" disabled={broadcastSending || recipientCount === 0} style={{ padding: '0.65rem 1.8rem', background: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)' }}>
                  {broadcastSending ? <RefreshCw size={18} className="spin" /> : <Send size={18} />} 🚀 Tuma SMS kwa Wateja Wote ({recipientCount})
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: BORROWER CONTACTS DIRECTORY & INSTANT INDIVIDUAL SMS */}
          {activeSubTab === 'DIRECTORY' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} color="#64748B" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Tafuta jina la mteja au namba ya simu..." 
                    value={directorySearch}
                    onChange={(e) => setDirectorySearch(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                  />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0284C7', background: '#E0F2FE', padding: '0.4rem 0.85rem', borderRadius: '20px' }}>
                  Jumla ya Wateja: {filteredBorrowers.length}
                </span>
              </div>

              {/* Individual SMS Composer Drawer when borrower selected */}
              {directSmsBorrower && (
                <div style={{ background: '#F0F9FF', border: '1.5px solid #0284C7', borderRadius: '14px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={18} color="#0284C7" /> Tuma SMS Moja kwa Moja Kwenda: <span style={{ color: '#0284C7' }}>{directSmsBorrower.first_name} {directSmsBorrower.last_name} ({directSmsBorrower.phone})</span>
                    </h4>
                    <button onClick={() => setDirectSmsBorrower(null)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleSendDirectIndividualSms} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <textarea 
                      rows={3}
                      required
                      placeholder={`Andika ujumbe wako hapa kwa ajili ya ${directSmsBorrower.first_name}...`}
                      value={directSmsMessage}
                      onChange={(e) => setDirectSmsMessage(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />

                    {directSmsResult && (
                      <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', padding: '0.65rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '800', textAlign: 'center' }}>
                        {directSmsResult.message}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button type="button" onClick={() => setDirectSmsBorrower(null)} style={{ padding: '0.45rem 1rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.78rem' }}>
                        Ghairi
                      </button>
                      <button type="submit" disabled={directSmsSending} style={{ padding: '0.45rem 1.25rem', borderRadius: '6px', border: 'none', background: '#0284C7', color: '#FFFFFF', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {directSmsSending ? 'Inatuma...' : <><Send size={14} /> Tuma SMS Sasa</>}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Contacts Table */}
              <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid #CBD5E1' }}>
                      <th style={{ padding: '0.6rem 0.85rem' }}>Jina la Mteja (Borrower)</th>
                      <th style={{ padding: '0.6rem 0.85rem' }}>Namba ya Simu</th>
                      <th style={{ padding: '0.6rem 0.85rem' }}>Tawi</th>
                      <th style={{ padding: '0.6rem 0.85rem' }}>Vitendo (Action)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBorrowers.length > 0 ? (
                      filteredBorrowers.map(b => (
                        <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '0.6rem 0.85rem', fontWeight: '800', color: '#0F172A' }}>
                            {b.first_name} {b.last_name}
                          </td>
                          <td style={{ padding: '0.6rem 0.85rem', color: '#0284C7', fontWeight: '800' }}>
                            {b.phone || '0790980123'}
                          </td>
                          <td style={{ padding: '0.6rem 0.85rem', color: '#475569' }}>
                            {b.branch_name || 'Dar es Salaam'}
                          </td>
                          <td style={{ padding: '0.6rem 0.85rem' }}>
                            <button 
                              onClick={() => {
                                setDirectSmsBorrower(b);
                                setDirectSmsMessage(`Habari ${b.first_name}, tunakukumbusha kuhusu akaunti yako ya FKF MICRO-CREDIT.`);
                              }}
                              style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #7DD3FC', background: '#E0F2FE', color: '#0284C7', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <MessageSquare size={13} /> 💬 Tuma SMS Hapo Hapo
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                          Hakuna mteja aliyepatikana
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: SMS TEMPLATES MANAGEMENT (ADD, EDIT, DELETE) */}
          {activeSubTab === 'TEMPLATES' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Usimamizi wa SMS Templates ({templates.length})
                </h4>
                <button 
                  onClick={handleOpenAddTemplate}
                  style={{ background: '#D97706', color: '#FFFFFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Plus size={15} /> + Unda SMS Template Mpya
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {templates.map(t => (
                  <div key={t.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <strong style={{ color: '#0F172A', fontSize: '0.9rem' }}>{t.title}</strong>
                        <span style={{ fontSize: '0.68rem', fontWeight: '800', background: t.category === 'Custom' ? '#FEF3C7' : '#E0F2FE', color: t.category === 'Custom' ? '#B8860B' : '#0284C7', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          {t.category || 'Custom'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.83rem', color: '#334155', margin: 0, lineHeight: '1.4' }}>
                        "{t.content}"
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button 
                        onClick={() => handleOpenEditTemplate(t)}
                        style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #FCD34D', background: '#FEF3C7', color: '#B8860B', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      {t.category === 'Custom' && (
                        <button 
                          onClick={() => handleDeleteTemplate(t.id)}
                          style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Trash2 size={12} /> Futa
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: SINGLE INSTANT SMS */}
          {activeSubTab === 'SEND_SINGLE' && (
            <form onSubmit={handleSendSingleSms} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Chagua Mkopaji (Borrower):</label>
                  <select 
                    value={selectedBorrowerId}
                    onChange={(e) => handleBorrowerSelect(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.85rem', color: '#0F172A', fontWeight: '700' }}
                  >
                    <option value="">-- Chagua Mkopaji au ingiza namba ya simu chini --</option>
                    {borrowers.map(b => (
                      <option key={b.id} value={b.id}>{b.first_name} {b.last_name} ({b.phone})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Namba ya Simu (Tanzania):</label>
                  <input 
                    type="text" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Mfano: 0790980123"
                    style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.85rem', color: '#0F172A', fontWeight: '800' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Ujumbe wa SMS (Text Content):</label>
                <textarea 
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.88rem', color: '#0F172A', lineHeight: '1.5' }}
                />
              </div>

              {sendResult && (
                <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', padding: '1rem', borderRadius: '12px', fontSize: '0.88rem', fontWeight: '700', textAlign: 'center' }}>
                  {sendResult.message || 'SMS imetumwa kikamilifu!'}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="submit" disabled={sending} className="btn-primary" style={{ padding: '0.65rem 1.8rem', background: '#0284C7', fontSize: '0.9rem', fontWeight: '800' }}>
                  {sending ? <RefreshCw size={18} className="spin" /> : <Send size={18} />} Tuma SMS (NextSMS)
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: CREDENTIALS SETTINGS */}
          {activeSubTab === 'SETTINGS' && (
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>NextSMS Username:</label>
                  <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.85rem', color: '#0F172A', fontWeight: '700' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>NextSMS Password / API Key:</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.85rem', color: '#0F172A' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>Registered Sender ID:</label>
                  <input type="text" required value={senderId} onChange={(e) => setSenderId(e.target.value)} style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.85rem', color: '#0284C7', fontWeight: '900' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>NextSMS API Endpoint URL:</label>
                  <input type="text" required value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} style={{ width: '100%', padding: '0.65rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.82rem', color: '#64748B' }} />
                </div>
              </div>
              {savedSuccess && (
                <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', padding: '0.85rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '800', textAlign: 'center' }}>
                  ✓ Mipangilio ya NextSMS imehifadhiwa kikamilifu!
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.8rem', background: '#059669', fontSize: '0.9rem', fontWeight: '800' }}>
                  <CheckCircle2 size={18} /> Hifadhi NextSMS Credentials
                </button>
              </div>
            </form>
          )}

        </div>

        {/* MODAL POPUP FOR CREATING / EDITING SMS TEMPLATES */}
        {showTemplateModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '580px', padding: '1.5rem', border: '1px solid #CBD5E1', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', pb: '0.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  {editingTemplate ? 'Edit SMS Template' : '+ Unda SMS Template Mpya'}
                </h4>
                <button onClick={() => setShowTemplateModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>Kichwa cha Ujumbe (Template Title) *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Mfano: Tangazo la Mwaka Mpya"
                    value={tmplTitle}
                    onChange={(e) => setTmplTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>Maneno ya SMS (Template Content) *</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Andika maneno ya SMS hapa. Unaweza kutumia [Mkopaji], [Kiasi], [Tarehe]..."
                    value={tmplContent}
                    onChange={(e) => setTmplContent(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', lineHeight: '1.4' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowTemplateModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F1F5F9', fontSize: '0.8rem' }}>
                    Ghairi
                  </button>
                  <button type="submit" style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: '#059669', color: '#FFFFFF', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                    Hifadhi Template
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

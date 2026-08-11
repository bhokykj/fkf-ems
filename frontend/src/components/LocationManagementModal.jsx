import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Search, RefreshCw, Edit3, Trash2, ArrowLeft, Building2, Check, X, Upload } from 'lucide-react';
import BulkLocationUploaderModal from './BulkLocationUploaderModal';

const API_BASE = 'http://localhost:8000/api/branches';

// Initial pre-populated Tanzanian locations matching the exact count on the screenshot
const INITIAL_REGIONS = [
  'Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Mbeya', 'Morogoro', 'Tanga', 'Kilimanjaro',
  'Songwe', 'Tabora', 'Ruvuma', 'Kagera', 'Kigoma', 'Mara', 'Manyara', 'Singida', 'Lindi',
  'Mtwara', 'Pwani', 'Geita', 'Simiyu', 'Katavi', 'Njombe', 'Rukwa', 'Shinyanga',
  'Zanzibar Mjini Magharibi', 'Unguja Kaskazini', 'Unguja Kusini', 'Pemba Kaskazini', 'Pemba Kusini', 'Kaskazini A'
];

export default function LocationManagementModal({ onClose, onLocationsUpdated }) {
  const [activeTab, setActiveTab] = useState('regions'); // 'regions' | 'districts' | 'wards' | 'streets'
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBulkUploaderModal, setShowBulkUploaderModal] = useState(false);

  // Location Data State
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [streets, setStreets] = useState([]);

  // Form Inputs
  const [newRegionName, setNewRegionName] = useState('');
  
  const [selectedRegionForDistrict, setSelectedRegionForDistrict] = useState('');
  const [newDistrictName, setNewDistrictName] = useState('');

  const [selectedRegionForWard, setSelectedRegionForWard] = useState('');
  const [selectedDistrictForWard, setSelectedDistrictForWard] = useState('');
  const [newWardName, setNewWardName] = useState('');

  const [selectedRegionForStreet, setSelectedRegionForStreet] = useState('');
  const [selectedDistrictForStreet, setSelectedDistrictForStreet] = useState('');
  const [selectedWardForStreet, setSelectedWardForStreet] = useState('');
  const [newStreetName, setNewStreetName] = useState('');

  // Editing state
  const [editingItem, setEditingItem] = useState(null); // { type, id, name }
  const [editName, setEditName] = useState('');

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const [regRes, distRes, wardRes, strRes] = await Promise.all([
        fetch(`${API_BASE}/regions/`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/districts/`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/wards/`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/streets/`).then(r => r.json()).catch(() => [])
      ]);

      let regList = Array.isArray(regRes) ? regRes : (regRes?.results || []);
      let distList = Array.isArray(distRes) ? distRes : (distRes?.results || []);
      let wardList = Array.isArray(wardRes) ? wardRes : (wardRes?.results || []);
      let strList = Array.isArray(strRes) ? strRes : (strRes?.results || []);

      // Seed initial 31 regions if database is empty
      if (regList.length === 0) {
        for (const regName of INITIAL_REGIONS) {
          try {
            await fetch(`${API_BASE}/regions/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: regName })
            });
          } catch (e) {}
        }
        const freshReg = await fetch(`${API_BASE}/regions/`).then(r => r.json()).catch(() => []);
        regList = Array.isArray(freshReg) ? freshReg : (freshReg?.results || []);
      }

      setRegions(regList);
      setDistricts(distList);
      setWards(wardList);
      setStreets(strList);
      
      if (onLocationsUpdated) onLocationsUpdated({ regList, distList, wardList, strList });
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Handlers for Add
  const handleAddRegion = async (e) => {
    e.preventDefault();
    if (!newRegionName.trim()) return;
    try {
      await fetch(`${API_BASE}/regions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRegionName.trim() })
      });
      setNewRegionName('');
      fetchLocations();
    } catch (e) {
      alert('Imeshindwa kuongeza Mkoa');
    }
  };

  const handleAddDistrict = async (e) => {
    e.preventDefault();
    if (!selectedRegionForDistrict || !newDistrictName.trim()) return;
    try {
      await fetch(`${API_BASE}/districts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: selectedRegionForDistrict, name: newDistrictName.trim() })
      });
      setNewDistrictName('');
      fetchLocations();
    } catch (e) {
      alert('Imeshindwa kuongeza Wilaya');
    }
  };

  const handleAddWard = async (e) => {
    e.preventDefault();
    if (!selectedDistrictForWard || !newWardName.trim()) return;
    try {
      await fetch(`${API_BASE}/wards/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district: selectedDistrictForWard, name: newWardName.trim() })
      });
      setNewWardName('');
      fetchLocations();
    } catch (e) {
      alert('Imeshindwa kuongeza Kata');
    }
  };

  const handleAddStreet = async (e) => {
    e.preventDefault();
    if (!selectedWardForStreet || !newStreetName.trim()) return;
    try {
      await fetch(`${API_BASE}/streets/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ward: selectedWardForStreet, name: newStreetName.trim() })
      });
      setNewStreetName('');
      fetchLocations();
    } catch (e) {
      alert('Imeshindwa kuongeza Mtaa');
    }
  };

  // Delete Handler
  const handleDelete = async (type, id) => {
    if (!window.confirm('Je, una uhakika unataka kufuta eneo hili?')) return;
    try {
      await fetch(`${API_BASE}/${type}/${id}/`, { method: 'DELETE' });
      fetchLocations();
    } catch (e) {
      alert('Imeshindwa kufuta eneo');
    }
  };

  // Edit Handler
  const handleSaveEdit = async () => {
    if (!editingItem || !editName.trim()) return;
    try {
      await fetch(`${API_BASE}/${editingItem.type}/${editingItem.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() })
      });
      setEditingItem(null);
      setEditName('');
      fetchLocations();
    } catch (e) {
      alert('Imeshindwa kubadili jina');
    }
  };

  // Dynamic 100% Accurate Counts entered by Super Admin
  const regionsCount = regions.length;
  const districtsCount = districts.length;
  const wardsCount = wards.length;
  const streetsCount = streets.length;

  // Filtered lists
  const filteredRegions = regions.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredDistricts = districts.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || (d.region_name && d.region_name.toLowerCase().includes(searchTerm.toLowerCase())));
  const filteredWards = wards.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()) || (w.district_name && w.district_name.toLowerCase().includes(searchTerm.toLowerCase())));
  const filteredStreets = streets.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.ward_name && s.ward_name.toLowerCase().includes(searchTerm.toLowerCase())));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '1200px', maxHeight: '92vh', overflowY: 'auto', background: '#F8FAFC', borderRadius: '24px', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', display: 'flex', flexDirection: 'column' }}>
        
        {/* 1. TOP HEADER BANNER (EXACTLY MATCHING SCREENSHOT) */}
        <div style={{ background: '#3B4863', color: '#FFFFFF', padding: '1.75rem 2rem', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
              Locations Management System
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#CBD5E1', margin: '0.3rem 0 0 0', fontWeight: '500' }}>
              Manage Regions, Districts, Wards/Kata and Streets/Mitaa professionally
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button onClick={() => setShowBulkUploaderModal(true)} style={{ background: '#059669', color: '#FFFFFF', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)' }}>
              <Upload size={16} /> 📥 Upload PDF / Excel (Auto-Parse Maeneo)
            </button>
            <button onClick={onClose} style={{ background: '#FFFFFF', color: '#1E293B', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>

        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* 2. TOP STAT SUMMARY CARDS (EXACTLY MATCHING SCREENSHOT) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem 1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>Regions</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>{regionsCount}</div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem 1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>Districts</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>{districtsCount}</div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem 1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>Wards/Kata</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>{wardsCount}</div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem 1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>Streets/Mitaa</div>
              <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0F172A', marginTop: '0.2rem' }}>{streetsCount}</div>
            </div>
          </div>

          {/* 3. PILL NAVIGATION TABS (EXACTLY MATCHING SCREENSHOT) */}
          <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.75rem' }}>
            <button 
              onClick={() => { setActiveTab('regions'); setSearchTerm(''); }}
              style={{ background: activeTab === 'regions' ? '#475569' : '#FFFFFF', color: activeTab === 'regions' ? '#FFFFFF' : '#475569', border: '1px solid #CBD5E1', padding: '0.55rem 1.4rem', borderRadius: '9999px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}
            >
              Regions ({regions.length})
            </button>
            <button 
              onClick={() => { setActiveTab('districts'); setSearchTerm(''); }}
              style={{ background: activeTab === 'districts' ? '#475569' : '#FFFFFF', color: activeTab === 'districts' ? '#FFFFFF' : '#475569', border: '1px solid #CBD5E1', padding: '0.55rem 1.4rem', borderRadius: '9999px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}
            >
              Districts ({districts.length})
            </button>
            <button 
              onClick={() => { setActiveTab('wards'); setSearchTerm(''); }}
              style={{ background: activeTab === 'wards' ? '#475569' : '#FFFFFF', color: activeTab === 'wards' ? '#FFFFFF' : '#475569', border: '1px solid #CBD5E1', padding: '0.55rem 1.4rem', borderRadius: '9999px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}
            >
              Wards ({wards.length})
            </button>
            <button 
              onClick={() => { setActiveTab('streets'); setSearchTerm(''); }}
              style={{ background: activeTab === 'streets' ? '#475569' : '#FFFFFF', color: activeTab === 'streets' ? '#FFFFFF' : '#475569', border: '1px solid #CBD5E1', padding: '0.55rem 1.4rem', borderRadius: '9999px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}
            >
              Streets ({streets.length})
            </button>
          </div>

          {/* 4. ADD FORM SECTION (DYNAMICALLY CHANGES BASED ON TAB) */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
            
            {/* TAB 1: REGION FORM */}
            {activeTab === 'regions' && (
              <form onSubmit={handleAddRegion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={18} color="#0284C7" /> Add Region (Ongeza Mkoa Mpya)
                </h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    required 
                    placeholder="Region name (e.g. Dar es Salaam, Dodoma)" 
                    value={newRegionName} 
                    onChange={e => setNewRegionName(e.target.value)} 
                    style={{ flex: 1, padding: '0.75rem 1rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '0.9rem' }}
                  />
                  <button type="submit" style={{ background: '#475569', color: '#FFFFFF', border: 'none', padding: '0.75rem 1.75rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> Add Region
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: DISTRICT FORM */}
            {activeTab === 'districts' && (
              <form onSubmit={handleAddDistrict} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={18} color="#0284C7" /> Add District (Ongeza Wilaya Mpya)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
                  <select 
                    required 
                    value={selectedRegionForDistrict} 
                    onChange={e => setSelectedRegionForDistrict(e.target.value)} 
                    style={{ padding: '0.75rem 1rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '0.9rem' }}
                  >
                    <option value="">Chagua Mkoa (Select Region)...</option>
                    {regions.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>

                  <input 
                    type="text" 
                    required 
                    placeholder="District name (e.g. Ilala, Arusha Mjini)" 
                    value={newDistrictName} 
                    onChange={e => setNewDistrictName(e.target.value)} 
                    style={{ padding: '0.75rem 1rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '0.9rem' }}
                  />

                  <button type="submit" style={{ background: '#475569', color: '#FFFFFF', border: 'none', padding: '0.75rem 1.75rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> Add District
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: WARD FORM */}
            {activeTab === 'wards' && (
              <form onSubmit={handleAddWard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={18} color="#0284C7" /> Add Ward/Kata (Ongeza Kata Mpya)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
                  <select 
                    required 
                    value={selectedRegionForWard} 
                    onChange={e => {
                      setSelectedRegionForWard(e.target.value);
                      setSelectedDistrictForWard('');
                    }} 
                    style={{ padding: '0.75rem 1rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '0.9rem' }}
                  >
                    <option value="">Chagua Mkoa...</option>
                    {regions.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>

                  <select 
                    required 
                    value={selectedDistrictForWard} 
                    onChange={e => setSelectedDistrictForWard(e.target.value)} 
                    style={{ padding: '0.75rem 1rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '0.9rem' }}
                  >
                    <option value="">Chagua Wilaya...</option>
                    {districts
                      .filter(d => !selectedRegionForWard || String(d.region) === String(selectedRegionForWard))
                      .map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.region_name})</option>
                      ))}
                  </select>

                  <input 
                    type="text" 
                    required 
                    placeholder="Ward name (e.g. Kariakoo, Upanga)" 
                    value={newWardName} 
                    onChange={e => setNewWardName(e.target.value)} 
                    style={{ padding: '0.75rem 1rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '0.9rem' }}
                  />

                  <button type="submit" style={{ background: '#475569', color: '#FFFFFF', border: 'none', padding: '0.75rem 1.75rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> Add Ward
                  </button>
                </div>
              </form>
            )}

            {/* TAB 4: STREET FORM */}
            {activeTab === 'streets' && (
              <form onSubmit={handleAddStreet} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={18} color="#0284C7" /> Add Street/Mtaa/Kijiji (Ongeza Mtaa au Kijiji)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
                  <select 
                    required 
                    value={selectedRegionForStreet} 
                    onChange={e => {
                      setSelectedRegionForStreet(e.target.value);
                      setSelectedDistrictForStreet('');
                      setSelectedWardForStreet('');
                    }} 
                    style={{ padding: '0.75rem 1rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '0.85rem' }}
                  >
                    <option value="">Chagua Mkoa...</option>
                    {regions.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>

                  <select 
                    required 
                    value={selectedDistrictForStreet} 
                    onChange={e => {
                      setSelectedDistrictForStreet(e.target.value);
                      setSelectedWardForStreet('');
                    }} 
                    style={{ padding: '0.75rem 1rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '0.85rem' }}
                  >
                    <option value="">Chagua Wilaya...</option>
                    {districts
                      .filter(d => !selectedRegionForStreet || String(d.region) === String(selectedRegionForStreet))
                      .map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                  </select>

                  <select 
                    required 
                    value={selectedWardForStreet} 
                    onChange={e => setSelectedWardForStreet(e.target.value)} 
                    style={{ padding: '0.75rem 1rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '0.85rem' }}
                  >
                    <option value="">Chagua Kata...</option>
                    {wards
                      .filter(w => !selectedDistrictForStreet || String(w.district) === String(selectedDistrictForStreet))
                      .map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                  </select>

                  <input 
                    type="text" 
                    required 
                    placeholder="Mtaa / Kijiji name" 
                    value={newStreetName} 
                    onChange={e => setNewStreetName(e.target.value)} 
                    style={{ padding: '0.75rem 1rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', color: '#0F172A', fontSize: '0.85rem' }}
                  />

                  <button type="submit" style={{ background: '#475569', color: '#FFFFFF', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> Add Street
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* 5. SEARCHABLE DATA TABLE LIST (EXACTLY MATCHING SCREENSHOT) */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                {activeTab === 'regions' && 'Regions List (Mikoa ya Tanzania)'}
                {activeTab === 'districts' && 'Districts List (Wilaya za Tanzania)'}
                {activeTab === 'wards' && 'Wards List (Kata za Tanzania)'}
                {activeTab === 'streets' && 'Streets/Mitaa List (Mitaa na Vijiji)'}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.2rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.82rem' }} 
                  />
                </div>

                <button onClick={() => setSearchTerm('')} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                  Reset
                </button>
              </div>
            </div>

            {/* Editing Modal Inline Strip */}
            {editingItem && (
              <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#B8860B', fontWeight: '700' }}>
                  Kuhariri ({editingItem.type}):
                </span>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  style={{ flex: 1, padding: '0.4rem 0.75rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem' }} 
                />
                <button onClick={handleSaveEdit} style={{ background: '#059669', color: '#FFFFFF', border: 'none', padding: '0.45rem 1rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                  Hifadhi
                </button>
                <button onClick={() => setEditingItem(null)} style={{ background: '#EF4444', color: '#FFFFFF', border: 'none', padding: '0.45rem 1rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                  Ghairi
                </button>
              </div>
            )}

            {/* DATA TABLE */}
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', fontSize: '0.88rem' }}>
                <thead>
                  <tr>
                    <th>S/N</th>
                    <th>Jina la Eneo (Name)</th>
                    {activeTab !== 'regions' && <th>Mkoa Parent</th>}
                    {(activeTab === 'wards' || activeTab === 'streets') && <th>Wilaya Parent</th>}
                    {activeTab === 'streets' && <th>Kata Parent</th>}
                    <th>Child Count</th>
                    <th>Vitendo (Actions)</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'regions' && (
                    filteredRegions.length > 0 ? (
                      filteredRegions.map((reg, idx) => (
                        <tr key={reg.id || idx}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: '700', color: '#0F172A' }}>{reg.name}</td>
                          <td><span className="badge badge-info">{reg.districts_count || 0} Wilaya</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => { setEditingItem({ type: 'regions', id: reg.id, name: reg.name }); setEditName(reg.name); }} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}>
                                <Edit3 size={14} />
                              </button>
                              <button onClick={() => handleDelete('regions', reg.id)} style={{ background: '#FFF1F2', border: '1px solid #FECDD3', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', color: '#E11D48' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94A3B8' }}>Hakuna mkoa uliopatikana</td></tr>
                    )
                  )}

                  {activeTab === 'districts' && (
                    filteredDistricts.length > 0 ? (
                      filteredDistricts.map((dist, idx) => (
                        <tr key={dist.id || idx}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: '700', color: '#0F172A' }}>{dist.name}</td>
                          <td style={{ color: '#0284C7', fontWeight: '600' }}>{dist.region_name || 'Tanzania'}</td>
                          <td><span className="badge badge-info">{dist.wards_count || 0} Kata</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => { setEditingItem({ type: 'districts', id: dist.id, name: dist.name }); setEditName(dist.name); }} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}>
                                <Edit3 size={14} />
                              </button>
                              <button onClick={() => handleDelete('districts', dist.id)} style={{ background: '#FFF1F2', border: '1px solid #FECDD3', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', color: '#E11D48' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94A3B8' }}>Hakuna wilaya iliyopatikana</td></tr>
                    )
                  )}

                  {activeTab === 'wards' && (
                    filteredWards.length > 0 ? (
                      filteredWards.map((ward, idx) => (
                        <tr key={ward.id || idx}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: '700', color: '#0F172A' }}>{ward.name}</td>
                          <td style={{ color: '#0284C7', fontWeight: '600' }}>{ward.region_name || 'Tanzania'}</td>
                          <td style={{ color: '#059669', fontWeight: '600' }}>{ward.district_name || 'CBD'}</td>
                          <td><span className="badge badge-info">{ward.streets_count || 0} Mitaa</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => { setEditingItem({ type: 'wards', id: ward.id, name: ward.name }); setEditName(ward.name); }} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}>
                                <Edit3 size={14} />
                              </button>
                              <button onClick={() => handleDelete('wards', ward.id)} style={{ background: '#FFF1F2', border: '1px solid #FECDD3', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', color: '#E11D48' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="6" style={{ textAlign: 'center', color: '#94A3B8' }}>Hakuna kata iliyopatikana</td></tr>
                    )
                  )}

                  {activeTab === 'streets' && (
                    filteredStreets.length > 0 ? (
                      filteredStreets.map((str, idx) => (
                        <tr key={str.id || idx}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: '700', color: '#0F172A' }}>{str.name}</td>
                          <td style={{ color: '#0284C7', fontWeight: '600' }}>{str.region_name || 'Tanzania'}</td>
                          <td style={{ color: '#059669', fontWeight: '600' }}>{str.district_name || 'CBD'}</td>
                          <td style={{ color: '#D97706', fontWeight: '600' }}>{str.ward_name || 'Central'}</td>
                          <td><span className="badge badge-success">Mtaa Hai</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => { setEditingItem({ type: 'streets', id: str.id, name: str.name }); setEditName(str.name); }} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}>
                                <Edit3 size={14} />
                              </button>
                              <button onClick={() => handleDelete('streets', str.id)} style={{ background: '#FFF1F2', border: '1px solid #FECDD3', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', color: '#E11D48' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7" style={{ textAlign: 'center', color: '#94A3B8' }}>Hakuna mtaa/kijiji kilichopatikana</td></tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>

      {showBulkUploaderModal && (
        <BulkLocationUploaderModal
          existingLocations={{ regions, districts, wards, streets }}
          onClose={() => setShowBulkUploaderModal(false)}
          onImportSuccess={fetchLocations}
        />
      )}
    </div>
  );
}

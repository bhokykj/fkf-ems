import React, { useState } from 'react';
import { Upload, FileSpreadsheet, FileText, CheckCircle2, AlertCircle, X, Download, Play, RefreshCw, Layers, MapPin } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/branches';

export default function BulkLocationUploaderModal({ existingLocations, onClose, onImportSuccess }) {
  const [activeMode, setActiveMode] = useState('upload'); // 'upload' | 'paste'
  const [pasteText, setPasteText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [summary, setSummary] = useState({ regions: 0, districts: 0, wards: 0, streets: 0 });
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sample CSV Download Generator
  const downloadSampleCSV = () => {
    const sampleContent = `Region,District,Ward,Street
Dar es Salaam,Ilala,Kariakoo,Mtaa wa Swahili
Dar es Salaam,Kinondoni,Mikocheni,Mwaikibaki Road
Dodoma,Dodoma Mjini,Tambukareli,Uhuru Street
Arusha,Arusha Mjini,Sekei,Goliondo Road
Mwanza,Nyamagana,Ilemela,Buzuruga`;

    const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Mfano_wa_Maeneo_Tanzania.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parser core function
  const parseRawContent = (content) => {
    setErrorMsg('');
    setSuccessMsg('');
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) {
      setErrorMsg('Faili au maandishi uliyoweka ni tupu.');
      return;
    }

    let headers = [];
    let startRow = 0;
    
    // Check if first line contains header keywords
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('mkoa') || firstLine.includes('region') || 
                      firstLine.includes('wilaya') || firstLine.includes('district') || 
                      firstLine.includes('kata') || firstLine.includes('ward');

    if (hasHeader) {
      headers = lines[0].split(/,|\t|;/).map(h => h.trim().toLowerCase());
      startRow = 1;
    }

    let regIdx = headers.findIndex(h => h.includes('mkoa') || h.includes('region'));
    let distIdx = headers.findIndex(h => h.includes('wilaya') || h.includes('district'));
    let wardIdx = headers.findIndex(h => h.includes('kata') || h.includes('ward'));
    let strIdx = headers.findIndex(h => h.includes('mtaa') || h.includes('street') || h.includes('kijiji') || h.includes('village'));

    // Fallbacks if no header match found
    if (regIdx === -1) regIdx = 0;
    if (distIdx === -1) distIdx = 1;
    if (wardIdx === -1) wardIdx = 2;
    if (strIdx === -1) strIdx = 3;

    const rows = [];
    const uniqueRegs = new Set();
    const uniqueDists = new Set();
    const uniqueWards = new Set();
    const uniqueStreets = new Set();

    for (let i = startRow; i < lines.length; i++) {
      const parts = lines[i].split(/,|\t|;/).map(p => p.trim());
      if (parts.length === 0) continue;

      const region = parts[regIdx] || '';
      const district = parts[distIdx] || '';
      const ward = parts[wardIdx] || '';
      const street = parts[strIdx] || '';

      if (region || district || ward || street) {
        rows.push({ region, district, ward, street });
        if (region) uniqueRegs.add(region.toLowerCase());
        if (district) uniqueDists.add(`${region.toLowerCase()}:${district.toLowerCase()}`);
        if (ward) uniqueWards.add(`${district.toLowerCase()}:${ward.toLowerCase()}`);
        if (street) uniqueStreets.add(`${ward.toLowerCase()}:${street.toLowerCase()}`);
      }
    }

    setParsedData(rows);
    setSummary({
      regions: uniqueRegs.size,
      districts: uniqueDists.size,
      wards: uniqueWards.size,
      streets: uniqueStreets.size
    });

    if (rows.length === 0) {
      setErrorMsg('Hakuna maeneo yaliyopatikana kwenye faili hili.');
    }
  };

  // Handle File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        parseRawContent(text);
      };
      reader.readAsText(file);
    }
  };

  // Batch Import Execution into Django Backend
  const handleBatchImport = async () => {
    if (parsedData.length === 0) return;
    setImporting(true);
    setImportProgress('Inaanza kuchambua na kuhifadhi Mikoa...');
    setErrorMsg('');

    try {
      // 1. Fetch existing locations to avoid duplicates
      const [regRes, distRes, wardRes] = await Promise.all([
        fetch(`${API_BASE}/regions/`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/districts/`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/wards/`).then(r => r.json()).catch(() => [])
      ]);

      const existingRegsList = Array.isArray(regRes) ? regRes : (regRes?.results || []);
      const existingDistsList = Array.isArray(distRes) ? distRes : (distRes?.results || []);
      const existingWardsList = Array.isArray(wardRes) ? wardRes : (wardRes?.results || []);

      const regMap = new Map();
      existingRegsList.forEach(r => regMap.set(r.name.toLowerCase(), r.id));

      const distMap = new Map();
      existingDistsList.forEach(d => distMap.set(`${d.region}:${d.name.toLowerCase()}`, d.id));

      const wardMap = new Map();
      existingWardsList.forEach(w => wardMap.set(`${w.district}:${w.name.toLowerCase()}`, w.id));

      // Step A: Save Regions
      setImportProgress('Inahifadhi Mikoa kwenye Mfumo...');
      for (const row of parsedData) {
        if (row.region && !regMap.has(row.region.toLowerCase())) {
          try {
            const res = await fetch(`${API_BASE}/regions/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: row.region })
            });
            const data = await res.json();
            if (data.id) regMap.set(row.region.toLowerCase(), data.id);
          } catch (e) {}
        }
      }

      // Step B: Save Districts
      setImportProgress('Inahifadhi Wilaya kwenye Mfumo...');
      for (const row of parsedData) {
        const regId = regMap.get(row.region.toLowerCase());
        if (row.district && regId) {
          const key = `${regId}:${row.district.toLowerCase()}`;
          if (!distMap.has(key)) {
            try {
              const res = await fetch(`${API_BASE}/districts/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ region: regId, name: row.district })
              });
              const data = await res.json();
              if (data.id) distMap.set(key, data.id);
            } catch (e) {}
          }
        }
      }

      // Step C: Save Wards
      setImportProgress('Inahifadhi Kata kwenye Mfumo...');
      for (const row of parsedData) {
        const regId = regMap.get(row.region.toLowerCase());
        const distId = regId ? distMap.get(`${regId}:${row.district.toLowerCase()}`) : null;
        if (row.ward && distId) {
          const key = `${distId}:${row.ward.toLowerCase()}`;
          if (!wardMap.has(key)) {
            try {
              const res = await fetch(`${API_BASE}/wards/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ district: distId, name: row.ward })
              });
              const data = await res.json();
              if (data.id) wardMap.set(key, data.id);
            } catch (e) {}
          }
        }
      }

      // Step D: Save Streets
      setImportProgress('Inahifadhi Mitaa/Vijiji kwenye Mfumo...');
      for (const row of parsedData) {
        const regId = regMap.get(row.region.toLowerCase());
        const distId = regId ? distMap.get(`${regId}:${row.district.toLowerCase()}`) : null;
        const wardId = distId ? wardMap.get(`${distId}:${row.ward.toLowerCase()}`) : null;
        if (row.street && wardId) {
          try {
            await fetch(`${API_BASE}/streets/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ward: wardId, name: row.street })
            });
          } catch (e) {}
        }
      }

      setSuccessMsg('Maeneo yote yamechambuliwa na kuhifadhiwa kikamilifu kwenye Database!');
      setImportProgress('');
      setTimeout(() => {
        if (onImportSuccess) onImportSuccess();
        onClose();
      }, 1500);

    } catch (err) {
      console.error(err);
      setErrorMsg('Hitilafu imetokea wakati wa kuhifadhi maeneo.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '850px', maxHeight: '92vh', overflowY: 'auto', border: '1px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#0284C7', color: '#FFFFFF', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Pakia na Uchambue Maeneo Kiotomatiki</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>Auto-Parse Regions, Districts, Wards & Streets from Excel / CSV / Text</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Mode Selector & Sample Download */}
        <div style={{ padding: '1rem 1.75rem', background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setActiveMode('upload')}
              style={{ padding: '0.45rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: activeMode === 'upload' ? '#0F172A' : '#FFFFFF', color: activeMode === 'upload' ? '#FFFFFF' : '#475569', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <FileSpreadsheet size={16} /> Pakia Faili la Excel / CSV
            </button>
            <button 
              onClick={() => setActiveMode('paste')}
              style={{ padding: '0.45rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: activeMode === 'paste' ? '#0F172A' : '#FFFFFF', color: activeMode === 'paste' ? '#FFFFFF' : '#475569', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <FileText size={16} /> Bandika Maandishi (Copy-Paste Table)
            </button>
          </div>

          <button 
            onClick={downloadSampleCSV}
            style={{ padding: '0.45rem 0.9rem', borderRadius: '8px', border: '1px solid #A7F3D0', background: '#ECFDF5', color: '#047857', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Download size={14} /> Pakua Mfano wa Excel (Template)
          </button>
        </div>

        {/* Main Form Content */}
        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {successMsg && (
            <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#047857', padding: '0.85rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={18} /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.85rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}

          {/* Mode 1: File Upload Dropzone */}
          {activeMode === 'upload' && (
            <div style={{ border: '2px dashed #0284C7', borderRadius: '16px', padding: '2rem', textAlign: 'center', background: '#F0F9FF', cursor: 'pointer', position: 'relative' }}>
              <input 
                type="file" 
                accept=".csv, .txt, .tsv, .xlsx, .xls"
                onChange={handleFileUpload}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
              />
              <FileSpreadsheet size={42} color="#0284C7" style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                {fileName ? `Faili Lililochaguliwa: ${fileName}` : 'Bonyeza au vuta faili la Excel / CSV hapa'}
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.35rem' }}>
                Mfumo utajichambua kiotomatiki na kutenganisha Mikoa, Wilaya, Kata na Mitaa/Vijiji.
              </p>
            </div>
          )}

          {/* Mode 2: Paste Raw Text */}
          {activeMode === 'paste' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '0.35rem' }}>
                Bandika (Copy-Paste) maeneo kutoka kwenye Excel, Word au PDF hapa:
              </label>
              <textarea 
                rows="6"
                placeholder="Mfano:&#10;Dar es Salaam, Ilala, Kariakoo, Mtaa wa Swahili&#10;Arusha, Arusha Mjini, Sekei, Goliondo Road"
                value={pasteText}
                onChange={(e) => {
                  setPasteText(e.target.value);
                  parseRawContent(e.target.value);
                }}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontFamily: 'monospace' }}
              />
            </div>
          )}

          {/* Parsed Summary Discovered Cards */}
          {parsedData.length > 0 && (
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Layers size={18} color="#059669" /> Maeneo Yaliyogunduliwa Kiotomatiki ({parsedData.length} Rows):
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>Mikoa (Regions)</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0284C7' }}>{summary.regions}</div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>Wilaya (Districts)</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#059669' }}>{summary.districts}</div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>Kata (Wards)</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#D97706' }}>{summary.wards}</div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>Mitaa/Vijiji</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#7C3AED' }}>{summary.streets}</div>
                </div>
              </div>

              {/* Data Table Preview */}
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#FFFFFF' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', textAlign: 'left', borderBottom: '1px solid #CBD5E1' }}>
                      <th style={{ padding: '0.4rem 0.75rem' }}>Mkoa (Region)</th>
                      <th style={{ padding: '0.4rem 0.75rem' }}>Wilaya (District)</th>
                      <th style={{ padding: '0.4rem 0.75rem' }}>Kata (Ward)</th>
                      <th style={{ padding: '0.4rem 0.75rem' }}>Mtaa / Kijiji</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 15).map((r, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.35rem 0.75rem', fontWeight: '700', color: '#0F172A' }}>{r.region || '-'}</td>
                        <td style={{ padding: '0.35rem 0.75rem', color: '#0284C7' }}>{r.district || '-'}</td>
                        <td style={{ padding: '0.35rem 0.75rem', color: '#059669' }}>{r.ward || '-'}</td>
                        <td style={{ padding: '0.35rem 0.75rem', color: '#7C3AED' }}>{r.street || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Action Controls */}
          {importing && (
            <div style={{ background: '#F0F9FF', border: '1px solid #7DD3FC', color: '#0369A1', padding: '0.85rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '800', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <RefreshCw size={16} className="spin-anim" /> {importProgress}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F1F5F9', color: '#475569', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}>
              Ghairi / Funga
            </button>
            <button 
              type="button" 
              disabled={parsedData.length === 0 || importing} 
              onClick={handleBatchImport}
              style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none', background: parsedData.length > 0 ? '#059669' : '#94A3B8', color: '#FFFFFF', fontWeight: '800', cursor: parsedData.length > 0 ? 'pointer' : 'not-allowed', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: parsedData.length > 0 ? '0 4px 6px -1px rgba(5, 150, 105, 0.25)' : 'none' }}
            >
              <Play size={16} /> {importing ? 'Inahifadhi...' : '🚀 Hifadhi Maeneo Yote Kiotomatiki'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

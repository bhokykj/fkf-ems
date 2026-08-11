import React, { useState } from 'react';
import { MapPin, Camera, Image as ImageIcon, Home, ShoppingBag, Truck, Save, X, ExternalLink, RefreshCw, Navigation } from 'lucide-react';

export default function FieldVerificationEvidenceModal({ borrower, onClose, onSave }) {
  const [gpsLocation, setGpsLocation] = useState(borrower?.field_gps_location || '');
  const [residencePhoto, setResidencePhoto] = useState(borrower?.residence_photo_url || '');
  const [businessPhoto, setBusinessPhoto] = useState(borrower?.business_photo_url || '');
  const [workplacePhoto, setWorkplacePhoto] = useState(borrower?.workplace_stand_photo_url || '');
  
  const [loading, setLoading] = useState(false);
  const [gpsFetching, setGpsFetching] = useState(false);

  if (!borrower) return null;

  // Helper to handle image compression and converting to base64
  const handleImageUpload = async (e, setImageState) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const compressedDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxWidth = 600;
            const maxHeight = 600;
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
      setImageState(compressedDataUrl);
    }
  };

  // Fetch current GPS coordinates
  const fetchGpsCoordinates = () => {
    if (!navigator.geolocation) {
      alert('Kifaa chako hakisupport GPS Geolocation.');
      return;
    }
    setGpsFetching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coordsString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setGpsLocation(coordsString);
        setGpsFetching(false);
      },
      (error) => {
        console.error(error);
        alert('Imeshindwa kupata GPS. Tafadhali ruhusu eneo (Location permissions) kwenye browser yako.');
        setGpsFetching(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(borrower.id, {
        field_gps_location: gpsLocation,
        residence_photo_url: residencePhoto,
        business_photo_url: businessPhoto,
        workplace_stand_photo_url: workplacePhoto
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Imefeli kuhifadhi taarifa za nyanjani.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGoogleMaps = () => {
    if (!gpsLocation) return;
    const cleanCoords = gpsLocation.split('(')[0].trim();
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanCoords)}`, '_blank');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '22px', width: '100%', maxWidth: '850px', maxHeight: '95vh', overflowY: 'auto', border: '1.5px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)' }}>
        
        {/* Header Bar */}
        <div style={{ background: '#1E293B', color: '#FFFFFF', padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#0284C7', color: '#FFFFFF', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)' }}>
              <MapPin size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                📍 Uhakiki wa Nyanjani & Geo-Tagging Evidence
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#CBD5E1', margin: 0, fontWeight: '700', marginTop: '0.15rem' }}>
                Mkopaji: {borrower.first_name} {borrower.last_name} (NIDA: {borrower.id_number})
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 1. FIELD GPS LOCATION SECTION */}
          <div style={{ background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '900', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={20} color="#1E40AF" /> 1. FIELD GPS LOCATION (Nyanjani Location Tag)
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={fetchGpsCoordinates}
                  disabled={gpsFetching}
                  style={{ background: '#059669', color: '#FFFFFF', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {gpsFetching ? <RefreshCw size={14} className="spin" /> : <Navigation size={14} />} 
                  {gpsFetching ? 'Inatafuta...' : '📍 Tafuta GPS Sasa'}
                </button>
                {gpsLocation && (
                  <button 
                    type="button" 
                    onClick={handleOpenGoogleMaps}
                    style={{ background: '#0284C7', color: '#FFFFFF', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <ExternalLink size={14} /> Fungua Google Maps
                  </button>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.35rem' }}>
                Coordinate za GPS za Eneo la Nyanjani (Latitude, Longitude):
              </label>
              <input 
                type="text" 
                value={gpsLocation} 
                onChange={(e) => setGpsLocation(e.target.value)}
                placeholder="Bonyeza kitufe cha 'Tafuta GPS Sasa' au ingiza manually (mfano -6.7924, 39.2083)"
                style={{ width: '100%', padding: '0.75rem', background: '#FFFFFF', border: '1.5px solid #93C5FD', borderRadius: '10px', fontSize: '0.9rem', color: '#0F172A', fontWeight: '800' }}
              />
            </div>
          </div>

          {/* 3 PHOTO EVIDENCE CARDS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            
            {/* Card 2: PICHA ZA ANAPOKAA */}
            <div style={{ background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '16px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Home size={18} color="#047857" />
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '900', color: '#0F172A' }}>2. PICHA YA ANAPOKAA</h4>
              </div>

              <div style={{ width: '100%', height: '150px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #CBD5E1', background: '#E2E8F0', position: 'relative' }}>
                {residencePhoto ? (
                  <img src={residencePhoto} alt="Residence Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B', gap: '0.25rem' }}>
                    <ImageIcon size={32} />
                    <span style={{ fontSize: '0.75rem' }}>Bado haijapakiwa</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', background: '#047857', color: '#FFFFFF', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', textAlign: 'center' }}>
                  <Camera size={14} /> Pakia / Piga Picha
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setResidencePhoto)} style={{ display: 'none' }} />
                </label>
                <input 
                  type="text" 
                  value={residencePhoto} 
                  onChange={(e) => setResidencePhoto(e.target.value)} 
                  placeholder="Au ingiza URL..."
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.75rem' }}
                />
              </div>
            </div>

            {/* Card 3: PICHA ZA ANAPOFANYIA BIASHARA */}
            <div style={{ background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '16px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShoppingBag size={18} color="#0284C7" />
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '900', color: '#0F172A' }}>3. PICHA YA BIASHARA</h4>
              </div>

              <div style={{ width: '100%', height: '150px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #CBD5E1', background: '#E2E8F0', position: 'relative' }}>
                {businessPhoto ? (
                  <img src={businessPhoto} alt="Business Premises Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B', gap: '0.25rem' }}>
                    <ImageIcon size={32} />
                    <span style={{ fontSize: '0.75rem' }}>Bado haijapakiwa</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', background: '#0284C7', color: '#FFFFFF', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', textAlign: 'center' }}>
                  <Camera size={14} /> Pakia / Piga Picha
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setBusinessPhoto)} style={{ display: 'none' }} />
                </label>
                <input 
                  type="text" 
                  value={businessPhoto} 
                  onChange={(e) => setBusinessPhoto(e.target.value)} 
                  placeholder="Au ingiza URL..."
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.75rem' }}
                />
              </div>
            </div>

            {/* Card 4: PICHA ZA STENDI AKIWA KAZINI */}
            <div style={{ background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '16px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Truck size={18} color="#B8860B" />
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '900', color: '#0F172A' }}>4. STENDI KAZINI</h4>
              </div>

              <div style={{ width: '100%', height: '150px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #CBD5E1', background: '#E2E8F0', position: 'relative' }}>
                {workplacePhoto ? (
                  <img src={workplacePhoto} alt="Workplace Stand Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B', gap: '0.25rem' }}>
                    <ImageIcon size={32} />
                    <span style={{ fontSize: '0.75rem' }}>Bado haijapakiwa</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', background: '#B8860B', color: '#FFFFFF', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', textAlign: 'center' }}>
                  <Camera size={14} /> Pakia / Piga Picha
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setWorkplacePhoto)} style={{ display: 'none' }} />
                </label>
                <input 
                  type="text" 
                  value={workplacePhoto} 
                  onChange={(e) => setWorkplacePhoto(e.target.value)} 
                  placeholder="Au ingiza URL..."
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.75rem' }}
                />
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1.5px solid #E2E8F0' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.65rem 1.25rem', background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>
              Ghairi
            </button>
            <button type="submit" disabled={loading} style={{ padding: '0.65rem 1.5rem', background: '#047857', border: 'none', color: '#FFFFFF', borderRadius: '8px', fontWeight: '900', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              {loading ? <RefreshCw size={18} className="spin" /> : <Save size={18} />} Hifadhi Hatifungani & Picha za Nyanjani
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

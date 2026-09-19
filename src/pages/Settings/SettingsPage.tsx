import React, { useState, useRef, useEffect } from 'react';
import { useNavigate }     from 'react-router-dom';
import { ChevronLeft, Sun, Moon, Trash2, CreditCard, LayoutGrid, Plus, AtSign, ArrowRight, QrCode, Loader2, Camera, Image, X, Check } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useTheme }        from '../../context/ThemeContext';
import type { AppSettings, MerchantProfile } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import QrScanner from 'qr-scanner';


const THRESHOLDS = [1000, 2000, 5000, 10000];

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useLocalStorage<MerchantProfile | null>('merchant_profile', null);
  const [settings, setSettings] = useLocalStorage<AppSettings>('app_settings', { splitThreshold: 2000 });
  useLocalStorage<unknown[]>('payment_sessions', []);
  const [showConfirm, setShowConfirm] = useState(false);

  // Add UPI State
  const [showAddUpi, setShowAddUpi] = useState(false);
  const [newUpiId, setNewUpiId] = useState('');
  const [newUpiLabel, setNewUpiLabel] = useState('');
  const [upiError, setUpiError] = useState<string | undefined>();
  const [verifyNewUpiId, setVerifyNewUpiId] = useState<string | null>(null);

  // Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [showScanMenu, setShowScanMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  const processScanResult = (text: string) => {
    let parsedPa = '';
    
    try {
      const url = new URL(text);
      if (url.protocol === 'upi:') {
        parsedPa = url.searchParams.get('pa') || '';
      }
    } catch {
      if (text.includes('@')) parsedPa = text;
    }
    
    if (parsedPa) {
      setUpiError(undefined);
      setNewUpiId(parsedPa);
      return true;
    } else {
      setUpiError('Invalid QR code. Please scan a valid UPI QR.');
      return false;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsScanning(true);
    try {
      const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
      const text = typeof result === 'object' && result !== null && 'data' in result ? (result as any).data : result;
      processScanResult(text);
    } catch (err) {
      console.error(err);
      setUpiError('Could not detect QR code in image.');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (showCamera && videoRef.current) {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        result => {
          const text = typeof result === 'object' && result !== null && 'data' in result ? (result as any).data : result;
          if (processScanResult(text)) {
            closeCamera();
          }
        },
        { 
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      
      qrScannerRef.current.start().catch((err) => {
        console.error(err);
        setUpiError('Camera access denied or unavailable.');
        setShowCamera(false);
      });
    }

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    };
  }, [showCamera]);

  const closeCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setShowCamera(false);
  };

  const reset = () => {
    localStorage.clear();
    navigate('/setup');
  };

  const handleVerifyNewUpi = () => {
    const val = newUpiId.trim().toLowerCase();
    if (!val) return;
    if (!val.includes('@')) {
      setUpiError('Enter a valid UPI ID (e.g. name@bank)');
      return;
    }
    if (profile?.upiIds?.includes(val)) {
      setUpiError('UPI ID already added');
      return;
    }
    setUpiError(undefined);
    setVerifyNewUpiId(val);
  };

  const confirmAddNewUpi = () => {
    if (!profile || !verifyNewUpiId) return;
    
    setProfile({
      ...profile,
      upiIds: [...(profile.upiIds || [profile.upiId]), verifyNewUpiId],
      upiLabels: {
        ...(profile.upiLabels || {}),
        [verifyNewUpiId]: newUpiLabel.trim() || 'Additional UPI'
      }
    });
    
    setNewUpiId('');
    setNewUpiLabel('');
    setVerifyNewUpiId(null);
    setShowAddUpi(false);
  };

  const removeUpiId = (idToRemove: string) => {
    if (!profile || !profile.upiIds || profile.upiIds.length <= 1) return;
    setProfile({
      ...profile,
      upiIds: profile.upiIds.filter(id => id !== idToRemove)
    });
  };

  return (
    <div className="app-shell fade-in">
      {/* Hidden file input for gallery */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        style={{ display: 'none' }}
      />

      {/* Live Camera Modal Overlay */}
      {showCamera && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black">
          <div className="relative flex-1 flex flex-col">
            <video 
              ref={videoRef} 
              className="absolute inset-0 w-full h-full object-cover" 
            />
            {/* Modal Header */}
            <div className="absolute top-0 inset-x-0 p-5 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-10">
              <p className="text-white font-bold tracking-wide">Scan UPI QR</p>
              <button 
                onClick={closeCamera}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md active:scale-95 transition-transform"
              >
                <X color="white" strokeWidth={2.5} size={20} />
              </button>
            </div>
            
            {/* Scanning Guide Box */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl"></div>
              </div>
            </div>
            
            <div className="absolute bottom-10 inset-x-0 text-center z-10">
              <p className="text-white/80 text-sm bg-black/40 px-4 py-2 rounded-full inline-block backdrop-blur-md">
                Point camera at a UPI QR code
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="hero-header px-5 pt-12 pb-8 relative z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="icon-circle w-9 h-9 active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <ChevronLeft size={18} strokeWidth={2.5} color="white" />
          </button>
          <h1 className="text-white font-bold text-xl tracking-tight">Settings</h1>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 pb-10 flex flex-col gap-4"
        style={{
          background: 'var(--color-bg)',
          borderRadius: '24px 24px 0 0',
          marginTop: '-20px',
          zIndex: 10,
          position: 'relative',
          paddingTop: '24px',
        }}
      >
        {/* Profile section */}
        <p className="section-label px-1">Merchant Profile</p>
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="icon-circle w-10 h-10 flex-shrink-0" style={{ background: 'var(--color-primary-dim)' }}>
              <CreditCard size={18} strokeWidth={1.75} color="var(--color-primary)" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text-1)' }}>
                {profile?.businessName}
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-3)' }}>
                {profile?.upiId}
              </p>
            </div>
          </div>
        </div>

        {/* UPI IDs Management */}
        <p className="section-label px-1 mt-1">UPI IDs</p>
        <div className="card px-5 py-4 flex flex-col gap-3">
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-2)' }}>
            Tap an account to set it as active for receiving payments.
          </p>
          
          <div className="flex flex-col gap-2">
            {profile?.upiIds?.map((id, index) => {
              const isActive = (settings.paymentMode || profile.upiIds?.[0]) === id;
              return (
                <div 
                  key={id} 
                  onClick={() => setSettings(s => ({ ...s, paymentMode: id }))}
                  className="flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer active:scale-[0.98]"
                  style={{
                    borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border-med)',
                    background: isActive ? 'var(--color-primary-dim)' : 'transparent'
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="icon-circle w-8 h-8 flex-shrink-0" style={{ background: 'var(--color-surface-2)' }}>
                      <AtSign size={14} strokeWidth={2} color="var(--color-text-2)" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold truncate" style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-1)' }}>
                        {profile.upiLabels?.[id] || (index === 0 ? 'Primary Account' : id)}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5 truncate" style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-3)', opacity: isActive ? 0.8 : 1 }}>
                        {index === 0 ? `PRIMARY • ${id}` : id}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && <Check size={18} color="var(--color-primary)" strokeWidth={2.5} />}
                    {profile.upiIds!.length > 1 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeUpiId(id); }}
                        className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-90 transition-all flex-shrink-0"
                      >
                        <Trash2 size={16} color="var(--color-danger)" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setShowAddUpi(true)}
            className="flex items-center justify-center gap-2 w-full py-3 mt-1 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
            style={{ background: 'var(--color-primary-dim)', color: 'var(--color-primary)' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Another UPI ID
          </button>
        </div>

        {/* Split threshold */}
        <p className="section-label px-1 mt-1">Split Threshold</p>
        <div className="card px-5 py-4 flex flex-col gap-3">
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-2)' }}>
            Amounts above this limit will be suggested for splitting.
          </p>
          <div className="grid grid-cols-4 gap-2">
            {THRESHOLDS.map(t => {
              const active = settings.splitThreshold === t;
              return (
                <button
                  key={t}
                  onClick={() => setSettings(s => ({ ...s, splitThreshold: t }))}
                  className="py-2 rounded-2xl text-sm font-bold transition-all"
                  style={
                    active
                      ? { background: 'var(--color-primary)', color: '#fff' }
                      : { background: 'var(--color-surface-2)', color: 'var(--color-text-2)', border: '1px solid var(--color-border)' }
                  }
                >
                  ₹{t >= 1000 ? `${t / 1000}K` : t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Appearance */}
        <p className="section-label px-1 mt-1">Appearance</p>
        <div className="card overflow-hidden">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="icon-circle w-9 h-9" style={{ background: 'var(--color-surface-2)' }}>
                {theme === 'dark'
                  ? <Moon size={16} strokeWidth={1.75} color="var(--color-primary)" />
                  : <Sun size={16} strokeWidth={1.75} color="var(--color-primary)" />
                }
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-1)' }}>
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>
                  Tap to switch
                </p>
              </div>
            </div>

            {/* Toggle pill */}
            <div
              className="w-12 h-6 rounded-full relative transition-all"
              style={{
                background: theme === 'dark' ? 'var(--color-primary)' : 'var(--color-border-med)',
              }}
            >
              <span
                className="absolute top-1 w-4 h-4 rounded-full transition-all"
                style={{
                  background: 'white',
                  left: theme === 'dark' ? '26px' : '4px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }}
              />
            </div>
          </button>
        </div>

        {/* About */}
        <p className="section-label px-1 mt-1">About</p>
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="icon-circle w-9 h-9" style={{ background: 'var(--color-primary-dim)' }}>
              <LayoutGrid size={16} strokeWidth={1.75} color="var(--color-primary)" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-1)' }}>UPI Flow</p>
              <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>v1.0.0 · Offline-first</p>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <p className="section-label px-1 mt-1" style={{ color: 'var(--color-danger)' }}>Danger Zone</p>
        {!showConfirm ? (
          <button
            className="card px-5 py-4 w-full flex items-center gap-3 active:scale-[0.99] transition-transform"
            onClick={() => setShowConfirm(true)}
          >
            <div className="icon-circle w-9 h-9" style={{ background: 'rgba(239,68,68,0.08)' }}>
              <Trash2 size={16} strokeWidth={1.75} color="#EF4444" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: '#EF4444' }}>Reset All Data</p>
              <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>Clears profile, history and settings</p>
            </div>
          </button>
        ) : (
          <div className="card px-5 py-5 flex flex-col gap-4">
            <p className="text-sm font-medium text-center" style={{ color: 'var(--color-text-1)' }}>
              This will erase everything. Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                className="btn-secondary flex-1"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 h-12 rounded-full text-sm font-bold text-white transition-all active:scale-95"
                style={{ background: '#EF4444' }}
                onClick={reset}
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add UPI Modal Overlay */}
      {showAddUpi && !verifyNewUpiId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm fade-in sm:items-center sm:p-5">
          <div className="bg-white dark:bg-[#1A1A2E] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 flex flex-col gap-5 slide-up sm:pop-in pb-10 sm:pb-6">
            <div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-1)' }}>Add UPI ID</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-3)' }}>Enter another UPI ID for round-robin payments.</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="relative">
                <input
                  className="input-field"
                  placeholder="Label (e.g. HDFC Account)"
                  value={newUpiLabel}
                  onChange={e => setNewUpiLabel(e.target.value)}
                  autoCapitalize="words"
                  style={{ paddingLeft: '14px' }}
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-2)' }}>UPI ID</span>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowScanMenu(!showScanMenu)}
                      className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors active:scale-95 px-2 py-1 rounded-md"
                      style={{ color: 'var(--color-primary)', background: 'var(--color-primary-dim)' }}
                      type="button"
                      disabled={isScanning || showCamera}
                    >
                      {isScanning ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <QrCode size={12} strokeWidth={2.5} />
                      )}
                      {isScanning ? 'Scanning...' : 'Scan Image'}
                    </button>
                    
                    {showScanMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-[60]" 
                          onClick={() => setShowScanMenu(false)}
                        />
                        <div className="absolute right-0 bottom-full mb-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-[70] overflow-hidden fade-in origin-bottom-right dark:bg-[#1A1A2E] dark:border-gray-800">
                          <button
                            className="w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-gray-50 active:bg-gray-100 transition-colors dark:hover:bg-[#222236] dark:text-gray-100"
                            onClick={() => { setShowCamera(true); setShowScanMenu(false); }}
                            type="button"
                          >
                            <Camera size={14} className="text-gray-500 dark:text-gray-400" />
                            Use Camera
                          </button>
                          <button
                            className="w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-gray-50 active:bg-gray-100 transition-colors dark:hover:bg-[#222236] dark:text-gray-100"
                            onClick={() => { fileInputRef.current?.click(); setShowScanMenu(false); }}
                            type="button"
                          >
                            <Image size={14} className="text-gray-500 dark:text-gray-400" />
                            Upload Album
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <span
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--color-text-3)' }}
                  >
                    <AtSign size={16} strokeWidth={1.75} />
                  </span>
                  <input
                    className="input-field"
                    placeholder="yourname@bank"
                    value={newUpiId}
                    onChange={e => setNewUpiId(e.target.value)}
                    autoCapitalize="none"
                    autoComplete="off"
                    inputMode="email"
                  />
                </div>
                {upiError && (
                  <p className="text-xs font-medium ml-1" style={{ color: 'var(--color-danger)' }}>
                    {upiError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button 
                className="btn-secondary flex-1"
                onClick={() => { setShowAddUpi(false); setNewUpiId(''); setNewUpiLabel(''); setUpiError(undefined); }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary flex-1"
                style={{ height: '46px', fontSize: '0.9rem' }} 
                onClick={handleVerifyNewUpi}
              >
                Verify QR
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify QR Modal Overlay */}
      {verifyNewUpiId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm fade-in">
          <div className="card w-full max-w-[320px] p-6 flex flex-col items-center pop-in">
            <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--color-text-1)' }}>Verify QR Code</h3>
            <p className="text-sm text-center mb-6 leading-relaxed" style={{ color: 'var(--color-text-3)' }}>
              Scan this with your personal phone to ensure it opens your UPI app correctly.
            </p>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <QRCodeSVG 
                value={`upi://pay?pa=${verifyNewUpiId}&pn=${encodeURIComponent(profile?.businessName || 'Merchant')}`} 
                size={180}
              />
            </div>
            
            <p className="font-semibold text-sm mb-6 text-center" style={{ color: 'var(--color-text-2)' }}>
              {verifyNewUpiId}
            </p>
            
            <div className="flex gap-3 w-full">
              <button 
                className="btn-secondary flex-1"
                onClick={() => setVerifyNewUpiId(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary flex-1"
                style={{ height: '46px', fontSize: '0.9rem' }} 
                onClick={confirmAddNewUpi}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

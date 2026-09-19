import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, AtSign, ArrowRight, QrCode, Loader2, Camera, Image, X } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { MerchantProfile } from '../../types';
import { generateShortId } from '../../core/splitter';
import QrScanner from 'qr-scanner';
import { QRCodeSVG } from 'qrcode.react';

export const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [, setProfile] = useLocalStorage<MerchantProfile | null>('merchant_profile', null);
  
  const [businessName, setBusinessName] = useState('');
  const [upiId, setUpiId]               = useState('');
  
  const [errors, setErrors]             = useState<{ businessName?: string; upiId?: string }>({});
  
  // File Scanning State
  const [isScanning, setIsScanning]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Camera & Menu State
  const [showScanMenu, setShowScanMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  // Verification Modal State
  const [verifyUpiId, setVerifyUpiId] = useState<string | null>(null);

  const validate = () => {
    const next: typeof errors = {};
    if (!businessName.trim()) next.businessName = 'Business name is required';
    if (!upiId.trim())        next.upiId = 'UPI ID is required';
    else if (!upiId.includes('@')) next.upiId = 'Enter a valid UPI ID (e.g. name@bank)';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleContinueClick = () => {
    if (!validate()) return;
    setVerifyUpiId(upiId.trim().toLowerCase());
  };

  const confirmAndSave = () => {
    if (!verifyUpiId) return;
    setProfile({
      id: generateShortId(),
      businessName: businessName.trim(),
      upiId: verifyUpiId, // primary
      upiIds: [verifyUpiId],
      createdAt: Date.now(),
    });
    navigate('/');
  };

  const processScanResult = (text: string) => {
    let parsedPa = '';
    let parsedPn = '';
    
    try {
      const url = new URL(text);
      if (url.protocol === 'upi:') {
        parsedPa = url.searchParams.get('pa') || '';
        parsedPn = url.searchParams.get('pn') || '';
      }
    } catch {
      // Not a URL, treat as raw text
      if (text.includes('@')) parsedPa = text;
    }
    
    if (parsedPa) {
      if (parsedPn && !businessName) {
        setBusinessName(parsedPn);
      }
      setErrors(prev => ({ ...prev, upiId: undefined }));
      setUpiId(parsedPa);
      setVerifyUpiId(parsedPa);
      return true;
    } else {
      setErrors(prev => ({ ...prev, upiId: 'Invalid QR code. Please scan a valid UPI QR.' }));
      return false;
    }
  };

  // ─── File Upload Logic ───
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
      setErrors(prev => ({ ...prev, upiId: 'Could not detect QR code in image.' }));
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ─── Live Camera Logic ───
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
        setErrors(prev => ({ ...prev, upiId: 'Camera access denied or unavailable.' }));
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
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
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

      {/* Verify QR Modal Overlay */}
      {verifyUpiId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm fade-in">
          <div className="card w-full max-w-[320px] p-6 flex flex-col items-center pop-in">
            <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--color-text-1)' }}>Verify QR Code</h3>
            <p className="text-sm text-center mb-6 leading-relaxed" style={{ color: 'var(--color-text-3)' }}>
              Scan this with your personal phone to ensure it opens your UPI app correctly.
            </p>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <QRCodeSVG 
                value={`upi://pay?pa=${verifyUpiId}&pn=${encodeURIComponent(businessName || 'Merchant')}`} 
                size={180}
              />
            </div>
            
            <p className="font-semibold text-sm mb-6 text-center" style={{ color: 'var(--color-text-2)' }}>
              {verifyUpiId}
            </p>
            
            <div className="flex gap-3 w-full">
              <button 
                className="btn-secondary flex-1"
                onClick={() => setVerifyUpiId(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary flex-1"
                style={{ height: '46px', fontSize: '0.9rem' }} 
                onClick={confirmAndSave}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero gradient top */}
      <div className="hero-header px-6 pt-16 pb-10 relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white" />
              <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.6" />
              <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.6" />
              <rect x="13" y="13" width="3" height="3" rx="0.75" fill="white" />
              <rect x="11" y="11" width="3" height="3" rx="0.75" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">UPI Flow</span>
        </div>

        <h1 className="text-white font-extrabold text-[2rem] leading-tight tracking-tight mb-2">
          Set up your<br />UPI Flow account.
        </h1>
        <p className="text-white/60 text-sm leading-relaxed">
          All data stays on this device. No accounts, no cloud.
        </p>
      </div>

      {/* White card form below hero */}
      <div className="flex-1 flex flex-col" style={{ marginTop: '-20px' }}>
        <div
          className="flex-1 flex flex-col px-5 pt-7 pb-10 gap-5"
          style={{ background: 'var(--color-bg)', borderRadius: '24px 24px 0 0' }}
        >
          {/* Business Name */}
          <div className="flex flex-col gap-1.5">
            <label className="section-label px-1">Business Name or Name</label>
            <div className="relative">
              <span
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--color-text-3)' }}
              >
                <Building2 size={16} strokeWidth={1.75} />
              </span>
              <input
                className="input-field"
                placeholder="e.g. Sharma Enterprises"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                autoCapitalize="words"
                autoComplete="organization"
              />
            </div>
            {errors.businessName && (
              <p className="text-xs font-medium ml-1" style={{ color: 'var(--color-danger)' }}>
                {errors.businessName}
              </p>
            )}
          </div>

          {/* UPI ID */}
          <div className="flex flex-col gap-1.5">
            <label className="section-label px-1 flex justify-between items-end">
              <span>Primary UPI ID</span>
              
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
                      className="fixed inset-0 z-20" 
                      onClick={() => setShowScanMenu(false)}
                    />
                    <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-30 overflow-hidden fade-in origin-top-right dark:bg-[#1A1A2E] dark:border-gray-800">
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
            </label>
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
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                autoCapitalize="none"
                autoComplete="off"
                inputMode="email"
              />
            </div>
            {errors.upiId && (
              <p className="text-xs font-medium ml-1" style={{ color: 'var(--color-danger)' }}>
                {errors.upiId}
              </p>
            )}
          </div>

          {/* Disclaimer */}
          <div
            className="rounded-2xl p-4 flex gap-3"
            style={{ background: 'rgba(232,67,90,0.05)', border: '1px solid rgba(232,67,90,0.10)' }}
          >
            <div
              className="icon-circle w-7 h-7 flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(232,67,90,0.10)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#E8435A" strokeWidth="1.5"/>
                <path d="M7 4.5V7.5" stroke="#E8435A" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="7" cy="9.5" r="0.75" fill="#E8435A"/>
              </svg>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-2)' }}>
              This app only generates QR codes. All payments flow through your bank's UPI infrastructure. No money is held or processed here.
            </p>
          </div>

          <div className="flex-1" />

          <button
            className="btn-primary w-full"
            onClick={handleContinueClick}
            disabled={isScanning || showCamera}
          >
            Continue
            <ArrowRight size={18} strokeWidth={2} />
          </button>
          
          <p className="text-center text-[10px] font-medium tracking-wide mt-2" style={{ color: 'var(--color-text-3)' }}>
            Designed & Developed by ManSula DivLabs & ManSula
          </p>
        </div>
      </div>
    </div>
  );
};

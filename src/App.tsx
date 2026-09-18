import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SetupPage }    from './pages/Setup/SetupPage';
import { HomePage }     from './pages/Home/HomePage';
import { SplitPage }    from './pages/Split/SplitPage';
import { SessionPage }  from './pages/Session/SessionPage';
import { HistoryPage }  from './pages/History/HistoryPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import type { MerchantProfile } from './types';

// Check if merchant is set up
function getProfile(): MerchantProfile | null {
  try {
    const raw = localStorage.getItem('merchant_profile');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const RequireSetup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const profile = getProfile();
  return profile ? <>{children}</> : <Navigate to="/setup" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      {/* Full-height background with subtle gradient */}
      <div className="min-h-dvh">
        <Routes>
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/" element={<RequireSetup><HomePage /></RequireSetup>} />
          <Route path="/split" element={<RequireSetup><SplitPage /></RequireSetup>} />
          <Route path="/session/new" element={<RequireSetup><SessionPage /></RequireSetup>} />
          <Route path="/history" element={<RequireSetup><HistoryPage /></RequireSetup>} />
          <Route path="/settings" element={<RequireSetup><SettingsPage /></RequireSetup>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

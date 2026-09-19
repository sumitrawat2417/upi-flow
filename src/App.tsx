import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SetupPage }    from './pages/Setup/SetupPage';
import { HomePage }     from './pages/Home/HomePage';
import { SplitPage }    from './pages/Split/SplitPage';
import { SessionPage }  from './pages/Session/SessionPage';
import { HistoryPage }  from './pages/History/HistoryPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import type { MerchantProfile } from './types';

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
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/" element={<RequireSetup><HomePage /></RequireSetup>} />
          <Route path="/split" element={<RequireSetup><SplitPage /></RequireSetup>} />
          <Route path="/session/new" element={<RequireSetup><SessionPage /></RequireSetup>} />
          <Route path="/history" element={<RequireSetup><HistoryPage /></RequireSetup>} />
          <Route path="/settings" element={<RequireSetup><SettingsPage /></RequireSetup>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

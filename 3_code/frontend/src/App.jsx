import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initializeIAP } from './iap';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Support from './components/Support';
import FeaturePage from './components/FeaturePage';
import MajorPage from './components/MajorPage';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  useEffect(() => {
    // Wrap in try-catch to prevent app crash if plugin is missing
    try {
      initializeIAP();
    } catch (e) {
      console.error("IAP Init Failed", e);
    }
  }, []);

  return (
    <HashRouter>
      <Routes>
        {/* Public SEO Routes */}
        <Route path="/features/:featureId" element={<FeaturePage />} />
        <Route path="/for/:majorId" element={<MajorPage />} />

        {/* Core Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/support" element={<Support onBack={() => window.history.back()} />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </HashRouter>
  );
}

export default App;

import React, { useState } from 'react';
import { StudentProvider, useStudent } from './context/StudentContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SkillGapPage from './pages/SkillGapPage';
import CareerPage from './pages/CareerPage';
import ResourcesPage from './pages/ResourcesPage';
import ReportsPage from './pages/ReportsPage';
import { Cpu, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import './App.css';

const MainShell = () => {
  const { activeTab, setActiveTab, isAuthenticated, authInitializing, notification } = useStudent();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Loading Splash Screen while checking auth token
  if (authInitializing) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #090e1a 0%, #0f172a 100%)',
        color: '#ffffff'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '48px 40px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'var(--shadow-xl)',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-gradient)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: 'var(--primary-glow)',
            animation: 'pulseGlow 2s infinite ease-in-out'
          }}>
            <Cpu size={30} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Initializing PlacementAI
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Authorizing session & retrieving student records...
          </p>
        </div>
      </div>
    );
  }

  // Not Authenticated -> Show Split Auth Page
  if (!isAuthenticated || activeTab === 'auth') {
    return <AuthPage />;
  }

  return (
    <div className="app-container">
      {/* Toast Notification Container */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 9999,
          padding: '14px 22px',
          borderRadius: 'var(--radius-md)',
          background: notification.type === 'success' ? '#065f46' : (notification.type === 'danger' ? '#991b1b' : '#1e3a8a'),
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.875rem',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.25s ease'
        }}>
          {notification.type === 'success' && <CheckCircle2 size={18} color="#34d399" />}
          {notification.type === 'danger' && <AlertCircle size={18} color="#f87171" />}
          {notification.type !== 'success' && notification.type !== 'danger' && <Info size={18} color="#93c5fd" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main SaaS Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Viewport */}
      <div className="app-main-wrapper">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="app-content">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'profile' && <ProfilePage />}
          {activeTab === 'skillgap' && <SkillGapPage />}
          {activeTab === 'recommend' && <CareerPage />}
          {activeTab === 'resources' && <ResourcesPage />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'settings' && (
            <div className="card animate-fade-in" style={{ padding: '36px', maxWidth: '680px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Account Settings</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
                Manage your credentials, LLM gateway preferences, and academic sync.
              </p>
              <div className="form-group">
                <label className="form-label">Theme Mode</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary btn-sm">Enterprise Light (Active)</button>
                  <button className="btn btn-secondary btn-sm" disabled>High Contrast Dark (Coming Soon)</button>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="form-label">AI Engine Provider</label>
                <input className="form-input" readOnly value="Placement Rule & ML TF-IDF Matching Engine (v1.0)" />
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

function App() {
  return (
    <StudentProvider>
      <MainShell />
    </StudentProvider>
  );
}

export default App;

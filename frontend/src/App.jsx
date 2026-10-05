import React from 'react';
import { StudentProvider, useStudent } from './context/StudentContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import SkillGapPage from './pages/SkillGapPage';
import CareerPage from './pages/CareerPage';
import { Cpu } from 'lucide-react';

const MainContent = () => {
  const { activeTab, isAuthenticated, authInitializing, notification } = useStudent();

  // Show authentication initialization loading screen while validating session with backend
  if (authInitializing) {
    return (
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px', minHeight: 'calc(100vh - 180px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px', borderRadius: '18px', background: 'rgba(18, 24, 38, 0.75)', border: '1px solid var(--border-color)' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary), var(--purple))',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-glow)',
            animation: 'pulse 1.5s infinite ease-in-out'
          }}>
            <Cpu size={28} color="#fff" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Validating Session...</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>Verifying authentication credentials with Placement AI server</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 180px)' }}>
      
      {/* Toast Notification Popup */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.9)' : (notification.type === 'danger' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(99, 102, 241, 0.9)'),
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.9rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {notification.message}
        </div>
      )}

      {/* Protected Access Router */}
      {!isAuthenticated || activeTab === 'auth' ? (
        <AuthPage />
      ) : (
        <>
          {activeTab === 'profile' && <ProfilePage />}
          {activeTab === 'skillgap' && <SkillGapPage />}
          {activeTab === 'recommend' && <CareerPage />}
        </>
      )}
    </main>
  );
};

function App() {
  return (
    <StudentProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
        <Navbar />
        <MainContent />
        <Footer />
      </div>
    </StudentProvider>
  );
}

export default App;

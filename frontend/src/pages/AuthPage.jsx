import React, { useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { loginUser, registerUser } from '../services/api';
import { LogIn, UserPlus, Lock, Mail, ArrowRight, ShieldCheck, GraduationCap, CheckCircle2 } from 'lucide-react';

const AuthPage = () => {
  const { login, showNotification } = useStudent();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (authMode === 'register') {
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'login') {
        const res = await loginUser(email, password);
        if (res.status === 'success') {
          login(res.token, res.user, res.student_profile);
        }
      } else {
        const res = await registerUser(email, password, confirmPassword);
        if (res.status === 'success') {
          showNotification('Account created successfully!', 'success');
          login(res.token, res.user, res.student_profile);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please check your credentials.';
      setErrorMsg(msg);
      showNotification(msg, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-split-container animate-fade-in">
      
      {/* Left Visual Branding Panel */}
      <div className="auth-left-panel">
        <div className="auth-brand">
          <div className="sidebar-brand-icon" style={{ width: '42px', height: '42px' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>PlacementAI</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Career Recommendation System</div>
          </div>
        </div>

        <div className="auth-hero-card">
          <h1 className="auth-hero-title">
            Your Skills.<br />
            Our Guidance.<br />
            <span style={{ color: '#60a5fa' }}>A Brighter Future.</span>
          </h1>
          <p className="auth-hero-subtitle">
            Upload your resume, analyze technical skill gaps against benchmark industry job roles, and discover personalized career recommendations.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <CheckCircle2 size={16} />
              </div>
              <span>Automated Resume Entity Parsing (PDF & DOCX)</span>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <CheckCircle2 size={16} />
              </div>
              <span>Standardized Technical Skill Taxonomy Mapping</span>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <CheckCircle2 size={16} />
              </div>
              <span>Weighted Core, Secondary & Soft Skill Gap Analysis</span>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <CheckCircle2 size={16} />
              </div>
              <span>100-Point Composite Career Suitability Model</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Final-Year Engineering Project &copy; {new Date().getFullYear()} PlacementAI Portal
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="auth-right-panel">
        <div className="auth-card">
          
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {authMode === 'login' ? 'Student Portal Sign In' : 'Create Student Account'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {authMode === 'login'
                ? 'Enter your email and password to access your student profile.'
                : 'Fill in your details below to register your student profile.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', padding: '4px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: authMode === 'login' ? '#ffffff' : 'transparent',
                color: authMode === 'login' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: authMode === 'login' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <LogIn size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: authMode === 'register' ? '#ffffff' : 'transparent',
                color: authMode === 'register' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: authMode === 'register' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <UserPlus size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
              Register Account
            </button>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              fontSize: '0.85rem',
              marginBottom: '20px',
              fontWeight: 500
            }}>
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} color="var(--text-muted)" /> Email Address
              </label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} color="var(--text-muted)" /> Password
              </label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {authMode === 'register' && (
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="var(--text-muted)" /> Confirm Password
                </label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px', padding: '12px' }}
            >
              {isSubmitting ? 'Authenticating...' : (authMode === 'login' ? 'Sign In to Portal' : 'Create Account')}
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {authMode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
                  style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                  style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default AuthPage;

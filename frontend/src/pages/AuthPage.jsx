import React, { useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { loginUser, registerUser } from '../services/api';
import { 
  LogIn, 
  UserPlus, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  GraduationCap, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  EyeOff,
  Zap
} from 'lucide-react';

const AuthPage = () => {
  const { login, showNotification } = useStudent();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDemoFill = () => {
    setEmail('demo.student@placement.ai');
    setPassword('demo123456');
    setConfirmPassword('demo123456');
  };

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
          showNotification('Account registered successfully! Welcome aboard.', 'success');
          login(res.token, res.user, res.student_profile);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication error. Please verify your credentials.';
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
          <div className="sidebar-brand-icon" style={{ width: '44px', height: '44px' }}>
            <GraduationCap size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#fff' }}>
              Placement<span style={{ color: '#60a5fa' }}>AI</span>
              <span className="sidebar-brand-tag" style={{ marginLeft: '8px' }}>PRO</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Automated Campus Placement Intelligence
            </div>
          </div>
        </div>

        <div className="auth-hero-card">
          <h1 className="auth-hero-title">
            Your Talents.<br />
            Our Algorithms.<br />
            <span>Optimal Placements.</span>
          </h1>

          <p className="auth-hero-subtitle">
            Upload student resumes, parse skills into standard industry taxonomy, run multi-factor delta evaluations, and receive tailored career recommendations.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <CheckCircle2 size={16} />
              </div>
              <span>Automated Resume Ingestion & NLP NER Skill Extraction</span>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <CheckCircle2 size={16} />
              </div>
              <span>Hierarchical Software & Engineering Skill Taxonomy</span>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <CheckCircle2 size={16} />
              </div>
              <span>Multi-Criteria Suitability Scoring (Skills, CGPA, Projects)</span>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <CheckCircle2 size={16} />
              </div>
              <span>Targeted Learning Roadmap & Curriculum Suggestions</span>
            </div>
          </div>
        </div>

        {/* Live System Badge */}
        <div style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '520px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Connected to MongoDB Benchmark Engine</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 600 }}>6 Job Tracks Live</span>
        </div>
      </div>

      {/* Right Authentication Form Panel */}
      <div className="auth-right-panel">
        <div className="auth-card">
          
          {/* Header Switcher */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
              {authMode === 'login' ? 'Sign in to Portal' : 'Create an Account'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {authMode === 'login' 
                ? 'Access your student dashboard and career assessments' 
                : 'Register your email to begin your placement evaluations'}
            </p>

            {/* Segmented Tab */}
            <div className="tab-segmented" style={{ width: '100%', marginTop: '20px', display: 'flex' }}>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                className={`tab-btn ${authMode === 'login' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <LogIn size={15} /> Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
                className={`tab-btn ${authMode === 'register' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <UserPlus size={15} /> Create Account
              </button>
            </div>
          </div>

          {/* Quick Demo Credentials Helper */}
          <div style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--primary-light)',
            border: '1px solid var(--primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Quick Evaluation?</span>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="btn btn-primary btn-sm"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              Fill Demo Credentials
            </button>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '20px'
            }}>
              {errorMsg}
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span>Institutional Email</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span>Password</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '11px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-light)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {authMode === 'register' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  <span>Confirm Password</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '12px', gap: '8px' }}
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{authMode === 'login' ? 'Sign In to Portal' : 'Register Account'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Protected by placement system role-based JWT authentication.
          </div>

        </div>
      </div>

    </div>
  );
};

export default AuthPage;

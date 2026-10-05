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
  User,
  Phone,
  BookOpen,
  Award,
  Zap
} from 'lucide-react';

const AuthPage = () => {
  const { login, showNotification } = useStudent();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Common credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Dynamic user profile fields for registration
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState('2025');
  const [cgpa, setCgpa] = useState('');
  const [initialSkills, setInitialSkills] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDemoFill = () => {
    if (authMode === 'login') {
      setEmail('demo.student@placement.ai');
      setPassword('demo123456');
    } else {
      setName('Sarah Jenkins');
      setEmail('sarah.jenkins@university.edu');
      setPhone('+91 9123456780');
      setPassword('demo123456');
      setConfirmPassword('demo123456');
      setDegree('B.Tech');
      setBranch('Information Technology');
      setGraduationYear('2025');
      setCgpa('8.7');
      setInitialSkills('Java, Python, React, SQL, Git');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    if (authMode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Please provide your full name.');
        return;
      }
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
        const skillsArray = initialSkills
          ? initialSkills.split(',').map(s => s.trim()).filter(Boolean)
          : [];

        const payload = {
          name: name.trim(),
          email: email.trim(),
          password,
          confirm_password: confirmPassword,
          phone: phone.trim(),
          degree: degree.trim() || 'B.Tech',
          branch: branch.trim() || 'Computer Science & Engineering',
          graduation_year: parseInt(graduationYear) || 2025,
          cgpa: parseFloat(cgpa) || 0.0,
          skills: skillsArray
        };

        const res = await registerUser(payload);
        if (res.status === 'success') {
          showNotification(`Account created successfully! Welcome, ${res.student_profile?.personal_info?.name || name}!`, 'success');
          login(res.token, res.user, res.student_profile);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication error. Please verify your details.';
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
            Create your personalized candidate profile, auto-extract resume competencies, evaluate skill gaps against industry benchmarks, and discover optimal career recommendations.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <CheckCircle2 size={16} />
              </div>
              <span>Custom Student Profile & Academic Eligibility Tracking</span>
            </div>
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
              <span>Multi-Factor Benchmark Suitability Scoring</span>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <CheckCircle2 size={16} />
              </div>
              <span>Tailored Skill-Gap Roadmaps for Placement Drives</span>
            </div>
          </div>
        </div>

        {/* Live System Badge */}
        <div style={{
          padding: '14px 18px',
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
          <span style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 600 }}>6 Tracks Ready</span>
        </div>
      </div>

      {/* Right Authentication Form Panel */}
      <div className="auth-right-panel" style={{ overflowY: 'auto' }}>
        <div className="auth-card" style={{ maxWidth: authMode === 'register' ? '540px' : '440px', padding: authMode === 'register' ? '32px 36px' : '40px 36px' }}>
          
          {/* Header Switcher */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
              {authMode === 'login' ? 'Sign in to Portal' : 'Create Candidate Profile'}
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {authMode === 'login' 
                ? 'Access your student dashboard and career assessments' 
                : 'Enter your personal and academic details to set up your account'}
            </p>

            {/* Segmented Tab */}
            <div className="tab-segmented" style={{ width: '100%', marginTop: '16px', display: 'flex' }}>
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
                <UserPlus size={15} /> Register Candidate
              </button>
            </div>
          </div>

          {/* Quick Demo Helper */}
          <div style={{
            marginBottom: '18px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--primary-light)',
            border: '1px solid var(--primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={15} color="var(--primary)" />
              <span style={{ fontSize: '0.775rem', color: 'var(--primary)', fontWeight: 600 }}>Quick Evaluation?</span>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="btn btn-primary btn-sm"
              style={{ padding: '3px 10px', fontSize: '0.725rem' }}
            >
              Fill Sample Data
            </button>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              fontSize: '0.825rem',
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* REGISTER-ONLY USER DETAILS */}
            {authMode === 'register' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Full Name *</label>
                    <div style={{ position: 'relative' }}>
                      <User size={15} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah Jenkins"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '34px', fontSize: '0.825rem' }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={15} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '34px', fontSize: '0.825rem' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Degree *</label>
                    <select
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.825rem' }}
                    >
                      <option value="B.Tech">B.Tech</option>
                      <option value="B.E">B.E</option>
                      <option value="BCA">BCA</option>
                      <option value="MCA">MCA</option>
                      <option value="M.Tech">M.Tech</option>
                      <option value="B.Sc">B.Sc Computer Science</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Graduation Year *</label>
                    <input
                      type="number"
                      min="2020"
                      max="2032"
                      required
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.825rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Branch / Department *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Computer Science"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.825rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">CGPA (0 - 10)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="e.g. 8.4"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.825rem' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    <span>Initial Technical Skills (comma separated)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Python, React, SQL, Java, Git"
                    value={initialSkills}
                    onChange={(e) => setInitialSkills(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.825rem' }}
                  />
                </div>
              </>
            )}

            {/* EMAIL */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Institutional / Contact Email *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '34px', fontSize: '0.825rem' }}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '34px', paddingRight: '36px', fontSize: '0.825rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-light)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            {authMode === 'register' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '34px', fontSize: '0.825rem' }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '6px', gap: '8px' }}
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{authMode === 'login' ? 'Sign In to Dashboard' : 'Register Candidate Profile'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

          </form>

          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            All candidate profiles are securely stored in MongoDB and authenticated with JWT.
          </div>

        </div>
      </div>

    </div>
  );
};

export default AuthPage;

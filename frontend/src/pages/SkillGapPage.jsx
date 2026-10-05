import React, { useState, useEffect } from 'react';
import { useStudent } from '../context/StudentContext';
import { fetchCareerRoles, analyzeSkillGap } from '../services/api';
import { 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Info, 
  Layers, 
  XCircle, 
  TrendingUp, 
  Award,
  ChevronRight,
  BookOpen
} from 'lucide-react';

const SkillGapPage = () => {
  const { studentProfile, selectedTargetRole, setSelectedTargetRole, setActiveTab, showNotification } = useStudent();
  
  const [careerRoles, setCareerRoles] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const studentSkills = studentProfile.parsed_profile?.skills || [];
  const hasSkills = studentSkills.length > 0;

  // Fetch benchmark target career roles from REST API
  useEffect(() => {
    const loadCareers = async () => {
      try {
        const res = await fetchCareerRoles();
        if (res.status === 'success' && res.data.length > 0) {
          setCareerRoles(res.data);
          if (!selectedTargetRole) {
            setSelectedTargetRole(res.data[0]);
          }
        }
      } catch (err) {
        showNotification("Failed to load career roles.", "danger");
      }
    };
    loadCareers();
  }, []);

  // Run Skill-Gap Analysis whenever target role or profile skills change
  useEffect(() => {
    if (selectedTargetRole) {
      runSkillGapAnalysis(selectedTargetRole.role_id);
    }
  }, [selectedTargetRole, studentProfile]);

  const runSkillGapAnalysis = async (roleId) => {
    setIsLoading(true);
    // If target role is a live job or has custom required_skills
    if (selectedTargetRole && (selectedTargetRole.id || !careerRoles.some(r => r.role_id === roleId))) {
      let rawList = selectedTargetRole.required_skills || selectedTargetRole.tags || [];
      if (!Array.isArray(rawList) && typeof rawList === 'object') {
        rawList = rawList.core || [];
      }
      const reqSkills = rawList.map(s => typeof s === 'string' ? s : (s.name || String(s)));
      const matched = reqSkills.filter(s => 
        studentSkills.some(sk => sk.toLowerCase().trim() === s.toLowerCase().trim() || sk.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(sk.toLowerCase()))
      );
      const missing = reqSkills.filter(s => 
        !studentSkills.some(sk => sk.toLowerCase().trim() === s.toLowerCase().trim() || sk.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(sk.toLowerCase()))
      );
      const matchPct = reqSkills.length > 0 ? Math.round((matched.length / reqSkills.length) * 100) : (studentSkills.length > 0 ? 70 : 0);
      setAnalysisResult({
        skill_match_percentage: matchPct,
        skill_gap_percentage: 100 - matchPct,
        matching_skills: matched,
        missing_skills: missing
      });
      setIsLoading(false);
      return;
    }

    try {
      const res = await analyzeSkillGap(studentProfile.student_id, roleId, studentSkills);
      if (res.status === 'success') {
        setAnalysisResult(res.data);
      }
    } catch (err) {
      if (selectedTargetRole) {
        let rawList = selectedTargetRole.required_skills || selectedTargetRole.tags || [];
        if (!Array.isArray(rawList) && typeof rawList === 'object') {
          rawList = rawList.core || [];
        }
        const reqSkills = rawList.map(s => typeof s === 'string' ? s : (s.name || String(s)));
        const matched = reqSkills.filter(s => 
          studentSkills.some(sk => sk.toLowerCase().trim() === s.toLowerCase().trim() || sk.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(sk.toLowerCase()))
        );
        const missing = reqSkills.filter(s => 
          !studentSkills.some(sk => sk.toLowerCase().trim() === s.toLowerCase().trim() || sk.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(sk.toLowerCase()))
        );
        const matchPct = reqSkills.length > 0 ? Math.round((matched.length / reqSkills.length) * 100) : 0;
        setAnalysisResult({
          skill_match_percentage: matchPct,
          skill_gap_percentage: 100 - matchPct,
          matching_skills: matched,
          missing_skills: missing
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const matchPct = Math.round(analysisResult?.skill_match_percentage || 0);
  const gapPct = Math.round(analysisResult?.skill_gap_percentage || (100 - matchPct));
  const matchedSkills = analysisResult?.matching_skills || [];
  const missingSkills = analysisResult?.missing_skills || [];

  const circumference = 2 * Math.PI * 42;
  const matchOffset = circumference - (circumference * matchPct) / 100;
  const gapOffset = circumference - (circumference * gapPct) / 100;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 1. Compact Role Selection Header */}
      <div className="card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <Target size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Skill-Gap Evaluation
            </h2>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Compare candidate profile against target job role qualifications.
            </p>
          </div>
        </div>

        {/* Target Role Selector & Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Target:</span>
          <select
            className="form-select"
            style={{ width: '260px', padding: '6px 12px', fontSize: '0.825rem', fontWeight: 700 }}
            value={selectedTargetRole?.role_id || ''}
            onChange={(e) => {
              const role = careerRoles.find(r => r.role_id === e.target.value);
              if (role) setSelectedTargetRole(role);
            }}
          >
            {!careerRoles.some(r => r.role_id === selectedTargetRole?.role_id) && selectedTargetRole && (
              <option value={selectedTargetRole.role_id}>
                {selectedTargetRole.title} ({selectedTargetRole.category || 'Live Opening'})
              </option>
            )}
            {careerRoles.map((role) => (
              <option key={role.role_id} value={role.role_id}>
                {role.title} ({role.category})
              </option>
            ))}
          </select>

          {selectedTargetRole?.apply_url && (
            <a
              href={selectedTargetRole.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              Apply to Opening ↗
            </a>
          )}

          <button onClick={() => setActiveTab('recommend')} className="btn btn-primary btn-sm">
            Live Jobs <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 2. Top Evaluation Overview (Fits in Viewport) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '16px' }}>
        
        {/* Dual Ring Gauges */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '14px' }}>
          {/* Match Ring */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto' }}>
              <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="42" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke={matchPct >= 70 ? 'var(--success)' : 'var(--primary)'}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={matchOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100px', height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: matchPct >= 70 ? 'var(--success)' : 'var(--primary)', lineHeight: 1 }}>{matchPct}%</span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Match</span>
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>
              Skill Compatibility
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              {matchedSkills.length} of {matchedSkills.length + missingSkills.length} skills fulfilled
            </div>
          </div>

          {/* Delta Ring */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto' }}>
              <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="42" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="var(--warning)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={gapOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100px', height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--warning)', lineHeight: 1 }}>{gapPct}%</span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Gap</span>
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>
              Pending Gap
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              {missingSkills.length} competencies pending
            </div>
          </div>
        </div>

        {/* Selected Role Summary & Readiness Verdict */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{selectedTargetRole?.category || 'Software'}</span>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{selectedTargetRole?.salary_band || 'Industry Standard'}</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
              {selectedTargetRole?.title}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: '4px 0 10px 0' }}>
              {selectedTargetRole?.description?.slice(0, 160)}...
            </p>
          </div>

          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                Readiness Evaluation
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: matchPct >= 70 ? 'var(--success)' : (matchPct >= 50 ? 'var(--primary)' : 'var(--warning)') }}>
                {matchPct >= 70 ? '✓ Placement Ready' : (matchPct >= 50 ? '⚡ Highly Competitive (Bridge 1-2 skills)' : '⚠ Foundational (Action required)')}
              </span>
            </div>
            <button onClick={() => setActiveTab('resources')} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              <BookOpen size={13} /> Learning Roadmaps
            </button>
          </div>
        </div>

      </div>

      {/* 3. Skills Matrix: Have vs Missing (Side-by-Side) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        
        {/* Matching Skills */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircle2 size={18} color="var(--success)" />
            <h4 style={{ fontSize: '0.925rem', fontWeight: 700, margin: 0 }}>
              Skills You Have ({matchedSkills.length})
            </h4>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {matchedSkills.map((skill, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--success-bg)',
                  border: '1px solid var(--success-border)',
                  color: 'var(--success)',
                  fontSize: '0.775rem',
                  fontWeight: 600
                }}
              >
                <CheckCircle2 size={12} /> {skill}
              </span>
            ))}
            {matchedSkills.length === 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None matched yet in current profile.</span>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertTriangle size={18} color="var(--warning)" />
            <h4 style={{ fontSize: '0.925rem', fontWeight: 700, margin: 0 }}>
              Missing Skills to Acquire ({missingSkills.length})
            </h4>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {missingSkills.map((skill, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--warning-bg)',
                  border: '1px solid var(--warning-border)',
                  color: '#b45309',
                  fontSize: '0.775rem',
                  fontWeight: 600
                }}
              >
                <XCircle size={12} color="var(--warning)" /> {skill}
              </span>
            ))}
            {missingSkills.length === 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>100% benchmark qualification fulfilled!</span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default SkillGapPage;

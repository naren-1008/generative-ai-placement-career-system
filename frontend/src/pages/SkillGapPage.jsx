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
  HelpCircle,
  TrendingUp,
  Award
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
    try {
      const res = await analyzeSkillGap(studentProfile.student_id, roleId, studentSkills);
      if (res.status === 'success') {
        setAnalysisResult(res.data);
      }
    } catch (err) {
      showNotification("Failed to compute skill gap analysis.", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const matchPct = analysisResult?.skill_match_percentage || 0;
  const gapPct = analysisResult?.skill_gap_percentage || 100;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-warning" style={{ marginBottom: '8px' }}>Module 2 Active</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>Skill-Gap Analysis & Readiness Evaluation</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Compare your profile skills with industry career requirements and identify critical improvement areas.
          </p>
        </div>
        <button onClick={() => setActiveTab('recommend')} className="btn btn-primary">
          View Recommendations (M3) →
        </button>
      </div>

      {/* Empty Profile Alert */}
      {!hasSkills && (
        <div style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Info size={22} color="var(--danger)" />
            <div>
              <h4 style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '0.9rem' }}>No Skills Found in Profile</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Complete your resume/profile analysis in Module 1 before performing skill-gap analysis.
              </p>
            </div>
          </div>
          <button onClick={() => setActiveTab('profile')} className="btn btn-secondary btn-sm">
            Go to Profile (M1) <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Select Career Role Dropdown & Grid */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="var(--primary)" /> Select Target Career Role
          </h3>
          
          {/* Dropdown Control */}
          <select
            className="form-select"
            style={{ maxWidth: '300px' }}
            value={selectedTargetRole?.role_id || ''}
            onChange={(e) => {
              const role = careerRoles.find(r => r.role_id === e.target.value);
              if (role) setSelectedTargetRole(role);
            }}
          >
            {careerRoles.map((role) => (
              <option key={role.role_id} value={role.role_id}>
                {role.title} ({role.category})
              </option>
            ))}
          </select>
        </div>

        {/* Role Cards Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {careerRoles.map((role) => {
            const isSelected = selectedTargetRole?.role_id === role.role_id;
            return (
              <div
                key={role.role_id}
                onClick={() => setSelectedTargetRole(role)}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-subtle)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>{role.title}</h4>
                  {isSelected && <ShieldCheck size={16} color="var(--primary)" />}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{role.category}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analysis Results */}
      {selectedTargetRole && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Score & Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* Circular/Ring Match Visual */}
            <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
              
              {/* Skill Match Circle */}
              <div style={{ textAlign: 'center' }}>
                <div className="score-circle-container">
                  <svg width="140" height="140" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="54" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                    <circle
                      cx="70"
                      cy="70"
                      r="54"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="12"
                      strokeDasharray="339.29"
                      strokeDashoffset={339.29 - (339.29 * matchPct) / 100}
                      strokeLinecap="round"
                      transform="rotate(-90 70 70)"
                      style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                    />
                  </svg>
                  <div className="score-text-center">
                    <div className="score-big-val" style={{ color: 'var(--primary)' }}>{matchPct}%</div>
                    <div className="score-sub-label">Match Score</div>
                  </div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Skill Match
                </div>
              </div>

              {/* Skill Gap Circle */}
              <div style={{ textAlign: 'center' }}>
                <div className="score-circle-container">
                  <svg width="140" height="140" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="54" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                    <circle
                      cx="70"
                      cy="70"
                      r="54"
                      fill="none"
                      stroke="var(--danger)"
                      strokeWidth="12"
                      strokeDasharray="339.29"
                      strokeDashoffset={339.29 - (339.29 * gapPct) / 100}
                      strokeLinecap="round"
                      transform="rotate(-90 70 70)"
                      style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                    />
                  </svg>
                  <div className="score-text-center">
                    <div className="score-big-val" style={{ color: 'var(--danger)' }}>{gapPct}%</div>
                    <div className="score-sub-label">Skill Gap</div>
                  </div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--danger)' }}>
                  Skill Gap
                </div>
              </div>

            </div>

            {/* Target Role & Readiness Summary Card */}
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
                  {selectedTargetRole.category}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {selectedTargetRole.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                  {selectedTargetRole.description}
                </p>
              </div>

              {/* Readiness Summary */}
              {analysisResult?.readiness_summary && (
                <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--info-bg)', border: '1px solid var(--info-border)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--info)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                    Readiness Evaluation
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>
                    {analysisResult.readiness_summary}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* 4 Skill Categories Breakdown Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            
            {/* 1. Matched Skills (Green) */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <CheckCircle2 size={18} color="var(--success)" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--success)' }}>
                  Matched Skills ({analysisResult?.matched_skills?.length || 0})
                </h4>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(analysisResult?.matched_skills || []).map((s, idx) => (
                  <span key={idx} className="badge badge-success">
                    ✓ {s}
                  </span>
                ))}
                {(!analysisResult?.matched_skills || analysisResult.matched_skills.length === 0) && (
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>No skills matched yet.</span>
                )}
              </div>
            </div>

            {/* 2. Missing Core Skills (Red) */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <XCircle size={18} color="var(--danger)" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--danger)' }}>
                  Missing Core Skills ({analysisResult?.missing_core_skills?.length || 0})
                </h4>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(analysisResult?.missing_core_skills || []).map((s, idx) => (
                  <span key={idx} className="badge badge-danger">
                    ✕ {s}
                  </span>
                ))}
                {(!analysisResult?.missing_core_skills || analysisResult.missing_core_skills.length === 0) && (
                  <span style={{ fontSize: '0.825rem', color: 'var(--success)' }}>All core requirements met!</span>
                )}
              </div>
            </div>

            {/* 3. Missing Secondary Skills (Orange) */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <AlertTriangle size={18} color="var(--warning)" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--warning)' }}>
                  Missing Secondary Skills ({analysisResult?.missing_secondary_skills?.length || 0})
                </h4>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(analysisResult?.missing_secondary_skills || []).map((s, idx) => (
                  <span key={idx} className="badge badge-warning">
                    ! {s}
                  </span>
                ))}
                {(!analysisResult?.missing_secondary_skills || analysisResult.missing_secondary_skills.length === 0) && (
                  <span style={{ fontSize: '0.825rem', color: 'var(--success)' }}>No secondary skill gaps.</span>
                )}
              </div>
            </div>

            {/* 4. Missing Soft Skills (Blue/Info) */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Info size={18} color="var(--info)" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--info)' }}>
                  Soft Skills Gap ({analysisResult?.missing_soft_skills?.length || 0})
                </h4>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(analysisResult?.missing_soft_skills || []).map((s, idx) => (
                  <span key={idx} className="badge badge-info">
                    {s}
                  </span>
                ))}
                {(!analysisResult?.missing_soft_skills || analysisResult.missing_soft_skills.length === 0) && (
                  <span style={{ fontSize: '0.825rem', color: 'var(--success)' }}>Soft skills verified.</span>
                )}
              </div>
            </div>

          </div>

          {/* Extra / Complementary Student Skills */}
          {analysisResult?.extra_skills?.length > 0 && (
            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                Complementary Student Skills ({analysisResult.extra_skills.length})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {analysisResult.extra_skills.map((s, idx) => (
                  <span key={idx} className="badge badge-neutral">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default SkillGapPage;

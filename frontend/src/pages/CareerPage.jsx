import React, { useState, useEffect } from 'react';
import { useStudent } from '../context/StudentContext';
import { getCareerRecommendations } from '../services/api';
import { 
  Compass, 
  Award, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  Info, 
  X, 
  TrendingUp,
  Layers,
  ArrowUpRight
} from 'lucide-react';

const CareerPage = () => {
  const { studentProfile, setSelectedTargetRole, setActiveTab, showNotification } = useStudent();
  
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModalRole, setActiveModalRole] = useState(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      try {
        const res = await getCareerRecommendations(studentProfile.student_id, studentProfile);
        if (res.status === 'success' && res.data) {
          setRecommendations(res.data);
        }
      } catch (err) {
        showNotification("Failed to load career recommendations.", "danger");
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [studentProfile]);

  const bestMatchScore = recommendations.length > 0 ? recommendations[0].suitability_score : 0;
  const highPotentialCount = recommendations.filter(r => r.suitability_score >= 70).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-success" style={{ marginBottom: '8px' }}>Module 3 Active</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>Career Suitability Recommendations</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Multi-factor composite scoring engine evaluating Skill Match (70%), CGPA Eligibility (15%), Interest Alignment (10%), and Project/Cert Relevance (5%).
          </p>
        </div>
        <button onClick={() => setActiveTab('skillgap')} className="btn btn-secondary">
          ← Skill Gap Analysis (M2)
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Compass size={22} />
          </div>
          <div>
            <div className="stat-label">Roles Evaluated</div>
            <div className="stat-value">{recommendations.length}</div>
            <div className="stat-subtext">Benchmark job profiles</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
            <Award size={22} />
          </div>
          <div>
            <div className="stat-label">Best Match Score</div>
            <div className="stat-value">{bestMatchScore}%</div>
            <div className="stat-subtext">{recommendations[0]?.title || 'N/A'}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="stat-label">High Potential Roles</div>
            <div className="stat-value">{highPotentialCount}</div>
            <div className="stat-subtext">Suitability score &ge; 70%</div>
          </div>
        </div>

      </div>

      {/* Recommended Career Roles List */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>
          Recommended Career Roles ({recommendations.length})
        </h3>

        {isLoading ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Sparkles size={32} style={{ animation: 'spin 2s linear infinite', marginBottom: '8px' }} />
            <p style={{ fontSize: '0.9rem' }}>Calculating composite career suitability scores...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recommendations.map((rec, index) => {
              const scoreComps = rec.score_components || {};
              const isTop = index === 0;

              return (
                <div 
                  key={rec.role_id}
                  className="card card-hover"
                  style={{ 
                    padding: '24px', 
                    borderLeft: isTop ? '4px solid var(--primary)' : '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                >
                  {/* Top Row: Rank, Title, Score */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {/* Rank Badge */}
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: isTop ? 'var(--primary)' : 'var(--bg-subtle)',
                        color: isTop ? '#ffffff' : 'var(--text-main)',
                        fontWeight: 800,
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        #{index + 1}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{rec.title}</h4>
                          <span className="badge badge-primary">{rec.category}</span>
                          {rec.demand_level && (
                            <span className="badge badge-info">Demand: {rec.demand_level}</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Domain: {rec.domain || 'Software Engineering'}
                        </div>
                      </div>
                    </div>

                    {/* Suitability Score Ring / Box */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: rec.suitability_score >= 75 ? 'var(--success)' : (rec.suitability_score >= 50 ? 'var(--primary)' : 'var(--warning)'), lineHeight: 1 }}>
                          {rec.suitability_score}%
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px' }}>
                          Suitability Match
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveModalRole(rec)}
                        className="btn btn-secondary btn-sm"
                      >
                        View Details <ArrowUpRight size={14} />
                      </button>
                    </div>

                  </div>

                  {/* Middle Row: Score Breakdown Components */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-subtle)', fontSize: '0.785rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Skill Match (70% max): </span>
                      <strong style={{ color: 'var(--primary)' }}>{scoreComps.skill_score || 0} pts</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Academic (15% max): </span>
                      <strong style={{ color: 'var(--info)' }}>{scoreComps.academic_score || 0} pts</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Interest (10% max): </span>
                      <strong style={{ color: 'var(--success)' }}>{scoreComps.interest_score || 0} pts</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Project/Cert (5% max): </span>
                      <strong style={{ color: 'var(--warning)' }}>{scoreComps.project_cert_score || 0} pts</strong>
                    </div>
                  </div>

                  {/* Bottom Row: Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', pt: '8px' }}>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      Matched Skills: <strong style={{ color: 'var(--success)' }}>{rec.matched_skills_count}</strong> | Missing Core: <strong style={{ color: 'var(--danger)' }}>{rec.missing_core_skills_count}</strong>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTargetRole(rec);
                        setActiveTab('skillgap');
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      Run Skill Gap Analysis →
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CAREER ROLE DETAILS MODAL */}
      {activeModalRole && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{
            width: '100%',
            maxWidth: '640px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            backgroundColor: '#ffffff'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <span className="badge badge-primary">{activeModalRole.category}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>{activeModalRole.title}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Suitability Match: <strong style={{ color: 'var(--primary)' }}>{activeModalRole.suitability_score}%</strong></div>
              </div>
              <button
                onClick={() => setActiveModalRole(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.875rem' }}>
              
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>About This Role</h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{activeModalRole.description || 'Architects high-performance software applications.'}</p>
              </div>

              {/* Recommendation Reasons */}
              {activeModalRole.reasons && activeModalRole.reasons.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Suitability Component Evaluation</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {activeModalRole.reasons.map((reason, idx) => (
                      <div key={idx} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-subtle)', fontSize: '0.825rem', color: 'var(--text-main)' }}>
                        ✓ {reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills breakdown */}
              {activeModalRole.skill_gap_details && (
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Skills Breakdown</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.785rem', color: 'var(--success)', fontWeight: 600 }}>Matched Skills</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {(activeModalRole.skill_gap_details.matched_skills || []).map((s, i) => (
                          <span key={i} className="badge badge-success" style={{ fontSize: '0.75rem' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.785rem', color: 'var(--danger)', fontWeight: 600 }}>Missing Core Skills</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {(activeModalRole.skill_gap_details.missing_core_skills || []).map((s, i) => (
                          <span key={i} className="badge badge-danger" style={{ fontSize: '0.75rem' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setActiveModalRole(null)} className="btn btn-secondary">
                Close
              </button>
              <button 
                onClick={() => {
                  setSelectedTargetRole(activeModalRole);
                  setActiveModalRole(null);
                  setActiveTab('skillgap');
                }}
                className="btn btn-primary"
              >
                Analyze Skill Gap (M2) →
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CareerPage;

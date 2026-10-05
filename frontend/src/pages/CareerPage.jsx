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
  Search,
  Filter
} from 'lucide-react';

const CareerPage = () => {
  const { studentProfile, setSelectedTargetRole, setActiveTab, showNotification } = useStudent();
  
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModalRole, setActiveModalRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  const bestMatchScore = recommendations.length > 0 ? Math.round(recommendations[0].suitability_score) : 0;
  const highPotentialCount = recommendations.filter(r => r.suitability_score >= 70).length;

  const categories = ['All', ...new Set(recommendations.map(r => r.category).filter(Boolean))];

  const filteredRoles = recommendations.filter(role => {
    const matchesSearch = role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          role.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || role.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 1. Compact Header & Metric Strip */}
      <div className="card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
            Career Suitability Recommendations
          </h2>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            Evaluated on Skills (70%), CGPA Eligibility (15%), Domain Interest (10%), and Projects (5%).
          </p>
        </div>

        {/* Quick Summary Badges */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Evaluated: </span>
            <strong style={{ color: 'var(--text-main)' }}>{recommendations.length} Roles</strong>
          </div>
          <div style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--success-bg)', border: '1px solid var(--success-border)', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--success)' }}>Top Match: </span>
            <strong style={{ color: 'var(--success)' }}>{bestMatchScore}%</strong>
          </div>
          <button onClick={() => setActiveTab('skillgap')} className="btn btn-secondary btn-sm">
            ← Skill Gap Analysis
          </button>
        </div>
      </div>

      {/* 2. Compact Search & Filter Toolbar */}
      <div className="card" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 12px', fontSize: '0.775rem', borderRadius: 'var(--radius-full)' }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={14} color="var(--text-light)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search roles or tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px', height: '34px', fontSize: '0.8rem' }}
          />
        </div>
      </div>

      {/* 3. Compact 2-Column Grid of Career Roles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '14px' }}>
        {filteredRoles.map((role, index) => {
          const score = Math.round(role.suitability_score || 0);
          const scoreColor = score >= 75 ? 'var(--success)' : (score >= 55 ? 'var(--primary)' : 'var(--warning)');
          const breakdown = role.breakdown || {};

          return (
            <div
              key={role.role_id}
              className="card card-hover"
              style={{
                padding: '20px',
                borderLeft: `4px solid ${scoreColor}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.675rem' }}>{role.category}</span>
                      <span className="badge badge-success" style={{ fontSize: '0.675rem' }}>{role.salary_band || 'Standard'}</span>
                      {index === 0 && (
                        <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.675rem' }}>⭐ Best</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0' }}>
                      {role.title}
                    </h3>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                      {score}%
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Fit Score</div>
                  </div>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '8px 0', lineHeight: 1.4 }}>
                  {role.description ? role.description.slice(0, 110) + '...' : ''}
                </p>

                {/* Score Breakdown Bars */}
                <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.675rem', fontWeight: 600 }}>
                      <span>Skill Match (70%)</span>
                      <span>{Math.round(breakdown.skill_score || 0)}%</span>
                    </div>
                    <div style={{ height: '4px', borderRadius: '2px', background: '#e2e8f0', marginTop: '2px' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, breakdown.skill_score || 0)}%`, background: 'var(--primary)', borderRadius: '2px' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.675rem', fontWeight: 600 }}>
                      <span>CGPA Match (15%)</span>
                      <span>{Math.round(breakdown.cgpa_score || 0)}%</span>
                    </div>
                    <div style={{ height: '4px', borderRadius: '2px', background: '#e2e8f0', marginTop: '2px' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, breakdown.cgpa_score || 0)}%`, background: 'var(--success)', borderRadius: '2px' }} />
                    </div>
                  </div>
                </div>

                {/* Required Skills Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                  {(role.required_skills || []).slice(0, 4).map((skill, idx) => (
                    <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => {
                    setSelectedTargetRole(role);
                    setActiveTab('skillgap');
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, padding: '6px 12px', fontSize: '0.775rem' }}
                >
                  Analyze Skill Gap <ChevronRight size={13} />
                </button>
                <button
                  onClick={() => setActiveModalRole(role)}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '6px 10px', fontSize: '0.775rem' }}
                >
                  Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Details Modal */}
      {activeModalRole && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative'
          }}>
            <button
              onClick={() => setActiveModalRole(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={18} />
            </button>

            <span className="badge badge-primary" style={{ marginBottom: '6px' }}>{activeModalRole.category}</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
              {activeModalRole.title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
              {activeModalRole.description}
            </p>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Required Technical Competencies
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(activeModalRole.required_skills || []).map((skill, i) => (
                  <span key={i} className="badge badge-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button onClick={() => setActiveModalRole(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedTargetRole(activeModalRole);
                  setActiveModalRole(null);
                  setActiveTab('skillgap');
                }}
                className="btn btn-primary btn-sm"
              >
                Analyze Skill Gap →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CareerPage;

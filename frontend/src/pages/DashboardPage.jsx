import React, { useState, useEffect } from 'react';
import { useStudent } from '../context/StudentContext';
import { fetchCareerRoles, getCareerRecommendations } from '../services/api';
import { 
  FileText, 
  Cpu, 
  Briefcase, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  UploadCloud, 
  Target, 
  Compass, 
  TrendingUp,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  ExternalLink
} from 'lucide-react';

const DashboardPage = () => {
  const { studentProfile, setActiveTab, user, setSelectedTargetRole } = useStudent();
  const [careerCount, setCareerCount] = useState(6);
  const [topMatch, setTopMatch] = useState(null);

  const studentName = studentProfile?.personal_info?.name || user?.email?.split('@')[0] || "Student";
  const skills = studentProfile?.parsed_profile?.skills || [];
  const resumeMeta = studentProfile?.resume_metadata;
  const hasResume = Boolean(resumeMeta?.filename || skills.length > 0);
  const academic = studentProfile?.academic_info || {};

  useEffect(() => {
    const loadDashboardMetrics = async () => {
      try {
        const careersRes = await fetchCareerRoles();
        if (careersRes?.status === 'success') {
          setCareerCount(careersRes.data?.length || 6);
        }

        const recsRes = await getCareerRecommendations(studentProfile?.student_id, studentProfile);
        if (recsRes?.status === 'success' && recsRes.data?.length > 0) {
          setTopMatch(recsRes.data[0]);
        }
      } catch (err) {
        console.error("Dashboard metrics load error:", err);
      }
    };

    loadDashboardMetrics();
  }, [studentProfile]);

  const topScore = topMatch ? Math.round(topMatch.suitability_score) : (skills.length > 0 ? 50 : 0);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (topScore / 100) * circumference;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* 1. Compact Header Greeting Strip */}
      <div style={{
        padding: '18px 24px',
        background: 'linear-gradient(135deg, #090e1a 0%, #172554 60%, #1e1b4b 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-primary)',
            flexShrink: 0
          }}>
            <Sparkles size={22} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#fff', margin: 0 }}>
                Welcome back, {studentName}
              </h1>
              <span style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(59, 130, 246, 0.25)',
                color: '#93c5fd',
                fontWeight: 600,
                border: '1px solid rgba(96, 165, 250, 0.3)'
              }}>
                {skills.length > 0 ? 'Placement Ready' : 'Profile Initialized'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '2px 0 0 0' }}>
              Profile verified • {academic.degree || 'Degree Pending'} ({academic.branch || 'Branch Pending'}) • CGPA: {academic.cgpa ? academic.cgpa : 'Not set'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('profile')} 
            className="btn btn-primary btn-sm"
          >
            <UploadCloud size={14} /> Update Resume
          </button>
          <button 
            onClick={() => setActiveTab('recommend')} 
            className="btn btn-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)'
            }}
          >
            <Compass size={14} /> Career Matches
          </button>
        </div>
      </div>

      {/* 2. Four Sleek KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        
        <div className="card stat-card card-hover" style={{ padding: '16px' }}>
          <div className="stat-icon-wrapper" style={{ width: '42px', height: '42px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <FileText size={20} />
          </div>
          <div>
            <div className="stat-label" style={{ fontSize: '0.725rem' }}>Resume Status</div>
            <div className="stat-value" style={{ fontSize: '1.15rem' }}>
              {hasResume ? 'Verified' : 'Pending'}
            </div>
            <div className="stat-subtext" style={{ fontSize: '0.725rem' }}>
              {resumeMeta?.filename ? resumeMeta.filename.slice(0, 18) : `${skills.length} skills active`}
            </div>
          </div>
        </div>

        <div className="card stat-card card-hover" style={{ padding: '16px' }}>
          <div className="stat-icon-wrapper" style={{ width: '42px', height: '42px', backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
            <Cpu size={20} />
          </div>
          <div>
            <div className="stat-label" style={{ fontSize: '0.725rem' }}>Verified Skills</div>
            <div className="stat-value" style={{ fontSize: '1.15rem' }}>{skills.length}</div>
            <div className="stat-subtext" style={{ fontSize: '0.725rem' }}>
              <TrendingUp size={12} color="var(--success)" />
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>Normalized</span> taxonomy
            </div>
          </div>
        </div>

        <div className="card stat-card card-hover" style={{ padding: '16px' }}>
          <div className="stat-icon-wrapper" style={{ width: '42px', height: '42px', backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
            <Briefcase size={20} />
          </div>
          <div>
            <div className="stat-label" style={{ fontSize: '0.725rem' }}>Benchmark Roles</div>
            <div className="stat-value" style={{ fontSize: '1.15rem' }}>{careerCount} Roles</div>
            <div className="stat-subtext" style={{ fontSize: '0.725rem' }}>MongoDB Catalog</div>
          </div>
        </div>

        <div className="card stat-card card-hover" style={{ padding: '16px' }}>
          <div className="stat-icon-wrapper" style={{ width: '42px', height: '42px', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <Award size={20} />
          </div>
          <div>
            <div className="stat-label" style={{ fontSize: '0.725rem' }}>Suitability Fit</div>
            <div className="stat-value" style={{ fontSize: '1.15rem' }}>{topScore}%</div>
            <div className="stat-subtext" style={{ fontSize: '0.725rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
              {topMatch ? topMatch.title : 'Software Engineer'}
            </div>
          </div>
        </div>

      </div>

      {/* 3. Main Dashboard Body - High Density 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '18px' }}>
        
        {/* Left Column: Top Match Highlight & Pipeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Top Recommendation Showcase Card */}
          <div className="card" style={{ padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                  {topMatch ? `Top Real Match • ${topMatch.platform || 'Verified'}` : 'Live Career Engine'}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                  {topMatch ? topMatch.title : (skills.length > 0 ? 'Evaluating Live Job Openings...' : 'No Career Matches Yet')}
                </h3>
                {topMatch?.company && (
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    At <strong>{topMatch.company}</strong> • {topMatch.location || 'Remote'}
                  </p>
                )}
              </div>
              <span className="badge badge-primary">{topMatch?.salary || 'Market Competitive'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              {/* Score Ring */}
              <div style={{ position: 'relative', width: '96px', height: '96px', flexShrink: 0 }}>
                <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="48" cy="48" r="40" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke={topScore >= 70 ? 'var(--success)' : 'var(--primary)'}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '96px', height: '96px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: topScore >= 70 ? 'var(--success)' : 'var(--primary)', lineHeight: 1 }}>{topScore}%</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Score</span>
                </div>
              </div>

              {/* Role Details & Actions */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '10px' }}>
                  {topMatch?.description ? topMatch.description.slice(0, 140) + '...' : (skills.length > 0 ? 'Evaluating live openings from LinkedIn, Remotive, and Arbeitnow...' : 'Add your skills or upload a resume to calculate personalized placement recommendations.')}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  {(topMatch?.matched_skills || []).slice(0, 4).map((s, i) => (
                    <span key={i} className="badge badge-success" style={{ fontSize: '0.725rem' }}>✓ {s}</span>
                  ))}
                  {(!topMatch || !topMatch.matched_skills?.length) && skills.slice(0, 3).map((s, i) => (
                    <span key={i} className="badge badge-primary" style={{ fontSize: '0.725rem' }}>{s}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {topMatch?.apply_url && (
                    <a
                      href={topMatch.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      Apply Now <ExternalLink size={13} />
                    </a>
                  )}

                  <button
                    onClick={() => {
                      if (topMatch) {
                        setSelectedTargetRole({
                          role_id: topMatch.id,
                          title: topMatch.title,
                          category: topMatch.platform,
                          required_skills: topMatch.required_skills || topMatch.tags || [],
                          description: topMatch.description,
                          apply_url: topMatch.apply_url,
                          company: topMatch.company
                        });
                      }
                      setActiveTab('skillgap');
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Analyze Skill Gap
                  </button>

                  <button
                    onClick={() => setActiveTab('recommend')}
                    className="btn btn-outline btn-sm"
                  >
                    All Real Jobs →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Compact 4-Step Pipeline */}
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Placement Pipeline Readiness
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.675rem' }}>All Systems Online</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: hasResume ? 'var(--success-bg)' : 'var(--bg-subtle)', border: `1px solid ${hasResume ? 'var(--success-border)' : 'var(--border-color)'}`, textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: hasResume ? 'var(--success)' : 'var(--text-main)' }}>1. Ingestion</div>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '2px' }}>Resume Parsed</div>
              </div>

              <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--success-bg)', border: '1px solid var(--success-border)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)' }}>2. Taxonomy</div>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '2px' }}>Skills Mapped</div>
              </div>

              <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>3. Skill Gap</div>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '2px' }}>Delta Evaluated</div>
              </div>

              <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--purple-bg)', border: '1px solid var(--purple-border)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--purple)' }}>4. Placement</div>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '2px' }}>Rank Scored</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: 4 Action Tiles & Candidate Academic Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Quick Access Modules in 2x2 Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            
            {/* Tile 1 */}
            <div 
              className="card card-hover" 
              style={{ padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              onClick={() => setActiveTab('profile')}
            >
              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', color: 'var(--primary)', width: 'fit-content', marginBottom: '8px' }}>
                <UploadCloud size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Profile Hub</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                  Manage verified skills and resume document.
                </p>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Open Profile <ArrowRight size={12} />
              </div>
            </div>

            {/* Tile 2 */}
            <div 
              className="card card-hover" 
              style={{ padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              onClick={() => setActiveTab('skillgap')}
            >
              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--warning-bg)', color: 'var(--warning)', width: 'fit-content', marginBottom: '8px' }}>
                <Target size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Skill Gap</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                  Identify missing skills vs benchmarks.
                </p>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--warning)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Analyze Gaps <ArrowRight size={12} />
              </div>
            </div>

            {/* Tile 3 */}
            <div 
              className="card card-hover" 
              style={{ padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              onClick={() => setActiveTab('recommend')}
            >
              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--success-bg)', color: 'var(--success)', width: 'fit-content', marginBottom: '8px' }}>
                <Compass size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Career Match</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                  Ranked career suitability suggestions.
                </p>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View Roles <ArrowRight size={12} />
              </div>
            </div>

            {/* Tile 4 */}
            <div 
              className="card card-hover" 
              style={{ padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              onClick={() => setActiveTab('reports')}
            >
              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--info-bg)', color: 'var(--info)', width: 'fit-content', marginBottom: '8px' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Placement Report</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                  Official candidate readiness certificate.
                </p>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--info)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View Report <ArrowRight size={12} />
              </div>
            </div>

          </div>

          {/* Academic Profile Snippet Card */}
          <div className="card" style={{ padding: '16px 20px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GraduationCap size={16} color="var(--primary)" /> Academic Dossier
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Class of {academic.graduation_year || 2025}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)' }}>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>CGPA</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {academic.cgpa ? academic.cgpa : '0.0'}
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)' }}>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>10th Score</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {academic.tenth_percentage ? `${academic.tenth_percentage}%` : 'N/A'}
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)' }}>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>12th Score</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {academic.twelfth_percentage ? `${academic.twelfth_percentage}%` : 'N/A'}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardPage;

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
  BookOpen, 
  Activity, 
  Sparkles,
  TrendingUp
} from 'lucide-react';

const DashboardPage = () => {
  const { studentProfile, setActiveTab, user, setSelectedTargetRole } = useStudent();
  const [careerCount, setCareerCount] = useState(0);
  const [topMatch, setTopMatch] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const studentName = studentProfile?.personal_info?.name || user?.email?.split('@')[0] || "Student";
  const skills = studentProfile?.parsed_profile?.skills || [];
  const resumeMeta = studentProfile?.resume_metadata;
  const hasResume = Boolean(resumeMeta?.filename || skills.length > 0);

  useEffect(() => {
    const loadDashboardMetrics = async () => {
      try {
        const careersRes = await fetchCareerRoles();
        if (careersRes?.status === 'success') {
          setCareerCount(careersRes.data?.length || 0);
        }

        const recsRes = await getCareerRecommendations(studentProfile?.student_id, studentProfile);
        if (recsRes?.status === 'success' && recsRes.data?.length > 0) {
          setTopMatch(recsRes.data[0]);
        }
      } catch (err) {
        console.error("Dashboard metrics load error:", err);
      } finally {
        setLoadingMetrics(false);
      }
    };

    loadDashboardMetrics();
  }, [studentProfile]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Welcome Hero Banner */}
      <div className="card" style={{ 
        padding: '28px', 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
        color: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '720px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', backgroundColor: 'rgba(37, 99, 235, 0.25)', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 600, marginBottom: '12px' }}>
            <Sparkles size={14} /> AI-Powered Career Guidance Active
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Welcome Back, {studentName}! 👋
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6 }}>
            Explore your extracted skills, perform benchmark skill-gap evaluations, and discover tailored career suitability recommendations.
          </p>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="dashboard-grid">
        
        {/* Stat 1: Resume Status */}
        <div className="card stat-card card-hover">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-label">Resume Status</div>
            <div className="stat-value" style={{ fontSize: '1.2rem' }}>
              {hasResume ? 'Uploaded' : 'Pending'}
            </div>
            <div className="stat-subtext">
              {resumeMeta?.filename ? resumeMeta.filename : (skills.length > 0 ? 'Manual profile active' : 'No document uploaded')}
            </div>
          </div>
        </div>

        {/* Stat 2: Skills Extracted */}
        <div className="card stat-card card-hover">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
            <Cpu size={24} />
          </div>
          <div>
            <div className="stat-label">Skills Extracted</div>
            <div className="stat-value">{skills.length}</div>
            <div className="stat-subtext">Canonical skills in profile</div>
          </div>
        </div>

        {/* Stat 3: Career Roles */}
        <div className="card stat-card card-hover">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div className="stat-label">Benchmark Roles</div>
            <div className="stat-value">{careerCount}</div>
            <div className="stat-subtext">Industry career profiles</div>
          </div>
        </div>

        {/* Stat 4: Best Match */}
        <div className="card stat-card card-hover">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="stat-label">Top Match Score</div>
            <div className="stat-value">
              {topMatch ? `${topMatch.suitability_score}%` : 'N/A'}
            </div>
            <div className="stat-subtext">
              {topMatch ? topMatch.title : 'Run suitability model'}
            </div>
          </div>
        </div>

      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          
          <div className="card card-hover" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveTab('profile')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                <UploadCloud size={20} />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Upload / Update Resume</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Upload your PDF/DOCX resume to auto-parse skills, education, and projects into Module 1.
            </p>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Manage Profile <ArrowRight size={14} />
            </div>
          </div>

          <div className="card card-hover" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveTab('skillgap')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
                <Target size={20} />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Analyze Skill Gap</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Compare your extracted skills against benchmark career role requirements in Module 2.
            </p>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Evaluate Gaps <ArrowRight size={14} />
            </div>
          </div>

          <div className="card card-hover" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveTab('recommend')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                <Compass size={20} />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>View Recommendations</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Generate ranked 100-point career suitability recommendations in Module 3.
            </p>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Career Roles <ArrowRight size={14} />
            </div>
          </div>

          <div className="card card-hover" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveTab('resources')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
                <BookOpen size={20} />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Explore Learning Resources</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              View upcoming training pathways and learning roadmaps for missing core skills.
            </p>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--info)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Open Resources <ArrowRight size={14} />
            </div>
          </div>

        </div>
      </div>

      {/* Progress & Recent Activity Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Your Progress Timeline */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--primary)" /> Your Placement Preparation Progress
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ color: 'var(--success)', marginTop: '2px' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>1. Account Registration & Profile Setup</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Student profile created and authenticated in database.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ color: skills.length > 0 ? 'var(--success)' : 'var(--text-light)', marginTop: '2px' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>2. Resume & Skill Extraction (M1)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {skills.length > 0 ? `${skills.length} skills extracted and normalized.` : 'Pending resume upload.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ color: topMatch ? 'var(--success)' : 'var(--text-light)', marginTop: '2px' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>3. Skill-Gap Evaluation (M2)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {topMatch ? 'Skill gap analysis ready across benchmark roles.' : 'Select a target role to calculate skill gaps.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ color: topMatch ? 'var(--success)' : 'var(--text-light)', marginTop: '2px' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>4. Career Suitability Ranking (M3)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {topMatch ? `Top recommended role: ${topMatch.title} (${topMatch.suitability_score}% suitability).` : 'Generate recommendations.'}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--primary)" /> Recent Activity
          </h3>

          {hasResume || skills.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {resumeMeta?.filename && (
                <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Resume Document Uploaded</div>
                  <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Extracted text from <strong>{resumeMeta.filename}</strong>
                  </div>
                </div>
              )}
              {skills.length > 0 && (
                <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Profile Skills Confirmed</div>
                  <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {skills.length} skills active in confirmed profile
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Activity size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <p style={{ fontSize: '0.875rem' }}>No recent activities logged yet.</p>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-light)', marginTop: '4px' }}>
                Upload your resume in Module 1 to populate your activity log.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default DashboardPage;

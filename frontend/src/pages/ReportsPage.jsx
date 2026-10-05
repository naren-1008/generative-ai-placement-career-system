import React from 'react';
import { useStudent } from '../context/StudentContext';
import { BarChart3, FileText, CheckCircle2, UserCheck, ShieldCheck, Award } from 'lucide-react';

const ReportsPage = () => {
  const { studentProfile } = useStudent();
  const skills = studentProfile?.parsed_profile?.skills || [];
  const academic = studentProfile?.academic_info || {};
  const personal = studentProfile?.personal_info || {};

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
        <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Analysis Summary</span>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>Student Profile & Evaluation Report</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Comprehensive summary report of active student profile parameters, extracted skills, and academic eligibility indicators.
        </p>
      </div>

      {/* Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div className="stat-label">Student Name</div>
            <div className="stat-value" style={{ fontSize: '1.1rem' }}>{personal.name || 'Student'}</div>
            <div className="stat-subtext">{personal.email}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
            <Award size={22} />
          </div>
          <div>
            <div className="stat-label">Academic CGPA</div>
            <div className="stat-value">{academic.cgpa || 0.0}</div>
            <div className="stat-subtext">{academic.degree} ({academic.branch})</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
            <FileText size={22} />
          </div>
          <div>
            <div className="stat-label">Verified Skills</div>
            <div className="stat-value">{skills.length}</div>
            <div className="stat-subtext">Taxonomy normalized</div>
          </div>
        </div>

      </div>

      {/* Profile Overview Card */}
      <div className="card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} color="var(--primary)" /> Extracted Skills Distribution
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {skills.map((skill, i) => (
            <span key={i} className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
              {skill}
            </span>
          ))}
          {skills.length === 0 && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No extracted skills present in profile report.</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default ReportsPage;

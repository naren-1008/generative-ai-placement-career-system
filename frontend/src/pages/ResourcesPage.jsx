import React from 'react';
import { useStudent } from '../context/StudentContext';
import { BookOpen, Sparkles, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

const ResourcesPage = () => {
  const { studentProfile, setActiveTab } = useStudent();
  const skills = studentProfile?.parsed_profile?.skills || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-info" style={{ marginBottom: '8px' }}>Module 5 — Planned Extension</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>Personalized Training & Learning Resources</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Structured learning roadmaps and course recommendations curated based on your identified missing core skills.
          </p>
        </div>
        <button onClick={() => setActiveTab('skillgap')} className="btn btn-secondary">
          ← Check Skill Gaps (M2)
        </button>
      </div>

      {/* Coming Soon Notice Card */}
      <div className="card" style={{ padding: '36px', textAlign: 'center', backgroundColor: 'var(--bg-subtle)' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--info-bg)',
          color: 'var(--info)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <Clock size={28} />
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
          Personalized Training Module (Future Scope)
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '580px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
          Module 5 is designed as a future extension for the Placement System. Once enabled, it automatically curates learning resources, course roadmaps, and documentation links for missing core skills identified in Module 2.
        </p>

        {/* Feature Preview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', textAlign: 'left', maxWidth: '840px', margin: '0 auto' }}>
          
          <div className="card" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, marginBottom: '8px', fontSize: '0.9rem' }}>
              <BookOpen size={16} /> Targeted Course Curation
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Auto-suggests NPTEL, Coursera, and documentation guides for missing skills (e.g., Docker, REST APIs).
            </p>
          </div>

          <div className="card" style={{ padding: '20px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 700, marginBottom: '8px', fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} /> Milestone Skill Badges
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Tracks your progress as you complete recommended modules and update your student profile.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ResourcesPage;

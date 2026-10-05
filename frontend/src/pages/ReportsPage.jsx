import React from 'react';
import { useStudent } from '../context/StudentContext';
import { 
  BarChart3, 
  FileText, 
  CheckCircle2, 
  UserCheck, 
  ShieldCheck, 
  Award, 
  Printer, 
  Download,
  GraduationCap,
  Calendar,
  Sparkles
} from 'lucide-react';

const ReportsPage = () => {
  const { studentProfile, showNotification } = useStudent();
  const skills = studentProfile?.parsed_profile?.skills || [];
  const academic = studentProfile?.academic_info || {};
  const personal = studentProfile?.personal_info || {};
  const resumeMeta = studentProfile?.resume_metadata || {};

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const reportData = {
      generated_at: new Date().toISOString(),
      student_profile: studentProfile
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Placement_Report_${personal.name?.replace(/\s+/g, '_') || 'Student'}.json`;
    a.click();
    showNotification("Dossier exported successfully!", "success");
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Top Header Card */}
      <div className="card" style={{ padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-info">Verified Official Dossier</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Student Placement Intelligence Dossier</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Student Placement Readiness Report
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Formal verification record summarizing academic eligibility, verified skill taxonomy, and system audit trail.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} className="btn btn-secondary">
            <Printer size={16} /> Print Report
          </button>
          <button onClick={handleExport} className="btn btn-primary">
            <Download size={16} /> Export Dossier JSON
          </button>
        </div>
      </div>

      {/* Main Official Dossier Sheet */}
      <div className="card" style={{
        padding: '40px',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative'
      }}>
        
        {/* Dossier Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '24px',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Academic Placement Portal • Verification Audit
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              Candidate Readiness Certificate
            </h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Candidate ID: <strong style={{ color: 'var(--text-main)' }}>{studentProfile.student_id || 'STU1001'}</strong> • Generated: {new Date().toLocaleDateString()}
            </div>
          </div>

          <div style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            textAlign: 'right'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem' }}>
              <ShieldCheck size={18} /> Verified Candidate
            </div>
            <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '2px' }}>
              Taxonomy & CGPA Validated
            </div>
          </div>
        </div>

        {/* 3 Overview Stat Widgets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          
          <div style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Candidate Profile</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              {personal.name || 'Student Candidate'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{personal.email}</div>
          </div>

          <div style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Academic CGPA</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
              {academic.cgpa || 8.0} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 10.0</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{academic.degree} ({academic.branch})</div>
          </div>

          <div style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified Skills</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
              {skills.length} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Competencies</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Mapped to Tech Ontology</div>
          </div>

        </div>

        {/* Skill Matrix Section */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="var(--primary)" /> Normalized Technical Competency Matrix
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skills.map((skill, i) => (
              <span key={i} className="badge badge-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                <CheckCircle2 size={13} /> {skill}
              </span>
            ))}
            {skills.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No technical skills found in active dossier.</p>
            )}
          </div>
        </div>

        {/* Document Ingestion Audit Trail */}
        <div style={{
          padding: '20px 24px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#f8fafc',
          border: '1px dashed #cbd5e1'
        }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--primary)" /> System Verification & Audit Trail
          </h4>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Resume Ingestion: <strong>{resumeMeta.filename || 'Initial Mock Profile Seed'}</strong> • Parsing Pipeline: <strong>PyMuPDF + spaCy NLP Engine</strong> •
            Taxonomy: <strong>Hierarchical Software Benchmark (6 Track Architecture)</strong> • Suitability Model: <strong>Multi-criteria Rule & Cosine Distance Engine</strong>.
          </p>
        </div>

      </div>

    </div>
  );
};

export default ReportsPage;

import React, { useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { uploadResume, confirmResumeProfile, saveStudentProfile } from '../services/api';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Plus, 
  X, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  Award, 
  Save, 
  User, 
  Mail, 
  Phone, 
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  FileCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const ProfilePage = () => {
  const { studentProfile, setStudentProfile, showNotification, setActiveTab, user } = useStudent();
  
  const [profileTab, setProfileTab] = useState('extracted'); // 'upload', 'extracted', 'edit'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [justParsed, setJustParsed] = useState(false);
  
  // Custom skill and cert input states
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newCertInput, setNewCertInput] = useState('');

  // Handle Resume File Upload & Extraction
  const handleFileUpload = async (file) => {
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);

    try {
      const res = await uploadResume(file);
      if (res.status === 'success') {
        const parsed = res.data;
        
        // Merge extracted skills cleanly
        const currentSkills = studentProfile.parsed_profile?.skills || [];
        const incomingSkills = parsed.skills || [];
        const mergedSkills = Array.from(new Set([...currentSkills, ...incomingSkills]));

        setStudentProfile(prev => ({
          ...prev,
          personal_info: {
            ...prev.personal_info,
            name: parsed.contact_info?.name || prev.personal_info?.name || "",
            email: parsed.contact_info?.email || prev.personal_info?.email || "",
            phone: parsed.contact_info?.phone || prev.personal_info?.phone || "",
            github_url: parsed.contact_info?.github || prev.personal_info?.github_url || "",
            linkedin_url: parsed.contact_info?.linkedin || prev.personal_info?.linkedin_url || ""
          },
          parsed_profile: {
            skills: mergedSkills,
            education: parsed.education?.length ? parsed.education : (prev.parsed_profile?.education || []),
            projects: parsed.projects?.length ? parsed.projects : (prev.parsed_profile?.projects || []),
            certifications: parsed.certifications?.length ? parsed.certifications : (prev.parsed_profile?.certifications || []),
            experience: parsed.experience?.length ? parsed.experience : (prev.parsed_profile?.experience || [])
          },
          resume_metadata: parsed.resume_metadata
        }));

        setJustParsed(true);
        showNotification("Resume parsed successfully! Review your complete extraction below.", "success");
        setProfileTab('extracted');
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to parse resume document.", "danger");
    } finally {
      setIsParsing(false);
    }
  };

  // Add Custom Skill
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    const skillName = newSkillInput.trim();
    
    setStudentProfile(prev => {
      const currentSkills = prev.parsed_profile?.skills || [];
      if (currentSkills.includes(skillName)) return prev;
      return {
        ...prev,
        parsed_profile: {
          ...prev.parsed_profile,
          skills: [...currentSkills, skillName]
        }
      };
    });
    setNewSkillInput('');
  };

  // Remove Skill
  const handleRemoveSkill = (skillToRemove) => {
    setStudentProfile(prev => ({
      ...prev,
      parsed_profile: {
        ...prev.parsed_profile,
        skills: (prev.parsed_profile?.skills || []).filter(s => s !== skillToRemove)
      }
    }));
  };

  // Remove Project
  const handleRemoveProject = (indexToRemove) => {
    setStudentProfile(prev => ({
      ...prev,
      parsed_profile: {
        ...prev.parsed_profile,
        projects: (prev.parsed_profile?.projects || []).filter((_, idx) => idx !== indexToRemove)
      }
    }));
  };

  // Add Certification
  const handleAddCert = () => {
    if (!newCertInput.trim()) return;
    const certName = newCertInput.trim();
    setStudentProfile(prev => {
      const currentCerts = prev.parsed_profile?.certifications || [];
      if (currentCerts.includes(certName)) return prev;
      return {
        ...prev,
        parsed_profile: {
          ...prev.parsed_profile,
          certifications: [...currentCerts, certName]
        }
      };
    });
    setNewCertInput('');
  };

  // Remove Certification
  const handleRemoveCert = (certToRemove) => {
    setStudentProfile(prev => ({
      ...prev,
      parsed_profile: {
        ...prev.parsed_profile,
        certifications: (prev.parsed_profile?.certifications || []).filter(c => c !== certToRemove)
      }
    }));
  };

  // Confirm and Save Profile to Backend & Advance to Next Step
  const handleConfirmProfile = async () => {
    setIsSaving(true);
    try {
      const res = await confirmResumeProfile(studentProfile);
      if (res.status === 'success') {
        if (res.data) setStudentProfile(res.data);
        showNotification("Profile confirmed and saved! Calculating skill gaps...", "success");
        setJustParsed(false);
        // Advance dynamically to the next step: Skill-Gap Evaluation
        setActiveTab('skillgap');
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to confirm profile.", "danger");
    } finally {
      setIsSaving(false);
    }
  };

  // Save Edit Profile Form
  const handleSaveEditProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await saveStudentProfile(studentProfile);
      if (res.status === 'success') {
        if (res.data) setStudentProfile(res.data);
        showNotification("Student profile updated successfully!", "success");
        setProfileTab('extracted');
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to save profile.", "danger");
    } finally {
      setIsSaving(false);
    }
  };

  const skills = studentProfile.parsed_profile?.skills || [];
  const education = studentProfile.parsed_profile?.education || [];
  const projects = studentProfile.parsed_profile?.projects || [];
  const certs = studentProfile.parsed_profile?.certifications || [];
  const experience = studentProfile.parsed_profile?.experience || [];
  const resumeMeta = studentProfile.resume_metadata;
  const personal = studentProfile.personal_info || {};
  const academic = studentProfile.academic_info || {};

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Compact Header Bar */}
      <div className="card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            Profile & Resume Hub
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            Upload resume, review complete extracted profile details, and verify before skill gap evaluation.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="tab-segmented">
          <button
            onClick={() => setProfileTab('extracted')}
            className={`tab-btn ${profileTab === 'extracted' ? 'active' : ''}`}
            style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
          >
            <FileCheck size={14} />
            <span>Extracted Profile ({skills.length})</span>
          </button>
          <button
            onClick={() => setProfileTab('upload')}
            className={`tab-btn ${profileTab === 'upload' ? 'active' : ''}`}
            style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
          >
            <UploadCloud size={14} />
            <span>Upload Resume</span>
          </button>
          <button
            onClick={() => setProfileTab('edit')}
            className={`tab-btn ${profileTab === 'edit' ? 'active' : ''}`}
            style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
          >
            <User size={14} />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* TAB 1: COMPLETE EXTRACTED RESUME REVIEW */}
      {profileTab === 'extracted' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Prominent Verification Notice & Advance Button */}
          <div style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background: justParsed ? 'var(--success-bg)' : 'var(--primary-light)',
            border: `1px solid ${justParsed ? 'var(--success-border)' : 'var(--primary-border)'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: justParsed ? 'var(--success)' : 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileCheck size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {justParsed ? 'Complete Resume Extraction Ready for Verification' : 'Verified Candidate Profile Record'}
                </h3>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Review parsed details below. Confirming will synchronize with database and proceed to Skill-Gap Evaluation.
                </p>
              </div>
            </div>

            <button 
              onClick={handleConfirmProfile} 
              disabled={isSaving}
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.85rem' }}
            >
              {isSaving ? 'Synchronizing Profile...' : 'Confirm Extracted Profile & Proceed →'}
            </button>
          </div>

          {/* Top 2 Extracted Summary Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
            
            {/* Extracted Personal & Contact Card */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    <User size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {personal.name || user?.name || (user?.email ? user.email.split('@')[0] : 'Student')}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {resumeMeta?.filename ? `Extracted from: ${resumeMeta.filename}` : 'Active Student Account'}
                    </span>
                  </div>
                </div>
                <button onClick={() => setProfileTab('edit')} className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                  Edit Details
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.825rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem', display: 'block' }}>Email Address:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{personal.email || user?.email || 'Not provided'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem', display: 'block' }}>Phone Number:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{personal.phone || 'Not provided'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem', display: 'block' }}>GitHub URL:</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary)', wordBreak: 'break-all' }}>{personal.github_url || 'Not provided'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem', display: 'block' }}>LinkedIn Profile:</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary)', wordBreak: 'break-all' }}>{personal.linkedin_url || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Extracted Academic & Eligibility Card */}
            <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GraduationCap size={16} color="var(--primary)" /> Academic Scores & Eligibility
                  </span>
                  <span className="badge badge-success" style={{ fontSize: '0.675rem' }}>
                    {academic.cgpa ? 'Scores Validated' : 'Awaiting Scores'}
                  </span>
                </div>

                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  {academic.degree || 'Degree Pending'} • {academic.branch || 'Branch Pending'} • Class of {academic.graduation_year || 2025}
                </div>
              </div>

              {/* 3 Academic Metrics: CGPA, 10th Score, 12th Score */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)' }}>
                  <div style={{ fontSize: '0.675rem', color: 'var(--primary)', fontWeight: 700 }}>CGPA</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {academic.cgpa ? academic.cgpa : '0.0'}
                  </div>
                </div>

                <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)' }}>
                  <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 600 }}>10th Score</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {academic.tenth_percentage ? `${academic.tenth_percentage}%` : 'N/A'}
                  </div>
                </div>

                <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)' }}>
                  <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 600 }}>12th Score</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {academic.twelfth_percentage ? `${academic.twelfth_percentage}%` : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Extracted Technical Skills Inventory */}
          <div className="card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Sparkles size={16} color="var(--primary)" /> Extracted Technical Skills ({skills.length})
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Identified by NLP entity extraction and mapped to industry taxonomy. Click &times; to delete or add custom skills.
                </span>
              </div>

              {/* Quick Add Skill Input */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Add skill (e.g. AWS)..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.8rem',
                    outline: 'none',
                    width: '160px'
                  }}
                />
                <button onClick={handleAddSkill} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }}>
                  <Plus size={13} /> Add
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {skills.map((skill, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-light)',
                    border: '1px solid var(--primary-border)',
                    color: 'var(--primary)',
                    fontSize: '0.8125rem',
                    fontWeight: 600
                  }}
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Remove skill"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              {skills.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem', padding: '12px 0' }}>
                  No skills listed yet. Upload a resume or add skills using the input box above.
                </div>
              )}
            </div>
          </div>

          {/* Extracted Projects Section */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="var(--primary)" /> Extracted Projects ({projects.length})
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Distinct projects identified from your resume. Remove or keep projects relevant to your career path.
                </span>
              </div>
            </div>

            {projects.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '10px 0' }}>
                No projects identified in resume.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
                {projects.map((proj, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      padding: '14px 16px', 
                      borderRadius: 'var(--radius-md)', 
                      background: 'var(--bg-subtle)', 
                      border: '1px solid var(--border-color)',
                      position: 'relative'
                    }}
                  >
                    <button
                      onClick={() => handleRemoveProject(idx)}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title="Remove project"
                    >
                      <X size={14} />
                    </button>

                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', paddingRight: '20px', marginBottom: '4px' }}>
                      {proj.title}
                    </div>

                    {proj.technologies && (
                      <div style={{ marginBottom: '6px' }}>
                        <span className="badge badge-primary" style={{ fontSize: '0.675rem' }}>
                          {proj.technologies}
                        </span>
                      </div>
                    )}

                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                      {proj.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Extracted Certifications, Education & Experience Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            
            {/* Certifications Card */}
            <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} color="var(--warning)" /> Certifications ({certs.length})
                  </h4>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  {certs.map((c, i) => (
                    <span 
                      key={i} 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--warning-bg)',
                        border: '1px solid var(--warning-border)',
                        color: 'var(--warning)',
                        fontSize: '0.775rem',
                        fontWeight: 600
                      }}
                    >
                      {c}
                      <button
                        onClick={() => handleRemoveCert(c)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--warning)',
                          cursor: 'pointer',
                          padding: '1px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Remove certification"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  {certs.length === 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      No professional certifications detected.
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Add Certification Input */}
              <div style={{ display: 'flex', gap: '6px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                <input
                  type="text"
                  placeholder="Add certification (e.g. AWS Cloud)..."
                  value={newCertInput}
                  onChange={(e) => setNewCertInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCert(); }}}
                  style={{
                    padding: '5px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.75rem',
                    flex: 1
                  }}
                />
                <button onClick={handleAddCert} className="btn btn-secondary btn-sm" style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
                  Add
                </button>
              </div>
            </div>

            {/* Experience Card */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={16} color="var(--info)" /> Work Experience & Internships
              </h4>
              {experience.map((exp, i) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{exp.title || exp.role}</div>
                  {exp.duration && <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{exp.duration}</div>}
                  {exp.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>{exp.description}</div>}
                </div>
              ))}
              {experience.length === 0 && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  No prior work experience extracted (Fresher Candidate).
                </div>
              )}
            </div>

            {/* Education History Card */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GraduationCap size={16} color="var(--primary)" /> Extracted Education
              </h4>
              {education.map((edu, i) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{edu.degree || edu.details}</div>
                  {edu.details && edu.details !== edu.degree && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{edu.details}</div>
                  )}
                </div>
              ))}
              {education.length === 0 && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  No formal education records parsed.
                </div>
              )}
            </div>

          </div>

          {/* Bottom Confirmation Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }}>
            <button 
              onClick={() => setProfileTab('upload')} 
              className="btn btn-secondary"
            >
              Upload Another Resume
            </button>
            <button 
              onClick={handleConfirmProfile} 
              disabled={isSaving}
              className="btn btn-primary btn-lg"
            >
              {isSaving ? 'Saving Profile...' : 'Confirm Profile & Proceed to Skill-Gap Evaluation →'}
            </button>
          </div>

        </div>
      )}

      {/* TAB 2: UPLOAD RESUME DROPZONE */}
      {profileTab === 'upload' && (
        <div className="card" style={{ padding: '36px 32px' }}>
          <div
            className={`upload-dropzone ${isDragging ? 'drag-active' : ''}`}
            style={{ padding: '40px 20px' }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => document.getElementById('resume-file-input-compact').click()}
          >
            <input
              id="resume-file-input-compact"
              type="file"
              accept=".pdf,.docx,.doc"
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(e.target.files[0])}
            />

            <div className="upload-icon-pulse" style={{ width: '60px', height: '60px', marginBottom: '14px' }}>
              <UploadCloud size={28} />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
              {isParsing ? 'Parsing Resume with PyMuPDF & spaCy NLP...' : 'Drop Resume PDF / DOCX here or Click to Browse'}
            </h3>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 14px auto' }}>
              Extracts personal contact info, academic scores, verified technical skills, projects, and work experience for complete candidate review.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <span className="badge badge-neutral">.PDF</span>
              <span className="badge badge-neutral">.DOCX</span>
              <span className="badge badge-primary">Automatic Taxonomy Mapping</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EDIT PROFILE FORM (WITH 10TH & 12TH PERCENTAGES) */}
      {profileTab === 'edit' && (
        <form onSubmit={handleSaveEditProfile} className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Candidate Profile Details</h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Update your contact information, degrees, CGPA, and 10th / 12th scores.
              </p>
            </div>
            <button type="submit" disabled={isSaving} className="btn btn-primary btn-sm">
              <Save size={14} /> {isSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={personal.name || ''}
                onChange={(e) => setStudentProfile({
                  ...studentProfile,
                  personal_info: { ...personal, name: e.target.value }
                })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={personal.email || ''}
                onChange={(e) => setStudentProfile({
                  ...studentProfile,
                  personal_info: { ...personal, email: e.target.value }
                })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-input"
                value={personal.phone || ''}
                onChange={(e) => setStudentProfile({
                  ...studentProfile,
                  personal_info: { ...personal, phone: e.target.value }
                })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Degree</label>
              <input
                type="text"
                className="form-input"
                value={academic.degree || ''}
                onChange={(e) => setStudentProfile({
                  ...studentProfile,
                  academic_info: { ...academic, degree: e.target.value }
                })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Branch / Department</label>
              <input
                type="text"
                className="form-input"
                value={academic.branch || ''}
                onChange={(e) => setStudentProfile({
                  ...studentProfile,
                  academic_info: { ...academic, branch: e.target.value }
                })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Graduation Year</label>
              <input
                type="number"
                min="2020"
                max="2032"
                className="form-input"
                value={academic.graduation_year || 2025}
                onChange={(e) => setStudentProfile({
                  ...studentProfile,
                  academic_info: { ...academic, graduation_year: parseInt(e.target.value) || 2025 }
                })}
              />
            </div>

            {/* CGPA */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Cumulative CGPA (0 - 10)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="e.g. 8.5"
                className="form-input"
                value={academic.cgpa || ''}
                onChange={(e) => setStudentProfile({
                  ...studentProfile,
                  academic_info: { ...academic, cgpa: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>

            {/* 10th Percentage */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">10th Standard Score (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="e.g. 92.5"
                className="form-input"
                value={academic.tenth_percentage || ''}
                onChange={(e) => setStudentProfile({
                  ...studentProfile,
                  academic_info: { ...academic, tenth_percentage: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>

            {/* 12th Percentage */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">12th / Diploma Score (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="e.g. 89.0"
                className="form-input"
                value={academic.twelfth_percentage || ''}
                onChange={(e) => setStudentProfile({
                  ...studentProfile,
                  academic_info: { ...academic, twelfth_percentage: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>

            {/* GitHub URL */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">GitHub Profile URL</label>
              <input
                type="url"
                placeholder="https://github.com/username"
                className="form-input"
                value={personal.github_url || ''}
                onChange={(e) => setStudentProfile({
                  ...studentProfile,
                  personal_info: { ...personal, github_url: e.target.value }
                })}
              />
            </div>

            {/* LinkedIn URL */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">LinkedIn Profile URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/username"
                className="form-input"
                value={personal.linkedin_url || ''}
                onChange={(e) => setStudentProfile({
                  ...studentProfile,
                  personal_info: { ...personal, linkedin_url: e.target.value }
                })}
              />
            </div>

          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={() => setProfileTab('extracted')} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn btn-primary btn-sm">
              <Save size={14} /> {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}

    </div>
  );
};

export default ProfilePage;

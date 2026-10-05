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
  Check
} from 'lucide-react';

const ProfilePage = () => {
  const { studentProfile, setStudentProfile, showNotification, setActiveTab } = useStudent();
  
  const [profileTab, setProfileTab] = useState('extracted'); // 'upload', 'extracted', 'edit'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Custom skill and cert input states
  const [newSkillInput, setNewSkillInput] = useState('');

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
            email: prev.personal_info?.email || parsed.contact_info?.email || "",
            phone: prev.personal_info?.phone || parsed.contact_info?.phone || "",
            github_url: prev.personal_info?.github_url || parsed.contact_info?.github || "",
            linkedin_url: prev.personal_info?.linkedin_url || parsed.contact_info?.linkedin || ""
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

        showNotification("Resume parsed successfully! Profile skills updated.", "success");
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

  // Confirm and Save Profile to Backend
  const handleConfirmProfile = async () => {
    setIsSaving(true);
    try {
      const res = await confirmResumeProfile(studentProfile);
      if (res.status === 'success') {
        if (res.data) setStudentProfile(res.data);
        showNotification("Profile confirmed and saved successfully!", "success");
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

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Compact Header Bar */}
      <div className="card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            Profile & Resume Hub
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            Manage verified skill taxonomy, academic qualifications, and resume documents.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="tab-segmented">
          <button
            onClick={() => setProfileTab('extracted')}
            className={`tab-btn ${profileTab === 'extracted' ? 'active' : ''}`}
            style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
          >
            <FileText size={14} />
            <span>Profile Overview ({skills.length})</span>
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

      {/* TAB: PROFILE OVERVIEW (EXTRACTED) */}
      {profileTab === 'extracted' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Top 2 Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
            
            {/* Candidate & Contact Details */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    <User size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {studentProfile.personal_info?.name || user?.name || (user?.email ? user.email.split('@')[0] : 'Student')}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Student Candidate</span>
                  </div>
                </div>
                <button onClick={() => setProfileTab('edit')} className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                  Edit
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.825rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem', display: 'block' }}>Email:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{studentProfile.personal_info?.email || user?.email || 'Not provided'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem', display: 'block' }}>Phone:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{studentProfile.personal_info?.phone || 'Not provided'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem', display: 'block' }}>Degree & Branch:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{studentProfile.academic_info?.degree || 'Degree Pending'} ({studentProfile.academic_info?.branch || 'Branch Pending'})</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem', display: 'block' }}>Graduation Year:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{studentProfile.academic_info?.graduation_year || 2025}</span>
                </div>
              </div>
            </div>

            {/* Academic Eligibility Metrics */}
            <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GraduationCap size={16} color="var(--primary)" /> Academic Scores
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.675rem' }}>
                  {studentProfile.academic_info?.cgpa ? 'Validated' : 'Pending Entry'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>CGPA</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {studentProfile.academic_info?.cgpa || '0.0'}
                  </div>
                </div>
                <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>10th Score</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                    {studentProfile.academic_info?.tenth_percentage ? `${studentProfile.academic_info.tenth_percentage}%` : 'N/A'}
                  </div>
                </div>
                <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>12th Score</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                    {studentProfile.academic_info?.twelfth_percentage ? `${studentProfile.academic_info.twelfth_percentage}%` : 'N/A'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  onClick={handleConfirmProfile} 
                  disabled={isSaving}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {isSaving ? 'Saving...' : 'Confirm Profile & Run Skill-Gap →'}
                </button>
              </div>
            </div>

          </div>

          {/* Technical Skills Inventory */}
          <div className="card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Sparkles size={16} color="var(--primary)" /> Verified Technical Skills ({skills.length})
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Mapped to benchmark industry job profiles
                </span>
              </div>

              {/* Quick Add Skill Input */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Add skill (e.g. Docker)..."
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
                    title="Remove"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              {skills.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem', padding: '8px 0' }}>
                  No skills listed yet. Add custom skills or upload a resume.
                </div>
              )}
            </div>
          </div>

          {/* Education & Projects Compact Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="card" style={{ padding: '18px 20px' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GraduationCap size={16} color="var(--primary)" /> Education Record
              </h4>
              {education.map((edu, i) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{edu.degree || edu.institution}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{edu.institution} • {edu.score || '8.5 CGPA'}</div>
                </div>
              ))}
              {education.length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No records parsed.</div>}
            </div>

            <div className="card" style={{ padding: '18px 20px' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} color="var(--warning)" /> Key Projects & Certifications
              </h4>
              {projects.map((proj, i) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)', marginBottom: '6px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{proj.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{proj.description?.slice(0, 80)}...</div>
                </div>
              ))}
              {certs.map((c, i) => (
                <span key={i} className="badge badge-warning" style={{ marginRight: '6px' }}>{c}</span>
              ))}
              {projects.length === 0 && certs.length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No records.</div>}
            </div>
          </div>

        </div>
      )}

      {/* TAB: UPLOAD RESUME */}
      {profileTab === 'upload' && (
        <div className="card" style={{ padding: '36px 32px' }}>
          <div
            className={`upload-dropzone ${isDragging ? 'drag-active' : ''}`}
            style={{ padding: '36px 20px' }}
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

            <div className="upload-icon-pulse" style={{ width: '56px', height: '56px', marginBottom: '12px' }}>
              <UploadCloud size={26} />
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
              {isParsing ? 'Extracting Resume Data...' : 'Drop Resume PDF / DOCX here or Browse File'}
            </h3>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 14px auto' }}>
              Automatically parses contact info, academic scores, and technical skills using our NLP entity extractor.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <span className="badge badge-neutral">.PDF</span>
              <span className="badge badge-neutral">.DOCX</span>
              <span className="badge badge-primary">Automatic Taxonomy Mapping</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB: EDIT PROFILE FORM */}
      {profileTab === 'edit' && (
        <form onSubmit={handleSaveEditProfile} className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Candidate Profile Details</h3>
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
                value={studentProfile.personal_info?.name || ''}
                onChange={(e) => setStudentProfile({
                  ...studentProfile,
                  personal_info: { ...studentProfile.personal_info, name: e.target.value }
                })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={studentProfile.personal_info?.email || ''}
                onChange={(e) => setStudentProfile({
                  ...studentProfile,
                  personal_info: { ...studentProfile.personal_info, email: e.target.value }
                })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-input"
                value={studentProfile.personal_info?.phone || ''}
                onChange={(e) => setStudentProfile({
                  ...studentProfile,
                  personal_info: { ...studentProfile.personal_info, phone: e.target.value }
                })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Degree</label>
              <input
                type="text"
                className="form-input"
                value={studentProfile.academic_info?.degree || ''}
                onChange={(e) => setStudentProfile({
                  ...studentProfile,
                  academic_info: { ...studentProfile.academic_info, degree: e.target.value }
                })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Branch</label>
              <input
                type="text"
                className="form-input"
                value={studentProfile.academic_info?.branch || ''}
                onChange={(e) => setStudentProfile({
                  ...studentProfile,
                  academic_info: { ...studentProfile.academic_info, branch: e.target.value }
                })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                className="form-input"
                value={studentProfile.academic_info?.cgpa || ''}
                onChange={(e) => setStudentProfile({
                  ...studentProfile,
                  academic_info: { ...studentProfile.academic_info, cgpa: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>
          </div>
        </form>
      )}

    </div>
  );
};

export default ProfilePage;

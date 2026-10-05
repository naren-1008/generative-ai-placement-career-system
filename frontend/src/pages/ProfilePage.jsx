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
  Github, 
  Linkedin, 
  Info,
  Layers
} from 'lucide-react';

const ProfilePage = () => {
  const { studentProfile, setStudentProfile, showNotification, setActiveTab } = useStudent();
  
  const [profileTab, setProfileTab] = useState('upload'); // 'upload', 'extracted', 'edit'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Custom skill and cert input states
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newCertInput, setNewCertInput] = useState('');
  const [newInterestInput, setNewInterestInput] = useState('');

  // Handle Authenticated Resume File Upload & Extraction
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);

    try {
      const res = await uploadResume(file);
      if (res.status === 'success') {
        const parsed = res.data;
        
        // Merge extracted skills cleanly into existing skills array without duplicates
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

        showNotification("Resume parsed successfully! Review your extracted profile.", "success");
        setProfileTab('extracted');
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to parse resume.", "danger");
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

  // Add Certification
  const handleAddCertification = () => {
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
  const handleRemoveCertification = (certToRemove) => {
    setStudentProfile(prev => ({
      ...prev,
      parsed_profile: {
        ...prev.parsed_profile,
        certifications: (prev.parsed_profile?.certifications || []).filter(c => c !== certToRemove)
      }
    }));
  };

  // Add Interest
  const handleAddInterest = () => {
    if (!newInterestInput.trim()) return;
    const interest = newInterestInput.trim();
    setStudentProfile(prev => {
      const currentInterests = prev.interests || [];
      if (currentInterests.includes(interest)) return prev;
      return { ...prev, interests: [...currentInterests, interest] };
    });
    setNewInterestInput('');
  };

  // Remove Interest
  const handleRemoveInterest = (interestToRemove) => {
    setStudentProfile(prev => ({
      ...prev,
      interests: (prev.interests || []).filter(i => i !== interestToRemove)
    }));
  };

  // Confirm and Save Profile to Backend
  const handleConfirmProfile = async () => {
    setIsSaving(true);
    try {
      const res = await confirmResumeProfile(studentProfile);
      if (res.status === 'success') {
        if (res.data) setStudentProfile(res.data);
        showNotification("Profile confirmed and synchronized with database!", "success");
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
        showNotification("Student profile details updated successfully!", "success");
        setProfileTab('extracted');
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to save student profile.", "danger");
    } finally {
      setIsSaving(false);
    }
  };

  const skills = studentProfile.parsed_profile?.skills || [];
  const education = studentProfile.parsed_profile?.education || [];
  const projects = studentProfile.parsed_profile?.projects || [];
  const certs = studentProfile.parsed_profile?.certifications || [];
  const experience = studentProfile.parsed_profile?.experience || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Module Header Card */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Module 1 Active</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>Resume & Student Profile Analysis</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Upload your resume document to automatically extract skills, qualifications, and experience into your verified student profile.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="tab-segmented">
          <button
            onClick={() => setProfileTab('upload')}
            className={`tab-btn ${profileTab === 'upload' ? 'active' : ''}`}
          >
            Resume Upload
          </button>
          <button
            onClick={() => setProfileTab('extracted')}
            className={`tab-btn ${profileTab === 'extracted' ? 'active' : ''}`}
          >
            Extracted Profile ({skills.length} skills)
          </button>
          <button
            onClick={() => setProfileTab('edit')}
            className={`tab-btn ${profileTab === 'edit' ? 'active' : ''}`}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* TAB 1: RESUME UPLOAD */}
      {profileTab === 'upload' && (
        <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
          
          <div style={{
            maxWidth: '560px',
            margin: '0 auto',
            padding: '40px 24px',
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-subtle)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <UploadCloud size={28} />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              Upload Your Resume Document
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Drag and drop your resume file here or click below to select from your device.
            </p>

            <label className="btn btn-primary btn-lg" style={{ cursor: 'pointer', display: 'inline-flex' }}>
              <span>{isParsing ? 'Extracting Resume Text...' : 'Choose Resume File'}</span>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
                disabled={isParsing}
                style={{ display: 'none' }}
              />
            </label>

            <div style={{ fontSize: '0.785rem', color: 'var(--text-light)', marginTop: '16px' }}>
              Supported Formats: <strong>PDF (.pdf)</strong> and <strong>Word Document (.docx)</strong>. Maximum file size: 16MB.
            </div>
          </div>

          {/* Current Resume Metadata Card */}
          {studentProfile.resume_metadata && (
            <div style={{ maxWidth: '560px', margin: '24px auto 0 auto', padding: '16px 20px', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={24} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{studentProfile.resume_metadata.filename}</div>
                  <div style={{ fontSize: '0.785rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <CheckCircle2 size={12} /> Text Extracted & Parsed into Profile
                  </div>
                </div>
              </div>
              <button onClick={() => setProfileTab('extracted')} className="btn btn-secondary btn-sm">
                View Profile →
              </button>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: EXTRACTED PROFILE */}
      {profileTab === 'extracted' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Action Bar */}
          <div className="card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Extracted Profile Summary</span>
            </div>
            <button onClick={handleConfirmProfile} disabled={isSaving} className="btn btn-primary">
              <Save size={16} /> {isSaving ? 'Saving...' : 'Confirm & Save Profile'}
            </button>
          </div>

          {/* Section 1: Personal & Contact Info */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="var(--primary)" /> Personal & Academic Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.785rem' }}>Full Name</span>
                <strong style={{ color: 'var(--text-main)' }}>{studentProfile.personal_info?.name || 'Not provided'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.785rem' }}>Email Address</span>
                <strong style={{ color: 'var(--text-main)' }}>{studentProfile.personal_info?.email || 'Not provided'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.785rem' }}>Degree & Branch</span>
                <strong style={{ color: 'var(--text-main)' }}>
                  {studentProfile.academic_info?.degree} - {studentProfile.academic_info?.branch}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.785rem' }}>CGPA / Graduation</span>
                <strong style={{ color: 'var(--text-main)' }}>
                  {studentProfile.academic_info?.cgpa} CGPA ({studentProfile.academic_info?.graduation_year})
                </strong>
              </div>
            </div>
          </div>

          {/* Section 2: Technical & Soft Skills */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--primary)" /> Extracted & Confirmed Skills ({skills.length})
              </h3>
            </div>

            {/* Skill Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {skills.map((skill, index) => (
                <span key={index} className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  {skill}
                  <X size={14} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => handleRemoveSkill(skill)} />
                </span>
              ))}
              {skills.length === 0 && (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No skills extracted yet. Upload a resume or add skills below.</span>
              )}
            </div>

            {/* Add Custom Skill Control */}
            <div style={{ display: 'flex', gap: '8px', maxWidth: '400px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Add new skill (e.g., Python, Docker)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
              />
              <button type="button" onClick={handleAddSkill} className="btn btn-secondary btn-sm">
                <Plus size={16} /> Add
              </button>
            </div>
          </div>

          {/* Section 3: Education & Projects */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            
            {/* Education */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={18} color="var(--primary)" /> Education Background
              </h3>
              {education.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {education.map((edu, idx) => (
                    <div key={idx} style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-subtle)' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{edu.degree}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{edu.details}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No education records extracted.</p>
              )}
            </div>

            {/* Projects */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={18} color="var(--primary)" /> Academic & Personal Projects
              </h3>
              {projects.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {projects.map((proj, idx) => (
                    <div key={idx} style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-subtle)' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{proj.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{proj.description}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No projects extracted.</p>
              )}
            </div>

          </div>

          {/* Section 4: Certifications & Experience */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="var(--primary)" /> Professional Certifications
            </h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {certs.map((cert, idx) => (
                <span key={idx} className="badge badge-success" style={{ padding: '6px 12px', fontSize: '0.825rem' }}>
                  {cert}
                  <X size={14} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => handleRemoveCertification(cert)} />
                </span>
              ))}
              {certs.length === 0 && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No certifications listed. Add certifications below.</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', maxWidth: '400px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Add certification (e.g., AWS Certified, Coursera ML)..."
                value={newCertInput}
                onChange={(e) => setNewCertInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCertification(); } }}
              />
              <button type="button" onClick={handleAddCertification} className="btn btn-secondary btn-sm">
                <Plus size={16} /> Add
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: EDIT PROFILE FORM */}
      {profileTab === 'edit' && (
        <form onSubmit={handleSaveEditProfile} className="card" style={{ padding: '28px' }}>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-main)' }}>
            Edit Student Profile Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            
            {/* Personal Details */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px' }}>
                Personal Details
              </h4>

              <div className="form-group">
                <label className="form-label">Student Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={studentProfile.personal_info?.name || ''}
                  onChange={(e) => setStudentProfile({
                    ...studentProfile,
                    personal_info: { ...studentProfile.personal_info, name: e.target.value }
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={studentProfile.personal_info?.email || ''}
                  onChange={(e) => setStudentProfile({
                    ...studentProfile,
                    personal_info: { ...studentProfile.personal_info, email: e.target.value }
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+91 9876543210"
                  value={studentProfile.personal_info?.phone || ''}
                  onChange={(e) => setStudentProfile({
                    ...studentProfile,
                    personal_info: { ...studentProfile.personal_info, phone: e.target.value }
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GitHub URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://github.com/username"
                  value={studentProfile.personal_info?.github_url || ''}
                  onChange={(e) => setStudentProfile({
                    ...studentProfile,
                    personal_info: { ...studentProfile.personal_info, github_url: e.target.value }
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://linkedin.com/in/username"
                  value={studentProfile.personal_info?.linkedin_url || ''}
                  onChange={(e) => setStudentProfile({
                    ...studentProfile,
                    personal_info: { ...studentProfile.personal_info, linkedin_url: e.target.value }
                  })}
                />
              </div>
            </div>

            {/* Academic Details */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px' }}>
                Academic Details
              </h4>

              <div className="form-group">
                <label className="form-label">Degree</label>
                <input
                  type="text"
                  className="form-input"
                  value={studentProfile.academic_info?.degree || 'B.Tech'}
                  onChange={(e) => setStudentProfile({
                    ...studentProfile,
                    academic_info: { ...studentProfile.academic_info, degree: e.target.value }
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Branch / Department</label>
                <input
                  type="text"
                  className="form-input"
                  value={studentProfile.academic_info?.branch || 'Computer Science'}
                  onChange={(e) => setStudentProfile({
                    ...studentProfile,
                    academic_info: { ...studentProfile.academic_info, branch: e.target.value }
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Graduation Year</label>
                <input
                  type="number"
                  className="form-input"
                  value={studentProfile.academic_info?.graduation_year || 2025}
                  onChange={(e) => setStudentProfile({
                    ...studentProfile,
                    academic_info: { ...studentProfile.academic_info, graduation_year: parseInt(e.target.value) || 2025 }
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current CGPA (Out of 10.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  className="form-input"
                  value={studentProfile.academic_info?.cgpa || 0.0}
                  onChange={(e) => setStudentProfile({
                    ...studentProfile,
                    academic_info: { ...studentProfile.academic_info, cgpa: parseFloat(e.target.value) || 0.0 }
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Domain Interests</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {(studentProfile.interests || []).map((interest, i) => (
                    <span key={i} className="badge badge-info">
                      {interest}
                      <X size={12} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => handleRemoveInterest(interest)} />
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add interest (e.g. Backend Development)..."
                    value={newInterestInput}
                    onChange={(e) => setNewInterestInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(); } }}
                  />
                  <button type="button" onClick={handleAddInterest} className="btn btn-secondary btn-sm">
                    Add
                  </button>
                </div>
              </div>

            </div>

          </div>

          <div style={{ marginTop: '28px', pt: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={() => setProfileTab('extracted')} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn btn-primary">
              <Save size={16} /> {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};

export default ProfilePage;

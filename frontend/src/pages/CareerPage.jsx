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
  Filter,
  ExternalLink,
  MapPin,
  Building,
  RefreshCw,
  Globe,
  AlertCircle,
  Clock
} from 'lucide-react';

const CareerPage = () => {
  const { studentProfile, setSelectedTargetRole, setActiveTab, showNotification } = useStudent();
  
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeModalRole, setActiveModalRole] = useState(null);
  
  // Dynamic Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Remote');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [minFitScore, setMinFitScore] = useState(0);

  // Student's extracted profile skills
  const studentSkills = studentProfile?.parsed_profile?.skills || studentProfile?.skills || [];

  const loadRecommendations = async (customQuery = '', location = 'Remote', platform = 'all', forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await getCareerRecommendations(studentProfile?.student_id, studentProfile, {
        query: customQuery || searchQuery,
        location: location || selectedLocation,
        platform: platform || selectedPlatform,
        refresh: forceRefresh
      });

      if (res?.status === 'success' && res.data) {
        setRecommendations(res.data);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error("Failed to load real job recommendations:", err);
      showNotification("Failed to fetch live job recommendations.", "danger");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadRecommendations('', selectedLocation, selectedPlatform, false);
  }, [studentProfile]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    loadRecommendations(searchQuery, selectedLocation, selectedPlatform, true);
  };

  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    loadRecommendations(searchQuery, selectedLocation, platform, false);
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    loadRecommendations(searchQuery, location, selectedPlatform, false);
  };

  // Filter recommendations in memory by search query & min score
  const filteredRoles = recommendations.filter(role => {
    const matchesSearch = !searchQuery.trim() || 
      role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPlatform = selectedPlatform === 'all' || 
      role.platform.toLowerCase() === selectedPlatform.toLowerCase();

    const matchesScore = (role.suitability_score || 0) >= minFitScore;

    return matchesSearch && matchesPlatform && matchesScore;
  });

  const bestMatchScore = filteredRoles.length > 0 ? Math.round(filteredRoles[0].suitability_score) : 0;
  const highFitCount = filteredRoles.filter(r => (r.suitability_score || 0) >= 70).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 1. Header & Live Engine Status Strip */}
      <div className="card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              Real-Time Job Recommendations
            </h2>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '5px', 
              padding: '3px 8px', 
              borderRadius: 'var(--radius-full)', 
              background: '#ecfdf5', 
              color: '#059669', 
              fontSize: '0.675rem', 
              fontWeight: 700 
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              LIVE ENGINE
            </span>
          </div>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Live postings sourced across <strong>LinkedIn, Remotive, and Arbeitnow</strong>, relatively matched to your verified skills and academic eligibility.
          </p>
        </div>

        {/* Live Counters & Refresh Button */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Evaluated: </span>
            <strong style={{ color: 'var(--text-main)' }}>{filteredRoles.length} Real Jobs</strong>
          </div>
          <div style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--success-bg)', border: '1px solid var(--success-border)', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--success)' }}>Top Match: </span>
            <strong style={{ color: 'var(--success)' }}>{bestMatchScore}%</strong>
          </div>
          <button 
            onClick={() => loadRecommendations(searchQuery, selectedLocation, selectedPlatform, true)} 
            disabled={isRefreshing || isLoading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Fetching Live...' : 'Refresh Jobs'}
          </button>
        </div>
      </div>

      {/* 2. Interactive Search & Filters Toolbar */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Search Row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} color="var(--text-light)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search real roles or skills (e.g. React, Python, Full Stack, Data Science)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '34px', height: '36px', fontSize: '0.825rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 16px' }}>
              Search
            </button>
          </form>

          {/* Location Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={15} color="var(--text-muted)" />
            <select
              value={selectedLocation}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="form-input"
              style={{ height: '36px', fontSize: '0.8rem', width: '130px', padding: '0 8px' }}
            >
              <option value="Remote">Remote</option>
              <option value="Worldwide">Worldwide</option>
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="Europe">Europe</option>
            </select>
          </div>

          {/* Fit Score Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              value={minFitScore}
              onChange={(e) => setMinFitScore(Number(e.target.value))}
              className="form-input"
              style={{ height: '36px', fontSize: '0.8rem', width: '140px', padding: '0 8px' }}
            >
              <option value="0">All Match Scores</option>
              <option value="50">50%+ Match</option>
              <option value="70">70%+ High Match</option>
              <option value="85">85%+ Optimal Match</option>
            </select>
          </div>

        </div>

        {/* Platform Selection Badges */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '4px' }}>
            Source Platform:
          </span>
          {[
            { id: 'all', label: 'All Sources' },
            { id: 'linkedin', label: 'LinkedIn Jobs', color: '#0a66c2' },
            { id: 'remotive', label: 'Remotive', color: '#7c3aed' },
            { id: 'arbeitnow', label: 'Arbeitnow', color: '#059669' }
          ].map((plat) => {
            const isActive = selectedPlatform === plat.id;
            return (
              <button
                key={plat.id}
                onClick={() => handlePlatformChange(plat.id)}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{ 
                  padding: '4px 12px', 
                  fontSize: '0.75rem', 
                  borderRadius: 'var(--radius-full)',
                  borderColor: isActive && plat.color ? plat.color : undefined,
                  background: isActive && plat.color ? plat.color : undefined
                }}
              >
                {plat.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* 3. Real Job Listings Grid */}
      {isLoading ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
            Querying Live Job Boards & Calculating Relative Fit...
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Scanning real postings from LinkedIn, Remotive, and Arbeitnow matched to your verified skills.
          </p>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <AlertCircle size={36} color="var(--warning)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
            No Matching Real Jobs Found
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 16px auto' }}>
            Try broadening your search keywords, switching location to "Remote" or "Worldwide", or lowering the minimum match score.
          </p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedPlatform('all');
              setSelectedLocation('Remote');
              setMinFitScore(0);
              loadRecommendations('', 'Remote', 'all', true);
            }} 
            className="btn btn-primary btn-sm"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '14px' }}>
          {filteredRoles.map((job, index) => {
            const score = Math.round(job.suitability_score || 0);
            const scoreColor = score >= 80 ? 'var(--success)' : (score >= 60 ? 'var(--primary)' : 'var(--warning)');
            const platformBadgeColor = job.platform_color || (job.platform === 'LinkedIn' ? '#0a66c2' : (job.platform === 'Remotive' ? '#7c3aed' : '#059669'));

            return (
              <div
                key={job.id || index}
                className="card card-hover"
                style={{
                  padding: '20px',
                  borderLeft: `4px solid ${scoreColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  
                  {/* Top Badge Strip & Match Ring */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span 
                          className="badge" 
                          style={{ 
                            background: `${platformBadgeColor}15`, 
                            color: platformBadgeColor, 
                            border: `1px solid ${platformBadgeColor}40`,
                            fontSize: '0.675rem',
                            fontWeight: 700
                          }}
                        >
                          {job.platform}
                        </span>
                        
                        <span className="badge badge-neutral" style={{ fontSize: '0.675rem' }}>
                          {job.job_type || 'Full-Time'}
                        </span>

                        {index === 0 && (
                          <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.675rem', fontWeight: 700 }}>
                            ⭐ Best Match
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 4px 0', lineHeight: 1.3 }}>
                        {job.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                        <Building size={13} />
                        <strong style={{ color: 'var(--text-main)' }}>{job.company}</strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {job.location || 'Remote'}
                        </span>
                        {job.posted_time && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {job.posted_time}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Relative Match Score Ring */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ 
                        fontSize: '1.45rem', 
                        fontWeight: 800, 
                        color: scoreColor, 
                        lineHeight: 1,
                        background: `${scoreColor}10`,
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${scoreColor}30`,
                        textAlign: 'center'
                      }}>
                        {score}%
                        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: '2px' }}>
                          Fit Score
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Brief Description */}
                  <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', margin: '10px 0 8px 0', lineHeight: 1.45 }}>
                    {job.description ? job.description.slice(0, 130) + '...' : ''}
                  </p>

                  {/* Matched vs Missing Skills Analysis */}
                  <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)', marginBottom: '12px' }}>
                    
                    {/* Matched Skills */}
                    <div style={{ marginBottom: (job.missing_skills && job.missing_skills.length > 0) ? '6px' : '0' }}>
                      <div style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={11} /> Matched Skills ({job.matched_skills?.length || 0}):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(job.matched_skills && job.matched_skills.length > 0) ? (
                          job.matched_skills.slice(0, 4).map((sk, i) => (
                            <span key={i} className="badge badge-success" style={{ fontSize: '0.675rem', padding: '2px 7px' }}>
                              ✓ {sk}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Matches general tech profile
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    {job.missing_skills && job.missing_skills.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={11} /> Skills to Bridge:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {job.missing_skills.slice(0, 4).map((sk, i) => (
                            <span key={i} className="badge badge-neutral" style={{ fontSize: '0.675rem', padding: '2px 7px' }}>
                              + {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

                {/* Primary Action Button Bar */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', alignItems: 'center', flexWrap: 'wrap' }}>
                  
                  {/* DIRECT VALID APPLY BUTTON */}
                  <a
                    href={job.apply_url || job.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ 
                      flex: 1, 
                      padding: '7px 12px', 
                      fontSize: '0.785rem', 
                      textDecoration: 'none', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '5px' 
                    }}
                  >
                    Apply Now <ExternalLink size={13} />
                  </a>

                  {/* LinkedIn Direct Link */}
                  {job.linkedin_url && (
                    <a
                      href={job.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      title="View on LinkedIn"
                      style={{ 
                        padding: '7px 10px', 
                        fontSize: '0.75rem', 
                        textDecoration: 'none',
                        color: '#0a66c2',
                        borderColor: '#0a66c2'
                      }}
                    >
                      LinkedIn
                    </a>
                  )}

                  {/* Analyze Skill Gap */}
                  <button
                    onClick={() => {
                      setSelectedTargetRole({
                        role_id: job.id,
                        title: job.title,
                        category: job.platform,
                        required_skills: job.required_skills || job.tags || [],
                        description: job.description,
                        apply_url: job.apply_url,
                        company: job.company
                      });
                      setActiveTab('skillgap');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '7px 10px', fontSize: '0.75rem' }}
                  >
                    Analyze Gap
                  </button>

                  {/* View Details Modal */}
                  <button
                    onClick={() => setActiveModalRole(job)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '7px 8px', fontSize: '0.75rem' }}
                  >
                    Details
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 4. Real Role Details Modal */}
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
            maxWidth: '580px',
            width: '100%',
            padding: '28px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-primary">{activeModalRole.platform}</span>
              <span className="badge badge-success">{activeModalRole.salary || 'Competitive'}</span>
              <span className="badge badge-neutral">{activeModalRole.job_type}</span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 6px 0' }}>
              {activeModalRole.title}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '14px' }}>
              <Building size={14} />
              <strong style={{ color: 'var(--text-main)' }}>{activeModalRole.company}</strong>
              <span>•</span>
              <MapPin size={14} />
              <span>{activeModalRole.location}</span>
            </div>

            {/* Suitability Score Summary */}
            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>Relative Suitability Fit:</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{Math.round(activeModalRole.suitability_score)}%</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                {(activeModalRole.reasons || []).map((r, idx) => (
                  <li key={idx} style={{ margin: '3px 0' }}>{r}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Extracted Job Skills & Keywords
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(activeModalRole.required_skills || activeModalRole.tags || []).map((skill, i) => (
                  <span key={i} className="badge badge-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                    {typeof skill === 'string' ? skill : (skill.name || String(skill))}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Description
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                {activeModalRole.description}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <button onClick={() => setActiveModalRole(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
              
              <button
                onClick={() => {
                  setSelectedTargetRole({
                    role_id: activeModalRole.id,
                    title: activeModalRole.title,
                    category: activeModalRole.platform,
                    required_skills: activeModalRole.required_skills || activeModalRole.tags || [],
                    description: activeModalRole.description,
                    apply_url: activeModalRole.apply_url,
                    company: activeModalRole.company
                  });
                  setActiveModalRole(null);
                  setActiveTab('skillgap');
                }}
                className="btn btn-secondary btn-sm"
              >
                Analyze Skill Gap
              </button>

              <a
                href={activeModalRole.apply_url || activeModalRole.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                Apply on {activeModalRole.platform} <ExternalLink size={13} />
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CareerPage;

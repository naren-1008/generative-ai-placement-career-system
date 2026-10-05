import React, { useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { 
  BookOpen, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Code, 
  Cloud, 
  Database, 
  Cpu, 
  Terminal,
  Bookmark
} from 'lucide-react';

const ResourcesPage = () => {
  const { studentProfile, setActiveTab, showNotification } = useStudent();
  const [selectedTrack, setSelectedTrack] = useState('All');

  const learningTracks = [
    {
      id: 1,
      title: 'Docker & Kubernetes Cloud Containerization',
      category: 'Cloud & DevOps',
      difficulty: 'Intermediate',
      estimatedHours: '14 Hours',
      description: 'Master containerization workflows, multi-stage Docker builds, Kubernetes pods, and deployment pipelines.',
      skillsCovered: ['Docker', 'Kubernetes', 'CI/CD', 'Linux'],
      provider: 'Cloud Native Roadmap',
      icon: Cloud,
      link: 'https://docker-curriculum.com/'
    },
    {
      id: 2,
      title: 'Modern RESTful API Architecture with Flask & FastAPI',
      category: 'Backend Development',
      difficulty: 'Beginner - Intermediate',
      estimatedHours: '10 Hours',
      description: 'Learn production API conventions, JWT authentication, rate limiting, and database ORM patterns.',
      skillsCovered: ['Python', 'REST APIs', 'Flask', 'FastAPI'],
      provider: 'Backend Developer Track',
      icon: Terminal,
      link: 'https://flask.palletsprojects.com/'
    },
    {
      id: 3,
      title: 'Production React 19 & Component Architecture',
      category: 'Frontend Development',
      difficulty: 'Intermediate',
      estimatedHours: '18 Hours',
      description: 'Deep dive into hooks, state machines, context management, performance optimizations, and accessible UI.',
      skillsCovered: ['React', 'JavaScript', 'Tailwind/CSS', 'Vite'],
      provider: 'React Official Docs',
      icon: Code,
      link: 'https://react.dev/'
    },
    {
      id: 4,
      title: 'Applied Machine Learning & Natural Language Processing',
      category: 'AI & Data Science',
      difficulty: 'Advanced',
      estimatedHours: '24 Hours',
      description: 'Feature engineering, scikit-learn models, spaCy text extraction pipelines, and evaluation metrics.',
      skillsCovered: ['Python', 'Machine Learning', 'NLP', 'Data Science'],
      provider: 'Data Science Specialization',
      icon: Cpu,
      link: 'https://scikit-learn.org/'
    },
    {
      id: 5,
      title: 'MongoDB Schema Design & NoSQL Database Optimization',
      category: 'Database Engineering',
      difficulty: 'Intermediate',
      estimatedHours: '8 Hours',
      description: 'Indexing strategies, aggregation pipelines, replica sets, and query optimization for high concurrency.',
      skillsCovered: ['MongoDB', 'NoSQL', 'Database Design'],
      provider: 'MongoDB University',
      icon: Database,
      link: 'https://learn.mongodb.com/'
    }
  ];

  const categories = ['All', 'Backend Development', 'Frontend Development', 'Cloud & DevOps', 'AI & Data Science'];

  const filteredTracks = learningTracks.filter(track => 
    selectedTrack === 'All' || track.category === selectedTrack
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Banner */}
      <div className="card" style={{ padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-info">Curated Resource Hub</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Targeted Technical Roadmaps</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Technical Learning Roadmaps
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Structured training tracks and documentation links designed to bridge identified skill gaps.
          </p>
        </div>

        <button onClick={() => setActiveTab('skillgap')} className="btn btn-secondary">
          ← Check Skill Gaps
        </button>
      </div>

      {/* Filter Category Chips */}
      <div className="card" style={{ padding: '16px 24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedTrack(cat)}
            className={`btn btn-sm ${selectedTrack === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Roadmap Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {filteredTracks.map((track) => {
          const Icon = track.icon;
          return (
            <div key={track.id} className="card card-hover" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    <Icon size={22} />
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="badge badge-neutral">{track.difficulty}</span>
                    <span className="badge badge-primary">{track.estimatedHours}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {track.category}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                  {track.title}
                </h3>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
                  {track.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                  {track.skillsCovered.map((skill, i) => (
                    <span key={i} className="badge badge-neutral" style={{ fontSize: '0.725rem' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {track.provider}
                </span>
                <a
                  href={track.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  Start Track <ExternalLink size={13} />
                </a>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ResourcesPage;

import React from 'react';
import { useStudent } from '../../context/StudentContext';
import { Menu, Bell, User, LogOut, ChevronRight, CheckCircle2 } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { activeTab, studentProfile, user, logout } = useStudent();

  const titleMap = {
    dashboard: 'Command Dashboard',
    profile: 'Profile & Resume Analysis',
    skillgap: 'Skill-Gap Evaluation',
    recommend: 'Career Recommendations',
    resources: 'Learning Roadmaps',
    reports: 'Placement Reports',
    settings: 'System Preferences',
  };

  const currentTitle = titleMap[activeTab] || 'Dashboard';
  const studentName = studentProfile?.personal_info?.name || user?.email?.split('@')[0] || "Student";
  const avatarInitial = studentName.charAt(0).toUpperCase();

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button onClick={onToggleSidebar} className="mobile-menu-btn" title="Toggle Menu">
          <Menu size={22} />
        </button>

        <div>
          <div className="topbar-breadcrumb">
            <span>Portal</span>
            <ChevronRight size={12} color="var(--text-light)" />
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{currentTitle}</span>
          </div>
          <h1 className="topbar-title" style={{ marginTop: '2px' }}>
            {currentTitle}
          </h1>
        </div>
      </div>

      <div className="topbar-right">
        {/* Live Operational Status Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--success-bg)',
          border: '1px solid var(--success-border)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--success)'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--success)',
            boxShadow: '0 0 6px var(--success)'
          }} />
          Engine Online
        </div>

        {/* User Pill & Quick Logout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          paddingLeft: '14px',
          borderLeft: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="user-avatar" style={{ width: '34px', height: '34px', fontSize: '0.825rem' }}>
              {avatarInitial}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {studentName}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {user?.role || 'Student'}
              </span>
            </div>
          </div>

          <button 
            onClick={logout} 
            className="btn btn-outline btn-sm"
            style={{ padding: '6px 12px', fontSize: '0.775rem', gap: '6px' }}
            title="Log Out"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

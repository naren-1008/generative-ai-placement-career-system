import React from 'react';
import { useStudent } from '../../context/StudentContext';
import { Menu, Bell, ChevronDown, User, LogOut } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { activeTab, studentProfile, user, logout } = useStudent();

  const titleMap = {
    dashboard: 'Dashboard',
    profile: 'My Profile & Resume Analysis (Module 1)',
    skillgap: 'Skill-Gap Analysis & Evaluation (Module 2)',
    recommend: 'Career Suitability Recommendations (Module 3)',
    resources: 'Learning Resources & Development Roadmap',
    reports: 'Reports & Placement Analytics',
    settings: 'Settings & Account Preferences',
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
        <h1 className="topbar-title">{currentTitle}</h1>
      </div>

      <div className="topbar-right">
        {/* Notification Bell */}
        <button className="icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>

        {/* User Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid var(--border-color)' }}>
          <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
            {avatarInitial}
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', display: 'inline-block', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {studentName}
          </span>
          <button 
            onClick={logout} 
            className="btn btn-outline btn-sm"
            style={{ padding: '4px 10px', fontSize: '0.775rem' }}
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

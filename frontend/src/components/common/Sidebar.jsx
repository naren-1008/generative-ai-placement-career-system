import React from 'react';
import { useStudent } from '../../context/StudentContext';
import { 
  LayoutDashboard, 
  UserCheck, 
  Target, 
  Compass, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut, 
  GraduationCap, 
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, studentProfile, logout, user } = useStudent();

  const studentName = studentProfile?.personal_info?.name || user?.email?.split('@')[0] || "Student";
  const studentEmail = studentProfile?.personal_info?.email || user?.email || "";
  const avatarInitial = studentName.charAt(0).toUpperCase();

  const primaryModules = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile & Resume', icon: UserCheck },
    { id: 'skillgap', label: 'Skill Gap Analysis', icon: Target },
    { id: 'recommend', label: 'Career Recommendations', icon: Compass },
  ];

  const secondaryModules = [
    { id: 'resources', label: 'Learning Roadmaps', icon: BookOpen },
    { id: 'reports', label: 'Placement Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand-icon">
          <GraduationCap size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="sidebar-brand-text">
            Placement<span style={{ color: '#60a5fa' }}>AI</span>
            <span className="sidebar-brand-tag">PRO</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-sidebar-muted)', fontWeight: 500, marginTop: '2px' }}>
            Career Intelligence System
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="mobile-menu-btn" 
            style={{ color: '#fff', cursor: 'pointer' }}
            title="Close Menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Core Modules</div>
        {primaryModules.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onClose) onClose();
              }}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.85 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          );
        })}

        <div className="sidebar-section-title" style={{ marginTop: '14px' }}>Analytics & Tools</div>
        {secondaryModules.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onClose) onClose();
              }}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.85 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer User Info */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="user-avatar">
            {avatarInitial}
          </div>
          <div className="user-info">
            <div className="user-name">{studentName}</div>
            <div className="user-email">{studentEmail}</div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-sidebar)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'var(--text-sidebar)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

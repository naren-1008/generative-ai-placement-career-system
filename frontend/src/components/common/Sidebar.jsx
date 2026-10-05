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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: UserCheck, badge: 'M1' },
    { id: 'skillgap', label: 'Skill Gap Analysis', icon: Target, badge: 'M2' },
    { id: 'recommend', label: 'Career Recommendations', icon: Compass, badge: 'M3' },
    { id: 'resources', label: 'Learning Resources', icon: BookOpen, badge: 'Soon' },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand-icon">
          <GraduationCap size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="sidebar-brand-text">PlacementAI</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-sidebar)', fontWeight: 500 }}>Career Guidance Portal</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="mobile-menu-btn" style={{ color: '#fff' }}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Navigation</div>
        
        {navItems.map((item) => {
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
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="sidebar-nav-badge">
                  {item.badge}
                </span>
              )}
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
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-sidebar)'}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;

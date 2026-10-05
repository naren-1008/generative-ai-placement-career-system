import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCurrentUser } from '../services/api';

const StudentContext = createContext();

export const createEmptyProfile = (user = null) => ({
  user_id: user?._id || "",
  student_id: user?._id || `STU${Math.floor(1000 + Math.random() * 9000)}`,
  personal_info: {
    name: user?.name || (user?.email ? user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()) : ""),
    email: user?.email || "",
    phone: "",
    github_url: "",
    linkedin_url: ""
  },
  academic_info: {
    degree: "B.Tech",
    branch: "Computer Science",
    graduation_year: 2025,
    cgpa: 0.0,
    tenth_percentage: 0.0,
    twelfth_percentage: 0.0
  },
  parsed_profile: {
    skills: [],
    education: [],
    projects: [],
    certifications: [],
    experience: []
  },
  interests: []
});

export const StudentProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState("auth"); // 'auth', 'dashboard', 'profile', 'skillgap', 'recommend'
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [studentProfile, setStudentProfile] = useState(() => createEmptyProfile());
  const [selectedTargetRole, setSelectedTargetRole] = useState(null);
  const [authInitializing, setAuthInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const isAuthenticated = Boolean(token && user);

  // Authoritative Backend Session Validation on Application Startup
  useEffect(() => {
    const validateSession = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        clearAuthState();
        setAuthInitializing(false);
        return;
      }

      try {
        const res = await fetchCurrentUser();
        if (res.status === 'success' && res.user) {
          setToken(storedToken);
          setUser(res.user);
          localStorage.setItem("user", JSON.stringify(res.user));
          if (res.student_profile) {
            setStudentProfile(res.student_profile);
          } else {
            setStudentProfile(createEmptyProfile(res.user));
          }
          setActiveTab("dashboard");
        } else {
          clearAuthState();
        }
      } catch (err) {
        clearAuthState();
      } finally {
        setAuthInitializing(false);
      }
    };

    validateSession();
  }, []);

  const clearAuthState = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setStudentProfile(createEmptyProfile());
    setActiveTab("auth");
  };

  const login = (authToken, userData, profileData) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    if (profileData) {
      setStudentProfile(profileData);
    } else {
      setStudentProfile(createEmptyProfile(userData));
    }
    setActiveTab("dashboard");
    showNotification(`Welcome, ${profileData?.personal_info?.name || userData.email}!`, "success");
  };

  const logout = () => {
    clearAuthState();
    showNotification("Logged out successfully.", "info");
  };

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return (
    <StudentContext.Provider value={{
      activeTab,
      setActiveTab,
      token,
      user,
      isAuthenticated,
      authInitializing,
      login,
      logout,
      studentProfile,
      setStudentProfile,
      selectedTargetRole,
      setSelectedTargetRole,
      loading,
      setLoading,
      notification,
      showNotification
    }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => useContext(StudentContext);

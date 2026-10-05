import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCurrentUser } from '../services/api';

const StudentContext = createContext();

export const defaultStudentProfile = {
  user_id: "",
  student_id: "STU1001",
  personal_info: {
    name: "Alex Morgan",
    email: "alex.morgan@university.edu",
    phone: "+91 9876543210",
    github_url: "https://github.com/alexmorgan",
    linkedin_url: "https://linkedin.com/in/alexmorgan"
  },
  academic_info: {
    degree: "B.Tech",
    branch: "Computer Science & Engineering",
    graduation_year: 2025,
    cgpa: 8.5,
    tenth_percentage: 90.0,
    twelfth_percentage: 88.5
  },
  parsed_profile: {
    skills: ["Python", "Flask", "JavaScript", "React", "MongoDB", "SQL", "Git", "REST APIs"],
    education: [
      { degree: "B.Tech CSE", institution: "Institute of Engineering & Tech", score: "8.5 CGPA", year: "2021-2025" }
    ],
    projects: [
      { title: "Placement Recommendation Engine", description: "Built Flask backend and React UI for career suitability." }
    ],
    certifications: ["Python for Data Science"],
    experience: []
  },
  interests: ["Backend Development", "Software Engineering"]
};

export const StudentProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState("auth"); // 'auth', 'profile', 'skillgap', 'recommend'
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(defaultStudentProfile);
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
        setToken("");
        setUser(null);
        setAuthInitializing(false);
        setActiveTab("auth");
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
          }
          setActiveTab("profile");
        } else {
          clearAuthState();
        }
      } catch (err) {
        // Token invalid, expired, or user no longer exists on backend
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
    setActiveTab("auth");
  };

  const login = (authToken, userData, profileData) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    if (profileData) {
      setStudentProfile(profileData);
    }
    setActiveTab("profile");
    showNotification(`Welcome back, ${userData.email}!`, "success");
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

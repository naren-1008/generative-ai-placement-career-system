import axios from 'axios';

// Base API instance targeting Flask REST server
const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token header if present in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    if (config.headers.set) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Remove instance default application/json Content-Type header for FormData requests
  // so Axios/browser automatically generates Content-Type: multipart/form-data; boundary=...
  if (config.data instanceof FormData) {
    if (config.headers.delete) {
      config.headers.delete('Content-Type');
    } else if (config.headers) {
      delete config.headers['Content-Type'];
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Clear stale localStorage tokens on HTTP 401 Unauthorized responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Health check
export const checkHealth = async () => {
  const res = await API.get('/health');
  return res.data;
};

// Authentication APIs
export const registerUser = async (email, password, confirmPassword) => {
  const res = await API.post('/auth/register', {
    email,
    password,
    confirm_password: confirmPassword
  });
  return res.data;
};

export const loginUser = async (email, password) => {
  const res = await API.post('/auth/login', { email, password });
  return res.data;
};

export const fetchCurrentUser = async () => {
  const res = await API.get('/auth/me');
  return res.data;
};

// M1: Student Profile APIs
export const fetchAllStudents = async () => {
  const res = await API.get('/students');
  return res.data;
};

export const fetchStudentById = async (id) => {
  const res = await API.get(`/students/${id}`);
  return res.data;
};

export const saveStudentProfile = async (profileData) => {
  const res = await API.post('/students', profileData);
  return res.data;
};

// M1: Resume Parsing APIs
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  
  const res = await API.post('/resume/parse', formData);
  return res.data;
};

export const confirmResumeProfile = async (parsedProfile) => {
  const res = await API.post('/resume/confirm-profile', parsedProfile);
  return res.data;
};

// M2: Skill-Gap Analysis APIs
export const fetchTaxonomy = async () => {
  const res = await API.get('/skill-gap/taxonomy');
  return res.data;
};

export const analyzeSkillGap = async (studentId, roleId, customSkills = null) => {
  const res = await API.post('/skill-gap/analyze', {
    student_id: studentId,
    role_id: roleId,
    skills: customSkills,
  });
  return res.data;
};

// M3: Career Recommendation APIs
export const fetchCareerRoles = async () => {
  const res = await API.get('/careers');
  return res.data;
};

export const fetchCareerByRoleId = async (roleId) => {
  const res = await API.get(`/careers/${roleId}`);
  return res.data;
};

export const getCareerRecommendations = async (studentId, profile = null) => {
  const res = await API.post('/careers/recommend', {
    student_id: studentId,
    profile: profile,
  });
  return res.data;
};

export default API;

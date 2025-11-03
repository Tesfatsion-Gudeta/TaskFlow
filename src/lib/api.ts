import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://task-manager-api-o835.onrender.com";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        localStorage.setItem("access_token", data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (email: string, password: string) => {
    const { data } = await api.post("/auth/register", { email, password });
    return data;
  },
  login: async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },
  logout: async () => {
    await api.post("/auth/logout");
    localStorage.removeItem("access_token");
  },
  getProfile: async () => {
    const { data } = await api.get("/users/profile");
    return data;
  },
};

// Projects API
export const projectsAPI = {
  getAll: async (params?: any) => {
    const { data } = await api.get("/projects", { params });
    return data;
  },
  getOne: async (id: number) => {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },
  create: async (projectData: { name: string }) => {
    const { data } = await api.post("/projects", projectData);
    return data;
  },
  update: async (id: number, projectData: { name: string }) => {
    const { data } = await api.patch(`/projects/${id}`, projectData);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/projects/${id}`);
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (params?: any) => {
    const { data } = await api.get("/tasks", { params });
    return data;
  },
  getAllAdmin: async (params?: any) => {
    const { data } = await api.get("/tasks/admin/all", { params });
    return data;
  },
  getOne: async (id: number) => {
    const { data } = await api.get(`/tasks/${id}`);
    return data;
  },
  create: async (taskData: any) => {
    const { data } = await api.post("/tasks", taskData);
    return data;
  },
  update: async (id: number, taskData: any) => {
    const { data } = await api.patch(`/tasks/${id}`, taskData);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/tasks/${id}`);
  },
  toggleComplete: async (id: number) => {
    const { data } = await api.post(`/tasks/${id}/toggle-complete`);
    return data;
  },
  assign: async (id: number, assigneeId: number) => {
    const { data } = await api.post(`/tasks/${id}/assign/${assigneeId}`);
    return data;
  },
  unassign: async (id: number) => {
    const { data } = await api.post(`/tasks/${id}/unassign`);
    return data;
  },
};

export const usersAPI = {
  getProfile: async () => {
    const { data } = await api.get("/users/profile");
    return data;
  },
};

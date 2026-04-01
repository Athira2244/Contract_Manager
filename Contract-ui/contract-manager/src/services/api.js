import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const userId = user.emp_pkey || user.user_id || user.id;
      // Identify admin user
      const isAdmin = String(userId).toLowerCase() === 'admin' 
                   || user.user_type === 'Admin' 
                   || user.role === 'Admin' 
                   || user.is_superadmin === true;
                   
      if (userId) config.headers['X-User-Id'] = String(userId);
      config.headers['X-User-Role'] = isAdmin ? 'Admin' : 'Employee';
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }
  }
  return config;
});

export const clientService = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

export const taskService = {
  getAll: () => api.get('/tasks'),
  getByUser: (userId) => api.get(`/tasks/user/${userId}`),
  getByAssignee: (assigneeId) => api.get(`/tasks/assignee/${assigneeId}`),
  getReport: (empId) => api.get(`/tasks/report/${empId}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, data) => api.put(`/tasks/${id}/status`, data),
  generateFromContract: (contractId) => api.post(`/tasks/generate-from-contract/${contractId}`),
};

export const deliverableService = {
  getByContract: (contractId) => api.get(`/deliverables/contract/${contractId}`),
  getFiltered: (month, year) => api.get(`/deliverables/filter`, { params: { month, year } }),
  updateStatus: (id, status) => api.put(`/deliverables/${id}/status`, null, { params: { status } }),
};

export const taskTemplateService = {
  getAll: () => api.get('/task-templates'),
  getByUser: (userId) => api.get(`/task-templates/user/${userId}`),
  create: (data) => api.post('/task-templates', data),
  update: (id, data) => api.put(`/task-templates/${id}`, data),
  delete: (id) => api.delete(`/task-templates/${id}`),
};

export const employeeTaskService = {
  getAll: () => api.get('/employees'),
  saveTime: (data) => api.post('/emp_task_time', data),
  getTimeByTask: (taskId) => api.get(`/emp_task_time/task/${taskId}`),
};

export const checklistService = {
  createTemplate: (data) => api.post('/checklists/templates', data),
  getTemplatesByUser: (userId) => api.get(`/checklists/templates/user/${userId}`),
  getTemplateItems: (templateId) => api.get(`/checklists/templates/${templateId}/items`),
  deleteTemplate: (templateId) => api.delete(`/checklists/templates/${templateId}`),
  getTaskChecklist: (taskId) => api.get(`/task_checklists/task/${taskId}`),
  toggleChecklistItem: (itemId) => api.put(`/task_checklists/${itemId}/toggle`),
  addChecklistItem: (data) => api.post('/task_checklists', data),
  deleteChecklistItem: (itemId) => api.delete(`/task_checklists/${itemId}`),
};

export const feedService = {
  getFeeds: (empId) => api.get(`/feeds/employee/${empId}`),
  createFeed: (data) => api.post('/feeds', data),
};

export const serviceService = {
  getAll: () => api.get('/services'),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

export const contractService = {
  getAll: () => api.get('/contracts'),
  getById: (id) => api.get(`/contracts/${id}`),
  getByClientId: (clientId) => api.get(`/contracts/client/${clientId}`),
  create: (data) => api.post('/contracts', data),
  update: (id, data) => api.put(`/contracts/${id}`, data),
  delete: (id) => api.delete(`/contracts/${id}`),
  updateStatus: (id, status) => api.patch(`/contracts/${id}/status`, status),
  getExpiring: () => api.get('/contracts/expiring'),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;

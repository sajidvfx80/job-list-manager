// API utility for making requests to backend

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: `HTTP error! status: ${response.status}` };
    }
    const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }
  return response.json();
};

export const api = {
  // Jobs
  getJobs: async (client = null, date = null) => {
    const params = new URLSearchParams();
    if (client) params.append('client', client);
    if (date) params.append('date', date);
    
    const query = params.toString();
    const url = `${API_BASE}/jobs${query ? `?${query}` : ''}`;
    return fetch(url).then(handleResponse);
  },

  getJob: async (id) => {
    return fetch(`${API_BASE}/jobs/${id}`).then(handleResponse);
  },

  createJob: async (jobData) => {
    return fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    }).then(handleResponse);
  },

  updateJob: async (id, jobData) => {
    return fetch(`${API_BASE}/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    }).then(handleResponse);
  },

  deleteJob: async (id) => {
    return fetch(`${API_BASE}/jobs/${id}`, {
      method: 'DELETE',
    }).then(handleResponse);
  },

  // Clients
  getClients: async () => {
    return fetch(`${API_BASE}/clients`).then(handleResponse);
  },

  addClient: async (name) => {
    return fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }).then(handleResponse);
  },

  // Employees
  getEmployees: async () => {
    return fetch(`${API_BASE}/employees`).then(handleResponse);
  },
};


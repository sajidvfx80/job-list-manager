// Storage utility for managing jobs, clients, and employees using API

import { api } from './api';

// Initialize - no longer needed for localStorage, but kept for compatibility
export const initializeStorage = async () => {
  // Database initialization happens on the backend
  // This function is kept for compatibility but does nothing
  return Promise.resolve();
};

export const getJobs = async () => {
  try {
    return await api.getJobs();
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
};

export const saveJob = async (job) => {
  try {
    if (job.id) {
      // Update existing job
      return await api.updateJob(job.id, {
        client: job.client,
        assignedTo: job.assignedTo,
        category: job.category,
        jobType: job.jobType,
        deliveryDate: job.deliveryDate,
        status: job.status,
        completionStatus: job.completionStatus,
        ledDeliverables: job.ledDeliverables,
        description: job.description,
      });
    } else {
      // Create new job
      return await api.createJob({
        client: job.client,
        assignedTo: job.assignedTo,
        category: job.category,
        jobType: job.jobType,
        deliveryDate: job.deliveryDate,
        status: job.status || 'pending',
        completionStatus: job.completionStatus,
        ledDeliverables: job.ledDeliverables || [],
        description: job.description,
      });
    }
  } catch (error) {
    console.error('Error saving job:', error);
    throw error;
  }
};

export const deleteJob = async (jobId) => {
  try {
    await api.deleteJob(jobId);
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

export const getClients = async () => {
  try {
    return await api.getClients();
  } catch (error) {
    console.error('Error fetching clients:', error);
    return ['stc', 'CBK', 'BK', 'PH', 'solutions', 'Subway'];
  }
};

export const addClient = async (clientName) => {
  try {
    await api.addClient(clientName);
    return await api.getClients();
  } catch (error) {
    console.error('Error adding client:', error);
    throw error;
  }
};

export const getEmployees = async () => {
  try {
    return await api.getEmployees();
  } catch (error) {
    console.error('Error fetching employees:', error);
    return ['Mijoy', 'Sajid'];
  }
};

export const getJobsByClient = async (clientName) => {
  try {
    return await api.getJobs(clientName);
  } catch (error) {
    console.error('Error fetching jobs by client:', error);
    return [];
  }
};

export const getJobsByDate = async (date, clientName = null) => {
  try {
    return await api.getJobs(clientName, date);
  } catch (error) {
    console.error('Error fetching jobs by date:', error);
    return [];
  }
};

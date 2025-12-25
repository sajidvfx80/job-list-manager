import { useState, useEffect } from 'react';
import { getClients, getJobsByClient, saveJob } from '../utils/storage';
import { format } from 'date-fns';

const ClientList = ({ onClientSelect, selectedClient, refreshKey = 0, onJobUpdate, onJobDelete, onJobEdit, darkMode = false }) => {
  const [clients, setClients] = useState([]);
  const [clientStats, setClientStats] = useState({});
  const [clientJobs, setClientJobs] = useState({});

  useEffect(() => {
    const loadClients = async () => {
      const clientList = await getClients();
      setClients(clientList);
      
      // Load stats and jobs for each client
      const stats = {};
      const jobs = {};
      for (const client of clientList) {
        const clientJobsList = await getJobsByClient(client);
        // Filter out completed jobs for display
        const activeJobs = clientJobsList.filter(job => job.status !== 'completed');
        jobs[client] = activeJobs;
        stats[client] = {
          total: clientJobsList.length,
          active: activeJobs.length,
          pending: activeJobs.filter(job => job.status === 'pending' || !job.status).length
        };
      }
      setClientStats(stats);
      setClientJobs(jobs);
    };
    loadClients();
  }, [refreshKey]);

  const handleCompleteJob = async (job, isChecked) => {
    try {
      // Get job data and update status to completed or revert
      const jobToUpdate = {
        ...job,
        id: job.id,
        client: job.client,
        assignedTo: job.assigned_to || job.assignedTo,
        category: job.category,
        jobTitle: job.job_title || job.jobTitle || '',
        jobName: job.job_name || job.jobName || '',
        jobType: Array.isArray(job.job_type) ? job.job_type : (job.job_type ? [job.job_type] : []),
        deliveryDate: job.delivery_date || job.deliveryDate,
        status: isChecked ? 'completed' : 'pending',
        completionStatus: job.completion_status || job.completionStatus,
        ledDeliverables: job.led_deliverables || job.ledDeliverables || [],
        description: job.description || ''
      };

      await saveJob(jobToUpdate);
      if (onJobUpdate) {
        onJobUpdate();
      }
      // Reload clients to refresh the view
      const clientList = await getClients();
      const stats = {};
      const jobs = {};
      for (const client of clientList) {
        const clientJobsList = await getJobsByClient(client);
        const activeJobs = clientJobsList.filter(job => job.status !== 'completed');
        jobs[client] = activeJobs;
        stats[client] = {
          total: clientJobsList.length,
          active: activeJobs.length,
          pending: activeJobs.filter(job => job.status === 'pending' || !job.status).length
        };
      }
      setClientStats(stats);
      setClientJobs(jobs);
    } catch (error) {
      console.error('Error completing job:', error);
      alert('Failed to complete job. Please try again.');
    }
  };

  const getJobTypeDisplay = (job) => {
    const jobTypeValue = job.job_type || job.jobType;
    const jobTypes = Array.isArray(jobTypeValue) 
      ? jobTypeValue 
      : (jobTypeValue ? (typeof jobTypeValue === 'string' && jobTypeValue.includes(',') 
          ? jobTypeValue.split(',').map(t => t.trim()) 
          : [jobTypeValue]) 
        : []);
    return jobTypes.join(', ');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Clients</h2>
      <div className="space-y-4">
        {clients.map(client => {
          const stats = clientStats[client] || { total: 0, active: 0, pending: 0 };
          const jobs = clientJobs[client] || [];
          const isSelected = selectedClient === client;

          return (
            <div
              key={client}
              className={`border-2 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                isSelected
                  ? darkMode
                    ? 'border-blue-500 bg-blue-900/30 shadow-2xl scale-105'
                    : 'border-blue-600 bg-blue-50 shadow-xl scale-105'
                  : darkMode
                  ? 'border-gray-700 bg-gray-700/50 hover:border-blue-400 hover:bg-gray-700'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              {/* Client Header */}
              <div className="p-4">
                <button
                  onClick={() => onClientSelect(client)}
                  className="w-full text-left transition-transform duration-300 hover:scale-105"
                >
                  <div className={`font-semibold text-lg mb-1 ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>{client}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                    <div>Total: {stats.total} | Active: {stats.active}</div>
                    <div className="text-orange-600">Pending: {stats.pending}</div>
                  </div>
                </button>
              </div>

              {/* Jobs List - Always Visible in Grid Layout */}
              {jobs.length > 0 && (
                <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} p-4 transition-colors duration-300`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {jobs.map(job => {
                      const jobTypeDisplay = getJobTypeDisplay(job);
                      const deliveryDate = job.delivery_date || job.deliveryDate;
                      const assignedTo = job.assigned_to || job.assignedTo;
                      // Jobs in this list are already filtered to be non-completed, so checkbox should be unchecked
                      const isCompleted = false;
                      
                      const jobTitle = job.job_title || job.jobTitle || '';
                      const jobName = job.job_name || job.jobName || '';
                      // Prioritize job_title, fallback to job_name only if it's not "Untitled Job"
                      const displayName = jobTitle || (jobName && jobName !== 'Untitled Job' ? jobName : '') || jobTypeDisplay || 'N/A';
                      
                      return (
                        <div
                          key={job.id}
                          className={`flex flex-col p-3 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} rounded-lg border transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={false}
                                onChange={(e) => handleCompleteJob(job, e.target.checked)}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                                title="Mark as completed"
                              />
                              <span className="ml-2 text-xs text-gray-700">Completed</span>
                            </label>
                            <div className="flex gap-2">
                              <button
                                onClick={() => onJobEdit && onJobEdit(job)}
                                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                title="Edit job"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => onJobDelete && onJobDelete(job.id)}
                                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                title="Delete job"
                              >
                                ✕ Delete
                              </button>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className={`font-medium text-sm mb-1 ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                              {displayName}
                            </div>
                            {jobTitle && jobName && (
                              <div className={`text-xs mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                                {jobName}
                              </div>
                            )}
                            {jobTypeDisplay && displayName !== jobTypeDisplay && (
                              <div className={`text-xs mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                                Type: {jobTypeDisplay}
                              </div>
                            )}
                            <div className={`text-xs mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                              <div>Assigned: {assignedTo}</div>
                              <div>Delivery: {deliveryDate ? format(new Date(deliveryDate), 'MMM dd, yyyy') : 'Not Specified'}</div>
                            </div>
                            {job.description && (
                              <div className="text-xs text-gray-500 mt-1 line-clamp-2">{job.description}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {jobs.length === 0 && (
                <div className="border-t border-gray-200 p-4 bg-gray-50 text-center text-gray-500">
                  No active jobs for this client
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClientList;


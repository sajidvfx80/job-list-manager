import { useState, useEffect } from 'react';
import { getClients, getJobsByClient, saveJob } from '../utils/storage';
import { format } from 'date-fns';

const ClientList = ({ onClientSelect, selectedClient, refreshKey = 0, onJobUpdate }) => {
  const [clients, setClients] = useState([]);
  const [clientStats, setClientStats] = useState({});
  const [clientJobs, setClientJobs] = useState({});
  const [expandedClients, setExpandedClients] = useState({});

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

  const toggleClientExpansion = (client) => {
    setExpandedClients(prev => ({
      ...prev,
      [client]: !prev[client]
    }));
  };

  const handleCompleteJob = async (job) => {
    try {
      // Get job data and update status to completed
      const jobToUpdate = {
        ...job,
        id: job.id,
        client: job.client,
        assignedTo: job.assigned_to || job.assignedTo,
        category: job.category,
        jobType: Array.isArray(job.job_type) ? job.job_type : (job.job_type ? [job.job_type] : []),
        deliveryDate: job.delivery_date || job.deliveryDate,
        status: 'completed',
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
          const isExpanded = expandedClients[client];

          return (
            <div
              key={client}
              className={`border-2 rounded-lg transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {/* Client Header */}
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => onClientSelect(client)}
                    className="flex-1 text-left"
                  >
                    <div className="font-semibold text-lg mb-1">{client}</div>
                    <div className="text-sm text-gray-600">
                      <div>Total: {stats.total} | Active: {stats.active}</div>
                      <div className="text-orange-600">Pending: {stats.pending}</div>
                    </div>
                  </button>
                  {jobs.length > 0 && (
                    <button
                      onClick={() => toggleClientExpansion(client)}
                      className="ml-4 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
                    >
                      {isExpanded ? 'Hide Jobs' : 'Show Jobs'}
                    </button>
                  )}
                </div>
              </div>

              {/* Jobs List */}
              {isExpanded && jobs.length > 0 && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="space-y-2">
                    {jobs.map(job => {
                      const jobTypeDisplay = getJobTypeDisplay(job);
                      const deliveryDate = job.delivery_date || job.deliveryDate;
                      const assignedTo = job.assigned_to || job.assignedTo;
                      
                      const jobName = job.job_name || job.jobName || jobTypeDisplay || 'N/A';
                      
                      return (
                        <div
                          key={job.id}
                          className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 hover:shadow-sm"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {jobName}
                            </div>
                            {jobTypeDisplay && jobName !== jobTypeDisplay && (
                              <div className="text-sm text-gray-600 mt-1">
                                Type: {jobTypeDisplay}
                              </div>
                            )}
                            <div className="text-sm text-gray-600">
                              Assigned to: {assignedTo} | Delivery: {format(new Date(deliveryDate), 'MMM dd, yyyy')}
                            </div>
                            {job.description && (
                              <div className="text-xs text-gray-500 mt-1">{job.description}</div>
                            )}
                          </div>
                          <button
                            onClick={() => handleCompleteJob(job)}
                            className="ml-4 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                          >
                            Complete
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {isExpanded && jobs.length === 0 && (
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


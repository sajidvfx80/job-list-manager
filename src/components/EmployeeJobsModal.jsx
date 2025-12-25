import { useState, useEffect } from 'react';
import { getJobs } from '../utils/storage';
import { format } from 'date-fns';

const EmployeeJobsModal = ({ isOpen, onClose, employeeName, onDelete }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && employeeName) {
      loadEmployeeJobs();
    }
  }, [isOpen, employeeName]);

  const loadEmployeeJobs = async () => {
    setLoading(true);
    try {
      const allJobs = await getJobs();
      const employeeJobs = allJobs.filter(job => {
        const assignedTo = job.assigned_to || job.assignedTo;
        return assignedTo === employeeName;
      });
      setJobs(employeeJobs);
    } catch (error) {
      console.error('Error loading employee jobs:', error);
      alert('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'current job':
        return 'bg-blue-500';
      case 'upcoming job':
        return 'bg-purple-500';
      case 'pending jobs':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {employeeName}'s Jobs
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {loading ? 'Loading...' : `${jobs.length} job(s) found`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No jobs found for {employeeName}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map(job => {
                    const jobTypeDisplay = getJobTypeDisplay(job);
                    const deliveryDate = job.delivery_date || job.deliveryDate;
                    const jobTitle = job.job_title || job.jobTitle || '';
                    const jobName = job.job_name || job.jobName || '';
                    // Prioritize job_title over job_name, especially if job_name is "Untitled Job"
                    const displayJobName = (jobTitle && jobTitle.trim()) || (jobName && jobName !== 'Untitled Job' ? jobName : '') || 'N/A';
                    const completionStatus = job.completion_status || job.completionStatus;
                    
                    return (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {job.client}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {displayJobName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getCategoryColor(job.category)}`}>
                            {job.category || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {jobTypeDisplay || 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(deliveryDate), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                            {job.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {completionStatus || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => onDelete && onDelete(job.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeJobsModal;


import { useState, useEffect } from 'react';
import { getJobs } from '../utils/storage';
import { format } from 'date-fns';

const JobFilterModal = ({ isOpen, onClose, filterType, darkMode = false }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFilteredJobs();
    }
  }, [isOpen, filterType]);

  const loadFilteredJobs = async () => {
    setLoading(true);
    try {
      const allJobs = await getJobs();
      let filteredJobs = [];

      switch (filterType) {
        case 'all':
          filteredJobs = allJobs;
          break;
        case 'current':
          filteredJobs = allJobs.filter(job => job.category === 'current job');
          break;
        case 'pending':
          filteredJobs = allJobs.filter(job => job.category === 'pending jobs' || job.status === 'pending');
          break;
        case 'completed':
          filteredJobs = allJobs.filter(job => job.status === 'completed');
          break;
        default:
          filteredJobs = allJobs;
      }

      setJobs(filteredJobs);
    } catch (error) {
      console.error('Error loading filtered jobs:', error);
      alert('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFilterTitle = () => {
    switch (filterType) {
      case 'all':
        return 'All Jobs';
      case 'current':
        return 'Current Jobs';
      case 'pending':
        return 'Pending Jobs';
      case 'completed':
        return 'Completed Jobs';
      default:
        return 'Jobs';
    }
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
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300`}>
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-300`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                {getFilterTitle()}
              </h2>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
                {loading ? 'Loading...' : `${jobs.length} job(s) found`}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-300 ${
                darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
              Loading jobs...
            </div>
          ) : jobs.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
              No jobs found for {getFilterTitle().toLowerCase()}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-300`}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-300`}>
                      Client
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-300`}>
                      Job Title
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-300`}>
                      Category
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-300`}>
                      Job Type
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-300`}>
                      Assigned To
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-300`}>
                      Delivery Date
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-300`}>
                      Status
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-300`}>
                      Completion
                    </th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-y divide-gray-200'} transition-colors duration-300`}>
                  {jobs.map(job => {
                    const jobTypeValue = job.job_type || job.jobType;
                    const jobTypes = Array.isArray(jobTypeValue) 
                      ? jobTypeValue 
                      : (jobTypeValue ? (typeof jobTypeValue === 'string' && jobTypeValue.includes(',') 
                          ? jobTypeValue.split(',').map(t => t.trim()) 
                          : [jobTypeValue]) 
                        : []);
                    const jobTypeDisplay = jobTypes.join(', ');
                    const jobTitle = job.job_title || job.jobTitle || '';
                    const jobName = job.job_name || job.jobName || '';
                    const displayJobName = jobTitle || (jobName && jobName !== 'Untitled Job' ? jobName : '') || 'N/A';
                    const deliveryDate = job.delivery_date || job.deliveryDate;
                    const assignedTo = job.assigned_to || job.assignedTo;
                    const completionStatus = job.completion_status || job.completionStatus;
                    
                    return (
                      <tr key={job.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-300`}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {job.client}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className="font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                            {displayJobName}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getCategoryColor(job.category)}`}>
                            {job.category || 'N/A'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'} transition-colors duration-300`}>
                          {jobTypeDisplay || 'N/A'}
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'} transition-colors duration-300`}>
                          {assignedTo || 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className="font-bold text-orange-600">
                            {deliveryDate ? format(new Date(deliveryDate), 'MMM dd, yyyy') : 'Not Specified'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                            {job.status || 'pending'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'} transition-colors duration-300`}>
                          {completionStatus || '-'}
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

export default JobFilterModal;


import { useState } from 'react';
import { format } from 'date-fns';
import JobForm from './JobForm';

const JobList = ({ jobs, onUpdate, onDelete, clientName = null }) => {
  const [editingJob, setEditingJob] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleEdit = (job) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingJob(null);
    onUpdate();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingJob(null);
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

  const sortedJobs = [...jobs].sort((a, b) => {
    const dateA = new Date(a.delivery_date || a.deliveryDate);
    const dateB = new Date(b.delivery_date || b.deliveryDate);
    return dateA - dateB;
  });

  if (sortedJobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        No jobs found{clientName ? ` for ${clientName}` : ''}.
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedJobs.map(job => {
                // Handle both snake_case (from DB) and camelCase (from form)
                const jobTypeValue = job.job_type || job.jobType;
                // Handle jobType as array or string
                const jobTypes = Array.isArray(jobTypeValue) 
                  ? jobTypeValue 
                  : (jobTypeValue ? (typeof jobTypeValue === 'string' && jobTypeValue.includes(',') 
                      ? jobTypeValue.split(',').map(t => t.trim()) 
                      : [jobTypeValue]) 
                    : []);
                const assignedTo = job.assigned_to || job.assignedTo;
                const deliveryDate = job.delivery_date || job.deliveryDate;
                const completionStatus = job.completion_status || job.completionStatus;
                const ledDeliverables = job.led_deliverables || job.ledDeliverables;
                const hasLED = jobTypes.includes('LED');
                
                const jobTitle = job.job_title || job.jobTitle || '';
                const jobName = job.job_name || job.jobName || '';
                // Prioritize job_title, fallback to job_name only if it's not "Untitled Job"
                const displayJobName = jobTitle || (jobName && jobName !== 'Untitled Job' ? jobName : '') || '-';
                
                return (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{job.client}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">{displayJobName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {jobName && jobName !== 'Untitled Job' ? jobName : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getCategoryColor(job.category)}`}>
                        {job.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {jobTypes.map((type, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                            {type}
                          </span>
                        ))}
                      </div>
                      {hasLED && ledDeliverables && ledDeliverables.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          LED: {ledDeliverables.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignedTo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="font-bold text-orange-600">{deliveryDate ? format(new Date(deliveryDate), 'MMM dd, yyyy') : 'Not Specified'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                        {job.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {completionStatus || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(job)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete && onDelete(job.id)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <JobForm
          job={editingJob}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default JobList;


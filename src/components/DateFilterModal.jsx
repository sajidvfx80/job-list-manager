import { useState } from 'react';
import { getJobsByDate, getJobsByClient } from '../utils/storage';
import { exportJobsToPDF } from '../utils/pdfExport';
import { format } from 'date-fns';

const DateFilterModal = ({ isOpen, onClose, clientName = null }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleFilter = async () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    try {
      const jobs = await getJobsByDate(selectedDate, clientName);
      setFilteredJobs(jobs);
      setShowResults(true);
    } catch (error) {
      console.error('Error filtering jobs:', error);
      alert('Failed to filter jobs. Please try again.');
    }
  };

  const handleExportPDF = () => {
    if (filteredJobs.length === 0) {
      alert('No jobs to export');
      return;
    }
    exportJobsToPDF(filteredJobs, clientName, selectedDate);
  };

  const handleClose = () => {
    setSelectedDate('');
    setFilteredJobs([]);
    setShowResults(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Filter Jobs by Date{clientName ? ` - ${clientName}` : ''}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <div className="flex space-x-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleFilter}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Filter
              </button>
            </div>
          </div>

          {showResults && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-600">
                  Found {filteredJobs.length} job(s) for {format(new Date(selectedDate), 'MMM dd, yyyy')}
                </div>
                {filteredJobs.length > 0 && (
                  <button
                    onClick={handleExportPDF}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Export to PDF
                  </button>
                )}
              </div>

              {filteredJobs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No jobs found for the selected date.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Client
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Job Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Assigned To
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Completion
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredJobs.map(job => {
                        const jobType = job.job_type || job.jobType;
                        const assignedTo = job.assigned_to || job.assignedTo;
                        const completionStatus = job.completion_status || job.completionStatus;
                        const ledDeliverables = job.led_deliverables || job.ledDeliverables;
                        
                        return (
                          <tr key={job.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {job.client}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {job.category}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {jobType}
                              {jobType === 'LED' && ledDeliverables && ledDeliverables.length > 0 && (
                                <div className="text-xs text-gray-500">
                                  {ledDeliverables.join(', ')}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {assignedTo}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {job.status || 'pending'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default DateFilterModal;


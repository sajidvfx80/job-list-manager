import { useState, useEffect } from 'react';
import { saveJob, getClients, getEmployees } from '../utils/storage';

const LED_DELIVERABLES = [
  'Adzone',
  'M2R',
  'Ceremony',
  'Waterfront Outdoor',
  'Waterfront Indoor 7 Screens',
  'Dae3ty'
];

const JOB_TYPES = ['SM', 'LED', 'PMax', 'Branches', 'TikTok', '3D Visual'];
const CATEGORIES = ['current job', 'upcoming job', 'pending jobs'];

const JobForm = ({ job = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    client: '',
    assignedTo: '',
    category: 'current job',
    jobTitle: '',
    jobName: '',
    jobType: [], // Changed to array for multiple selection
    deliveryDate: '',
    status: 'pending',
    completionStatus: '',
    ledDeliverables: [],
    description: ''
  });
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [clientsList, employeesList] = await Promise.all([
        getClients(),
        getEmployees()
      ]);
      setClients(clientsList);
      setEmployees(employeesList);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (job) {
      // Handle jobType - could be string (old) or array (new)
      let jobTypes = [];
      if (job.job_type || job.jobType) {
        const jobTypeValue = job.job_type || job.jobType;
        if (Array.isArray(jobTypeValue)) {
          jobTypes = jobTypeValue;
        } else if (typeof jobTypeValue === 'string') {
          // If it's a comma-separated string, split it
          jobTypes = jobTypeValue.includes(',') ? jobTypeValue.split(',').map(t => t.trim()) : [jobTypeValue];
        }
      }
      
      setFormData({
        client: job.client || '',
        assignedTo: job.assigned_to || job.assignedTo || '',
        category: job.category || 'current job',
        jobTitle: job.job_title || job.jobTitle || '',
        jobName: job.job_name || job.jobName || '',
        jobType: jobTypes.length > 0 ? jobTypes : [],
        deliveryDate: job.delivery_date ? new Date(job.delivery_date).toISOString().split('T')[0] : (job.deliveryDate ? job.deliveryDate.split('T')[0] : ''),
        status: job.status || 'pending',
        completionStatus: job.completion_status || job.completionStatus || '',
        ledDeliverables: job.led_deliverables || job.ledDeliverables || [],
        description: job.description || ''
      });
    }
  }, [job]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLEDDeliverableToggle = (deliverable) => {
    setFormData(prev => ({
      ...prev,
      ledDeliverables: prev.ledDeliverables.includes(deliverable)
        ? prev.ledDeliverables.filter(d => d !== deliverable)
        : [...prev.ledDeliverables, deliverable]
    }));
  };

  const handleJobTypeToggle = (jobType) => {
    setFormData(prev => ({
      ...prev,
      jobType: prev.jobType.includes(jobType)
        ? prev.jobType.filter(t => t !== jobType)
        : [...prev.jobType, jobType]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only require client and assignedTo - make other fields optional
    if (!formData.client || !formData.assignedTo) {
      alert('Please select a client and assign to an employee');
      return;
    }

    // Set default values for missing fields
    const jobToSave = {
      ...formData,
      id: job?.id,
      jobTitle: formData.jobTitle || '',
      jobName: formData.jobName || 'Untitled Job',
      jobType: formData.jobType && formData.jobType.length > 0 ? formData.jobType : ['SM'],
      category: formData.category || 'current job',
      deliveryDate: formData.deliveryDate 
        ? new Date(formData.deliveryDate).toISOString()
        : new Date().toISOString(), // Default to today if not set
      status: formData.status || 'pending',
    };

    try {
      await saveJob(jobToSave);
      onSave();
    } catch (error) {
      console.error('Error saving job:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Failed to save job: ${errorMessage}. Please check the console for details.`);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">{job ? 'Edit Job' : 'Add New Job'}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                name="client"
                value={formData.client}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign To <span className="text-red-500">*</span>
              </label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter job title (optional)"
              />
            </div>

            {/* Job Type - Multiple Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type
                <span className="text-xs text-gray-500 ml-2">(Select multiple if needed)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {JOB_TYPES.map(type => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.jobType.includes(type)}
                      onChange={() => handleJobTypeToggle(type)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* LED Deliverables */}
            {formData.jobType.includes('LED') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LED Deliverables
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {LED_DELIVERABLES.map(deliverable => (
                    <label key={deliverable} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.ledDeliverables.includes(deliverable)}
                        onChange={() => handleLEDDeliverableToggle(deliverable)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{deliverable}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              
              {/* Quick Date Selection */}
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-2">Quick Select:</p>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    
                    const quickDates = [
                      { label: 'Today', date: today },
                      { label: 'Tomorrow', date: tomorrow }
                    ];
                    
                    // Add next 7 days
                    for (let i = 2; i <= 8; i++) {
                      const date = new Date(today);
                      date.setDate(date.getDate() + i);
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                      quickDates.push({ label: dayName, date });
                    }
                    
                    return quickDates.map((item, index) => {
                      const dateStr = item.date.toISOString().split('T')[0];
                      const displayDate = item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      const isSelected = formData.deliveryDate === dateStr;
                      
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, deliveryDate: dateStr }))}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {item.label}
                          <span className="ml-1 text-xs opacity-75">({displayDate})</span>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Completion Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Status
              </label>
              <select
                name="completionStatus"
                value={formData.completionStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Not Completed</option>
                <option value="sample delivered">Sample Delivered</option>
                <option value="rollout">Rollout</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any additional notes..."
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {job ? 'Update Job' : 'Add Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobForm;


import { useState, useEffect } from 'react';
import { initializeStorage, getJobs, getJobsByClient, getEmployees, deleteJob } from './utils/storage';
import ClientList from './components/ClientList';
import JobList from './components/JobList';
import JobForm from './components/JobForm';
import DateFilterModal from './components/DateFilterModal';
import AddClientModal from './components/AddClientModal';
import EmployeeJobsModal from './components/EmployeeJobsModal';
import PDFExportModal from './components/PDFExportModal';

function App() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showPDFExport, setShowPDFExport] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const init = async () => {
      await initializeStorage();
      await loadJobs();
      await loadEmployees();
    };
    init();
  }, [selectedClient, refreshKey]);

  const loadEmployees = async () => {
    try {
      const employeesList = await getEmployees();
      setEmployees(employeesList);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadJobs = async () => {
    try {
      let allJobs = [];
      if (selectedClient) {
        allJobs = await getJobsByClient(selectedClient);
      } else {
        allJobs = await getJobs();
      }
      
      // Show all jobs in the full list (including completed)
      setJobs(allJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      setJobs([]);
    }
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client === selectedClient ? null : client);
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployeeForModal(employee);
    setShowEmployeeModal(true);
  };

  const handleJobDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        await deleteJob(jobId);
        setRefreshKey(prev => prev + 1);
        await loadJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job. Please try again.');
      }
    }
  };

  const handleJobAdded = () => {
    setRefreshKey(prev => prev + 1);
    setShowJobForm(false);
  };

  const handleClientAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getJobStats = () => {
    return {
      total: jobs.length,
      current: jobs.filter(j => j.category === 'current job').length,
      upcoming: jobs.filter(j => j.category === 'upcoming job').length,
      pending: jobs.filter(j => j.category === 'pending jobs' || j.status === 'pending').length,
      completed: jobs.filter(j => j.status === 'completed').length
    };
  };

  const getEmployeeStats = () => {
    const stats = {};
    employees.forEach(emp => {
      const empJobs = jobs.filter(job => {
        const assignedTo = job.assigned_to || job.assignedTo;
        return assignedTo === emp;
      });
      stats[emp] = {
        total: empJobs.length,
        current: empJobs.filter(j => j.category === 'current job').length,
        pending: empJobs.filter(j => j.category === 'pending jobs' || j.status === 'pending').length,
        completed: empJobs.filter(j => j.status === 'completed').length
      };
    });
    return stats;
  };

  const stats = getJobStats();
  const employeeStats = getEmployeeStats();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Job List Manager</h1>
            <div className="flex flex-col space-y-2">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowJobForm(true)}
                  className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  ➕ Add New Job
                </button>
                <button
                  onClick={() => setShowAddClient(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add Client
                </button>
              </div>
              <button
                onClick={() => setShowDateFilter(true)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Filter by Date
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Employee Statistics - Clickable to View Jobs */}
        {employees.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Employee Job Overview</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employees.map(emp => {
                const empStat = employeeStats[emp] || { total: 0, current: 0, pending: 0, completed: 0 };
                return (
                  <button
                    key={emp}
                    onClick={() => handleEmployeeSelect(emp)}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all text-left"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{emp}</h3>
                      <span className="text-2xl font-bold text-blue-600">{empStat.total}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-gray-600">Current</div>
                        <div className="font-semibold text-blue-600">{empStat.current}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Pending</div>
                        <div className="font-semibold text-yellow-600">{empStat.pending}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Completed</div>
                        <div className="font-semibold text-green-600">{empStat.completed}</div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-blue-600 font-medium">
                      Click to view jobs →
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Total Jobs</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Current Jobs</div>
            <div className="text-2xl font-bold text-blue-600">{stats.current}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Upcoming Jobs</div>
            <div className="text-2xl font-bold text-purple-600">{stats.upcoming}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Pending Jobs</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </div>
        </div>

        {/* Client List */}
        <ClientList
          onClientSelect={handleClientSelect}
          selectedClient={selectedClient}
          refreshKey={refreshKey}
          onJobUpdate={loadJobs}
          onJobDelete={handleJobDelete}
        />

        {/* Selected Client Info */}
        {selectedClient && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-blue-900">
                  Viewing Jobs for: {selectedClient}
                </h2>
                <p className="text-sm text-blue-700 mt-1">
                  {jobs.length} job(s) found
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPDFExport(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                  title="Export to PDF"
                >
                  📄 Export PDF
                </button>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  View All Jobs
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Job List */}
        <JobList
          jobs={jobs}
          onUpdate={loadJobs}
          onDelete={handleJobDelete}
          clientName={selectedClient}
        />
      </main>

      {/* Modals */}
      {showJobForm && (
        <JobForm
          onSave={handleJobAdded}
          onCancel={() => setShowJobForm(false)}
        />
      )}

      {showDateFilter && (
        <DateFilterModal
          isOpen={showDateFilter}
          onClose={() => setShowDateFilter(false)}
          clientName={selectedClient}
        />
      )}

      {showAddClient && (
        <AddClientModal
          isOpen={showAddClient}
          onClose={() => setShowAddClient(false)}
          onClientAdded={handleClientAdded}
        />
      )}

      {showEmployeeModal && (
        <EmployeeJobsModal
          isOpen={showEmployeeModal}
          onClose={() => {
            setShowEmployeeModal(false);
            setSelectedEmployeeForModal(null);
          }}
          employeeName={selectedEmployeeForModal}
          onDelete={handleJobDelete}
        />
      )}

      {showPDFExport && (
        <PDFExportModal
          isOpen={showPDFExport}
          onClose={() => setShowPDFExport(false)}
        />
      )}
    </div>
  );
}

export default App;


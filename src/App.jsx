import { useState, useEffect } from 'react';
import { initializeStorage, getJobs, getJobsByClient, getEmployees, deleteJob } from './utils/storage';
import ClientList from './components/ClientList';
import JobList from './components/JobList';
import JobForm from './components/JobForm';
import DateFilterModal from './components/DateFilterModal';
import AddClientModal from './components/AddClientModal';
import EmployeeJobsModal from './components/EmployeeJobsModal';
import PDFExportModal from './components/PDFExportModal';
import JobFilterModal from './components/JobFilterModal';

function App() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showPDFExport, setShowPDFExport] = useState(false);
  const [showJobFilterModal, setShowJobFilterModal] = useState(false);
  const [selectedFilterType, setSelectedFilterType] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [showRefreshNotification, setShowRefreshNotification] = useState(false);
  const [jobFilter, setJobFilter] = useState('all'); // 'all', 'completed', 'current', 'pending' - for main view filtering
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initializeStorage();
      await loadJobs();
      await loadEmployees();
    };
    init();
  }, [selectedClient, refreshKey, jobFilter]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auto-refresh data every hour (3600000 milliseconds)
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        await loadJobs();
        await loadEmployees();
        const now = new Date();
        setLastRefreshTime(now);
        setShowRefreshNotification(true);
        // Hide notification after 3 seconds
        setTimeout(() => setShowRefreshNotification(false), 3000);
        console.log('Data refreshed automatically at', now.toLocaleTimeString());
      } catch (error) {
        console.error('Error during auto-refresh:', error);
      }
    }, 3600000); // 1 hour = 3600000 milliseconds

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [selectedClient]); // Re-run if selectedClient changes

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
      
      // Apply filter
      let filteredJobs = allJobs;
      if (jobFilter === 'completed') {
        filteredJobs = allJobs.filter(job => job.status === 'completed');
      } else if (jobFilter === 'current') {
        filteredJobs = allJobs.filter(job => job.category === 'current job');
      } else if (jobFilter === 'pending') {
        filteredJobs = allJobs.filter(job => job.category === 'pending jobs' || job.status === 'pending');
      }
      
      // Show filtered jobs in the full list
      setJobs(filteredJobs);
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
    setEditingJob(null);
  };

  const handleJobEdit = (job) => {
    setEditingJob(job);
    setShowJobForm(true);
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
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>Job List Manager</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                  darkMode 
                    ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400 shadow-lg' 
                    : 'bg-gray-800 text-white hover:bg-gray-700 shadow-lg'
                }`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
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
                <button
                  onClick={() => setShowPDFExport(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                  title="Export Jobs to PDF"
                >
                  📄 Export PDF
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
        {/* Auto-refresh Notification */}
        {showRefreshNotification && (
          <div className={`fixed top-20 right-4 z-50 ${darkMode ? 'bg-green-600' : 'bg-green-500'} text-white px-4 py-2 rounded-lg shadow-xl transition-all duration-300 transform animate-slide-in`}>
            <div className="flex items-center gap-2">
              <span>🔄</span>
              <span className="text-sm font-medium">Data refreshed automatically</span>
            </div>
          </div>
        )}

        {/* Last Refresh Time Indicator */}
        {lastRefreshTime && (
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2 text-right transition-colors duration-300`}>
            Last auto-refresh: {lastRefreshTime.toLocaleTimeString()}
          </div>
        )}

        {/* Job Filter Buttons */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-4 mb-6 transition-all duration-300 transform hover:scale-[1.01]`}>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => {
                setSelectedFilterType('all');
                setShowJobFilterModal(true);
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-lg ${
                darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📋 All Jobs
            </button>
            <button
              onClick={() => {
                setSelectedFilterType('current');
                setShowJobFilterModal(true);
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-lg ${
                darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ⚡ Current Jobs
            </button>
            <button
              onClick={() => {
                setSelectedFilterType('pending');
                setShowJobFilterModal(true);
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-lg ${
                darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ⏳ Pending Jobs
            </button>
            <button
              onClick={() => {
                setSelectedFilterType('completed');
                setShowJobFilterModal(true);
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-lg ${
                darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ✅ Completed Jobs
            </button>
          </div>
        </div>

        {/* Employee Statistics - Clickable to View Jobs */}
        {employees.length > 0 && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-6 mb-6 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>Employee Job Overview</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employees.map(emp => {
                const empStat = employeeStats[emp] || { total: 0, current: 0, pending: 0, completed: 0 };
                return (
                  <button
                    key={emp}
                    onClick={() => handleEmployeeSelect(emp)}
                    className={`border-2 ${darkMode ? 'border-gray-600 bg-gray-700/50 hover:border-blue-400' : 'border-gray-200 hover:border-blue-300'} rounded-xl p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-left`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>{emp}</h3>
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">{empStat.total}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Current</div>
                        <div className="font-semibold text-blue-600">{empStat.current}</div>
                      </div>
                      <div>
                        <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Pending</div>
                        <div className="font-semibold text-yellow-600">{empStat.pending}</div>
                      </div>
                      <div>
                        <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Completed</div>
                        <div className="font-semibold text-green-600">{empStat.completed}</div>
                      </div>
                    </div>
                    <div className={`mt-3 text-xs font-medium transition-colors duration-300 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
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
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-4 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:rotate-1`}>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>Total Jobs</div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>{stats.total}</div>
          </div>
          <div className={`${darkMode ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-blue-50 to-blue-100'} rounded-xl shadow-xl p-4 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:rotate-1`}>
            <div className={`text-sm ${darkMode ? 'text-blue-200' : 'text-gray-600'} transition-colors duration-300`}>Current Jobs</div>
            <div className="text-2xl font-bold text-blue-600">{stats.current}</div>
          </div>
          <div className={`${darkMode ? 'bg-gradient-to-br from-purple-600 to-purple-800' : 'bg-gradient-to-br from-purple-50 to-purple-100'} rounded-xl shadow-xl p-4 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:rotate-1`}>
            <div className={`text-sm ${darkMode ? 'text-purple-200' : 'text-gray-600'} transition-colors duration-300`}>Upcoming Jobs</div>
            <div className="text-2xl font-bold text-purple-600">{stats.upcoming}</div>
          </div>
          <div className={`${darkMode ? 'bg-gradient-to-br from-yellow-600 to-orange-600' : 'bg-gradient-to-br from-yellow-50 to-orange-100'} rounded-xl shadow-xl p-4 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:rotate-1`}>
            <div className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-gray-600'} transition-colors duration-300`}>Pending Jobs</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className={`${darkMode ? 'bg-gradient-to-br from-green-600 to-emerald-600' : 'bg-gradient-to-br from-green-50 to-emerald-100'} rounded-xl shadow-xl p-4 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:rotate-1`}>
            <div className={`text-sm ${darkMode ? 'text-green-200' : 'text-gray-600'} transition-colors duration-300`}>Completed</div>
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
          onJobEdit={handleJobEdit}
          darkMode={darkMode}
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
          job={editingJob}
          onSave={handleJobAdded}
          onCancel={() => {
            setShowJobForm(false);
            setEditingJob(null);
          }}
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


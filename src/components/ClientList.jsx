import { useState, useEffect } from 'react';
import { getClients, getJobsByClient } from '../utils/storage';

const ClientList = ({ onClientSelect, selectedClient, refreshKey = 0 }) => {
  const [clients, setClients] = useState([]);
  const [clientStats, setClientStats] = useState({});

  useEffect(() => {
    const loadClients = async () => {
      const clientList = await getClients();
      setClients(clientList);
      
      // Load stats for each client
      const stats = {};
      for (const client of clientList) {
        const jobs = await getJobsByClient(client);
        stats[client] = {
          total: jobs.length,
          pending: jobs.filter(job => job.status === 'pending' || !job.status).length
        };
      }
      setClientStats(stats);
    };
    loadClients();
  }, [refreshKey]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Clients</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {clients.map(client => {
          const stats = clientStats[client] || { total: 0, pending: 0 };
          const totalJobs = stats.total;
          const pendingJobs = stats.pending;
          const isSelected = selectedClient === client;

          return (
            <button
              key={client}
              onClick={() => onClientSelect(client)}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div className="font-semibold text-lg mb-1">{client}</div>
              <div className="text-sm text-gray-600">
                <div>Total: {totalJobs}</div>
                <div className="text-orange-600">Pending: {pendingJobs}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ClientList;


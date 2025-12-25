import { useState } from 'react';
import { addClient, getClients } from '../utils/storage';

const AddClientModal = ({ isOpen, onClose, onClientAdded }) => {
  const [clientName, setClientName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Please enter a client name');
      return;
    }

    try {
      const existingClients = await getClients();
      if (existingClients.includes(clientName.trim())) {
        alert('Client already exists');
        return;
      }

      await addClient(clientName.trim());
      setClientName('');
      onClientAdded();
      onClose();
    } catch (error) {
      console.error('Error adding client:', error);
      if (error.message.includes('already exists') || error.message.includes('409')) {
        alert('Client already exists');
      } else {
        alert('Failed to add client. Please try again.');
      }
    }
  };

  const handleClose = () => {
    setClientName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Add New Client</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Name
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter client name"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientModal;


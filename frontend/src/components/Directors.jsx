import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Directors() {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDirector, setEditingDirector] = useState(null);
  const [newDirector, setNewDirector] = useState({ name: '', country: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    fetchDirectors();
  }, []);

  const fetchDirectors = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/directors/');
      if (response.ok) {
        const data = await response.json();
        setDirectors(data);
      } else {
        setError('Error loading directors');
      }
    } catch (err) {
      setError('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setError('You must log in to create directors');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/directors/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newDirector),
      });

      if (response.ok) {
        setSuccess('Director created successfully');
        setShowCreateModal(false);
        setNewDirector({ name: '', country: '' });
        fetchDirectors();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(JSON.stringify(data) || 'Error creating director');
      }
    } catch (err) {
      setError('Server connection error');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setError('You must log in to edit directors');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/directors/${editingDirector.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editingDirector),
      });

      if (response.ok) {
        setSuccess('Director updated successfully');
        setShowEditModal(false);
        setEditingDirector(null);
        fetchDirectors();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(JSON.stringify(data) || 'Error updating director');
      }
    } catch (err) {
      setError('Server connection error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading directors...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex gap-6">
              <Link to="/movies" className="text-gray-300 hover:text-white transition">
                Movies
              </Link>
              <Link to="/directors" className="text-white font-semibold">
                Directors
              </Link>
              <Link to="/actors" className="text-gray-300 hover:text-white transition">
                Actors
              </Link>
            </div>
            <div className="flex gap-4">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200"
                  >
                    + Create Director
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {!isAuthenticated && (
          <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-3 rounded mb-6">
            You need to log in to create or edit directors
          </div>
        )}

        <h1 className="text-3xl font-bold text-white mb-8">Directors</h1>

        {directors.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
            <p className="text-xl">No directors available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {directors.map((director) => (
              <div
                key={director.id}
                className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-200"
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  {director.name}
                </h3>
                {director.country && (
                  <p className="text-gray-400 mb-2">
                    <span className="text-gray-500">Country:</span> {director.country}
                  </p>
                )}
                <p className="text-gray-400 mb-4">
                  <span className="text-gray-500">Total movies:</span> {director.total_movies || 0}
                </p>
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      setEditingDirector(director);
                      setShowEditModal(true);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200"
                  >
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Director Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">Create Director</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={newDirector.name}
                  onChange={(e) => setNewDirector({ ...newDirector, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Ex: Christopher Nolan"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  value={newDirector.country}
                  onChange={(e) => setNewDirector({ ...newDirector, country: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Ex: USA"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-200"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewDirector({ name: '', country: '' });
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Director Modal */}
      {showEditModal && editingDirector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Director</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="edit-name"
                  value={editingDirector.name}
                  onChange={(e) => setEditingDirector({ ...editingDirector, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="edit-country" className="block text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  id="edit-country"
                  value={editingDirector.country}
                  onChange={(e) => setEditingDirector({ ...editingDirector, country: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-200"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDirector(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Directors;

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

function Actors() {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingActor, setEditingActor] = useState(null);
  const [newActor, setNewActor] = useState({ name: '', country: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    fetchActors();
  }, []);

  const fetchActors = async () => {
    try {
      const response = await api.get('/actors/', { skipAuth: true });
      if (response.ok) {
        const data = await response.json();
        setActors(data);
      } else {
        setError('Error loading actors');
      }
    } catch (err) {
      setError(err.message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setError('You must log in to create actors');
      return;
    }

    try {
      const response = await api.post('/actors/', newActor);

      if (response.ok) {
        setSuccess('Actor created successfully');
        setShowCreateModal(false);
        setNewActor({ name: '', country: '' });
        fetchActors();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(JSON.stringify(data) || 'Error creating actor');
      }
    } catch (err) {
      setError(err.message || 'Server connection error');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setError('You must log in to edit actors');
      return;
    }

    try {
      const response = await api.patch(`/actors/${editingActor.id}/`, editingActor);

      if (response.ok) {
        setSuccess('Actor updated successfully');
        setShowEditModal(false);
        setEditingActor(null);
        fetchActors();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(JSON.stringify(data) || 'Error updating actor');
      }
    } catch (err) {
      setError(err.message || 'Server connection error');
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
        <div className="text-white text-xl">Loading actors...</div>
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
              <Link to="/directors" className="text-gray-300 hover:text-white transition">
                Directors
              </Link>
              <Link to="/actors" className="text-white font-semibold">
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
                    + Create Actor
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
            You need to log in to create or edit actors
          </div>
        )}

        <h1 className="text-3xl font-bold text-white mb-8">Actors</h1>

        {actors.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
            <p className="text-xl">No actors available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {actors.map((actor) => (
              <div
                key={actor.id}
                className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-200"
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  {actor.name}
                </h3>
                {actor.country && (
                  <p className="text-gray-400 mb-2">
                    <span className="text-gray-500">Country:</span> {actor.country}
                  </p>
                )}
                <p className="text-gray-400 mb-4">
                  <span className="text-gray-500">Total movies:</span> {actor.total_movies || 0}
                </p>
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      setEditingActor(actor);
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

      {/* Create Actor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">Create Actor</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={newActor.name}
                  onChange={(e) => setNewActor({ ...newActor, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Ex: Leonardo DiCaprio"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  value={newActor.country}
                  onChange={(e) => setNewActor({ ...newActor, country: e.target.value })}
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
                    setNewActor({ name: '', country: '' });
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

      {/* Edit Actor Modal */}
      {showEditModal && editingActor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Actor</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="edit-name"
                  value={editingActor.name}
                  onChange={(e) => setEditingActor({ ...editingActor, name: e.target.value })}
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
                  value={editingActor.country}
                  onChange={(e) => setEditingActor({ ...editingActor, country: e.target.value })}
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
                    setEditingActor(null);
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

export default Actors;

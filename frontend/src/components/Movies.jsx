import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Toast from './Toast';
import useToast from '../hooks/useToast';
import { api } from '../utils/api';

function Movies() {
  const [movies, setMovies] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toasts, showToast, removeToast } = useToast();
  const [showDirectorModal, setShowDirectorModal] = useState(false);
  const [showActorModal, setShowActorModal] = useState(false);
  const [newMovie, setNewMovie] = useState({
    title: '',
    director: '',
    actors_id: []
  });
  const [newDirector, setNewDirector] = useState({ name: '', country: '' });
  const [newActor, setNewActor] = useState({ name: '', country: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [directorSearch, setDirectorSearch] = useState('');
  const [actorSearch, setActorSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    fetchMovies();
    fetchDirectors();
    fetchActors();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await api.get('/movies/', { skipAuth: true });

      if (response.ok) {
        const data = await response.json();
        setMovies(data);
      } else {
        showToast('Error al cargar las películas', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDirectors = async () => {
    try {
      const response = await api.get('/directors/', { skipAuth: true });
      if (response.ok) {
        const data = await response.json();
        setDirectors(data);
      }
    } catch (err) {
      console.error('Error al cargar directores');
    }
  };

  const fetchActors = async () => {
    try {
      const response = await api.get('/actors/', { skipAuth: true });
      if (response.ok) {
        const data = await response.json();
        setActors(data);
      }
    } catch (err) {
      console.error('Error al cargar actores');
    }
  };

  const handleCreateDirector = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      showToast('Debes iniciar sesión para crear directores', 'error');
      return;
    }

    try {
      const response = await api.post('/directors/', newDirector);

      if (response.ok) {
        const data = await response.json();
        showToast('Director creado exitosamente', 'success');
        setShowDirectorModal(false);
        setNewDirector({ name: '', country: '' });
        fetchDirectors();
        setNewMovie({ ...newMovie, director: data.id });
        setDirectorSearch('');
      } else {
        const data = await response.json();
        showToast(JSON.stringify(data) || 'Error al crear el director', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error de conexión con el servidor', 'error');
    }
  };

  const handleCreateActor = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      showToast('Debes iniciar sesión para crear actores', 'error');
      return;
    }

    try {
      const response = await api.post('/actors/', newActor);

      if (response.ok) {
        const data = await response.json();
        showToast('Actor creado exitosamente', 'success');
        setShowActorModal(false);
        setNewActor({ name: '', country: '' });
        fetchActors();
        setNewMovie({ ...newMovie, actors_id: [...newMovie.actors_id, data.id] });
        setActorSearch('');
      } else {
        const data = await response.json();
        showToast(JSON.stringify(data) || 'Error al crear el actor', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error de conexión con el servidor', 'error');
    }
  };

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      showToast('Debes iniciar sesión para crear películas', 'error');
      return;
    }

    if (!newMovie.director) {
      showToast('Debes seleccionar un director', 'warning');
      return;
    }

    if (newMovie.actors_id.length === 0) {
      showToast('Debes seleccionar al menos un actor', 'warning');
      return;
    }

    try {
      const response = await api.post('/movies/', newMovie);

      if (response.ok) {
        showToast('Película creada exitosamente', 'success');
        setShowCreateModal(false);
        setNewMovie({ title: '', director: '', actors_id: [] });
        fetchMovies();
      } else {
        const data = await response.json();
        showToast(JSON.stringify(data) || 'Error al crear la película', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error de conexión con el servidor', 'error');
    }
  };

  const toggleActorSelection = (actorId) => {
    setNewMovie(prev => ({
      ...prev,
      actors_id: prev.actors_id.includes(actorId)
        ? prev.actors_id.filter(id => id !== actorId)
        : [...prev.actors_id, actorId]
    }));
  };

  const handleDeleteMovie = async (id) => {
    const token = localStorage.getItem('token');

    if (!token) {
      showToast('Debes iniciar sesión para eliminar películas', 'error');
      return;
    }

    if (!window.confirm('¿Estás seguro de eliminar esta película?')) {
      return;
    }

    try {
      const response = await api.delete(`/movies/${id}/`);

      if (response.ok) {
        showToast('Película eliminada exitosamente', 'success');
        fetchMovies();
      } else {
        showToast('Error al eliminar la película', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error de conexión con el servidor', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando películas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex gap-6">
              <Link to="/movies" className="text-white font-semibold">
                Movies
              </Link>
              <Link to="/directors" className="text-gray-300 hover:text-white transition">
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
                    + Crear Película
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition duration-200"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAuthenticated && (
          <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-3 rounded mb-6">
            Para crear y editar películas, directores y actores necesitas iniciar sesión
          </div>
        )}

        {movies.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
            <p className="text-xl">No hay películas disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-200"
              >
                {movie.poster_url && (
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-96 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {movie.title}
                  </h3>
                  {movie.year && (
                    <p className="text-gray-400 text-sm mb-2">
                      {movie.year}
                    </p>
                  )}
                  {movie.rating && (
                    <div className="flex items-center mb-3">
                      <span className="text-yellow-500 mr-2">★</span>
                      <span className="text-white">
                        {movie.rating.toFixed(1)}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      to={`/movies/${movie.id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center px-3 py-2 rounded text-sm transition duration-200"
                    >
                      Ver Detalle
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Movie Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md my-8">
            <h2 className="text-2xl font-bold text-white mb-6">Crear Película</h2>
            <form onSubmit={handleCreateMovie} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-gray-300 mb-2">
                  Título de la Película *
                </label>
                <input
                  type="text"
                  id="title"
                  value={newMovie.title}
                  onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Ej: Inception"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-300">Director *</label>
                  <button
                    type="button"
                    onClick={() => setShowDirectorModal(true)}
                    className="text-blue-500 hover:text-blue-400 text-sm"
                  >
                    + Nuevo Director
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Buscar director..."
                  value={directorSearch}
                  onChange={(e) => setDirectorSearch(e.target.value)}
                  className="w-full px-4 py-2 mb-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
                <select
                  value={newMovie.director}
                  onChange={(e) => setNewMovie({ ...newMovie, director: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Selecciona un director</option>
                  {directors
                    .filter((director) =>
                      director.name.toLowerCase().includes(directorSearch.toLowerCase())
                    )
                    .map((director) => (
                      <option key={director.id} value={director.id}>
                        {director.name} {director.country && `(${director.country})`}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-300">Actores * (al menos 1)</label>
                  <button
                    type="button"
                    onClick={() => setShowActorModal(true)}
                    className="text-blue-500 hover:text-blue-400 text-sm"
                  >
                    + Nuevo Actor
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Buscar actor..."
                  value={actorSearch}
                  onChange={(e) => setActorSearch(e.target.value)}
                  className="w-full px-4 py-2 mb-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
                <div className="bg-gray-700 rounded border border-gray-600 p-3 max-h-48 overflow-y-auto">
                  {actors.length === 0 ? (
                    <p className="text-gray-400 text-sm">No hay actores disponibles</p>
                  ) : (
                    actors
                      .filter((actor) =>
                        actor.name.toLowerCase().includes(actorSearch.toLowerCase())
                      )
                      .map((actor) => (
                        <label
                          key={actor.id}
                          className="flex items-center space-x-2 py-2 hover:bg-gray-600 px-2 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={newMovie.actors_id.includes(actor.id)}
                            onChange={() => toggleActorSelection(actor.id)}
                            className="w-4 h-4"
                          />
                          <span className="text-white">
                            {actor.name} {actor.country && `(${actor.country})`}
                          </span>
                        </label>
                      ))
                  )}
                </div>
                {newMovie.actors_id.length > 0 && (
                  <p className="text-gray-400 text-sm mt-1">
                    {newMovie.actors_id.length} actor(es) seleccionado(s)
                  </p>
                )}
              </div>

              <p className="text-gray-400 text-sm">
                Los demás datos (año, rating, géneros, etc.) se obtendrán automáticamente de TMDB.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-200"
                >
                  Crear Película
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewMovie({ title: '', director: '', actors_id: [] });
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Director Modal */}
      {showDirectorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">Crear Director</h2>
            <form onSubmit={handleCreateDirector} className="space-y-4">
              <div>
                <label htmlFor="director-name" className="block text-gray-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="director-name"
                  value={newDirector.name}
                  onChange={(e) => setNewDirector({ ...newDirector, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Ej: Christopher Nolan"
                />
              </div>
              <div>
                <label htmlFor="director-country" className="block text-gray-300 mb-2">
                  País
                </label>
                <input
                  type="text"
                  id="director-country"
                  value={newDirector.country}
                  onChange={(e) => setNewDirector({ ...newDirector, country: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Ej: USA"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-200"
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDirectorModal(false);
                    setNewDirector({ name: '', country: '' });
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Actor Modal */}
      {showActorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">Crear Actor</h2>
            <form onSubmit={handleCreateActor} className="space-y-4">
              <div>
                <label htmlFor="actor-name" className="block text-gray-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="actor-name"
                  value={newActor.name}
                  onChange={(e) => setNewActor({ ...newActor, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Ej: Leonardo DiCaprio"
                />
              </div>
              <div>
                <label htmlFor="actor-country" className="block text-gray-300 mb-2">
                  País
                </label>
                <input
                  type="text"
                  id="actor-country"
                  value={newActor.country}
                  onChange={(e) => setNewActor({ ...newActor, country: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Ej: USA"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-200"
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowActorModal(false);
                    setNewActor({ name: '', country: '' });
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default Movies;

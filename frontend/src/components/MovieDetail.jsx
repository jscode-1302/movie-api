import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Toast from './Toast';
import useToast from '../hooks/useToast';

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toasts, showToast, removeToast } = useToast();
  const [directors, setDirectors] = useState([]);
  const [actors, setActors] = useState([]);
  const [directorSearch, setDirectorSearch] = useState('');
  const [actorSearch, setActorSearch] = useState('');
  const [editForm, setEditForm] = useState({
    title: '',
    year: '',
    rating: '',
    description: '',
    director: '',
    actors_id: [],
    genres: [],
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    fetchMovieDetail();
    fetchDirectors();
    fetchActors();
  }, [id]);

  const fetchMovieDetail = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/movies/${id}/`);

      if (response.ok) {
        const data = await response.json();
        setMovie(data);
        setEditForm({
          title: data.title,
          year: data.year,
          rating: data.rating,
          description: data.description,
          director: data.director || '',
          actors_id: data.actors || [],
          genres: data.genres || [],
        });
      } else {
        showToast('Error al cargar la película', 'error');
      }
    } catch (err) {
      showToast('Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDirectors = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/directors/');
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
      const response = await fetch('http://localhost:8000/api/actors/');
      if (response.ok) {
        const data = await response.json();
        setActors(data);
      }
    } catch (err) {
      console.error('Error al cargar actores');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      showToast('Debes iniciar sesión para editar películas', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/movies/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        showToast('Película actualizada exitosamente', 'success');
        setIsEditing(false);
        fetchMovieDetail();
      } else {
        const data = await response.json();
        showToast(JSON.stringify(data) || 'Error al actualizar la película', 'error');
      }
    } catch (err) {
      showToast('Error de conexión con el servidor', 'error');
    }
  };

  const toggleActorSelection = (actorId) => {
    setEditForm(prev => ({
      ...prev,
      actors_id: prev.actors_id.includes(actorId)
        ? prev.actors_id.filter(id => id !== actorId)
        : [...prev.actors_id, actorId]
    }));
  };

  const handleGenreChange = (index, value) => {
    setEditForm(prev => {
      const newGenres = [...prev.genres];
      newGenres[index] = value;
      return { ...prev, genres: newGenres };
    });
  };

  const addGenre = () => {
    setEditForm(prev => ({
      ...prev,
      genres: [...prev.genres, '']
    }));
  };

  const removeGenre = (index) => {
    setEditForm(prev => ({
      ...prev,
      genres: prev.genres.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando película...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Película no encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/movies" className="text-blue-500 hover:text-blue-400">
              ← Volver a películas
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAuthenticated && (
          <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-3 rounded mb-6">
            Para editar o eliminar esta película necesitas iniciar sesión
          </div>
        )}

        {!isEditing ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <div className="md:flex">
              {movie.poster_url && (
                <div className="md:flex-shrink-0">
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="h-96 w-full md:w-64 object-cover"
                  />
                </div>
              )}
              <div className="p-8 flex-1">
                <h1 className="text-3xl font-bold text-white mb-4">{movie.title}</h1>

                <div className="space-y-3 mb-6">
                  {movie.year && (
                    <div>
                      <span className="text-gray-400">Año:</span>
                      <span className="text-white ml-2">{movie.year}</span>
                    </div>
                  )}

                  {movie.rating && (
                    <div className="flex items-center">
                      <span className="text-gray-400">Rating:</span>
                      <span className="text-yellow-500 ml-2 mr-1">★</span>
                      <span className="text-white">{movie.rating.toFixed(1)} / 10</span>
                    </div>
                  )}

                  {movie.genres && movie.genres.length > 0 && (
                    <div>
                      <span className="text-gray-400">Géneros:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {movie.genres.map((genre, index) => (
                          <span
                            key={index}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {movie.director_data && (
                    <div>
                      <span className="text-gray-400">Director:</span>
                      <span className="text-white ml-2">{movie.director_data.name}</span>
                      {movie.director_data.country && (
                        <span className="text-gray-500 ml-2">({movie.director_data.country})</span>
                      )}
                    </div>
                  )}

                  {movie.actors_data && movie.actors_data.length > 0 && (
                    <div>
                      <span className="text-gray-400">Actores:</span>
                      <div className="text-white ml-2 mt-1">
                        {movie.actors_data.map((actor, index) => (
                          <span key={actor.id}>
                            {actor.name}
                            {index < movie.actors_data.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {movie.description && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-2">Descripción</h2>
                    <p className="text-gray-300 leading-relaxed">{movie.description}</p>
                  </div>
                )}

                {isAuthenticated && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition duration-200"
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6">Editar Película</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-gray-300 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  id="title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="year" className="block text-gray-300 mb-2">
                  Año
                </label>
                <input
                  type="number"
                  id="year"
                  value={editForm.year}
                  onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="rating" className="block text-gray-300 mb-2">
                  Rating (1-10)
                </label>
                <input
                  type="number"
                  id="rating"
                  step="0.1"
                  min="1"
                  max="10"
                  value={editForm.rating}
                  onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-300">Director</label>
                </div>
                <input
                  type="text"
                  placeholder="Buscar director..."
                  value={directorSearch}
                  onChange={(e) => setDirectorSearch(e.target.value)}
                  className="w-full px-4 py-2 mb-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
                <select
                  value={editForm.director}
                  onChange={(e) => setEditForm({ ...editForm, director: e.target.value })}
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
                  <label className="block text-gray-300">Actores</label>
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
                            checked={editForm.actors_id.includes(actor.id)}
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
                {editForm.actors_id.length > 0 && (
                  <p className="text-gray-400 text-sm mt-1">
                    {editForm.actors_id.length} actor(es) seleccionado(s)
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-300">Géneros</label>
                  <button
                    type="button"
                    onClick={addGenre}
                    className="text-blue-500 hover:text-blue-400 text-sm"
                  >
                    + Agregar Género
                  </button>
                </div>
                <div className="space-y-2">
                  {editForm.genres.map((genre, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={genre}
                        onChange={(e) => handleGenreChange(index, e.target.value)}
                        placeholder="Ej: Acción"
                        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeGenre(index)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition duration-200"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {editForm.genres.length === 0 && (
                    <p className="text-gray-400 text-sm">No hay géneros agregados</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-200"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

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

export default MovieDetail;

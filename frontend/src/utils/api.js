const API_BASE_URL = 'http://localhost:8000/api';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh');

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();

  // Con ROTATE_REFRESH_TOKENS=True, Django devuelve un nuevo refresh token
  localStorage.setItem('token', data.access);
  if (data.refresh) {
    localStorage.setItem('refresh', data.refresh);
  }

  return data.access;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh');
  window.location.href = '/login';
};

export const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');

  // Agregar el token si existe
  if (token && !options.skipAuth) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  // Primera petición
  let response = await fetch(`${API_BASE_URL}${url}`, options);

  // Si es 401 y tenemos refresh token, intentar refrescar
  if (response.status === 401 && !options.skipAuth) {
    const refreshToken = localStorage.getItem('refresh');

    if (!refreshToken) {
      logout();
      throw new Error('Session expired. Please login again.');
    }

    if (isRefreshing) {
      // Si ya está refrescando, agregar a la cola
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          options.headers['Authorization'] = `Bearer ${token}`;
          return fetch(`${API_BASE_URL}${url}`, options);
        })
        .catch(err => {
          throw err;
        });
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      processQueue(null, newToken);

      // Reintentar la petición original con el nuevo token
      options.headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(`${API_BASE_URL}${url}`, options);

      isRefreshing = false;
      return response;
    } catch (error) {
      processQueue(error, null);
      isRefreshing = false;
      logout();
      throw new Error('Session expired. Please login again.');
    }
  }

  return response;
};

export const api = {
  get: (url, options = {}) => {
    return apiRequest(url, { ...options, method: 'GET' });
  },

  post: (url, data, options = {}) => {
    return apiRequest(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
    });
  },

  patch: (url, data, options = {}) => {
    return apiRequest(url, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
    });
  },

  delete: (url, options = {}) => {
    return apiRequest(url, { ...options, method: 'DELETE' });
  },
};

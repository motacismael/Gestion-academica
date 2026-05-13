const BASE_URL = 'http://localhost:3001/api';

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'API Error');
  }

  return response.json();
};

export const api = {
  login: (identificador, password) => 
    fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify({ identificador, password }) }),
    
  register: (data) =>
    fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    
  changePassword: (currentPassword, newPassword) => 
    fetchWithAuth('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
    
  getUsers: () => fetchWithAuth('/users'),
  createUser: (userData) => fetchWithAuth('/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateUser: (id, data) => fetchWithAuth(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => fetchWithAuth(`/users/${id}`, { method: 'DELETE' }),
  
  getMaterias: () => fetchWithAuth('/materias'),
  createMateria: (data) => fetchWithAuth('/materias', { method: 'POST', body: JSON.stringify(data) }),
  updateMateria: (id, data) => fetchWithAuth(`/materias/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMateria: (id) => fetchWithAuth(`/materias/${id}`, { method: 'DELETE' }),
  
  getEstudianteMateria: () => fetchWithAuth('/estudiante-materia'),
  assignMateria: (data) => fetchWithAuth('/estudiante-materia', { method: 'POST', body: JSON.stringify(data) }),
  assignGrade: (id, calificacion) => fetchWithAuth(`/estudiante-materia/${id}`, { method: 'PUT', body: JSON.stringify({ calificacion }) })
};

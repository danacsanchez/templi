import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

export const authService = {
  // Obtener tipos de usuario para el formulario de registro
  getTiposUsuario: () => axios.get(`${API_URL}/tipos-usuario`),
  
  // Obtener géneros para el formulario de registro
  getGeneros: () => axios.get(`${API_URL}/generos`),
  
  // Iniciar sesión
  login: (credentials) => axios.post(`${API_URL}/login`, credentials),
  
  // Registrar usuario
  register: (userData) => axios.post(`${API_URL}/register`, userData),
  
  // Obtener token almacenado
  getToken: () => localStorage.getItem('templi_token'),
  
  // Almacenar token
  setToken: (token) => localStorage.setItem('templi_token', token),
  
  // Eliminar token (logout)
  removeToken: () => localStorage.removeItem('templi_token'),
  
  // Verificar si hay sesión activa
  isAuthenticated: () => {
    const token = authService.getToken();
    return !!token;
  }
};
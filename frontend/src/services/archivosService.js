import axios from 'axios';

const API_URL = 'http://localhost:3000/api/archivos';

export const archivosService = {
  // ========== PARA COMBOS ==========
  getCategorias: () => axios.get(`${API_URL}/categorias`),
  getTematicas: () => axios.get(`${API_URL}/tematicas`),
  
  // ========== PARA ARCHIVOS ==========
  getArchivos: () => axios.get(API_URL),
  getArchivoById: (id) => axios.get(`${API_URL}/${id}`),
  createArchivo: (archivo) => axios.post(API_URL, archivo),
  updateArchivo: (id, archivo) => axios.put(`${API_URL}/${id}`, archivo),
  deleteArchivo: (id) => axios.delete(`${API_URL}/${id}`)
};
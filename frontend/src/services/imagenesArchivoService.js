import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const getImagenesArchivo = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/imagenes-archivo`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo imágenes de archivo:', error);
    throw error;
  }
};

export const getImagenesArchivoByFileId = async (archivoId) => {
  try {
    const response = await axios.get(`${API_URL}/api/imagenes-archivo/archivo/${archivoId}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo imágenes del archivo:', error);
    throw error;
  }
};

export const getImagenesArchivoById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/imagenes-archivo/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo imagen de archivo:', error);
    throw error;
  }
};

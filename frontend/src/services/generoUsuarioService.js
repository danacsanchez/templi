// Servicio para consumir la API de genero_usuario
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Obtener todos los géneros
export async function getGenerosUsuario() {
  const response = await fetch(`${API_URL}/api/generos`, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
  if (!response.ok) throw new Error('Error al obtener géneros');
  return response.json();
}

// Crear género
export async function addGeneroUsuario(data) {
  const response = await fetch(`${API_URL}/api/generos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al crear género');
  return response.json();
}

// Actualizar género
export async function updateGeneroUsuario(id, data) {
  const response = await fetch(`${API_URL}/api/generos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al actualizar género');
  return response.json();
}

// Eliminar género
export async function deleteGeneroUsuario(id) {
  const response = await fetch(`${API_URL}/api/generos/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  if (!response.ok) throw new Error('Error al eliminar género');
  return response.json();
}

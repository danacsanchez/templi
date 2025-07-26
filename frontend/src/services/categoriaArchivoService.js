// Servicio para consumir la API de categoria_archivo
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export async function getCategoriasArchivo() {
  const response = await fetch(`${API_URL}/api/categorias`, {
    headers: {
      'Content-Type': 'application/json',
      // Puedes agregar el token si tu backend lo requiere
      // 'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Error al obtener categorías');
  return response.json();
}

// Crear categoría
export async function addCategoriaArchivo(data) {
  const response = await fetch(`${API_URL}/api/categorias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al crear categoría');
  return response.json();
}

// Actualizar categoría
export async function updateCategoriaArchivo(id, data) {
  const response = await fetch(`${API_URL}/api/categorias/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al actualizar categoría');
  return response.json();
}

// Eliminar categoría
export async function deleteCategoriaArchivo(id) {
  const response = await fetch(`${API_URL}/api/categorias/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Error al eliminar categoría');
  return response.json();
}

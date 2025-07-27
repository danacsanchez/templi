// Servicio para consumir la API de extension_archivo
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Obtener todas las extensiones
export async function getExtensionesArchivo() {
  const response = await fetch(`${API_URL}/api/extensiones`, {
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Error al obtener extensiones');
  return response.json();
}

// Crear extensión
export async function addExtensionArchivo(data) {
  const response = await fetch(`${API_URL}/api/extensiones`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al crear extensión');
  return response.json();
}

// Actualizar extensión
export async function updateExtensionArchivo(id, data) {
  const response = await fetch(`${API_URL}/api/extensiones/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al actualizar extensión');
  return response.json();
}

// Eliminar extensión
export async function deleteExtensionArchivo(id) {
  const response = await fetch(`${API_URL}/api/extensiones/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Error al eliminar extensión');
  return response.json();
}

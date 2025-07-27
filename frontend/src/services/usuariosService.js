// Crear usuario
export async function addUsuario(data) {
  const response = await fetch(`${API_URL}/api/usuarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear usuario');
  }
  return response.json();
}
// Servicio para consumir la API de usuarios
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Obtener todos los usuarios con filtros y paginación
export async function getUsuarios(filters = {}) {
  const queryParams = new URLSearchParams();
  
  // Agregar filtros si existen
  if (filters.tipo) queryParams.append('tipo', filters.tipo);
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.page) queryParams.append('page', filters.page);
  if (filters.limit) queryParams.append('limit', filters.limit);

  const url = `${API_URL}/api/usuarios${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) throw new Error('Error al obtener usuarios');
  return response.json();
}

// Obtener usuario por ID
export async function getUsuarioById(id) {
  const response = await fetch(`${API_URL}/api/usuarios/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) throw new Error('Error al obtener usuario');
  return response.json();
}

// Obtener perfil del usuario autenticado
export async function getPerfil() {
  const response = await fetch(`${API_URL}/api/usuarios/perfil`, {
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) throw new Error('Error al obtener perfil');
  return response.json();
}

// Actualizar perfil del usuario autenticado
export async function updatePerfil(data) {
  const response = await fetch(`${API_URL}/api/usuarios/perfil`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Error al actualizar perfil');
  return response.json();
}

// Actualizar usuario (Admin)
export async function updateUsuario(id, data) {
  const response = await fetch(`${API_URL}/api/usuarios/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Error al actualizar usuario');
  return response.json();
}

// Cambiar rol de usuario (SuperAdmin)
export async function cambiarRolUsuario(id, data) {
  const response = await fetch(`${API_URL}/api/usuarios/${id}/rol`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Error al cambiar rol');
  return response.json();
}

// Cambiar contraseña
export async function cambiarPassword(data) {
  const response = await fetch(`${API_URL}/api/usuarios/cambiar-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Error al cambiar contraseña');
  return response.json();
}

// Eliminar usuario
export async function deleteUsuario(id) {
  const response = await fetch(`${API_URL}/api/usuarios/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) throw new Error('Error al eliminar usuario');
  return response.json();
}

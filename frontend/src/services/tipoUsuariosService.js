// Servicio para consumir la API de tipo_usuarios
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export async function getTiposUsuario() {
  const response = await fetch(`${API_URL}/api/tipo-usuarios`, {
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Error al obtener tipos de usuario');
  return response.json();
}

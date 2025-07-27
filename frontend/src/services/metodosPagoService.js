// Servicio para consumir la API de metodos_pago
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export async function getMetodosPago() {
  const response = await fetch(`${API_URL}/api/metodos-pago`, {
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Error al obtener métodos de pago');
  return response.json();
}

// Crear método de pago
export async function addMetodoPago(data) {
  const response = await fetch(`${API_URL}/api/metodos-pago`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al crear método de pago');
  return response.json();
}

// Actualizar método de pago
export async function updateMetodoPago(id, data) {
  const response = await fetch(`${API_URL}/api/metodos-pago/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al actualizar método de pago');
  return response.json();
}

// Eliminar método de pago
export async function deleteMetodoPago(id) {
  const response = await fetch(`${API_URL}/api/metodos-pago/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Error al eliminar método de pago');
  return response.json();
}

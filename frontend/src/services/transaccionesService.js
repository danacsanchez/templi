const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

/**
 * Crear una nueva transacción PayPal
 */
export const createTransaccionPayPal = async (transaccionData) => {
  try {
    const response = await fetch(`${API_URL}/api/transacciones/paypal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(transaccionData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creando transacción PayPal:', error);
    throw error;
  }
};

/**
 * Verificar si un usuario ya compró un archivo específico
 */
export const verificarCompraArchivo = async (userId, archivoId) => {
  try {
    const response = await fetch(`${API_URL}/api/transacciones/verificar/${userId}/${archivoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verificando compra:', error);
    throw error;
  }
};

/**
 * Obtener todas las transacciones de un usuario
 */
export const getTransaccionesUsuario = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/api/transacciones/cliente/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo transacciones del usuario:', error);
    throw error;
  }
};

/**
 * Obtener todas las transacciones para administradores
 */
export const getTransaccionesAdmin = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Agregar filtros si existen
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key].trim() !== '') {
        queryParams.append(key, filters[key].trim());
      }
    });

    const url = `${API_URL}/api/transacciones${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.transacciones || data;
  } catch (error) {
    console.error('Error obteniendo transacciones para admin:', error);
    throw error;
  }
};

/**
 * Obtener transacción por ID
 */
export const getTransaccionById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/transacciones/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo transacción por ID:', error);
    throw error;
  }
};

/**
 * Actualizar estado de transacción
 */
export const updateEstadoTransaccion = async (id, estadoData) => {
  try {
    const response = await fetch(`${API_URL}/api/transacciones/${id}/estado`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(estadoData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error actualizando estado de transacción:', error);
    throw error;
  }
};

/**
 * Obtener todos los detalles de transacciones para administradores
 */
export const getDetallesTransaccionesAdmin = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Agregar filtros si existen
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key].trim() !== '') {
        queryParams.append(key, filters[key].trim());
      }
    });

    const url = `${API_URL}/api/detalle-transacciones/admin${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.detalles || data;
  } catch (error) {
    console.error('Error obteniendo detalles de transacciones para admin:', error);
    throw error;
  }
};

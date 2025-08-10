const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const getStats = async () => {
  try {
    const response = await fetch(`${API_URL}/api/stats/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener estadísticas');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en statsService.getStats:', error);
    throw error;
  }
};

export const getVendedorStats = async (vendedorId) => {
  try {
    const response = await fetch(`${API_URL}/api/stats/vendedor/${vendedorId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener estadísticas del vendedor');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en statsService.getVendedorStats:', error);
    throw error;
  }
};
import React, { useState, useEffect } from 'react';
import { archivosService } from '../services/archivosService';

const ArchivosList = ({ refresh }) => {
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadArchivos = async () => {
    try {
      const response = await archivosService.getArchivos();
      setArchivos(response.data);
    } catch (error) {
      console.error('Error al cargar archivos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArchivos();
  }, [refresh]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este archivo?')) {
      try {
        await archivosService.deleteArchivo(id);
        loadArchivos();
        alert('Archivo eliminado exitosamente');
      } catch (error) {
        alert('Error al eliminar archivo');
      }
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div style={{ margin: '20px' }}>
      <h2>Lista de Archivos</h2>
      {archivos.length === 0 ? (
        <p>No hay archivos disponibles</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {archivos.map(archivo => (
            <div key={archivo.id_archivo} style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              borderRadius: '5px' 
            }}>
              <h3>{archivo.nombre_archivo}</h3>
              <p><strong>Descripción:</strong> {archivo.descripcion}</p>
              <p><strong>Precio:</strong> ${archivo.precio}</p>
              <p><strong>Descargas:</strong> {archivo.num_descargas}</p>
              <p><strong>Fecha:</strong> {new Date(archivo.fecha_subida).toLocaleDateString()}</p>
              <button 
                onClick={() => handleDelete(archivo.id_archivo)}
                style={{ 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 15px', 
                  borderRadius: '4px', 
                  cursor: 'pointer' 
                }}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivosList;
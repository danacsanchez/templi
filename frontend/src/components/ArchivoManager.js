import React, { useState } from 'react';
import ArchivoForm from './ArchivoForm';
import { archivosService } from '../services/archivosService';

const ArchivoManager = () => {
  const [archivoToEdit, setArchivoToEdit] = useState(null);

  const handleArchivoSaved = (archivo) => {
    console.log('Archivo guardado:', archivo);
    setArchivoToEdit(null); // Limpiar edición
  };

  const handleCancelEdit = () => {
    setArchivoToEdit(null);
  };

  // Función para probar la edición (puedes llamarla desde consola)
  const testEdit = async (id) => {
    try {
      const response = await archivosService.getArchivoById(id);
      setArchivoToEdit(response.data);
    } catch (error) {
      alert('Error al cargar archivo para editar');
    }
  };

  // Función para probar la eliminación (puedes llamarla desde consola)
  const testDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este archivo?')) {
      try {
        await archivosService.deleteArchivo(id);
        alert('Archivo eliminado correctamente');
      } catch (error) {
        alert('Error al eliminar archivo');
      }
    }
  };

  // Exponer funciones globalmente para testing
  React.useEffect(() => {
    window.testEdit = testEdit;
    window.testDelete = testDelete;
  }, []);

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa' }}>
        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        </div>
      </div>
      
      <ArchivoForm 
        onArchivoSaved={handleArchivoSaved}
        archivoToEdit={archivoToEdit}
        onCancelEdit={handleCancelEdit}
      />
    </div>
  );
};

export default ArchivoManager;
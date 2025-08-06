import React, { useState, useEffect } from 'react';
import ArchivoForm from './ArchivoForm';
import { getArchivos, deleteArchivo } from '../services/archivosService';

const ArchivoManager = () => {
  const [archivos, setArchivos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [archivoEditar, setArchivoEditar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarArchivos();
  }, []);

  const cargarArchivos = async () => {
    try {
      setLoading(true);
      const data = await getArchivos();
      setArchivos(data || []);
    } catch (error) {
      console.error('Error cargando archivos:', error);
      setArchivos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoArchivo = () => {
    setArchivoEditar(null);
    setShowForm(true);
  };

  const handleEditarArchivo = (archivo) => {
    setArchivoEditar(archivo);
    setShowForm(true);
  };

  const handleGuardarArchivo = async (resultado) => {
    if (typeof resultado === 'string') {
      // Es un mensaje de error
      console.error('Error:', resultado);
      return;
    }

    // Éxito - cerrar formulario y recargar lista
    setShowForm(false);
    setArchivoEditar(null);
    await cargarArchivos();
  };

  const handleCancelar = () => {
    setShowForm(false);
    setArchivoEditar(null);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      try {
        await deleteArchivo(id);
        await cargarArchivos();
      } catch (error) {
        console.error('Error eliminando archivo:', error);
        alert('Error al eliminar el archivo');
      }
    }
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <span className="material-symbols-outlined" style={loadingIconStyle}>refresh</span>
        Cargando archivos...
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Gestión de Archivos</h1>
        <button
          onClick={handleNuevoArchivo}
          style={addButtonStyle}
        >
          <span className="material-symbols-outlined" style={buttonIconStyle}>add</span>
          Nuevo Archivo
        </button>
      </div>

      <div style={contentStyle}>
        {archivos.length === 0 ? (
          <div style={emptyStateStyle}>
            <span className="material-symbols-outlined" style={emptyIconStyle}>folder_open</span>
            <p style={emptyTextStyle}>No hay archivos registrados</p>
            <button
              onClick={handleNuevoArchivo}
              style={emptyButtonStyle}
            >
              Crear primer archivo
            </button>
          </div>
        ) : (
          <div style={gridStyle}>
            {archivos.map(archivo => (
              <div key={archivo.id_archivo} style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <h3 style={cardTitleStyle}>{archivo.nombre_archivo}</h3>
                  <div style={cardActionsStyle}>
                    <button
                      onClick={() => handleEditarArchivo(archivo)}
                      style={editButtonStyle}
                      title="Editar"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      onClick={() => handleEliminar(archivo.id_archivo)}
                      style={deleteButtonStyle}
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
                <p style={cardDescriptionStyle}>{archivo.descripcion}</p>
                <div style={cardInfoStyle}>
                  <span style={priceStyle}>${archivo.precio}</span>
                  <span style={categoryStyle}>{archivo.categoria_nombre}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ArchivoForm
          archivo={archivoEditar}
          onSave={handleGuardarArchivo}
          onCancel={handleCancelar}
        />
      )}
    </div>
  );
};

// Estilos
const containerStyle = {
  padding: '20px',
  maxWidth: '1200px',
  margin: '0 auto'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '1px solid #e5e5e7'
};

const titleStyle = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1d1d1f',
  margin: 0,
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const addButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: '#007aff',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '10px 16px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background 0.15s ease',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const buttonIconStyle = {
  fontSize: '18px'
};

const contentStyle = {
  minHeight: '400px'
};

const loadingStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  padding: '40px',
  fontSize: '14px',
  color: '#86868b',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const loadingIconStyle = {
  fontSize: '20px',
  animation: 'spin 1s linear infinite'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '60px 20px',
  color: '#86868b'
};

const emptyIconStyle = {
  fontSize: '48px',
  marginBottom: '16px',
  color: '#d1d1d1'
};

const emptyTextStyle = {
  fontSize: '16px',
  marginBottom: '20px',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const emptyButtonStyle = {
  background: '#007aff',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '20px'
};

const cardStyle = {
  background: '#fff',
  border: '1px solid #e5e5e7',
  borderRadius: '8px',
  padding: '16px',
  transition: 'box-shadow 0.15s ease'
};

const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '12px'
};

const cardTitleStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1d1d1f',
  margin: 0,
  flex: 1,
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const cardActionsStyle = {
  display: 'flex',
  gap: '8px'
};

const editButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#007aff',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '4px',
  fontSize: '16px'
};

const deleteButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#ff3b30',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '4px',
  fontSize: '16px'
};

const cardDescriptionStyle = {
  fontSize: '14px',
  color: '#86868b',
  marginBottom: '12px',
  lineHeight: '1.4',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const cardInfoStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const priceStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#007aff',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const categoryStyle = {
  fontSize: '12px',
  color: '#86868b',
  background: '#f5f5f7',
  padding: '4px 8px',
  borderRadius: '4px',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

export default ArchivoManager;

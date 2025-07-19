import React, { useState, useEffect } from 'react';
import { archivosService } from '../services/archivosService';

const ArchivoForm = ({ onArchivoSaved, archivoToEdit = null, onCancelEdit }) => {
  const [archivo, setArchivo] = useState({
    id_categoria_archivo: '',
    id_tematica_archivo: '',
    nombre_archivo: '',
    descripcion: '',
    ruta_archivo: '',
    precio: ''
  });

  const [categorias, setCategorias] = useState([]);
  const [tematicas, setTematicas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Cargar categorías y temáticas al montar el componente
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categoriasRes, tematicasRes] = await Promise.all([
          archivosService.getCategorias(),
          archivosService.getTematicas()
        ]);
        
        setCategorias(categoriasRes.data);
        setTematicas(tematicasRes.data);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        alert('Error al cargar categorías y temáticas');
      } finally {
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, []);

  // Cargar datos del archivo a editar
  useEffect(() => {
    if (archivoToEdit) {
      setArchivo({
        id_categoria_archivo: archivoToEdit.id_categoria_archivo,
        id_tematica_archivo: archivoToEdit.id_tematica_archivo,
        nombre_archivo: archivoToEdit.nombre_archivo,
        descripcion: archivoToEdit.descripcion || '',
        ruta_archivo: archivoToEdit.ruta_archivo,
        precio: archivoToEdit.precio
      });
    } else {
      // Limpiar formulario si no hay archivo a editar
      setArchivo({
        id_categoria_archivo: '',
        id_tematica_archivo: '',
        nombre_archivo: '',
        descripcion: '',
        ruta_archivo: '',
        precio: ''
      });
    }
  }, [archivoToEdit]);

  const handleChange = (e) => {
    setArchivo({
      ...archivo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const archivoData = {
        ...archivo,
        id_categoria_archivo: parseInt(archivo.id_categoria_archivo),
        id_tematica_archivo: parseInt(archivo.id_tematica_archivo),
        precio: parseFloat(archivo.precio)
      };

      let response;
      if (archivoToEdit) {
        // Editar archivo existente
        response = await archivosService.updateArchivo(archivoToEdit.id_archivo, archivoData);
        alert('¡Archivo actualizado exitosamente!');
      } else {
        // Crear nuevo archivo
        response = await archivosService.createArchivo(archivoData);
        alert('¡Archivo creado exitosamente!');
      }
      
      // Limpiar formulario solo si es creación
      if (!archivoToEdit) {
        setArchivo({
          id_categoria_archivo: '',
          id_tematica_archivo: '',
          nombre_archivo: '',
          descripcion: '',
          ruta_archivo: '',
          precio: ''
        });
      }
      
      if (onArchivoSaved) onArchivoSaved(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error desconocido';
      alert(`Error al ${archivoToEdit ? 'actualizar' : 'crear'} archivo: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancelEdit) onCancelEdit();
  };

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '30px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#ffffff',
      borderRadius: '15px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#2c3e50',
      textAlign: 'center',
      marginBottom: '10px',
      fontFamily: 'Arial, sans-serif'
    },
    subtitle: {
      fontSize: '14px',
      color: '#7f8c8d',
      textAlign: 'center',
      marginBottom: '30px',
      fontFamily: 'Arial, sans-serif'
    },
    editingBanner: {
      marginBottom: '25px',
      padding: '15px',
      backgroundColor: '#e3f2fd',
      border: '1px solid #2196f3',
      borderRadius: '8px',
      color: '#1565c0',
      textAlign: 'center',
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif'
    },
    formGroup: {
      marginBottom: '20px',
      width: '100%'            // ← AGREGAR ESTA LÍNEA
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#34495e',
      fontFamily: 'Arial, sans-serif'
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      fontSize: '14px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      outline: 'none',
      transition: 'all 0.3s ease',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fafafa',
      boxSizing: 'border-box', // ← AGREGAR ESTA LÍNEA
      display: 'block'         // ← AGREGAR ESTA LÍNEA
    },
    inputFocus: {
      borderColor: '#3498db',
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.1)'
    },
    select: {
      width: '100%',
      padding: '12px 15px',
      fontSize: '14px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      outline: 'none',
      transition: 'all 0.3s ease',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fafafa',
      cursor: 'pointer',
      boxSizing: 'border-box', // ← AGREGAR ESTA LÍNEA
      display: 'block'         // ← AGREGAR ESTA LÍNEA
    },
    textarea: {
      width: '100%',
      padding: '12px 15px',
      fontSize: '14px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      outline: 'none',
      transition: 'all 0.3s ease',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fafafa',
      height: '100px',
      resize: 'vertical',
      minHeight: '80px',
      boxSizing: 'border-box', // ← AGREGAR ESTA LÍNEA
      display: 'block'         // ← AGREGAR ESTA LÍNEA
    },
    buttonContainer: {
      display: 'flex',
      gap: '15px',
      marginTop: '30px'
    },
    primaryButton: {
      flex: 1,
      padding: '14px 20px',
      fontSize: '16px',
      fontWeight: 'bold',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: archivoToEdit ? '#27ae60' : '#3498db',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    },
    primaryButtonHover: {
      backgroundColor: archivoToEdit ? '#219a52' : '#2980b9',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
    },
    secondaryButton: {
      flex: 1,
      padding: '14px 20px',
      fontSize: '16px',
      fontWeight: 'bold',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#95a5a6',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    },
    loadingContainer: {
      padding: '40px 20px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#7f8c8d',
      backgroundColor: '#ffffff',
      borderRadius: '15px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
    },
    requiredMark: {
      color: '#e74c3c',
      marginLeft: '3px'
    },
    icon: {
      marginRight: '8px'
    }
  };

  if (loadingData) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>🔄 Cargando formulario...</div>
        <div style={{ fontSize: '14px', color: '#bdc3c7' }}>Obteniendo categorías y temáticas</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        {archivoToEdit ? '✏️ Editar Archivo' : '📁 Crear Nuevo Archivo'}
      </h2>
      <p style={styles.subtitle}>
        {archivoToEdit ? 'Modifica los datos del archivo seleccionado' : 'Completa todos los campos para agregar un nuevo archivo'}
      </p>
      
      {archivoToEdit && (
        <div style={styles.editingBanner}>
          <span style={styles.icon}>📝</span>
          <strong>Editando:</strong> {archivoToEdit.nombre_archivo}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Categoría<span style={styles.requiredMark}>*</span>
          </label>
          <select
            name="id_categoria_archivo"
            value={archivo.id_categoria_archivo}
            onChange={handleChange}
            required
            style={styles.select}
          >
            <option value="">--- Selecciona una categoría ---</option>
            {categorias.map(categoria => (
              <option key={categoria.id_categoria_archivo} value={categoria.id_categoria_archivo}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Temática<span style={styles.requiredMark}>*</span>
          </label>
          <select
            name="id_tematica_archivo"
            value={archivo.id_tematica_archivo}
            onChange={handleChange}
            required
            style={styles.select}
          >
            <option value="">--- Selecciona una temática ---</option>
            {tematicas.map(tematica => (
              <option key={tematica.id_tematica_archivo} value={tematica.id_tematica_archivo}>
                {tematica.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Nombre del Archivo<span style={styles.requiredMark}>*</span>
          </label>
          <input
            type="text"
            name="nombre_archivo"
            value={archivo.nombre_archivo}
            onChange={handleChange}
            required
            placeholder="Ej: Documento_importante.pdf"
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={archivo.descripcion}
            onChange={handleChange}
            placeholder="Describe brevemente el contenido del archivo..."
            style={styles.textarea}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Ruta del Archivo<span style={styles.requiredMark}>*</span>
          </label>
          <input
            type="text"
            name="ruta_archivo"
            value={archivo.ruta_archivo}
            onChange={handleChange}
            required
            placeholder="Ej: /uploads/documentos/archivo.pdf"
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Precio<span style={styles.requiredMark}>*</span>
          </label>
          <input
            type="number"
            step="0.01"
            name="precio"
            value={archivo.precio}
            onChange={handleChange}
            required
            placeholder="0.00"
            min="0"
            style={styles.input}
          />
        </div>

        <div style={styles.buttonContainer}>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.primaryButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = archivoToEdit ? '#219a52' : '#2980b9';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = archivoToEdit ? '#27ae60' : '#3498db';
                e.target.style.transform = 'translateY(0px)';
                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
              }
            }}
          >
            {loading ? (
              <>🔄 Guardando...</>
            ) : (
              <>{archivoToEdit ? 'Actualizar Archivo' : 'Crear Archivo'}</>
            )}
          </button>

          {archivoToEdit && (
            <button 
              type="button"
              onClick={handleCancel}
              style={styles.secondaryButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#7f8c8d';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#95a5a6';
                e.target.style.transform = 'translateY(0px)';
                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
              }}
            >
              ❌ Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ArchivoForm;
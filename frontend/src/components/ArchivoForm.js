import React, { useState, useEffect } from 'react';
import { getCategoriasArchivo } from '../services/categoriaArchivoService';
import { getExtensionesArchivo } from '../services/extensionArchivoService';
import { createArchivo, updateArchivo, getArchivoById } from '../services/archivosService';

const ArchivoForm = ({ archivo, vendedorId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre_archivo: '',
    descripcion: '',
    precio: '',
    id_categoria_archivo: '',
    id_extension_archivo: '',
    archivo_producto: null,
    ruta_archivo: '',
    imagenes: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [extensiones, setExtensiones] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [archivoActual, setArchivoActual] = useState(null); // Para mostrar el archivo actual
  const [loadingArchivoCompleto, setLoadingArchivoCompleto] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        const [categoriasData, extensionesData] = await Promise.all([
          getCategoriasArchivo(),
          getExtensionesArchivo()
        ]);
        setCategorias(categoriasData || []);
        setExtensiones(extensionesData || []);
        console.log('Categorías obtenidas:', categoriasData?.length || 0);
        console.log('Extensiones obtenidas:', extensionesData?.length || 0);
      } catch (error) {
        console.error('Error cargando opciones:', error);
        setCategorias([]);
        setExtensiones([]);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  useEffect(() => {
    const cargarDatosArchivo = async () => {
      if (archivo && archivo.id_archivo) {
        try {
          setLoadingArchivoCompleto(true);
          // Cargar datos completos del archivo incluyendo imágenes
          const archivoCompleto = await getArchivoById(archivo.id_archivo);
          
          setFormData({
            nombre_archivo: archivoCompleto.nombre_archivo || '',
            descripcion: archivoCompleto.descripcion || '',
            precio: archivoCompleto.precio || '',
            id_categoria_archivo: archivoCompleto.id_categoria_archivo || '',
            id_extension_archivo: archivoCompleto.id_extension_archivo || '',
            archivo_producto: null, // Se mantendrá null hasta que se seleccione uno nuevo
            ruta_archivo: archivoCompleto.ruta_archivo || '',
            imagenes: (archivoCompleto.imagenes || []).map(img => ({
              id: img.id_imagenes_archivo,
              id_imagenes_archivo: img.id_imagenes_archivo,
              url_imagen: `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/uploads/${img.url_imagen}`,
              orden: img.orden,
              es_portada: img.es_portada,
              file: null // No es un archivo nuevo
            }))
          });
          
          setArchivoActual({
            nombre: archivoCompleto.ruta_archivo || 'archivo_sin_nombre',
            ruta: archivoCompleto.ruta_archivo || ''
          });
          
        } catch (error) {
          console.error('Error cargando datos completos del archivo:', error);
          // Si falla, usar los datos básicos que se pasaron como prop
          setFormData({
            nombre_archivo: archivo.nombre_archivo || '',
            descripcion: archivo.descripcion || '',
            precio: archivo.precio || '',
            id_categoria_archivo: archivo.id_categoria_archivo || '',
            id_extension_archivo: archivo.id_extension_archivo || '',
            archivo_producto: null,
            ruta_archivo: archivo.ruta_archivo || '',
            imagenes: []
          });
          
          if (archivo.ruta_archivo) {
            setArchivoActual({
              nombre: archivo.ruta_archivo,
              ruta: archivo.ruta_archivo
            });
          }
        } finally {
          setLoadingArchivoCompleto(false);
        }
      } else {
        // Nuevo archivo - resetear formulario
        setFormData({
          nombre_archivo: '',
          descripcion: '',
          precio: '',
          id_categoria_archivo: '',
          id_extension_archivo: '',
          archivo_producto: null,
          ruta_archivo: '',
          imagenes: []
        });
        setArchivoActual(null);
      }
      setErrors({});
    };

    cargarDatosArchivo();
  }, [archivo]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validaciones obligatorias
    if (!formData.nombre_archivo.trim()) {
      newErrors.nombre_archivo = 'El nombre del producto es obligatorio';
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }
    
    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0';
    }
    
    if (!formData.id_categoria_archivo) {
      newErrors.id_categoria_archivo = 'Debe seleccionar una categoría';
    }
    
    if (!formData.id_extension_archivo) {
      newErrors.id_extension_archivo = 'Debe seleccionar una extensión';
    }
    
    if (!formData.archivo_producto && !archivoActual) {
      newErrors.archivo_producto = 'Debe subir un archivo del producto';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0] || null;
      setFormData(prev => ({
        ...prev,
        [name]: file,
        ruta_archivo: file ? file.name : ''
      }));
      
      // Si es el archivo principal y se selecciona uno nuevo, actualizar archivo actual
      if (name === 'archivo_producto' && file) {
        setArchivoActual({
          nombre: file.name,
          ruta: file.name,
          esNuevo: true
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRemoveArchivo = () => {
    setFormData(prev => ({
      ...prev,
      archivo_producto: null,
      ruta_archivo: ''
    }));
    setArchivoActual(null);
    
    // Limpiar el input file
    const fileInput = document.getElementById('archivo_producto');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file, index) => ({
      id: Date.now() + index,
      file: file,
      url_imagen: URL.createObjectURL(file),
      orden: formData.imagenes.length + index + 1,
      es_portada: formData.imagenes.length === 0 && index === 0
    }));

    setFormData(prev => ({
      ...prev,
      imagenes: [...prev.imagenes, ...newImages]
    }));
  };

  const handleImageRemove = (imageId) => {
    setFormData(prev => {
      const updatedImages = prev.imagenes.filter(img => img.id !== imageId);
      // Si eliminamos la portada, hacer que la primera imagen sea la nueva portada
      if (updatedImages.length > 0 && !updatedImages.some(img => img.es_portada)) {
        updatedImages[0].es_portada = true;
      }
      return {
        ...prev,
        imagenes: updatedImages
      };
    });
  };

  const handleSetPortada = (imageId) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.map(img => ({
        ...img,
        es_portada: img.id === imageId
      }))
    }));
  };

  const handleOrdenChange = (imageId, newOrden) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.map(img => 
        img.id === imageId ? { ...img, orden: parseInt(newOrden) } : img
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Preparar datos de manera diferente para crear vs actualizar
      const datosArchivo = {
        nombre_archivo: formData.nombre_archivo.trim(),
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio),
        id_categoria_archivo: parseInt(formData.id_categoria_archivo),
        id_extension_archivo: parseInt(formData.id_extension_archivo),
        archivo_producto: formData.archivo_producto, // Solo si se seleccionó uno nuevo
        imagenes: formData.imagenes
      };

      console.log('=== DATOS PREPARADOS PARA ENVÍO ===');
      console.log('Es edición:', !!archivo);
      console.log('Datos del archivo:', datosArchivo);
      console.log('Archivo nuevo seleccionado:', !!datosArchivo.archivo_producto);
      console.log('Total imágenes:', datosArchivo.imagenes.length);

      let resultado;
      if (archivo) {
        // Actualizar archivo existente
        resultado = await updateArchivo(archivo.id_archivo, datosArchivo);
      } else {
        // Crear nuevo archivo - verificar que tenemos vendedorId
        if (!vendedorId) {
          throw new Error('ID de vendedor requerido para crear archivo');
        }
        
        // Para crear necesito la estructura original con file
        const datosCreacion = {
          ...datosArchivo,
          imagenes: formData.imagenes.map(img => ({
            orden: img.orden,
            es_portada: img.es_portada,
            file: img.file
          }))
        };
        resultado = await createArchivo(datosCreacion, vendedorId);
      }

      console.log('Archivo guardado exitosamente:', resultado);
      // Llamar onSave sin parámetros para indicar éxito
      await onSave();
    } catch (error) {
      console.error('Error al guardar archivo:', error);
      // Llamar onSave con mensaje de error
      await onSave(error.message || 'Error al guardar el archivo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>
            {archivo ? 'Editar Archivo' : 'Añadir Archivo'}
          </h2>
          <button
            style={closeButtonStyle}
            onClick={onCancel}
            type="button"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          
          {loadingArchivoCompleto && (
            <div style={loadingContainerStyle}>
              <span className="material-symbols-outlined" style={loadingIconStyle}>refresh</span>
              Cargando datos del archivo...
            </div>
          )}

          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Información General</h3>
            <div style={sectionContentStyle}>
              <div style={flexRowStyle}>
                {/* Columna izquierda - Información del producto */}
                <div style={largeWidthStyle}>
                  <div style={fieldContainerStyle}>
                    <label style={labelStyle} htmlFor="nombre_archivo">
                      Nombre del Producto
                    </label>
                    <input
                      id="nombre_archivo"
                      name="nombre_archivo"
                      type="text"
                      value={formData.nombre_archivo}
                      onChange={handleInputChange}
                      style={{
                        ...inputStyle,
                        ...(errors.nombre_archivo ? errorInputStyle : {})
                      }}
                      placeholder="Ingresa el nombre del producto"
                      disabled={isSubmitting}
                    />
                    {errors.nombre_archivo && (
                      <span style={errorTextStyle}>{errors.nombre_archivo}</span>
                    )}
                  </div>

                  <div style={fieldContainerStyle}>
                    <label style={labelStyle} htmlFor="descripcion">
                      Descripción del Producto
                    </label>
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      style={{
                        ...inputStyle,
                        ...textareaStyle,
                        ...(errors.descripcion ? errorInputStyle : {})
                      }}
                      placeholder="Describe las características del producto"
                      disabled={isSubmitting}
                      rows={3}
                    />
                    {errors.descripcion && (
                      <span style={errorTextStyle}>{errors.descripcion}</span>
                    )}
                  </div>

                  <div style={fieldContainerStyle}>
                    <div style={flexRowStyle}>
                      <div style={thirdWidthStyle}>
                        <label style={labelStyle} htmlFor="id_categoria_archivo">
                          Categoría del Archivo
                        </label>
                        <select
                          id="id_categoria_archivo"
                          name="id_categoria_archivo"
                          value={formData.id_categoria_archivo}
                          onChange={handleInputChange}
                          style={{
                            ...inputStyle,
                            ...selectStyle,
                            ...(errors.id_categoria_archivo ? errorInputStyle : {})
                          }}
                          disabled={isSubmitting || loadingOptions}
                        >
                          <option value="">Selecciona una categoría</option>
                          {categorias.map(categoria => (
                            <option key={categoria.id_categoria_archivo} value={categoria.id_categoria_archivo}>
                              {categoria.nombre}
                            </option>
                          ))}
                        </select>
                        {errors.id_categoria_archivo && (
                          <span style={errorTextStyle}>{errors.id_categoria_archivo}</span>
                        )}
                      </div>

                      <div style={thirdWidthStyle}>
                        <label style={labelStyle} htmlFor="id_extension_archivo">
                          Extensión del Archivo
                        </label>
                        <select
                          id="id_extension_archivo"
                          name="id_extension_archivo"
                          value={formData.id_extension_archivo}
                          onChange={handleInputChange}
                          style={{
                            ...inputStyle,
                            ...selectStyle,
                            ...(errors.id_extension_archivo ? errorInputStyle : {})
                          }}
                          disabled={isSubmitting || loadingOptions}
                        >
                          <option value="">Selecciona una extensión</option>
                          {extensiones.map(extension => (
                            <option key={extension.id_extension_archivo} value={extension.id_extension_archivo}>
                              {extension.nombre}
                            </option>
                          ))}
                        </select>
                        {errors.id_extension_archivo && (
                          <span style={errorTextStyle}>{errors.id_extension_archivo}</span>
                        )}
                      </div>

                      <div style={thirdWidthStyle}>
                        <label style={labelStyle} htmlFor="precio">
                          Precio del Producto
                        </label>
                        <input
                          id="precio"
                          name="precio"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.precio}
                          onChange={handleInputChange}
                          style={{
                            ...inputStyle,
                            ...(errors.precio ? errorInputStyle : {})
                          }}
                          placeholder="0.00"
                          disabled={isSubmitting}
                        />
                        {errors.precio && (
                          <span style={errorTextStyle}>{errors.precio}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna derecha - Subir archivos */}
                <div style={smallWidthStyle}>
                  <div style={fieldContainerStyle}>
                    <label style={labelStyle} htmlFor="archivo_producto">
                      Archivo del Producto
                    </label>
                    
                    {/* Mostrar archivo actual si existe */}
                    {archivoActual && (
                      <div style={archivoActualStyle}>
                        <div style={archivoInfoStyle}>
                          <span className="material-symbols-outlined" style={archivoIconStyle}>
                            description
                          </span>
                          <div style={archivoTextoStyle}>
                            <span style={archivoNombreStyle}>{archivoActual.nombre}</span>
                            <span style={archivoSubtextoStyle}>
                              {archivoActual.esNuevo ? 'Archivo nuevo seleccionado' : 'Archivo actual'}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveArchivo}
                          style={removeArchivoButtonStyle}
                          disabled={isSubmitting}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            close
                          </span>
                        </button>
                      </div>
                    )}
                    
                    {/* Área de carga de archivo */}
                    {!archivoActual && (
                      <div style={uploadAreaStyle}>
                        <input
                          id="archivo_producto"
                          name="archivo_producto"
                          type="file"
                          onChange={handleInputChange}
                          style={fileInputStyle}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                          disabled={isSubmitting}
                        />
                        <div style={uploadContentStyle}>
                          <span className="material-symbols-outlined" style={uploadIconStyle}>
                            cloud_upload
                          </span>
                          <p style={uploadTextStyle}>
                            Arrastra tu archivo aquí o haz clic para seleccionar
                          </p>
                          <p style={uploadSubtextStyle}>
                            PDF, Word, Excel, PowerPoint, imágenes, etc.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Botón para cambiar archivo si ya existe uno */}
                    {archivoActual && (
                      <div style={cambiarArchivoContainerStyle}>
                        <input
                          id="archivo_producto"
                          name="archivo_producto"
                          type="file"
                          onChange={handleInputChange}
                          style={fileInputStyle}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          style={cambiarArchivoButtonStyle}
                          disabled={isSubmitting}
                          onClick={() => document.getElementById('archivo_producto').click()}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            swap_horiz
                          </span>
                          Cambiar archivo
                        </button>
                      </div>
                    )}
                    
                    {errors.archivo_producto && (
                      <span style={errorTextStyle}>{errors.archivo_producto}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Imágenes</h3>
            <div style={sectionContentStyle}>
              <div style={fieldContainerStyle}>
                <label style={labelStyle} htmlFor="imagenes_producto">
                  Subir Imágenes del Producto
                </label>
                <div style={imageUploadAreaStyle}>
                  <input
                    id="imagenes_producto"
                    name="imagenes_producto"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={fileInputStyle}
                    disabled={isSubmitting}
                  />
                  <div style={uploadContentStyle}>
                    <span className="material-symbols-outlined" style={uploadIconStyle}>
                      add_photo_alternate
                    </span>
                    <p style={uploadTextStyle}>
                      Arrastra tus imágenes aquí o haz clic para seleccionar
                    </p>
                    <p style={uploadSubtextStyle}>
                      JPG, PNG, GIF (máximo 10 imágenes)
                    </p>
                  </div>
                </div>
              </div>

              {formData.imagenes.length > 0 && (
                <div style={fieldContainerStyle}>
                  <label style={labelStyle}>
                    Imágenes Cargadas ({formData.imagenes.length})
                  </label>
                  <div style={imageGridStyle}>
                    {formData.imagenes.map((imagen, index) => (
                      <div key={imagen.id} style={imageItemStyle}>
                        <div style={imagePreviewStyle}>
                          <img 
                            src={imagen.url_imagen} 
                            alt={`Imagen ${index + 1}`}
                            style={imageStyle}
                          />
                          {imagen.es_portada && (
                            <div style={portadaBadgeStyle}>
                              <span className="material-symbols-outlined" style={portadaIconStyle}>
                                star
                              </span>
                              <span style={portadaTextStyle}>Portada</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleImageRemove(imagen.id)}
                            style={removeImageButtonStyle}
                            disabled={isSubmitting}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                              close
                            </span>
                          </button>
                        </div>
                        <div style={imageControlsStyle}>
                          <div style={ordenControlStyle}>
                            <label style={smallLabelStyle}>Orden:</label>
                            <input
                              type="number"
                              min="1"
                              value={imagen.orden}
                              onChange={(e) => handleOrdenChange(imagen.id, e.target.value)}
                              style={smallInputStyle}
                              disabled={isSubmitting}
                            />
                          </div>
                          {!imagen.es_portada && (
                            <button
                              type="button"
                              onClick={() => handleSetPortada(imagen.id)}
                              style={setPortadaButtonStyle}
                              disabled={isSubmitting}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                                star
                              </span>
                              Portada
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={buttonContainerStyle}>
            <button
              type="button"
              onClick={onCancel}
              style={cancelButtonStyle}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                ...saveButtonStyle,
                ...(isSubmitting ? disabledButtonStyle : {})
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined" style={loadingIconStyle}>refresh</span>
                  {archivo ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={buttonIconStyle}>
                    {archivo ? 'edit' : 'add'}
                  </span>
                  {archivo ? 'Actualizar' : 'Guardar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)'
};

const modalStyle = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
  width: '100%',
  maxWidth: '900px',
  margin: '20px',
  overflow: 'hidden',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column'
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 20px',
  borderBottom: '1px solid #e5e5e7',
  backgroundColor: '#fafafa',
  flexShrink: 0
};

const titleStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1d1d1f',
  margin: 0,
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#86868b',
  padding: '4px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.15s ease'
};

const formStyle = {
  padding: '24px',
  flex: 1,
  overflow: 'auto'
};

const fieldContainerStyle = {
  marginBottom: '16px'
};

const sectionStyle = {
  marginBottom: '32px',
  border: 'none',
  borderRadius: '0px',
  overflow: 'hidden'
};

const sectionTitleStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1d1d1f',
  margin: 0,
  padding: '12px 16px',
  backgroundColor: '#f5f5f5',
  borderBottom: 'none',
  textAlign: 'left',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const sectionContentStyle = {
  padding: '12px 24px',
  backgroundColor: '#f5f5f5'
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: '#1d1d1f',
  marginBottom: '8px',
  textAlign: 'left',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  fontSize: '11px',
  color: '#1d1d1f',
  border: '1px solid #d1d1d1',
  borderRadius: '6px',
  outline: 'none',
  transition: 'border-color 0.15s ease',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  boxSizing: 'border-box',
  backgroundColor: '#e8e8e8'
};

const selectStyle = {
  paddingRight: '30px'
};

const flexRowStyle = {
  display: 'flex',
  gap: '16px'
};

const halfWidthStyle = {
  flex: 1
};

const thirdWidthStyle = {
  flex: 1
};

const largeWidthStyle = {
  flex: '0 0 68%'
};

const smallWidthStyle = {
  flex: '0 0 32%',
  paddingLeft: '12px',
  paddingRight: '16px'
};

const textareaStyle = {
  resize: 'vertical',
  minHeight: '80px'
};

const errorInputStyle = {
  borderColor: '#ff3b30',
  boxShadow: '0 0 0 3px rgba(255, 59, 48, 0.1)'
};

const errorTextStyle = {
  display: 'block',
  fontSize: '10px',
  color: '#ff3b30',
  marginTop: '4px',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const placeholderTextStyle = {
  fontSize: '12px',
  color: '#86868b',
  textAlign: 'center',
  padding: '40px 20px',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const buttonContainerStyle = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  paddingTop: '16px',
  borderTop: '1px solid #f5f5f7',
  flexShrink: 0
};

const cancelButtonStyle = {
  background: 'none',
  border: '1px solid #e5e5e7',
  borderRadius: '6px',
  padding: '8px 16px',
  fontSize: '11px',
  color: '#1d1d1f',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: '500'
};

const saveButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: '#1d1d1f',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '8px 16px',
  fontSize: '11px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background 0.15s ease',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const disabledButtonStyle = {
  opacity: 0.6,
  cursor: 'not-allowed'
};

const buttonIconStyle = {
  fontSize: '16px'
};

const loadingIconStyle = {
  fontSize: '16px',
  animation: 'spin 1s linear infinite'
};

const uploadAreaStyle = {
  position: 'relative',
  border: '2px dashed #d1d1d1',
  borderRadius: '8px',
  backgroundColor: '#fafafa',
  minHeight: '140px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'border-color 0.15s ease, background-color 0.15s ease',
  cursor: 'pointer'
};

const fileInputStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  opacity: 0,
  cursor: 'pointer'
};

const uploadContentStyle = {
  textAlign: 'center',
  pointerEvents: 'none'
};

const uploadIconStyle = {
  fontSize: '28px',
  color: '#86868b',
  marginBottom: '6px'
};

const uploadTextStyle = {
  fontSize: '11px',
  color: '#1d1d1f',
  margin: '0 0 3px 0',
  fontWeight: '500',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const uploadSubtextStyle = {
  fontSize: '9px',
  color: '#86868b',
  margin: 0,
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const imageUploadAreaStyle = {
  position: 'relative',
  border: '2px dashed #d1d1d1',
  borderRadius: '8px',
  backgroundColor: '#fafafa',
  minHeight: '120px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'border-color 0.15s ease, background-color 0.15s ease',
  cursor: 'pointer',
  marginBottom: '16px'
};

const imageGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
  gap: '12px',
  marginTop: '8px'
};

const imageItemStyle = {
  border: '1px solid #e5e5e7',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#fff'
};

const imagePreviewStyle = {
  position: 'relative',
  width: '100%',
  height: '120px',
  overflow: 'hidden'
};

const imageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
};

const portadaBadgeStyle = {
  position: 'absolute',
  top: '6px',
  left: '6px',
  background: '#007aff',
  color: '#fff',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '9px',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const portadaIconStyle = {
  fontSize: '10px'
};

const portadaTextStyle = {
  fontSize: '9px'
};

const removeImageButtonStyle = {
  position: 'absolute',
  top: '6px',
  right: '6px',
  background: 'rgba(0, 0, 0, 0.7)',
  color: '#fff',
  border: 'none',
  borderRadius: '50%',
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background 0.15s ease'
};

const imageControlsStyle = {
  padding: '8px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#f9f9f9'
};

const ordenControlStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px'
};

const smallLabelStyle = {
  fontSize: '10px',
  fontWeight: '500',
  color: '#1d1d1f',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const smallInputStyle = {
  width: '40px',
  padding: '4px 6px',
  fontSize: '10px',
  color: '#1d1d1f',
  border: '1px solid #d1d1d1',
  borderRadius: '4px',
  outline: 'none',
  backgroundColor: '#fff',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const setPortadaButtonStyle = {
  background: 'none',
  border: '1px solid #007aff',
  color: '#007aff',
  borderRadius: '4px',
  padding: '2px 6px',
  fontSize: '9px',
  fontWeight: '500',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  transition: 'all 0.15s ease',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const loadingContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '6px',
  padding: '12px 16px',
  marginBottom: '20px',
  fontSize: '11px',
  color: '#6c757d',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

// Estilos para archivo actual
const archivoActualStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '8px'
};

const archivoInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flex: 1
};

const archivoIconStyle = {
  fontSize: '20px',
  color: '#6c757d'
};

const archivoTextoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
};

const archivoNombreStyle = {
  fontSize: '11px',
  fontWeight: '500',
  color: '#1d1d1f',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const archivoSubtextoStyle = {
  fontSize: '9px',
  color: '#6c757d',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const removeArchivoButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#dc3545',
  padding: '4px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.15s ease'
};

const cambiarArchivoContainerStyle = {
  position: 'relative'
};

const cambiarArchivoButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '10px',
  color: '#495057',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  width: '100%',
  justifyContent: 'center'
};

export default ArchivoForm;
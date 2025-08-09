const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// ================================
// FUNCIONES PARA TABLA ARCHIVOS
// ================================

/**
 * Obtener todos los archivos
 */
export const getArchivos = async () => {
  try {
    const response = await fetch(`${API_URL}/api/archivos`, {
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
    console.error('Error obteniendo archivos:', error);
    throw error;
  }
};

/**
 * Obtener archivos de un vendedor específico (para dashboard del vendedor)
 */
export const getArchivosByVendedor = async (vendedorId) => {
  try {
    const response = await fetch(`${API_URL}/api/archivos/vendedor/${vendedorId}`, {
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
    console.error('Error obteniendo archivos del vendedor:', error);
    throw error;
  }
};

/**
 * Obtener un archivo por ID (con sus imágenes)
 */
export const getArchivoById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/archivos/${id}`, {
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
    console.error('Error obteniendo archivo por ID:', error);
    throw error;
  }
};

/**
 * Crear un nuevo archivo con sus imágenes
 */
export const createArchivo = async (datosArchivo, vendedorId) => {
  try {
    const formData = new FormData();
    
    // Datos para tabla archivos (campos obligatorios)
    formData.append('nombre_archivo', datosArchivo.nombre_archivo);
    formData.append('descripcion', datosArchivo.descripcion);
    formData.append('precio', datosArchivo.precio.toString());
    formData.append('id_categoria_archivo', datosArchivo.id_categoria_archivo.toString());
    formData.append('id_extension_archivo', datosArchivo.id_extension_archivo.toString());
    
    // Usar el vendedor ID del usuario loggeado
    if (!vendedorId) {
      throw new Error('ID de vendedor requerido para crear archivo');
    }
    formData.append('id_vendedor', vendedorId.toString());
    
    // Por ahora enviar un nombre de archivo temporal
    if (datosArchivo.archivo_producto) {
      formData.append('ruta_archivo', datosArchivo.archivo_producto.name);
    } else {
      formData.append('ruta_archivo', 'archivo_temporal.pdf');
    }
    
    // Archivo principal del producto
    if (datosArchivo.archivo_producto) {
      formData.append('archivo_producto', datosArchivo.archivo_producto);
    }
    
    // Imágenes del producto
    if (datosArchivo.imagenes && datosArchivo.imagenes.length > 0) {
      datosArchivo.imagenes.forEach((imagen, index) => {
        if (imagen.file) {
          formData.append('imagenes', imagen.file);
        }
      });
      
      // Enviar metadata de imágenes como JSON
      // El id_archivo se asignará automáticamente en el backend después de crear el archivo
      formData.append('imagenes_metadata', JSON.stringify(
        datosArchivo.imagenes
          .filter(img => img.file) // Solo imágenes con archivo
          .map(img => ({
            orden: img.orden,
            es_portada: img.es_portada
            // id_archivo se asigna automáticamente en el backend
          }))
      ));
    }

    console.log('=== DEBUGGING CREAR ARCHIVO ===');
    console.log('API_URL:', API_URL);
    console.log('Endpoint completo:', `${API_URL}/api/archivos`);
    console.log('Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
    console.log('Enviando datos al backend:', {
      nombre_archivo: datosArchivo.nombre_archivo,
      descripcion: datosArchivo.descripcion,
      precio: datosArchivo.precio,
      id_categoria_archivo: datosArchivo.id_categoria_archivo,
      id_extension_archivo: datosArchivo.id_extension_archivo,
      archivo_producto: datosArchivo.archivo_producto?.name || 'No seleccionado',
      imagenes_count: datosArchivo.imagenes?.length || 0
    });

    const response = await fetch(`${API_URL}/api/archivos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    console.log('Status de respuesta:', response.status);
    console.log('Headers de respuesta:', Object.fromEntries(response.headers.entries()));
    
    // Obtener el texto de respuesta primero para debugging
    const responseText = await response.text();
    console.log('Respuesta cruda del servidor:', responseText);

    if (!response.ok) {
      console.error('Error en la respuesta:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      // Intentar parsear JSON solo si parece ser JSON
      if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.warn('No se pudo parsear el error como JSON:', e);
        }
      }
      
      throw new Error(errorMessage);
    }

    // Intentar parsear como JSON solo si parece ser JSON
    let data;
    if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parseando JSON de respuesta exitosa:', e);
        throw new Error('El servidor devolvió una respuesta inválida');
      }
    } else {
      console.error('El servidor no devolvió JSON válido:', responseText);
      throw new Error('El servidor devolvió una respuesta inválida (HTML en lugar de JSON)');
    }
    
    console.log('Respuesta del backend parseada:', data);
    return data;
  } catch (error) {
    console.error('Error creando archivo:', error);
    throw error;
  }
};

/**
 * Actualizar un archivo existente
 */
export const updateArchivo = async (id, datosArchivo) => {
  try {
    const formData = new FormData();
    
    console.log('=== DEBUGGING ACTUALIZAR ARCHIVO ===');
    console.log('ID archivo:', id);
    console.log('Datos recibidos:', datosArchivo);
    
    // Datos básicos para tabla archivos
    formData.append('nombre_archivo', datosArchivo.nombre_archivo);
    formData.append('descripcion', datosArchivo.descripcion);
    formData.append('precio', datosArchivo.precio.toString());
    formData.append('id_categoria_archivo', datosArchivo.id_categoria_archivo.toString());
    formData.append('id_extension_archivo', datosArchivo.id_extension_archivo.toString());
    
    // Archivo principal del producto (solo si se cambió)
    if (datosArchivo.archivo_producto && datosArchivo.archivo_producto instanceof File) {
      console.log('Archivo nuevo detectado:', datosArchivo.archivo_producto.name);
      formData.append('archivo_producto', datosArchivo.archivo_producto);
    }
    
    // Manejar imágenes: separar nuevas de existentes
    if (datosArchivo.imagenes && datosArchivo.imagenes.length > 0) {
      const imagenesNuevas = datosArchivo.imagenes.filter(img => img.file instanceof File);
      const imagenesExistentes = datosArchivo.imagenes.filter(img => img.id_imagenes_archivo && !img.file);
      
      console.log('Imágenes nuevas:', imagenesNuevas.length);
      console.log('Imágenes existentes:', imagenesExistentes.length);
      
      // Agregar nuevas imágenes
      imagenesNuevas.forEach((imagen, index) => {
        formData.append('imagenes_nuevas', imagen.file);
      });
      
      // Metadata para nuevas imágenes
      if (imagenesNuevas.length > 0) {
        const nuevasMetadata = imagenesNuevas.map(img => ({
          orden: img.orden,
          es_portada: img.es_portada
        }));
        formData.append('nuevas_imagenes_metadata', JSON.stringify(nuevasMetadata));
      }
      
      // Metadata para imágenes existentes
      if (imagenesExistentes.length > 0) {
        const existentesMetadata = imagenesExistentes.map(img => ({
          id_imagenes_archivo: img.id_imagenes_archivo,
          orden: img.orden,
          es_portada: img.es_portada
        }));
        formData.append('imagenes_existentes_metadata', JSON.stringify(existentesMetadata));
      }
    }

    console.log('Enviando FormData al backend...');
    
    const response = await fetch(`${API_URL}/api/archivos/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    console.log('Respuesta del servidor:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error del servidor:', errorText);
      
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      // Intentar parsear JSON del error
      if (errorText.trim().startsWith('{') || errorText.trim().startsWith('[')) {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.warn('No se pudo parsear el error como JSON:', e);
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Archivo actualizado exitosamente:', data);
    return data;
  } catch (error) {
    console.error('Error actualizando archivo:', error);
    throw error;
  }
};

/**
 * Eliminar un archivo y todas sus imágenes
 */
export const deleteArchivo = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/archivos/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    throw error;
  }
};

/**
 * Cambiar estado activo/inactivo de un archivo
 */
export const toggleArchivoActivo = async (id, activo) => {
  try {
    const response = await fetch(`${API_URL}/api/archivos/${id}/toggle-estado`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ activo })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error cambiando estado activo del archivo:', error);
    throw error;
  }
};

// ================================
// FUNCIONES PARA TABLA IMAGENES_ARCHIVO
// ================================

/**
 * Obtener imágenes de un archivo específico
 */
export const getImagenesArchivo = async (idArchivo) => {
  try {
    const response = await fetch(`${API_URL}/api/archivos/${idArchivo}/imagenes`, {
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
    console.error('Error obteniendo imágenes del archivo:', error);
    throw error;
  }
};

/**
 * Eliminar una imagen específica
 */
export const deleteImagenArchivo = async (idImagen) => {
  try {
    const response = await fetch(`${API_URL}/api/imagenes-archivo/${idImagen}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    throw error;
  }
};

/**
 * Actualizar orden de una imagen
 */
export const updateOrdenImagen = async (idImagen, nuevoOrden) => {
  try {
    const response = await fetch(`${API_URL}/api/imagenes-archivo/${idImagen}/orden`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ orden: nuevoOrden })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error actualizando orden de imagen:', error);
    throw error;
  }
};

/**
 * Establecer imagen como portada
 */
export const setImagenPortada = async (idArchivo, idImagen) => {
  try {
    const response = await fetch(`${API_URL}/api/archivos/${idArchivo}/imagen-portada`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ id_imagen_portada: idImagen })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error estableciendo imagen como portada:', error);
    throw error;
  }
};

// ================================
// FUNCIONES DE UTILIDAD
// ================================

/**
 * Obtener archivos por categoría
 */
export const getArchivosPorCategoria = async (idCategoria) => {
  try {
    const response = await fetch(`${API_URL}/api/archivos/categoria/${idCategoria}`, {
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
    console.error('Error obteniendo archivos por categoría:', error);
    throw error;
  }
};

/**
 * Obtener archivos por extensión
 */
export const getArchivosPorExtension = async (idExtension) => {
  try {
    const response = await fetch(`${API_URL}/api/archivos/extension/${idExtension}`, {
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
    console.error('Error obteniendo archivos por extensión:', error);
    throw error;
  }
};

/**
 * Búsqueda de archivos
 */
export const buscarArchivos = async (termino, filtros = {}) => {
  try {
    const params = new URLSearchParams({
      q: termino,
      ...filtros
    });

    const response = await fetch(`${API_URL}/api/archivos/buscar?${params}`, {
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
    console.error('Error buscando archivos:', error);
    throw error;
  }
};

/**
 * Descargar archivo
 */
export const descargarArchivo = async (id, nombreArchivo = 'archivo') => {
  try {
    console.log('Iniciando descarga del archivo ID:', id);
    
    const response = await fetch(`${API_URL}/api/archivos/${id}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    console.log('Respuesta del servidor:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error del servidor:', errorText);
      
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      // Intentar parsear JSON del error
      if (errorText.trim().startsWith('{') || errorText.trim().startsWith('[')) {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.warn('No se pudo parsear el error como JSON:', e);
        }
      }
      
      throw new Error(errorMessage);
    }

    console.log('Respuesta exitosa, procesando blob...');

    // Obtener el blob del archivo
    const blob = await response.blob();
    console.log('Blob creado, tamaño:', blob.size, 'bytes, tipo:', blob.type);
    
    // Obtener el nombre del archivo desde el header Content-Disposition si está disponible
    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = nombreArchivo;
    
    console.log('Todos los headers de la respuesta:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    if (contentDisposition) {
      console.log('Content-Disposition header encontrado:', contentDisposition);
      const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);
      if (fileNameMatch) {
        fileName = fileNameMatch[1];
        console.log('Nombre de archivo extraído del header:', fileName);
      } else {
        console.log('No se pudo extraer el nombre del archivo del header Content-Disposition');
      }
    } else {
      console.log('❌ No hay Content-Disposition header');
      // Si no hay header Content-Disposition, agregar extensión por defecto
      if (!fileName.includes('.')) {
        fileName = `${fileName}.pdf`; // Extensión por defecto
        console.log('Agregando extensión por defecto:', fileName);
      }
    }

    // Crear link temporal para descargar
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    console.log('Creando descarga automática para:', fileName);
    
    // Agregar al DOM temporalmente y hacer click
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('Descarga completada exitosamente');
    return { success: true, fileName };
  } catch (error) {
    console.error('Error descargando archivo:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de archivos
 */
export const getEstadisticasArchivos = async () => {
  try {
    const response = await fetch(`${API_URL}/api/archivos/estadisticas`, {
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
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
};

import React, { useEffect, useState, useRef } from 'react';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import ArchivoForm from './ArchivoForm';
import { getArchivos, deleteArchivo, toggleArchivoActivo } from '../services/archivosService';
import { getCategoriasArchivo } from '../services/categoriaArchivoService';
import { getExtensionesArchivo } from '../services/extensionArchivoService';

const ArchivosTable = () => {
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formArchivo, setFormArchivo] = useState(null);
  const menuRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [archivoToDelete, setArchivoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [categoriaFilter, setCategoriaFilter] = useState('');
  
  const [categorias, setCategorias] = useState([]);
  const [extensiones, setExtensiones] = useState([]);
  
  const [sortOrder, setSortOrder] = useState('asc');

  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Función helper para obtener nombre de categoría
  const getCategoriaNombreById = (id) => {
    const categoria = categorias.find(c => c.id_categoria_archivo === id);
    return categoria ? categoria.nombre : 'Sin categoría';
  };

  // Función helper para obtener nombre de extensión
  const getExtensionNombreById = (id) => {
    const extension = extensiones.find(e => e.id_extension_archivo === id);
    return extension ? extension.nombre : 'Sin extensión';
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [archivosResponse, categoriasData, extensionesData] = await Promise.all([
          getArchivos(),
          getCategoriasArchivo(),
          getExtensionesArchivo()
        ]);
        
        setArchivos(archivosResponse || []);
        setCategorias(categoriasData || []);
        setExtensiones(extensionesData || []);
        setLoading(false);
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!openMenu) return;
    const handleClick = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openMenu]);

  const showNotification = (message, type = 'success') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleSaveArchivo = async (errorMsg) => {
    if (errorMsg) {
      showNotification(errorMsg, 'error');
      return;
    }
    try {
      // Recargar datos y volver al listado
      const archivosResponse = await getArchivos();
      setArchivos(archivosResponse || []);
      setShowForm(false);
      setFormArchivo(null);
      showNotification(formArchivo ? 'Archivo modificado con éxito' : 'Archivo añadido con éxito');
    } catch (error) {
      console.error('Error al recargar archivos:', error);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setFormArchivo(null);
  };

  const handleDeleteArchivo = async () => {
    if (!archivoToDelete) return;
    
    setIsDeleting(true);
    try {
      // En lugar de eliminar físicamente, desactivamos el archivo
      await toggleArchivoActivo(archivoToDelete.id_archivo, false);
      showNotification('Archivo eliminado con éxito', 'success');
      const archivosResponse = await getArchivos();
      setArchivos(archivosResponse || []);
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      showNotification('Error al eliminar el archivo', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setArchivoToDelete(null);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const filteredAndSortedArchivos = archivos
    .filter(archivo => {
      // Solo mostrar archivos activos
      const isActive = archivo.activo === true;
      
      const matchesSearch = archivo.nombre_archivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           archivo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           archivo.id_archivo?.toString().includes(searchTerm);
      
      const matchesCategoria = !categoriaFilter || archivo.id_categoria_archivo?.toString() === categoriaFilter;
      
      return isActive && matchesSearch && matchesCategoria;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.id_archivo - b.id_archivo;
      } else {
        return b.id_archivo - a.id_archivo;
      }
    });

  const totalPages = Math.ceil(filteredAndSortedArchivos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArchivos = filteredAndSortedArchivos.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoriaFilter]);

  if (loading) return <div>Cargando archivos…</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;

  if (showForm) {
    return (
      <ArchivoForm
        archivo={formArchivo}
        onSave={handleSaveArchivo}
        onCancel={handleCancelForm}
      />
    );
  }

  return (
    <div style={containerStyle}>
      {notification.show && (
        <div style={{
          ...notificationStyle,
          ...(notification.type === 'error' ? errorNotificationStyle : {})
        }}>
          <span className="material-symbols-outlined" style={notificationIconStyle}>
            {notification.type === 'error' ? 'error' : 'check'}
          </span>
          {notification.message}
        </div>
      )}

      <div style={headerStyle}>
        <div style={titleStyle}>Mis Archivos</div>
        <div style={subtitleStyle}>
          {filteredAndSortedArchivos.length} archivos encontrados - Página {currentPage} de {totalPages || 1}
        </div>
      </div>

      <div style={{height:18}} />

      {/* BARRA DE BÚSQUEDA, FILTRO Y BOTÓN AÑADIR */}
      <div style={toolbarStyle}>
        {/* Barra de búsqueda */}
        <div style={searchContainerStyle}>
          <span className="material-symbols-outlined" style={searchIconStyle}>search</span>
          <input
            type="text"
            placeholder="Buscar archivos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        {/* Filtro por categoría */}
        <select
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
          style={filterSelectStyle}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(categoria => (
            <option key={categoria.id_categoria_archivo} value={categoria.id_categoria_archivo}>
              {categoria.nombre.charAt(0).toUpperCase() + categoria.nombre.slice(1)}
            </option>
          ))}
        </select>

        {/* Botón añadir */}
        <button
          style={addButtonStyle}
          onClick={() => {
            setFormArchivo(null);
            setShowForm(true);
            setOpenMenu(null);
          }}
        >
          <span className="material-symbols-outlined" style={addIconStyle}>add</span>
          Añadir archivo
        </button>
      </div>

      <div style={{height:12}} />

      {/* TABLA */}
      <div style={{overflow: 'visible', position: 'relative'}}>
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{...thStyle,width:'8%'}}>
                <div style={sortableHeaderStyle} onClick={toggleSort}>
                  ID
                  <span 
                    className="material-symbols-outlined" 
                    style={{
                      ...sortIconStyle,
                      transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  >
                    swap_vert
                  </span>
                </div>
              </th>
              <th style={{...thStyle,width:'18%'}}>Nombre</th>
              <th style={{...thStyle,width:'20%'}}>Descripción</th>
              <th style={{...thStyle,width:'12%'}}>Categoría</th>
              <th style={{...thStyle,width:'10%'}}>Extensión</th>
              <th style={{...thStyle,width:'8%'}}>Precio</th>
              <th style={{...thStyle,width:'10%'}}>Fecha</th>
              <th style={{...thStyle,width:'8%'}}>Estado</th>
              <th style={{...thStyle,textAlign:'center',width:'6%'}}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {currentArchivos.length > 0 ? (
              currentArchivos.map((archivo, i) => (
                <tr key={archivo.id_archivo}>
                  {/* Celdas normales */}
                  <td style={{...tdStyle,...(i===currentArchivos.length-1?tdLastRowStyle:{})}}>
                    {archivo.id_archivo}
                  </td>
                  <td style={{...tdStyle,...(i===currentArchivos.length-1?tdLastRowStyle:{})}}>
                    {archivo.nombre_archivo}
                  </td>
                  <td style={{...tdStyle,...(i===currentArchivos.length-1?tdLastRowStyle:{})}}>
                    <div title={archivo.descripcion}>
                      {archivo.descripcion}
                    </div>
                  </td>
                  <td style={{...tdStyle,...(i===currentArchivos.length-1?tdLastRowStyle:{})}}>
                    <span style={categoryBadgeStyle}>
                      {getCategoriaNombreById(archivo.id_categoria_archivo)}
                    </span>
                  </td>
                  <td style={{...tdStyle,...(i===currentArchivos.length-1?tdLastRowStyle:{})}}>
                    <span style={extensionBadgeStyle}>
                      {getExtensionNombreById(archivo.id_extension_archivo)}
                    </span>
                  </td>
                  <td style={{...tdStyle,...(i===currentArchivos.length-1?tdLastRowStyle:{})}}>
                    ${parseFloat(archivo.precio).toFixed(2)}
                  </td>
                  <td style={{...tdStyle,...(i===currentArchivos.length-1?tdLastRowStyle:{})}}>
                    {formatFecha(archivo.fecha_subida)}
                  </td>
                  <td style={{...tdStyle,...(i===currentArchivos.length-1?tdLastRowStyle:{})}}>
                    <span style={{
                      ...statusBadgeStyle,
                      ...(archivo.activo ? activeStatusStyle : inactiveStatusStyle)
                    }}>
                      {archivo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  
                  {/* CELDA DE ACCIONES */}
                  <td style={{
                        ...tdStyle,
                        textAlign:'center',
                        position:'relative',
                        overflow: 'visible',
                        ...(i===currentArchivos.length-1?tdLastRowStyle:{})
                      }}>
                    <button
                      style={iconButtonStyle}
                      onClick={()=>setOpenMenu(openMenu===archivo.id_archivo?null:archivo.id_archivo)}
                    >
                      <span className="material-symbols-outlined" style={{fontSize:15}}>more_horiz</span>
                    </button>

                    {openMenu===archivo.id_archivo && (
                      <div style={{
                        ...menuStyle,
                        ...(i === currentArchivos.length - 1 ? menuLastRowStyle : {})
                      }} 
                      ref={menuRef}
                      onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          style={menuItemStyle}
                          onClick={() => {
                            setFormArchivo(archivo);
                            setShowForm(true);
                            setOpenMenu(null);
                          }}
                        >
                          <span className="material-symbols-outlined" style={menuIconStyle}>edit</span>
                          Editar
                        </div>
                        <div
                          style={menuItemStyle}
                          onClick={() => {
                            setArchivoToDelete(archivo);
                            setShowDeleteModal(true);
                            setOpenMenu(null);
                          }}
                        >
                          <span className="material-symbols-outlined" style={menuIconStyle}>delete</span>
                          Eliminar
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={emptyStateStyle}>
                  <div style={emptyStateContentStyle}>
                    <span className="material-symbols-outlined" style={emptyStateIconStyle}>
                      sentiment_sad
                    </span>
                    {searchTerm || categoriaFilter ? 'No se encontraron archivos con los filtros aplicados' : 'Ups… no se encontró ningún archivo.'}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div style={paginationContainerStyle}>
          <div style={paginationStyle}>
            <button
              style={{
                ...paginationButtonStyle,
                ...(currentPage === 1 ? disabledButtonStyle : {})
              }}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <span className="material-symbols-outlined" style={{fontSize: '14px'}}>keyboard_arrow_left</span>
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  style={{
                    ...pageNumberStyle,
                    ...(currentPage === pageNum ? activePageStyle : {})
                  }}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              style={{
                ...paginationButtonStyle,
                ...(currentPage === totalPages ? disabledButtonStyle : {})
              }}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <span className="material-symbols-outlined" style={{fontSize: '14px'}}>keyboard_arrow_right</span>
            </button>
          </div>
        </div>
      )}
      
      {/* MODAL ELIMINAR */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        itemName={archivoToDelete ? `${archivoToDelete.nombre_archivo}` : ''}
        message="¿Estás seguro de que deseas eliminar el archivo"
        isLoading={isDeleting}
        onCancel={() => {
          setShowDeleteModal(false);
          setArchivoToDelete(null);
        }}
        onConfirm={handleDeleteArchivo}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

/* ───────────── estilos LIMPIOS Y ELEGANTES ───────────── */
const containerStyle = {
  width:'100%',maxWidth:1400,margin:'0 auto',padding:'0 28px'
};

const headerStyle = {textAlign:'left'};
const titleStyle = {fontSize:23,fontWeight:700,color:'#1d1d1f'};
const subtitleStyle = {fontSize:11,color:'#86868b',marginTop:2};

const toolbarStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '0px'
};

const searchContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  background: '#fff',
  border: '1px solid #e5e5e7',
  borderRadius: '6px',
  padding: '8px 12px',
  gap: '8px',
  minWidth: '300px',
  maxWidth: '400px',
  flex: 1
};

const searchIconStyle = {
  fontSize: '16px',
  color: '#86868b'
};

const searchInputStyle = {
  border: 'none',
  outline: 'none',
  fontSize: '11px',
  color: '#1d1d1f',
  background: 'transparent',
  width: '100%'
};

const filterSelectStyle = {
  padding: '8px 16px 8px 12px',
  fontSize: '11px',
  color: '#1d1d1f',
  border: '1px solid #e5e5e7',
  borderRadius: '6px',
  outline: 'none',
  background: '#fff',
  cursor: 'pointer',
  minWidth: '140px',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: 'right 8px center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '16px 16px'
};

const addButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: '#1d1d1f',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '11px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background 0.15s ease',
  whiteSpace: 'nowrap',
  flexShrink: 0
};

const addIconStyle = {
  fontSize: '16px'
};

const tableWrapperStyle = {
  background: '#fff',
  width: 'calc(100vw - 56px - 320px)',
  marginRight: 30,
  minWidth: 800,
  maxWidth: 1400,
  border: 'none'
};

const tableStyle = {
  width:'100%',
  borderCollapse:'collapse',
  background:'#fff',
  fontSize:11,
  tableLayout: 'fixed'
};

const thStyle = {
  padding:'10px 14px',
  fontWeight:600,fontSize:11,textAlign:'left',
  background:'#f5f5f7',
  borderBottom:'1px solid #e5e5e7',borderLeft:'none',borderRight:'none',borderTop:'none',
  whiteSpace:'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const sortableHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'color 0.15s ease'
};

const sortIconStyle = {
  fontSize: '14px',
  color: '#86868b',
  transition: 'transform 0.2s ease'
};

const tdStyle = {
  padding:'10px 14px',
  fontSize:11,textAlign:'left',color:'#222',background:'#fff',
  borderBottom:'1px solid #e5e5e7',borderLeft:'none',borderRight:'none',borderTop:'none',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

const tdLastRowStyle = {borderBottom:'none'};

const categoryBadgeStyle = {
  padding: '3px 8px',
  borderRadius: '12px',
  fontSize: '9px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  backgroundColor: '#e3f2fd',
  color: '#1976d2'
};

const extensionBadgeStyle = {
  padding: '3px 8px',
  borderRadius: '12px',
  fontSize: '9px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  backgroundColor: '#f3e5f5',
  color: '#7b1fa2'
};

const statusBadgeStyle = {
  padding: '3px 8px',
  borderRadius: '12px',
  fontSize: '9px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const activeStatusStyle = {
  backgroundColor: '#34c759',
  color: '#fff'
};

const inactiveStatusStyle = {
  backgroundColor: '#ff3b30',
  color: '#fff'
};

const emptyStateStyle = {
  ...tdStyle,
  textAlign: 'center',
  borderBottom: 'none',
  padding: '40px 14px',
  whiteSpace: 'normal'
};

const emptyStateContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  color: '#86868b',
  fontSize: '11px',
  fontStyle: 'normal'
};

const emptyStateIconStyle = {
  fontSize: '24px',
  color: '#86868b'
};

const iconButtonStyle = {background:'none',border:'none',cursor:'pointer',color:'#86868b',padding:0,fontSize:13,lineHeight:1};

// ✨ MENÚ LIMPIO Y ELEGANTE
const menuStyle = {
  position: 'absolute',
  top: '100%',
  right: '0',
  minWidth: 120,
  background: '#fff',
  border: '1px solid #e5e5e7',
  borderRadius: 8,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  zIndex: 1000,
  padding: '6px 0',
  marginTop: '4px'
};

// ✅ NUEVO: Menú para la última fila (se abre hacia arriba)
const menuLastRowStyle = {
  top: 'auto',
  bottom: '100%', // Se posiciona arriba del botón
  marginTop: '0',
  marginBottom: '4px' // Margen hacia arriba
};

const menuItemStyle = {
  display:'flex',
  alignItems:'center',
  gap:8,
  padding:'10px 16px',
  fontSize:11,
  color:'#1d1d1f',
  cursor:'pointer',
  transition: 'background-color 0.15s ease',
  ':hover': {
    backgroundColor: '#f5f5f7'
  }
};
const menuIconStyle = {fontSize:14,color:'#86868b'};

const paginationContainerStyle = {
  display: 'flex',
  justifyContent: 'flex-start',
  marginTop: '20px',
  width: '100%'
};

const paginationStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '0'
};

const paginationButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#1d1d1f',
  transition: 'opacity 0.15s ease',
  minWidth: '32px',
  height: '32px',
  borderRadius: '4px'
};

const disabledButtonStyle = {
  opacity: 0.3,
  cursor: 'not-allowed'
};

const pageNumberStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '6px 8px',
  fontSize: '11px',
  color: '#1d1d1f',
  transition: 'background 0.15s ease',
  minWidth: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px'
};

const activePageStyle = {
  background: '#f5f5f7',
  color: '#1d1d1f'
};

const notificationStyle = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  background: '#34c759',
  color: '#fff',
  padding: '12px 16px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(52, 199, 89, 0.3)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '11px',
  fontWeight: '500',
  zIndex: 1001,
  animation: 'slideInFromRight 0.3s ease-out',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const errorNotificationStyle = {
  background: '#ff3b30',
  boxShadow: '0 4px 12px rgba(255, 59, 48, 0.3)'
};

const notificationIconStyle = {
  fontSize: '16px'
};

export default ArchivosTable;

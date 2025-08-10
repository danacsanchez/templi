import React, { useState, useEffect, useRef } from 'react';
import { getArchivosAdmin, deleteArchivo, toggleArchivoActivo } from '../services/archivosService';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const ArchivosTableAdmin = () => {
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [archivoToDelete, setArchivoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para ordenamiento
  const [sortOrder, setSortOrder] = useState('desc'); // desc para mostrar más recientes primero
  const [sortBy, setSortBy] = useState('fecha'); // 'fecha' o 'id'

  // Estado para notificaciones
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  /* ───────────── hooks ───────────── */
  useEffect(() => {
    cargarArchivos();
  }, []);

  useEffect(() => {
    if (!openMenu) return;
    const handleClick = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openMenu]);

  const cargarArchivos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getArchivosAdmin();
      setArchivos(data);
    } catch (err) {
      console.error('Error cargando archivos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para mostrar notificación
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

  const handleDelete = async () => {
    if (!archivoToDelete) return;
    setIsDeleting(true);
    try {
      await deleteArchivo(archivoToDelete.id_archivo);
      showNotification('Archivo eliminado con éxito', 'success');
      await cargarArchivos(); // Recargar la lista
    } catch (err) {
      showNotification('Error al eliminar el archivo', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setArchivoToDelete(null);
    }
  };

  const handleToggleActivo = async (archivo) => {
    try {
      const nuevoEstado = !archivo.activo;
      await toggleArchivoActivo(archivo.id_archivo, nuevoEstado);
      setArchivos(prev => prev.map(a => 
        a.id_archivo === archivo.id_archivo 
          ? { ...a, activo: nuevoEstado }
          : a
      ));
      showNotification(`Archivo ${nuevoEstado ? 'activado' : 'desactivado'} con éxito`);
    } catch (err) {
      showNotification('Error al cambiar el estado del archivo', 'error');
    }
  };

  // Función para alternar el ordenamiento
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Filtrar y ordenar archivos
  const filteredAndSortedArchivos = archivos
    .filter(archivo =>
      archivo.nombre_archivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      archivo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      archivo.vendedor_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      archivo.categoria_nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'id') {
        return sortOrder === 'asc' ? a.id_archivo - b.id_archivo : b.id_archivo - a.id_archivo;
      } else {
        const dateA = new Date(a.fecha_subida);
        const dateB = new Date(b.fecha_subida);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });

  // Calcular paginación
  const totalPages = Math.ceil(filteredAndSortedArchivos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentArchivos = filteredAndSortedArchivos.slice(startIndex, startIndex + itemsPerPage);

  // Funciones de navegación
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setOpenMenu(null);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setOpenMenu(null);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    setOpenMenu(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <div>Cargando archivos…</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;

  /* ───────────── UI ───────────── */
  return (
    <div style={containerStyle}>
      {/* NOTIFICACIÓN EN LA ESQUINA */}
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
        <div style={titleStyle}>Archivos</div>
        <div style={subtitleStyle}>
          {filteredAndSortedArchivos.length} archivos encontrados - Página {currentPage} de {totalPages || 1}
        </div>
      </div>

      <div style={{height:18}} />

      {/* BARRA DE BÚSQUEDA */}
      <div style={toolbarStyle}>
        <div style={searchContainerStyle}>
          <span className="material-symbols-outlined" style={searchIconStyle}>search</span>
          <input
            type="text"
            placeholder="Buscar archivos, vendedores, categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>
      </div>

      <div style={{height:12}} />

      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{...thStyle,width:'8%',textAlign:'center'}}>
                <div style={sortableHeaderStyle} onClick={() => toggleSort('id')}>
                  ID
                  <span 
                    className="material-symbols-outlined" 
                    style={{
                      ...sortIconStyle,
                      transform: sortBy === 'id' && sortOrder === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
                      opacity: sortBy === 'id' ? 1 : 0.5
                    }}
                  >
                    swap_vert
                  </span>
                </div>
              </th>
              <th style={{...thStyle,width:'22%'}}>Archivo</th>
              <th style={{...thStyle,width:'13%'}}>Vendedor</th>
              <th style={{...thStyle,width:'10%'}}>Categoría</th>
              <th style={{...thStyle,width:'9%'}}>Precio</th>
              <th style={{...thStyle,width:'8%',textAlign:'center'}}>Descargas</th>
              <th style={{...thStyle,width:'10%'}}>
                <div style={sortableHeaderStyle} onClick={() => toggleSort('fecha')}>
                  Fecha
                  <span 
                    className="material-symbols-outlined" 
                    style={{
                      ...sortIconStyle,
                      transform: sortBy === 'fecha' && sortOrder === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
                      opacity: sortBy === 'fecha' ? 1 : 0.5
                    }}
                  >
                    swap_vert
                  </span>
                </div>
              </th>
              <th style={{...thStyle,width:'8%',textAlign:'center'}}>Estado</th>
              <th style={{...thStyle,width:'10%',textAlign:'center'}}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {currentArchivos.length > 0 ? (
              currentArchivos.map((archivo, i) => (
                <tr key={archivo.id_archivo}>
                  <td style={{
                    ...tdStyle,
                    textAlign:'center',
                    ...(i===currentArchivos.length-1?tdLastRowStyle:{})
                  }}>
                    <div style={idContainerStyle}>
                      <span style={idNumberStyle}>{archivo.id_archivo}</span>
                    </div>
                  </td>
                  <td style={{...tdStyle,...(i===currentArchivos.length-1?tdLastRowStyle:{})}}>
                    <div style={fileInfoStyle}>
                      <div style={fileNameStyle}>{archivo.nombre_archivo}</div>
                      <div style={fileDescriptionStyle}>{archivo.descripcion}</div>
                      <div style={fileExtensionStyle}>{archivo.extension_nombre}</div>
                    </div>
                  </td>
                  <td style={{...tdStyle,...(i===currentArchivos.length-1?tdLastRowStyle:{})}}>
                    <div style={vendorInfoStyle}>
                      <span className="material-symbols-outlined" style={vendorIconStyle}>person</span>
                      {archivo.vendedor_nombre}
                    </div>
                  </td>
                  <td style={{...tdStyle,...(i===currentArchivos.length-1?tdLastRowStyle:{})}}>
                    <span style={categoryBadgeStyle}>{archivo.categoria_nombre}</span>
                  </td>
                  <td style={{...tdStyle,...(i===currentArchivos.length-1?tdLastRowStyle:{})}}>
                    <span style={priceStyle}>{formatPrice(archivo.precio)}</span>
                  </td>
                  <td style={{
                    ...tdStyle,
                    textAlign:'center',
                    ...(i===currentArchivos.length-1?tdLastRowStyle:{})
                  }}>
                    <div style={downloadsContainerStyle}>
                      <span className="material-symbols-outlined" style={downloadsIconStyle}>download</span>
                      <span style={downloadsNumberStyle}>{archivo.num_descargas || 0}</span>
                    </div>
                  </td>
                  <td style={{...tdStyle,...(i===currentArchivos.length-1?tdLastRowStyle:{})}}>
                    <span style={dateStyle}>{formatDate(archivo.fecha_subida)}</span>
                  </td>
                  <td style={{
                    ...tdStyle,
                    textAlign:'center',
                    ...(i===currentArchivos.length-1?tdLastRowStyle:{})
                  }}>
                    <button
                      onClick={() => handleToggleActivo(archivo)}
                      style={{
                        ...statusButtonStyle,
                        backgroundColor: archivo.activo ? '#e7f5e7' : '#fee',
                        color: archivo.activo ? '#2e7d2e' : '#d32f2f'
                      }}
                    >
                      {archivo.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td style={{
                    ...tdStyle,
                    textAlign:'center',
                    position:'relative',
                    overflow: 'visible',
                    ...(i===currentArchivos.length-1?tdLastRowStyle:{})
                  }}>
                    <button
                      style={iconButtonStyle}
                      onClick={() => setOpenMenu(openMenu === archivo.id_archivo ? null : archivo.id_archivo)}
                    >
                      <span className="material-symbols-outlined" style={{fontSize:15}}>more_horiz</span>
                    </button>

                    {openMenu === archivo.id_archivo && (
                      <div style={{
                        ...menuStyle,
                        ...(i === currentArchivos.length - 1 ? menuLastRowStyle : {})
                      }} ref={menuRef}>
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
                      deployed_code
                    </span>
                    No hay archivos disponibles
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div style={paginationContainerStyle}>
          <div style={paginationStyle}>
            {/* Botón anterior */}
            <button
              style={{
                ...paginationButtonStyle,
                ...(currentPage === 1 ? disabledButtonStyle : {})
              }}
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              <span className="material-symbols-outlined" style={{fontSize: '14px'}}>keyboard_arrow_left</span>
            </button>

            {/* Números de página */}
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  style={{
                    ...pageNumberStyle,
                    ...(currentPage === pageNum ? activePageStyle : {})
                  }}
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Botón siguiente */}
            <button
              style={{
                ...paginationButtonStyle,
                ...(currentPage === totalPages ? disabledButtonStyle : {})
              }}
              onClick={goToNextPage}
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
        itemName={archivoToDelete?.nombre_archivo || ''}
        isLoading={isDeleting}
        onCancel={() => {
          setShowDeleteModal(false);
          setArchivoToDelete(null);
        }}
        onConfirm={handleDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

/* ───────────── estilos ───────────── */
const containerStyle = {
  width:'100%',maxWidth:1400,margin:'0 auto',padding:'0 28px'
};

const headerStyle = {textAlign:'left'};
const titleStyle  = {fontSize:23,fontWeight:700,color:'#1d1d1f'};
const subtitleStyle={fontSize:11,color:'#86868b',marginTop:2};

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

const tableWrapperStyle = {
  overflowX: 'auto',
  overflowY: 'visible',
  background: '#fff',
  width: 'calc(100vw - 56px - 320px)',
  marginRight: 30,
  minWidth: 320,
  maxWidth: 1400,
  border: 'none'
};

const tableStyle = {width:'100%',borderCollapse:'collapse',background:'#fff',fontSize:11};

const thStyle = {
  padding:'10px 14px',
  fontWeight:600,fontSize:11,textAlign:'left',
  background:'#f5f5f7',
  borderBottom:'1px solid #e5e5e7',borderLeft:'none',borderRight:'none',borderTop:'none',
  whiteSpace:'nowrap'
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
  borderBottom:'1px solid #e5e5e7',borderLeft:'none',borderRight:'none',borderTop:'none'
};

const tdLastRowStyle = {borderBottom:'none'};

const emptyStateStyle = {
  ...tdStyle,
  textAlign: 'center',
  borderBottom: 'none',
  padding: '40px 14px'
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

const menuLastRowStyle = {
  top: 'auto',
  bottom: '100%',
  marginTop: '0',
  marginBottom: '4px'
};

const menuItemStyle = {display:'flex',alignItems:'center',gap:6,padding:'7px 16px',fontSize:11,color:'#1d1d1f',cursor:'pointer'};
const menuIconStyle = {fontSize:12,color:'#86868b'};

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
  fontSize: '14px'
};

// Estilos específicos para archivos
const idContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 0'
};

const idNumberStyle = {
  fontWeight: '600',
  color: '#1d1d1f',
  fontSize: '11px',
  fontFamily: 'monospace'
};

const fileInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
};

const fileNameStyle = {
  fontWeight: '500',
  color: '#1d1d1f',
  fontSize: '11px',
  lineHeight: '1.2'
};

const fileDescriptionStyle = {
  color: '#86868b',
  fontSize: '10px',
  lineHeight: '1.3',
  maxWidth: '200px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

const fileExtensionStyle = {
  color: '#86868b',
  fontSize: '9px',
  textTransform: 'uppercase',
  fontWeight: '500'
};

const vendorInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  color: '#1d1d1f'
};

const vendorIconStyle = {
  fontSize: '14px',
  color: '#86868b'
};

const categoryBadgeStyle = {
  display: 'inline-block',
  padding: '2px 6px',
  backgroundColor: '#f0f0f0',
  color: '#1d1d1f',
  fontSize: '10px',
  fontWeight: '500',
  borderRadius: '10px'
};

const priceStyle = {
  fontWeight: '600',
  color: '#1d1d1f',
  fontSize: '11px'
};

const dateStyle = {
  color: '#86868b',
  fontSize: '10px'
};

const statusButtonStyle = {
  border: 'none',
  padding: '2px 6px',
  borderRadius: '10px',
  fontSize: '9px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const downloadsContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  fontSize: '11px'
};

const downloadsIconStyle = {
  fontSize: '14px',
  color: '#86868b'
};

const downloadsNumberStyle = {
  fontWeight: '600',
  color: '#1d1d1f',
  fontSize: '11px'
};

export default ArchivosTableAdmin;

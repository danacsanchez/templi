import React, { useState, useEffect } from 'react';
import { getDetallesTransaccionesAdmin } from '../services/transaccionesService';

const DetalleTransaccionesTableAdmin = () => {
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para ordenamiento
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortBy, setSortBy] = useState('id');

  // Estado para notificaciones
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  /* ───────────── hooks ───────────── */
  useEffect(() => {
    cargarDetalles();
  }, []);

  const cargarDetalles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDetallesTransaccionesAdmin();
      setDetalles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setDetalles([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para mostrar notificación (comentada porque no se usa)
  // const showNotification = (message, type = 'success') => {
  //   setNotification({ show: true, message, type });
  //   setTimeout(() => {
  //     setNotification({ show: false, message: '', type: 'success' });
  //   }, 3000);
  // };

  // Función para alternar el ordenamiento
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Filtrar y ordenar detalles
  const filteredAndSortedDetalles = detalles
    .filter(detalle =>
      detalle.nombre_archivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detalle.id_transacciones?.toString().includes(searchTerm) ||
      detalle.id_detalle_transaccion?.toString().includes(searchTerm)
    )
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'id') {
        comparison = a.id_detalle_transaccion - b.id_detalle_transaccion;
      } else if (sortBy === 'transaccion_id') {
        comparison = a.id_transacciones - b.id_transacciones;
      } else if (sortBy === 'precio') {
        comparison = a.precio_unitario - b.precio_unitario;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Calcular paginación
  const totalPages = Math.ceil(filteredAndSortedDetalles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDetalles = filteredAndSortedDetalles.slice(startIndex, startIndex + itemsPerPage);

  // Funciones de navegación
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  if (loading) return <div>Cargando detalles de transacciones…</div>;
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
        <div style={titleStyle}>Detalle de Transacciones</div>
        <div style={subtitleStyle}>
          {filteredAndSortedDetalles.length} detalles encontrados - Página {currentPage} de {totalPages || 1}
        </div>
      </div>

      <div style={{height:18}} />

      {/* BARRA DE BÚSQUEDA */}
      <div style={toolbarStyle}>
        <div style={searchContainerStyle}>
          <span className="material-symbols-outlined" style={searchIconStyle}>search</span>
          <input
            type="text"
            placeholder="Buscar por ID, transacción, archivo..."
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
              <th style={{...thStyle,width:'10%',textAlign:'center'}}>
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
              <th style={{...thStyle,width:'15%',textAlign:'center'}}>
                <div style={sortableHeaderStyle} onClick={() => toggleSort('transaccion_id')}>
                  ID Transacción
                  <span 
                    className="material-symbols-outlined" 
                    style={{
                      ...sortIconStyle,
                      transform: sortBy === 'transaccion_id' && sortOrder === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
                      opacity: sortBy === 'transaccion_id' ? 1 : 0.5
                    }}
                  >
                    swap_vert
                  </span>
                </div>
              </th>
              <th style={{...thStyle,width:'55%'}}>Archivo</th>
              <th style={{...thStyle,width:'20%',textAlign:'right'}}>
                <div style={sortableHeaderStyle} onClick={() => toggleSort('precio')}>
                  Precio Unitario
                  <span 
                    className="material-symbols-outlined" 
                    style={{
                      ...sortIconStyle,
                      transform: sortBy === 'precio' && sortOrder === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
                      opacity: sortBy === 'precio' ? 1 : 0.5
                    }}
                  >
                    swap_vert
                  </span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {currentDetalles.length > 0 ? (
              currentDetalles.map((detalle, i) => (
                <tr key={detalle.id_detalle_transaccion}>
                  <td style={{
                    ...tdStyle,
                    textAlign:'center',
                    ...(i===currentDetalles.length-1?tdLastRowStyle:{})
                  }}>
                    <div style={idContainerStyle}>
                      <span style={idNumberStyle}>{detalle.id_detalle_transaccion}</span>
                    </div>
                  </td>
                  <td style={{
                    ...tdStyle,
                    textAlign:'center',
                    ...(i===currentDetalles.length-1?tdLastRowStyle:{})
                  }}>
                    <div style={idContainerStyle}>
                      <span style={idNumberStyle}>{detalle.id_transacciones}</span>
                    </div>
                  </td>
                  <td style={{...tdStyle,...(i===currentDetalles.length-1?tdLastRowStyle:{})}}>
                    <div style={fileInfoStyle}>
                      <div style={fileNameStyle}>{detalle.nombre_archivo}</div>
                      <div style={fileCategoryStyle}>
                        {detalle.categoria_nombre} • {detalle.extension_nombre}
                      </div>
                    </div>
                  </td>
                  <td style={{...tdStyle,textAlign:'right',...(i===currentDetalles.length-1?tdLastRowStyle:{})}}>
                    <span style={priceStyle}>{formatPrice(detalle.precio_unitario)}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={emptyStateStyle}>
                  <div style={emptyStateContentStyle}>
                    <span className="material-symbols-outlined" style={emptyStateIconStyle}>receipt_long</span>
                    <span>No se encontraron detalles de transacciones</span>
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
    </div>
  );
};

/* ───────────── estilos (iguales a TransaccionesTableAdmin) ───────────── */
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

// Estilos específicos para detalles de transacciones
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

const fileCategoryStyle = {
  color: '#86868b',
  fontSize: '10px',
  lineHeight: '1.3'
};

const priceStyle = {
  fontWeight: '600',
  color: '#1d1d1f',
  fontSize: '11px'
};

export default DetalleTransaccionesTableAdmin;

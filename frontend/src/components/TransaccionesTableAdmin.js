import React, { useState, useEffect } from 'react';
import { getTransaccionesAdmin } from '../services/transaccionesService';

const TransaccionesTableAdmin = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
    cargarTransacciones();
  }, []);

  const cargarTransacciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransaccionesAdmin();
      setTransacciones(data);
    } catch (err) {
      console.error('Error cargando transacciones:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para mostrar notificación (comentada porque no se usa)
  // const showNotification = (message, type = 'success') => {
  //   setNotification({
  //     show: true,
  //     message,
  //     type
  //   });
  //   
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
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Filtrar y ordenar transacciones
  const filteredAndSortedTransacciones = transacciones
    .filter(transaccion =>
      transaccion.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaccion.cliente_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaccion.estado_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaccion.metodo_pago_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaccion.referencia_pago?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'id') {
        return sortOrder === 'asc' ? a.id_transacciones - b.id_transacciones : b.id_transacciones - a.id_transacciones;
      } else {
        const dateA = new Date(a.fecha_compra);
        const dateB = new Date(b.fecha_compra);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });

  // Calcular paginación
  const totalPages = Math.ceil(filteredAndSortedTransacciones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransacciones = filteredAndSortedTransacciones.slice(startIndex, startIndex + itemsPerPage);

  // Funciones de navegación
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadgeStyle = (estado) => {
    const baseStyle = {
      display: 'inline-block',
      padding: '2px 6px',
      fontSize: '9px',
      fontWeight: '500',
      borderRadius: '10px',
      textTransform: 'uppercase'
    };

    switch (estado?.toLowerCase()) {
      case 'completada':
      case 'completado':
        return { ...baseStyle, backgroundColor: '#e7f5e7', color: '#2e7d2e' };
      case 'pendiente':
        return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' };
      case 'cancelada':
      case 'cancelado':
        return { ...baseStyle, backgroundColor: '#fee', color: '#d32f2f' };
      case 'procesando':
        return { ...baseStyle, backgroundColor: '#e3f2fd', color: '#1976d2' };
      default:
        return { ...baseStyle, backgroundColor: '#f0f0f0', color: '#1d1d1f' };
    }
  };

  if (loading) return <div>Cargando transacciones…</div>;
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
        <div style={titleStyle}>Transacciones</div>
        <div style={subtitleStyle}>
          {filteredAndSortedTransacciones.length} transacciones encontradas - Página {currentPage} de {totalPages || 1}
        </div>
      </div>

      <div style={{height:18}} />

      {/* BARRA DE BÚSQUEDA */}
      <div style={toolbarStyle}>
        <div style={searchContainerStyle}>
          <span className="material-symbols-outlined" style={searchIconStyle}>search</span>
          <input
            type="text"
            placeholder="Buscar cliente, email, estado, método de pago..."
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
              <th style={{...thStyle,width:'25%'}}>Cliente</th>
              <th style={{...thStyle,width:'12%',textAlign:'center'}}>Estado</th>
              <th style={{...thStyle,width:'18%'}}>Método de Pago</th>
              <th style={{...thStyle,width:'15%'}}>
                <div style={sortableHeaderStyle} onClick={() => toggleSort('fecha')}>
                  Fecha de Compra
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
              <th style={{...thStyle,width:'10%',textAlign:'right'}}>Total del Pago</th>
              <th style={{...thStyle,width:'12%'}}>Referencia de Pago</th>
            </tr>
          </thead>

          <tbody>
            {currentTransacciones.length > 0 ? (
              currentTransacciones.map((transaccion, i) => (
                <tr key={transaccion.id_transacciones}>
                  <td style={{
                    ...tdStyle,
                    textAlign:'center',
                    ...(i===currentTransacciones.length-1?tdLastRowStyle:{})
                  }}>
                    <div style={idContainerStyle}>
                      <span style={idNumberStyle}>{transaccion.id_transacciones}</span>
                    </div>
                  </td>
                  <td style={{...tdStyle,...(i===currentTransacciones.length-1?tdLastRowStyle:{})}}>
                    <div style={clientInfoStyle}>
                      <div style={clientNameStyle}>{transaccion.cliente_nombre}</div>
                      <div style={clientEmailStyle}>{transaccion.cliente_email}</div>
                    </div>
                  </td>
                  <td style={{
                    ...tdStyle,
                    textAlign:'center',
                    ...(i===currentTransacciones.length-1?tdLastRowStyle:{})
                  }}>
                    <span style={getEstadoBadgeStyle(transaccion.estado_nombre)}>
                      {transaccion.estado_nombre}
                    </span>
                  </td>
                  <td style={{...tdStyle,...(i===currentTransacciones.length-1?tdLastRowStyle:{})}}>
                    <div style={paymentMethodStyle}>
                      <span className="material-symbols-outlined" style={paymentIconStyle}>
                        {transaccion.metodo_pago_nombre?.toLowerCase().includes('paypal') ? 'account_balance' : 'credit_card'}
                      </span>
                      {transaccion.metodo_pago_nombre}
                    </div>
                  </td>
                  <td style={{...tdStyle,...(i===currentTransacciones.length-1?tdLastRowStyle:{})}}>
                    <span style={dateStyle}>{formatDate(transaccion.fecha_compra)}</span>
                  </td>
                  <td style={{...tdStyle,textAlign:'right',...(i===currentTransacciones.length-1?tdLastRowStyle:{})}}>
                    <span style={priceStyle}>{formatPrice(transaccion.total_pago)}</span>
                  </td>
                  <td style={{...tdStyle,...(i===currentTransacciones.length-1?tdLastRowStyle:{})}}>
                    <span style={referenceStyle}>{transaccion.referencia_pago || 'N/A'}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={emptyStateStyle}>
                  <div style={emptyStateContentStyle}>
                    <span className="material-symbols-outlined" style={emptyStateIconStyle}>
                      receipt_long
                    </span>
                    No hay transacciones disponibles
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

// Estilos comentados porque no se usan
// const iconButtonStyle = {background:'none',border:'none',cursor:'pointer',color:'#86868b',padding:0,fontSize:13,lineHeight:1};

// const menuStyle = {
//   position: 'absolute',
//   top: '100%',
//   right: '0',
//   minWidth: 120,
//   background: '#fff',
//   border: '1px solid #e5e5e7',
//   borderRadius: 8,
//   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
//   zIndex: 1000,
//   padding: '6px 0',
//   marginTop: '4px'
// };

// const menuLastRowStyle = {
//   top: 'auto',
//   bottom: '100%',
//   marginTop: '0',
//   marginBottom: '4px'
// };

// const menuItemStyle = {display:'flex',alignItems:'center',gap:6,padding:'7px 16px',fontSize:11,color:'#1d1d1f',cursor:'pointer'};
// const menuIconStyle = {fontSize:12,color:'#86868b'};

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

// Estilos específicos para transacciones
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

const clientInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
};

const clientNameStyle = {
  fontWeight: '500',
  color: '#1d1d1f',
  fontSize: '11px',
  lineHeight: '1.2'
};

const clientEmailStyle = {
  color: '#86868b',
  fontSize: '10px',
  lineHeight: '1.3'
};

const paymentMethodStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  color: '#1d1d1f'
};

const paymentIconStyle = {
  fontSize: '14px',
  color: '#86868b'
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

const referenceStyle = {
  color: '#86868b',
  fontSize: '10px',
  fontFamily: 'monospace',
  maxWidth: '120px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

export default TransaccionesTableAdmin;

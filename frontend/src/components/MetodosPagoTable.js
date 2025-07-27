import React, { useEffect, useState, useRef } from 'react';
import { getMetodosPago, addMetodoPago, updateMetodoPago, deleteMetodoPago } from '../services/metodosPagoService';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import MetodosPagoForm from './MetodosPagoForm';

const MetodosPagoTable = () => {
  const [metodosPago, setMetodosPago] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formMetodoPago, setFormMetodoPago] = useState(null); // null = añadir, objeto = editar
  const menuRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [metodoPagoToDelete, setMetodoPagoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para ordenamiento
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' o 'desc'

  // Estado para notificaciones
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' // success, error, etc
  });

  /* ───────────── hooks ───────────── */
  useEffect(() => {
    getMetodosPago()
      .then(data => { setMetodosPago(data); setLoading(false); })
      .catch(err  => { setError(err.message); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!openMenu) return;
    const handleClick = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openMenu]);

  // Función para mostrar notificación
  const showNotification = (message, type = 'success') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Función mejorada para manejar guardar/editar
  const handleSaveMetodoPago = async (metodoPagoData) => {
    try {
      if (formMetodoPago) {
        // Actualizar método de pago existente
        await updateMetodoPago(formMetodoPago.id_metodos_pago, metodoPagoData);
        showNotification('Método de pago modificado con éxito');
      } else {
        // Crear nuevo método de pago
        await addMetodoPago(metodoPagoData);
        showNotification('Método de pago añadido con éxito');
      }
      
      // Recargar datos y cerrar modal
      const updatedData = await getMetodosPago();
      setMetodosPago(updatedData);
      setShowForm(false);
      setFormMetodoPago(null);
      
    } catch (error) {
      console.error('Error al guardar método de pago:', error);
      showNotification('Error al guardar el método de pago', 'error');
    }
  };

  // Función para alternar el ordenamiento
  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1); // Reset a la primera página
  };

  // Filtrar y ordenar métodos de pago
  const filteredAndSortedMetodosPago = metodosPago
    .filter(metodo =>
      metodo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metodo.id_metodos_pago.toString().includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.id_metodos_pago - b.id_metodos_pago;
      } else {
        return b.id_metodos_pago - a.id_metodos_pago;
      }
    });

  // Cálculos de paginación con datos filtrados y ordenados
  const totalPages = Math.ceil(filteredAndSortedMetodosPago.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMetodosPago = filteredAndSortedMetodosPago.slice(startIndex, endIndex);

  // Reset página cuando se busca
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  if (loading) return <div>Cargando métodos de pago…</div>;
  if (error)  return <div style={{color:'red'}}>Error: {error}</div>;

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
        <div style={titleStyle}>Métodos de Pago</div>
        <div style={subtitleStyle}>
          {filteredAndSortedMetodosPago.length} métodos de pago encontrados - Página {currentPage} de {totalPages || 1}
        </div>
      </div>

      <div style={{height:18}} />

      {/* BARRA DE BÚSQUEDA Y BOTÓN AÑADIR - JUNTOS */}
      <div style={toolbarStyle}>
        {/* Barra de búsqueda */}
        <div style={searchContainerStyle}>
          <span className="material-symbols-outlined" style={searchIconStyle}>search</span>
          <input
            type="text"
            placeholder="Buscar métodos de pago..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        {/* Botón añadir - al lado de la búsqueda */}
        <button
          style={addButtonStyle}
          onClick={() => {
            setFormMetodoPago(null);
            setShowForm(true);
            setOpenMenu(null);
          }}
        >
          <span className="material-symbols-outlined" style={addIconStyle}>add</span>
          Añadir método de pago
        </button>
      </div>

      <div style={{height:12}} />

      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {/* COLUMNA ID CON ICONO DE ORDENAMIENTO */}
              <th style={{...thStyle,width:'10%'}}>
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
              <th style={{...thStyle,width:'70%'}}>Nombre</th>
              <th style={{...thStyle,textAlign:'center',width:'20%'}}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {currentMetodosPago.length > 0 ? (
              currentMetodosPago.map((metodo,i)=>(
                <tr key={metodo.id_metodos_pago}>
                  <td style={{...tdStyle,...(i===currentMetodosPago.length-1?tdLastRowStyle:{})}}>
                    {metodo.id_metodos_pago}
                  </td>
                  <td style={{...tdStyle,...(i===currentMetodosPago.length-1?tdLastRowStyle:{})}}>
                    {metodo.nombre}
                  </td>
                  <td style={{
                        ...tdStyle,
                        textAlign:'center',
                        position:'relative',
                        overflow: 'visible',
                        ...(i===currentMetodosPago.length-1?tdLastRowStyle:{})
                      }}>
                    <button
                      style={iconButtonStyle}
                      onClick={()=>setOpenMenu(openMenu===metodo.id_metodos_pago?null:metodo.id_metodos_pago)}
                    >
                      <span className="material-symbols-outlined" style={{fontSize:15}}>more_horiz</span>
                    </button>

                    {openMenu===metodo.id_metodos_pago && (
                      <div style={{
                        ...menuStyle,
                        // Si es el último elemento, el menú se abre hacia arriba
                        ...(i === currentMetodosPago.length - 1 ? menuLastRowStyle : {})
                      }} ref={menuRef}>
                        <div
                          style={menuItemStyle}
                          onClick={() => {
                            setFormMetodoPago(metodo);
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
                            setMetodoPagoToDelete(metodo);
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
                <td colSpan="3" style={emptyStateStyle}>
                  <div style={emptyStateContentStyle}>
                    <span className="material-symbols-outlined" style={emptyStateIconStyle}>
                      sentiment_sad
                    </span>
                    Ups… no se encontró ningún método de pago.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN - Solo si hay resultados */}
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

      {/* MODAL FORMULARIO */}
      <MetodosPagoForm
        isOpen={showForm}
        metodoPago={formMetodoPago}
        onCancel={() => {
          setShowForm(false);
          setFormMetodoPago(null);
        }}
        onSave={handleSaveMetodoPago}
      />

      {/* MODAL ELIMINAR */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        itemName={metodoPagoToDelete?.nombre || ''}
        message="¿Estás seguro de que deseas eliminar el método de pago"
        isLoading={isDeleting}
        onCancel={() => {
          setShowDeleteModal(false);
          setMetodoPagoToDelete(null);
        }}
        onConfirm={async () => {
          if (!metodoPagoToDelete) return;
          setIsDeleting(true);
          try {
            await deleteMetodoPago(metodoPagoToDelete.id_metodos_pago);
            showNotification('Método de pago eliminado con éxito', 'success');
            // Refrescar lista
            const updated = await getMetodosPago();
            setMetodosPago(updated);
          } catch (err) {
            showNotification('Error al eliminar el método de pago', 'error');
          } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setMetodoPagoToDelete(null);
          }
        }}
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

// Estilos para la barra de herramientas
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

// Estilos para el header ordenable
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

// Estilos para el estado vacío
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

// Menú normal (se abre hacia abajo)
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

// Menú para la última fila (se abre hacia arriba)
const menuLastRowStyle = {
  top: 'auto',
  bottom: '100%',
  marginTop: '0',
  marginBottom: '4px'
};

const menuItemStyle = {display:'flex',alignItems:'center',gap:6,padding:'7px 16px',fontSize:11,color:'#1d1d1f',cursor:'pointer'};
const menuIconStyle = {fontSize:12,color:'#86868b'};

// Estilos de paginación
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

// Estilos para notificaciones
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

export default MetodosPagoTable;

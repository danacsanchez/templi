import React, { useEffect, useState, useRef } from 'react';
import { getUsuarios, deleteUsuario } from '../services/usuariosService';
import { getTiposUsuario } from '../services/tipoUsuariosService';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import UsuarioForm from './UsuarioForm';

const UsuariosTable = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formUsuario, setFormUsuario] = useState(null);
  const menuRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para filtro por tipo de usuario
  const [tipoFilter, setTipoFilter] = useState('');
  
  // Estado para tipos de usuario desde API
  const [tiposUsuario, setTiposUsuario] = useState([]);
  
  // Estado para ordenamiento
  const [sortOrder, setSortOrder] = useState('asc');

  // Estado para notificaciones
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Función para obtener nombre del tipo por ID
  const getTipoNombreById = (id) => {
    const tipo = tiposUsuario.find(t => t.id_tipo_usuario.toString() === id.toString());
    return tipo ? tipo.nombre : '';
  };

  /* ───────────── hooks ───────────── */
  // Cargar usuarios y tipos de usuario
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [usuariosResponse, tiposResponse] = await Promise.all([
          getUsuarios({ limit: 1000 }),
          getTiposUsuario()
        ]);
        
        setUsuarios(usuariosResponse.usuarios || []);
        setTiposUsuario(tiposResponse || []);
        setLoading(false);
      } catch (err) {
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

  // Función para manejar guardado desde el formulario
  const handleSaveUsuario = async (errorMsg) => {
    if (errorMsg) {
      showNotification(errorMsg, 'error');
      return;
    }
    try {
      // Recargar datos y volver al listado
      const response = await getUsuarios({ limit: 1000 });
      setUsuarios(response.usuarios || []);
      setShowForm(false);
      setFormUsuario(null);
      showNotification(formUsuario ? 'Usuario modificado con éxito' : 'Usuario añadido con éxito');
    } catch (error) {
      console.error('Error al recargar usuarios:', error);
    }
  };

  // Función para cancelar y volver al listado
  const handleCancelForm = () => {
    setShowForm(false);
    setFormUsuario(null);
  };

  // Función para alternar el ordenamiento
  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  // Filtrar y ordenar usuarios
  const filteredAndSortedUsuarios = usuarios
    .filter(usuario => {
      const matchesSearch = usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           usuario.id_usuario.toString().includes(searchTerm);
      
      const matchesTipo = !tipoFilter || usuario.rol === getTipoNombreById(tipoFilter);
      
      return matchesSearch && matchesTipo;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.id_usuario - b.id_usuario;
      } else {
        return b.id_usuario - a.id_usuario;
      }
    });

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredAndSortedUsuarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsuarios = filteredAndSortedUsuarios.slice(startIndex, endIndex);

  // Reset página cuando se busca o filtra
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, tipoFilter]);

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

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) return <div>Cargando usuarios…</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;

  // Si está en modo formulario, mostrar solo el formulario
  if (showForm) {
    return (
      <UsuarioForm
        usuario={formUsuario}
        tiposUsuario={tiposUsuario}
        onSave={handleSaveUsuario}
        onCancel={handleCancelForm}
      />
    );
  }

  /* ───────────── UI TABLA ───────────── */
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
        <div style={titleStyle}>Usuarios</div>
        <div style={subtitleStyle}>
          {filteredAndSortedUsuarios.length} usuarios encontrados - Página {currentPage} de {totalPages || 1}
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
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        {/* Filtro por tipo de usuario */}
        <select
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value)}
          style={filterSelectStyle}
        >
          <option value="">Todos los roles</option>
          {tiposUsuario.map(tipo => (
            <option key={tipo.id_tipo_usuario} value={tipo.id_tipo_usuario}>
              {tipo.nombre.charAt(0).toUpperCase() + tipo.nombre.slice(1)}
            </option>
          ))}
        </select>

        {/* Botón añadir */}
        <button
          style={addButtonStyle}
          onClick={() => {
            setFormUsuario(null);
            setShowForm(true);
            setOpenMenu(null);
          }}
        >
          <span className="material-symbols-outlined" style={addIconStyle}>add</span>
          Añadir usuario
        </button>
      </div>

      <div style={{height:12}} />

      {/* TABLA */}
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
              <th style={{...thStyle,width:'20%'}}>Nombre</th>
              <th style={{...thStyle,width:'24%'}}>Email</th>
              <th style={{...thStyle,width:'12%'}}>Género</th>
              <th style={{...thStyle,width:'12%'}}>Rol</th>
              <th style={{...thStyle,width:'12%'}}>Fecha Registro</th>
              <th style={{...thStyle,textAlign:'center',width:'12%'}}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {currentUsuarios.length > 0 ? (
              currentUsuarios.map((usuario, i) => (
                <tr key={usuario.id_usuario}>
                  {/* Celdas normales */}
                  <td style={{...tdStyle,...(i===currentUsuarios.length-1?tdLastRowStyle:{})}}>
                    {usuario.id_usuario}
                  </td>
                  <td style={{...tdStyle,...(i===currentUsuarios.length-1?tdLastRowStyle:{})}}>
                    {usuario.nombre}
                  </td>
                  <td style={{...tdStyle,...(i===currentUsuarios.length-1?tdLastRowStyle:{})}}>
                    {usuario.email}
                  </td>
                  <td style={{...tdStyle,...(i===currentUsuarios.length-1?tdLastRowStyle:{})}}>
                    {usuario.genero || 'N/A'}
                  </td>
                  <td style={{...tdStyle,...(i===currentUsuarios.length-1?tdLastRowStyle:{})}}>
                    <span style={{
                      ...roleBadgeStyle,
                      ...(getRoleBadgeColor(usuario.rol))
                    }}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td style={{...tdStyle,...(i===currentUsuarios.length-1?tdLastRowStyle:{})}}>
                    {formatDate(usuario.fecha_registro)}
                  </td>
                  
                  {/* CELDA DE ACCIONES */}
                  <td style={{
                    ...tdActionsStyle,
                    ...(i===currentUsuarios.length-1?tdLastRowStyle:{})
                  }}>
                    <button
                      style={iconButtonStyle}
                      onClick={() => setOpenMenu(openMenu === usuario.id_usuario ? null : usuario.id_usuario)}
                    >
                      <span className="material-symbols-outlined" style={{fontSize:15}}>more_horiz</span>
                    </button>

                    {/* MENÚ SIMPLE Y ELEGANTE */}
                    {openMenu === usuario.id_usuario && (
                      <div 
                        style={{
                          ...menuStyle,
                          ...(i === currentUsuarios.length - 1 ? menuLastRowStyle : {})
                        }} 
                        ref={menuRef}
                      >
                        <div
                          style={menuItemStyle}
                          onClick={() => {
                            setFormUsuario(usuario);
                            setShowForm(true);
                            setOpenMenu(null);
                          }}
                        >
                          <span className="material-symbols-outlined" style={menuIconStyle}>edit</span>
                          Editar
                        </div>
                        <div
                          style={{...menuItemStyle, ...deleteMenuItemStyle}}
                          onClick={() => {
                            setUsuarioToDelete(usuario);
                            setShowDeleteModal(true);
                            setOpenMenu(null);
                          }}
                        >
                          <span className="material-symbols-outlined" style={{...menuIconStyle, color: '#ff3b30'}}>delete</span>
                          Eliminar
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={emptyStateStyle}>
                  <div style={emptyStateContentStyle}>
                    <span className="material-symbols-outlined" style={emptyStateIconStyle}>
                      sentiment_sad
                    </span>
                    Ups… no se encontró ningún usuario.
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

      {/* MODAL ELIMINAR */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        itemName={usuarioToDelete ? `${usuarioToDelete.nombre} (${usuarioToDelete.email})` : ''}
        message="¿Estás seguro de que deseas eliminar el usuario"
        isLoading={isDeleting}
        onCancel={() => {
          setShowDeleteModal(false);
          setUsuarioToDelete(null);
        }}
        onConfirm={async () => {
          if (!usuarioToDelete) return;
          setIsDeleting(true);
          try {
            await deleteUsuario(usuarioToDelete.id_usuario);
            showNotification('Usuario eliminado con éxito', 'success');
            const response = await getUsuarios({ limit: 1000 });
            setUsuarios(response.usuarios || []);
          } catch (err) {
            showNotification('Error al eliminar el usuario', 'error');
          } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setUsuarioToDelete(null);
          }
        }}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

// Función para obtener colores de badge según el rol
const getRoleBadgeColor = (rol) => {
  switch (rol?.toLowerCase()) {
    case 'cliente':
      return { backgroundColor: '#34c759', color: '#fff' }; // 🟢 Verde
    case 'vendedor':
      return { backgroundColor: '#007aff', color: '#fff' }; // 🔵 Azul
    case 'superadmin':
      return { backgroundColor: '#ff9500', color: '#fff' }; // 🟠 Amarillo/Naranja
    default:
      return { backgroundColor: '#8e8e93', color: '#fff' }; // ⚫ Gris por defecto
  }
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
  overflowX: 'auto',
  overflowY: 'visible',
  background: '#fff',
  width: 'calc(100vw - 56px - 320px)',
  marginRight: 30,
  minWidth: 800,
  maxWidth: 1400,
  border: 'none',
  position: 'relative'
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

const tdActionsStyle = {
  ...tdStyle,
  textAlign:'center',
  position:'relative',
  overflow: 'visible'
};

const tdLastRowStyle = {borderBottom:'none'};

const roleBadgeStyle = {
  padding: '3px 8px',
  borderRadius: '12px',
  fontSize: '9px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
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

const iconButtonStyle = {
  background:'none',
  border:'none',
  cursor:'pointer',
  color:'#86868b',
  padding:'4px',
  fontSize:13,
  lineHeight:1,
  borderRadius: '4px',
  transition: 'background 0.15s ease'
};

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

const menuLastRowStyle = {
  top: 'auto',
  bottom: '100%',
  marginTop: '0',
  marginBottom: '4px'
};

const menuItemStyle = {
  display:'flex',
  alignItems:'center',
  gap:6,
  padding:'8px 12px',
  fontSize:11,
  color:'#1d1d1f',
  cursor:'pointer',
  transition: 'background 0.15s ease',
  ':hover': {
    background: '#f5f5f7'
  }
};

const menuIconStyle = {fontSize:12,color:'#86868b'};

const deleteMenuItemStyle = {
  color: '#ff3b30'
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
  fontSize: '16px'
};

export default UsuariosTable;
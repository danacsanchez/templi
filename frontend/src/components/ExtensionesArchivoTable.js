import React, { useEffect, useState, useRef } from 'react';
import { getExtensionesArchivo, addExtensionArchivo, updateExtensionArchivo, deleteExtensionArchivo } from '../services/extensionArchivoService';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import ExtensionForm from './ExtensionForm';

const ExtensionesArchivoTable = () => {
  const [extensiones, setExtensiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formExtension, setFormExtension] = useState(null); // null = añadir, objeto = editar
  const menuRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [extensionToDelete, setExtensionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    getExtensionesArchivo()
      .then(data => { setExtensiones(data); setLoading(false); })
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

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSaveExtension = async (extensionData) => {
    try {
      if (formExtension) {
        await updateExtensionArchivo(formExtension.id_extension_archivo, extensionData);
        showNotification('Extensión modificada con éxito');
      } else {
        await addExtensionArchivo(extensionData);
        showNotification('Extensión añadida con éxito');
      }
      const updatedData = await getExtensionesArchivo();
      setExtensiones(updatedData);
      setShowForm(false);
      setFormExtension(null);
    } catch (error) {
      showNotification('Error al guardar la extensión', 'error');
    }
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const filteredAndSortedExtensiones = extensiones
    .filter(ext =>
      (ext.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ext.id_extension_archivo?.toString() || '').includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.id_extension_archivo - b.id_extension_archivo;
      } else {
        return b.id_extension_archivo - a.id_extension_archivo;
      }
    });

  const totalPages = Math.ceil(filteredAndSortedExtensiones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExtensiones = filteredAndSortedExtensiones.slice(startIndex, endIndex);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const goToNextPage = () => { if (currentPage < totalPages) { setCurrentPage(currentPage + 1); setOpenMenu(null); } };
  const goToPrevPage = () => { if (currentPage > 1) { setCurrentPage(currentPage - 1); setOpenMenu(null); } };
  const goToPage = (page) => { setCurrentPage(page); setOpenMenu(null); };

  if (loading) return <div>Cargando extensiones…</div>;
  if (error)  return <div style={{color:'red'}}>Error: {error}</div>;

  return (
    <div style={containerStyle}>
      {notification.show && (
        <div style={{ ...notificationStyle, ...(notification.type === 'error' ? errorNotificationStyle : {}) }}>
          <span className="material-symbols-outlined" style={notificationIconStyle}>
            {notification.type === 'error' ? 'error' : 'check'}
          </span>
          {notification.message}
        </div>
      )}
      <div style={headerStyle}>
        <div style={titleStyle}>Extensiones</div>
        <div style={subtitleStyle}>
          {filteredAndSortedExtensiones.length} extensiones encontradas - Página {currentPage} de {totalPages || 1}
        </div>
      </div>
      <div style={{height:18}} />
      <div style={toolbarStyle}>
        <div style={searchContainerStyle}>
          <span className="material-symbols-outlined" style={searchIconStyle}>search</span>
          <input
            type="text"
            placeholder="Buscar extensiones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>
        <button
          style={addButtonStyle}
          onClick={() => { setFormExtension(null); setShowForm(true); setOpenMenu(null); }}
        >
          <span className="material-symbols-outlined" style={addIconStyle}>add</span>
          Añadir extensión
        </button>
      </div>
      <div style={{height:12}} />
      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{...thStyle,width:'10%'}}>
                <div style={sortableHeaderStyle} onClick={toggleSort}>
                  ID
                  <span 
                    className="material-symbols-outlined" 
                    style={{ ...sortIconStyle, transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)' }}
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
            {currentExtensiones.length > 0 ? (
              currentExtensiones.map((ext,i)=>(
                <tr key={ext.id_extension_archivo}>
                  <td style={{...tdStyle,...(i===currentExtensiones.length-1?tdLastRowStyle:{})}}>
                    {ext.id_extension_archivo}
                  </td>
                  <td style={{...tdStyle,...(i===currentExtensiones.length-1?tdLastRowStyle:{})}}>
                    {ext.nombre}
                  </td>
                  <td style={{
                        ...tdStyle,
                        textAlign:'center',
                        position:'relative',
                        overflow: 'visible',
                        ...(i===currentExtensiones.length-1?tdLastRowStyle:{})
                      }}>
                    <button
                      style={iconButtonStyle}
                      onClick={()=>setOpenMenu(openMenu===ext.id_extension_archivo?null:ext.id_extension_archivo)}
                    >
                      <span className="material-symbols-outlined" style={{fontSize:15}}>more_horiz</span>
                    </button>
                    {openMenu===ext.id_extension_archivo && (
                      <div style={{
                        ...menuStyle,
                        ...(i === currentExtensiones.length - 1 ? menuLastRowStyle : {})
                      }} ref={menuRef}>
                        <div
                          style={menuItemStyle}
                          onClick={() => { setFormExtension(ext); setShowForm(true); setOpenMenu(null); }}
                        >
                          <span className="material-symbols-outlined" style={menuIconStyle}>edit</span>
                          Editar
                        </div>
                        <div
                          style={menuItemStyle}
                          onClick={() => { setExtensionToDelete(ext); setShowDeleteModal(true); setOpenMenu(null); }}
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
                    Ups… no se encontró ninguna extensión.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={paginationContainerStyle}>
          <div style={paginationStyle}>
            <button
              style={{ ...paginationButtonStyle, ...(currentPage === 1 ? disabledButtonStyle : {}) }}
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
                  style={{ ...pageNumberStyle, ...(currentPage === pageNum ? activePageStyle : {}) }}
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              style={{ ...paginationButtonStyle, ...(currentPage === totalPages ? disabledButtonStyle : {}) }}
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <span className="material-symbols-outlined" style={{fontSize: '14px'}}>keyboard_arrow_right</span>
            </button>
          </div>
        </div>
      )}
      {/* MODAL FORMULARIO */}
      <ExtensionForm
        isOpen={showForm}
        extension={formExtension}
        onCancel={() => { setShowForm(false); setFormExtension(null); }}
        onSave={handleSaveExtension}
      />
      {/* MODAL ELIMINAR */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        itemName={extensionToDelete?.nombre || ''}
        isLoading={isDeleting}
        onCancel={() => { setShowDeleteModal(false); setExtensionToDelete(null); }}
        onConfirm={async () => {
          if (!extensionToDelete) return;
          setIsDeleting(true);
          try {
            await deleteExtensionArchivo(extensionToDelete.id_extension_archivo);
            showNotification('Extensión eliminada con éxito', 'success');
            const updated = await getExtensionesArchivo();
            setExtensiones(updated);
          } catch (err) {
            showNotification('Error al eliminar la extensión', 'error');
          } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setExtensionToDelete(null);
          }
        }}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

// ...estilos copiados de CategoriasArchivoTable.js...
const containerStyle = { width:'100%',maxWidth:1400,margin:'0 auto',padding:'0 28px' };
const headerStyle = {textAlign:'left'};
const titleStyle  = {fontSize:23,fontWeight:700,color:'#1d1d1f'};
const subtitleStyle={fontSize:11,color:'#86868b',marginTop:2};
const toolbarStyle = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0px' };
const searchContainerStyle = { display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e5e5e7', borderRadius: '6px', padding: '8px 12px', gap: '8px', minWidth: '300px', maxWidth: '400px', flex: 1 };
const searchIconStyle = { fontSize: '16px', color: '#86868b' };
const searchInputStyle = { border: 'none', outline: 'none', fontSize: '11px', color: '#1d1d1f', background: 'transparent', width: '100%' };
const addButtonStyle = { display: 'flex', alignItems: 'center', gap: '6px', background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', transition: 'background 0.15s ease', whiteSpace: 'nowrap', flexShrink: 0 };
const addIconStyle = { fontSize: '16px' };
const tableWrapperStyle = { overflowX: 'auto', overflowY: 'visible', background: '#fff', width: 'calc(100vw - 56px - 320px)', marginRight: 30, minWidth: 320, maxWidth: 1400, border: 'none' };
const tableStyle = {width:'100%',borderCollapse:'collapse',background:'#fff',fontSize:11};
const thStyle = { padding:'10px 14px', fontWeight:600,fontSize:11,textAlign:'left', background:'#f5f5f7', borderBottom:'1px solid #e5e5e7',borderLeft:'none',borderRight:'none',borderTop:'none', whiteSpace:'nowrap' };
const sortableHeaderStyle = { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none', transition: 'color 0.15s ease' };
const sortIconStyle = { fontSize: '14px', color: '#86868b', transition: 'transform 0.2s ease' };
const tdStyle = { padding:'10px 14px', fontSize:11,textAlign:'left',color:'#222',background:'#fff', borderBottom:'1px solid #e5e5e7',borderLeft:'none',borderRight:'none',borderTop:'none' };
const tdLastRowStyle = {borderBottom:'none'};
const emptyStateStyle = { ...tdStyle, textAlign: 'center', borderBottom: 'none', padding: '40px 14px' };
const emptyStateContentStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#86868b', fontSize: '11px', fontStyle: 'normal' };
const emptyStateIconStyle = { fontSize: '24px', color: '#86868b' };
const iconButtonStyle = {background:'none',border:'none',cursor:'pointer',color:'#86868b',padding:0,fontSize:13,lineHeight:1};
const menuStyle = { position: 'absolute', top: '100%', right: '0', minWidth: 120, background: '#fff', border: '1px solid #e5e5e7', borderRadius: 8, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', zIndex: 1000, padding: '6px 0', marginTop: '4px' };
const menuLastRowStyle = { top: 'auto', bottom: '100%', marginTop: '0', marginBottom: '4px' };
const menuItemStyle = {display:'flex',alignItems:'center',gap:6,padding:'7px 16px',fontSize:11,color:'#1d1d1f',cursor:'pointer'};
const menuIconStyle = {fontSize:12,color:'#86868b'};
const paginationContainerStyle = { display: 'flex', justifyContent: 'flex-start', marginTop: '20px', width: '100%' };
const paginationStyle = { display: 'flex', alignItems: 'center', gap: '4px', padding: '0' };
const paginationButtonStyle = { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d1d1f', transition: 'opacity 0.15s ease', minWidth: '32px', height: '32px', borderRadius: '4px' };
const disabledButtonStyle = { opacity: 0.3, cursor: 'not-allowed' };
const pageNumberStyle = { background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', fontSize: '11px', color: '#1d1d1f', transition: 'background 0.15s ease', minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' };
const activePageStyle = { background: '#f5f5f7', color: '#1d1d1f' };
const notificationStyle = { position: 'fixed', top: '20px', right: '20px', background: '#34c759', color: '#fff', padding: '12px 16px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(52, 199, 89, 0.3)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '500', zIndex: 1001, animation: 'slideInFromRight 0.3s ease-out', fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' };
const errorNotificationStyle = { background: '#ff3b30', boxShadow: '0 4px 12px rgba(255, 59, 48, 0.3)' };
const notificationIconStyle = { fontSize: '16px' };

export default ExtensionesArchivoTable;

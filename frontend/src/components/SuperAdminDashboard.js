import React, { useState } from 'react';
import CategoriasArchivoTable from './CategoriasArchivoTable';
import ExtensionesArchivoTable from './ExtensionesArchivoTable';
import GeneroUsuarioTable from './GeneroUsuarioTable';
import MetodosPagoTable from './MetodosPagoTable';
import UsuariosTable from './UsuariosTable';
import ArchivosTableAdmin from './ArchivosTableAdmin';
import TransaccionesTableAdmin from './TransaccionesTableAdmin';
import DetalleTransaccionesTableAdmin from './DetalleTransaccionesTableAdmin';
import AnalyticsOverview from './AnalyticsOverview';

const SuperAdminDashboard = ({ onLogout, user }) => {
  const [openDropdowns, setOpenDropdowns] = useState({
    archivos: false,
    usuarios: false,
    transacciones: false
  });
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleDropdown = (section) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div style={styles.container}>
      {/* Sidebar con logo y navegación */}
      <aside style={styles.sidebar}>
        {/* Logo en la parte superior - SIN BORDE */}
        <div style={styles.sidebarLogoContainer}>
          <img 
            src="/images/templi-logo.PNG" 
            alt="Templi Logo" 
            style={styles.logoImage}
          />
        </div>

        {/* Menú de navegación */}
        <div style={styles.menuContainer}>
          {/* Dashboard */}
          <div 
            style={{
              ...styles.menuItem,
              backgroundColor: hoveredItem === 'dashboard' ? '#f5f5f7' : 'transparent',
              fontWeight: selectedSection === 'dashboard' ? 600 : 400
            }}
            onMouseEnter={() => setHoveredItem('dashboard')}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => setSelectedSection('dashboard')}
          >
            <span className="material-symbols-outlined" style={styles.menuIcon}>dashboard</span>
            <span style={styles.menuText}>Dashboard</span>
          </div>

          {/* Administración de Archivos */}
          <div style={styles.menuSection}>
            <div 
              style={{
                ...styles.menuDropdownHeader,
                backgroundColor: hoveredItem === 'archivos-header' ? '#f0f0f0' : '#f9f9f9'
              }}
              onClick={() => toggleDropdown('archivos')}
              onMouseEnter={() => setHoveredItem('archivos-header')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={styles.dropdownTitle}>Administración de Archivos</span>
              <span 
                className="material-symbols-outlined" 
                style={{
                  ...styles.dropdownIcon,
                  transform: openDropdowns.archivos ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              >
                expand_more
              </span>
            </div>
            
            {openDropdowns.archivos && (
              <div style={styles.dropdownContent}>
                <div 
                  style={{
                    ...styles.menuSubItem,
                    backgroundColor: hoveredItem === 'archivos' ? '#f0f0f0' : 'transparent',
                    fontWeight: selectedSection === 'archivos' ? 600 : 400
                  }}
                  onMouseEnter={() => setHoveredItem('archivos')}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => setSelectedSection('archivos')}
                >
                  <span className="material-symbols-outlined" style={styles.menuIcon}>deployed_code</span>
                  <span style={styles.menuText}>Archivos</span>
                </div>
                <div 
                  style={{
                    ...styles.menuSubItem,
                    backgroundColor: hoveredItem === 'categorias' ? '#f0f0f0' : 'transparent',
                    fontWeight: selectedSection === 'categorias' ? 600 : 400
                  }}
                  onMouseEnter={() => setHoveredItem('categorias')}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => setSelectedSection('categorias')}
                >
                  <span className="material-symbols-outlined" style={styles.menuIcon}>category</span>
                  <span style={styles.menuText}>Categorías</span>
                </div>
                <div 
                  style={{
                    ...styles.menuSubItem,
                    backgroundColor: hoveredItem === 'extensiones' ? '#f0f0f0' : 'transparent',
                    fontWeight: selectedSection === 'extensiones' ? 600 : 400
                  }}
                  onMouseEnter={() => setHoveredItem('extensiones')}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => setSelectedSection('extensiones')}
                >
                  <span className="material-symbols-outlined" style={styles.menuIcon}>type_specimen</span>
                  <span style={styles.menuText}>Extensiones</span>
                </div>
              </div>
            )}
          </div>

          {/* Gestión de Usuarios */}
          <div style={styles.menuSection}>
            <div 
              style={{
                ...styles.menuDropdownHeader,
                backgroundColor: hoveredItem === 'usuarios-header' ? '#f0f0f0' : '#f9f9f9'
              }}
              onClick={() => toggleDropdown('usuarios')}
              onMouseEnter={() => setHoveredItem('usuarios-header')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={styles.dropdownTitle}>Gestión de Usuarios</span>
              <span 
                className="material-symbols-outlined" 
                style={{
                  ...styles.dropdownIcon,
                  transform: openDropdowns.usuarios ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              >
                expand_more
              </span>
            </div>
            
            {openDropdowns.usuarios && (
              <div style={styles.dropdownContent}>
                <div 
                  style={{
                    ...styles.menuSubItem,
                    backgroundColor: hoveredItem === 'usuarios' ? '#f0f0f0' : 'transparent',
                    fontWeight: selectedSection === 'usuarios' ? 600 : 400
                  }}
                  onMouseEnter={() => setHoveredItem('usuarios')}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => setSelectedSection('usuarios')} // 🆕 AGREGAR ONCLICK
                >
                  <span className="material-symbols-outlined" style={styles.menuIcon}>person</span>
                  <span style={styles.menuText}>Usuarios</span>
                </div>
                <div 
                  style={{
                    ...styles.menuSubItem,
                    backgroundColor: hoveredItem === 'genero' ? '#f0f0f0' : 'transparent',
                    fontWeight: selectedSection === 'genero' ? 600 : 400
                  }}
                  onMouseEnter={() => setHoveredItem('genero')}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => setSelectedSection('genero')}
                >
                  <span className="material-symbols-outlined" style={styles.menuIcon}>apps</span>
                  <span style={styles.menuText}>Género de usuario</span>
                </div>
              </div>
            )}
          </div>

          {/* Transacciones */}
          <div style={styles.menuSection}>
            <div 
              style={{
                ...styles.menuDropdownHeader,
                backgroundColor: hoveredItem === 'transacciones-header' ? '#f0f0f0' : '#f9f9f9'
              }}
              onClick={() => toggleDropdown('transacciones')}
              onMouseEnter={() => setHoveredItem('transacciones-header')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={styles.dropdownTitle}>Transacciones</span>
              <span 
                className="material-symbols-outlined" 
                style={{
                  ...styles.dropdownIcon,
                  transform: openDropdowns.transacciones ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              >
                expand_more
              </span>
            </div>
            
            {openDropdowns.transacciones && (
              <div style={styles.dropdownContent}>
                <div 
                  style={{
                    ...styles.menuSubItem,
                    backgroundColor: hoveredItem === 'transacciones' ? '#f0f0f0' : 'transparent',
                    fontWeight: selectedSection === 'transacciones' ? 600 : 400
                  }}
                  onMouseEnter={() => setHoveredItem('transacciones')}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => setSelectedSection('transacciones')}
                >
                  <span className="material-symbols-outlined" style={styles.menuIcon}>attach_money</span>
                  <span style={styles.menuText}>Transacciones</span>
                </div>
                <div 
                  style={{
                    ...styles.menuSubItem,
                    backgroundColor: hoveredItem === 'detalle' ? '#f0f0f0' : 'transparent',
                    fontWeight: selectedSection === 'detalle' ? 600 : 400
                  }}
                  onMouseEnter={() => setHoveredItem('detalle')}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => setSelectedSection('detalle')}
                >
                  <span className="material-symbols-outlined" style={styles.menuIcon}>contract</span>
                  <span style={styles.menuText}>Detalle de Transacción</span>
                </div>
                <div 
                  style={{
                    ...styles.menuSubItem,
                    backgroundColor: hoveredItem === 'metodos-pago' ? '#f0f0f0' : 'transparent',
                    fontWeight: selectedSection === 'metodos-pago' ? 600 : 400
                  }}
                  onMouseEnter={() => setHoveredItem('metodos-pago')}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => setSelectedSection('metodos-pago')}
                >
                  <span className="material-symbols-outlined" style={styles.menuIcon}>credit_card</span>
                  <span style={styles.menuText}>Métodos de Pago</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Saludo al usuario en la parte inferior */}
        <div style={styles.userGreeting}>
          <span style={styles.greetingText}>
            Hola, {user?.nombre || 'SuperAdmin'}
          </span>
          <div style={styles.adminBadge}>
            ADMIN
          </div>
        </div>

        {/* Navegación de configuración y logout */}
        <div style={styles.bottomMenu}>
          {/* Cerrar Sesión */}
          <div 
            style={{
              ...styles.bottomMenuItem,
              backgroundColor: hoveredItem === 'logout' ? '#fff5f5' : 'transparent'
            }}
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={handleLogoutClick}
          >
            <span className="material-symbols-outlined" style={styles.logoutIcon}>logout</span>
            <span style={styles.logoutText}>Cerrar Sesión</span>
          </div>
        </div>
      </aside>
      
      {/* Contenido principal - ajustado sin header */}
      <div style={styles.content}>
        {selectedSection === 'dashboard' && <AnalyticsOverview />}
        {selectedSection === 'archivos' && <ArchivosTableAdmin />}
        {selectedSection === 'categorias' && <CategoriasArchivoTable />}
        {selectedSection === 'extensiones' && <ExtensionesArchivoTable />}
        {selectedSection === 'genero' && <GeneroUsuarioTable />}
        {selectedSection === 'metodos-pago' && <MetodosPagoTable />}
        {selectedSection === 'usuarios' && <UsuariosTable />}
        {selectedSection === 'transacciones' && <TransaccionesTableAdmin />}
        {selectedSection === 'detalle' && <DetalleTransaccionesTableAdmin />}
        {selectedSection === 'configuracion' && (
          <div style={styles.welcomeCard}>
            <h2 style={styles.sectionTitle}>Configuración</h2>
            <p style={styles.description}>
              Aquí podrás gestionar tu perfil, cambiar tu contraseña y configurar las preferencias de tu cuenta.
            </p>
          </div>
        )}
        {!selectedSection && <AnalyticsOverview />}
        {/* Aquí irá el contenido del dashboard */}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Confirmar cierre de sesión</h3>
            <p style={styles.modalMessage}>¿Estás seguro que quieres cerrar sesión?</p>
            <div style={styles.modalButtons}>
              <button
                style={styles.modalCancelButton}
                onClick={handleCancelLogout}
              >
                Cancelar
              </button>
              <button
                style={styles.modalConfirmButton}
                onClick={handleConfirmLogout}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#fafafa',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1d1d1f',
    lineHeight: 1.4,
  },

  // Sidebar expandido para incluir logo y usuario
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '280px',
    height: '100vh',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e5e7',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    zIndex: 999
  },

  // Logo alineado a la izquierda, más grande y SIN BORDE
  sidebarLogoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start', // Alineado a la izquierda
    padding: '20px 24px',
    // borderBottom: '1px solid #e5e5e7', // ❌ ELIMINADO
    backgroundColor: '#ffffff' // Cambiado para que no se distinga
  },

  logoImage: {
    height: '42px', // Aumentado de 32px a 42px
    width: 'auto',
    objectFit: 'contain',
  },

  // Container del menú (parte media que crece)
  menuContainer: {
    flex: 1,
    paddingTop: '16px'
  },

  // Saludo al usuario en la parte inferior
  userGreeting: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderTop: '1px solid #e5e5e7',
    backgroundColor: '#fafafa',
    marginTop: 'auto' // Empuja hacia abajo
  },

  greetingText: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#1d1d1f',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  adminBadge: {
    backgroundColor: '#1d1d1f',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: '500',
    padding: '3px 6px',
    borderRadius: '4px',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    letterSpacing: '0.5px'
  },

  // Content sin padding top (ya no hay header fijo)
  content: {
    maxWidth: 'calc(1200px - 280px)',
    margin: '0 auto 0 280px',
    padding: '40px 24px'
  },

  menuItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    borderBottom: '1px solid #f5f5f7'
  },

  menuSection: {
    borderBottom: '1px solid #f5f5f7'
  },

  menuDropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    backgroundColor: '#f9f9f9'
  },

  menuSubItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 24px 10px 48px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },

  menuIcon: {
    fontSize: '20px',
    color: '#1d1d1f',
    marginRight: '12px',
    fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20"
  },

  menuText: {
    fontSize: '10.5px',
    fontWeight: '400',
    color: '#1d1d1f',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  dropdownTitle: {
    fontSize: '9.5px',
    fontWeight: '600',
    color: '#1d1d1f',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  dropdownIcon: {
    fontSize: '20px',
    color: '#86868b',
    transition: 'transform 0.2s ease',
    fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20"
  },

  dropdownContent: {
    backgroundColor: '#fafafa'
  },

  // Estilos para el contenido principal
  welcomeCard: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto'
  },

  mainText: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#1d1d1f',
    margin: '0 0 20px 0',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1d1d1f',
    margin: '0 0 16px 0',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  description: {
    fontSize: '14px',
    color: '#86868b',
    lineHeight: '1.6',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  // Estilos para el menú inferior (configuración y logout)
  bottomMenu: {
    borderTop: '1px solid #e5e5e7',
    backgroundColor: '#ffffff'
  },

  bottomMenuItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },

  bottomMenuIcon: {
    fontSize: '20px',
    color: '#1d1d1f',
    marginRight: '12px',
    fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20"
  },

  bottomMenuText: {
    fontSize: '10.5px',
    fontWeight: '400',
    color: '#1d1d1f',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  logoutIcon: {
    fontSize: '20px',
    color: '#dc3545',
    marginRight: '12px',
    fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20"
  },

  logoutText: {
    fontSize: '10.5px',
    fontWeight: '400',
    color: '#dc3545',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },

  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  modalTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1d1d1f',
    margin: '0 0 12px 0',
    textAlign: 'center'
  },

  modalMessage: {
    fontSize: '13px',
    color: '#86868b',
    margin: '0 0 20px 0',
    textAlign: 'center',
    lineHeight: '1.4'
  },

  modalButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },

  modalCancelButton: {
    padding: '8px 18px',
    backgroundColor: '#f5f5f7',
    color: '#1d1d1f',
    border: 'none',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  modalConfirmButton: {
    padding: '8px 18px',
    backgroundColor: '#dc3545',
    color: '#ffffff',
    border: 'none',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
};

export default SuperAdminDashboard;
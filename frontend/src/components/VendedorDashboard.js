import React, { useState } from 'react';
import ArchivosTable from './ArchivosTable';

const VendedorDashboard = ({ onLogout, user }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedSection, setSelectedSection] = useState('dashboard');

  return (
    <div style={styles.container}>
      {/* Sidebar con logo y navegación */}
      <aside style={styles.sidebar}>
        {/* Logo en la parte superior */}
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

          {/* Archivos */}
          <div 
            style={{
              ...styles.menuItem,
              backgroundColor: hoveredItem === 'archivos' ? '#f5f5f7' : 'transparent',
              fontWeight: selectedSection === 'archivos' ? 600 : 400
            }}
            onMouseEnter={() => setHoveredItem('archivos')}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => setSelectedSection('archivos')}
          >
            <span className="material-symbols-outlined" style={styles.menuIcon}>deployed_code</span>
            <span style={styles.menuText}>Mis Archivos</span>
          </div>
        </div>

        {/* Saludo al usuario en la parte inferior */}
        <div style={styles.userGreeting}>
          <span style={styles.greetingText}>
            Hola, {user?.nombre || 'Vendedor'}
          </span>
          <div style={styles.vendedorBadge}>
            VENDEDOR
          </div>
        </div>

        {/* Navegación de configuración y logout */}
        <div style={styles.bottomMenu}>
          {/* Configuración */}
          <div 
            style={{
              ...styles.bottomMenuItem,
              backgroundColor: hoveredItem === 'configuracion' ? '#f5f5f7' : 'transparent',
              fontWeight: selectedSection === 'configuracion' ? 600 : 400
            }}
            onMouseEnter={() => setHoveredItem('configuracion')}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => setSelectedSection('configuracion')}
          >
            <span className="material-symbols-outlined" style={styles.bottomMenuIcon}>settings</span>
            <span style={styles.bottomMenuText}>Configuración</span>
          </div>

          {/* Cerrar Sesión */}
          <div 
            style={{
              ...styles.bottomMenuItem,
              backgroundColor: hoveredItem === 'logout' ? '#fff5f5' : 'transparent'
            }}
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={onLogout}
          >
            <span className="material-symbols-outlined" style={styles.logoutIcon}>logout</span>
            <span style={styles.logoutText}>Cerrar Sesión</span>
          </div>
        </div>
      </aside>
      
      {/* Contenido principal */}
      <div style={styles.content}>
        {selectedSection === 'dashboard' && (
          <div style={styles.welcomeCard}>
            <h1 style={styles.mainText}>¡Bienvenido a tu panel de vendedor!</h1>
            <p style={styles.subtitle}>
              ✅ Sistema de autenticación funcionando correctamente
            </p>
            <p style={styles.description}>
              Desde aquí puedes gestionar tus archivos digitales y hacer crecer tu negocio.
            </p>
          </div>
        )}
        {selectedSection === 'archivos' && (
          <ArchivosTable vendedorId={user?.id_vendedor} />
        )}
        {selectedSection === 'configuracion' && (
          <div style={styles.welcomeCard}>
            <h2 style={styles.sectionTitle}>Configuración</h2>
            <p style={styles.description}>
              Aquí podrás gestionar tu perfil, cambiar tu contraseña y configurar las preferencias de tu cuenta.
            </p>
          </div>
        )}
        {!selectedSection && (
          <div style={styles.welcomeCard}>
            <h1 style={styles.mainText}>Panel de Vendedor</h1>
            <p style={styles.description}>
              Selecciona una opción del menú lateral para comenzar.
            </p>
          </div>
        )}
      </div>
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

  // Logo alineado a la izquierda
  sidebarLogoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '20px 24px',
    backgroundColor: '#ffffff'
  },

  logoImage: {
    height: '42px',
    width: 'auto',
    objectFit: 'contain',
  },

  // Container del menú
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
    marginTop: 'auto'
  },

  greetingText: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#1d1d1f',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  vendedorBadge: {
    backgroundColor: '#28a745',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: '500',
    padding: '3px 6px',
    borderRadius: '4px',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    letterSpacing: '0.5px'
  },

  // Content sin padding top
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

  subtitle: {
    fontSize: '16px',
    color: '#28a745',
    margin: '0 0 15px 0',
    fontWeight: '500',
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
  }
};

export default VendedorDashboard;
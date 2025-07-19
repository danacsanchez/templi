import React from 'react';

const SuperAdminDashboard = ({ onLogout }) => {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>templi - Panel SuperAdmin</h2>
        <button onClick={onLogout} style={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </div>
      
      {/* Contenido principal */}
      <div style={styles.content}>
        <div style={styles.card}>
          <h1 style={styles.mainText}>SUPERADMIN WORKS</h1>
          <p style={styles.subtitle}>
            ✅ Sistema de autenticación funcionando correctamente
          </p>
          <p style={styles.description}>
            Este es el dashboard para usuarios con rol de <strong>SuperAdmin</strong>
          </p>
          <div style={styles.features}>
            <p>🔧 Gestión completa del sistema</p>
            <p>👥 Administración de usuarios</p>
            <p>⚙️ Configuraciones avanzadas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa'
  },
  header: {
    padding: '15px 20px',
    backgroundColor: '#6f42c1', // Púrpura para superadmin
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  headerTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold'
  },
  logoutButton: {
    padding: '8px 16px',
    fontSize: '14px',
    color: 'white',
    backgroundColor: '#dc3545',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 70px)',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    padding: '60px 40px',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '600px',
    width: '100%'
  },
  mainText: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#6f42c1',
    margin: '0 0 20px 0',
    letterSpacing: '2px'
  },
  subtitle: {
    fontSize: '18px',
    color: '#6f42c1',
    margin: '0 0 15px 0',
    fontWeight: 'bold'
  },
  description: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.5',
    marginBottom: '20px'
  },
  features: {
    textAlign: 'left',
    fontSize: '14px',
    color: '#555'
  }
};

export default SuperAdminDashboard;
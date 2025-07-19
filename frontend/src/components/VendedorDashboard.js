import React from 'react';

const VendedorDashboard = ({ onLogout }) => {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>templi - Panel Vendedor</h2>
        <button onClick={onLogout} style={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </div>
      
      {/* Contenido principal */}
      <div style={styles.content}>
        <div style={styles.card}>
          <h1 style={styles.mainText}>VENDEDOR WORKS</h1>
          <p style={styles.subtitle}>
            ✅ Sistema de autenticación funcionando correctamente
          </p>
          <p style={styles.description}>
            Este es el dashboard para usuarios con rol de <strong>Vendedor</strong>
          </p>
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
    backgroundColor: '#28a745', // Verde para vendedor
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
    color: '#28a745',
    margin: '0 0 20px 0',
    letterSpacing: '2px'
  },
  subtitle: {
    fontSize: '18px',
    color: '#28a745',
    margin: '0 0 15px 0',
    fontWeight: 'bold'
  },
  description: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.5'
  }
};

export default VendedorDashboard;
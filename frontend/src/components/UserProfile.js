import React, { useState } from 'react';

const UserProfile = ({ user, onLogout, onBackToHome }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
      {/* Navigation Header */}
      <header style={styles.header}>
        {/* Logo Image */}
        <div style={styles.logoContainer}>
          <img 
            src="/images/templi-logo.PNG" 
            alt="Templi Logo" 
            style={styles.logoImage}
          />
        </div>
        
        <div style={styles.navContainer}>
          {/* Navigation Links */}
          <nav style={styles.nav}>
            <a href="#features" style={styles.navLink}>Características</a>
            <a href="#about" style={styles.navLink}>Acerca de</a>
          </nav>
          
          {/* Profile Button - Disabled */}
          <button
            style={styles.userGreetingDisabled}
            disabled
          >
            <span className="material-symbols-outlined" style={styles.profileIcon}>
              account_circle
            </span>
            <span style={styles.greetingTextDisabled}>Hola, {user.nombre}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Back to Home Button */}
        <button 
          onClick={onBackToHome}
          style={styles.backButton}
        >
          <span className="material-symbols-outlined" style={styles.backIcon}>
            arrow_back
          </span>
          Volver al inicio
        </button>

        {/* Profile Header */}
        <div style={styles.profileHeader}>
          <h1 style={styles.welcomeTitle}>Bienvenido a tu perfil, {user.nombre}</h1>
          <div style={styles.wavyLine}>
            <svg width="120" height="8" viewBox="0 0 120 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M1 4C10 1 20 7 30 4C40 1 50 7 60 4C70 1 80 7 90 4C100 1 110 7 119 4" 
                stroke="#F4E391" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p style={styles.subtitle}>
            Aquí puedes revisar tu información personal y salir de tu cuenta cuando lo necesites.
          </p>
        </div>

        {/* User Info */}
        <div style={styles.userInfo}>
          <p style={styles.userEmail}>{user.email}</p>
          <p style={styles.userStatus}>
            <span className="material-symbols-outlined" style={styles.statusIcon}>
              asterisk
            </span>
            Actualmente estás registrado como comprador.
          </p>
        </div>

        {/* Logout Section */}
        <div style={styles.logoutSection}>
          <p style={styles.logoutQuestion}>¿Terminaste por hoy? Puedes cerrar sesión aquí</p>
          <button
            onClick={handleLogoutClick}
            style={styles.logoutButton}
          >
            <span className="material-symbols-outlined" style={styles.logoutIcon}>
              logout
            </span>
            Cerrar sesión
          </button>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            {/* Close Button */}
            <button 
              onClick={handleCancelLogout}
              style={styles.closeButton}
            >
              <span className="material-symbols-outlined" style={styles.closeIcon}>
                close
              </span>
            </button>

            {/* Modal Body */}
            <div style={styles.modalBody}>
              {/* Goodbye Message */}
              <div style={styles.goodbyeMessage}>
                <span className="material-symbols-outlined" style={styles.wavingIcon}>
                  waving_hand
                </span>
                <span style={styles.goodbyeText}>¡Hasta luego!</span>
              </div>

              {/* Confirmation Text */}
              <p style={styles.confirmationText}>
                Si estás seguro de cerrar sesión, haz clic abajo. ¡Nos vemos pronto!
              </p>

              {/* Action Buttons */}
              <div style={styles.modalButtons}>
                <button
                  onClick={handleCancelLogout}
                  style={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmLogout}
                  style={styles.confirmButton}
                >
                  Sí, cerrar sesión
                </button>
              </div>
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

  // Header
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(250, 250, 250, 0.8)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logoContainer: {
    display: 'flex',
    alignItems: 'center',
  },

  logoImage: {
    height: '32px',
    width: 'auto',
    objectFit: 'contain',
  },

  navContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },

  nav: {
    display: 'flex',
    gap: '32px',
  },

  navLink: {
    fontSize: '13px',
    color: '#86868b',
    textDecoration: 'none',
    fontWeight: '400',
    transition: 'color 0.2s ease',
    cursor: 'pointer',
  },

  // Profile Button - Disabled
  userGreetingDisabled: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'rgba(29, 29, 31, 0.02)',
    borderRadius: '16px',
    border: '1px solid rgba(29, 29, 31, 0.05)',
    cursor: 'not-allowed',
    opacity: 0.6,
  },

  profileIcon: {
    fontSize: '16px',
    color: '#86868b',
  },

  greetingTextDisabled: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#86868b',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  // Main Content
  main: {
    paddingTop: '120px',
    paddingBottom: '80px',
    paddingLeft: '24px',
    paddingRight: '24px',
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'left',
  },

  // Back Button
  backButton: {
    backgroundColor: 'transparent',
    color: '#86868b',
    border: 'none',
    borderRadius: '8px',
    padding: '6px 8px',
    fontSize: '12px',
    fontWeight: '400',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '32px',
    alignSelf: 'flex-start',
  },

  backIcon: {
    fontSize: '14px',
  },

  // Profile Header
  profileHeader: {
    marginBottom: '40px',
  },

  welcomeTitle: {
    fontSize: '28px',
    fontWeight: '600',
    lineHeight: '1.2',
    margin: '0 0 12px 0',
    color: '#1d1d1f',
    letterSpacing: '-0.5px',
  },

  // Wavy Line (aligned to the left)
  wavyLine: {
    display: 'flex',
    justifyContent: 'flex-start',
    margin: '12px 0 16px 0',
    opacity: 0.8,
    marginLeft: '0', // Alineado a la izquierda
  },

  subtitle: {
    fontSize: '14px',
    fontWeight: '400',
    color: '#86868b',
    lineHeight: '1.4',
    margin: '0',
    maxWidth: '480px',
  },

  // User Info
  userInfo: {
    marginBottom: '40px',
    textAlign: 'left',
  },

  userEmail: {
    fontSize: '14px',
    color: '#1d1d1f',
    margin: '0 0 4px 0',
    fontWeight: '400',
  },

  userStatus: {
    fontSize: '14px',
    color: '#1d1d1f',
    margin: 0,
    fontWeight: '400',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  statusIcon: {
    fontSize: '14px',
    color: '#1d1d1f',
  },

  // Logout Section
  logoutSection: {
    textAlign: 'left',
    paddingTop: '32px',
    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
  },

  logoutQuestion: {
    fontSize: '14px',
    color: '#86868b',
    margin: '0 0 16px 0',
    fontWeight: '400',
  },

  logoutButton: {
    backgroundColor: '#1d1d1f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '8px 20px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  logoutIcon: {
    fontSize: '14px',
    color: '#ffffff',
  },

  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },

  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '400px',
    width: '90%',
    position: 'relative',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  closeButton: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
  },

  closeIcon: {
    fontSize: '20px',
    color: '#86868b',
  },

  modalBody: {
    marginTop: '16px',
    textAlign: 'center',
  },

  goodbyeMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '20px',
  },

  wavingIcon: {
    fontSize: '24px',
    color: '#1d1d1f',
  },

  goodbyeText: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1d1d1f',
  },

  confirmationText: {
    fontSize: '13px',
    color: '#86868b',
    lineHeight: '1.5',
    margin: '0 0 32px 0',
    fontWeight: '400',
  },

  modalButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },

  cancelButton: {
    backgroundColor: '#ffffff',
    color: '#1d1d1f',
    border: '1px solid #d1d1d6',
    borderRadius: '12px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  confirmButton: {
    backgroundColor: '#1d1d1f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  // Responsive
  '@media (max-width: 768px)': {
    header: {
      padding: '12px 16px',
    },
    
    navContainer: {
      gap: '16px',
    },
    
    nav: {
      gap: '20px',
    },
    
    navLink: {
      fontSize: '12px',
    },

    main: {
      paddingLeft: '16px',
      paddingRight: '16px',
      paddingTop: '100px',
    },

    welcomeTitle: {
      fontSize: '24px',
      margin: '0 0 10px 0',
    },

    subtitle: {
      fontSize: '13px',
    },

    backButton: {
      fontSize: '11px',
      padding: '4px 6px',
    },

    backIcon: {
      fontSize: '12px',
    },

    userInfo: {
      marginBottom: '32px',
    },

    userEmail: {
      fontSize: '13px',
    },

    userStatus: {
      fontSize: '13px',
    },

    statusIcon: {
      fontSize: '13px',
    },

    wavyLine: {
      marginLeft: '0', // Alineado a la izquierda en móvil también
    },

    logoutQuestion: {
      fontSize: '13px',
      margin: '0 0 16px 0',
    },

    logoutButton: {
      padding: '6px 16px',
      fontSize: '11px',
    },
  },
};

export default UserProfile;

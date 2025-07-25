import React from 'react';

const UserProfile = ({ user, onLogout, onBackToHome }) => {
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
        <div style={styles.profileContainer}>
          {/* Profile Header */}
          <div style={styles.profileHeader}>
            <div style={styles.avatarContainer}>
              <span className="material-symbols-outlined" style={styles.avatarIcon}>
                account_circle
              </span>
            </div>
            <h1 style={styles.userName}>Hola, {user.nombre}</h1>
            <p style={styles.userEmail}>{user.email}</p>
          </div>

          {/* Profile Content */}
          <div style={styles.profileContent}>
            {/* Account Information Section */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Información de la cuenta</h2>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Nombre completo</span>
                  <span style={styles.infoValue}>{user.nombre}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Correo electrónico</span>
                  <span style={styles.infoValue}>{user.email}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Tipo de cuenta</span>
                  <span style={styles.infoValue}>
                    {user.tipoUsuario === 1 ? 'Administrador' : 
                     user.tipoUsuario === 2 ? 'Vendedor' : 'Usuario'}
                  </span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Miembro desde</span>
                  <span style={styles.infoValue}>
                    {new Date(user.fechaCreacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </section>

            {/* Account Actions Section */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Acciones de cuenta</h2>
              <div style={styles.actionsContainer}>
                <button 
                  onClick={onBackToHome}
                  style={styles.backToHomeButton}
                >
                  <span className="material-symbols-outlined" style={styles.actionIcon}>
                    arrow_back
                  </span>
                  Volver al inicio
                </button>
                <button style={styles.actionButton}>
                  <span className="material-symbols-outlined" style={styles.actionIcon}>
                    edit
                  </span>
                  Editar perfil
                </button>
                <button style={styles.actionButton}>
                  <span className="material-symbols-outlined" style={styles.actionIcon}>
                    lock
                  </span>
                  Cambiar contraseña
                </button>
                <button style={styles.actionButton}>
                  <span className="material-symbols-outlined" style={styles.actionIcon}>
                    download
                  </span>
                  Mis descargas
                </button>
                {user.tipoUsuario === 2 && (
                  <button style={styles.actionButton}>
                    <span className="material-symbols-outlined" style={styles.actionIcon}>
                      store
                    </span>
                    Mis productos
                  </button>
                )}
              </div>
            </section>

            {/* Logout Section */}
            <section style={styles.section}>
              <div style={styles.logoutContainer}>
                <button
                  onClick={onLogout}
                  style={styles.logoutButton}
                >
                  <span className="material-symbols-outlined" style={styles.logoutIcon}>
                    logout
                  </span>
                  Cerrar sesión
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
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
    maxWidth: '800px',
    margin: '0 auto',
  },

  profileContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  },

  // Profile Header
  profileHeader: {
    textAlign: 'center',
    marginBottom: '40px',
    paddingBottom: '32px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  },

  avatarContainer: {
    marginBottom: '16px',
  },

  avatarIcon: {
    fontSize: '80px',
    color: '#86868b',
  },

  userName: {
    fontSize: '32px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    color: '#1d1d1f',
  },

  userEmail: {
    fontSize: '16px',
    color: '#86868b',
    margin: 0,
  },

  // Profile Content
  profileContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1d1d1f',
    margin: 0,
  },

  // Info Grid
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  },

  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '16px',
    backgroundColor: '#f8f8f8',
    borderRadius: '12px',
  },

  infoLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#86868b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  infoValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1d1d1f',
  },

  // Actions
  actionsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },

  actionButton: {
    backgroundColor: '#f8f8f8',
    color: '#1d1d1f',
    border: 'none',
    borderRadius: '12px',
    padding: '16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textAlign: 'left',
  },

  backToHomeButton: {
    backgroundColor: '#1d1d1f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textAlign: 'left',
  },

  actionIcon: {
    fontSize: '20px',
    color: '#86868b',
  },

  // Logout
  logoutContainer: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '16px',
    borderTop: '1px solid rgba(0, 0, 0, 0.05)',
  },

  logoutButton: {
    backgroundColor: '#ff4757',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  logoutIcon: {
    fontSize: '18px',
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
    },

    profileContainer: {
      padding: '24px',
    },

    infoGrid: {
      gridTemplateColumns: '1fr',
    },

    actionsContainer: {
      gridTemplateColumns: '1fr',
    },

    avatarIcon: {
      fontSize: '64px',
    },

    userName: {
      fontSize: '24px',
    },
  },
};

export default UserProfile;

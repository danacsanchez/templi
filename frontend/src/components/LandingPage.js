import React, { useState } from 'react';

const LandingPage = ({ onLoginClick, user, onLogout, onProfileClick, onMarketplaceClick }) => { // ← Agregar onMarketplaceClick
  const [isHovered, setIsHovered] = useState(false);
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

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
          
          {/* Login Button o Botón de Perfil */}
          {user ? (
            // Mostrar botón de perfil si el usuario está logueado
            <button
              onClick={onProfileClick}
              style={{
                ...styles.userGreeting,
                ...(isLoginHovered ? styles.userGreetingHover : {})
              }}
              onMouseEnter={() => setIsLoginHovered(true)}
              onMouseLeave={() => setIsLoginHovered(false)}
            >
              <span style={styles.greetingText}>Hola, {user.nombre}</span>
            </button>
          ) : (
            // Mostrar botón de login si no está logueado
            <button
              onClick={onLoginClick}
              style={{
                ...styles.loginButton,
                ...(isLoginHovered ? styles.loginButtonHover : {})
              }}
              onMouseEnter={() => setIsLoginHovered(true)}
              onMouseLeave={() => setIsLoginHovered(false)}
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </header>

      {/* Hero Section Centrado */}
      <section style={styles.heroSection}>
        <main style={styles.main}>
          <div style={styles.heroContent}>
          {/* Magic Icon */}
          <span className="material-symbols-outlined" style={styles.magicIcon}>
            wand_stars
          </span>

          {/* Main Headline */}
          <h1 style={styles.headline}>
            Descarga lo que necesitas.
            <br />
            <span style={styles.headlineAccent}>Vende lo que sabes.</span>
          </h1>
          
          {/* Wavy Line Decoration */}
          <div style={styles.wavyLine}>
            <svg width="200" height="16" viewBox="0 0 200 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M2 8C12 3 18 13 30 8C42 3 48 13 60 8C72 3 78 13 90 8C102 3 108 13 120 8C132 3 138 13 150 8C162 3 168 13 180 8C188 5 194 11 198 8" 
                stroke="#1d1d1f" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
            </svg>
          </div>
          
          {/* Subtitle */}
          <p style={styles.subtitle}>
            Explora una amplia colección de archivos útiles y listos para descargar, creados por personas que entienden lo que necesitas.
          </p>

          {/* CTA Button - Siempre va al marketplace */}
          <button
            onClick={onMarketplaceClick}
            style={{
              ...styles.ctaButton,
              ...(isHovered ? styles.ctaButtonHover : {})
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span style={styles.buttonText}>
              {user ? 'Explorar Marketplace' : 'Explorar Marketplace'}
            </span>
            <span className="material-symbols-outlined" style={styles.buttonIcon}>
              keyboard_arrow_right
            </span>
          </button>

          {/* Secondary Info */}
          <div style={styles.secondaryInfo}>
            <span style={styles.infoText}>No se requiere tarjeta de crédito</span>
            <span style={styles.separator}>•</span>
            <span style={styles.infoText}>Explora gratis</span>
          </div>
          </div>
        </main>
      </section>

      {/* Características Section */}
      <section style={styles.caracteristicasSection}>
        <div style={styles.caracteristicasContainer}>
          {/* Left Side - Main Content */}
          <div style={styles.leftContent}>
            <p style={styles.categoryLabel}>• CARACTERÍSTICAS</p>
            <h2 style={styles.sectionTitle}>
              Tu espacio para trabajar, crear y organizar mejor
            </h2>
          </div>

          {/* Right Side - Description */}
          <div style={styles.rightContent}>
            <p style={styles.sectionDescription}>
              En Templi reunimos productos digitales listos para descargar, pensados para ayudarte a trabajar, organizarte o crear de forma más rápida y eficiente.
            </p>
          </div>
        </div>

        {/* Tarjetas de Características */}
        <div style={styles.cardsContainer}>
          <div 
            style={{
              ...styles.card,
              ...(hoveredCard === 'card1' ? styles.cardHover : {})
            }}
            onMouseEnter={() => setHoveredCard('card1')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.cardIcon}>
              <span className="material-symbols-outlined" style={{...styles.iconStyle, color: '#A8DADC'}}>
                note_stack
              </span>
            </div>
            <h3 style={styles.cardTitle}>Variedad de Productos Digitales</h3>
            <p style={styles.cardDescription}>
              Explora una amplia colección de productos digitales: PDFs, plantillas editables en Word y PowerPoint, imágenes de alta calidad y mucho más.
            </p>
          </div>

          <div 
            style={{
              ...styles.card,
              ...(hoveredCard === 'card2' ? styles.cardHover : {})
            }}
            onMouseEnter={() => setHoveredCard('card2')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.cardIcon}>
              <span className="material-symbols-outlined" style={{...styles.iconStyle, color: '#B8E6B8'}}>
                shopping_bag_speed
              </span>
            </div>
            <h3 style={styles.cardTitle}>Fácil y Rápido</h3>
            <p style={styles.cardDescription}>
              Compra y descarga al instante. Sin esperas ni complicaciones, accede a tus archivos digitales de manera inmediata para comenzar a usarlos cuando quieras.
            </p>
          </div>

          <div 
            style={{
              ...styles.card,
              ...(hoveredCard === 'card3' ? styles.cardHover : {})
            }}
            onMouseEnter={() => setHoveredCard('card3')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.cardIcon}>
              <span className="material-symbols-outlined" style={{...styles.iconStyle, color: '#D4B5D4'}}>
                draw_collage
              </span>
            </div>
            <h3 style={styles.cardTitle}>Diseños Profesionales</h3>
            <p style={styles.cardDescription}>
              Nuestros productos están diseñados para ayudarte a destacar. Desde documentos formales hasta creativos, todos listos para que los personalices y adaptes a tu estilo.
            </p>
          </div>

          <div 
            style={{
              ...styles.card,
              ...(hoveredCard === 'card4' ? styles.cardHover : {})
            }}
            onMouseEnter={() => setHoveredCard('card4')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.cardIcon}>
              <span className="material-symbols-outlined" style={{...styles.iconStyle, color: '#FFB5C1'}}>
                credit_card_heart
              </span>
            </div>
            <h3 style={styles.cardTitle}>Compra Segura</h3>
            <p style={styles.cardDescription}>
              Tu seguridad es nuestra prioridad. Nuestra plataforma garantiza un proceso de compra seguro y confiable para que solo te preocupes por elegir lo que más te guste.
            </p>
          </div>
        </div>
      </section>

      {/* Acerca de Section */}
      <section id="about" style={styles.acercaDeSection}>
        <div style={styles.acercaDeContainer}>
          {/* Header Section */}
          <div style={styles.acercaDeHeader}>
            <p style={styles.acercaDeCategoryLabel}>• ACERCA DE</p>
            <h2 style={styles.acercaDeSectionTitle}>
              Templi es un espacio para <span style={styles.hacemosUnderline}>compartir</span> y <span style={styles.porqueUnderline}>descubrir</span>
            </h2>
          </div>

          {/* Description Section */}
          <div style={styles.acercaDeContent}>
            <p style={styles.acercaDeSectionDescription}>
              Conoce un lugar hecho para que comprar o vender contenido digital sea sencillo. Ya sea que busques recursos listos para descargar o quieras vender tus propios archivos, aquí todo es fácil, rápido y accesible. Desde PDFs hasta plantillas editables e imágenes, creemos que cada archivo tiene un valor y puede llegar a quien lo necesita.
            </p>

            {/* Quote Section */}
            <blockquote style={styles.quote}>
              ❝Ya seas estudiante, emprendedor o creativo digital, aquí hay algo para ti.❞
            </blockquote>

            {/* About Cards Image */}
            <div style={styles.aboutImageContainer}>
              <img 
                src="/images/about-cards.png" 
                alt="Acerca de Templi" 
                style={styles.aboutImage}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          © 2025 Templi. Todos los derechos reservados.
        </p>
      </footer>
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

  // Header - Actualizado
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(250, 250, 250, 0.8)',
    backdropFilter: 'blur(20px)',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Logo Container
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
  },

  logoImage: {
    height: '32px',
    width: 'auto',
    objectFit: 'contain',
  },

  // Navigation Container
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

  // Login Button
  loginButton: {
    backgroundColor: '#1d1d1f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '16px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  loginButtonHover: {
    backgroundColor: '#424245',
    transform: 'translateY(-1px)',
  },

  // Hero Section - Full width background
  heroSection: {
    width: '100%',
    background: `
      linear-gradient(to bottom, rgba(250, 250, 250, 1) 0%, rgba(250, 250, 250, 0.95) 15%, rgba(250, 250, 250, 0.9) 25%, transparent 35%),
      linear-gradient(135deg, rgba(250, 250, 250, 0.9) 0%, rgba(254, 174, 227, 0.25) 25%, rgba(244, 227, 145, 0.3) 50%, rgba(168, 218, 220, 0.25) 75%, rgba(250, 250, 250, 0.9) 100%)
    `,
    paddingTop: '120px',
    paddingBottom: '80px',
  },

  // Main Content - Centrado
  main: {
    paddingLeft: '24px',
    paddingRight: '24px',
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 200px)',
    textAlign: 'center',
  },

  heroContent: {
    maxWidth: '600px',
    width: '100%',
  },

  // Magic Icon - Con animación
  magicIcon: {
    fontSize: '64px',
    color: '#1d1d1f',
    display: 'block',
    marginBottom: '24px',
    animation: 'float 3s ease-in-out infinite',
  },

  headline: {
    fontSize: '56px',
    fontWeight: '600',
    lineHeight: '1.1',
    margin: '0 0 32px 0',
    letterSpacing: '-1.5px',
    color: '#1d1d1f',
  },

  headlineAccent: {
    color: '#86868b',
  },

  // Wavy Line Decoration
  wavyLine: {
    display: 'flex',
    justifyContent: 'center',
    margin: '16px 0 24px 0',
    opacity: 0.8,
  },

  subtitle: {
    fontSize: '18px',
    fontWeight: '400',
    color: '#86868b',
    lineHeight: '1.3',
    maxWidth: '500px',
    margin: '0 auto 48px auto',
  },

  ctaButton: {
    backgroundColor: '#1d1d1f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '20px',
    padding: '12px 28px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '32px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },

  ctaButtonHover: {
    backgroundColor: '#424245',
    transform: 'translateY(-1px)',
  },

  buttonText: {
    color: '#ffffff',
  },

  buttonIcon: {
    fontSize: '18px',
    color: '#ffffff',
  },

  secondaryInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
  },

  infoText: {
    fontSize: '12px',
    color: '#86868b',
    fontWeight: '400',
  },

  separator: {
    fontSize: '12px',
    color: '#d2d2d7',
  },

  // Nueva Sección de Características
  caracteristicasSection: {
    padding: '100px 80px',
    maxWidth: '1200px',
    margin: '0 auto',
    borderTop: '1px solid rgba(0, 0, 0, 0.05)',
  },

  caracteristicasContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    alignItems: 'flex-start',
    marginBottom: '80px', // ← Espacio antes de las tarjetas
  },

  // Lado Izquierdo
  leftContent: {
    textAlign: 'left',
  },

  categoryLabel: {
    fontSize: '12px',
    color: '#86868b',
    fontWeight: '500',
    margin: '0 0 8px 0', // ← Reducido de 16px a 8px para menos espacio
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },

  sectionTitle: {
    fontSize: '32px', // ← Reducido de 40px a 32px
    fontWeight: '600',
    lineHeight: '1.2',
    margin: '0',
    color: '#1d1d1f',
    letterSpacing: '-1px',
  },

  // Lado Derecho
  rightContent: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    textAlign: 'left', // ← Agregado para alinear texto a la izquierda
  },

  sectionDescription: {
    fontSize: '16px', // ← Mantenido igual para equilibrar con el título más pequeño
    color: '#86868b',
    lineHeight: '1.5',
    margin: '0',
    fontWeight: '400',
    textAlign: 'left', // ← Asegurar alineación a la izquierda
  },

  // Tarjetas de Características
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)', // ← 4 columnas
    gap: '24px',
    marginTop: '40px',
  },

  card: {
    backgroundColor: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'left',
    transition: 'all 0.3s ease', // ← Transición suave
    cursor: 'pointer', // ← Cambiado de 'default' a 'pointer'
    transform: 'scale(1)', // ← Tamaño inicial
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)', // ← Sombra sutil para definir las tarjetas
  },

  // Nuevo: Efecto hover para las tarjetas
  cardHover: {
    transform: 'scale(1.02)', // ← Crecer 2%
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)', // ← Sombra más pronunciada
  },

  cardIcon: {
    marginBottom: '16px',
  },

  iconStyle: {
    fontSize: '40px',
    color: '#1d1d1f',
  },

  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1d1d1f',
    margin: '0 0 12px 0',
    lineHeight: '1.3',
  },

  cardDescription: {
    fontSize: '14px',
    color: '#86868b',
    lineHeight: '1.4',
    margin: '0',
    fontWeight: '400',
  },

  // Acerca de Section
  acercaDeSection: {
    padding: '100px 80px',
    maxWidth: '1200px',
    margin: '0 auto',
    borderTop: '1px solid rgba(0, 0, 0, 0.05)',
  },

  acercaDeContainer: {
    display: 'block',
    marginBottom: '60px',
  },

  // Header Section - Acerca de
  acercaDeHeader: {
    textAlign: 'left',
    marginBottom: '24px',
  },

  // Content Section - Acerca de
  acercaDeContent: {
    textAlign: 'left',
  },

  acercaDeCategoryLabel: {
    fontSize: '12px',
    color: '#86868b',
    fontWeight: '500',
    margin: '0 0 8px 0',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },

  acercaDeSectionTitle: {
    fontSize: '32px',
    fontWeight: '600',
    lineHeight: '1.2',
    margin: '0',
    color: '#1d1d1f',
    letterSpacing: '-1px',
  },

  acercaDeSectionDescription: {
    fontSize: '16px',
    color: '#86868b',
    lineHeight: '1.5',
    margin: '0',
    fontWeight: '400',
    textAlign: 'left',
    maxWidth: '100%',
  },

  // Underline styles for title words
  hacemosUnderline: {
    borderBottom: '4px solid #F4E391',
    paddingBottom: '2px',
  },

  porqueUnderline: {
    borderBottom: '4px solid #FEAEE3',
    paddingBottom: '2px',
  },

  quote: {
    fontSize: '18px',
    fontWeight: '400',
    color: '#1d1d1f',
    fontStyle: 'normal',
    margin: '24px 0 0 0',
    lineHeight: '1.4',
    maxWidth: '100%',
    paddingLeft: '0',
  },

  // About Cards Image Styles
  aboutImageContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '40px',
    width: '100%',
  },

  aboutImage: {
    maxWidth: '70%',
    height: 'auto',
  },

  // Footer
  footer: {
    padding: '40px 24px',
    textAlign: 'center',
    borderTop: '1px solid rgba(0, 0, 0, 0.05)',
  },

  footerText: {
    fontSize: '12px',
    color: '#86868b',
    margin: 0,
  },

  // Nuevo: Botón de perfil del usuario
  userGreeting: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'rgba(29, 29, 31, 0.05)',
    borderRadius: '16px',
    border: '1px solid rgba(29, 29, 31, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  userGreetingHover: {
    backgroundColor: 'rgba(29, 29, 31, 0.08)',
    transform: 'translateY(-1px)',
  },

  profileIcon: {
    fontSize: '16px',
    color: '#86868b',
  },

  greetingText: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#1d1d1f',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  moodIcon: {
    fontSize: '16px',
    color: '#000000ff' // Mismo color que el magic icon
  },

  // Responsive
  '@media (max-width: 768px)': {
    header: {
      padding: '12px 16px',
    },
    
    logoImage: {
      height: '28px',
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
    
    loginButton: {
      padding: '6px 12px',
      fontSize: '11px',
    },
    
    heroSection: {
      paddingTop: '100px',
      paddingBottom: '60px',
      background: `
        linear-gradient(to bottom, rgba(250, 250, 250, 1) 0%, rgba(250, 250, 250, 0.95) 15%, rgba(250, 250, 250, 0.9) 25%, transparent 35%),
        linear-gradient(135deg, rgba(250, 250, 250, 0.9) 0%, rgba(254, 174, 227, 0.25) 25%, rgba(244, 227, 145, 0.3) 50%, rgba(168, 218, 220, 0.25) 75%, rgba(250, 250, 250, 0.9) 100%)
      `,
    },
    
    main: {
      paddingTop: '0px',
      paddingBottom: '0px',
    },
    
    magicIcon: {
      fontSize: '56px',
      marginBottom: '20px',
      animation: 'float 3s ease-in-out infinite',
    },
    
    headline: {
      fontSize: '42px',
    },
    
    subtitle: {
      fontSize: '16px',
      margin: '0 auto 40px auto',
    },
    
    ctaButton: {
      padding: '10px 24px',
      fontSize: '13px',
    },

    // Responsive para Características
    caracteristicasSection: {
      padding: '60px 32px',
    },

    caracteristicasContainer: {
      gridTemplateColumns: '1fr',
      gap: '32px',
      marginBottom: '60px', // ← Menos espacio en móvil
    },

    // Tarjetas responsive
    cardsContainer: {
      gridTemplateColumns: '1fr', // ← Una columna en móvil
      gap: '20px',
      marginTop: '32px',
    },

    card: {
      padding: '20px',
      textAlign: 'center', // ← Centrado en móvil
    },

    iconStyle: {
      fontSize: '36px',
    },

    cardTitle: {
      fontSize: '15px',
      margin: '0 0 10px 0',
    },

    cardDescription: {
      fontSize: '13px',
    },

    // Responsive para Acerca de
    acercaDeSection: {
      padding: '60px 32px',
    },

    acercaDeContainer: {
      marginBottom: '60px',
    },

    acercaDeHeader: {
      marginBottom: '20px',
    },

    acercaDeSectionTitle: {
      fontSize: '28px',
    },

    acercaDeSectionDescription: {
      fontSize: '15px',
    },

    quote: {
      fontSize: '17px',
      margin: '20px 0 0 0',
    },

    // Responsive para About Image
    aboutImageContainer: {
      marginTop: '32px',
    },

    aboutImage: {
      maxWidth: '80%',
    },

    // Responsive para tablet
    '@media (max-width: 1024px) and (min-width: 769px)': {
      cardsContainer: {
        gridTemplateColumns: 'repeat(2, 1fr)', // ← 2 columnas en tablet
        gap: '20px',
      },
    },
  },
};

export default LandingPage;
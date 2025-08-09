import React, { useState, useEffect } from 'react';
import { getArchivoById, descargarArchivo } from '../services/archivosService';
import { getImagenesArchivoByFileId } from '../services/imagenesArchivoService';
import { getUsuarioById } from '../services/usuariosService';
import { getCategoriasArchivo } from '../services/categoriaArchivoService';
import { getExtensionesArchivo } from '../services/extensionArchivoService';

const ArchivoDetalle = ({ archivoId, onBackToMarketplace, user, onProfileClick, onLoginClick }) => {
  const [archivo, setArchivo] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [vendedor, setVendedor] = useState(null);
  const [categoria, setCategoria] = useState(null);
  const [extension, setExtension] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const loadArchivoDetalle = async () => {
      try {
        setLoading(true);
        
        // Cargar datos del archivo
        const archivoData = await getArchivoById(archivoId);
        setArchivo(archivoData);

        // Cargar datos relacionados en paralelo
        const [imagenesData, categoriasData, extensionesData] = await Promise.all([
          getImagenesArchivoByFileId(archivoId).catch(() => []),
          getCategoriasArchivo().catch(() => []),
          getExtensionesArchivo().catch(() => [])
        ]);

        // Las imágenes ya están filtradas del archivo actual
        setImagenes(imagenesData);

        // Encontrar categoría
        const categoriaArchivo = categoriasData.find(cat => cat.id_categoria_archivo === archivoData.id_categoria_archivo);
        setCategoria(categoriaArchivo);

        // Encontrar extensión
        const extensionArchivo = extensionesData.find(ext => ext.id_extension_archivo === archivoData.id_extension_archivo);
        setExtension(extensionArchivo);

        // Cargar datos del vendedor
        if (archivoData.id_usuario) {
          const vendedorData = await getUsuarioById(archivoData.id_usuario);
          setVendedor(vendedorData);
        }

      } catch (error) {
        console.error('Error cargando detalles del archivo:', error);
      } finally {
        setLoading(false);
      }
    };

    if (archivoId) {
      loadArchivoDetalle();
    }
  }, [archivoId]);

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? Math.max(imagenes.length - 1, 0) : prev - 1
    );
    setImageError(false);
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === imagenes.length - 1 ? 0 : prev + 1
    );
    setImageError(false);
  };

  const handlePayPalPayment = () => {
    if (!user) {
      alert('Debes iniciar sesión para realizar una compra');
      return;
    }

    // TODO: Implementar integración real con PayPal
    // Por ahora mostraremos un placeholder
    alert(`Redirigiendo a PayPal para comprar "${archivo.nombre_archivo}" por $${parseFloat(archivo.precio).toFixed(2)}`);
  };

  const handleDownload = async () => {
    if (!user) {
      alert('Debes iniciar sesión para descargar archivos');
      return;
    }

    try {
      setIsDownloading(true);
      
      // TEMPORAL: Permitir descarga sin verificar compra para pruebas
      // En producción aquí verificaremos si el usuario ya compró el archivo
      const haComprado = true; // TODO: Implementar verificación de compra real
      
      if (!haComprado) {
        alert('Debes comprar el archivo antes de poder descargarlo');
        return;
      }

      // Descargar archivo
      const result = await descargarArchivo(archivo.id_archivo, archivo.nombre_archivo);
      console.log('Descarga exitosa:', result.fileName);
      
      // Opcional: Mostrar mensaje de éxito
      alert(`Descarga de "${result.fileName}" iniciada correctamente`);
      
    } catch (error) {
      console.error('Error en descarga:', error);
      alert(`Error al descargar el archivo: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const getCurrentImageUrl = () => {
    if (imagenes.length > 0 && imagenes[currentImageIndex]) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/uploads/${imagenes[currentImageIndex].url_imagen}`;
    }
    if (archivo?.imagen_portada) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/uploads/${archivo.imagen_portada}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <span className="material-symbols-outlined" style={styles.loadingIcon}>refresh</span>
          Cargando detalles...
        </div>
      </div>
    );
  }

  if (!archivo) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <span className="material-symbols-outlined" style={styles.errorIcon}>error</span>
          <h3 style={styles.errorTitle}>Archivo no encontrado</h3>
          <p style={styles.errorText}>El archivo que buscas no existe o ya no está disponible.</p>
          <button onClick={onBackToMarketplace} style={styles.backButton}>
            Volver al Marketplace
          </button>
        </div>
      </div>
    );
  }

  const totalImages = imagenes.length + (archivo.imagen_portada ? 1 : 0);
  const hasMultipleImages = totalImages > 1;

  return (
    <div style={styles.container}>
      {/* Navigation Header - Igual que en Marketplace */}
      <header style={styles.header}>
        {/* Logo */}
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
            <button onClick={onBackToMarketplace} style={styles.navLink}>
              Marketplace
            </button>
          </nav>
          
          {/* User Greeting o Login Button */}
          {user ? (
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

      {/* Main Content */}
      <main style={styles.main}>
        {/* Back to Marketplace Link */}
        <button onClick={onBackToMarketplace} style={styles.backToMarketplace}>
          ← Regresar al marketplace
        </button>

        <div style={styles.contentGrid}>
          {/* Left Column - Image Carousel */}
          <div style={styles.imageSection}>
            <div style={styles.imageContainer}>
              {getCurrentImageUrl() && !imageError ? (
                <img
                  src={getCurrentImageUrl()}
                  alt={archivo.nombre_archivo}
                  style={styles.mainImage}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div style={styles.imagePlaceholder}>
                  <span className="material-symbols-outlined" style={styles.placeholderIcon}>
                    description
                  </span>
                  <p style={styles.placeholderText}>Vista previa no disponible</p>
                </div>
              )}

              {/* Navigation Arrows */}
              {hasMultipleImages && !imageError && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    style={{...styles.navButton, ...styles.prevButton}}
                  >
                    <span className="material-symbols-outlined">keyboard_arrow_left</span>
                  </button>
                  <button 
                    onClick={handleNextImage}
                    style={{...styles.navButton, ...styles.nextButton}}
                  >
                    <span className="material-symbols-outlined">keyboard_arrow_right</span>
                  </button>
                </>
              )}

              {/* Image Counter */}
              {hasMultipleImages && (
                <div style={styles.imageCounter}>
                  {currentImageIndex + 1} / {totalImages}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {hasMultipleImages && (
              <div style={styles.thumbnailStrip}>
                {archivo.imagen_portada && (
                  <button
                    onClick={() => {setCurrentImageIndex(0); setImageError(false);}}
                    style={{
                      ...styles.thumbnail,
                      ...(currentImageIndex === 0 ? styles.activeThumbnail : {})
                    }}
                  >
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/uploads/${archivo.imagen_portada}`}
                      alt="Portada"
                      style={styles.thumbnailImage}
                    />
                  </button>
                )}
                {imagenes.map((imagen, index) => {
                  const thumbnailIndex = archivo.imagen_portada ? index + 1 : index;
                  return (
                    <button
                      key={imagen.id_imagenes_archivo}
                      onClick={() => {setCurrentImageIndex(thumbnailIndex); setImageError(false);}}
                      style={{
                        ...styles.thumbnail,
                        ...(currentImageIndex === thumbnailIndex ? styles.activeThumbnail : {})
                      }}
                    >
                      <img
                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/uploads/${imagen.url_imagen}`}
                        alt={`Vista ${index + 1}`}
                        style={styles.thumbnailImage}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column - Product Details */}
          <div style={styles.detailsSection}>
            {/* Vendedor */}
            <p style={styles.vendorName}>
              {vendedor ? `${vendedor.nombre} ${vendedor.apellido}` : 'Información no disponible'}
            </p>

            {/* Nombre del Producto */}
            <h1 style={styles.productTitle}>{archivo.nombre_archivo}</h1>

            {/* Categoría y Extensión */}
            <p style={styles.categoryExtension}>
              {categoria?.nombre?.toUpperCase() || 'SIN CATEGORÍA'} • {extension?.nombre?.toUpperCase() || 'N/A'}
            </p>

            {/* Precio */}
            <div style={styles.priceContainer}>
              <span style={styles.price}>${parseFloat(archivo.precio).toFixed(2)}</span>
            </div>

            {/* Description */}
            {archivo.descripcion && (
              <div style={styles.descriptionSection}>
                <h3 style={styles.descriptionTitle}>Descripción</h3>
                <p style={styles.descriptionText}>{archivo.descripcion}</p>
              </div>
            )}

            {/* Additional Info */}
            {archivo.tamaño_archivo && (
              <div style={styles.sizeInfo}>
                <span style={styles.sizeLabel}>Tamaño del archivo: </span>
                <span style={styles.sizeValue}>
                  {(parseFloat(archivo.tamaño_archivo) / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}

            {/* Purchase Section */}
            <div style={styles.purchaseSection}>
              <button 
                onClick={handlePayPalPayment}
                style={styles.paypalButton}
                disabled={!user}
              >
                <span style={styles.paypalIcon}>💳</span>
                Comprar con PayPal
              </button>
              
              <button 
                onClick={handleDownload}
                style={{
                  ...styles.downloadButton,
                  ...(isDownloading ? styles.downloadButtonDisabled : {})
                }}
                disabled={!user || isDownloading}
              >
                <span style={styles.downloadIcon}>
                  {isDownloading ? '⏳' : '⬇️'}
                </span>
                {isDownloading ? 'Descargando...' : 'Descargar Archivo'}
              </button>
              
              {!user && (
                <p style={styles.loginPrompt}>
                  Debes <strong>iniciar sesión</strong> para realizar una compra o descarga
                </p>
              )}
            </div>

            {/* Security Info */}
            <div style={styles.securityInfo}>
              <p style={styles.securityText}>
                🔒 <strong>Compra segura</strong> - Transacción protegida por PayPal
              </p>
              <p style={styles.securityText}>
                ⬇️ <strong>Descarga inmediata</strong> - Acceso al archivo tras completar el pago
              </p>
              <p style={styles.securityText}>
                📁 <strong>Archivo original</strong> - Descarga directa del archivo del vendedor
              </p>
            </div>
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

  // Header - Igual que Marketplace
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
    background: 'none',
    border: 'none',
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

  // Botón de perfil del usuario
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

  greetingText: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#1d1d1f',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  main: {
    paddingTop: '100px',
    paddingBottom: '60px',
    paddingLeft: '24px',
    paddingRight: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },

  backToMarketplace: {
    background: 'none',
    border: 'none',
    color: '#86868b',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '400',
    marginBottom: '32px',
    padding: 0,
    textAlign: 'left',
    display: 'block',
    width: 'fit-content',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '48px',
    alignItems: 'start',
  },

  // Image Section
  imageSection: {
    position: 'sticky',
    top: '140px',
  },

  imageContainer: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    marginBottom: '16px',
  },

  mainImage: {
    width: '100%',
    height: '400px',
    objectFit: 'cover',
    display: 'block',
  },

  imagePlaceholder: {
    width: '100%',
    height: '400px',
    backgroundColor: '#f5f5f7',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },

  placeholderIcon: {
    fontSize: '64px',
    color: '#d1d1d6',
  },

  placeholderText: {
    fontSize: '14px',
    color: '#86868b',
    margin: 0,
  },

  navButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0, 0, 0, 0.5)',
    border: 'none',
    color: '#fff',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    fontSize: '20px',
  },

  prevButton: {
    left: '16px',
  },

  nextButton: {
    right: '16px',
  },

  imageCounter: {
    position: 'absolute',
    bottom: '16px',
    right: '16px',
    background: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },

  thumbnailStrip: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    padding: '8px 0',
  },

  thumbnail: {
    border: '2px solid transparent',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
    flexShrink: 0,
    background: 'none',
    padding: 0,
  },

  activeThumbnail: {
    borderColor: '#007aff',
  },

  thumbnailImage: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    display: 'block',
  },

  // Details Section - Sin cajas, solo texto
  detailsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    textAlign: 'left',
  },

  vendorName: {
    fontSize: '14px',
    color: '#86868b',
    margin: 0,
    fontWeight: '400',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  productTitle: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#1d1d1f',
    margin: '8px 0',
    lineHeight: '1.2',
    textAlign: 'left',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  categoryExtension: {
    fontSize: '13px',
    color: '#86868b',
    margin: '0 0 16px 0',
    fontWeight: '500',
    letterSpacing: '0.5px',
    textAlign: 'left',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  priceContainer: {
    marginBottom: '32px',
  },

  price: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1d1d1f',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  descriptionSection: {
    marginBottom: '24px',
  },

  descriptionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1d1d1f',
    margin: '0 0 12px 0',
    textAlign: 'left',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  descriptionText: {
    fontSize: '14px',
    color: '#515154',
    lineHeight: '1.6',
    margin: 0,
    textAlign: 'left',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  sizeInfo: {
    marginBottom: '24px',
  },

  sizeLabel: {
    fontSize: '14px',
    color: '#86868b',
    fontWeight: '400',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  sizeValue: {
    fontSize: '14px',
    color: '#1d1d1f',
    fontWeight: '500',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  purchaseSection: {
    marginBottom: '32px',
  },

  paypalButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '16px 24px',
    backgroundColor: '#0070ba',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginBottom: '12px',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  paypalIcon: {
    fontSize: '20px',
  },

  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '16px 24px',
    backgroundColor: '#34c759',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '12px',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  downloadButtonDisabled: {
    backgroundColor: '#86868b',
    cursor: 'not-allowed',
  },

  downloadIcon: {
    fontSize: '20px',
  },

  loginPrompt: {
    fontSize: '12px',
    color: '#86868b',
    margin: 0,
    textAlign: 'center',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  securityInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  securityText: {
    fontSize: '12px',
    color: '#86868b',
    margin: 0,
    textAlign: 'left',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Loading and Error States
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    gap: '12px',
    fontSize: '14px',
    color: '#86868b',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  loadingIcon: {
    fontSize: '24px',
    animation: 'spin 1s linear infinite',
  },

  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    gap: '16px',
    textAlign: 'center',
    padding: '24px',
  },

  errorIcon: {
    fontSize: '48px',
    color: '#ff3b30',
  },

  errorTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1d1d1f',
    margin: 0,
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  errorText: {
    fontSize: '14px',
    color: '#86868b',
    margin: 0,
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  backButton: {
    padding: '12px 24px',
    backgroundColor: '#007aff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
    
    main: {
      paddingLeft: '16px',
      paddingRight: '16px',
    },

    contentGrid: {
      gridTemplateColumns: '1fr',
      gap: '24px',
    },

    productTitle: {
      fontSize: '24px',
    },

    price: {
      fontSize: '20px',
    },
  },
};

export default ArchivoDetalle;

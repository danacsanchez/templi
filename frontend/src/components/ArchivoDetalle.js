import React, { useState, useEffect } from 'react';
import { getArchivoById, descargarArchivo } from '../services/archivosService';
import { getImagenesArchivoByFileId } from '../services/imagenesArchivoService';
import { getUsuarioById } from '../services/usuariosService';
import { getCategoriasArchivo } from '../services/categoriaArchivoService';
import { getExtensionesArchivo } from '../services/extensionArchivoService';
import PayPalCheckout from './PayPalCheckout';

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
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  
  // Estados para PayPal checkout
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);

  useEffect(() => {
    const loadArchivoDetalle = async () => {
      try {
        setLoading(true);
        
        // Cargar datos del archivo
        const archivoData = await getArchivoById(archivoId);
        console.log('Datos del archivo obtenidos:', archivoData);
        setArchivo(archivoData);

        // Los datos del vendedor ya vienen en la respuesta del archivo
        if (archivoData.vendedor_nombre) {
          setVendedor({
            nombre: archivoData.vendedor_nombre,
            apellido: '' // El backend solo devuelve el nombre completo en vendedor_nombre
          });
        }

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
      alert('Debes iniciar sesión para comprar archivos');
      return;
    }

    // Abrir modal de checkout de PayPal
    setShowCheckout(true);
  };

  const handlePaymentSuccess = (details) => {
    console.log('Pago completado exitosamente:', details);
    setTransactionDetails(details);
    setPaymentSuccess(true);
    setShowCheckout(false);
    
    // Mostrar mensaje de éxito
    alert(`¡Compra exitosa! Tu archivo se ha descargado automáticamente.`);
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
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
            {/* Vendedor con icono */}
            <div style={styles.vendorContainer}>
              <span className="material-symbols-outlined" style={styles.storeIcon}>storefront</span>
              <p style={styles.vendorName}>
                {archivo.vendedor_nombre || 'Información no disponible'}
              </p>
            </div>

            {/* Nombre del Producto */}
            <h1 style={styles.productTitle}>{archivo.nombre_archivo}</h1>

            {/* Precio */}
            <div style={styles.priceContainer}>
              <span style={styles.price}>${parseFloat(archivo.precio).toFixed(2)}</span>
            </div>

            {/* Categoría y Extensión */}
            <div style={styles.categoryExtensionContainer}>
              <div style={styles.categoryTag}>
                {categoria?.nombre?.toUpperCase() || 'SIN CATEGORÍA'}
              </div>
              <span style={styles.formatText}>
                FORMATO: {extension?.nombre?.toUpperCase() || 'N/A'}
              </span>
            </div>

            {/* Description Dropdown */}
            {archivo.descripcion && (
              <div style={styles.descriptionSection}>
                <button 
                  onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                  style={styles.descriptionToggle}
                >
                  <span style={styles.descriptionTitle}>Descripción</span>
                  <span 
                    className="material-symbols-outlined" 
                    style={{
                      ...styles.dropdownIcon,
                      transform: isDescriptionOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  >
                    keyboard_arrow_down
                  </span>
                </button>
                {isDescriptionOpen && (
                  <p style={styles.descriptionText}>{archivo.descripcion}</p>
                )}
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
              
              <div style={styles.downloadContainer}>
                <button 
                  onClick={handleDownload}
                  style={{
                    ...styles.buyButton,
                    ...(isDownloading ? styles.buyButtonDisabled : {})
                  }}
                  disabled={!user || isDownloading}
                >
                  <span className="material-symbols-outlined" style={styles.buyIcon}>shopping_cart</span>
                  Comprar con PayPal
                </button>
                
                <button style={styles.favoriteButton}>
                  <span className="material-symbols-outlined" style={styles.favoriteIcon}>
                    favorite
                  </span>
                </button>
              </div>
              
              {!user && (
                <p style={styles.loginPrompt}>
                  Debes <strong>iniciar sesión</strong> para realizar una compra o descarga
                </p>
              )}
            </div>

            {/* Security Info */}
            <div style={styles.securityInfo}>
              <div style={styles.securityItem}>
                <span className="material-symbols-outlined" style={styles.securityIcon}>lock</span>
                <span style={styles.securityText}>
                  Realiza tus compras con total tranquilidad gracias a la protección de PayPal, que garantiza que tu pago esté seguro y que puedas resolver cualquier inconveniente de forma sencilla.
                </span>
              </div>
              <div style={styles.securityItem}>
                <span className="material-symbols-outlined" style={styles.securityIcon}>hand_package</span>
                <span style={styles.securityText}>
                  Una vez que tu pago se confirme, recibirás acceso inmediato para descargar tu archivo, sin esperas ni pasos adicionales, listo para que lo uses al instante.
                </span>
              </div>
              <div style={styles.securityItem}>
                <span className="material-symbols-outlined" style={styles.securityIcon}>verified</span>
                <span style={styles.securityText}>
                  Descarga directamente el archivo original tal como el vendedor lo publicó, asegurando que obtengas el contenido exacto, completo y en la mejor calidad disponible.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* PayPal Checkout Modal */}
      {showCheckout && archivo && (
        <PayPalCheckout
          archivo={archivo}
          user={user}
          onClose={handleCloseCheckout}
          onSuccess={handlePaymentSuccess}
        />
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
    gap: '12px', // Reducido de 16px a 12px
    textAlign: 'left',
  },

  vendorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px', // Agregado pequeño margen
  },

  storeIcon: {
    fontSize: '16px',
    color: '#86868b',
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
    margin: '4px 0', // Reducido de 8px a 4px
    lineHeight: '1.2',
    textAlign: 'left',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  priceContainer: {
    marginBottom: '8px', // Reducido de 16px a 8px
  },

  price: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#70AD47',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  categoryExtensionContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px', // Reducido de 24px a 16px
  },

  categoryTag: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #86868b',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#86868b',
    letterSpacing: '0.5px',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  formatText: {
    fontSize: '13px',
    color: '#86868b',
    fontWeight: '500',
    letterSpacing: '0.5px',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  descriptionSection: {
    marginBottom: '24px',
  },

  descriptionToggle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '12px 0',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  },

  descriptionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1d1d1f',
    textAlign: 'left',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  dropdownIcon: {
    fontSize: '24px',
    color: '#86868b',
    transition: 'transform 0.2s ease',
  },

  descriptionText: {
    fontSize: '14px',
    color: '#515154',
    lineHeight: '1.6',
    margin: '12px 0 0 0',
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

  downloadContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '12px',
  },

  buyButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px 24px',
    backgroundColor: '#1d1d1f',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  buyButtonDisabled: {
    backgroundColor: '#86868b',
    cursor: 'not-allowed',
  },

  buyIcon: {
    fontSize: '18px',
    marginRight: '8px',
  },

  favoriteButton: {
    width: '52px',
    height: '52px',
    backgroundColor: '#f5f5f7',
    border: 'none',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },

  favoriteIcon: {
    fontSize: '24px',
    color: '#86868b',
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
    gap: '16px',
  },

  securityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  securityIcon: {
    fontSize: '24px',
    color: '#86868b',
    flexShrink: 0,
  },

  securityText: {
    fontSize: '13px', // Aumenté de 12px a 14px
    color: '#86868b',
    margin: 0,
    textAlign: 'left',
    lineHeight: '1.5',
    flex: 1,
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

import React, { useState, useEffect } from 'react';
import { getArchivos } from '../services/archivosService';
import { getCategoriasArchivo } from '../services/categoriaArchivoService';

const Marketplace = ({ user, onBackToHome, onProfileClick, onLoginClick, onArchivoClick }) => {
  const [archivos, setArchivos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const itemsPerPage = 12;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [archivosData, categoriasData] = await Promise.all([
          getArchivos(),
          getCategoriasArchivo()
        ]);
        
        // Solo mostrar archivos activos
        const archivosActivos = archivosData?.filter(archivo => archivo.activo === true) || [];
        setArchivos(archivosActivos);
        setCategorias(categoriasData || []);
      } catch (error) {
        console.error('Error cargando datos del marketplace:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Función helper para obtener nombre de categoría
  const getCategoriaNombreById = (id) => {
    const categoria = categorias.find(c => c.id_categoria_archivo === id);
    return categoria ? categoria.nombre : 'Sin categoría';
  };

  // Filtrar archivos según búsqueda y categoría
  const filteredArchivos = archivos.filter(archivo => {
    const matchesSearch = archivo.nombre_archivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         archivo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !categoriaFilter || archivo.id_categoria_archivo?.toString() === categoriaFilter;
    
    return matchesSearch && matchesCategoria;
  });

  // Paginación
  const totalPages = Math.ceil(filteredArchivos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentArchivos = filteredArchivos.slice(startIndex, startIndex + itemsPerPage);

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoriaFilter]);

  const handleComprar = (archivo) => {
    if (!user) {
      // Si no está logueado, mostrar mensaje para registrarse
      alert('Para comprar archivos necesitas crear una cuenta. ¡Regístrate gratis!');
      return;
    }
    // Navegar a la página de detalles del archivo
    onArchivoClick(archivo.id_archivo);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <span className="material-symbols-outlined" style={styles.loadingIcon}>refresh</span>
          Cargando marketplace...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Navigation Header */}
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
            <button onClick={onBackToHome} style={styles.navLink}>
              Inicio
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
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Marketplace de archivos digitales</h1>
          <p style={styles.pageSubtitle}>
            Encuentra contenido útil creado por vendedores de nuestra comunidad.
          </p>
          <div style={styles.resultsCount}>
            {filteredArchivos.length} productos encontrados
          </div>
        </div>

        {/* Search and Filters */}
        <div style={styles.filtersContainer}>
          {/* Search Bar */}
          <div style={styles.searchContainer}>
            <span className="material-symbols-outlined" style={styles.searchIcon}>search</span>
            <input
              type="text"
              placeholder="Buscar archivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
            style={styles.categorySelect}
          >
            <option value="">Categorías</option>
            {categorias.map(categoria => (
              <option key={categoria.id_categoria_archivo} value={categoria.id_categoria_archivo}>
                {categoria.nombre.charAt(0).toUpperCase() + categoria.nombre.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        {currentArchivos.length > 0 ? (
          <>
            <div style={styles.productsGrid}>
              {currentArchivos.map(archivo => (
                <div 
                  key={archivo.id_archivo} 
                  style={styles.productCard}
                  onClick={() => handleComprar(archivo)}
                >
                  {/* Image Container */}
                  <div style={styles.imageContainer}>
                    {archivo.imagen_portada ? (
                      <img
                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/uploads/${archivo.imagen_portada}`}
                        alt={archivo.nombre_archivo}
                        style={styles.productImage}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {/* Fallback placeholder */}
                    <div 
                      style={{
                        ...styles.imagePlaceholder,
                        display: archivo.imagen_portada ? 'none' : 'flex'
                      }}
                    >
                      <span className="material-symbols-outlined" style={styles.placeholderIcon}>
                        description
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div style={styles.productInfo}>
                    <div style={styles.productHeader}>
                      <div style={styles.productTextContainer}>
                        <h3 style={styles.productName}>{archivo.nombre_archivo}</h3>
                        <p style={styles.productCategory}>
                          {getCategoriaNombreById(archivo.id_categoria_archivo)}
                        </p>
                      </div>
                      <span style={styles.productPrice}>
                        ${parseFloat(archivo.precio).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={styles.paginationContainer}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    ...styles.paginationButton,
                    ...(currentPage === 1 ? styles.disabledButton : {})
                  }}
                >
                  <span className="material-symbols-outlined">keyboard_arrow_left</span>
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        ...styles.pageNumber,
                        ...(currentPage === pageNum ? styles.activePageNumber : {})
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    ...styles.paginationButton,
                    ...(currentPage === totalPages ? styles.disabledButton : {})
                  }}
                >
                  <span className="material-symbols-outlined">keyboard_arrow_right</span>
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div style={styles.emptyState}>
            <span className="material-symbols-outlined" style={styles.emptyStateIcon}>
              search_off
            </span>
            <h3 style={styles.emptyStateTitle}>No se encontraron productos</h3>
            <p style={styles.emptyStateText}>
              {searchTerm || categoriaFilter 
                ? 'Intenta ajustar tus filtros de búsqueda'
                : 'No hay productos disponibles en este momento'
              }
            </p>
          </div>
        )}
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

  // Header - Igual que Landing Page
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

  // Main Content
  main: {
    paddingTop: '100px',
    paddingBottom: '60px',
    paddingLeft: '24px',
    paddingRight: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },

  // Page Header
  pageHeader: {
    textAlign: 'left',
    marginBottom: '48px',
  },

  pageTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1d1d1f',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  pageSubtitle: {
    fontSize: '15px',
    color: '#86868b',
    margin: '0 0 16px 0',
    fontWeight: '400',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  resultsCount: {
    fontSize: '12px',
    color: '#86868b',
    fontWeight: '500',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Filters
  filtersContainer: {
    display: 'flex',
    gap: '16px',
    marginBottom: '32px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    border: '1px solid #e5e5e7',
    borderRadius: '8px',
    padding: '12px 16px',
    gap: '8px',
    width: '800px',
  },

  searchIcon: {
    fontSize: '12px',
    color: '#86868b',
  },

  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '12px',
    color: '#1d1d1f',
    background: 'transparent',
    width: '100%',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  categorySelect: {
    padding: '12px 32px 12px 16px',
    fontSize: '12px',
    color: '#1d1d1f',
    border: '1px solid #e5e5e7',
    borderRadius: '8px',
    outline: 'none',
    background: '#fff',
    cursor: 'pointer',
    minWidth: '140px',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
  },

  // Products Grid
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '16px',
    marginBottom: '48px',
  },

  productCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },

  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '120px',
    overflow: 'hidden',
  },

  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderIcon: {
    fontSize: '48px',
    color: '#d1d1d6',
  },

  productInfo: {
    padding: '12px',
  },

  productHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
  },

  productTextContainer: {
    flex: 1,
    textAlign: 'left',
  },

  productName: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1d1d1f',
    margin: '0 0 4px 0',
    lineHeight: '1.3',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  productCategory: {
    fontSize: '12px',
    color: '#86868b',
    margin: '0',
    textTransform: 'uppercase',
    fontWeight: '500',
    letterSpacing: '0.5px',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  productPrice: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1d1d1f',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    flexShrink: 0,
  },

  // Pagination
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '32px',
  },

  paginationButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1d1d1f',
    borderRadius: '6px',
    transition: 'background 0.2s ease',
  },

  pageNumber: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 12px',
    fontSize: '12px',
    color: '#1d1d1f',
    borderRadius: '6px',
    transition: 'background 0.2s ease',
    minWidth: '36px',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  activePageNumber: {
    backgroundColor: '#1d1d1f',
    color: '#fff',
  },

  disabledButton: {
    opacity: 0.3,
    cursor: 'not-allowed',
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
  },

  emptyStateIcon: {
    fontSize: '12px',
    color: '#d1d1d6',
    marginBottom: '16px',
  },

  emptyStateTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1d1d1f',
    margin: '0 0 8px 0',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  emptyStateText: {
    fontSize: '12px',
    color: '#86868b',
    margin: 0,
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Loading
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    gap: '12px',
    fontSize: '12px',
    color: '#86868b',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  loadingIcon: {
    fontSize: '12px',
    animation: 'spin 1s linear infinite',
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

    pageHeader: {
      marginBottom: '32px',
    },

    pageTitle: {
      fontSize: '12px',
    },

    filtersContainer: {
      flexDirection: 'column',
      gap: '12px',
    },

    searchContainer: {
      width: '100%',
    },

    categorySelect: {
      width: '100%',
    },

    productsGrid: {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
    },
  },
};

export default Marketplace;

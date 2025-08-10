import React, { useState, useEffect } from 'react';
import { getVendedorStats } from '../services/statsService';

const VendedorAnalytics = ({ vendedorId, vendedorNombre }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [vendedorId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVendedorStats(vendedorId);
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <span className="material-symbols-outlined" style={styles.loadingIcon}>refresh</span>
          Cargando estadísticas...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <span className="material-symbols-outlined" style={styles.errorIcon}>error</span>
          <p style={styles.errorText}>Error al cargar estadísticas: {error}</p>
          <button onClick={fetchStats} style={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Mi Dashboard</h1>
        <p style={styles.subtitle}>Estadísticas de {vendedorNombre}</p>
      </div>

      {/* Grid de estadísticas */}
      <div style={styles.statsGrid}>
        {/* Archivos */}
        <div style={styles.statsCard}>
          <div style={styles.cardHeader}>
            <span className="material-symbols-outlined" style={{...styles.cardIcon, color: '#007aff'}}>
              deployed_code
            </span>
            <h3 style={styles.cardTitle}>Mis Archivos</h3>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.mainStat}>
              <span style={styles.statNumber}>{stats?.totalArchivos || 0}</span>
              <span style={styles.statLabel}>Total de archivos</span>
            </div>
            <div style={styles.subStats}>
              <div style={styles.subStat}>
                <span style={{...styles.subStatNumber, color: '#28a745'}}>{stats?.archivosActivos || 0}</span>
                <span style={styles.subStatLabel}>Activos</span>
              </div>
              <div style={styles.subStat}>
                <span style={{...styles.subStatNumber, color: '#dc3545'}}>{stats?.archivosInactivos || 0}</span>
                <span style={styles.subStatLabel}>Inactivos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ingresos */}
        <div style={styles.statsCard}>
          <div style={styles.cardHeader}>
            <span className="material-symbols-outlined" style={{...styles.cardIcon, color: '#28a745'}}>
              payments
            </span>
            <h3 style={styles.cardTitle}>Ingresos</h3>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.mainStat}>
              <span style={styles.statNumber}>{formatCurrency(stats?.totalIngresos || 0)}</span>
              <span style={styles.statLabel}>Total generado</span>
            </div>
            <div style={styles.subStats}>
              <div style={styles.subStat}>
                <span style={{...styles.subStatNumber, color: '#007aff'}}>{stats?.totalTransacciones || 0}</span>
                <span style={styles.subStatLabel}>Ventas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Descargas */}
        <div style={styles.statsCard}>
          <div style={styles.cardHeader}>
            <span className="material-symbols-outlined" style={{...styles.cardIcon, color: '#ff9500'}}>
              download
            </span>
            <h3 style={styles.cardTitle}>Descargas</h3>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.mainStat}>
              <span style={styles.statNumber}>{stats?.totalDescargas || 0}</span>
              <span style={styles.statLabel}>Descargas totales</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top categorías */}
      {stats?.topCategorias && stats.topCategorias.length > 0 && (
        <div style={styles.categoriesSection}>
          <h3 style={styles.sectionTitle}>Mis Categorías Principales</h3>
          <div style={styles.categoriesList}>
            {stats.topCategorias.map((categoria, index) => (
              <div key={index} style={styles.categoryItem}>
                <div style={styles.categoryRank}>#{index + 1}</div>
                <div style={styles.categoryInfo}>
                  <span style={styles.categoryName}>{categoria.categoria}</span>
                  <span style={styles.categoryCount}>
                    {categoria.archivos} {categoria.archivos === 1 ? 'archivo' : 'archivos'}
                  </span>
                </div>
                <div style={styles.categoryBar}>
                  <div 
                    style={{
                      ...styles.categoryBarFill,
                      width: `${(categoria.archivos / stats.topCategorias[0].archivos) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón de refresh */}
      <div style={styles.refreshContainer}>
        <button onClick={fetchStats} style={styles.refreshButton}>
          <span className="material-symbols-outlined" style={styles.refreshIcon}>refresh</span>
          Actualizar estadísticas
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1d1d1f',
    lineHeight: 1.4
  },

  header: {
    marginBottom: '20px'
  },

  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1d1d1f',
    margin: '0 0 4px 0',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  subtitle: {
    fontSize: '12px',
    color: '#86868b',
    margin: '0',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  // Grid de estadísticas
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '32px'
  },

  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    padding: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f0f0f0',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '10px'
  },

  cardIcon: {
    fontSize: '16px'
  },

  cardTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1d1d1f',
    margin: 0,
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  mainStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },

  statNumber: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1d1d1f',
    lineHeight: '1',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  statLabel: {
    fontSize: '10px',
    color: '#86868b',
    fontWeight: '500',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  subStats: {
    display: 'flex',
    gap: '8px',
    paddingTop: '6px',
    borderTop: '1px solid #f0f0f0'
  },

  subStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1
  },

  subStatNumber: {
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: '1.2',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  subStatLabel: {
    fontSize: '8px',
    color: '#86868b',
    fontWeight: '500',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  // Sección de categorías
  categoriesSection: {
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f0f0f0',
    marginBottom: '20px'
  },

  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1d1d1f',
    margin: '0 0 12px 0',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  categoriesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  categoryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#fafafa',
    borderRadius: '4px'
  },

  categoryRank: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#007AFF',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '600',
    flexShrink: 0
  },

  categoryInfo: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '100px'
  },

  categoryName: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#1d1d1f'
  },

  categoryCount: {
    fontSize: '9px',
    color: '#86868b'
  },

  categoryBar: {
    flex: 1,
    height: '4px',
    backgroundColor: '#e5e5e7',
    borderRadius: '2px',
    overflow: 'hidden'
  },

  categoryBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: '2px',
    transition: 'width 0.3s ease'
  },

  // Refresh button
  refreshContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: '20px'
  },

  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#f5f5f7',
    color: '#1d1d1f',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  refreshIcon: {
    fontSize: '14px'
  },

  // Estados de carga y error
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f0f0f0',
    fontSize: '13px',
    color: '#86868b',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  loadingIcon: {
    fontSize: '16px',
    color: '#007aff',
    animation: 'spin 1s linear infinite'
  },

  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f0f0f0',
    textAlign: 'center'
  },

  errorIcon: {
    fontSize: '24px',
    color: '#dc3545'
  },

  errorText: {
    fontSize: '13px',
    color: '#86868b',
    margin: '0',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  retryButton: {
    padding: '8px 16px',
    backgroundColor: '#007aff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
};

// Agregar animación CSS para el spinner (igual que AnalyticsOverview)
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default VendedorAnalytics;

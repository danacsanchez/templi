import React, { useState, useEffect } from 'react';
import { getStats } from '../services/statsService';

const AnalyticsOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStats();
      setStats(data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          <p style={styles.errorText}>
            {error.includes('Sesión expirada') 
              ? 'Tu sesión ha expirado. Por favor, cierra sesión e inicia sesión nuevamente.' 
              : `Error al cargar estadísticas: ${error}`
            }
          </p>
          <button onClick={cargarEstadisticas} style={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
      </div>

      {/* Grid de estadísticas */}
      <div style={styles.statsGrid}>
        {/* Estadísticas de Usuarios */}
        <div style={styles.statsCard}>
          <div style={styles.cardHeader}>
            <span className="material-symbols-outlined" style={{...styles.cardIcon, color: '#007aff'}}>
              group
            </span>
            <h3 style={styles.cardTitle}>Usuarios</h3>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.mainStat}>
              <span style={styles.statNumber}>{stats?.totalUsuarios || 0}</span>
              <span style={styles.statLabel}>Total de usuarios</span>
            </div>
            <div style={styles.subStats}>
              <div style={styles.subStat}>
                <span style={{...styles.subStatNumber, color: '#28a745'}}>{stats?.totalVendedores || 0}</span>
                <span style={styles.subStatLabel}>Vendedores</span>
              </div>
              <div style={styles.subStat}>
                <span style={{...styles.subStatNumber, color: '#17a2b8'}}>{stats?.totalCompradores || 0}</span>
                <span style={styles.subStatLabel}>Compradores</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas de Archivos */}
        <div style={styles.statsCard}>
          <div style={styles.cardHeader}>
            <span className="material-symbols-outlined" style={{...styles.cardIcon, color: '#28a745'}}>
              deployed_code
            </span>
            <h3 style={styles.cardTitle}>Archivos</h3>
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

        {/* Estadísticas de Transacciones */}
        <div style={styles.statsCard}>
          <div style={styles.cardHeader}>
            <span className="material-symbols-outlined" style={{...styles.cardIcon, color: '#ffc107'}}>
              attach_money
            </span>
            <h3 style={styles.cardTitle}>Ingresos</h3>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.mainStat}>
              <span style={styles.statNumber}>
                ${parseFloat(stats?.ingresosTotales || 0).toLocaleString('es-MX', {minimumFractionDigits: 2})}
              </span>
              <span style={styles.statLabel}>Ingresos totales</span>
            </div>
            <div style={styles.subStats}>
              <div style={styles.subStat}>
                <span style={{...styles.subStatNumber, color: '#28a745'}}>{stats?.totalTransacciones || 0}</span>
                <span style={styles.subStatLabel}>Total de transacciones</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas de Descargas */}
        <div style={styles.statsCard}>
          <div style={styles.cardHeader}>
            <span className="material-symbols-outlined" style={{...styles.cardIcon, color: '#6f42c1'}}>
              download
            </span>
            <h3 style={styles.cardTitle}>Descargas</h3>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.mainStat}>
              <span style={styles.statNumber}>{stats?.totalDescargas || 0}</span>
              <span style={styles.statLabel}>Total de descargas</span>
            </div>
            <div style={styles.subStats}>
              <div style={styles.subStat}>
                <span style={{...styles.subStatNumber, color: '#17a2b8'}}>{stats?.archivoMasDescargado?.nombre || 'N/A'}</span>
                <span style={styles.subStatLabel}>Archivo más popular ({stats?.archivoMasDescargado?.descargas || 0} descargas)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor de gráficos */}
      <div style={styles.chartsContainer}>
        {/* Gráfico de barras - Vendedores vs Clientes */}
        <div style={styles.chartContainer}>
          <div style={styles.chartHeader}>
            <h2 style={styles.chartTitle}>Distribución de Usuarios</h2>
            <p style={styles.chartSubtitle}>Comparación entre vendedores y clientes</p>
          </div>
          
          <div style={styles.chartContent}>
            <svg width="320" height="240" style={styles.chartSvg}>
              {/* Líneas de la cuadrícula */}
              <defs>
                <pattern id="grid" width="32" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 24" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Ejes */}
              <line x1="50" y1="190" x2="290" y2="190" stroke="#d0d0d0" strokeWidth="2"/>
              <line x1="50" y1="190" x2="50" y2="30" stroke="#d0d0d0" strokeWidth="2"/>
              
              {/* Barras */}
              {(() => {
                const maxValue = Math.max(stats?.totalVendedores || 0, stats?.totalCompradores || 0);
                const scale = maxValue > 0 ? 140 / maxValue : 0;
                const vendedoresHeight = (stats?.totalVendedores || 0) * scale;
                const compradoresHeight = (stats?.totalCompradores || 0) * scale;
                
                return (
                  <>
                    {/* Barra Vendedores */}
                    <rect
                      x="80"
                      y={190 - vendedoresHeight}
                      width="50"
                      height={vendedoresHeight}
                      fill="#28a745"
                      rx="3"
                      ry="3"
                    />
                    
                    {/* Barra Clientes */}
                    <rect
                      x="180"
                      y={190 - compradoresHeight}
                      width="50"
                      height={compradoresHeight}
                      fill="#17a2b8"
                      rx="3"
                      ry="3"
                    />
                    
                    {/* Valores encima de las barras */}
                    <text
                      x="105"
                      y={190 - vendedoresHeight - 8}
                      textAnchor="middle"
                      style={styles.barValue}
                    >
                      {stats?.totalVendedores || 0}
                    </text>
                    
                    <text
                      x="205"
                      y={190 - compradoresHeight - 8}
                      textAnchor="middle"
                      style={styles.barValue}
                    >
                      {stats?.totalCompradores || 0}
                    </text>
                    
                    {/* Etiquetas del eje X */}
                    <text
                      x="105"
                      y="208"
                      textAnchor="middle"
                      style={styles.axisLabel}
                    >
                      Vendedores
                    </text>
                    
                    <text
                      x="205"
                      y="208"
                      textAnchor="middle"
                      style={styles.axisLabel}
                    >
                      Clientes
                    </text>
                    
                    {/* Etiquetas del eje Y */}
                    <text
                      x="42"
                      y="195"
                      textAnchor="middle"
                      style={styles.axisLabel}
                    >
                      0
                    </text>
                    
                    {maxValue > 0 && (
                      <>
                        <text
                          x="42"
                          y="120"
                          textAnchor="middle"
                          style={styles.axisLabel}
                        >
                          {Math.round(maxValue / 2)}
                        </text>
                        
                        <text
                          x="42"
                          y="40"
                          textAnchor="middle"
                          style={styles.axisLabel}
                        >
                          {maxValue}
                        </text>
                      </>
                    )}
                  </>
                );
              })()}
            </svg>
            
            {/* Leyenda */}
            <div style={styles.chartLegend}>
              <div style={styles.legendItem}>
                <div style={{...styles.legendColor, backgroundColor: '#28a745'}}></div>
                <span style={styles.legendText}>Vendedores ({stats?.totalVendedores || 0})</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{...styles.legendColor, backgroundColor: '#17a2b8'}}></div>
                <span style={styles.legendText}>Clientes ({stats?.totalCompradores || 0})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de pastel - Categorías más usadas */}
        <div style={styles.chartContainer}>
          <div style={styles.chartHeader}>
            <h2 style={styles.chartTitle}>Categorías Más Usadas</h2>
            <p style={styles.chartSubtitle}>Top 5 categorías por número de archivos</p>
          </div>
          
          <div style={styles.chartContent}>
            <svg width="320" height="240" style={styles.chartSvg}>
              {(() => {
                const topCategorias = stats?.topCategorias || [];
                if (topCategorias.length === 0) {
                  return (
                    <text x="160" y="120" textAnchor="middle" style={styles.noDataText}>
                      No hay datos disponibles
                    </text>
                  );
                }

                const total = topCategorias.reduce((sum, cat) => sum + cat.archivos, 0);
                const colors = ['#007aff', '#28a745', '#ffc107', '#fd7e14', '#6f42c1'];
                const centerX = 160;
                const centerY = 110;
                const radius = 65;
                
                let currentAngle = -Math.PI / 2; // Empezar desde arriba
                
                return (
                  <>
                    {topCategorias.map((categoria, index) => {
                      const percentage = (categoria.archivos / total) * 100;
                      const angle = (categoria.archivos / total) * 2 * Math.PI;
                      
                      // Calcular coordenadas del arco
                      const startX = centerX + radius * Math.cos(currentAngle);
                      const startY = centerY + radius * Math.sin(currentAngle);
                      const endX = centerX + radius * Math.cos(currentAngle + angle);
                      const endY = centerY + radius * Math.sin(currentAngle + angle);
                      
                      const largeArcFlag = angle > Math.PI ? 1 : 0;
                      
                      const pathData = [
                        `M ${centerX} ${centerY}`,
                        `L ${startX} ${startY}`,
                        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                        'Z'
                      ].join(' ');
                      
                      // Calcular posición del texto
                      const textAngle = currentAngle + angle / 2;
                      const textRadius = radius * 0.7;
                      const textX = centerX + textRadius * Math.cos(textAngle);
                      const textY = centerY + textRadius * Math.sin(textAngle);
                      
                      currentAngle += angle;
                      
                      return (
                        <g key={index}>
                          <path
                            d={pathData}
                            fill={colors[index % colors.length]}
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                          <text
                            x={textX}
                            y={textY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={styles.pieValue}
                          >
                            {percentage.toFixed(0)}%
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
            
            {/* Leyenda del gráfico de pastel */}
            <div style={styles.pieLegend}>
              {(stats?.topCategorias || []).map((categoria, index) => {
                const colors = ['#007aff', '#28a745', '#ffc107', '#fd7e14', '#6f42c1'];
                return (
                  <div key={index} style={styles.legendItem}>
                    <div style={{...styles.legendColor, backgroundColor: colors[index % colors.length]}}></div>
                    <span style={styles.legendText}>
                      {categoria.nombre} ({categoria.archivos})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Botón de actualizar */}
      <div style={styles.refreshContainer}>
        <button onClick={cargarEstadisticas} style={styles.refreshButton}>
          <span className="material-symbols-outlined" style={styles.refreshIcon}>refresh</span>
          Actualizar estadísticas
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 28px'
  },

  header: {
    textAlign: 'left',
    marginBottom: '32px'
  },

  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1d1d1f',
    margin: '0 0 8px 0',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  subtitle: {
    fontSize: '14px',
    color: '#86868b',
    margin: 0,
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

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
    transition: 'all 0.2s ease',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  refreshIcon: {
    fontSize: '16px'
  },

  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '12px',
    fontSize: '14px',
    color: '#86868b',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  loadingIcon: {
    fontSize: '24px',
    animation: 'spin 1s linear infinite'
  },

  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '16px',
    textAlign: 'center'
  },

  errorIcon: {
    fontSize: '48px',
    color: '#ff3b30'
  },

  errorText: {
    fontSize: '14px',
    color: '#86868b',
    margin: 0,
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  retryButton: {
    padding: '12px 20px',
    backgroundColor: '#007aff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  // Estilos del gráfico
  chartsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },

  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f0f0f0'
  },

  chartHeader: {
    textAlign: 'center',
    marginBottom: '20px'
  },

  chartTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1d1d1f',
    margin: '0 0 4px 0',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  chartSubtitle: {
    fontSize: '11px',
    color: '#86868b',
    margin: 0,
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  chartContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },

  chartSvg: {
    border: '1px solid #f0f0f0',
    borderRadius: '8px',
    backgroundColor: '#fafafa'
  },

  barValue: {
    fontSize: '12px',
    fontWeight: '600',
    fill: '#1d1d1f',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  axisLabel: {
    fontSize: '11px',
    fontWeight: '500',
    fill: '#86868b',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  chartLegend: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },

  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },

  legendColor: {
    width: '10px',
    height: '10px',
    borderRadius: '2px'
  },

  legendText: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#1d1d1f',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  // Estilos específicos del gráfico de pastel
  pieValue: {
    fontSize: '11px',
    fontWeight: '600',
    fill: '#ffffff',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  pieLegend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'center'
  },

  noDataText: {
    fontSize: '14px',
    fontWeight: '500',
    fill: '#86868b',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
};

export default AnalyticsOverview;

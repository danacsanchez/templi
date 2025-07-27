import React, { useState } from 'react';
import { authService } from '../services/authService';

const Login = ({ onLoginSuccess, onBackToHome, onRegisterClick }) => { // ← Agregado onRegisterClick
  const [formData, setFormData] = useState({
    email: '',
    contraseña: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData);
      
      // Guardar token
      authService.setToken(response.data.token);
      
      // Mostrar éxito
      const userName = response.data.user.nombre;
      const userRole = response.data.user.tipo || response.data.user.rol;
      
      // alert(`¡Bienvenido ${userName}! (Rol: ${userRole})`);
      
      console.log('Usuario logueado:', response.data.user);
      
      // Llamar callback de éxito pasando los datos del usuario
      if (onLoginSuccess) {
        onLoginSuccess(response.data);
      }
      
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al iniciar sesión';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Botón Regresar al Inicio - ARRIBA DE LA TARJETA */}
      <div style={styles.backButtonContainer}>
        <button 
          onClick={onBackToHome}
          style={styles.backButton}
        >
          <span className="material-symbols-outlined" style={styles.backIcon}>
            arrow_back
          </span>
          <span style={styles.backText}>REGRESAR AL INICIO</span>
        </button>
      </div>
      
      <div style={styles.loginBox}>
        
        {/* Logo */}
        <div style={styles.logoContainer}>
          <img 
            src="/images/templi-logo.PNG" 
            alt="Templi Logo" 
            style={styles.logoImage}
          />
        </div>
        
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Entra y continúa donde lo dejaste</h1>
          <p style={styles.subtitle}>
            Porque tus archivos siempre estarán aquí para ti.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* Campo Email */}
          <div style={styles.inputGroup}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@email.com"
              required
              style={styles.input}
            />
          </div>

          {/* Campo Contraseña */}
          <div style={styles.inputGroup}>
            <div style={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                name="contraseña"
                value={formData.contraseña}
                onChange={handleChange}
                placeholder="Introduce tu contraseña"
                required
                style={styles.passwordInput}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <span className="material-symbols-outlined" style={styles.eyeIcon}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Mostrar error */}
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {/* Botón */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.button,
              ...(isButtonHovered ? styles.buttonHover : {}),
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={() => !loading && setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
            {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
          </button>

          {/* Footer Info */}
          <div style={styles.footerInfo}>
            <span style={styles.infoText}>¿Aún no tienes cuenta?</span>
            <span style={styles.separator}>•</span>
            <span 
              style={styles.linkText}
              onClick={onRegisterClick} // ← Agregado onClick
            >
              Regístrate aquí
            </span>
          </div>

        </form>
      </div>
    </div>
  );
};

// Estilos corregidos
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '24px',
    color: '#1d1d1f'
  },

  // Botón Regresar al Inicio - ALINEADO CON LA TARJETA
  backButtonContainer: {
    width: '100%',
    maxWidth: '330px', // ← Mismo ancho que la tarjeta
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'flex-start', // ← Alineado a la izquierda
    paddingLeft: '0px' // ← Sin padding extra para que coincida con el borde de la tarjeta
  },

  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 0px', // ← Cambié el padding horizontal de 8px a 0px para alinear con el borde
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    backgroundColor: 'transparent'
  },

  backIcon: {
    fontSize: '16px',
    color: '#6c757d'
  },

  backText: {
    fontSize: '11px',
    color: '#6c757d',
    fontWeight: '500',
    letterSpacing: '0.5px'
  },

  loginBox: {
    backgroundColor: '#ffffff',
    padding: '20px 18px',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '300px',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    textAlign: 'center'
  },

  // Logo más grande
  logoContainer: {
    marginBottom: '18px',
    display: 'flex',
    justifyContent: 'center'
  },

  logoImage: {
    height: '44px',
    width: 'auto',
    objectFit: 'contain',
  },

  header: {
    marginBottom: '18px'
  },

  title: {
    fontSize: '15px', // ← Reducido de 17px (10% menos)
    fontWeight: '600',
    color: '#1d1d1f',
    margin: '0 0 6px 0',
    lineHeight: '1.3',
    letterSpacing: '-0.3px'
  },

  subtitle: {
    fontSize: '11px', // ← Reducido de 12px (10% menos)
    color: '#6c757d',
    margin: 0,
    lineHeight: '1.4',
    fontWeight: '400'
  },

  form: {
    width: '100%',
    textAlign: 'left'
  },

  inputGroup: {
    marginBottom: '12px'
  },

  input: {
    width: '100%',
    padding: '12px',
    fontSize: '13px', // ← Reducido de 14px (10% menos)
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8f9fa',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    color: '#495057'
  },

  // Container para contraseña con ojo
  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },

  passwordInput: {
    width: '100%',
    padding: '12px',
    paddingRight: '40px',
    fontSize: '13px', // ← Reducido de 14px (10% menos)
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8f9fa',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    color: '#495057'
  },

  eyeButton: {
    position: 'absolute',
    right: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  eyeIcon: {
    fontSize: '14px', // ← Reducido de 16px (10% menos)
    color: '#6c757d'
  },

  button: {
    width: '100%',
    padding: '12px',
    fontSize: '13px', // ← Reducido de 14px (10% menos)
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#000000',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '16px',
    marginTop: '4px'
  },

  buttonHover: {
    backgroundColor: '#333333',
    transform: 'translateY(-1px)'
  },

  error: {
    backgroundColor: '#fff5f5',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '8px',
    borderRadius: '8px',
    marginBottom: '12px',
    fontSize: '11px', // ← Reducido de 12px (10% menos)
    textAlign: 'center',
    fontWeight: '400'
  },

  footerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    justifyContent: 'center'
  },

  infoText: {
    fontSize: '11px', // ← Reducido de 12px (10% menos)
    color: '#6c757d',
    fontWeight: '400'
  },

  separator: {
    fontSize: '11px', // ← Reducido de 12px (10% menos)
    color: '#dee2e6'
  },

  linkText: {
    fontSize: '11px', // ← Reducido de 12px (10% menos)
    color: '#000000',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline'
  },

  // Responsive
  '@media (max-width: 768px)': {
    container: {
      padding: '16px'
    },

    backButtonContainer: {
      marginBottom: '12px',
      paddingLeft: '0px' // ← También en móvil
    },

    backButton: {
      padding: '6px 0px' // ← También en móvil
    },

    backIcon: {
      fontSize: '14px'
    },

    backText: {
      fontSize: '10px'
    },
    
    loginBox: {
      padding: '18px 16px',
      maxWidth: '100%'
    },
    
    logoImage: {
      height: '40px'
    },
    
    title: {
      fontSize: '14px'
    },
    
    subtitle: {
      fontSize: '10px'
    }
  }
};

export default Login;
import React, { useState, useEffect } from 'react';

const Register = ({ onBackToLogin, onRegisterSuccess, onBackToHome }) => {
  const [selectedRole, setSelectedRole] = useState(null); // 1 = cliente, 2 = vendedor
  const [currentStep, setCurrentStep] = useState(1); // Para manejar pasos del registro
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_nacimiento: '', // ← Cambiado de fechaNacimiento
    id_genero_usuario: '', // ← Cambiado de genero  
    email: '',
    contraseña: ''
  });
  const [generos, setGeneros] = useState([]); // Estado para géneros dinámicos
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar géneros al montar el componente
  useEffect(() => {
    fetchGeneros();
  }, []);

  const fetchGeneros = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/generos'); // ← Cambiar a 3000
      if (response.ok) {
        const data = await response.json();
        // Asegurarse de que los géneros tengan la propiedad id_genero_usuario
        const generosMapped = data.map(g => ({
          id_genero_usuario: g.id_genero_usuario || g.id || g.value || '',
          nombre: g.nombre
        }));
        setGeneros(generosMapped);
      } else {
        console.error('Error al cargar géneros');
        // Fallback si la API falla
        setGeneros([
          { id_genero_usuario: 1, nombre: 'Femenino' },
          { id_genero_usuario: 2, nombre: 'Masculino' },
          { id_genero_usuario: 3, nombre: 'Prefiero no decirlo' }
        ]);
      }
    } catch (error) {
      console.error('Error al conectar con la API de géneros:', error);
      // Fallback si hay error de conexión
      setGeneros([
        { id_genero_usuario: 1, nombre: 'Femenino' },
        { id_genero_usuario: 2, nombre: 'Masculino' },
        { id_genero_usuario: 3, nombre: 'Prefiero no decirlo' }
      ]);
    }
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setCurrentStep(2); // Pasar al formulario automáticamente
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Formateo automático de fecha
    if (name === 'fecha_nacimiento') { // ← Cambiado
      let formattedValue = value.replace(/\D/g, ''); // Solo números
      if (formattedValue.length >= 4) {
        formattedValue = formattedValue.substring(0, 4) + '/' + formattedValue.substring(4);
      }
      if (formattedValue.length >= 7) {
        formattedValue = formattedValue.substring(0, 7) + '/' + formattedValue.substring(7, 9);
      }
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Preparar datos para la base de datos
      const registroData = {
        nombre: formData.nombre,
        fecha_nacimiento: formData.fecha_nacimiento.replace(/\//g, '-'), // YYYY-MM-DD
        email: formData.email,
        contraseña: formData.contraseña,
        id_tipo_usuario: selectedRole, // 1 = cliente, 2 = vendedor
        id_genero_usuario: parseInt(formData.id_genero_usuario)
      };

      console.log('Datos a enviar:', registroData);
      
      // ACTIVAR llamada al backend
      const response = await fetch('http://localhost:3000/api/auth/register', { // ← Cambiar a 3000
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(registroData)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Registro exitoso:', data);
        setLoading(false);
        
        // Mostrar mensaje de éxito
        alert('¡Cuenta creada exitosamente!');
        
        console.log('Datos del usuario registrado:', data);
        console.log('Tipo de usuario:', data.user.id_tipo_usuario);
        
        // Redirigir al dashboard correspondiente - el backend ya devuelve la estructura correcta
        onRegisterSuccess(data);
      } else {
        console.error('Error del servidor:', data);
        setError(data.message || 'Error al registrar usuario');
        setLoading(false);
      }
      
    } catch (error) {
      console.error('Error de conexión:', error);
      setError('Error de conexión con el servidor');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Botón Regresar */}
      <div style={styles.backButtonContainer}>
        <button 
          onClick={currentStep === 1 ? onBackToLogin : () => setCurrentStep(1)}
          style={styles.backButton}
        >
          <span className="material-symbols-outlined" style={styles.backIcon}>
            arrow_back
          </span>
          <span style={styles.backText}>
            {currentStep === 1 ? 'REGRESAR AL LOGIN' : 'REGRESAR A SELECCIÓN'}
          </span>
        </button>
      </div>
      
      <div style={styles.registerBox}>
        
        {/* Logo */}
        <div style={styles.logoContainer}>
          <img 
            src="/images/templi-logo.PNG" 
            alt="Templi Logo" 
            style={styles.logoImage}
          />
        </div>
        
        {currentStep === 1 && (
          <>
            {/* Header */}
            <div style={styles.header}>
              <h1 style={styles.title}>Empieza tu experiencia digital hoy</h1>
              <p style={styles.subtitle}>
                Regístrate gratis y personaliza tu experiencia.
              </p>
            </div>

            {/* Selección de Rol */}
            <div style={styles.roleSection}>
              <h2 style={styles.roleTitle}>¿Qué te gustaría hacer en Templi?</h2>
              
              <div style={styles.roleOptions}>
                
                {/* Opción Comprar (Cliente) */}
                <button
                  onClick={() => handleRoleSelect(1)}
                  style={{
                    ...styles.roleOption,
                    ...(selectedRole === 1 ? styles.roleOptionSelected : {}),
                  }}
                >
                  <div style={styles.roleIconContainer}>
                    <span className="material-symbols-outlined" style={styles.roleIcon}>
                      local_mall
                    </span>
                  </div>
                  <div style={styles.roleContent}>
                    <h3 style={styles.roleOptionTitle}>Comprar</h3>
                    <p style={styles.roleOptionDescription}>
                      Explora productos digitales y descárgalos al instante.
                    </p>
                  </div>
                </button>

                {/* Opción Vender (Vendedor) */}
                <button
                  onClick={() => handleRoleSelect(2)}
                  style={{
                    ...styles.roleOption,
                    ...(selectedRole === 2 ? styles.roleOptionSelected : {}),
                  }}
                >
                  <div style={styles.roleIconContainer}>
                    <span className="material-symbols-outlined" style={styles.roleIcon}>
                      storefront
                    </span>
                  </div>
                  <div style={styles.roleContent}>
                    <h3 style={styles.roleOptionTitle}>Vender</h3>
                    <p style={styles.roleOptionDescription}>
                      Sube tus propios archivos digitales y gana dinero con tus creaciones.
                    </p>
                  </div>
                </button>

              </div>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            {/* Header del formulario */}
            <div style={styles.header}>
              <h1 style={styles.title}>Completa tu registro</h1>
              <p style={styles.subtitle}>
                {selectedRole === 2 ? 'Configura tu tienda' : 'Unos datos más y listo'}
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} style={styles.form}>
              
              {/* Campo Nombre */}
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder={selectedRole === 2 ? "Introduce el nombre de tu tienda o marca" : "Ingresa tu nombre"}
                  required
                  style={styles.input}
                />
              </div>

              {/* Campo Fecha de Nacimiento */}
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  name="fecha_nacimiento" // ← Cambiado
                  value={formData.fecha_nacimiento} // ← Cambiado
                  onChange={handleInputChange}
                  placeholder="AAAA/MM/DD"
                  maxLength="10"
                  required
                  style={styles.input}
                />
              </div>

              {/* Campo Género - DINÁMICO */}
              <div style={styles.inputGroup}>
                <select
                  name="id_genero_usuario"
                  value={formData.id_genero_usuario}
                  onChange={handleInputChange}
                  required
                  style={styles.select}
                >
                  <option value="">Selecciona tu género</option>
                  {generos.map(genero => (
                    <option key={genero.id_genero_usuario} value={genero.id_genero_usuario}>
                      {genero.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo Email */}
              <div style={styles.inputGroup}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
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
                    onChange={handleInputChange}
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

              {/* Checkbox Términos */}
              <div style={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  style={styles.checkbox}
                />
                <label htmlFor="acceptTerms" style={styles.checkboxLabel}>
                  Al crear tu cuenta, estás de acuerdo con nuestros{' '}
                  <span style={styles.linkText}>términos y condiciones</span> y la{' '}
                  <span style={styles.linkText}>política de privacidad</span>
                </label>
              </div>

              {/* Error */}
              {error && (
                <div style={styles.error}>
                  {error}
                </div>
              )}

              {/* Botón Crear Cuenta */}
              <button 
                type="submit" 
                disabled={loading || !acceptTerms}
                style={{
                  ...styles.button,
                  opacity: (loading || !acceptTerms) ? 0.6 : 1,
                  cursor: (loading || !acceptTerms) ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>

            </form>
          </>
        )}

      </div>
    </div>
  );
};

// Estilos completos
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

  backButtonContainer: {
    width: '100%',
    maxWidth: '320px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'flex-start',
    paddingLeft: '0px'
  },

  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 0px',
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

  registerBox: {
    backgroundColor: '#ffffff',
    padding: '20px 18px',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '320px',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    textAlign: 'center'
  },

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
    marginBottom: '24px'
  },

  title: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1d1d1f',
    margin: '0 0 6px 0',
    lineHeight: '1.3',
    letterSpacing: '-0.3px'
  },

  subtitle: {
    fontSize: '11px',
    color: '#6c757d',
    margin: 0,
    lineHeight: '1.4',
    fontWeight: '400'
  },

  roleSection: {
    textAlign: 'left'
  },

  roleTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1d1d1f',
    margin: '0 0 16px 0',
    textAlign: 'center'
  },

  roleOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  roleOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  roleOptionSelected: {
    borderColor: '#000000',
    backgroundColor: '#f8f9fa'
  },

  roleIconContainer: {
    minWidth: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },

  roleIcon: {
    fontSize: '24px',
    color: '#1d1d1f'
  },

  roleContent: {
    flex: 1,
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  roleOptionTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1d1d1f',
    margin: '0 0 4px 0',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  roleOptionDescription: {
    fontSize: '11px',
    color: '#6c757d',
    margin: 0,
    lineHeight: '1.4',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  // Estilos del formulario
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
    fontSize: '13px',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8f9fa',
    boxSizing: 'border-box',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#495057'
  },

  select: {
    width: '100%',
    padding: '12px',
    fontSize: '13px',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8f9fa',
    boxSizing: 'border-box',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#495057',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 8px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    paddingRight: '32px'
  },

  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },

  passwordInput: {
    width: '100%',
    padding: '12px',
    paddingRight: '40px',
    fontSize: '13px',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8f9fa',
    boxSizing: 'border-box',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segue UI", Roboto, sans-serif',
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
    fontSize: '14px',
    color: '#6c757d'
  },

  checkboxContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '16px'
  },

  checkbox: {
    marginTop: '2px',
    accentColor: '#000000'
  },

  checkboxLabel: {
    fontSize: '11px',
    color: '#6c757d',
    lineHeight: '1.4',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  linkText: {
    color: '#000000',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline'
  },

  button: {
    width: '100%',
    padding: '12px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#000000',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '4px',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  error: {
    backgroundColor: '#fff5f5',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '8px',
    borderRadius: '8px',
    marginBottom: '12px',
    fontSize: '11px',
    textAlign: 'center',
    fontWeight: '400',
    fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  // Responsive
  '@media (max-width: 768px)': {
    container: {
      padding: '16px'
    },

    backButtonContainer: {
      marginBottom: '12px',
      maxWidth: '100%'
    },

    backIcon: {
      fontSize: '14px'
    },

    backText: {
      fontSize: '10px'
    },
    
    registerBox: {
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
    },

    roleTitle: {
      fontSize: '12px'
    },

    roleIconContainer: {
      minWidth: '40px',
      height: '40px'
    },

    roleIcon: {
      fontSize: '22px'
    }
  }
};

export default Register;
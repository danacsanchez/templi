import React, { useState, useEffect } from 'react';
import { updateUsuario } from '../services/usuariosService';
import { getGenerosUsuario } from '../services/generoUsuarioService';
import { addUsuario } from '../services/usuariosService';

const UsuarioForm = ({ usuario, tiposUsuario, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    fecha_nacimiento: '',
    id_genero_usuario: '',
    id_tipo_usuario: '',
    contraseña: ''
  });
  const [generosUsuario, setGenerosUsuario] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar géneros al montar el componente
  useEffect(() => {
    const loadGeneros = async () => {
      try {
        const generos = await getGenerosUsuario();
        setGenerosUsuario(generos || []);
      } catch (error) {
        console.error('Error al cargar géneros:', error);
      }
    };

    loadGeneros();
  }, []);

  // Un solo useEffect para inicializar el formulario correctamente
  useEffect(() => {
    // Solo inicializar si las opciones están listas
    if (usuario && generosUsuario.length > 0 && tiposUsuario.length > 0) {
      // Verificar si el valor existe en las opciones
      const generoValido = generosUsuario.some(g => String(g.id_genero_usuario) === String(usuario.id_genero_usuario));
      const tipoValido = tiposUsuario.some(t => String(t.id_tipo_usuario) === String(usuario.id_tipo_usuario));
      setFormData({
        nombre: usuario.nombre || '',
        email: usuario.email || '',
        fecha_nacimiento: usuario.fecha_nacimiento ? 
          new Date(usuario.fecha_nacimiento).toISOString().split('T')[0] : '',
        id_genero_usuario: generoValido ? String(usuario.id_genero_usuario) : '',
        id_tipo_usuario: tipoValido ? String(usuario.id_tipo_usuario) : '',
        contraseña: ''
      });
      setErrors({});
    } else if (!usuario && generosUsuario.length > 0 && tiposUsuario.length > 0) {
      setFormData({
        nombre: '',
        email: '',
        fecha_nacimiento: '',
        id_genero_usuario: '',
        id_tipo_usuario: '',
        contraseña: ''
      });
      setErrors({});
    }
  }, [usuario, generosUsuario, tiposUsuario]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.id_tipo_usuario) {
      newErrors.id_tipo_usuario = 'El tipo de usuario es requerido';
    }

    if (!formData.id_genero_usuario) {
      newErrors.id_genero_usuario = 'El género es requerido';
    }

    if (!usuario && !formData.contraseña.trim()) {
      newErrors.contraseña = 'La contraseña es requerida';
    } else if (!usuario && formData.contraseña.length < 6) {
      newErrors.contraseña = 'La contraseña debe tener al menos 6 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const dataToSend = {
        ...formData,
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        id_genero_usuario: formData.id_genero_usuario ? Number(formData.id_genero_usuario) : null,
        id_tipo_usuario: formData.id_tipo_usuario ? Number(formData.id_tipo_usuario) : null,
        fecha_nacimiento: formData.fecha_nacimiento || null
      };
      
      if (usuario) {
        delete dataToSend.contraseña;
      }

      if (usuario) {
        await updateUsuario(usuario.id_usuario, dataToSend);
      } else {
        await addUsuario(dataToSend);
      }
      
      onSave();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      if (onSave) onSave(error.message || 'Error al guardar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Header con botón volver */}
      <div style={headerStyle}>
        <div style={headerContentStyle}>
          <button
            style={backButtonStyle}
            onClick={onCancel}
            type="button"
          >
            <span className="material-symbols-outlined" style={backIconStyle}>arrow_back</span>
            Volver al listado
          </button>
        </div>
        
        <div style={titleContainerStyle}>
          <div style={titleStyle}>
            {usuario ? 'Editar Usuario' : 'Añadir Usuario'}
          </div>
          <div style={subtitleStyle}>
            {usuario ? `Modificando: ${usuario.nombre}` : 'Completa los datos del nuevo usuario'}
          </div>
        </div>
      </div>

      <div style={{height: 24}} />

      {/* Formulario */}
      <div style={formContainerStyle}>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldsGridStyle}>
            {/* Nombre - campo ancho que ocupa toda la fila */}
            <div style={wideFieldContainerStyle}>
              <label style={labelStyle} htmlFor="nombre">
                Nombre completo <span style={requiredStyle}>*</span>
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleInputChange}
                style={{
                  ...inputStyle,
                  ...(errors.nombre ? errorInputStyle : {})
                }}
                placeholder="Ingresa el nombre completo"
                disabled={isSubmitting}
              />
              {errors.nombre && (
                <span style={errorTextStyle}>{errors.nombre}</span>
              )}
            </div>

            {/* Email - campo ancho que ocupa toda la fila */}
            <div style={wideFieldContainerStyle}>
              <label style={labelStyle} htmlFor="email">
                Email <span style={requiredStyle}>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                style={{
                  ...inputStyle,
                  ...(errors.email ? errorInputStyle : {})
                }}
                placeholder="usuario@ejemplo.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <span style={errorTextStyle}>{errors.email}</span>
              )}
            </div>

            {/* Fecha - campo pequeño compacto */}
            <div style={smallFieldContainerStyle}>
              <label style={labelStyle} htmlFor="fecha_nacimiento">
                Fecha de nacimiento
              </label>
              <input
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={handleInputChange}
                style={dateInputStyle}
                disabled={isSubmitting}
              />
            </div>

            {/* Género - campo pequeño compacto */}
            <div style={smallFieldContainerStyle}>
              <label style={labelStyle} htmlFor="id_genero_usuario">
                Género <span style={requiredStyle}>*</span>
              </label>
              <select
                id="id_genero_usuario"
                name="id_genero_usuario"
                value={formData.id_genero_usuario}
                onChange={handleInputChange}
                style={{
                  ...smallSelectStyle,
                  ...(errors.id_genero_usuario ? errorInputStyle : {})
                }}
                disabled={isSubmitting}
              >
                <option value="">Seleccionar</option>
                {generosUsuario.map(genero => (
                  <option key={String(genero.id_genero_usuario)} value={String(genero.id_genero_usuario)}>
                    {genero.nombre}
                  </option>
                ))}
              </select>
              {errors.id_genero_usuario && (
                <span style={errorTextStyle}>{errors.id_genero_usuario}</span>
              )}
            </div>

            {/* Tipo de usuario - campo pequeño compacto */}
            <div style={smallFieldContainerStyle}>
              <label style={labelStyle} htmlFor="id_tipo_usuario">
                Tipo de usuario <span style={requiredStyle}>*</span>
              </label>
              <select
                id="id_tipo_usuario"
                name="id_tipo_usuario"
                value={formData.id_tipo_usuario}
                onChange={handleInputChange}
                style={{
                  ...smallSelectStyle,
                  ...(errors.id_tipo_usuario ? errorInputStyle : {})
                }}
                disabled={isSubmitting}
              >
                <option value="">Seleccionar</option>
                {tiposUsuario.map(tipo => (
                  <option key={String(tipo.id_tipo_usuario)} value={String(tipo.id_tipo_usuario)}>
                    {tipo.nombre.charAt(0).toUpperCase() + tipo.nombre.slice(1)}
                  </option>
                ))}
              </select>
              {errors.id_tipo_usuario && (
                <span style={errorTextStyle}>{errors.id_tipo_usuario}</span>
              )}
            </div>

            {/* Contraseña - campo pequeño compacto (solo en modo crear) */}
            {!usuario && (
              <div style={smallFieldContainerStyle}>
                <label style={labelStyle} htmlFor="contraseña">
                  Contraseña <span style={requiredStyle}>*</span>
                </label>
                <input
                  id="contraseña"
                  name="contraseña"
                  type="password"
                  value={formData.contraseña}
                  onChange={handleInputChange}
                  style={{
                    ...passwordInputStyle,
                    ...(errors.contraseña ? errorInputStyle : {})
                  }}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isSubmitting}
                />
                {errors.contraseña && (
                  <span style={errorTextStyle}>{errors.contraseña}</span>
                )}
              </div>
            )}
          </div>

          {/* Botones */}
          <div style={buttonContainerStyle}>
            <button
              type="button"
              onClick={onCancel}
              style={cancelButtonStyle}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                ...saveButtonStyle,
                ...(isSubmitting ? disabledButtonStyle : {})
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined" style={loadingIconStyle}>refresh</span>
                  {usuario ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={buttonIconStyle}>
                    {usuario ? 'edit' : 'add'}
                  </span>
                  {usuario ? 'Actualizar usuario' : 'Agregar usuario'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ───────────── Estilos (mantener los mismos) ───────────── */
const containerStyle = {
  width:'100%',maxWidth:1400,margin:'0 auto',padding:'0 28px'
};

const headerStyle = {
  borderBottom: '1px solid #e5e5e7',
  paddingBottom: '20px'
};

const headerContentStyle = {
  marginBottom: '16px'
};

const backButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'none',
  border: '1px solid #e5e5e7',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '11px',
  color: '#1d1d1f',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: '500'
};

const backIconStyle = {
  fontSize: '16px'
};

const titleContainerStyle = {
  textAlign: 'left'
};

const titleStyle = {
  fontSize: 23,
  fontWeight: 700,
  color: '#1d1d1f',
  margin: 0
};

const subtitleStyle = {
  fontSize: 11,
  color: '#86868b',
  marginTop: 2
};

const formContainerStyle = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  border: '1px solid #e5e5e7',
  overflow: 'hidden'
};

const formStyle = {
  padding: '32px'
};

const fieldsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '20px',
  marginBottom: '32px',
  alignItems: 'start'
};

const wideFieldContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gridColumn: '1 / -1'
};

const smallFieldContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: '180px',
  maxWidth: '250px'
};

// Label alineado a la izquierda con asterisco rojo
const labelStyle = {
  display: 'block',
  fontSize: '11px', // Reducido para igualar la tabla
  fontWeight: '600',
  color: '#1d1d1f',
  marginBottom: '8px',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  textAlign: 'left'
};

const requiredStyle = {
  color: '#ff3b30',
  marginLeft: '2px'
};

// Input base (para campos anchos)
const inputStyle = {
  width: '100%',
  padding: '8px 12px', // Más compacto
  fontSize: '11px', // Igual que la tabla
  color: '#1d1d1f',
  border: '1px solid #e5e5e7',
  borderRadius: '6px',
  outline: 'none',
  transition: 'border-color 0.15s ease',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  boxSizing: 'border-box'
};

const dateInputStyle = {
  ...inputStyle,
  width: '100%'
};

const passwordInputStyle = {
  ...inputStyle,
  width: '100%'
};

// 🔧 SELECT CORREGIDO - con más espacio para el dropdown
const smallSelectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  width: '100%',
  appearance: 'none',
  paddingRight: '32px', // Más compacto
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: 'right 8px center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '16px 16px'
};

const errorInputStyle = {
  borderColor: '#ff3b30',
  boxShadow: '0 0 0 3px rgba(255, 59, 48, 0.1)'
};

const errorTextStyle = {
  display: 'block',
  fontSize: '10px',
  color: '#ff3b30',
  marginTop: '4px',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const buttonContainerStyle = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  paddingTop: '24px',
  borderTop: '1px solid #f5f5f7'
};

const cancelButtonStyle = {
  background: 'none',
  border: '1px solid #e5e5e7',
  borderRadius: '6px',
  padding: '8px 16px', // Más compacto
  fontSize: '11px',
  color: '#1d1d1f',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: '500'
};

const saveButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: '#1d1d1f',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '8px 16px', // Más compacto
  fontSize: '11px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background 0.15s ease',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const disabledButtonStyle = {
  opacity: 0.6,
  cursor: 'not-allowed'
};

const buttonIconStyle = {
  fontSize: '16px'
};

const loadingIconStyle = {
  fontSize: '16px',
  animation: 'spin 1s linear infinite'
};

export default UsuarioForm;

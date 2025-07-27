import React, { useState, useEffect } from 'react';

const MetodoPagoForm = ({ metodoPago, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    nombre: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar datos cuando se edita un método de pago
  useEffect(() => {
    if (metodoPago) {
      setFormData({
        nombre: metodoPago.nombre || ''
      });
    } else {
      setFormData({
        nombre: ''
      });
    }
    setErrors({});
  }, [metodoPago]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.nombre.trim().length > 50) {
      newErrors.nombre = 'El nombre no puede exceder 50 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
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
      await onSave({
        ...formData,
        nombre: formData.nombre.trim()
      });
    } catch (error) {
      console.error('Error al guardar método de pago:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Header del modal */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>
            {metodoPago ? 'Editar Método de Pago' : 'Añadir Método de Pago'}
          </h2>
          <button
            style={closeButtonStyle}
            onClick={onCancel}
            type="button"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldContainerStyle}>
            <label style={labelStyle} htmlFor="nombre">
              Nombre del método de pago
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
              placeholder="Ingresa el nombre del método de pago"
              disabled={isSubmitting}
            />
            {errors.nombre && (
              <span style={errorTextStyle}>{errors.nombre}</span>
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
                  {metodoPago ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={buttonIconStyle}>
                    {metodoPago ? 'edit' : 'add'}
                  </span>
                  {metodoPago ? 'Actualizar' : 'Guardar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Estilos (mismos que CategoriaForm)
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)'
};

const modalStyle = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
  width: '100%',
  maxWidth: '480px',
  margin: '20px',
  overflow: 'hidden'
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 20px',
  borderBottom: '1px solid #e5e5e7',
  backgroundColor: '#fafafa'
};

const titleStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1d1d1f',
  margin: 0,
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#86868b',
  padding: '4px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.15s ease'
};

const formStyle = {
  padding: '24px'
};

const fieldContainerStyle = {
  marginBottom: '24px'
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: '#1d1d1f',
  marginBottom: '8px',
  textAlign: 'left',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  fontSize: '11px',
  color: '#1d1d1f',
  border: '1px solid #e5e5e7',
  borderRadius: '6px',
  outline: 'none',
  transition: 'border-color 0.15s ease',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  boxSizing: 'border-box'
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
  paddingTop: '16px',
  borderTop: '1px solid #f5f5f7'
};

const cancelButtonStyle = {
  background: 'none',
  border: '1px solid #e5e5e7',
  borderRadius: '6px',
  padding: '8px 16px',
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
  gap: '6px',
  background: '#1d1d1f',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '8px 16px',
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

export default MetodoPagoForm;

import React from 'react';

const ConfirmDeleteModal = ({
  isOpen,
  title = 'Confirmar eliminación',
  message = '¿Estás seguro de que deseas eliminar',
  itemName = '',
  onConfirm,
  onCancel,
  isLoading = false,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar'
}) => {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>{title}</h3>
          <button style={closeButtonStyle} onClick={onCancel} type="button">
            <span className="material-symbols-outlined" style={closeIconStyle}>close</span>
          </button>
        </div>
        <div style={contentStyle}>
          <p style={messageStyle}>
            {message} <strong>{itemName}</strong>?
          </p>
        </div>
        <div style={buttonContainerStyle}>
          <button
            style={cancelButtonStyle}
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              ...confirmButtonStyle,
              ...(isLoading ? disabledButtonStyle : {})
            }}
          >
            {isLoading ? (
              <span className="material-symbols-outlined" style={loadingIconStyle}>refresh</span>
            ) : (
              <span className="material-symbols-outlined" style={deleteIconStyle}>delete</span>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Estilos
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
  maxWidth: '400px',
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
  fontSize: '16px',
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

const closeIconStyle = {
  fontSize: '18px'
};

const contentStyle = {
  padding: '20px',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const messageStyle = {
  fontSize: '12px',
  color: '#1d1d1f',
  margin: 0
};

const buttonContainerStyle = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  padding: '16px',
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

const confirmButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: '#ff3b30',
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

const deleteIconStyle = {
  fontSize: '16px'
};

const loadingIconStyle = {
  fontSize: '16px',
  animation: 'spin 1s linear infinite'
};

export default ConfirmDeleteModal;

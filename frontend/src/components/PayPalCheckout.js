import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { descargarArchivo } from '../services/archivosService';
import { createTransaccionPayPal } from '../services/transaccionesService';

const PayPalCheckout = ({ archivo, user, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const PAYPAL_CLIENT_ID = "test";
  
  const isProduction = PAYPAL_CLIENT_ID !== "test";
  const isSandbox = true;
  
  const initialOptions = {
    "client-id": PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture"
  };

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: archivo.precio.toString(),
            currency_code: "USD"
          },
          description: `Compra de archivo: ${archivo.nombre_archivo}`,
          custom_id: archivo.id_archivo.toString()
        }
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING"
      }
    });
  };

  const onApprove = async (data, actions) => {
    try {
      setLoading(true);
      setError('');

      const details = await actions.order.capture();
      console.log('Pago completado:', details);

      if (details.status === 'COMPLETED') {
        try {
          const transaccionData = {
            id_archivo: archivo.id_archivo,
            id_comprador: user.id_usuario,
            monto: parseFloat(archivo.precio),
            paypal_transaction_id: details.id,
            paypal_payer_email: details.payer.email_address,
            paypal_payer_name: details.payer.name.given_name + ' ' + details.payer.name.surname
          };

          console.log('Guardando transacción:', transaccionData);
          const transaccionResult = await createTransaccionPayPal(transaccionData);
          console.log('Transacción guardada:', transaccionResult);

          await descargarArchivo(archivo.id_archivo, archivo.nombre_archivo);
          
          onSuccess({
            transactionId: details.id,
            payerName: details.payer.name.given_name + ' ' + details.payer.name.surname,
            payerEmail: details.payer.email_address,
            amount: details.purchase_units[0].amount.value,
            currency: details.purchase_units[0].amount.currency_code,
            status: details.status,
            archivo: archivo,
            transaccion_backend: transaccionResult.transaccion
          });

        } catch (backendError) {
          console.error('Error guardando transacción en backend:', backendError);
          try {
            await descargarArchivo(archivo.id_archivo, archivo.nombre_archivo);
            onSuccess({
              transactionId: details.id,
              payerName: details.payer.name.given_name + ' ' + details.payer.name.surname,
              payerEmail: details.payer.email_address,
              amount: details.purchase_units[0].amount.value,
              currency: details.purchase_units[0].amount.currency_code,
              status: details.status,
              archivo: archivo,
              backend_error: backendError.message
            });
          } catch (downloadError) {
            setError('El pago fue exitoso, pero hubo problemas con el registro y la descarga. Contacta al soporte con el ID de transacción: ' + details.id);
          }
        }
      } else {
        setError('El pago no se completó correctamente.');
      }
    } catch (error) {
      console.error('Error procesando el pago:', error);
      setError('Hubo un error procesando el pago. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const onError = (err) => {
    console.error('Error de PayPal completo:', err);
    console.error('Tipo de error:', typeof err);
    console.error('Error stringificado:', JSON.stringify(err, null, 2));
    setError(`Error de PayPal: ${err?.message || 'Error desconocido'}. Intenta recargar la página.`);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Completar Compra</h2>
          <button 
            style={closeButtonStyle}
            onClick={onClose}
            disabled={loading}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div style={fileInfoStyle}>
          <div style={fileDetailsStyle}>
            <h3 style={fileNameStyle}>{archivo.nombre_archivo}</h3>
            <p style={fileDescriptionStyle}>{archivo.descripcion}</p>
            <div style={priceContainerStyle}>
              <span style={priceStyle}>${parseFloat(archivo.precio).toFixed(2)} USD</span>
            </div>
          </div>
        </div>

        {error && (
          <div style={errorStyle}>
            <span className="material-symbols-outlined" style={errorIconStyle}>error</span>
            {error}
          </div>
        )}

        {loading && (
          <div style={loadingOverlayStyle}>
            <div style={loadingContentStyle}>
              <div style={spinnerStyle}></div>
              <p style={loadingTextStyle}>Procesando pago y preparando descarga...</p>
            </div>
          </div>
        )}

        <div style={paypalContainerStyle}>
          {isSandbox && (
            <div style={sandboxModeWarningStyle}>
              <span className="material-symbols-outlined" style={warningIconStyle}>science</span>
              <span>Modo Sandbox - Simulación de pagos (sin cobros reales)</span>
            </div>
          )}
          {!isSandbox && (
            <div style={prodModeWarningStyle}>
              <span className="material-symbols-outlined" style={prodIconStyle}>verified</span>
              <span>Modo producción - Cobros reales activados</span>
            </div>
          )}
          
          <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
              style={{
                layout: "vertical",
                color: "blue",
                shape: "rect",
                label: "paypal"
              }}
              createOrder={createOrder}
              onApprove={onApprove}
              onError={onError}
              disabled={loading}
            />
          </PayPalScriptProvider>
        </div>

        <div style={footerStyle}>
          <p style={securityTextStyle}>
            <span className="material-symbols-outlined" style={securityIconStyle}>security</span>
            Transacción segura procesada por PayPal
          </p>
        </div>
      </div>
    </div>
  );
};

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
  zIndex: 10000,
  padding: '20px'
};

const modalStyle = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  width: '100%',
  maxWidth: '500px',
  maxHeight: '90vh',
  overflow: 'auto',
  position: 'relative',
  fontFamily: '"Neutral Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '24px 24px 0 24px',
  borderBottom: '1px solid #e5e5e7',
  paddingBottom: '16px',
  marginBottom: '24px'
};

const titleStyle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#1d1d1f',
  margin: 0
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#86868b',
  fontSize: '24px',
  padding: '4px',
  borderRadius: '6px',
  transition: 'background-color 0.15s ease'
};

const fileInfoStyle = {
  padding: '0 24px 24px 24px',
  borderBottom: '1px solid #e5e5e7',
  marginBottom: '24px'
};

const fileDetailsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const fileNameStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1d1d1f',
  margin: 0
};

const fileDescriptionStyle = {
  fontSize: '12px',
  color: '#86868b',
  margin: 0,
  lineHeight: '1.4'
};

const priceContainerStyle = {
  marginTop: '8px'
};

const priceStyle = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#70AD47'
};

const errorStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 24px',
  backgroundColor: '#fff5f5',
  color: '#dc3545',
  fontSize: '12px',
  marginBottom: '24px',
  marginLeft: '24px',
  marginRight: '24px',
  borderRadius: '6px',
  border: '1px solid #fecaca'
};

const errorIconStyle = {
  fontSize: '16px'
};

const loadingOverlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '12px',
  zIndex: 1
};

const loadingContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px'
};

const spinnerStyle = {
  width: '32px',
  height: '32px',
  border: '3px solid #e5e5e7',
  borderTop: '3px solid #1d1d1f',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

const loadingTextStyle = {
  fontSize: '14px',
  color: '#1d1d1f',
  textAlign: 'center',
  margin: 0
};

const paypalContainerStyle = {
  padding: '0 24px 24px 24px'
};

const sandboxModeWarningStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: '#e1f5fe',
  color: '#01579b',
  fontSize: '11px',
  marginBottom: '16px',
  borderRadius: '6px',
  border: '1px solid #81d4fa'
};

const devModeWarningStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: '#fff3cd',
  color: '#856404',
  fontSize: '11px',
  marginBottom: '16px',
  borderRadius: '6px',
  border: '1px solid #ffeaa7'
};

const prodModeWarningStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: '#d1ecf1',
  color: '#0c5460',
  fontSize: '11px',
  marginBottom: '16px',
  borderRadius: '6px',
  border: '1px solid #bee5eb'
};

const warningIconStyle = {
  fontSize: '14px'
};

const prodIconStyle = {
  fontSize: '14px'
};

const footerStyle = {
  padding: '16px 24px 24px 24px',
  borderTop: '1px solid #e5e5e7',
  textAlign: 'center'
};

const securityTextStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  fontSize: '11px',
  color: '#86868b',
  margin: 0
};

const securityIconStyle = {
  fontSize: '14px'
};

const spinKeyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

if (!document.getElementById('paypal-checkout-styles')) {
  const style = document.createElement('style');
  style.id = 'paypal-checkout-styles';
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

export default PayPalCheckout;

import React, { useState } from 'react';
import Login from './components/Login';
import ArchivoManager from './components/ArchivoManager';
import LandingPage from './components/LandingPage';
import VendedorDashboard from './components/VendedorDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import { authService } from './services/authService';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [userInfo, setUserInfo] = useState(null);
  
  // Verificar autenticación al cargar
  React.useEffect(() => {
    const isAuthenticated = authService.isAuthenticated();
    console.log('Usuario autenticado:', isAuthenticated);
  }, []);

  const handleLoginClick = () => {
    setCurrentPage('login');
  };

  const handleLoginSuccess = (userData) => {
    setUserInfo(userData);
    
    // Redirigir basado en el rol del usuario
    const userRole = userData.user.tipo || userData.user.rol;
    console.log('Rol del usuario:', userRole);
    
    switch (userRole) {
      case 'Vendedor':
        setCurrentPage('vendedor-dashboard');
        break;
      case 'SuperAdmin':
        setCurrentPage('superadmin-dashboard');
        break;
      case 'Admin':
        setCurrentPage('superadmin-dashboard'); // Los Admin van al mismo dashboard que SuperAdmin
        break;
      case 'Cliente':
      default:
        setCurrentPage('cliente-dashboard'); // Por ahora usamos el dashboard de archivos
        break;
    }
  };

  const handleLogout = () => {
    authService.removeToken();
    setUserInfo(null);
    setCurrentPage('landing');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onLoginClick={handleLoginClick} />;
      
      case 'login':
        return (
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            onBackToHome={() => setCurrentPage('landing')} // ← Esta función hace que regrese
          />
        );
      
      case 'vendedor-dashboard':
        return <VendedorDashboard onLogout={handleLogout} />;
      
      case 'superadmin-dashboard':
        return <SuperAdminDashboard onLogout={handleLogout} />;
      
      case 'cliente-dashboard':
        return (
          <div>
            {/* Header para clientes */}
            <div style={{
              padding: '15px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px' }}>templi - Panel Cliente</h2>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  color: 'white',
                  backgroundColor: '#dc3545',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cerrar Sesión
              </button>
            </div>
            <ArchivoManager />
          </div>
        );
      
      default:
        return <LandingPage onLoginClick={handleLoginClick} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
}

export default App;

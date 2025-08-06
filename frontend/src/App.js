import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import VendedorDashboard from './components/VendedorDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import UserProfile from './components/UserProfile'; 
import Marketplace from './components/Marketplace';
import { authService } from './services/authService';
import './App.css';

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);

  const handleLoginClick = () => {
    setCurrentPage('login');
  };

  const handleRegisterClick = () => {
    setCurrentPage('register');
  };

  const handleLoginSuccess = (userData) => {
    console.log('Datos de usuario recibidos:', userData.user); // Para debug
    setUser(userData.user);
    
    const userType = userData.user.id_tipo_usuario;
    console.log('Tipo de usuario:', userType); // Para debug
    
    if (userType === 3) {
      console.log('Redirigiendo a SuperAdmin Dashboard');
      setCurrentPage('superadmin-dashboard');
    } else if (userType === 2) {
      console.log('Redirigiendo a Vendedor Dashboard');
      setCurrentPage('vendedor-dashboard');
    } else {
      console.log('Redirigiendo a Cliente Dashboard (Landing)');
      setCurrentPage('cliente-dashboard');
    }
  };

  const handleProfileClick = () => {
    setCurrentPage('user-profile');
  };

  const handleMarketplaceClick = () => {
    setCurrentPage('marketplace');
  };

  const handleBackToHome = () => {
    if (user) {
      setCurrentPage('cliente-dashboard');
    } else {
      setCurrentPage('landing');
    }
  };

  const handleLogout = () => {
    authService.removeToken();
    setUser(null);
    setCurrentPage('landing');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage 
            onLoginClick={handleLoginClick} 
            onMarketplaceClick={handleMarketplaceClick}
          />
        );
      
      case 'login':
        return (
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            onBackToHome={() => setCurrentPage('landing')}
            onRegisterClick={handleRegisterClick}
          />
        );
      
      case 'register':
        return (
          <Register 
            onRegisterSuccess={handleLoginSuccess}
            onBackToHome={() => setCurrentPage('landing')}
            onBackToLogin={() => setCurrentPage('login')}
          />
        );
      
      case 'vendedor-dashboard':
        return <VendedorDashboard onLogout={handleLogout} user={user} />;
      
      case 'superadmin-dashboard':
        return <SuperAdminDashboard onLogout={handleLogout} user={user} />;
      
      case 'cliente-dashboard':
        // Para clientes, mostrar landing con datos del usuario
        return (
          <LandingPage 
            onLoginClick={handleLoginClick}
            user={user} // ← Pasar datos del usuario
            onLogout={handleLogout} // ← Pasar función de logout
            onProfileClick={handleProfileClick} // ← Pasar función para ir al perfil
            onMarketplaceClick={handleMarketplaceClick} // ← Pasar función para ir al marketplace
          />
        );
      
      case 'marketplace':
        return (
          <Marketplace
            user={user}
            onBackToHome={handleBackToHome}
            onProfileClick={handleProfileClick}
            onLoginClick={handleLoginClick}
          />
        );
      
      case 'user-profile':
        return (
          <UserProfile 
            user={user}
            onLogout={handleLogout}
            onBackToHome={handleBackToHome}
          />
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
};

export default App;
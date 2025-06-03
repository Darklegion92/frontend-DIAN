import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import CompanyList from './components/CompanyList';
import CreateCompany from './components/CreateCompany';
import ResolutionList from './components/ResolutionList';
import DocumentList from './components/DocumentList';
import UserManagement from './components/UserManagement';
import UserProfile from './components/UserProfile';
import AdminRoute from './components/AdminRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="xl" color="primary" />
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para rutas de invitado (solo accesibles sin autenticación)
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="xl" color="primary" />
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/companies" replace />;
  }

  return <>{children}</>;
};

// Componente principal de la aplicación
const AppContent: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta raíz - redirige a companies si está autenticado, sino al login */}
          <Route 
            path="/" 
            element={
              <Navigate to="/companies" replace />
            } 
          />
          
          {/* Rutas de invitado */}
          <Route 
            path="/login" 
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            } 
          />
          
          {/* Rutas protegidas */}
          <Route 
            path="/companies" 
            element={
              <ProtectedRoute>
                <Layout>
                  <CompanyList />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/companies/create" 
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateCompany />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/companies/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateCompany />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/companies/:companyId/resolutions" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ResolutionList />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/documents" 
            element={
              <ProtectedRoute>
                <Layout>
                  <DocumentList />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Perfil de usuario (Todos los usuarios autenticados) */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Layout>
                  <UserProfile />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Rutas de administración (Solo ADMIN) */}
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout>
                    <UserManagement />
                  </Layout>
                </AdminRoute>
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta por defecto - redirige al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

// Componente App principal con el proveedor de autenticación
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

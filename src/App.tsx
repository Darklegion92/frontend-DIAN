import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { UserRole } from './services/authService';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import CompanyList from './components/CompanyList';
import CreateCompany from './components/CreateCompany';
import ResolutionList from './components/ResolutionList';
import DocumentList from './components/DocumentList';
import UserManagement from './components/UserManagement';
import UserProfile from './components/UserProfile';
import RoleBasedRoute from './components/RoleBasedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import { ReceivedDocumentsList } from './components/ReceivedDocuments/ReceivedDocumentsList';
import VersionManagement from './components/VersionManagement';

// Componente para rutas protegidas (requiere autenticación)
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
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

// Componente principal de la aplicación
const AppContent: React.FC = () => {
  const { user } = useAuth();
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta raíz - redirige a perfil (accesible para todos) */}
          <Route 
            path="/" 
            element={
              <Navigate to="/profile" replace />
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
          
          {/* RUTAS DE EMPRESAS - SOLO DEALER Y ADMIN */}
          <Route 
            path="/companies" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.DEALER]}>
                  <Layout>
                    <CompanyList />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/companies/create" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.DEALER]}>
                  <Layout>
                    <CreateCompany />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/companies/:id" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.DEALER]}>
                  <Layout>
                    <CreateCompany />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/companies/:companyId/resolutions" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.DEALER]}>
                  <Layout>
                    <ResolutionList />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />
          
          {/* RUTAS DE DOCUMENTOS - ADMIN Y DEALER */}
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

          {/* RUTAS DE DOCUMENTOS RECIBIDOS - ADMIN Y DEALER */}
          {user?.company_document && (
            <Route 
              path="/received-documents" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReceivedDocumentsList />
                  </Layout>
                </ProtectedRoute>
              } 
            />
          )}

          {/* RUTA DE PERFIL - TODOS */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.DEALER, UserRole.USER]}>
                  <Layout>
                    <UserProfile />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />

          {/* RUTAS DE USUARIOS - SOLO ADMIN */}
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={[UserRole.ADMIN]}>
                  <Layout>
                    <UserManagement />
                  </Layout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />

          {/* RUTAS DE GESTIÓN DE VERSIONES - SOLO ADMIN */}
          <Route 
            path="/admin/versions" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={[UserRole.ADMIN]}>
                  <Layout>
                    <VersionManagement />
                  </Layout>
                </RoleBasedRoute>
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

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { User, UserRole, CreateUserData, UpdateUserData, authService } from '../services/authService';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import UserModal from './UserModal';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.getUsers({
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });
      
      setUsers(response.data.data);
      setTotalPages(response.data.meta.totalPages);
      setTotalUsers(response.data.meta.totalItems);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: CreateUserData | UpdateUserData) => {
    try {
      // Verificar que tenemos todos los campos requeridos para crear un usuario
      if (!userData.username || !userData.email || !userData.name || !userData.role) {
        throw new Error('Todos los campos son requeridos para crear un usuario');
      }
      
      // Para crear usuario, necesitamos convertir a CreateUserData
      const createData: CreateUserData = {
        username: userData.username,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        password: (userData as CreateUserData).password || ''
      };
      
      if (!createData.password) {
        throw new Error('La contraseña es requerida para crear un usuario');
      }
      
      await authService.createUser(createData);
      await loadUsers();
      setIsModalOpen(false);
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateUser = async (id: string, userData: CreateUserData | UpdateUserData) => {
    try {
      // Para actualizar, podemos usar UpdateUserData directamente
      const updateData: UpdateUserData = {
        username: userData.username,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        company_document: userData.company_document,
        document_person_responsible: userData.document_person_responsible,
        first_name_person_responsible: userData.first_name_person_responsible,
        last_name_person_responsible: userData.last_name_person_responsible,
        job_title_person_responsible: userData.job_title_person_responsible,
        organization_department_person_responsible: userData.organization_department_person_responsible,
      };
      
      // Solo incluir contraseña si se proporcionó
      if ((userData as CreateUserData).password) {
        updateData.password = (userData as CreateUserData).password;
      }
      
      await authService.updateUser(id, updateData);
      await loadUsers();
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      throw error;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.DEALER:
        return 'bg-yellow-100 text-yellow-800';
      case UserRole.USER:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrador';
      case UserRole.DEALER:
        return 'Distribuidor';
      case UserRole.USER:
        return 'Usuario';
      default:
        return role;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" color="primary" />
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="h-8 w-8 text-soltec-primary mr-3" />
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-1">
              Administra todos los usuarios del sistema
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Usuario</span>
          </Button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soltec-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole | 'ALL')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-soltec-primary focus:border-transparent"
            >
              <option value="ALL">Todos los roles</option>
              <option value={UserRole.ADMIN}>Administradores</option>
              <option value={UserRole.DEALER}>Distribuidores</option>
              <option value={UserRole.USER}>Usuarios</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
          <div className="text-sm text-gray-600">Total de usuarios</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-red-600">
            {users.filter(u => u.role === UserRole.ADMIN).length}
          </div>
          <div className="text-sm text-gray-600">Administradores</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-yellow-600">
            {users.filter(u => u.role === UserRole.DEALER).length}
          </div>
          <div className="text-sm text-gray-600">Distribuidores</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.role === UserRole.USER).length}
          </div>
          <div className="text-sm text-gray-600">Usuarios</div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            className="mt-2"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingUser(user);
                          setIsModalOpen(true);
                        }}
                        className="flex items-center space-x-1"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Editar</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando página <span className="font-medium">{currentPage}</span> de{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={editingUser ? 
          (userData) => handleUpdateUser(editingUser.id, userData) :
          handleCreateUser
        }
        user={editingUser}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
      />
    </div>
  );
};

export default UserManagement; 
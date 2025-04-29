// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();
export default AuthContext;

// Configuración base de Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
  timeout: 10000, // 10 segundos de timeout
});

// Clase para manejar errores de forma más descriptiva
class ApiErrorHandler {
  static getErrorMessage(error) {
    if (error.response) {
      // Errores de servidor (4xx, 5xx)
      const { status, data } = error.response;
      
      switch(status) {
        case 400:
          return this.handle400Error(data);
        case 401:
          return 'No se encontró el usuario. Por favor verifique sus credenciales.';	
        case 403:
          return 'No tiene permisos para realizar esta acción.';
        case 404:
          return 'Recurso no encontrado.';
        case 422:
          return this.handle422Error(data);
        case 429:
          return 'Demasiadas solicitudes. Por favor espere un momento.';
        case 500:
          return 'Error interno del servidor. Por favor intente más tarde.';
        default:
          return data?.message || `Error en la solicitud (${status})`;
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no hubo respuesta
      return 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
    } else {
      // Error al configurar la solicitud
      return 'Error al procesar la solicitud.';
    }
  }

  static handle400Error(data) {
    if (typeof data === 'string') return data;
    
    // Manejo de errores de validación
    if (data.errors) {
      return Object.values(data.errors).join(' ');
    }
    
    if (data.detail) return data.detail;
    
    if (typeof data === 'object') {
      const firstError = Object.values(data)[0];
      if (Array.isArray(firstError)) {
        return firstError[0];
      }
      return firstError || 'Datos inválidos';
    }
    
    return 'Solicitud incorrecta';
  }

  static handle422Error(data) {
    if (data.detail) return data.detail;
    
    // Manejo especial para errores de validación de formularios
    const errors = [];
    for (const field in data) {
      if (Array.isArray(data[field])) {
        errors.push(`${field}: ${data[field].join(', ')}`);
      } else {
        errors.push(`${field}: ${data[field]}`);
      }
    }
    
    return errors.length > 0 ? errors.join(' | ') : 'Error de validación';
  }
}

// Interceptor para añadir el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const errorMessage = ApiErrorHandler.getErrorMessage(error);
    
    // Si el error es 401 y no es una solicitud de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw error;
        
        const { data } = await axios.post(`${api.defaults.baseURL}users/token/refresh/`, { 
          refresh: refreshToken 
        });
        
        localStorage.setItem('access_token', data.access);
        api.defaults.headers.Authorization = `Bearer ${data.access}`;
        
        // Reintentar la solicitud original con el nuevo token
        return api(originalRequest);
      } catch (refreshError) {
        // Mostrar mensaje más descriptivo
        const refreshErrorMessage = ApiErrorHandler.getErrorMessage(refreshError);
        toast.error(refreshErrorMessage);
        
        // Limpiar y redirigir
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
   
        return Promise.reject(refreshError);
      }
    }
    
    // Mostrar error al usuario (excepto para 401 que ya manejamos)
    if (error.response?.status !== 401) {
      toast.error(errorMessage);
    }
    
    return Promise.reject({ ...error, message: errorMessage });
  }
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [roles, setRoles] = useState([]);
  const router = useRouter();

  // Función para verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
  };

  // Validación mejorada de email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Función para determinar la ruta de redirección según el rol
  const getRedirectPathByRole = (role) => {
    const roleRoutes = {
      'JEFE': '/areaPrivada',
      'GESTOR': '/areaPrivada/areaAdministrador',
      'COMERCIAL': '/areaPrivada/areaComercial',
      'FINANZAS': '/areaPrivada/finanzas',
      'SOPORTE': '/areaPrivada/soporte'
    };
    return roleRoutes[role] || '/areaPrivada';
  };

  // Cargar usuario y verificar autenticación
  const loadUser = async () => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      if (!isAuthenticated()) {
        throw new Error('No autenticado');
      }
      
      const { data } = await api.get('/users/me/');
      setUser(data);
      
      // Guardar información básica en localStorage
      localStorage.setItem('access_email', data.email);
      localStorage.setItem('access_first_name', data.first_name || '');
      localStorage.setItem('access_last_name', data.last_name || '');
      
      // Manejar roles
    const rolesArray = data.role ? [data.role] : [];
    setRoles(rolesArray);
    localStorage.setItem('user_roles', JSON.stringify(rolesArray));
    setAdmin(rolesArray.includes('JEFE') || Boolean(data.is_superuser));
    
    return data;
    } catch (error) {
      const errorMessage = ApiErrorHandler.getErrorMessage(error);
      setAuthError(errorMessage);
      
      // Limpiar si el error es de autenticación
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para cargar usuario al inicio
  useEffect(() => {
    if (isAuthenticated()) {
      loadUser().catch(() => {});
    } else {
      setIsLoading(false);
    }
  }, []);

  // Efecto para redirección según autenticación
  // Efecto para redirección según autenticación
useEffect(() => {
  const handleRouteChange = (url) => {
    // Rutas públicas que no requieren autenticación
    const publicRoutes = [
      '/',
      '/formularioGoogleSheets',
      '/areaPrivada/users/login',
      '/areaPrivada/users/signUp',
      '/areaPrivada/users/forgotPassword',
      '/areaPrivada/users/resetPassword',
      '/self-management'
    ];
    
    const path = url.split('?')[0];
    
    // Si es una ruta pública, no hacer ninguna verificación
    if (publicRoutes.includes(path)) {
      return;
    }
    
    // Verificar si la ruta es parte del área privada
    const isPrivateRoute = path.startsWith('/areaPrivada');
    
    // Si es una ruta privada y no está autenticado, redirigir a login
    if (isPrivateRoute && !isAuthenticated()) {
      router.push(`/areaPrivada/users/login`);
      return;
    }
    
    // Si está autenticado y trata de acceder a login/signup, redirigir según rol
    if (isAuthenticated() && ['/areaPrivada/users/login', '/areaPrivada/users/signUp'].includes(path)) {
      const roles = JSON.parse(localStorage.getItem('user_roles') || '[]');
      const mainRole = roles[0] || 'USER';
      router.push(getRedirectPathByRole(mainRole));
      return;
    }
    
    // Si es ruta privada, verificar permisos según rol
    if (isPrivateRoute && isAuthenticated()) {
      const userRoles = JSON.parse(localStorage.getItem('user_roles') || '[]');
      
      // Verificar acceso basado en rutas específicas por rol
      if (path.startsWith('/areaPrivada/areaComercial') && !userRoles.includes('COMERCIAL')) {
        router.push('/unauthorized');
        return;
      }
      
      if (path.startsWith('/areaPrivada/areaAdministracion') && !userRoles.includes('GESTOR')) {
        router.push('/unauthorized');
        return;
      }
      
      if (path.startsWith('/areaPrivada/finanzas') && !userRoles.includes('FINANZAS')) {
        router.push('/unauthorized');
        return;
      }
      
      if (path.startsWith('/areaPrivada/soporte') && !userRoles.includes('SOPORTE')) {
        router.push('/unauthorized');
        return;
      }
      
      // Rutas exclusivas para JEFE
      if (path.startsWith('/areaPrivada/') && !userRoles.includes('JEFE')) {
        router.push('/unauthorized');
        return;
      }
    }
  };

  // Ejecutar al montar el componente
  handleRouteChange(router.pathname);
  
  // Suscribirse a cambios de ruta
  router.events.on('routeChangeStart', handleRouteChange);
  
  return () => {
    router.events.off('routeChangeStart', handleRouteChange);
  };
}, [router]);

  // Función de login mejorada
  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      // Validaciones frontend más estrictas
      if (!email || !validateEmail(email)) {
        throw new Error('Por favor ingrese un email válido');
      }
      
      if (!password || password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      
      const response = await api.post('/users/token/', { email, password })
        .catch(error => {
          // Manejo específico para errores de credenciales
          if (error.response?.status === 401) {
            throw new Error('Credenciales incorrectas. Por favor verifique su email y contraseña.');
          }
          throw error;
        });
      
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Obtener información del usuario
      const userData = await loadUser();
      
      // Mostrar mensaje de bienvenida
      toast.success(`Bienvenido ${userData.first_name || ''}`);
      // Redirigir inmediatamente después del login exitoso
    const roles = JSON.parse(localStorage.getItem('user_roles') || '[]');
    const redirectPath = getRedirectPathByRole(roles[0] || 'USER');
    router.push(redirectPath);
      // Devuelve un objeto consistente
      return { 
        success: true, 
        user: userData,
        error: null 
      };
    } catch (error) {
      const errorMessage = error.message || ApiErrorHandler.getErrorMessage(error);
      setAuthError(errorMessage);
      toast.error(errorMessage);
      
      // Devuelve un objeto consistente incluso en errores
      return { 
        success: false, 
        user: null,
        error: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout mejorada
  const logout = async () => {
    try {
     
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar todo
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_roles');
      localStorage.removeItem('access_email');
      localStorage.removeItem('access_first_name');
      localStorage.removeItem('access_last_name');
      
      setUser(null);
      setRoles([]);
      setAdmin(false);
      
      // Redirigir a login con mensaje
      router.push('/areaPrivada/users/login?logout=success');
    }
  };

  // Función de registro mejorada
  const register = async (userData) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      // Validaciones frontend
      if (!validateEmail(userData.email)) {
        throw new Error('Por favor ingrese un email válido');
      }
      
      if (userData.password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }
      
      if (userData.password !== userData.password2) {
        throw new Error('Las contraseñas no coinciden');
      }
      
      await api.post('/users/register/', userData);
      toast.success('Registro exitoso. Por favor inicie sesión.');
      
      return { success: true };
    } catch (error) {
      const errorMessage = ApiErrorHandler.getErrorMessage(error);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Función para verificar permisos
  const hasPermission = (requiredRole) => {
    if (!user) return false;
    return user.role === requiredRole || 
           (user.roles && user.role.includes(requiredRole)) || 
           user.is_superuser;
  };

  // Función para refrescar token
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No hay token de refresco');
      
      const { data } = await axios.post(`${api.defaults.baseURL}users/token/refresh/`, { 
        refresh: refreshToken 
      });
      
      localStorage.setItem('access_token', data.access);
      api.defaults.headers.Authorization = `Bearer ${data.access}`;
      return data.access;
    } catch (error) {
      logout();
      throw error;
    }
  };

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role || (user.roles && user.roles.includes(role));
  };

  // Valor del contexto
  const contextValue = {
    user,
    isLoading,
    authError,
    api,
    roles,
    admin,
    isAuthenticated,
    hasPermission,
    login,
    logout,
    register,
    loadUser,
    refreshToken,
    hasRole, // Función para verificar roles
    validateEmail
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
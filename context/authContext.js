// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const AuthContext = createContext();
export default AuthContext;


// Configuración base de Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
});

// Interceptor para añadir el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 y no es una solicitud de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${api.defaults.baseURL}users/token/refresh/`, { refresh: refreshToken });
        console.log(data)
        localStorage.setItem('access_token', data.access);
        api.defaults.headers.Authorization = `Bearer ${data.access}`;
        
        // Reintentar la solicitud original
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla, limpiar todo y redirigir a login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authToken, setAuthToken] = useState("");

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
    switch(role) {
      case 'JEFE':
        return '/areaPrivada';
      case 'GESTOR':
        return '/areaPrivada/areaAdministrador';
      case 'COMERCIAL':
        return '/areaPrivada/areaComercial';
      default:
        return '/areaPrivada'; // Ruta por defecto
    }
  };

  // Redirigir según rol si está autenticado
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (isAuthenticated()) {
        try {
          const { data } = await api.get('/users/me/');
          localStorage.setItem('access_email', data.email);
          localStorage.setItem('access_first_name', data.first_name);
          localStorage.setItem('access_last_name', data.last_name);
          
          // Guardar información de roles
          if (data.roles) {
            setRoles(data.roles);
            localStorage.setItem('user_roles', JSON.stringify(data.roles));
          }
          
          setUser(data);
          
          // Redirigir según el rol principal
          if (data.role) {
            const redirectPath = getRedirectPathByRole(data.role);
            
            // Solo redirigir si estamos en una ruta de login/register
            if (['/areaPrivada/users/login'].includes(router.pathname)) {
              router.push(redirectPath);
            }
          }
        } catch (error) {
          // Si hay error al verificar el usuario, limpiar tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuthAndRedirect();
  }, [router.pathname]);

  // Cargar usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await api.get('/users/me/');
        setUser(data);
        
        // Guardar información de roles
        if (data.roles) {
          setRoles(data.roles);
          localStorage.setItem('user_roles', JSON.stringify(data.roles));
          
          // Verificar si es admin (puedes ajustar según tu lógica)
          setAdmin(data.roles.includes('ADMIN') || data.role === 'JEFE');
        }
        
        setAuthError(null);
      } catch (error) {
        setUser(null);
        setAuthError(error.response?.data?.detail || 'Error al cargar usuario');
      } finally {
        setIsLoading(false);
      }
    };

    // Solo cargar si hay token
    if (localStorage.getItem('access_token')) {
      loadUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Función de login mejorada con redirección por rol
  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      // Validaciones
      if (!validateEmail(email)) {
        throw new Error('Email inválido');
      }
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      const { data } = await api.post('/users/token/', { email, password });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      const userResponse = await api.get('/users/me/');
      setUser(userResponse.data);
      
      // Guardar roles
      if (userResponse.data.roles) {
        setRoles(userResponse.data.roles);
        localStorage.setItem('user_roles', JSON.stringify(userResponse.data.roles));
      }
      
      // Redirigir según el rol
      const redirectPath = getRedirectPathByRole(userResponse.data.role);
      router.push(redirectPath);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Error al iniciar sesión';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout mejorada
  const logout = async () => {
    try {
      
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_roles');
      setUser(null);
      setRoles([]);
      router.push('/areaPrivada/users/login');
    }
  };

  // Función de registro mejorada
  const register = async (userData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      // Validaciones
      if (!validateEmail(userData.email)) {
        throw new Error('Email inválido');
      }
      if (userData.password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }
      if (userData.password !== userData.password2) {
        throw new Error('Las contraseñas no coinciden');
      }

      await api.post('users/register/', userData);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Error al registrar';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Función para refrescar el token
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token');
      
      const { data } = await axios.post(`${api.defaults.baseURL}/users/token/refresh/`, { 
        refresh: refreshToken 
      });
      
      localStorage.setItem('access_token', data.access);
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
  const value = {
    user,
    isLoading,
    authError,
    login,
    logout,
    register,
    refreshToken,
    validateEmail,
    api,
    roles,
    admin,
    hasRole, // Función para verificar roles
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
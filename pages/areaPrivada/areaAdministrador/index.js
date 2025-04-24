'use client'
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Chip, 
  Avatar, 
  TextField, 
  MenuItem, 
  Box, 
  Paper, 
  Tabs, 
  Tab,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Switch,
  FormControl,
  InputLabel,
  Select,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,LinearProgress // Añade esta importación
} from '@mui/material';
import { InputAdornment } from '@mui/material';
import AssignmentReturn from '@mui/icons-material/AssignmentReturn';
import { BarChart} from '@mui/x-charts'; // Añade estos imports
import { 
  Search, 
  FilterList, 
  Person, 
  CalendarMonth, 
  Schedule, 
  Badge,
  ArrowUpward,
  ArrowDownward,
  PeopleAlt,
  CheckCircle,
  PieChart,
  Close,
  Phone,
  Check,
  Warning,
  Error,
  PhoneCallback,
  PhoneMissed,
  PhoneDisabled,
  Info,
  Edit,
  Delete
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ProtectedRole from '@/shared/components/protectedRoute';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowBack, ExitToApp } from '@mui/icons-material';
import Lock from '@mui/icons-material/Lock';
import LockOpen from '@mui/icons-material/LockOpen';
const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  padding: theme.spacing(0.5),
  minWidth: 80,
}));

const StatCard = ({ icon, title, value, subtext }) => (
  <Card sx={{ p: 3, height: '100%', boxShadow: '0px 2px 10px rgba(0,0,0,0.05)' }}>
    <Box display="flex" alignItems="center">
      <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', mr: 2 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        <Typography variant="h4" fontWeight={600}>{value}</Typography>
        {subtext && <Typography variant="caption" color="text.secondary">{subtext}</Typography>}
      </Box>
    </Box>
  </Card>
);

const RESULTADO_LLAMADA_OPCIONES = [
  { value: 'Verificado', label: 'Verificado', icon: <Check color="success" /> },
  { value: 'No contesta', label: 'No contesta', icon: <PhoneMissed color="warning" /> },
  { value: 'Número equivocado', label: 'Número equivocado', icon: <PhoneDisabled color="error" /> },
  { value: 'Volver a llamar', label: 'Volver a llamar', icon: <PhoneCallback color="info" /> },
];

const AdminPanel = () => {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('todos');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('fecha_alta');
  const [order, setOrder] = useState('desc');
  const [selectedSocio, setSelectedSocio] = useState(null);
  const [sociosData, setSociosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [fichaTab, setFichaTab] = useState(0);
  const [pendingFilter, setPendingFilter] = useState(false);
  const [verifiedThisMonthFilter, setVerifiedThisMonthFilter] = useState(false);
  const [incidenceFilter, setIncidenceFilter] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [startDate, setStartDate] = React.useState(null);
const [endDate, setEndDate] = React.useState(null); 
  const [llamadasData, setLlamadasData] = useState([]);
  const [nuevaLlamada, setNuevaLlamada] = useState({
    resultado: '',
    notas: ''
  });
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [editMode, setEditMode] = useState(false); // Nuevo estado para controlar el modo edición
  // Crear instancia de axios
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });

  // Interceptor para añadir token a las peticiones
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, error => {
    return Promise.reject(error);
  });

  // Interceptor para manejar errores de autenticación
  api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}token/refresh/`, {
            refresh: refreshToken
          });
          
          localStorage.setItem('access_token', response.data.access);
          localStorage.setItem('refresh_token', response.data.refresh);
          
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/areaPrivada/users/login';
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/areaPrivada/users/login');
        return;
      }
      
      try {
        const response = await api.get('users/me/');
        setCurrentUserRole(response.data.role); // Asume que la API devuelve el rol en response.data.role
      } catch (error) {
        if (error.response?.status === 401) {
          handleLogout();
        }
      }
    };
  
    verifyAuth();
  }, [router]);


  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/areaPrivada/users/login');
  };
  // Obtener datos de la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sociosResponse, usersResponse] = await Promise.all([
          api.get('users/socio/'),
          api.get('users/')
        ]);
        setSociosData(sociosResponse.data);
        setUsersData(usersResponse.data);
        calculateStats(sociosResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Obtener llamadas cuando se selecciona un socio
  useEffect(() => {
    const fetchLlamadas = async () => {
      if (!selectedSocio) return;
      
      try {
        const response = await api.get('llamadas/', {
          params: { socio_id: selectedSocio.id } // Cambiado para filtrar correctamente por socio_id
        });
        
        setLlamadasData(response.data || []);
        
      } catch (error) {
        if (error.response) {
          switch(error.response.status) {
            case 401:
              console.error('No autorizado - Redirigiendo a login');
              break;
            case 404:
              setLlamadasData([]);
              break;
            default:
              console.error('Error al obtener llamadas:', error.response.data);
              setLlamadasData([]);
          }
        } else {
          console.error('Error de conexión:', error.message);
          setLlamadasData([]);
        }
      }
    };

    fetchLlamadas();
  }, [selectedSocio]);

  // Calcular estadísticas
  const calculateStats = (data) => {
    const totalSocios = data.length;
    const sociosActivos = data.filter(s => s.activo).length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const sociosVerificadosEsteMes = data.filter(s => {
      if (!s.fecha_verificacion) return false;
      const fechaVerificacion = new Date(s.fecha_verificacion);
      return (
        fechaVerificacion.getMonth() === currentMonth && 
        fechaVerificacion.getFullYear() === currentYear
      );
    }).length;
    
    const sociosPendientes = data.filter(s => s.status === 'Pendiente').length;
    const sociosConIncidencia = data.filter(s => s.devolucion === false).length;

    // Género
    const generoDist = {
      masculino: data.filter(s => s.genero_socio?.toLowerCase() === 'masculino').length,
      femenino: data.filter(s => s.genero_socio?.toLowerCase() === 'femenino').length
    };

    // Edades
    const hoy = new Date();
    const edades = data.map(s => {
      if (!s.fecha_nacimiento) return 0;
      const nacimiento = new Date(s.fecha_nacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      return edad;
    }).filter(e => e > 0);
    
    const edadPromedio = edades.length > 0 ? Math.round(edades.reduce((a, b) => a + b, 0) / edades.length) : 0;
        // En calculateStats:
const distribucionEdad = [0, 0, 0, 0, 0]; // [<20, 20-30, 30-40, 40-50, 50+]
edades.forEach(edad => {
  if (edad < 20) distribucionEdad[0]++;
  else if (edad <= 30) distribucionEdad[1]++;
  else if (edad <= 40) distribucionEdad[2]++;
  else if (edad <= 50) distribucionEdad[3]++;
  else distribucionEdad[4]++;
});
    setStats({
      total_socios: totalSocios,
      socios_activos: sociosActivos,
      porcentaje_activos: totalSocios > 0 ? Math.round((sociosActivos / totalSocios) * 100) : 0,
      socios_verificados_mes: sociosVerificadosEsteMes,
      socios_pendientes: sociosPendientes,
      socios_con_incidencia: sociosConIncidencia,
      genero: generoDist,
      edad_promedio: edadPromedio,
      distribucion_edad: distribucionEdad
    });
  };
  console.log(sociosData)
  // Filtrar y ordenar datos
  const filteredData = sociosData
    .filter(socio => {
      const matchesSearch = `${socio.nombre_socio || ''} ${socio.apellido_socio || ''} ${socio.numero_identificacion_socio || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
        const matchesFilter = filter === 'todos' || 
        (filter === 'Verificado' && socio.status === 'Verificado') || 
        (filter === 'Baja' && socio.status === 'Baja') || 
        (filter === 'Incidencia' && socio.status === 'Incidencia') || 
        (filter === 'Ilocalizable' && socio.status === 'Ilocalizable')|| 
        (filter === 'Incompleto' && socio.is_borrador === true);
      const matchesPending = !pendingFilter || socio.status === 'Pendiente';
      
      const matchesVerifiedThisMonth = !verifiedThisMonthFilter || (
        socio.status === 'Verificado' &&
        socio.fecha_verificacion &&
        new Date(socio.fecha_verificacion).getMonth() === new Date().getMonth() &&
        new Date(socio.fecha_verificacion).getFullYear() === new Date().getFullYear()
      );
      
      const matchesIncidence = !incidenceFilter || socio.devolucion === false;
      
          // Nuevo filtro por rango de fechas (puedes elegir qué campo usar: fecha_alta, fecha_verificacion, etc.)
    const matchesDateRange = !startDate || !endDate || (
      new Date(socio.fecha_alta) >= new Date(startDate) && 
      new Date(socio.fecha_alta) <= new Date(endDate)
    );
    
    return matchesSearch && matchesFilter && matchesPending && 
           matchesVerifiedThisMonth && matchesIncidence && matchesDateRange;
    })
    .sort((a, b) => {
      if (orderBy === 'fecha_alta') {
        const dateA = new Date(a.fecha_alta);
        const dateB = new Date(b.fecha_alta);
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return order === 'asc' 
          ? (a[orderBy] || '') > (b[orderBy] || '') ? 1 : -1 
          : (a[orderBy] || '') < (b[orderBy] || '') ? 1 : -1;
      }
    });

  // Paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Ordenamiento
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Columnas para la tabla
  const columns = [
    { id: 'fundraiser', label: 'Comercial', sortable: true },
    { id: 'fecha_alta', label: 'Fecha Alta', sortable: true },
    { id: 'nombre_socio', label: 'Nombre', sortable: true },
    { id: 'apellido_socio', label: 'Apellidos', sortable: true },
    
    { id: 'telefono', label: 'Móvil', sortable: true },
    { id: 'ciudad_direccion', label: 'Ciudad', sortable: true },
    
    { id: 'importe', label: 'Cuota', sortable: true },
    { id: 'perioricidad', label: 'Perioricidad', sortable: true },
    { id: 'status', label: 'Estado', sortable: true },
    { id: 'no_llamadas', label: 'N° Llamadas', sortable: true },
    { id: 'fecha_verificacion', label: 'Fecha Verificación', sortable: true },
   
   
    { id: 'is_borrador', label: 'Incompletos', sortable: true }
    
  ];

  // Abrir ficha de socio
  const handleOpenSocio = (socio) => {
    setSelectedSocio({...socio});
    setFichaTab(0);
    setNuevaLlamada({
      resultado: '',
      notas: ''
    });
  };

  // Cerrar ficha de socio
  const handleCloseSocio = () => {
    setSelectedSocio(null);
  };

  // Guardar cambios del socio
  const handleSaveChanges = async () => {
  if (!selectedSocio) return;

  try {
    setSaving(true);

    // Copiamos el socio seleccionado y modificamos el fundraiser para enviar solo el ID
    const payload = {
      ...selectedSocio,
      fundraiser: selectedSocio.fundraiser.id,  // Enviamos solo el ID
    };

    await api.put(`users/socio/${selectedSocio.id}/`, payload);

    // Actualizar los datos en el estado (opcional, si quieres mantener el objeto completo en el estado)
    const updatedData = sociosData.map(socio => 
      socio.id === selectedSocio.id ? selectedSocio : socio
    );

    setSociosData(updatedData);
    calculateStats(updatedData);
    handleCloseSocio();
  } catch (error) {
    console.error('Error al guardar los cambios:', error);
  } finally {
    setSaving(false);
  }
};  

const handleDeleteSocio = async () => {
  if (!selectedSocio) return;

  try {
    setSaving(true);
    await api.delete(`users/socio/${selectedSocio.id}/`);
    
    // Actualizar la lista de socios después de eliminar
    const updatedData = sociosData.filter(socio => socio.id !== selectedSocio.id);
    setSociosData(updatedData);
    calculateStats(updatedData);
    handleCloseSocio();
    
    // Opcional: Mostrar notificación de éxito
    alert('Socio eliminado correctamente');
  } catch (error) {
    console.error('Error al eliminar el socio:', error);
    alert('Error al eliminar el socio');
  } finally {
    setSaving(false);
  }
};
// Calcular edad


  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A';
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  // Obtener información del comercial
  const getFundraiserInfo = (fundraiserId) => {
    if (!fundraiserId) return 'Sin comercial';
    console.log(fundraiserId)
    const fundraiser = usersData.find(user => user.id === fundraiserId.id);
    console.log(usersData)
    console.log(fundraiser)
    return fundraiser ? `${fundraiser.first_name} ${fundraiser.last_name}` : 'Comercial no encontrado';
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return 'N/A';
    }
  };

  // Formatear fecha corta (solo fecha)
  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return 'N/A';
    }
  };

  // Manejar cambio de estado
  const handleStatusChange = (newStatus) => {
    setSelectedSocio(prev => ({
      ...prev,
      status: newStatus,
      fecha_verificacion: newStatus === 'Verificado' ? new Date().toISOString() : prev.fecha_verificacion
    }));
  };

  // Manejar cambio en nueva llamada
  const handleLlamadaChange = (e) => {
    const { name, value } = e.target;
    setNuevaLlamada(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegistrarLlamada = async () => {
    if (!selectedSocio || !nuevaLlamada.resultado || llamadasData.length >= 10) return;
    
    try {
      setSaving(true);
      
      // Preparar datos de la llamada manteniendo la estructura completa del fundraiser
      const llamadaData = {
        socio: selectedSocio.id,
        fundraiser: selectedSocio.fundraiser?.id,  // Solo el ID para la llamada
        resultado: nuevaLlamada.resultado,
        notas: nuevaLlamada.notas,
        numero_de_llamada: (selectedSocio.no_llamadas || 0) + 1
      };
      
      // 1. Registrar la nueva llamada
      const response = await api.post('llamadas/', llamadaData);
      
      // 2. Preparar datos actualizados del socio manteniendo el fundraiser original
      const updatedSocio = {
        ...selectedSocio,
        no_llamadas: (selectedSocio.no_llamadas || 0) + 1,
        // Mantener toda la estructura del fundraiser si existe
        fundraiser: selectedSocio.fundraiser ? {
          id: selectedSocio.fundraiser.id,
          // incluir otros campos necesarios del fundraiser aquí
          ...selectedSocio.fundraiser
        } : null
      };
      
      // 3. Actualizar el socio en el backend
      // Enviar solo el ID del fundraiser para la actualización
      await api.put(`users/socio/${selectedSocio.id}/`, {
        ...updatedSocio,
        fundraiser: selectedSocio.fundraiser?.id || null
      });
  
      // 4. Actualizar estados locales manteniendo la estructura completa
      setLlamadasData(prev => [...prev, response.data]);
      setSelectedSocio(updatedSocio);
      setSociosData(prev => 
        prev.map(s => s.id === selectedSocio.id ? updatedSocio : s)
      );
      
      setNuevaLlamada({ resultado: '', notas: '' });
  
      // Si se marcó como verificado
      if (nuevaLlamada.resultado === 'Verificado') {
        const verifiedSocio = {
          ...updatedSocio,
          status: 'Verificado',
          fecha_verificacion: new Date().toISOString(),
          // Mantener la estructura del fundraiser
          fundraiser: selectedSocio.fundraiser ? {
            id: selectedSocio.fundraiser.id,
            ...selectedSocio.fundraiser
          } : null
        };
        
        // Enviar solo el ID para la actualización
        await api.put(`users/socio/${selectedSocio.id}/`, {
          ...verifiedSocio,
          fundraiser: selectedSocio.fundraiser?.id || null
        });
        
        // Actualizar estado local con la estructura completa
        setSelectedSocio(verifiedSocio);
        setSociosData(prev => 
          prev.map(s => s.id === selectedSocio.id ? verifiedSocio : s)
        );
      }
    } catch (error) {
      console.error('Error al registrar llamada:', error);
      if (error.response) {
        console.error('Detalles del error:', error.response.data);
      }
      // Podrías añadir aquí un manejo de errores para el usuario
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteLlamada = async (llamadaId) => {
    if (!llamadaId || !selectedSocio) return;
    
    try {
      setSaving(true);
      
      // 1. Eliminar la llamada
      await api.delete(`llamadas/${llamadaId}/`);
      
      // 2. Actualizar el contador de llamadas en el socio
      const updatedCount = Math.max((selectedSocio.no_llamadas || 0) - 1, 0);
      
      // Preparar datos actualizados manteniendo el fundraiser
      const updatedSocio = {
        ...selectedSocio,
        no_llamadas: updatedCount,
        // Mantener la estructura del fundraiser si existe
        fundraiser: selectedSocio.fundraiser ? {
          id: selectedSocio.fundraiser.id,
          ...selectedSocio.fundraiser
        } : null
      };
      
      // 3. Actualizar el socio en el backend (enviando solo el ID del fundraiser)
      await api.put(`users/socio/${selectedSocio.id}/`, {
        ...updatedSocio,
        fundraiser: selectedSocio.fundraiser?.id || null
      });
      
      // 4. Actualizar el estado local
      setLlamadasData(prev => prev.filter(l => l.id !== llamadaId));
      setSelectedSocio(updatedSocio);
      setSociosData(prev => 
        prev.map(s => s.id === selectedSocio.id ? updatedSocio : s)
      );
      
    } catch (error) {
      console.error('Error al eliminar llamada:', error);
      if (error.response) {
        console.error('Detalles del error:', error.response.data);
      }
      // Puedes agregar aquí un manejo de errores para el usuario
    } finally {
      setSaving(false);
    }
  };

  console.log(selectedSocio)
  console.log(llamadasData)


  // Función para manejar cambios en los campos editables
  const handleFieldChange = (field, value) => {
    setSelectedSocio(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Ajustar para la zona horaria local
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  };
  
  return (
    <ProtectedRole requiredRoles={["GESTOR", "JEFE"]}>
      <Box sx={{ p: 3, backgroundColor: '#f9fafc', minHeight: '100vh' }}>
        {/* Header */}
        <Box mb={4}>
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Typography variant="h4" fontWeight={600} mb={1}>Panel de Administración</Typography>
    
    {currentUserRole === 'JEFE' ? (
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push('/areaPrivada')}
        sx={{ mb: 1 }}
      >
        Volver
      </Button>
    ) : currentUserRole === 'GESTOR' ? (
      <Button
        startIcon={<ExitToApp />} // Asegúrate de importar ExitToApp
        onClick={handleLogout}
        sx={{ mb: 1, color: 'error.main' }}
        variant="outlined"
      >
        Cerrar sesión
      </Button>
    ) : null}
  </Box>
  <Typography variant="body1" color="text.secondary">
    Gestión completa de socios y comerciales
  </Typography>
</Box>

        {/* Filtros y controles */}
        <Card sx={{ p: 3, mb: 4, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={3}>
            <Box display="flex" gap={2} flexWrap="wrap" sx={{ flexGrow: 1 }}>
              <TextField
                size="small"
                placeholder="Buscar socio..."
                InputProps={{
                  startAdornment: <Search fontSize="small" sx={{ color: 'action.active', mr: 1 }} />
                }}
                sx={{ minWidth: 300 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <TextField
                select
                size="small"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{ minWidth: 180 }}
                InputProps={{
                  startAdornment: <FilterList fontSize="small" sx={{ color: 'action.active', mr: 1 }} />
                }}
              >
                <MenuItem value="todos">Todos los estados</MenuItem>
                <MenuItem value="Verificado">Verificado</MenuItem>
                <MenuItem value="Baja">Baja</MenuItem>
                <MenuItem value="Ilocalizable">Ilocalizable</MenuItem>
                <MenuItem value="Incidencia">Incidencia</MenuItem>
                <MenuItem value="Incompleto">Incompletos</MenuItem>
              </TextField>
            </Box>
            
            <Box display="flex" gap={1}>
              <Button
                variant={pendingFilter ? "contained" : "outlined"}
                startIcon={<Schedule />}
                onClick={() => setPendingFilter(!pendingFilter)}
                color={pendingFilter ? "primary" : "inherit"}
              >
                Pendientes
              </Button>
              <Button
                variant={verifiedThisMonthFilter ? "contained" : "outlined"}
                startIcon={<CalendarMonth />}
                onClick={() => setVerifiedThisMonthFilter(!verifiedThisMonthFilter)}
                color={verifiedThisMonthFilter ? "primary" : "inherit"}
              >
                Verificados este mes
              </Button>

              {/* Input para fecha de inicio */}
            <TextField
              label="Desde"
              type="date"
              size="small"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={startDate || ''}
              onChange={(e) => setStartDate(e.target.value)}
              sx={{ width: 150 }}
            />
            
            {/* Input para fecha de fin */}
            <TextField
              label="Hasta"
              type="date"
              size="small"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={endDate || ''}
              onChange={(e) => setEndDate(e.target.value)}
              sx={{ width: 150 }}
              disabled={!startDate}
              min={startDate} // Opcional: forzar que la fecha fin sea >= inicio
            />
               {/* <Button
                variant={incidenceFilter ? "contained" : "outlined"}
                startIcon={<Warning />}
                onClick={() => setIncidenceFilter(!incidenceFilter)}
                color={incidenceFilter ? "warning" : "inherit"}
              >
                Con incidencias
              </Button> */}
              
            </Box>
          </Box>
        </Card>

        {/* Tabs para diferentes vistas */}
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Listado de Socios" />
          <Tab label="Estadísticas" />
        </Tabs>

        {/* Contenido según tab seleccionado */}
        {tabValue === 0 && (
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="tabla de socios">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        sortDirection={orderBy === column.id ? order : false}
                      >
                        {column.sortable ? (
                          <TableSortLabel
                            active={orderBy === column.id}
                            direction={orderBy === column.id ? order : 'asc'}
                            onClick={() => handleRequestSort(column.id)}
                            IconComponent={order === 'asc' ? ArrowUpward : ArrowDownward}
                          >
                            {column.label}
                          </TableSortLabel>
                        ) : (
                          column.label
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow >
                        <TableCell colSpan={columns.length} align="center">
                          <CircularProgress />
                        </TableCell>
                    </TableRow>
                  ) : filteredData.length > 0 ? (
                    filteredData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((socio) => (


                        <TableRow 
                          hover 
                          key={socio.id} 
                          onClick={() => handleOpenSocio(socio)}
                          sx={{ 
                            cursor: 'pointer',
                            backgroundColor: socio.is_borrador ? '#FFF3E0' : 'inherit', // Naranja claro cuando es borrador
                            '&:hover': {
                              backgroundColor: socio.is_borrador ? '#FFE0B2' : '' // Un tono más oscuro al hacer hover
                            }
                          }}
                        >
                           <TableCell>
                            {getFundraiserInfo(socio.fundraiser)}
                          </TableCell>
                          <TableCell>
                            {formatDate(socio.fecha_alta)}
                          </TableCell>
                          <TableCell>{socio.nombre_socio || 'N/A'}</TableCell>
                          <TableCell>{socio.apellido_socio || 'N/A'}</TableCell>
                          <TableCell>{socio.telefono_socio || 'No tiene móvil'}</TableCell>
                          
                          
                          <TableCell>{socio.ciudad_direccion || 'N/A'}</TableCell>
                          <TableCell>
                            {socio.importe ? `€${socio.importe}` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {socio.periodicidad || 0}
                          </TableCell>
                          
                          <TableCell>
                          <StatusChip 
                              label={socio?.status || 'Pendiente'}
                              color={
                                socio?.status === 'Verificado' ? 'success' :
                                socio?.status === 'Ilocalizable' ? 'info' :
                                socio?.status === 'Baja' ? 'error' : 
                                'warning' // Para Incidencia, Pendiente y por defecto
                              }
                              sx={{
                                // Sobreescribe los colores del theme con tus HEX
                                ...(socio?.status === 'Verificado' && { backgroundColor: '#4CAF50' }),
                                ...(socio?.status === 'Ilocalizable' && { backgroundColor: '#2196F3' }),
                                ...(socio?.status === 'Baja' && { backgroundColor: '#F44336' }),
                                ...((!socio?.status || socio?.status === 'Incidencia' || socio?.status === 'Pendiente') && { 
                                  backgroundColor: socio?.status === 'Pendiente' ? '#3c3c3c' : '#FF9800'
                                }),
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                              icon={
                                socio.status === 'Verificado' ? <CheckCircle fontSize="small" /> :
                                socio.status === 'Ilocalizable' ? <Info fontSize="small" /> :
                                socio.status === 'Baja' ? <Error fontSize="small" /> :  // Usamos Error en lugar de Cancel
                                socio.status === 'Incidencia' ? <Warning fontSize="small" /> :
                                <Schedule fontSize="small" /> // Ícono para Pendiente
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {socio.no_llamadas || 0}
                          </TableCell>
                          <TableCell>
                            {socio.fecha_verificacion ? formatDate(socio.fecha_verificacion) : 'No ha verificado'}
                          </TableCell>
                         
                         
                          <TableCell>
                            {socio.is_borrador ? 'Si' : 'No'}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center">
                        No se encontraron socios
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
            />
          </Paper>
        )}

{tabValue === 1 && stats && (
  <Box>
    <Grid container spacing={3} mb={4}>
      <Grid item xs={12} md={3}>
        <StatCard 
          icon={<PeopleAlt color="primary" />}
          title="Total socios"
          value={stats.total_socios}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatCard 
          icon={<CheckCircle color="success" />}
          title="Socios activos"
          value={stats.socios_activos}
          subtext={`${stats.porcentaje_activos}%`}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatCard 
          icon={<CalendarMonth color="info" />}
          title="Verificados este mes"
          value={stats.socios_verificados_mes}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatCard 
          icon={<Warning color="warning" />}
          title="Con incidencias"
          value={stats.socios_con_incidencia}
          subtext={`${Math.round((stats.socios_con_incidencia / stats.total_socios) * 100)}%`}
        />
      </Grid>
    </Grid>

    <Card sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" mb={3}>Distribución por género</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" mb={2}>
            <Box width={120}>
              <Chip label="Hombres" color="primary" />
            </Box>
            <Box flexGrow={1} px={2}>
              <LinearProgress 
                variant="determinate" 
                value={(stats.genero.masculino / stats.total_socios) * 100}
                color="primary"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Box width={60} textAlign="right">
              <Typography>
                {stats.genero.masculino} ({Math.round((stats.genero.masculino / stats.total_socios) * 100)}%)
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center">
            <Box width={120}>
              <Chip label="Mujeres" color="secondary" />
            </Box>
            <Box flexGrow={1} px={2}>
              <LinearProgress 
                variant="determinate" 
                value={(stats.genero.femenino / stats.total_socios) * 100}
                color="secondary"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Box width={60} textAlign="right">
              <Typography>
                {stats.genero.femenino} ({Math.round((stats.genero.femenino / stats.total_socios) * 100)}%)
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Resumen estadístico</Typography>
            <Box>
              <Typography>Edad promedio: <strong>{stats.edad_promedio} años</strong></Typography>
              <Typography>Socios pendientes: <strong>{stats.socios_pendientes}</strong></Typography>
              <Typography>Ratio activos/inactivos: <strong>{stats.socios_activos}:{stats.total_socios - stats.socios_activos}</strong></Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Card>
  </Box>
)}
        {/* Dialog con ficha de socio */}
          {/* Dialog con ficha de socio */}
          <Dialog 
          open={!!selectedSocio} 
          onClose={handleCloseSocio}
          fullWidth
          maxWidth="md"
          scroll="paper"
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                {selectedSocio?.nombre_socio} {selectedSocio?.apellido_socio}
                <Typography variant="body2" color="text.secondary">
                  ID: {selectedSocio?.id}
                </Typography>
              </Typography>
              
              <Box>
              <Button 
      onClick={handleDeleteSocio} 
      color="error"
      disabled={saving}
      startIcon={<Delete />}
      sx={{ mr: 3 , }}
      variant="outlined"
    >
      {saving ? <CircularProgress size={24} /> : 'Eliminar Socio'}
    </Button>
                {fichaTab === 0 && (

                  
                  <Button
                    startIcon={editMode ? <LockOpen /> : <Lock />}
                    onClick={() => setEditMode(!editMode)}
                    variant={editMode ? "contained" : "outlined"}
                    color={editMode ? "primary" : "inherit"}
                    sx={{ mr: 2 }}
                  >
                    {editMode ? "Editando" : "Editar"}
                  </Button>
                )}
                <IconButton onClick={handleCloseSocio}>
                  <Close />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedSocio && (
              <Box>
                <Tabs 
                  value={fichaTab} 
                  onChange={(e, newValue) => setFichaTab(newValue)}
                  sx={{ mb: 3 }}
                >
                  <Tab label="Información General" />
                  <Tab label="Estado" />
                  <Tab label="Llamadas" />
                </Tabs>

                {fichaTab === 0 && (
  <Grid container spacing={3}>
    {/* Columna izquierda - Información Personal */}
    <Grid item xs={12} md={6}>
      <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ 
          fontWeight: 'bold',
          borderBottom: '2px solid',
          borderColor: 'primary.main',
          pb: 1,
          mb: 2
        }}>
          Información Personal
        </Typography>
        
        <Grid container spacing={2}>
          {/* Nombre */}
          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Nombre
            </InputLabel>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={selectedSocio.nombre_socio || ''}
                onChange={(e) => handleFieldChange('nombre_socio', e.target.value)}
                sx={{ mt: 1 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio.nombre_socio || 'N/A'}
              </Typography>
            )}
          </Grid>

          {/* Apellidos */}
          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Apellidos
            </InputLabel>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={selectedSocio.apellido_socio || ''}
                onChange={(e) => handleFieldChange('apellido_socio', e.target.value)}
                sx={{ mt: 1 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio.apellido_socio || 'N/A'}
              </Typography>
            )}
          </Grid>

          {/* Género */}
          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Género
            </InputLabel>
            {editMode ? (
              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <Select
                  value={selectedSocio.genero_socio || ''}
                  onChange={(e) => handleFieldChange('genero_socio', e.target.value)}
                  variant="outlined"
                >
                  <MenuItem value="masculino">Hombre</MenuItem>
                  <MenuItem value="femenino">Mujer</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio.genero_socio === 'masculino' ? 'Hombre' : 
                 selectedSocio.genero_socio === 'femenino' ? 'Mujer' : 'N/A'}
              </Typography>
            )}
          </Grid>

          {/* Edad */}
          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Edad
            </InputLabel>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {calcularEdad(selectedSocio.fecha_nacimiento)} años
            </Typography>
          </Grid>

          {/* Fecha Nacimiento */}
          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Fecha Nacimiento
            </InputLabel>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={selectedSocio.fecha_nacimiento?.split('T')[0] || ''}
                onChange={(e) => handleFieldChange('fecha_nacimiento', e.target.value)}
                sx={{ mt: 1 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {formatShortDate(selectedSocio.fecha_nacimiento)}
              </Typography>
            )}
          </Grid>

          {/* Fecha Alta */}
          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Fecha Alta
            </InputLabel>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={selectedSocio.fecha_alta_real?.split('T')[0] || ''}
                onChange={(e) => handleFieldChange('fecha_alta_real', e.target.value)}
                sx={{ mt: 1 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio.fecha_alta_real ? 
                  formatShortDate(selectedSocio.fecha_alta_real) : 
                  "N/A"}
              </Typography>
            )}
          </Grid>

          {/* Identificación */}
          <Grid item xs={12}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Identificación
            </InputLabel>
            {editMode ? (
              <Box display="flex" gap={1} sx={{ mt: 1 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={selectedSocio.tipo_identificacion_socio || ''}
                    onChange={(e) => handleFieldChange('tipo_identificacion_socio', e.target.value)}
                    label="Tipo"
                    variant="outlined"
                  >
                    <MenuItem value="DNI">DNI</MenuItem>
                    <MenuItem value="NIE">NIE</MenuItem>
                    <MenuItem value="Pasaporte">Pasaporte</MenuItem>
                    <MenuItem value="CIF">CIF</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={selectedSocio.numero_identificacion_socio || ''}
                  onChange={(e) => handleFieldChange('numero_identificacion_socio', e.target.value)}
                />
              </Box>
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio?.tipo_identificacion_socio || 'N/A'}: {selectedSocio.numero_identificacion_socio || 'N/A'}
              </Typography>
            )}
          </Grid>

          {/* Contacto */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 'bold',
              borderBottom: '1px solid',
              borderColor: 'divider',
              pb: 1,
              mt: 2,
              mb: 2
            }}>
              Contacto
            </Typography>
          </Grid>

          {/* Teléfono */}
          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Teléfono
            </InputLabel>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={selectedSocio.telefono_socio || ''}
                onChange={(e) => handleFieldChange('telefono_socio', e.target.value)}
                sx={{ mt: 1 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio.telefono_socio || 'N/A'}
              </Typography>
            )}
          </Grid>

          {/* Email */}
          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Email
            </InputLabel>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={selectedSocio.email_socio || ''}
                onChange={(e) => handleFieldChange('email_socio', e.target.value)}
                type="email"
                error={selectedSocio.email_socio && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(selectedSocio.email_socio)}
                helperText={selectedSocio.email_socio && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(selectedSocio.email_socio) 
                  ? "Formato de email inválido" 
                  : ""}
                sx={{ mt: 1 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio.email_socio || 'N/A'}
              </Typography>
            )}
          </Grid>

          {/* Estado Datos */}
          <Grid item xs={12}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Estado de Datos
            </InputLabel>
            {editMode ? (
              <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                <Switch
                  checked={!selectedSocio.is_borrador}
                  onChange={(e) => handleFieldChange('is_borrador', !e.target.checked)}
                  color="primary"
                />
                <Typography ml={1} variant="body1">
                  {selectedSocio.is_borrador ? "Incompleto" : "Completo"}
                </Typography>
              </Box>
            ) : (
              <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                {selectedSocio.is_borrador ? (
                  <Cancel color="error" fontSize="small" />
                ) : (
                  <CheckCircle color="success" fontSize="small" />
                )}
                <Typography ml={1} variant="body1">
                  {selectedSocio.is_borrador ? "Incompleto" : "Completo"}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Card>

      {/* Dirección */}
      <Card variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ 
          fontWeight: 'bold',
          borderBottom: '2px solid',
          borderColor: 'primary.main',
          pb: 1,
          mb: 2
        }}>
          Dirección
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Dirección
            </InputLabel>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={selectedSocio.via_principal || ''}
                onChange={(e) => handleFieldChange('via_principal', e.target.value)}
                sx={{ mt: 1 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio.via_principal || 'N/A'}
              </Typography>
            )}
          </Grid>

          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Código Postal
            </InputLabel>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={selectedSocio.cp_direccion || ''}
                onChange={(e) => handleFieldChange('cp_direccion', e.target.value)}
                sx={{ mt: 1 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio.cp_direccion || 'N/A'}
              </Typography>
            )}
          </Grid>

          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Ciudad
            </InputLabel>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={selectedSocio.ciudad_direccion || ''}
                onChange={(e) => handleFieldChange('ciudad_direccion', e.target.value)}
                sx={{ mt: 1 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio.ciudad_direccion || 'N/A'}
              </Typography>
            )}
          </Grid>

          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Provincia
            </InputLabel>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={selectedSocio.estado_provincia || ''}
                onChange={(e) => handleFieldChange('estado_provincia', e.target.value)}
                sx={{ mt: 1 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio.estado_provincia || 'N/A'}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Card>
    </Grid>

    {/* Columna derecha - Información de Registro y Pago */}
    <Grid item xs={12} md={6}>
      {/* Información de Registro */}
      <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ 
          fontWeight: 'bold',
          borderBottom: '2px solid',
          borderColor: 'primary.main',
          pb: 1,
          mb: 2
        }}>
          Información de Registro
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Fecha Registro
            </InputLabel>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                type="datetime-local"
                variant="outlined"
                value={formatDateTimeForInput(selectedSocio.fecha_alta)}
                onChange={(e) => handleFieldChange('fecha_alta', e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: new Date().toISOString().slice(0, 16) }}
                sx={{ mt: 1 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {formatDate(selectedSocio.fecha_alta)}
              </Typography>
            )}
          </Grid>

          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Estado
            </InputLabel>
            <Box sx={{ mt: 1 }}>
              <StatusChip
                label={selectedSocio.status || 'Pendiente'}
                sx={{
                  backgroundColor: (() => {
                    switch(selectedSocio?.status) {
                      case 'Verificado': return '#4CAF50';
                      case 'Ilocalizable': return '#2196F3';
                      case 'Baja': return '#F44336';
                      case 'Incidencia': return '#FF9800';
                      case 'Pendiente': return '#3c3c3c';
                      default: return '#FFC107';
                    }
                  })(),
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              N° Llamadas
            </InputLabel>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {selectedSocio.no_llamadas || 0}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Fecha Verificación
            </InputLabel>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                type="datetime-local"
                variant="outlined"
                value={selectedSocio.fecha_verificacion ? 
                  formatDateTimeForInput(selectedSocio.fecha_verificacion) : ''}
                onChange={(e) => {
                  const selectedDateTime = new Date(e.target.value);
                  const now = new Date();
                  
                  if (selectedDateTime > now) {
                    alert("No puedes seleccionar una fecha/hora futura");
                    return;
                  }
                  
                  handleFieldChange('fecha_verificacion', e.target.value + ':00.000Z');
                }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: new Date().toISOString().slice(0, 16) }}
                sx={{ mt: 1 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio.fecha_verificacion ? 
                  formatDateTimeForInput(selectedSocio.fecha_verificacion) : 'N/A'}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Comercial
            </InputLabel>
            {editMode ? (
              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <InputLabel>Comercial</InputLabel>
                <Select
                  value={selectedSocio.fundraiser?.id || ''}
                  onChange={(e) => handleFieldChange('fundraiser', usersData.find(u => u.id === e.target.value))}
                  label="Comercial"
                  variant="outlined"
                >
                  {usersData.filter(u => u.role === 'COMERCIAL').map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {getFundraiserInfo(selectedSocio.fundraiser)}
              </Typography>
            )}
          </Grid>

          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Canal Captación
            </InputLabel>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={selectedSocio.primer_canal_captacion || ''}
                onChange={(e) => handleFieldChange('primer_canal_captacion', e.target.value)}
                sx={{ mt: 1 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio.primer_canal_captacion || 'N/A'}
              </Typography>
            )}
          </Grid>

          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Canal Entrada
            </InputLabel>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={selectedSocio.canal_entrada || ''}
                onChange={(e) => handleFieldChange('canal_entrada', e.target.value)}
                sx={{ mt: 1 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio.canal_entrada || 'N/A'}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Card>

      {/* Información de Pago */}
      <Card variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ 
          fontWeight: 'bold',
          borderBottom: '2px solid',
          borderColor: 'primary.main',
          pb: 1,
          mb: 2
        }}>
          Información de Pago
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Importe
            </InputLabel>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                type="number"
                variant="outlined"
                value={selectedSocio.importe || ''}
                onChange={(e) => handleFieldChange('importe', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
                sx={{ mt: 1 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio.importe ? `€${selectedSocio.importe}` : 'N/A'}
              </Typography>
            )}
          </Grid>

          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Periodicidad
            </InputLabel>
            {editMode ? (
              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <InputLabel>Periodicidad</InputLabel>
                <Select
                  value={selectedSocio.periodicidad || ''}
                  onChange={(e) => handleFieldChange('periodicidad', e.target.value)}
                  label="Periodicidad"
                  variant="outlined"
                >
                  <MenuItem value="Mensual">Mensual</MenuItem>
                  <MenuItem value="Trimestral">Trimestral</MenuItem>
                  <MenuItem value="Anual">Anual</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio.periodicidad || 'N/A'}
              </Typography>
            )}
          </Grid>

          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Medio Pago
            </InputLabel>
            {editMode ? (
              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <InputLabel>Medio Pago</InputLabel>
                <Select
                  value={selectedSocio.medio_pago || ''}
                  onChange={(e) => handleFieldChange('medio_pago', e.target.value)}
                  label="Medio Pago"
                  variant="outlined"
                >
                  <MenuItem value="Tarjeta">Tarjeta</MenuItem>
                  <MenuItem value="Domiciliación">Domiciliación</MenuItem>
                  <MenuItem value="Transferencia">Transferencia</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio.medio_pago || 'N/A'}
              </Typography>
            )}
          </Grid>

          <Grid item xs={6}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Tipo Pago
            </InputLabel>
            {editMode ? (
              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <InputLabel>Tipo Pago</InputLabel>
                <Select
                  value={selectedSocio.tipo_pago || ''}
                  onChange={(e) => handleFieldChange('tipo_pago', e.target.value)}
                  label="Tipo Pago"
                  variant="outlined"
                >
                  <MenuItem value="Cuota">Cuota</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio.tipo_pago || 'N/A'}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <InputLabel shrink sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              IBAN
            </InputLabel>
            {editMode ? (
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={selectedSocio.no_iban || ''}
                onChange={(e) => handleFieldChange('no_iban', e.target.value)}
                label="IBAN"
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 1 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedSocio.no_iban || 'N/A'}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Card>
    </Grid>
  </Grid>
)}

                {fichaTab === 1 && (
                  <Box>
                    <Typography variant="subtitle1" mb={3}>Estado del Socio</Typography>
                    
                    <Box mb={3}>
                      <Typography variant="subtitle2">Devolución</Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <Switch
                          checked={selectedSocio.devolucion === true}
                          onChange={(e) => {
                            setSelectedSocio({
                              ...selectedSocio,
                              devolucion: e.target.checked
                            });
                          }}
                          color={selectedSocio.devolucion ? 'success' : 'error'}
                        />
                        <Box ml={2}>
                          <Chip 
                            label={selectedSocio.devolucion ? 'Aprobada' : 'Rechazada'} 
                            color={selectedSocio.devolucion ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                        {selectedSocio.devolucion 
                          ? 'La devolución fue aprobada correctamente' 
                          : 'La devolución presenta incidencias'}
                      </Typography>
                    </Box>

                    <Grid container spacing={2} mb={3}>
                      <Grid item xs={12} md={4}>
                        <Card 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            border: '2px solid',
                            borderColor: selectedSocio.status === 'Verificado' ? 'success.main' : 'transparent',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleStatusChange('Verificado')}
                        >
                          <CheckCircle color={selectedSocio.status === 'Verificado' ? 'success' : 'action'} sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h6">Verificado</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Socio activo y verificado
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Card 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            border: '2px solid',
                            borderColor: selectedSocio.status === 'Pendiente' ? 'warning.main' : 'transparent',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleStatusChange('Pendiente')}
                        >
                          <Warning color={selectedSocio.status === 'Pendiente' ? 'warning' : 'action'} sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h6">Pendiente</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Pendiente de verificación
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Card 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            border: '2px solid',
                            borderColor: selectedSocio.status === 'Baja' ? 'error.main' : 'transparent',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleStatusChange('Baja')}
                        >
                          <Error color={selectedSocio.status === 'Baja' ? 'error' : 'action'} sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h6">Baja</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Socio dado de baja
                          </Typography>
                        </Card>

                        
                      </Grid>
                      <Grid item xs={12} md={4}>
                      <Card 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      border: '2px solid',
                      borderColor: selectedSocio.status === 'Incidencia' ? 'warning.main' : 'transparent',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 2,
                        borderColor: 'warning.light'
                      }
                    }}
                    onClick={() => handleStatusChange('Incidencia')}
                  >
                    <Warning color={selectedSocio.status === 'Incidencia' ? 'warning' : 'action'} 
                            sx={{ 
                              fontSize: 40, 
                              mb: 1,
                              color: selectedSocio.status === 'Incidencia' ? 'warning.main' : ''
                            }} />
                    <Typography variant="h6" color={selectedSocio.status === 'Incidencia' ? 'warning.main' : 'text.primary'}>
                      Incidencia
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Se reportó un problema o incidencia
                    </Typography>
                  </Card>

                        
                      </Grid>
                      <Grid item xs={12} md={4}>
  <Card 
    sx={{ 
      p: 0.8, 
      textAlign: 'center',
      border: '2px solid',
      borderColor: selectedSocio.status === 'Ilocalizable' ? 'error.main' : 'transparent',
      cursor: 'pointer',
      '&:hover': {
        boxShadow: 2,
        borderColor: 'error.light'
      }
    }}
    onClick={() => handleStatusChange('Ilocalizable')}
  >
    <PhoneDisabled 
      color={selectedSocio.status === 'Ilocalizable' ? 'error' : 'action'} 
      sx={{ 
        fontSize: 40, 
        mb: 1,
        color: selectedSocio.status === 'Ilocalizable' ? 'error.main' : ''
      }} 
    />
    <Typography variant="h6" color={selectedSocio.status === 'Ilocalizable' ? 'error.main' : 'text.primary'}>
      Ilocalizable
    </Typography>
    <Typography variant="body2" color="text.secondary">
      No se pudo contactar después de múltiples intentos
    </Typography>
  </Card>
</Grid>
                    </Grid>

                    
                  </Box>
                )}

                {/* Pestaña de Llamadas */}
                {fichaTab === 2 && (
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Typography variant="subtitle1">Registro de Llamadas</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={`Total: ${selectedSocio.no_llamadas || 0}`}
                          color="primary"
                          variant="outlined"
                        />
                        <Tooltip title="Información sobre llamadas">
                          <Info color="action" fontSize="small" />
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Mostrar advertencia si se alcanzó el límite */}
                    {llamadasData.length  >= 10 && (
                      <Box 
                        bgcolor="error.light" 
                        color="error.contrastText" 
                        p={2} 
                        mb={2}
                        borderRadius={1}
                      >
                        <Typography variant="body2">
                          Límite alcanzado: Máximo 10 llamadas registradas por socio
                        </Typography>
                      </Box>
                    )}

                            {/* Lista de llamadas existentes */}
                            {llamadasData.length > 0 ? (
                    <List sx={{ mb: 3, maxHeight: 400, overflow: 'auto' }}>
                      {llamadasData
                        .filter(llamada => llamada.socio === selectedSocio.id) // Filtramos por socio_id
                        .sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora))
                        .map((llamada) => (
                          <ListItem 
                            key={llamada.id} 
                            divider
                            secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="eliminar"
                          onClick={() => handleDeleteLlamada(llamada.id)}
                          disabled={saving}
                        >
                          <Delete color="error" />
                        </IconButton>
                      }
                    >
                  <ListItemIcon>
                    {RESULTADO_LLAMADA_OPCIONES.find(op => op.value === llamada.resultado)?.icon || <Phone />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight={600}>
                          Llamada #{llamada.numero_de_llamada}: {llamada.resultado}
                        </Typography>
                        {llamada.resultado === 'Verificado' && (
                          <CheckCircle color="success" fontSize="small" />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" display="block">
                          {formatDate(llamada.fecha_hora)}
                        </Typography>
                        <Typography component="span" variant="body2">
                          {llamada.notas || 'Sin notas adicionales'}
                        </Typography>
                        <Typography component="span" variant="caption" display="block" color="text.secondary">
                          Registrada por: {getFundraiserInfo(llamada.fundraiser)}
                        </Typography>
                      </>
                      }
                        />
                      </ListItem>
                    ))}
                          </List>
                          ) : (
                            <Box 
                              display="flex" 
                              flexDirection="column" 
                              alignItems="center" 
                              justifyContent="center" 
                              p={4}
                              border={1}
                              borderColor="divider"
                              borderRadius={1}
                              mb={3}
                            >
                              <Phone fontSize="large" color="action" />
                              <Typography variant="body1" color="text.secondary" mt={2}>
                                No hay llamadas registradas para este socio
                              </Typography>
                            </Box>
                          )}

                    {/* Formulario para nueva llamada - Solo mostrar si hay menos de 10 llamadas */}
                    {llamadasData.length < 10 && (
                      <Box 
                        mt={3} 
                        p={3} 
                        border={1} 
                        borderColor="divider" 
                        borderRadius={1}
                        bgcolor="background.paper"
                      >
                        <Typography variant="subtitle2" mb={2}>Registrar nueva llamada</Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                              <InputLabel>Resultado *</InputLabel>
                              <Select
                                name="resultado"
                                value={nuevaLlamada.resultado}
                                onChange={handleLlamadaChange}
                                label="Resultado *"
                                required
                              >
                                {RESULTADO_LLAMADA_OPCIONES.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      {option.icon}
                                      {option.label}
                                    </Box>
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              name="notas"
                              label="Notas de la llamada"
                              multiline
                              rows={3}
                              fullWidth
                              value={nuevaLlamada.notas}
                              onChange={handleLlamadaChange}
                              placeholder="Detalles de la conversación, observaciones, etc."
                            />
                          </Grid>
                        </Grid>

                        <Box display="flex" justifyContent="flex-end" mt={2}>
                          <Button
                            variant="contained"
                            startIcon={<Phone />}
                            onClick={handleRegistrarLlamada}
                            disabled={!nuevaLlamada.resultado || saving}
                          >
                            {saving ? <CircularProgress size={24} /> : 'Registrar Llamada'}
                          </Button>
                        </Box>

                        {nuevaLlamada.resultado === 'Verificado' && (
                          <Box mt={2} p={2} bgcolor="success.light" borderRadius={1}>
                            <Typography variant="body2" color="success.contrastText">
                              Al marcar como "Verificado", el estado del socio se actualizará automáticamente.
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSocio} color="inherit">Cerrar</Button>
            <Button 
              onClick={handleSaveChanges} 
              variant="contained" 
              color="primary"
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : 'Guardar Cambios'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ProtectedRole>
  );
};

export default AdminPanel;
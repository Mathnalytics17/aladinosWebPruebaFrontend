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
  Tooltip
} from '@mui/material';
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
  const [llamadasData, setLlamadasData] = useState([]);
  const [nuevaLlamada, setNuevaLlamada] = useState({
    resultado: '',
    notas: ''
  });
  const [currentUserRole, setCurrentUserRole] = useState(null);

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
    
    setStats({
      total_socios: totalSocios,
      socios_activos: sociosActivos,
      porcentaje_activos: totalSocios > 0 ? Math.round((sociosActivos / totalSocios) * 100) : 0,
      socios_verificados_mes: sociosVerificadosEsteMes,
      socios_pendientes: sociosPendientes,
      socios_con_incidencia: sociosConIncidencia,
      genero: generoDist,
      edad_promedio: edadPromedio
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
        (filter === 'Ilocalizable' && socio.status === 'Ilocalizable');
      
      const matchesPending = !pendingFilter || socio.status === 'Pendiente';
      
      const matchesVerifiedThisMonth = !verifiedThisMonthFilter || (
        socio.status === 'Verificado' &&
        socio.fecha_verificacion &&
        new Date(socio.fecha_verificacion).getMonth() === new Date().getMonth() &&
        new Date(socio.fecha_verificacion).getFullYear() === new Date().getFullYear()
      );
      
      const matchesIncidence = !incidenceFilter || socio.devolucion === false;
      
      return matchesSearch && matchesFilter && matchesPending && 
             matchesVerifiedThisMonth && matchesIncidence;
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
    { id: 'fecha_alta', label: 'Fecha Alta', sortable: true },
    { id: 'nombre_socio', label: 'Nombre', sortable: true },
    { id: 'apellido_socio', label: 'Apellidos', sortable: true },
    { id: 'genero_socio', label: 'Género', sortable: true },
    { id: 'telefono', label: 'Móvil', sortable: true },
    { id: 'ciudad_direccion', label: 'Ciudad', sortable: true },
    { id: 'status', label: 'Estado', sortable: true },
    { id: 'no_llamadas', label: 'N° Llamadas', sortable: true },
    { id: 'fecha_verificacion', label: 'Fecha Verificación', sortable: true },
    { id: 'fundraiser', label: 'Comercial', sortable: true },
    { id: 'importe', label: 'Cuota', sortable: true }
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
};  // Calcular edad
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
      const llamadaData = {
        socio: selectedSocio.id,
        socio_id: selectedSocio.id, // Asegurar que se envíe socio_id
        fundraiser: selectedSocio.fundraiser,
        resultado: nuevaLlamada.resultado,
        notas: nuevaLlamada.notas,
        numero_de_llamada: (selectedSocio.no_llamadas || 0) + 1
      };
      
      // 1. Registrar la nueva llamada
      const response = await api.post('llamadas/', llamadaData);
      
      // 2. Actualizar el contador de llamadas en el socio
      const updatedSocio = {
        ...selectedSocio,
        no_llamadas: (selectedSocio.no_llamadas || 0) + 1
      };
      
      await api.put(`users/socio/${selectedSocio.id}/`, updatedSocio);
  
      // 3. Actualizar el estado local
      setLlamadasData(prev => [...prev, response.data]);
      setSelectedSocio(updatedSocio);
      setSociosData(prev => 
        prev.map(s => s.id === selectedSocio.id ? updatedSocio : s)
      );
      
      setNuevaLlamada({ resultado: '', notas: '' });
  
      // Si se marcó como verificado, actualizar estado
      if (nuevaLlamada.resultado === 'Verificado') {
        const verifiedSocio = {
          ...updatedSocio,
          status: 'Verificado',
          fecha_verificacion: new Date().toISOString()
        };
        
        await api.put(`users/socio/${selectedSocio.id}/`, verifiedSocio);
        setSelectedSocio(verifiedSocio);
        setSociosData(prev => 
          prev.map(s => s.id === selectedSocio.id ? verifiedSocio : s)
        );
      }
    } catch (error) {
      console.error('Error al registrar llamada:', error);
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
      const updatedSocio = {
        ...selectedSocio,
        no_llamadas: updatedCount
      };
      
      await api.put(`users/socio/${selectedSocio.id}/`, updatedSocio);
      
      // 3. Actualizar el estado local
      setLlamadasData(prev => prev.filter(l => l.id !== llamadaId));
      setSelectedSocio(updatedSocio);
      setSociosData(prev => 
        prev.map(s => s.id === selectedSocio.id ? updatedSocio : s)
      );
      
    } catch (error) {
      console.error('Error al eliminar llamada:', error);
    } finally {
      setSaving(false);
    }
  };

  console.log(selectedSocio)
  console.log(llamadasData)

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
                    <TableRow>
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
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            {formatDate(socio.fecha_alta)}
                          </TableCell>
                          <TableCell>{socio.nombre_socio || 'N/A'}</TableCell>
                          <TableCell>{socio.apellido_socio || 'N/A'}</TableCell>
                          <TableCell>
                            {socio.genero_socio === 'masculino' ? 'Hombre' : 
                             socio.genero_socio === 'femenino' ? 'Mujer' : 'N/A'}
                          </TableCell>
                          <TableCell>{socio.telefono || 'N/A'}</TableCell>
                          <TableCell>{socio.ciudad_direccion || 'N/A'}</TableCell>
                          <TableCell>
                          <StatusChip 
  label={socio.status || 'Pendiente'}
  color={
    socio.status === 'Verificado' ? 'success' :     // Verde
    socio.status === 'Ilocalizable' ? 'info' :      // Azul
    socio.status === 'Baja' ? 'error' :             // Rojo
    socio.status === 'Incidencia' ? 'warning' :     // Naranja
    'warning' // Color por defecto (Pendiente)
  }
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
                            {socio.fecha_verificacion ? formatShortDate(socio.fecha_verificacion) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {getFundraiserInfo(socio.fundraiser)}
                          </TableCell>
                          <TableCell>
                            {socio.importe ? `€${socio.importe}` : 'N/A'}
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
                  icon={<PeopleAlt />}
                  title="Total de socios"
                  value={stats.total_socios}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  icon={<CheckCircle />}
                  title="Socios activos"
                  value={stats.socios_activos}
                  subtext={`${stats.porcentaje_activos}% del total`}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  icon={<Person />}
                  title="Edad promedio"
                  value={stats.edad_promedio}
                  subtext="Años"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard 
                  icon={<Warning />}
                  title="Socios con incidencias"
                  value={stats.socios_con_incidencia}
                  subtext={`${Math.round((stats.socios_con_incidencia / stats.total_socios) * 100)}% del total`}
                />
              </Grid>
            </Grid>

            <Card sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" mb={3}>Distribución por género</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box width={120}>
                      <StatusChip label="Hombres" color="primary" />
                    </Box>
                    <Box flexGrow={1}>
                      <Box 
                        height={24} 
                        bgcolor="primary.light" 
                        width={`${(stats.genero.masculino / stats.total_socios) * 100}%`}
                        borderRadius={1}
                      />
                    </Box>
                    <Box width={60} textAlign="right">
                      <Typography variant="body2">
                        {Math.round((stats.genero.masculino / stats.total_socios) * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Box width={120}>
                      <StatusChip label="Mujeres" color="secondary" />
                    </Box>
                    <Box flexGrow={1}>
                      <Box 
                        height={24} 
                        bgcolor="secondary.light" 
                        width={`${(stats.genero.femenino / stats.total_socios) * 100}%`}
                        borderRadius={1}
                      />
                    </Box>
                    <Box width={60} textAlign="right">
                      <Typography variant="body2">
                        {Math.round((stats.genero.femenino / stats.total_socios) * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Box>
        )}

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
              <IconButton onClick={handleCloseSocio}>
                <Close />
              </IconButton>
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
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" mb={2}>Información Personal</Typography>
                      <Box mb={3}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Nombre:</Typography>
                            <Typography>{selectedSocio.nombre_socio || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Apellidos:</Typography>
                            <Typography>{selectedSocio.apellido_socio || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Género:</Typography>
                            <Typography>
                              {selectedSocio.genero_socio === 'masculino' ? 'Hombre' : 
                               selectedSocio.genero_socio === 'femenino' ? 'Mujer' : 'N/A'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Edad:</Typography>
                            <Typography>
                              {calcularEdad(selectedSocio.fecha_nacimiento)} años
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Fecha Nacimiento:</Typography>
                            <Typography>
                              {formatShortDate(selectedSocio.fecha_nacimiento)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Identificación:</Typography>
                            <Typography>
                              {selectedSocio.tipo_identificacion_socio || 'N/A'}: {selectedSocio.numero_identificacion_socio || 'N/A'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Teléfono:</Typography>
                            <Typography>{selectedSocio.telefono || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Email:</Typography>
                            <Typography>{selectedSocio.email || 'N/A'}</Typography>
                          </Grid>
                        </Grid>
                      </Box>

                      <Typography variant="subtitle1" mb={2}>Dirección</Typography>
                      <Box>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2">Dirección:</Typography>
                            <Typography>{selectedSocio.via_principal || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Código Postal:</Typography>
                            <Typography>{selectedSocio.cp_direccion || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Ciudad:</Typography>
                            <Typography>{selectedSocio.ciudad_direccion || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Provincia:</Typography>
                            <Typography>{selectedSocio.estado_provincia || 'N/A'}</Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" mb={2}>Información de Registro</Typography>
                      <Box mb={3}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Fecha Alta:</Typography>
                            <Typography>
                              {formatDate(selectedSocio.fecha_alta)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Estado:</Typography>
                            <StatusChip
  label={selectedSocio.status || 'Pendiente'}
  sx={{
    backgroundColor:
      selectedSocio.status === 'Verificado' ? '#4CAF50' : // Verde
      selectedSocio.status === 'Ilocalizable' ? '#2196F3' : // Azul
      selectedSocio.status === 'Baja' ? '#F44336' : // Rojo
      selectedSocio.status === 'Incidencia' ? '#FF9800' : // Naranja
      '#FFC107', // Amarillo (Pendiente)
    color: 'white', // Texto en blanco
    fontWeight: 'bold',
  }}
/>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">N° Llamadas:</Typography>
                            <Typography>{selectedSocio.no_llamadas || 0}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Fecha Verificación:</Typography>
                            <Typography>
                              {selectedSocio.fecha_verificacion ? formatDate(selectedSocio.fecha_verificacion) : 'N/A'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2">Comercial:</Typography>
                            <Typography>
                              {getFundraiserInfo(selectedSocio.fundraiser)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Canal Captación:</Typography>
                            <Typography>{selectedSocio.primer_canal_captacion || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Canal Entrada:</Typography>
                            <Typography>{selectedSocio.canal_entrada || 'N/A'}</Typography>
                          </Grid>
                        </Grid>
                      </Box>

                      <Typography variant="subtitle1" mb={2}>Información de Pago</Typography>
                      <Box>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Importe:</Typography>
                            <Typography>€{selectedSocio.importe || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Periodicidad:</Typography>
                            <Typography>{selectedSocio.periodicidad || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Medio Pago:</Typography>
                            <Typography>{selectedSocio.medio_pago || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2">Tipo Pago:</Typography>
                            <Typography>{selectedSocio.tipo_pago || 'N/A'}</Typography>
                          </Grid>
                        </Grid>
                      </Box>
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
                    </Grid>

                    <TextField
                      label="Notas sobre el estado"
                      multiline
                      rows={4}
                      fullWidth
                      variant="outlined"
                      value={selectedSocio.notas || ''}
                      onChange={(e) => setSelectedSocio({...selectedSocio, notas: e.target.value})}
                      placeholder="Añade cualquier observación sobre el estado del socio..."
                    />
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
                    {llamadasData.length >= 10 && (
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
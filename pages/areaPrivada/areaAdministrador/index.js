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
    DialogContentText,
  Select,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,LinearProgress, Checkbox // Añade esta importación
} from '@mui/material';
import { red, blue } from '@mui/material/colors';
import { InputAdornment } from '@mui/material';
import AssignmentReturn from '@mui/icons-material/AssignmentReturn';
import { BarChart} from '@mui/x-charts'; // Añade estos imports
import Cancel from '@mui/icons-material/Cancel';
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
  Delete,
    Add,
  Clear
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
import { useTrazability } from '../../../shared/hooks/useTrazability';
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
  const [orderBy, setOrderBy] = useState('fecha_creacion');
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [endDate, setEndDate] = React.useState(null); 
  const [llamadasData, setLlamadasData] = useState([]);
  const [nuevaLlamada, setNuevaLlamada] = useState({
    resultado: '',
    notas: ''
  });
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [editMode, setEditMode] = useState(false); // Nuevo estado para controlar el modo edición

  // Nuevos estados para filtros avanzados
  const [activeFilters, setActiveFilters] = useState([]);
  const [currentFilter, setCurrentFilter] = useState({
    column: '',
    operator: 'contains',
    value: ''
  });
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [fundraisers, setFundraisers] = useState([]);

useTrazability('NombreDeLaPagina');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}users/fundraisers/`// Nota la barra adicional
         
          
        );
        
        setFundraisers(response.data); // Axios usa response.data
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching fundraisers');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log(fundraisers)
// Generar el nuevo array con el formato deseado
const fundraisers_dic = fundraisers.map(persona => {
  return {
    name: `${persona.first_name} ${persona.last_name}`,
    code: persona.fundraiser_code
  };
});
const fundraisers_list = fundraisers.map(persona => 
  `${persona.first_name} ${persona.last_name}`
);


console.log(fundraisers_dic,fundraisers_list)
  // Columnas disponibles para filtrar
  const availableColumns = [
    { 
      id: 'status', 
      label: 'Estado', 
      type: 'multi-select', 
      options: ['Verificado', 'Baja', 'Ilocalizable', 'Incidencia', 'Pendiente'] 
    },
  
    { id: 'nombre_socio', label: 'Nombre', type: 'text' },
    { id: 'apellido_socio', label: 'Apellidos', type: 'text' },
    { id: 'telefono_socio', label: 'Teléfono', type: 'text' },
    { id: 'email_socio', label: 'Email', type: 'text' },
    { id: 'ciudad_direccion', label: 'Ciudad', type: 'text' },
    { id: 'importe', label: 'Cuota', type: 'number' },
    { id: 'periodicidad', label: 'Periodicidad', type: 'text' },
    { id: 'no_llamadas', label: 'N° Llamadas', type: 'number' },
    { id: 'is_borrador', label: 'Incompleto', type: 'boolean' },
    { id: 'fundraiser', label: 'Comercial', type: 'multi-select', options: fundraisers_list }
  ];

  // Operadores disponibles
  const operators = {
    text: [
      { value: 'contains', label: 'contiene' },
      { value: 'equals', label: 'es igual a' },
      { value: 'startsWith', label: 'comienza con' },
      { value: 'endsWith', label: 'termina con' }
    ],
    number: [
      { value: 'equals', label: '=' },
      { value: 'greaterThan', label: '>' },
      { value: 'lessThan', label: '<' },
      { value: 'greaterThanOrEqual', label: '>=' },
      { value: 'lessThanOrEqual', label: '<=' }
    ],
    date: [
      { value: 'equals', label: 'es igual a' },
      { value: 'greaterThan', label: 'después de' },
      { value: 'lessThan', label: 'antes de' }
    ],
    boolean: [
      { value: 'equals', label: 'es' }
    ]
  };


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
    if (!selectedSocio?.id) return;  // Asegurarnos de que hay un ID
    
    try {
      const response = await api.get('llamadas/', {
        params: { socio_id: selectedSocio.id }
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
}, [selectedSocio?.id]);  // Solo dependemos del ID, no del objeto completo

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




// Manejar cambios en el filtro actual
const handleFilterColumnChange = (e) => {
  const columnId = e.target.value;
  const column = availableColumns.find(c => c.id === columnId);
  
  setCurrentFilter({
    column: columnId,
    operator: column?.type === 'boolean' ? 'equals' : 
             column?.type === 'number' ? 'equals' : 
             column?.type === 'date' ? 'equals' : 'contains',
    value: column?.type === 'boolean' ? true : 
           column?.type === 'multi-select' ? [] : ''
  });
};

// Añadir un nuevo filtro
const addFilter = () => {
  if (!currentFilter.column || 
      (currentFilter.value === '' && !Array.isArray(currentFilter.value)) ||
      (Array.isArray(currentFilter.value) && currentFilter.value.length === 0)) {
    return;
  }
  
  // Verificar si ya existe un filtro para esta columna
  const existingFilterIndex = activeFilters.findIndex(f => f.column === currentFilter.column);
  
  if (existingFilterIndex >= 0) {
    // Reemplazar el filtro existente
    const updatedFilters = [...activeFilters];
    updatedFilters[existingFilterIndex] = currentFilter;
    setActiveFilters(updatedFilters);
  } else {
    // Añadir nuevo filtro
    setActiveFilters([...activeFilters, currentFilter]);
  }
  
  // Resetear el filtro actual
  setCurrentFilter({
    column: '',
    operator: 'contains',
    value: ''
  });
};

// Eliminar un filtro
const removeFilter = (columnId) => {
  setActiveFilters(activeFilters.filter(filter => filter.column !== columnId));
};

// Limpiar todos los filtros
const clearAllFilters = () => {
  setActiveFilters([]);
  setSearchTerm('');
  setPendingFilter(false);
  setVerifiedThisMonthFilter(false);
  setIncidenceFilter(false);
  setStartDate(null);
  setEndDate(null);
};

// Aplicar los filtros a los datos
const applyFilters = (data) => {
  return data.filter(socio => {
    // Filtro de búsqueda general
    const matchesSearch = searchTerm === '' || 
      `${socio.nombre_socio || ''} ${socio.apellido_socio || ''} ${socio.numero_identificacion_socio || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    
    // Filtros activos
    const matchesActiveFilters = activeFilters.every(filter => {
      const column = availableColumns.find(c => c.id === filter.column);
      if (!column) return true;
      
      const value = socio[filter.column];
      const filterValue = filter.value;
      
      // Manejar casos especiales primero
      if (column.id === 'fundraiser') {
        // Verificar si hay valores nulos o undefined primero
        if (!socio.fundraiser) return false;
        
        // Convertir filterValue a string y manejar casos especiales
        const safeFilterValue = String(filterValue || '').toLowerCase().trim();
        if (!safeFilterValue) return true; // Si no hay filtro, mostrar todos
        
        // Obtener nombres (con manejo de valores nulos)
        const firstName = String(socio.fundraiser.first_name || '').toLowerCase();
        const lastName = String(socio.fundraiser.last_name || '').toLowerCase();
        
        // Verificar coincidencias
        return `${firstName} ${lastName}`.includes(safeFilterValue) ||
               firstName.includes(safeFilterValue) || 
               lastName.includes(safeFilterValue);
      }
      
      if (column.type === 'multi-select') {
        return filterValue.includes(value);
      }
      
      if (column.type === 'boolean') {
        return value === filterValue;
      }
      
      console.log('Valor de socio:', value, 'Operador:', filter.operator, 'Filtro:', filterValue);
      // Manejar operadores para texto, números y fechas
      switch(filter.operator) {
        case 'contains':
          return String(value || '').toLowerCase().includes(String(filterValue || '').toLowerCase());
        case 'equals':
        if (column.type === 'number') {
          // Comparación directa para numeric(10,2)
          return Number(value).toFixed(2) === Number(filterValue).toFixed(2);
        }
        case 'startsWith':
          return String(value || '').toLowerCase().startsWith(String(filterValue || '').toLowerCase());
        case 'endsWith':
          return String(value || '').toLowerCase().endsWith(String(filterValue || '').toLowerCase());
        case 'greaterThan':
          return Number(value) > Number(filterValue);
        case 'lessThan':
          return Number(value) < Number(filterValue);
        case 'greaterThanOrEqual':
          return Number(value) >= Number(filterValue);
        case 'lessThanOrEqual':
          return Number(value) <= Number(filterValue);
        default:
          return true;
      }
    });
    
    // Filtros rápidos - VERSIÓN CORREGIDA
const matchesPending = !pendingFilter || socio.status === 'Pendiente';


// Usar UTC para la comparación de mes/año
const matchesVerifiedThisMonth = !verifiedThisMonthFilter || (
  socio.status === 'Verificado' &&
  socio.fecha_verificacion &&
  new Date(socio.fecha_verificacion).getUTCMonth() === new Date().getUTCMonth() &&
  new Date(socio.fecha_verificacion).getUTCFullYear() === new Date().getUTCFullYear()
);

const matchesIncidence = !incidenceFilter || socio.devolucion === false;

// Filtro de rango de fechas CORREGIDO (sin ajuste de 24h y usando UTC)
const matchesDateRange = !startDate || !endDate || (
  (() => {
    const creationDate = new Date(socio.fecha_creacion);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Ajustar las fechas de filtro para cubrir todo el día
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);
    
    return creationDate >= start && creationDate <= end;
  })()
);

return matchesSearch && matchesActiveFilters && matchesPending && 
       matchesVerifiedThisMonth && matchesIncidence && matchesDateRange;
  });
};







  // Filtrar y ordenar datos
  // Filtrar y ordenar datos
  const filteredData = applyFilters(sociosData)
    .sort((a, b) => {
      if (orderBy === 'fecha_creacion') {
      
        const dateA = new Date(a.fecha_creacion);
        const dateB = new Date(b.fecha_creacion);
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
    { id: 'fecha_creacion', label: 'Fecha Ingreso', sortable: true },
    { id: 'nombre_socio', label: 'Nombre', sortable: true },
    { id: 'apellido_socio', label: 'Apellidos', sortable: true },
    
    { id: 'telefono', label: 'Móvil', sortable: true },
    { id: 'ciudad_direccion', label: 'Ciudad', sortable: true },
    
    { id: 'importe', label: 'Cuota', sortable: true },
    { id: 'perioricidad', label: 'Perioricidad', sortable: true },
    { id: 'status', label: 'Estado', sortable: true },
    { id: 'no_llamadas', label: 'N° Llamadas', sortable: true },
    { id: 'fecha_verificacion', label: 'Fecha Verificación', sortable: true },
    { id: 'devolucion', label: 'Devolución', sortable: true },
   
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
    setEditMode(false); // Resetear el modo edición al cerrar la ficha
  };

  // Guardar cambios del socio
  const handleSaveChanges = async () => {
    if (!selectedSocio) return;
  
    try {
      setSaving(true);
      console.log('selectedSocio', selectedSocio);
      // Preparar payload omitiendo campos innecesarios
      const payload = {
        ...selectedSocio,
        fundraiser: selectedSocio.fundraiser?.id || null,
      };
  
      let updatedData;
      
      if (selectedSocio.id) {
        // Actualización de socio existente
        await api.put(`users/socio/${selectedSocio.id}/`, payload);
        updatedData = sociosData.map(socio => 
          socio.id === selectedSocio.id ? selectedSocio : socio
        );
      } else {
        // Creación de nuevo socio
        const response = await api.post('users/socio/', payload);
        updatedData = [...sociosData, response.data];
        setSelectedSocio(response.data); // Actualizar con el socio creado
      }
  
      setSociosData(updatedData);
      calculateStats(updatedData);
      
      // Solo cerrar si es un nuevo socio
      if (!selectedSocio.id) {
        handleCloseSocio();
      }
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      // Puedes mostrar un mensaje de error al usuario aquí
    } finally {
      setSaving(false);
      handleCloseSocio();
      
    }
  };

// Función para abrir el modal de confirmación
const handleOpenDeleteModal = () => setDeleteModalOpen(true);

// Función para cerrar el modal de confirmación
const handleCloseDeleteModal = () => setDeleteModalOpen(false);

// Función para eliminar el socio (ya la tienes)
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
    handleCloseDeleteModal(); // Cerrar el modal después de eliminar
    
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
   
    const fundraiser = usersData.find(user => user.id === fundraiserId.id);
  
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
  // Verificar límite solo para este socio
  const llamadasDelSocio = llamadasData.filter(llamada => llamada.socio === selectedSocio.id);
  if (!selectedSocio || !nuevaLlamada.resultado || llamadasDelSocio.length >= 10) {
    return;
  }

  try {
    setSaving(true);
    
    // Preparar datos de la llamada
    const llamadaData = {
      socio: selectedSocio.id,
      fundraiser: selectedSocio.fundraiser?.id,
      resultado: nuevaLlamada.resultado,
      notas: nuevaLlamada.notas,
      numero_de_llamada: (selectedSocio.no_llamadas || 0) + 1
    };
    
    // 1. Registrar la nueva llamada
    const response = await api.post('llamadas/', llamadaData);
    
    // 2. Actualizar el socio
    const updatedSocio = {
      ...selectedSocio,
      no_llamadas: (selectedSocio.no_llamadas || 0) + 1,
      fundraiser: selectedSocio.fundraiser // mantener la estructura completa
    };
    
    // 3. Actualizar el socio en el backend
    await api.put(`users/socio/${selectedSocio.id}/`, {
      ...updatedSocio,
      fundraiser: selectedSocio.fundraiser?.id || null // enviar solo el ID
    });

    // 4. Actualizar estados locales
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
        fundraiser: selectedSocio.fundraiser
      };
      
      await api.put(`users/socio/${selectedSocio.id}/`, {
        ...verifiedSocio,
        fundraiser: selectedSocio.fundraiser?.id || null
      });
      
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
    // Mostrar notificación de error al usuario
  } finally {
    setSaving(false);
  }
};

  
// Renderizar el input adecuado para el tipo de filtro
const renderFilterInput = () => {
  const column = availableColumns.find(c => c.id === currentFilter.column);
  if (!column) return null;
  
  switch(column.type) {
    case 'multi-select':
      return (
        <FormControl fullWidth size="small">
          <InputLabel>Valores</InputLabel>
          <Select
            multiple
            value={currentFilter.value || []}
            onChange={(e) => setCurrentFilter({...currentFilter, value: e.target.value})}
            renderValue={(selected) => selected.join(', ')}
          >
            {column.options.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={currentFilter.value?.includes(option) || false} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    
      case 'boolean':
  return (
    <FormControl fullWidth size="small">
      <InputLabel>Valor</InputLabel>
      <Select
        value={currentFilter.value?.toString() || ''} // Convertimos a string
        onChange={(e) => setCurrentFilter({
          ...currentFilter, 
          value: e.target.value === 'true' // Convertimos de vuelta a boolean
        })}
      >
        <MenuItem value="true">Sí</MenuItem>
        <MenuItem value="false">No</MenuItem>
      </Select>
    </FormControl>
  );
    
    case 'date':
      return (
        <TextField
          fullWidth
          size="small"
          type="date"
          value={currentFilter.value || ''}
          onChange={(e) => setCurrentFilter({...currentFilter, value: e.target.value})}
          InputLabelProps={{ shrink: true }}
        />
      );
    
    case 'number':
      return (
        <TextField
          fullWidth
          size="small"
          type="number"
          value={currentFilter.value || ''}
          onChange={(e) => setCurrentFilter({...currentFilter, value: e.target.value})}
        />
      );
    
    case 'select':
      return (
        <FormControl fullWidth size="small">
          <InputLabel>Valor</InputLabel>
          <Select
            value={currentFilter.value || ''}
            onChange={(e) => setCurrentFilter({...currentFilter, value: e.target.value})}
          >
            {column.options.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    
    default: // text
      return (
        <TextField
          fullWidth
          size="small"
          value={currentFilter.value || ''}
          onChange={(e) => setCurrentFilter({...currentFilter, value: e.target.value})}
        />
      );
  }
};

// Renderizar el operador adecuado para el tipo de columna
const renderOperatorSelect = () => {
  const column = availableColumns.find(c => c.id === currentFilter.column);
  if (!column) return null;
  
  let operatorType = 'text';
  if (column.type === 'number') operatorType = 'number';
  if (column.type === 'date') operatorType = 'date';
  if (column.type === 'boolean') operatorType = 'boolean';
  
  return (
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Operador</InputLabel>
          <Select
            value={currentFilter.operator}
            onChange={(e) => setCurrentFilter({...currentFilter, operator: e.target.value})}
            label="Operador"
          >
            {operators[operatorType].map(op => (
            <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                };


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

            const handleDeleteLlamada = async (llamadaId) => {
  if (!llamadaId || !selectedSocio) return;
  
  try {
    setSaving(true);
    
    // 1. Eliminar la llamada del backend
    await api.delete(`llamadas/${llamadaId}/`);
    
    // 2. Calcular el nuevo número de llamadas (no puede ser negativo)
    const updatedCount = Math.max((selectedSocio.no_llamadas || 0) - 1, 0);
    
    // 3. Preparar datos actualizados del socio manteniendo el fundraiser
    const updatedSocio = {
      ...selectedSocio,
      no_llamadas: updatedCount,
      // Mantener toda la estructura del fundraiser si existe
      fundraiser: selectedSocio.fundraiser ? {
        id: selectedSocio.fundraiser.id,
        ...selectedSocio.fundraiser
      } : null
    };
    
    // 4. Actualizar el socio en el backend (enviando solo el ID del fundraiser)
    await api.put(`users/socio/${selectedSocio.id}/`, {
      ...updatedSocio,
      fundraiser: selectedSocio.fundraiser?.id || null
    });
    
    // 5. Actualizar los estados locales
    setLlamadasData(prev => prev.filter(l => l.id !== llamadaId));
    setSelectedSocio(updatedSocio);
    setSociosData(prev => 
      prev.map(s => s.id === selectedSocio.id ? updatedSocio : s)
    );
    
    // Mostrar notificación de éxito
    // Puedes usar tu sistema de notificaciones aquí
    console.log('Llamada eliminada correctamente');
    
  } catch (error) {
    console.error('Error al eliminar llamada:', error);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
      // Mostrar notificación de error al usuario
      // Ejemplo: showErrorNotification('No se pudo eliminar la llamada');
    }
  } finally {
    setSaving(false);
  }
};
   

const handleGestionUsuarios = ()=>{
 router.push("/areaPrivada/users");



}
        return (
          <ProtectedRole requiredRoles={["GESTOR", "JEFE"]}>
            <Box sx={{ p: 3, backgroundColor: '#f9fafc', minHeight: '100vh' }}>
              {/* Header */}
              <Box mb={4} >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" fontWeight={600} mb={1}>Panel de Administración</Typography>
                    
                  

                <Typography variant="body1" color="text.secondary">
                  Gestión completa de socios y comerciales
                </Typography>
                  </Box>
<Box 
  sx={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    width: '100%',
    mb: 2,
    gap: 2
  }}
>
  {/* Sección izquierda: Botones de Nuevo Socio y Gestión de Usuarios */}
  <Box sx={{ display: 'flex', gap: 2 }}>
    <Button 
      variant="contained" 
      startIcon={<Add />}
      onClick={() => setSelectedSocio({
        nombre_socio: '',
        apellido_socio: '',
        telefono_socio: '',
        email_socio: '',
        status: 'Pendiente',
        is_borrador: true,
        devolucion: false,
        no_llamadas: 0,
      })}
      sx={{ height: 'fit-content' }}
    >
      Nuevo Socio
    </Button>

    <Button 
      variant="contained" 
      onClick={handleGestionUsuarios}
      sx={{ height: 'fit-content' }}
    >
      Gestión de usuarios
    </Button>
  </Box>

  {/* Sección derecha: Botones de Volver/Cerrar Sesión */}
  <Box>
    {currentUserRole === 'JEFE' ? (
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push('/areaPrivada')}
        variant="outlined"
        sx={{ 
          minWidth: '120px',
          borderColor: 'primary.main',
          color: 'primary.main',
          '&:hover': {
            borderColor: 'primary.dark',
            backgroundColor: 'primary.light',
            color: 'primary.dark'
          }
        }}
      >
        Volver
      </Button>
    ) : currentUserRole === 'GESTOR' ? (
      <Button
        startIcon={<ExitToApp />}
        onClick={handleLogout}
        sx={{ 
          minWidth: '120px',
          borderColor: 'error.main',
          color: 'error.main',
          '&:hover': {
            borderColor: 'error.dark',
            backgroundColor: 'error.light',
            color: 'error.dark'
          }
        }}
        variant="outlined"
      >
        Cerrar sesión
      </Button>
    ) : null}
  </Box>
</Box>
              
     
                </Box>

               <Card sx={{ p: 3, mb: 4, boxShadow: '0px 2px 10px rgba(0,0,0,0.05)' }}>
                    {/* Chips de filtros activos */}
                    {activeFilters.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {activeFilters.map((filter, index) => {
                          const column = availableColumns.find(c => c.id === filter.column);
                          let valueDisplay = filter.value;
                          
                          if (column?.type === 'multi-select') {
                            valueDisplay = filter.value.join(', ');
                          } else if (column?.type === 'boolean') {
                            valueDisplay = filter.value ? 'Sí' : 'No';
                          } else if (column?.id === 'fundraiser') {
                            const user = usersData.find(u => u.id === filter.value);
                            valueDisplay = user ? `${user.first_name} ${user.last_name}` : filter.value;
                          }
                          
                          return (
                            <Chip
                              key={index}
                              label={`${column?.label || filter.column}: ${valueDisplay}`}
                              onDelete={() => removeFilter(filter.column)}
                              color="primary"
                              size="small"
                              variant="outlined"
                            />
                          );
                        })}
                        <Button size="small" onClick={clearAllFilters} sx={{ ml: 1 }}>
                          Limpiar todo
                        </Button>
                      </Box>
                    )}

                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={3}>
                      {/* Búsqueda general */}
                      <Box display="flex" gap={2} flexWrap="wrap" sx={{ flexGrow: 1 }}>
                        <TextField
                          size="small"
                          placeholder="Buscar en todos los campos..."
                          InputProps={{
                            startAdornment: <Search fontSize="small" sx={{ color: 'action.active', mr: 1 }} />
                          }}
                          sx={{ minWidth: 300 }}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </Box>

                      {/* Botones de filtros rápidos */}
                      <Box display="flex" gap={1} flexWrap="wrap">
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
                    
                      </Box>
                    </Box>

                    {/* Filtros avanzados por columnas */}
                    <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                      {/* Selector de columna */}
                      <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Columna</InputLabel>
                        <Select
                          value={currentFilter.column || ''}
                          onChange={handleFilterColumnChange}
                          label="Columna"
                        >
                          {availableColumns.map((column) => (
                            <MenuItem key={column.id} value={column.id}>
                              {column.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Selector de operador (si es necesario) */}
                      {currentFilter.column && 
                        availableColumns.find(c => c.id === currentFilter.column)?.type !== 'multi-select' && 
                        availableColumns.find(c => c.id === currentFilter.column)?.type !== 'boolean' &&
                        renderOperatorSelect()}

                       {/* Input de valor según el tipo de columna */}
              {currentFilter.column && renderFilterInput()}

              {/* Botón para añadir filtro */}
              {currentFilter.column && (
                // Botón modificado
                <Button 
                  variant="contained" 
                  onClick={addFilter}
                  disabled={
                    currentFilter.value === undefined || 
                    currentFilter.value === null ||
                    (Array.isArray(currentFilter.value) && currentFilter.value.length === 0)
                  }
                  startIcon={<Add />}
                >
                  Añadir filtro
                </Button>
                      )}
                    </Box>

                    {/* Filtros de fecha */}
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
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
                        min={startDate}
                      />
                    </Box>
                  </Card>

                    {/* Tabs para diferentes vistas */}
                    <Tabs 
                      value={tabValue} 
                      onChange={(e, newValue) => setTabValue(newValue)}
                      sx={{ mb: 3 }}
                    >
                      <Tab label="Listado de Socios" />
                      
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
                                        {formatDate(socio.fecha_creacion)}
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
                                        {socio.fecha_verificacion ? formatDate(socio.fecha_verificacion) : ''}
                                      </TableCell>
                                      <TableCell>
                                          <Chip 
                                            label={socio.devolucion ? 'Sí' : 'No'}
                                            sx={{
                                              backgroundColor: socio.devolucion ? red[500] : blue[500],
                                              color: 'white',
                                              fontWeight: 'bold'
                                            }}
                                          />
                                        </TableCell>
                                                                
                                      <TableCell>
                                      <Chip 
                                            label={socio.is_borrador ? 'Si' : 'No'}
                                            sx={{
                                              backgroundColor: socio.is_borrador ? red[500] : blue[500],
                                              color: 'white',
                                              fontWeight: 'bold'
                                            }}
                                          />
                                        
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
                          rowsPerPageOptions={[10, 25, 50,100]}
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
                                    {selectedSocio?.id ? `${selectedSocio.nombre_socio} ${selectedSocio.apellido_socio}` : 'Nuevo Socio'}
                                    {selectedSocio?.id && (
                                      <Typography variant="body2" color="text.secondary">
                                        ID: {selectedSocio.id}
                                      </Typography>
                                    )}
                                  </Typography>
                                
                                <Box>
                                {selectedSocio?.id && currentUserRole !== "GESTOR" && (
<Button 
  onClick={handleOpenDeleteModal} 
  color="error"
  disabled={saving}
  startIcon={<Delete />}
  sx={{ mr: 3 }}
  variant="outlined"
>
  {saving ? <CircularProgress size={24} /> : 'Eliminar Socio'}
</Button>
)}
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
                    <Grid container spacing={4}>
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
                                Fecha Alta Aladina
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
    <Typography 
      variant="body1" 
      sx={{ 
        mt: 1,
        wordBreak: 'break-all', // Rompe en cualquier caracter necesario
        whiteSpace: 'normal',   // Permite múltiples líneas
        overflowWrap: 'break-word', // Priorita romper en puntos lógicos
        display: 'inline-block',
        width: '100%'
      }}
    >
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
                                Fecha Ingreso
                              </InputLabel>
                              {editMode ? (
                                <TextField
                                  fullWidth
                                  size="small"
                                  type="datetime-local"
                                  variant="outlined"
                                  value={selectedSocio.fecha_creacion ? formatDateTimeForInput(selectedSocio.fecha_creacion): ''}
                                  onChange={(e) => handleFieldChange('fecha_creacion', e.target.value)}
                                  InputLabelProps={{ shrink: true }}
                                  inputProps={{ max: new Date().toISOString().slice(0, 16) }}
                                  sx={{ mt: 1 }}
                                />
                              ) : (
                                <Typography variant="body1" sx={{ mt: 1 }}>
                                  {formatDate(selectedSocio.fecha_creacion)}
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
    color={selectedSocio.devolucion ? 'error' : 'default'} // Rojo cuando true, gris (default) cuando false
  />
  <Box ml={2}>
    <Chip 
      label={selectedSocio.devolucion ? 'Si' : 'No'} 
      color={selectedSocio.devolucion ? 'error' : 'default'} // Rojo cuando true, gris cuando false
      variant="outlined"
    />
  </Box>
</Box>
                      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                        {selectedSocio.devolucion 
                          ? 'La devolución fue realizada correctamente' 
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
                      {llamadasData.filter(llamada => llamada.socio === selectedSocio.id).length >= 10 && (
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
                   {llamadasData.filter(llamada => llamada.socio === selectedSocio.id).length < 10 && (
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


<Dialog
  open={deleteModalOpen}
  onClose={handleCloseDeleteModal}
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"
>
  <DialogTitle id="alert-dialog-title">
    Confirmar Eliminación
  </DialogTitle>
  <DialogContent>
    <DialogContentText id="alert-dialog-description">
      ¿Estás seguro de que deseas eliminar al socio {selectedSocio?.nombre_socio} {selectedSocio?.apellido_socio}?
      Esta acción no se puede deshacer.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDeleteModal} disabled={saving}>
      Cancelar
    </Button>
    <Button 
      onClick={handleDeleteSocio} 
      color="error" 
      disabled={saving}
      startIcon={saving ? <CircularProgress size={16} /> : null}
      autoFocus
    >
      {saving ? 'Eliminando...' : 'Eliminar'}
    </Button>
  </DialogActions>
</Dialog>
    </ProtectedRole>
  );
};

export default AdminPanel;
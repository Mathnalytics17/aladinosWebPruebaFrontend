'use client'
import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useAuth } from '../../../context/authContext'
import {
  Card, Grid2, Typography, Avatar, Chip, CircularProgress,
  TextField, MenuItem, Box, Button, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions,List, ListItem, ListItemText,
  Switch, Tabs, Tab, IconButton,CardContent,FormControl, InputLabel,Select, Checkbox 
} from '@mui/material'
import {
  PeopleAlt, CalendarToday, PieChart, CheckCircle, AttachMoney,
  Search, FilterList, DateRange, Male, Female, TrendingUp,
  Error, Warning, Phone, Close, Check,Delete,
  Add,Info,
Clear, CalendarMonth, 
Schedule, 
} from '@mui/icons-material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers'
import { styled } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import ProtectedRole from '@/shared/components/protectedRoute';
import { useRouter } from 'next/router';
import LogoutIcon from '@mui/icons-material/Logout';
import { alpha, useTheme } from '@mui/material/styles';
// Componentes estilizados
const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  padding: theme.spacing(0.5),
  minWidth: 80,
}))

const StatCard = ({ icon, title, value, subtext, onClick }) => (
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
)

export default function PanelComercial() {
  const { user } = useAuth()
  const theme = useTheme();
  const [socios, setSocios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    estado: 'todos',
    busqueda: '',
    fecha_inicio: null,
    fecha_fin: null
  })
   const [startDate, setStartDate] = useState(dayjs().subtract(1, 'year'));
  const [endDate, setEndDate] = useState(dayjs());
  const [selectedSocio, setSelectedSocio] = useState(null)
  const [fichaTab, setFichaTab] = useState(0)
  const router = useRouter()
  const [timeRange, setTimeRange] = useState('last_year');
   const [fundraisers, setFundraisers] = useState([]);
 // Nuevos estados para filtros avanzados
  const [activeFilters, setActiveFilters] = useState([]);
  const [currentFilter, setCurrentFilter] = useState({
    column: '',
    operator: 'contains',
    value: ''
  }); 
  
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
      options: ['Verificado', 'Baja', 'Ilocalizable', 'Incidencia', 'Pendiente', 'Incompleto'] 
    },
    { id: 'fecha_creacion', label: 'Fecha Creación', type: 'date' },
    { id: 'nombre_socio', label: 'Nombre', type: 'text' },
    { id: 'apellido_socio', label: 'Apellidos', type: 'text' },
    { id: 'telefono_socio', label: 'Teléfono', type: 'text' },
    { id: 'email_socio', label: 'Email', type: 'text' },
    { id: 'ciudad_direccion', label: 'Ciudad', type: 'text' },
    { id: 'importe', label: 'Cuota', type: 'number' },
    { id: 'periodicidad', label: 'Periodicidad', type: 'text' },
    { id: 'no_llamadas', label: 'N° Llamadas', type: 'number' },
    { id: 'is_borrador', label: 'Incompleto', type: 'boolean' },
    { id: 'fundraiser', label: 'Comercial', type: 'multi-select', options:fundraisers_list }
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
  // Función de logout
  const handleLogout = async () => {
    try {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')
      router.push('/areaPrivada/users/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')
      router.push('/areaPrivada/users/login')
    }
  }

  // Manejo del socio seleccionado
  const handleOpenSocio = (socio) => {
    setSelectedSocio({
      ...socio,
      estado: socio.activo ? 'Verificado' : 'Baja',
      devolucion: socio.devolucion ? 'aprobada' : 'rechazada',
      notas_estado: '',
      notas_llamada: ''
    })
  }

  const handleCloseSocio = () => {
    setSelectedSocio(null)
  }

  // Carga inicial de datos
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false)
        setError('No autenticado')
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const params = {
          fundraiser_id: user.id
        }

        const sociosRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}users/socio/`, { 
          params 
        })

        setSocios(sociosRes.data)
      } catch (err) {
        console.error('Error:', err)
        setError(err.response?.data?.message || 'Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  console.log(socios)
  // Función para calcular edad
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A'
    const nacimiento = new Date(fechaNacimiento)
    const hoy = new Date()
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  }
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
  setTimeRange('last_year');
  setStartDate(dayjs().subtract(1, 'year'));
  setEndDate(dayjs());
};


// Función para determinar si un socio NO es facturable
const noFacturable = (socio) => {
  return socio.is_borrador || 
         socio.status === 'Baja' || 
         socio.status === 'Incidencia' || 
         socio.devolucion ||
         socio.status === 'Incompleto';
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
      
      // Manejar operadores para texto, números y fechas
      switch(filter.operator) {
        case 'contains':
          return String(value || '').toLowerCase().includes(String(filterValue || '').toLowerCase());
        case 'equals':
          return String(value) === String(filterValue);
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
    
    // Filtro por rango de fechas
    let matchesDateRange = true;
    if (timeRange !== 'todos') {
      const now = dayjs();
      let startDateFilter;
      
      switch(timeRange) {
        case 'last_week':
          startDateFilter = now.subtract(1, 'week');
          break;
        case 'last_month':
          startDateFilter = now.subtract(1, 'month');
          break;
        case 'last_quarter':
          startDateFilter = now.subtract(3, 'months');
          break;
        case 'last_year':
          startDateFilter = now.subtract(1, 'year');
          break;
        case 'custom':
          startDateFilter = startDate;
          break;
        default:
          startDateFilter = null;
      }
      
      if (startDateFilter) {
        const fechaAlta = dayjs(socio.fecha_creacion);
        matchesDateRange = fechaAlta.isAfter(startDateFilter) && 
               (timeRange !== 'custom' || fechaAlta.isBefore(endDate));
      }
    }
    
    return matchesSearch && matchesActiveFilters && matchesDateRange;
  });
};

// Filtrar socios basado en los filtros seleccionados
const filteredSocios = useMemo(() => {
  return applyFilters(socios);
}, [socios, timeRange, startDate, endDate, searchTerm, activeFilters]);

 const cuotasFacturables2 = filteredSocios
    .filter(s => s.activo && !noFacturable(s))
    console.log(cuotasFacturables2)
  
  // Cálculo de estadísticas
  const stats = useMemo(() => {
    if (filteredSocios.length === 0) return null
    console.log(filteredSocios)
    const totalSocios = filteredSocios.length
    const sociosActivos = filteredSocios.filter(s => s.activo).length
    const nuevos30Dias = filteredSocios.filter(s => {
      const fechaCreacion = new Date(s.fecha_creacion )
      const hace30Dias = new Date()
      hace30Dias.setDate(hace30Dias.getDate() - 30)
      return fechaCreacion >= hace30Dias
    }).length

    const generoDist = {
      masculino: filteredSocios.filter(s => s.genero_socio?.toLowerCase() === 'masculino').length,
      femenino: filteredSocios.filter(s => s.genero_socio?.toLowerCase() === 'femenino').length
    }

    const hoy = new Date()
    const edades = filteredSocios.map(s => {
      if (!s.fecha_nacimiento) return 0
      const nacimiento = new Date(s.fecha_nacimiento)
      let edad = hoy.getFullYear() - nacimiento.getFullYear()
      const mes = hoy.getMonth() - nacimiento.getMonth()
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--
      }
      return edad
    })

     const cuotasFacturables2 = filteredSocios
    .filter(s => s.activo && !noFacturable(s))
    console.log(cuotasFacturables2)
     const cuotasFacturables = filteredSocios
    .filter(s => s.activo && !noFacturable(s))
    .map(s => s.importe)
    .filter(importe => importe !== undefined && importe !== null);

  const cuotaPromedio = cuotasFacturables.length > 0 
    ? cuotasFacturables.reduce((a, b) => a + Number(b), 0) / cuotasFacturables.length
    : 0;

console.log(cuotaPromedio);
    const edadPromedio = edades.reduce((a, b) => a + b, 0) / edades.length || 0
    const distribucionEdad = {
      menores_30: edades.filter(e => e < 30).length,
      entre_30_50: edades.filter(e => e >= 30 && e <= 50).length,
      mayores_50: edades.filter(e => e > 50).length
    }

    const recaudacionMensual = filteredSocios
      .filter(s => s.activo)
      .reduce((sum, s) => sum + parseFloat(s.importe || 0), 0)
    
    const promedioCuota = sociosActivos > 0 
      ? recaudacionMensual / sociosActivos 
      : 0

    return {
      total_socios: totalSocios,
      nuevos_ultimos_30_dias: nuevos30Dias,
      socios_activos: sociosActivos,
      no_facturables: filteredSocios.filter(noFacturable).length,
      cuota_promedio:cuotaPromedio.toFixed(2),
      socios_facturables:cuotasFacturables2,
      demografia: {
        genero: generoDist,
        edad_promedio: edadPromedio,
        distribucion_edad: distribucionEdad
      },
      recaudacion: {
        mensual: recaudacionMensual,
        anual: recaudacionMensual * 12,
        promedio_cuota: promedioCuota
      },
      comisiones: {
        total: sociosActivos * 10,
        por_cobrar: sociosActivos * 10
      }
    }
  }, [filteredSocios])

  // Manejo de cambios en los filtros
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }))
  }
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
              value={currentFilter.value}
              onChange={(e) => setCurrentFilter({...currentFilter, value: e.target.value === 'true'})}
            >
              <MenuItem value={true}>Sí</MenuItem>
              <MenuItem value={false}>No</MenuItem>
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
  
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
          {error}
        </Alert>
      </Box>
    );
  }
  return (
    <ProtectedRole requiredRoles={["COMERCIAL"]}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ p: 3, backgroundColor: '#f9fafc', minHeight: '100vh' }}>
          {/* Encabezado */}
          <Box mb={4}>
          <Box mb={4}>
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    width: '100%'
  }}>
    <Typography variant="h5" fontWeight={600} sx={{ color: 'black' }}>
      Panel Comercial
    </Typography>
    <Typography 
      variant="h5" 
      fontWeight={600} 
      sx={{ 
        color: 'black',
        textAlign: 'right'
      }}
    >
      Nombre Comercial: {user?.first_name} {user?.last_name}
    </Typography>
  </Box>
</Box>
            
            <Typography variant="body2" color="text.secondary">
              Gestión y seguimiento de tus socios comerciales
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ mt: 1 }}
            >
              Cerrar sesión
            </Button>
          </Box>

          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: theme.shadows[3] }}>
          <CardContent>
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
                    const user = socios.find(s => s.id === filter.value)?.fundraiser;
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

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {/* Búsqueda general */}
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
              
              {/* Selector de rango de tiempo */}
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Rango de tiempo</InputLabel>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  label="Rango de tiempo"
                >
                  <MenuItem value="todos">Todos los registros</MenuItem>
                  <MenuItem value="last_week">Esta semana</MenuItem>
                  <MenuItem value="last_month">Mes actual</MenuItem>
              
                  <MenuItem value="last_year">Este año</MenuItem>
                  <MenuItem value="custom">Personalizado</MenuItem>
                </Select>
              </FormControl>
              
              {/* Selectores de fecha personalizada */}
              {timeRange === 'custom' && (
                <>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Fecha inicio"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      sx={{ width: 180 }}
                      maxDate={endDate}
                    />
                  </LocalizationProvider>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Fecha fin"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      sx={{ width: 180 }}
                      minDate={startDate}
                    />
                  </LocalizationProvider>
                </>
              )}
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
                <Button 
                  variant="contained" 
                  onClick={addFilter}
                  disabled={
                    !currentFilter.value || 
                    (Array.isArray(currentFilter.value) && currentFilter.value.length === 0)
                  }
                  startIcon={<Add />}
                >
                  Añadir filtro
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Estadísticas */}
          {stats && !loading && (
            <Grid2 container spacing={3} mb={4}  sx={{
    justifyContent: 'center', // Centra horizontalmente los items
    alignItems: 'center',    // Centra verticalmente los items
  }}>
              <Grid2 item xs={12} md={3}>
                <StatCard 
                  icon={<PeopleAlt />}
                  title="Total socios"
                  value={stats.total_socios}
                  subtext={`${stats.nuevos_ultimos_30_dias} nuevos en 30 días`}
                  sx={{ height: '100%' }}
                />
              </Grid2>
              
              <Grid2 item xs={12} md={3}>
                <StatCard 
                  icon={<CheckCircle />}
                  title="Socios activos"
                  value={stats.socios_activos}
                  subtext={`${Math.round((stats.socios_activos/stats.total_socios)*100)}% del total`}
                  sx={{ height: '100%' }}
                />
              </Grid2>
              
              
              <Grid2 item xs={12} md={4}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    Proporción genero
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box textAlign="center">
                      <Male color="primary" fontSize="large" />
                      <Typography fontWeight={600}>
                        {stats.demografia.genero.masculino || 0}
                      </Typography>
                      <Typography variant="caption">
                        {stats.total_socios > 0 ? Math.round((stats.demografia.genero.masculino/stats.total_socios)*100) : 0}%
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Female color="secondary" fontSize="large" />
                      <Typography fontWeight={600}>
                        {stats.demografia.genero.femenino || 0}
                      </Typography>
                      <Typography variant="caption">
                        {stats.total_socios > 0 ? Math.round((stats.demografia.genero.femenino/stats.total_socios)*100) : 0}%
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid2>
              
              <Grid2 item xs={12} md={4}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    Edad promedio
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stats.demografia.edad_promedio.toFixed(1)} años
                  </Typography>
                  <Box mt={2}>
                    <Typography variant="caption" display="block">
                      Menores de 30: {stats.demografia.distribucion_edad.menores_30}
                    </Typography>
                    <Typography variant="caption" display="block">
                      30-50 años: {stats.demografia.distribucion_edad.entre_30_50}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Mayores de 50: {stats.demografia.distribucion_edad.mayores_50}
                    </Typography>
                  </Box>
                </Card>
              </Grid2>

              
              { <Grid2 item xs={12} md={4}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    Cuota media
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    €{stats.cuota_promedio}
                  </Typography>
                  <Typography variant="caption" display="block" mt={1}>
                    {stats.total_socios -stats.no_facturables} socios facturable
                  </Typography>
                  <Typography variant="caption" display="block">
                    {stats.total_socios - stats.socios_activos} socios inactivos
                  </Typography>
                </Card>
              </Grid2> }
              

            </Grid2>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography variant="subtitle1" fontWeight={600} mb={2} sx={{ color: 'black' }}>
                Listado de socios ({cuotasFacturables2.length})
                {filters.fecha_inicio && (
                  <Typography component="span" variant="body2" color="text.secondary" ml={1}>
                    {new Date(filters.fecha_inicio).toLocaleDateString()} - 
                    {filters.fecha_fin ? new Date(filters.fecha_fin).toLocaleDateString() : ''}
                  </Typography>
                )}
              </Typography>
              
              {cuotasFacturables2.length > 0 ? (
                <TableContainer component={Paper} sx={{ mb: 4 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Estado</TableCell>
                        {/*<TableCell>Cuota</TableCell> */}
                        
                        <TableCell>Edad</TableCell>
                        <TableCell>Fecha Ingreso</TableCell>
                         {/* <TableCell>Importe</TableCell> */}
                        
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cuotasFacturables2.map((socio) => (
                        <TableRow 
                          key={socio.id} 
                          hover
                          onClick={() => handleOpenSocio(socio)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ 
                                bgcolor: socio.genero_socio === 'femenino' ? 'secondary.light' : 'primary.light',
                                color: socio.genero_socio === 'femenino' ? 'secondary.main' : 'primary.main',
                                mr: 2,
                                width: 32, height: 32
                              }}>
                                {socio.nombre_socio?.charAt(0) || '?'}
                              </Avatar>
                              {socio.nombre_socio} {socio.apellido_socio}
                            </Box>
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

                           {/* <TableCell>
                            <TableCell>
                            €{socio.importe || '0'} ({socio.periodicidad || 'N/A'})
                          </TableCell>
                          </TableCell>*/}
                         
                          <TableCell>
                            {calcularEdad(socio.fecha_nacimiento)} años
                          </TableCell>
                          <TableCell>
                            {socio.fecha_creacion ? 
                              new Date(socio.fecha_creacion).toLocaleDateString() : 'N/A'}
                          </TableCell>
                           {/* <TableCell>
                            €{socio.importe || '0'}
                          </TableCell>*/}
                          
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Card sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No se encontraron socios con los filtros aplicados</Typography>
                </Card>
              )}

              {/* Diálogo de detalle de socio */}
              {selectedSocio && (
                <Dialog 
                  open={!!selectedSocio} 
                  onClose={handleCloseSocio}
                  fullWidth
                  maxWidth="md"
                >
                  <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">
                        {selectedSocio.nombre_socio} {selectedSocio.apellido_socio}
                        <StatusChip 
                          label={selectedSocio.activo ? 'Activo' : 'Inactivo'} 
                          color={selectedSocio.activo ? 'success' : 'error'}
                          sx={{ ml: 2 }}
                        />
                      </Typography>
                      <IconButton onClick={handleCloseSocio}>
                        <Close />
                      </IconButton>
                    </Box>
                  </DialogTitle>
                  
                  <DialogContent dividers>
                    <Tabs 
                      value={fichaTab} 
                      onChange={(e, newValue) => setFichaTab(newValue)}
                      sx={{ mb: 3 }}
                    >
                      <Tab label="Información General" />
                      <Tab label="Detalles Comerciales" />
                      <Tab label="Historial" />
                    </Tabs>

                    {fichaTab === 0 && (
                      <Grid2 container spacing={3}>
                        <Grid2 item xs={12} md={6}>
                          <Typography variant="subtitle1" mb={2}>Información Personal</Typography>
                          <Box mb={3}>
                            <Grid2 container spacing={2}>
                              <Grid2 item xs={6}>
                                <Typography variant="subtitle2">Nombre completo:</Typography>
                                <Typography>
                                  {selectedSocio.nombre_socio} {selectedSocio.apellido_socio}
                                </Typography>
                              </Grid2>
                              <Grid2 item xs={6}>
                                <Typography variant="subtitle2">Género:</Typography>
                                <Typography>
                                  {selectedSocio.genero_socio === 'masculino' ? 'Hombre' : 
                                   selectedSocio.genero_socio === 'femenino' ? 'Mujer' : 'No especificado'}
                                </Typography>
                              </Grid2>
                              <Grid2 item xs={6}>
                                <Typography variant="subtitle2">Fecha de nacimiento:</Typography>
                                <Typography>
                                  {selectedSocio.fecha_nacimiento ? 
                                    `${new Date(selectedSocio.fecha_nacimiento).toLocaleDateString()} 
                                    (${calcularEdad(selectedSocio.fecha_nacimiento)} años)` : 'N/A'}
                                </Typography>
                              </Grid2>
                              <Grid2 item xs={6}>
                                <Typography variant="subtitle2">Identificación:</Typography>
                                <Typography>
                                  {selectedSocio.tipo_identificacion_socio || 'N/A'}: {selectedSocio.numero_identificacion_socio || 'N/A'}
                                </Typography>
                              </Grid2>
                              <Grid2 item xs={12}>
                                <Typography variant="subtitle2">Dirección:</Typography>
                                <Typography>
                                  {selectedSocio.via_principal || 'N/A'}, {selectedSocio.ciudad_direccion || 'N/A'}
                                </Typography>
                                <Typography>
                                  {selectedSocio.estado_provincia || 'N/A'}, CP: {selectedSocio.cp_direccion || 'N/A'}
                                </Typography>
                              </Grid2>
                            </Grid2>
                          </Box>
                        </Grid2>

                        <Grid2 item xs={12} md={6}>
                          <Typography variant="subtitle1" mb={2}>Detalles de Contacto</Typography>
                          <Box mb={3}>
                            <Grid2 container spacing={2}>
                              <Grid2 item xs={6}>
                                <Typography variant="subtitle2">Canal de entrada:</Typography>
                                <Typography>{selectedSocio.canal_entrada || 'N/A'}</Typography>
                              </Grid2>
                              <Grid2 item xs={6}>
                                <Typography variant="subtitle2">Primer canal:</Typography>
                                <Typography>{selectedSocio.primer_canal_captacion || 'N/A'}</Typography>
                              </Grid2>
                              <Grid2 item xs={6}>
                                <Typography variant="subtitle2">Día presentación:</Typography>
                                <Typography>{selectedSocio.dia_presentacion || 'N/A'}</Typography>
                              </Grid2>
                              <Grid2 item xs={6}>
                                <Typography variant="subtitle2">Estado actual:</Typography>
                                <Typography>{selectedSocio.status || 'N/A'}</Typography>
                              </Grid2>
                              <Grid2 item xs={6}>
                                <Typography variant="subtitle2">Devolución:</Typography>
                                <Typography>
                                  {selectedSocio.devolucion ? 'Aprobada' : 'Rechazada'}
                                </Typography>
                              </Grid2>
                              <Grid2 item xs={6}>
                                <Typography variant="subtitle2">Llamadas realizadas:</Typography>
                                <Typography>{selectedSocio.no_llamadas || '0'}</Typography>
                              </Grid2>
                            </Grid2>
                          </Box>
                        </Grid2>
                      </Grid2>
                    )}

                    {fichaTab === 1 && (
                      <Grid2 container spacing={3}>
                        <Grid2 item xs={12} md={6}>
                          <Typography variant="subtitle1" mb={2}>Información de Pago</Typography>
                          <Box mb={3}>
                            <Grid2 container spacing={2}>
                              <Grid2 item xs={6}>
                                <Typography variant="subtitle2">Importe:</Typography>
                                <Typography>€{selectedSocio.importe || '0'}</Typography>
                              </Grid2>
                              <Grid2 item xs={6}>
                                <Typography variant="subtitle2">Periodicidad:</Typography>
                                <Typography>{selectedSocio.periodicidad || 'N/A'}</Typography>
                              </Grid2>
                              <Grid2 item xs={6}>
                                <Typography variant="subtitle2">Medio de pago:</Typography>
                                <Typography>{selectedSocio.medio_pago || 'N/A'}</Typography>
                              </Grid2>
                              <Grid2 item xs={6}>
                                <Typography variant="subtitle2">Tipo de pago:</Typography>
                                <Typography>{selectedSocio.tipo_pago || 'N/A'}</Typography>
                              </Grid2>
                            </Grid2>
                          </Box>
                        </Grid2>
                        
                        <Grid2 item xs={12} md={6}>
                          <Typography variant="subtitle1" mb={2}>Fechas Clave</Typography>
                          <Box mb={3}>
                            <Grid2 container spacing={2}>
                              <Grid2 item xs={6}>
                                <Typography variant="subtitle2">Fecha de alta:</Typography>
                                <Typography>
                                  {new Date(selectedSocio.fecha_alta).toLocaleDateString()}
                                </Typography>
                              </Grid2>
                              <Grid2 item xs={6}>
                                <Typography variant="subtitle2">Última actualización:</Typography>
                                <Typography>
                                  {new Date(selectedSocio.fecha_actualizacion).toLocaleDateString()}
                                </Typography>
                              </Grid2>
                              {selectedSocio.fecha_verificacion && (
                                <Grid2 item xs={6}>
                                  <Typography variant="subtitle2">Fecha verificación:</Typography>
                                  <Typography>
                                    {new Date(selectedSocio.fecha_verificacion).toLocaleDateString()}
                                  </Typography>
                                </Grid2>
                              )}
                              {selectedSocio.fecha_creacion && (
                                <Grid2 item xs={6}>
                                  <Typography variant="subtitle2">Fecha creación:</Typography>
                                  <Typography>
                                    {new Date(selectedSocio.fecha_creacion).toLocaleDateString()}
                                  </Typography>
                                </Grid2>
                              )}
                            </Grid2>
                          </Box>
                        </Grid2>
                      </Grid2>
                    )}

                    {fichaTab === 2 && (
                      <Box>
                        <Typography variant="subtitle1" mb={3}>Historial del Socio</Typography>
                        
                        <Box mb={3}>
                          <Typography variant="subtitle2" mb={2}>Estado actual:</Typography>
                          <Box display="flex" alignItems="center" gap={2}>
                            {selectedSocio.status === 'Verificado' && <CheckCircle color="success" />}
                            {selectedSocio.status === 'Baja' && <Error color="error" />}
                            {selectedSocio.status === 'Ilocalizable' && <Warning color="warning" />}
                            <Typography>{selectedSocio.status || 'N/A'}</Typography>
                          </Box>
                        </Box>

                        <Box mb={3}>
                          <Typography variant="subtitle2" mb={2}>Devolución:</Typography>
                          <Box display="flex" alignItems="center" gap={2}>
                            {selectedSocio.devolucion ? (
                              <>
                                <Check color="success" />
                                <Typography>Aprobada</Typography>
                              </>
                            ) : (
                              <>
                                <Close color="error" />
                                <Typography>Rechazada</Typography>
                              </>
                            )}
                          </Box>
                        </Box>

                        <Box mb={3}>
                          <Typography variant="subtitle2" mb={2}>Llamadas realizadas:</Typography>
                          <Typography>{selectedSocio.no_llamadas || '0'}</Typography>
                        </Box>
                      </Box>
                    )}
                  </DialogContent>
                  
                  <DialogActions>
                    <Button onClick={handleCloseSocio} variant="contained" color="primary">
                      Cerrar
                    </Button>
                  </DialogActions>
                </Dialog>
              )}
            </>
          )}
        </Box>
      </LocalizationProvider>
    </ProtectedRole>
  )
}
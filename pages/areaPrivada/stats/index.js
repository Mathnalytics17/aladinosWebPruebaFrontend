import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Grid, Paper, Typography, Box, MenuItem, Select, FormControl, InputLabel,
  Card, CardContent, List, ListItem, ListItemText, Divider, Chip, Avatar,
  CircularProgress, Alert, TextField,Button,  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,IconButton,Checkbox,  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle'; // Añade esta línea
import LinearProgress from '@mui/material/LinearProgress'; // Añade este import
import { 
  PieChart, BarChart, LineChart,
  ChartContainer, ChartTooltip, ChartLegend
} from '@mui/x-charts';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import dayjs from 'dayjs';
import { alpha, useTheme } from '@mui/material/styles';
import { 
  TrendingUp, People, Euro, Cake, LocationOn, AssignmentInd,
  CheckCircle, Warning, Error, FilterList, Search,Close,Delete,
  Add,Clear
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import ProtectedRole from '@/shared/components/protectedRoute';
import { ArrowBack, ExitToApp } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import EuroSymbol from '@mui/icons-material/EuroSymbol';
const DashboardSocios = () => {
   const router = useRouter();
  const theme = useTheme();
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('last_year');
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'year'));
  const [endDate, setEndDate] = useState(dayjs());
  const [activeTab, setActiveTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSocio, setSelectedSocio] = useState(null);



  // Nuevos estados para filtros avanzados
  const [activeFilters, setActiveFilters] = useState([]);
  const [currentFilter, setCurrentFilter] = useState({
    column: '',
    operator: 'contains',
    value: ''
  });
  const [fundraisers, setFundraisers] = useState([]);
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
  // Obtener datos del backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}users/socio/`);
        setSocios(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al obtener datos:", err);
        setError("Error al cargar los datos. Por favor intenta nuevamente.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatusChip = styled(Chip)(({ theme }) => ({
    fontWeight: 600,
    fontSize: '0.75rem',
    padding: theme.spacing(0.5),
    minWidth: 80,
  }));
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return 'N/A';
    }
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
  setTimeRange('last_year');
  setStartDate(dayjs().subtract(1, 'year'));
  setEndDate(dayjs());
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
  let endDateFilter = now; // Por defecto, el fin del rango es hoy
  
  switch(timeRange) {
    case 'last_week':
      // Semana actual desde el lunes
      startDateFilter = now.startOf('week'); // dayjs usa lunes como inicio de semana
      break;
    case 'last_month':
      // Mes actual desde el día 1
      startDateFilter = now.startOf('month');
      break;
    case 'last_quarter':
      // Trimestre anterior (3 meses atrás)
      startDateFilter = now.subtract(3, 'months');
      break;
    case 'last_year':
      // Año actual desde el 1ero de enero
      startDateFilter = now.startOf('year');
      break;
    case 'custom':
      // Rango personalizado
      startDateFilter = startDate;
      endDateFilter = endDate || now; // Si no hay fecha final, usa hoy
      break;
    default:
      startDateFilter = null;
  }
  
  if (startDateFilter) {
    const fechaAlta = dayjs(socio.fecha_creacion);
    matchesDateRange = fechaAlta.isAfter(startDateFilter) && 
           (timeRange !== 'custom' || fechaAlta.isBefore(endDateFilter));
  }
}
    return matchesSearch && matchesActiveFilters && matchesDateRange;
  });
};

// Filtrar socios basado en los filtros seleccionados
const filteredSocios = useMemo(() => {
  return applyFilters(socios);
}, [socios, timeRange, startDate, endDate, searchTerm, activeFilters]);


  // Calcular estadísticas y tendencias
  const stats = useMemo(() => calculateStats(filteredSocios, socios), [filteredSocios, socios]);
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
console.log(stats)
  return (
    <ProtectedRole requiredRoles={["JEFE"]}>
      <Box sx={{ p: 3, backgroundColor: '#f9fafc', minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: '800', color: theme.palette.primary.dark }}>
            Dashboard de Socios
          </Typography>
          <Button
              startIcon={<ArrowBack />} // Asegúrate de importar ArrowBack desde @mui/icons-material
              onClick={() => router.push('/areaPrivada')}
              sx={{ mb: 1 }}
            >
              Volver
            </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip 
              label="Vista general" 
              onClick={() => setActiveTab('overview')} 
              color={activeTab === 'overview' ? 'primary' : 'default'}
              variant={activeTab === 'overview' ? 'filled' : 'outlined'}
            />
            <Chip 
              label="Análisis demográfico" 
              onClick={() => setActiveTab('demographic')} 
              color={activeTab === 'demographic' ? 'primary' : 'default'}
              variant={activeTab === 'demographic' ? 'filled' : 'outlined'}
            />
            
          </Box>
        </Box>

        {/* Filtros */}
        {/* Filtros avanzados */}
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

        {/* Métricas clave */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          
          <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            icon={<EuroSymbol sx={{ fontSize: 40 }} />}
            title="Facturación"
            value={`${stats.facturacionTotal} €`}
            trend={stats.trendFacturacion}
            color={theme.palette.success.main}
            subtext={
              <>
                <Box component="span" display="block">Total anual: €{stats.facturacionTotal}</Box>
                <Box component="span" display="block" color="error.main">
                  Pérdidas: €{stats.facturacionPerdida}
                </Box>
              </>
            }
          />
        </Grid>
         
           <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              icon={<Euro sx={{ fontSize: 40 }} />}
              title="Cuota Media Mensual Socios"
              value={`${stats.facturacionMensual} €`}
              trend={stats.trendCuota}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              icon={<People sx={{ fontSize: 40 }} />}
              title="Socios del Mes"
              value={filteredSocios.length}
              trend={stats.trendTotal}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard 
              icon={<Cake sx={{ fontSize: 40 }} />}
              title="Edad Media"
              value={`${stats.edadMedia} años`}
              trend={stats.trendEdad}
              color={theme.palette.warning.main}
            />
          </Grid>
          
        
        </Grid>

        {/* Gráficos principales */}
        {activeTab === 'overview' && (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card sx={{ p: 2, height: '100%', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Evolución mensual de socios</Typography>
                <LineChart
                  xAxis={[{
                    data: stats.monthlyLabels,
                    scaleType: 'band',
                  }]}
                  series={[{
                    data: stats.monthlyData,
                    area: true,
                    color: theme.palette.primary.main,
                  }]}
                  height={300}
                  margin={{ left: 70 }}
                />
              </Card>
            </Grid>
            
            <Grid item xs={12} lg={4}>
              <Card sx={{ p: 2, height: '100%', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Distribución por estado</Typography>
                <PieChart
                  series={[{
                    data: [
                      { value: stats.estados.Verificado, label: 'Verificado', color: '#4CAF50' },
                      { value: stats.estados.Pendiente, label: 'Pendiente', color: '#FFC107' },
                      { value: stats.estados.Baja, label: 'Baja', color: '#F44336' },
                      { value: stats.estados.Ilocalizable, label: 'Ilocalizable', color: '#9E9E9E' },
                    ],
                    innerRadius: 50,
                    outerRadius: 80,
                  }]}
                  height={300}
                  slotProps={{
                    legend: {
                      direction: 'row',
                      position: { vertical: 'bottom', horizontal: 'middle' },
                      padding: 0,
                    },
                  }}
                />
              </Card>
            </Grid>
            
             <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Socios por comercial</Typography>
                <List sx={{ width: '100%' }}>
                  {Object.entries(stats.comerciales)
                    .sort((a, b) => b[1] - a[1])
                    .map(([comercial, count]) => (
                      <React.Fragment key={comercial}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText 
                            primary={comercial} 
                            secondary={`${count} socios`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <Box sx={{ width: '60%' }}>
                            <SparkLineChart
                              data={[0, count/3, count/2, count, count/1.5, count/2, count/3, count/4, count/2]}
                              height={40}
                              colors={[theme.palette.primary.main]}
                              curve="natural"
                              area
                            />
                          </Box>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                </List>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Cuotas más comunes</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {stats.cuotasComunes.map((cuota, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: '80px' }}>
                        <Typography variant="body1" fontWeight="500">{cuota.value} €</Typography>
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ 
                          height: '24px', 
                          borderRadius: '12px',
                          backgroundColor: alpha(theme.palette.primary.main, 0.2),
                          width: `${(cuota.count / stats.cuotasComunes[0].count) * 100}%`
                        }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">{cuota.count} socios</Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          
          </Grid>
          
        )}

        {activeTab === 'demographic' && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Distribución por edades</Typography>
                <BarChart
                  xAxis={[{
                    scaleType: 'band',
                    data: ['20-29', '30-39', '40-49', '50-59', '60-69', '70+'],
                  }]}
                  series={[{
                    data: stats.edades,
                    color: theme.palette.secondary.main,
                  }]}
                  height={400}
                />
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
  <Card sx={{ p: 3, height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Distribución por género</Typography>
    
    <Box sx={{ 
      flex: 1, 
      minHeight: 0,
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'space-between' 
    }}>
      {/* Gráfico principal con altura flexible */}
      <Box sx={{ flex: 1 }}>
        <PieChart
          series={[{
            data: [
              { value: stats.genero.masculino, label: 'Masculino', color: '#4285F4' },
              { value: stats.genero.femenino, label: 'Femenino', color: '#EA4335' },
              { value: stats.genero.otro, label: 'Otro', color: '#FBBC05' },
            ],
            innerRadius: 40, // Aumenté el radio interno
            outerRadius: 150, // Radio externo más grande
          }]}
          slotProps={{
            legend: {
              hidden: true // Ocultamos la leyenda por defecto
            }
          }}
          sx={{
            width: '100%',
            height: '100%'
          }}
        />
      </Box>

      {/* Leyenda personalizada en la parte inferior */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        gap: 3,
        mt: 2,
        flexWrap: 'wrap'
      }}>
        {[
          { label: 'Masculino', color: '#4285F4' },
          { label: 'Femenino', color: '#EA4335' },
          { label: 'Otro', color: '#FBBC05' }
        ].map((item) => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 16, 
              height: 16, 
              backgroundColor: item.color,
              borderRadius: '2px'
            }}/>
            <Typography variant="body2">{item.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  </Card>
</Grid>
            
<Grid item xs={12}>
  <Card sx={{ p: 2, borderRadius: 3 }}>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Distribución geográfica</Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      {Object.entries(
        Object.entries(stats.ciudades || {}).reduce((acc, [rawLocation, count]) => {
          // Normalizamos eliminando espacios extras y convirtiendo a minúsculas
          const normalizedLocation = rawLocation.trim().toLowerCase();
          if (!acc[normalizedLocation]) {
            acc[normalizedLocation] = 0;
          }
          acc[normalizedLocation] += count;
          return acc;
        }, {})
      )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([location, count]) => {
        // Separamos ciudad y provincia si existe
        const [city, province] = location.split(', ');
        
        // Formateamos para mostrar
        const displayText = province
          ? `${city.charAt(0).toUpperCase() + city.slice(1)}, ${province.toUpperCase()}`
          : city.charAt(0).toUpperCase() + city.slice(1);
        
        return (
          <CityCard 
            key={location} 
            city={displayText}
            count={count} 
          />
        );
      })}
    </Box>
  </Card>
</Grid>
          </Grid>

        )}


        {/* Últimos socios */}
        <Card sx={{ mt: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Últimos socios registrados ({filteredSocios.length} resultados)
            </Typography>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {filteredSocios.slice(0, 5).map((socio, index) => (
                <React.Fragment key={socio.id || index}>
                   <ListItem 
                      alignItems="flex-start"
                      button // Hace que sea clickeable
                      onClick={() => setSelectedSocio(socio)} // Establece el socio seleccionado
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                    <Avatar sx={{ bgcolor: getRandomColor(), mr: 2 }}>
                      {socio.nombre_socio?.charAt(0)}{socio.apellido_socio?.charAt(0)}
                    </Avatar>
                    <ListItemText
                      primary={`${socio.nombre_socio || ''} ${socio.apellido_socio || ''}`}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                            sx={{ display: 'block' }}
                          >
                            {socio.ciudad_direccion || 'Sin ciudad'} • {socio.tipo_identificacion_socio}: {socio.numero_identificacion_socio || 'N/A'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip 
                              label={`${socio.importe || 0} €`} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                            <Chip 
                              label={socio.status || 'Pendiente'} 
                              size="small" 
                              color={
                                socio.status === 'Verificado' ? 'success' : 
                                socio.status === 'Pendiente' ? 'warning' :
                                socio.status === 'Baja' ? 'error' : 'default'
                              }
                              icon={
                                socio.status === 'Verificado' ? <CheckCircle fontSize="small" /> :
                                socio.status === 'Pendiente' ? <Warning fontSize="small" /> :
                                socio.status === 'Baja' ? <Error fontSize="small" /> :
                                <Warning fontSize="small" />
                              }
                              variant="outlined"
                            />
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                  {index < 4 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
       <Card>
  <CardContent>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
      Cuota media por comercial
    </Typography>
    
    <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Fundraiser</TableCell>
        <TableCell align="right">Cuota media</TableCell>
        <TableCell align="right">Socios</TableCell>
        <TableCell>Progreso</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {stats.cuotaPorFundraiser.map((fundraiser, index) => (
        <TableRow 
          key={index}
          sx={{
            '&:not(:last-child)': { borderBottom: '1px solid rgba(224, 224, 224, 0.5)' },
            borderLeft: index < 3 ? 
              `4px solid ${['#FFD700', '#C0C0C0', '#CD7F32'][index]}` : 
              '4px solid transparent'
          }}
        >
          <TableCell>
            <Box display="flex" alignItems="center">
              <AccountCircle color="primary" sx={{ mr: 1.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {fundraiser.name}
              </Typography>
            </Box>
          </TableCell>
          
          <TableCell align="right">
            <Typography variant="h6" color="primary">
              €{fundraiser.cuotaMedia.toFixed(2)}
            </Typography>
          </TableCell>
          
          <TableCell align="right">
            <Typography variant="h6">
              {fundraiser.totalSocios}
            </Typography>
          </TableCell>
          
          <TableCell>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(fundraiser.cuotaMedia * 2, 100)}
              sx={{ 
                height: 6,
                borderRadius: 3,
                backgroundColor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: index < 3 ? 
                    ['#FFD700', '#C0C0C0', '#CD7F32'][index] : 
                    'primary.main'
                }
              }} 
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
    
    {stats.cuotaPorFundraiser.length === 0 && (
      <Box textAlign="center" py={4}>
        <Typography color="text.secondary">
          No hay datos de comerciales disponibles
        </Typography>
      </Box>
    )}
  </CardContent>
</Card>
        {/* Modal/Drawer para mostrar la ficha del socio */}
{selectedSocio && (
  <Dialog
    open={!!selectedSocio}
    onClose={() => setSelectedSocio(null)}
    maxWidth="md"
    fullWidth
  >
    <DialogTitle>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        Ficha del Socio
        <IconButton onClick={() => setSelectedSocio(null)}>
          <Close />
        </IconButton>
      </Box>
    </DialogTitle>
    <DialogContent>
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
              {/* Resto de campos personales... */}
            </Grid>
          </Box>

          <Typography variant="subtitle1" mb={2}>Dirección</Typography>
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Dirección:</Typography>
                <Typography>{selectedSocio.via_principal || 'N/A'}</Typography>
              </Grid>
              {/* Resto de campos de dirección... */}
            </Grid>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" mb={2}>Información de Registro</Typography>
          <Box mb={3}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Fecha Ingreso:</Typography>
                <Typography>
                  {formatDate(selectedSocio.fecha_creacion)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Estado:</Typography>
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
              {/* Resto de campos de pago... */}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setSelectedSocio(null)}>Cerrar</Button>
      
    </DialogActions>
  </Dialog>
)}
      </Box>
    </ProtectedRole>
  );
};

// Componente de tarjeta de métrica
const MetricCard = ({ icon, title, value, trend, color }) => {
  const trendColor = trend >= 0 ? '#4CAF50' : '#F44336';
  
  return (
    <Card sx={{ 
      p: 2, 
      height: '100%', 
      borderRadius: 3,
      background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
      border: `1px solid ${alpha(color, 0.2)}`
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ 
          width: 50, 
          height: 50, 
          borderRadius: '12px',
          backgroundColor: alpha(color, 0.2),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 2,
          color: color
        }}>
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>{value}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TrendingUp sx={{ 
          color: trendColor,
          transform: trend >= 0 ? 'none' : 'rotate(180deg)'
        }} />
        <Typography variant="body2" sx={{ color: trendColor, ml: 0.5 }}>
          {Math.abs(trend)}% {trend >= 0 ? 'aumento' : 'disminución'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>vs periodo anterior</Typography>
      </Box>
    </Card>
  );
};

// Componente de tarjeta de ciudad
const CityCard = ({ city, count }) => {
  return (
    <Card sx={{ 
      p: 2, 
      minWidth: 180,
      borderRadius: 2,
      boxShadow: 'none',
      border: '1px solid #e0e0e0'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <LocationOn sx={{ color: '#EA4335', mr: 1 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{city}</Typography>
      </Box>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 800,
          ml: 11, // ← Mueve el número 2 unidades (16px) a la derecha
          textAlign: 'left' // Opcional: asegura la alineación izquierda
        }}
      >{count}</Typography>
      <Typography variant="h5" 
        sx={{ 
          fontWeight: 800,
          ml:0, // ← Mueve el número 2 unidades (16px) a la derecha
          textAlign: 'center' // Opcional: asegura la alineación izquierda
        }} >socios</Typography>
    </Card>
  );
};

function calculateStats(filteredSocios, allSocios) {
  // Inicialización de estadísticas
  const stats = {
    cuotaMedia: 0,
    cuotaMediaMensual:0,
    cuotasComunes: [],
    genero: { masculino: 0, femenino: 0, otro: 0 },
    identificacion: { NIF: 0, NIE: 0, Pasaporte: 0, CIF: 0 },
    edades: Array(6).fill(0),
    ciudades: {},
    comerciales: {},
    estados: { Verificado: 0, Pendiente: 0, Baja: 0, Ilocalizable: 0, Incidencia: 0 },
    nuevosEsteMes: 0,
    edadMedia: 0,
    trendTotal: 0,
    trendCuota: 0,
    trendEdad: 0,
    trendNuevos: 0,
    monthlyData: Array(12).fill(0),
    monthlyLabels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    facturacionMensual: 0,
    facturacionTotal: 0,
    facturacionPerdida: 0,
    facturacionActiva: 0,
    trendFacturacion: 0
  };

  const currentDate = dayjs();
  const currentMonth = currentDate.month();
  const currentYear = currentDate.year();
  const cuotaCounts = {};
  let totalAge = 0;
  let totalCuota = 0;
  let facturacionTotal = 0;
  let facturacionActiva = 0;
  let facturacionPerdida = 0;
  let previousMonthFacturacion = 0;

  // Función para verificar si un socio NO debe ser facturado
  const noFacturable = (socio) => {
    return socio.is_borrador || 
           socio.status === 'Baja' || 
           socio.status === 'Incidencia' || 
           socio.devolucion;
  };

 // Función simplificada para calcular facturación ANUAL
 const calcularFacturacionAnual = (importe, periodicidad) => {
  const importeNum = parseFloat(importe) || 0;
  switch(periodicidad) {
    case 'Mensual': return importeNum * 12;
    case 'Trimestral': return importeNum * 4;
    case 'Semestral': return importeNum * 2;
    case 'Anual': return importeNum;
    default: return importeNum; // Por si hay otros valores no contemplados
  }
};

 // Función simplificada para calcular facturación ANUAL
 const calcularFacturacionMensual = (importe, periodicidad) => {
  const importeNum = parseFloat(importe) || 0;
  switch(periodicidad) {
    case 'Mensual': return importeNum ;
    case 'Trimestral': return importeNum/3 ;
    case 'Semestral': return importeNum/6;
    case 'Anual': return importeNum/12;
    default: return importeNum; // Por si hay otros valores no contemplados
  }
};

  // 1. Procesar todos los socios para datos mensuales
  const currentYearSocios = allSocios.filter(socio => {
    return dayjs(socio.fecha_creacion).year() === currentYear;
  });

  currentYearSocios.forEach(socio => {
    const month = dayjs(socio.fecha_creacion).month();
    stats.monthlyData[month]++;
  });

  // 2. Procesar socios del mes anterior para comparación
  const previousMonthSocios = allSocios.filter(socio => {
    const fechaAlta = dayjs(socio.fecha_creacion);
    return fechaAlta.month() === currentMonth - 1 && fechaAlta.year() === currentYear;
  });

  previousMonthSocios.forEach(socio => {
    if (!noFacturable(socio)) {
      previousMonthFacturacion += calcularFacturacionAnual(socio.importe, socio.periodicidad, true); // Facturación mensual
    }
  });

  // 3. Procesar socios filtrados (la lista principal)
  filteredSocios.forEach(socio => {
    const importe = parseFloat(socio.importe) || 0;
    const facturable = !noFacturable(socio);
    const facturacionAnual = facturable ? calcularFacturacionAnual(importe, socio.periodicidad) : 0;
    const facturacionMensual = facturable ? calcularFacturacionMensual(importe, socio.periodicidad, true) : 0;

    // Estadísticas de facturación (solo para socios facturables)
    if (facturable) {
      facturacionTotal += facturacionAnual;
      facturacionActiva += facturacionMensual; // Usamos el valor mensual aquí
      totalCuota += importe;
      cuotaCounts[importe] = (cuotaCounts[importe] || 0) + 1;
    } else {
      facturacionPerdida += calcularFacturacionAnual(importe, socio.periodicidad); // Facturación anual perdida
    }

    // Resto de estadísticas (igual que antes)
    if (socio.genero_socio === 'masculino') stats.genero.masculino++;
    else if (socio.genero_socio === 'femenino') stats.genero.femenino++;
    else stats.genero.otro++;
    
    if (socio.tipo_identificacion_socio in stats.identificacion) {
      stats.identificacion[socio.tipo_identificacion_socio]++;
    }
    
    if (socio.fecha_nacimiento) {
      const edad = currentDate.diff(dayjs(socio.fecha_nacimiento), 'year');
      const edadIndex = Math.min(Math.floor((edad - 20) / 10), 5);
      if (edadIndex >= 0) stats.edades[edadIndex]++;
      totalAge += edad;
    }
    
    if (socio.ciudad_direccion) {
      const ciudadCompleta = socio.estado_provincia 
        ? `${socio.ciudad_direccion}, ${socio.estado_provincia}`
        : socio.ciudad_direccion;
      stats.ciudades[ciudadCompleta] = (stats.ciudades[ciudadCompleta] || 0) + 1;
    }
    
    if (socio.fundraiser) {
      const comercialName = socio.fundraiser.first_name + ' ' + socio.fundraiser.last_name || `Comercial ${socio.fundraiser.id}`;
      stats.comerciales[comercialName] = (stats.comerciales[comercialName] || 0) + 1;
    }
    
    if (socio.status && stats.estados.hasOwnProperty(socio.status)) {
      stats.estados[socio.status]++;
    }
    
    const socioDate = dayjs(socio.fecha_creacion);
    if (socioDate.month() === currentMonth && socioDate.year() === currentYear) {
      stats.nuevosEsteMes++;
    }
  });
// Nuevo objeto para almacenar datos por fundraiser
  const fundraisersStats = {};
  console.log(filteredSocios)
  filteredSocios.forEach(socio => {
    const importe = parseFloat(socio.importe) || 0;
    const facturable = !noFacturable(socio);
    
    if (facturable && socio.fundraiser) {
      const fundraiserId = socio.fundraiser.id;
      const fundraiserName = `${socio.fundraiser.first_name} ${socio.fundraiser.last_name}` || `Comercial ${fundraiserId}`;
      
      if (!fundraisersStats[fundraiserId]) {
        fundraisersStats[fundraiserId] = {
          name: fundraiserName,
          totalCuota: 0,
          sociosCount: 0,
          sociosIds: new Set()
        };
      }
      
      // Evitar duplicados por si hay múltiples registros del mismo socio
      if (!fundraisersStats[fundraiserId].sociosIds.has(socio.id)) {
        fundraisersStats[fundraiserId].totalCuota += importe;
        fundraisersStats[fundraiserId].sociosCount++;
        fundraisersStats[fundraiserId].sociosIds.add(socio.id);
      }
    }
  });

  // 4. Cálculos finales
  const sociosFacturablesCount = filteredSocios.filter(socio => !noFacturable(socio)).length;

  stats.cuotaMedia = sociosFacturablesCount > 0 ? parseFloat((totalCuota / sociosFacturablesCount).toFixed(2)) : 0;
  
  stats.cuotasComunes = Object.entries(cuotaCounts)
    .map(([value, count]) => ({ value: parseFloat(value), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  stats.edadMedia = filteredSocios.length > 0 ? Math.round(totalAge / filteredSocios.length) : 0;
 console.log(facturacionActiva/ sociosFacturablesCount)
  // Facturación - ahora facturacionActiva ya es mensual
  stats.facturacionMensual = parseFloat(facturacionActiva/ sociosFacturablesCount).toFixed(2);
  stats.facturacionTotal = parseFloat(facturacionTotal.toFixed(2));
  stats.facturacionPerdida = parseFloat(facturacionPerdida.toFixed(2));
  stats.facturacionActiva = parseFloat(facturacionActiva.toFixed(2));

  // Tendencias
  stats.trendFacturacion = previousMonthFacturacion > 0 
    ? parseFloat(((facturacionActiva - previousMonthFacturacion) / previousMonthFacturacion * 100).toFixed(1))
    : facturacionActiva > 0 ? 100.0 : 0.0;

  if (allSocios.length > 0) {
    stats.trendTotal = parseFloat(((filteredSocios.length - allSocios.length) / allSocios.length * 100).toFixed(1));
  }

  // Tendencias simuladas (puedes reemplazar con cálculos reales)
  stats.trendCuota = parseFloat((Math.random() * 10 - 2).toFixed(1));
  stats.trendEdad = parseFloat((Math.random() * 5 - 1).toFixed(1));
  stats.trendNuevos = parseFloat((Math.random() * 30 + 5).toFixed(1));
stats.cuotaPorFundraiser = Object.values(fundraisersStats)
    .map(fundraiser => ({
      name: fundraiser.name,
      cuotaMedia: fundraiser.sociosCount > 0 
        ? parseFloat((fundraiser.totalCuota / fundraiser.sociosCount).toFixed(2))
        : 0,
      totalSocios: fundraiser.sociosCount,
      totalRecaudado: fundraiser.totalCuota
    }))
    .sort((a, b) => b.cuotaMedia - a.cuotaMedia); // Ordenar por cuota media descendente

  return stats;
}

// Función para colores aleatorios de avatar
function getRandomColor() {
  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A8',
    '#33FFF5', '#FFBD33', '#8D33FF', '#33FFBD', '#FF3385'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default DashboardSocios;
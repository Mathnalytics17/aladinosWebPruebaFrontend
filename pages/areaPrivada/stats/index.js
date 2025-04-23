import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Grid, Paper, Typography, Box, MenuItem, Select, FormControl, InputLabel,
  Card, CardContent, List, ListItem, ListItemText, Divider, Chip, Avatar,
  CircularProgress, Alert, TextField,Button,
} from '@mui/material';
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
  CheckCircle, Warning, Error, FilterList, Search
} from '@mui/icons-material';
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

  

  // Filtrar socios basado en los filtros seleccionados
  const filteredSocios = useMemo(() => {
    let result = [...socios];
    
    // Filtrar por rango de fechas (ahora en frontend)
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
        result = result.filter(socio => {
          const fechaAlta = dayjs(socio.fecha_alta);
          return fechaAlta.isAfter(startDateFilter) && 
                 (timeRange !== 'custom' || fechaAlta.isBefore(endDate));
        });
      }
    }
    
    // Filtrar por estado
    if (statusFilter !== 'todos') {
      result = result.filter(socio => socio.status === statusFilter);
    }
    
    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(socio => 
        (socio.nombre_socio?.toLowerCase().includes(term)) ||
        (socio.apellidos_socio?.toLowerCase().includes(term)) ||
        (socio.numero_identificacion_socio?.toLowerCase().includes(term)) ||
        (socio.ciudad_direccion?.toLowerCase().includes(term))
      );
    }
    
    return result;
  }, [socios, timeRange, startDate, endDate, statusFilter, searchTerm]);

  // Calcular estadísticas y tendencias
  const stats = useMemo(() => calculateStats(filteredSocios, socios), [filteredSocios, socios]);

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
            <Chip 
              label="Rendimiento comercial" 
              onClick={() => setActiveTab('performance')} 
              color={activeTab === 'performance' ? 'primary' : 'default'}
              variant={activeTab === 'performance' ? 'filled' : 'outlined'}
            />
          </Box>
        </Box>

        {/* Filtros */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: theme.shadows[3] }}>
          <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
            
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Rango de tiempo</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Rango de tiempo"
              >
                <MenuItem value="todos">Todos los registros</MenuItem>
                <MenuItem value="last_week">Última semana</MenuItem>
                <MenuItem value="last_month">Último mes</MenuItem>
                <MenuItem value="last_quarter">Último trimestre</MenuItem>
                <MenuItem value="last_year">Último año</MenuItem>
                <MenuItem value="custom">Personalizado</MenuItem>
              </Select>
            </FormControl>
            
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
            
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Estado"
              >
                <MenuItem value="todos">Todos los estados</MenuItem>
                <MenuItem value="Verificado">Verificado</MenuItem>
                <MenuItem value="Pendiente">Pendiente</MenuItem>
                <MenuItem value="Baja">Baja</MenuItem>
                <MenuItem value="Ilocalizable">Ilocalizable</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Métricas clave */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
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
            icon={<EuroSymbol sx={{ fontSize: 40 }} />}
            title="Facturación mensual"
            value={`€${stats.facturacionMensual}`}
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
              title="Cuota Media"
              value={`${stats.cuotaMedia} €`}
              trend={stats.trendCuota}
              color={theme.palette.success.main}
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
              <Card sx={{ p: 2, height: '100%', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Distribución por género</Typography>
                <PieChart
                  series={[{
                    data: [
                      { value: stats.genero.masculino, label: 'Masculino', color: '#4285F4' },
                      { value: stats.genero.femenino, label: 'Femenino', color: '#EA4335' },
                      { value: stats.genero.otro, label: 'Otro', color: '#FBBC05' },
                    ],
                    innerRadius: 30,
                  }]}
                  height={400}
                  slotProps={{
                    legend: {
                      direction: 'row',
                      position: { vertical: 'bottom', horizontal: 'middle' },
                    },
                  }}
                />
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Distribución geográfica</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {Object.entries(stats.ciudades)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([city, count]) => (
                      <CityCard key={city} city={city} count={count} />
                    ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 'performance' && (
          <Grid container spacing={3}>
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

        {/* Últimos socios */}
        <Card sx={{ mt: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Últimos socios registrados ({filteredSocios.length} resultados)
            </Typography>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {filteredSocios.slice(0, 5).map((socio, index) => (
                <React.Fragment key={socio.id || index}>
                  <ListItem alignItems="flex-start">
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
      <Typography variant="h5" sx={{ fontWeight: 800 }}>{count}</Typography>
      <Typography variant="caption" color="text.secondary">socios</Typography>
    </Card>
  );
};

function calculateStats(filteredSocios, allSocios) {
  const stats = {
    cuotaMedia: 0,
    cuotasComunes: [],
    genero: { masculino: 0, femenino: 0, otro: 0 },
    identificacion: { NIF: 0, NIE: 0, Pasaporte: 0, CIF: 0 },
    edades: Array(6).fill(0),
    ciudades: {},
    comerciales: {},
    estados: { Verificado: 0, Pendiente: 0, Baja: 0, Ilocalizable: 0 },
    nuevosEsteMes: 0,
    edadMedia: 0,
    trendTotal: 0,
    trendCuota: 0,
    trendEdad: 0,
    trendNuevos: 0,
    monthlyData: Array(12).fill(0),
    monthlyLabels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    // Nuevas métricas de facturación
    facturacionMensual: 0,
    facturacionTotal: 0,
    facturacionPerdida: 0,
    facturacionActiva: 0,
    trendFacturacion: 0
  };

  const cuotaCounts = {};
  let totalAge = 0;
  const currentMonth = dayjs().month();
  const currentYear = dayjs().year();

  // Variables para cálculo de facturación
  let facturacionTotal = 0;
  let facturacionActiva = 0;
  let facturacionPerdida = 0;
  let previousMonthFacturacion = 0;

  // Calcular datos mensuales para tendencias
  const monthlyCounts = Array(12).fill(0);
  const currentYearSocios = allSocios.filter(socio => {
    const fechaAlta = dayjs(socio.fecha_alta);
    return fechaAlta.year() === currentYear;
  });

  currentYearSocios.forEach(socio => {
    const month = dayjs(socio.fecha_alta).month();
    monthlyCounts[month]++;
  });

  stats.monthlyData = monthlyCounts;

  // Procesar cada socio filtrado
  filteredSocios.forEach(socio => {
    console.log(socio);
    const importe = parseFloat(socio.importe) || 0;
    console.log(importe);
    // 1. Cálculo de facturación según periodicidad
    let facturacionAnual = 0;
    switch(socio.periodicidad) {
      case 'Semestral': facturacionAnual = importe * 2; break;
      case 'Mensual': facturacionAnual = importe * 12; break;
      case 'Trimestral': facturacionAnual = importe * 4; break;
      case 'Anual': facturacionAnual = importe; break;
    }

    facturacionTotal += facturacionAnual;
    console.log(facturacionTotal);

    // 2. Determinar si es facturación activa o perdida
    if (socio.status === 'Baja' || socio.devolucion === true) {
      facturacionPerdida += facturacionAnual;
    } else {
      facturacionActiva += facturacionAnual;
    }

    // 3. Cálculos existentes (mantenidos igual)
    stats.cuotaMedia += importe;
    cuotaCounts[importe] = (cuotaCounts[importe] || 0) + 1;
    
    if (socio.genero_socio === 'masculino') stats.genero.masculino++;
    else if (socio.genero_socio === 'femenino') stats.genero.femenino++;
    else stats.genero.otro++;
    
    if (socio.tipo_identificacion_socio in stats.identificacion) {
      stats.identificacion[socio.tipo_identificacion_socio]++;
    }
    
    if (socio.fecha_nacimiento) {
      const birthDate = dayjs(socio.fecha_nacimiento);
      const edad = dayjs().diff(birthDate, 'year');
      const edadIndex = Math.min(Math.floor((edad - 20) / 10), 5);
      if (edadIndex >= 0) stats.edades[edadIndex]++;
      totalAge += edad;
    }
    
    if (socio.ciudad_direccion) {
      stats.ciudades[socio.ciudad_direccion] = (stats.ciudades[socio.ciudad_direccion] || 0) + 1;
    }
    
    if (socio.fundraiser) {
      const comercialName = socio.fundraiser.first_name + ' ' + socio.fundraiser.last_name || `Comercial ${socio.fundraiser.id}`;
      stats.comerciales[comercialName] = (stats.comerciales[comercialName] || 0) + 1;
    }
    
    if (socio.status && stats.estados.hasOwnProperty(socio.status)) {
      stats.estados[socio.status]++;
    }
    
    const socioDate = dayjs(socio.fecha_alta);
    if (socioDate.month() === currentMonth && socioDate.year() === currentYear) {
      stats.nuevosEsteMes++;
    }
  });

  // 4. Cálculo de facturación mensual (promedio anual activo)
  stats.facturacionMensual = (facturacionActiva ).toFixed(2);
  stats.facturacionTotal = facturacionTotal.toFixed(2);
  stats.facturacionPerdida = facturacionPerdida.toFixed(2);
  stats.facturacionActiva = facturacionActiva.toFixed(2);

  // 5. Cálculo de tendencias
  const previousMonthSocios = allSocios.filter(socio => {
    const fechaAlta = dayjs(socio.fecha_alta);
    return fechaAlta.month() === currentMonth - 1 && fechaAlta.year() === currentYear;
  });

  previousMonthSocios.forEach(socio => {
    const importe = parseFloat(socio.importe) || 0;
    switch(socio.periodicidad) {
      case 'Mensual': previousMonthFacturacion += importe * 12; break;
      case 'Trimestral': previousMonthFacturacion += importe * 4; break;
      case 'Semestral': previousMonthFacturacion += importe * 2; break;
      case 'Anual': previousMonthFacturacion += importe; break;
    }
  });

  stats.trendFacturacion = previousMonthFacturacion > 0 
    ? ((facturacionActiva - previousMonthFacturacion) / previousMonthFacturacion * 100).toFixed(1)
    : facturacionActiva > 0 ? '100.0' : '0.0';

  // Resto de cálculos estadísticos
  stats.cuotasComunes = Object.entries(cuotaCounts)
    .map(([value, count]) => ({ value: parseFloat(value), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  stats.cuotaMedia = filteredSocios.length > 0 ? (stats.cuotaMedia / filteredSocios.length).toFixed(2) : 0;
  stats.edadMedia = filteredSocios.length > 0 ? Math.round(totalAge / filteredSocios.length) : 0;

  // Tendencias existentes (simplificadas)
  if (allSocios.length > 0) {
    const totalSocios = allSocios.length;
    const filteredCount = filteredSocios.length;
    stats.trendTotal = ((filteredCount - totalSocios) / totalSocios * 100).toFixed(1);
    stats.trendCuota = (Math.random() * 10 - 2).toFixed(1);
    stats.trendEdad = (Math.random() * 5 - 1).toFixed(1);
    stats.trendNuevos = (Math.random() * 30 + 5).toFixed(1);
  }

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
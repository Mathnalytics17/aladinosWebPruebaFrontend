'use client'
import React, { useState, useEffect } from 'react';
import { 
  Box,Grid2 , Paper, Card, Typography, TextField, MenuItem, 
  Chip, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, Button, Tabs, Tab,
  Avatar, Divider, IconButton, TableSortLabel
} from '@mui/material';

import { 
  Search, CheckCircle, Warning, Error, CalendarMonth,
  PeopleAlt, PieChart as PieChartIcon, FilterList, 
  ArrowUpward, ArrowDownward
} from '@mui/icons-material';
import { 
  PieChart, BarChart, LineChart,
  ChartContainer, ChartTooltip, ChartLegend
} from '@mui/x-charts';
import axios from 'axios';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import es from 'date-fns/locale/es';
import ProtectedRole from '@/shared/components/protectedRoute';
const AreaJefe = () => {
  const [socios, setSocios] = useState([]);
  const [comerciales, setComerciales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComerciales, setSelectedComerciales] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(['Pendiente']);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [orderBy, setOrderBy] = useState('fecha_alta');
  const [order, setOrder] = useState('desc');

  // Obtener datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sociosRes, usersRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}users/socio/`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}users/`)
        ]);
        
        setSocios(sociosRes.data);
        // Filtrar usuarios con role=COMERCIAL
        const comercialesData = usersRes.data.filter(user => user.role === 'COMERCIAL');
        setComerciales(comercialesData);
        calculateStats(sociosRes.data, comercialesData);
        console.log(comercialesData)
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calcular estadísticas
  const calculateStats = (data, comercialesData) => {
    const totalSocios = data.length;
    
    // Cálculo de cuotas
    const cuotas = data.filter(s => s.importe).map(s => parseFloat(s.importe));
    const cuotaMedia = cuotas.length > 0 ? 
      (cuotas.reduce((a, b) => a + b, 0) / cuotas.length): 0;
    
    // Calcular moda (cuota más frecuente)
    const frecuenciaCuotas = cuotas.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    const cuotaModa = Object.keys(frecuenciaCuotas).length > 0 ? 
      Object.keys(frecuenciaCuotas).reduce((a, b) => 
        frecuenciaCuotas[a] > frecuenciaCuotas[b] ? a : b) : 'N/A';
    
    // Distribución por género
    const generoDist = data.reduce((acc, socio) => {
      const genero = socio.genero_socio === 'masculino' ? 'Hombre' : 'Mujer';
      acc[genero] = (acc[genero] || 0) + 1;
      return acc;
    }, {});
    
    // Tipo de documento
    const tipoDocumento = data.reduce((acc, socio) => {
      const tipo = socio.tipo_identificacion_socio || 'NIF';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});
    
    // Edades
    const hoy = new Date();
    const edades = data.map(socio => {
      if (!socio.fecha_nacimiento) return 0;
      const nacimiento = new Date(socio.fecha_nacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      console.log(edad)
      return edad;
    }).filter(edad => edad > 0);
    
    const edadMedia = edades.length > 0 ? 
      Math.round(edades.reduce((a, b) => a + b, 0) / edades.length ): 0;
    
    // Distribución por edades
    const gruposEdad = [
      { label: '20-29', value: 0 },
      { label: '30-39', value: 0 },
      { label: '40-49', value: 0 },
      { label: '50-59', value: 0 },
      { label: '60-69', value: 0 },
      { label: '70+', value: 0 }
    ];
    
    edades.forEach(edad => {
      if (edad >= 20 && edad < 30) gruposEdad[0].value++;
      else if (edad < 40) gruposEdad[1].value++;
      else if (edad < 50) gruposEdad[2].value++;
      else if (edad < 60) gruposEdad[3].value++;
      else if (edad < 70) gruposEdad[4].value++;
      else if (edad >= 70) gruposEdad[5].value++;
    });
    
    // Distribución geográfica
    const ciudades = data.reduce((acc, socio) => {
      const ciudad = socio.ciudad_direccion|| 'Desconocida';
      acc[ciudad] = (acc[ciudad] || 0) + 1;
      return acc;
    }, {});
    
    // Socios por comercial
    const sociosPorComercial = comercialesData.reduce((acc, comercial) => {
      acc[comercial.first_name] = data.filter(s => s.fundraiser === comercial.id).length;
      return acc;
    }, {});
    
    // Distribución por estado
    const estados = data.reduce((acc, socio) => {
      const estado = socio.status || 'Pendiente';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    setStats({
      totalSocios,
      cuotaMedia,
      cuotaModa,
      generoDist,
      tipoDocumento,
      edadMedia,
      gruposEdad,
      ciudades,
      sociosPorComercial,
      estados
    });
  };

  // Filtrar socios
  const filteredSocios = socios.filter(socio => {
    const matchesSearch = `${socio.nombre || ''} ${socio.apellidos || ''} ${socio.dni || ''}`
      .toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesComercial = selectedComerciales.length === 0 || 
      selectedComerciales.includes(socio.fundraiser);
    
    const matchesStatus = selectedStatus.length === 0 || 
      selectedStatus.includes(socio.estado || 'Pendiente');
    
    const fechaAlta = socio.fecha_alta ? new Date(socio.fecha_alta) : null;
    const matchesDate = (!fechaInicio || !fechaAlta || fechaAlta >= new Date(fechaInicio)) && 
      (!fechaFin || !fechaAlta || fechaAlta <= new Date(fechaFin));
    
    return matchesSearch && matchesComercial && matchesStatus && matchesDate;
  });

  // Ordenar socios
  const sortedSocios = [...filteredSocios].sort((a, b) => {
    if (orderBy === 'fecha_alta') {
      const dateA = a.fecha_alta ? new Date(a.fecha_alta) : new Date(0);
      const dateB = b.fecha_alta ? new Date(b.fecha_alta) : new Date(0);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      const valueA = a[orderBy] || '';
      const valueB = b[orderBy] || '';
      return order === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    }
  });

  // Manejar cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Manejar ordenación
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  console.log(comerciales)
  return (

    <ProtectedRole requiredRoles={["GESTOR", "JEFE"]}>
      <Box sx={{ p: 3 }}>
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Listado de Socios" icon={<PeopleAlt />} />
        <Tab label="Estadísticas" icon={<PieChartIcon />} />
      </Tabs>

      {activeTab === 0 && (
        <>
          {/* Filtros */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Grid2 container spacing={3}>
              <Grid2 xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Buscar socio"
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1 }} />
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Grid2>
              
              <Grid2 xs={12} md={12}>
                <TextField
                  select
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      minWidth: '400px',  // Ancho personalizado
                      py: 1              // Padding vertical aumentado
                    }
                  }}
                  label="Comerciales"
                  SelectProps={{
                    multiple: true,
                    value: selectedComerciales,
                    onChange: (e) => setSelectedComerciales(e.target.value)
                  }}
                >
                  {comerciales.map((comercial) => (
                    <MenuItem key={comercial.id} value={comercial.id}>
                      {comercial.first_name} {comercial.last_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid2>
              
              <Grid2 xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Estado"
                  SelectProps={{
                    multiple: true,
                    value: selectedStatus,
                    onChange: (e) => setSelectedStatus(e.target.value)
                  }}
                >
                  {['Verificado', 'Baja', 'Ilocalizable', 'Incidencia', 'Pendiente'].map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid2>
              
              <Grid2 xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <DatePicker
                    label="Fecha inicio"
                    value={fechaInicio}
                    onChange={(newValue) => setFechaInicio(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid2>
              
              <Grid2 xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <DatePicker
                    label="Fecha fin"
                    value={fechaFin}
                    onChange={(newValue) => setFechaFin(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid2>
            </Grid2>
          </Card>

          {/* Tabla de socios */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'nombre'}
                        direction={orderBy === 'nombre' ? order : 'asc'}
                        onClick={() => handleRequestSort('nombre')}
                      >
                        Nombre
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>DNI</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'fundraiser'}
                        direction={orderBy === 'fundraiser' ? order : 'asc'}
                        onClick={() => handleRequestSort('fundraiser')}
                      >
                        Comercial
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'fecha_alta'}
                        direction={orderBy === 'fecha_alta' ? order : 'desc'}
                        onClick={() => handleRequestSort('fecha_alta')}
                      >
                        Fecha Alta
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Cuota</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Cargando...
                      </TableCell>
                    </TableRow>
                  ) : sortedSocios.length > 0 ? (
                    sortedSocios
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((socio) => {

                        console.log(socio.fundraiser)
                        const comercial = comerciales.find(c => c.id === socio.fundraiser);
                        console.log(comercial)
                        const nombreComercial = comercial ? `${comercial.first_name
                        } ${comercial.last_name
                        }` : 'Sin comercial';
                        
                        return (
                          <TableRow key={socio.id}>
                            <TableCell>{socio.nombre_socio || ''} {socio.apellido_socio || ''}</TableCell>
                            <TableCell>{socio.numero_identificacion_socio|| 'N/A'}</TableCell>
                            <TableCell>{nombreComercial}</TableCell>
                            <TableCell>
                              <Chip 
                                label={socio.status || 'Pendiente'}
                                color={
                                  socio.status === 'Verificado' ? 'success' :
                                  socio.status === 'Baja' ? 'error' :
                                  socio.status === 'Ilocalizable' ? 'warning' : 'default'
                                }
                                icon={
                                  socio.status === 'Verificado' ? <CheckCircle fontSize="small" /> :
                                  socio.status === 'Baja' ? <Error fontSize="small" /> :
                                  socio.status === 'Ilocalizable' ? <Warning fontSize="small" /> : null
                                }
                              />
                            </TableCell>
                            <TableCell>
                              {socio.fecha_alta ? new Date(socio.fecha_alta).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>{socio.importe ? `€${socio.importe}` : 'N/A'}</TableCell>
                          </TableRow>
                        );
                      })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
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
              count={sortedSocios.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </>
      )}

      {activeTab === 1 && stats && (
        <Grid2 container spacing={3}>
          {/* Estadísticas generales */}
          <Grid2 xs={12} md={4}>
            <Card sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Resumen General</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Total socios:</Typography>
                <Typography fontWeight="bold">{stats.totalSocios}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Cuota media:</Typography>
                <Typography fontWeight="bold">€{stats.cuotaMedia.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Cuota más común:</Typography>
                <Typography fontWeight="bold">€{stats.cuotaModa}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Edad media:</Typography>
                <Typography fontWeight="bold">{stats.edadMedia.toFixed(1)} años</Typography>
              </Box>
            </Card>
          </Grid2>

          {/* Gráfico de género */}
          <Grid2 xs={12} md={4}>
            <Card sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Distribución por Género</Typography>
              <PieChart
                series={[{
                  data: Object.entries(stats.generoDist).map(([label, value]) => ({
                    label,
                    value,
                    color: label === 'Hombre' ? '#36A2EB' : '#FF6384'
                  })),
                  innerRadius: 30,
                  outerRadius: 100,
                  paddingAngle: 5,
                  cornerRadius: 5,
                }]}
                width={400}
                height={200}
              />
              <Box sx={{ mt: 2 }}>
                {Object.entries(stats.generoDist).map(([genero, count]) => (
                  <Box key={genero} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>{genero}:</Typography>
                    <Typography fontWeight="bold">{count} ({Math.round((count / stats.totalSocios) * 100)}%)</Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid2>

          {/* Gráfico de documentos */}
          <Grid2 xs={12} md={4}>
            <Card sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Tipo de Documento</Typography>
              <PieChart
                series={[{
                  data: Object.entries(stats.tipoDocumento).map(([label, value]) => ({
                    label,
                    value,
                    color: label === 'NIF' ? '#FFCE56' : label === 'NIE' ? '#4BC0C0' : '#9966FF'
                  })),
                  innerRadius: 30,
                  outerRadius: 100,
                  paddingAngle: 5,
                  cornerRadius: 5,
                }]}
                width={400}
                height={200}
              />
              <Box sx={{ mt: 2 }}>
                {Object.entries(stats.tipoDocumento).map(([tipo, count]) => (
                  <Box key={tipo} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>{tipo}:</Typography>
                    <Typography fontWeight="bold">{count} ({Math.round((count / stats.totalSocios) * 100)}%)</Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid2>

          {/* Gráfico de edades */}
          <Grid2 xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Distribución por Edades</Typography>
              <BarChart
                xAxis={[{
                  scaleType: 'band',
                  data: stats.gruposEdad.map(g => g.label)
                }]}
                series={[{
                  data: stats.gruposEdad.map(g => g.value),
                  color: '#36A2EB'
                }]}
                width={500}
                height={300}
              />
            </Card>
          </Grid2>

          {/* Gráfico de estados */}
          <Grid2 xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Estados de Socios</Typography>
              <PieChart
                series={[{
                  data: Object.entries(stats.estados).map(([label, value]) => ({
                    label,
                    value,
                    color: label === 'Verificado' ? '#4CAF50' : 
                           label === 'Baja' ? '#F44336' : 
                           label === 'Ilocalizable' ? '#FFC107' : '#9E9E9E'
                  })),
                  innerRadius: 30,
                  outerRadius: 100,
                  paddingAngle: 5,
                  cornerRadius: 5,
                }]}
                width={500}
                height={300}
              />
            </Card>
          </Grid2>

          {/* Top ciudades */}
          <Grid2 xs={12}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Distribución Geográfica</Typography>
              <Grid2 container spacing={2}>
                {Object.entries(stats.ciudades)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([ciudad, count]) => (
                    <Grid2 xs={12} sm={6} md={4} lg={2} key={ciudad}>
                      <Card sx={{ p: 1 }}>
                        <Typography variant="subtitle2">{ciudad}</Typography>
                        <Typography variant="h5">{count}</Typography>
                        <Typography variant="caption">
                          {Math.round((count / stats.totalSocios) * 100)}% del total
                        </Typography>
                      </Card>
                    </Grid2>
                  ))}
              </Grid2>
            </Card>
          </Grid2>

          {/* Socios por comercial */}
          <Grid2 xs={12}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Socios por Comercial</Typography>
              <BarChart
                xAxis={[{
                  scaleType: 'band',
                  data: comerciales.map(c => `${c.first_name} ${c.last_name}`)
                }]}
                series={[{
                  data: comerciales.map(c => 
                    socios.filter(s => s.fundraiser === c.id).length
                  ),
                  color: '#3F51B5'
                }]}
                width={1000}
                height={400}
              />
              <TableContainer sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Comercial</TableCell>
                      <TableCell align="right">Total Socios</TableCell>
                      <TableCell align="right">Verificados</TableCell>
                      <TableCell align="right">Bajas</TableCell>
                      <TableCell align="right">Ilocalizables</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comerciales.map((comercial) => {
                      const sociosComercial = socios.filter(s => s.fundraiser === comercial.id);
                      return (
                        <TableRow key={comercial.id}>
                          <TableCell>{comercial.first_name} {comercial.last_name}</TableCell>
                          <TableCell align="right">{sociosComercial.length}</TableCell>
                          <TableCell align="right">
                            {sociosComercial.filter(s => s.status === 'Verificado').length}
                          </TableCell>
                          <TableCell align="right">
                            {sociosComercial.filter(s => s.status === 'Baja').length}
                          </TableCell>
                          <TableCell align="right">
                            {sociosComercial.filter(s => s.status === 'Ilocalizable').length}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid2>
        </Grid2>
      )}
    </Box>
    </ProtectedRole>
    
  );
};

export default AreaJefe;
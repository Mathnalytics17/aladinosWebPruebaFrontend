'use client'
import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useAuth } from '../../../context/authContext'
import {
  Card, Grid2, Typography, Avatar, Chip, CircularProgress,
  TextField, MenuItem, Box, Button, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Switch, Tabs, Tab, IconButton
} from '@mui/material'
import {
  PeopleAlt, CalendarToday, PieChart, CheckCircle, AttachMoney,
  Search, FilterList, DateRange, Male, Female, TrendingUp,
  Error, Warning, Phone, Close, Check,
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers'
import { styled } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import ProtectedRole from '@/shared/components/protectedRoute';
import { useRouter } from 'next/router';
import LogoutIcon from '@mui/icons-material/Logout';

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
  const [socios, setSocios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    estado: 'todos',
    busqueda: '',
    fecha_inicio: null,
    fecha_fin: null
  })
  const [selectedSocio, setSelectedSocio] = useState(null)
  const [fichaTab, setFichaTab] = useState(0)
  const router = useRouter()

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

  // Filtrado de socios
  const sociosFiltrados = useMemo(() => {
    return socios.filter(socio => {
      // Filtro de búsqueda
      const coincideBusqueda = `${socio.nombre_socio || ''} ${socio.apellido_socio || ''}`.toLowerCase()
        .includes(filters.busqueda.toLowerCase())
      
      // Filtro de estado
      const coincideEstado = filters.estado === 'todos' || 
        (filters.estado === 'activo' && socio.activo) || 
        (filters.estado === 'inactivo' && !socio.activo)
      
      // Filtro de fechas (usando fecha_creacion o fecha_alta como fallback)
      const fechaSocio = new Date(socio.fecha_creacion)
      const fechaInicio = filters.fecha_inicio ? new Date(filters.fecha_inicio) : null
      const fechaFin = filters.fecha_fin ? new Date(filters.fecha_fin) : null
      
      let coincideFecha = true
      if (fechaInicio) {
        fechaInicio.setHours(0, 0, 0, 0)
        coincideFecha = coincideFecha && fechaSocio >= fechaInicio
      }
      if (fechaFin) {
        fechaFin.setHours(23, 59, 59, 999)
        coincideFecha = coincideFecha && fechaSocio <= fechaFin
      }
      
      return coincideBusqueda && coincideEstado && coincideFecha
    })
  }, [socios, filters])

  // Cálculo de estadísticas
  const stats = useMemo(() => {
    if (sociosFiltrados.length === 0) return null

    const totalSocios = sociosFiltrados.length
    const sociosActivos = sociosFiltrados.filter(s => s.activo).length
    const nuevos30Dias = sociosFiltrados.filter(s => {
      const fechaCreacion = new Date(s.fecha_creacion )
      const hace30Dias = new Date()
      hace30Dias.setDate(hace30Dias.getDate() - 30)
      return fechaCreacion >= hace30Dias
    }).length

    const generoDist = {
      masculino: sociosFiltrados.filter(s => s.genero_socio?.toLowerCase() === 'masculino').length,
      femenino: sociosFiltrados.filter(s => s.genero_socio?.toLowerCase() === 'femenino').length
    }

    const hoy = new Date()
    const edades = sociosFiltrados.map(s => {
      if (!s.fecha_nacimiento) return 0
      const nacimiento = new Date(s.fecha_nacimiento)
      let edad = hoy.getFullYear() - nacimiento.getFullYear()
      const mes = hoy.getMonth() - nacimiento.getMonth()
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--
      }
      return edad
    })
    
    const edadPromedio = edades.reduce((a, b) => a + b, 0) / edades.length || 0
    const distribucionEdad = {
      menores_30: edades.filter(e => e < 30).length,
      entre_30_50: edades.filter(e => e >= 30 && e <= 50).length,
      mayores_50: edades.filter(e => e > 50).length
    }

    const recaudacionMensual = sociosFiltrados
      .filter(s => s.activo)
      .reduce((sum, s) => sum + parseFloat(s.importe || 0), 0)
    
    const promedioCuota = sociosActivos > 0 
      ? recaudacionMensual / sociosActivos 
      : 0

    return {
      total_socios: totalSocios,
      nuevos_ultimos_30_dias: nuevos30Dias,
      socios_activos: sociosActivos,
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
  }, [sociosFiltrados])

  // Manejo de cambios en los filtros
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  return (
    <ProtectedRole requiredRoles={["COMERCIAL"]}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ p: 3, backgroundColor: '#f9fafc', minHeight: '100vh' }}>
          {/* Encabezado */}
          <Box mb={4}>
            <Typography variant="h5" fontWeight={600} mb={1} sx={{ color: 'black' }}>
              Panel Comercial
            </Typography>
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

          {/* Filtros */}
          <Box display="flex" gap={2} mb={4} flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Buscar socio..."
              InputProps={{ startAdornment: <Search fontSize="small" /> }}
              sx={{ minWidth: 250 }}
              value={filters.busqueda}
              onChange={(e) => handleFilterChange('busqueda', e.target.value)}
            />
            
            <TextField
              select
              size="small"
              value={filters.estado}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
              sx={{ minWidth: 150 }}
              InputProps={{ startAdornment: <FilterList fontSize="small" /> }}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="activo">Activos</MenuItem>
              <MenuItem value="inactivo">Inactivos</MenuItem>
            </TextField>

            <DatePicker
              label="Fecha inicio"
              value={filters.fecha_inicio}
              onChange={(date) => handleFilterChange('fecha_inicio', date)}
              slotProps={{ textField: { size: 'small' } }}
            />
            
            <DatePicker
              label="Fecha fin"
              value={filters.fecha_fin}
              onChange={(date) => handleFilterChange('fecha_fin', date)}
              slotProps={{ textField: { size: 'small' } }}
            />
            
            <Button 
              variant="outlined" 
              onClick={() => setFilters({
                estado: 'todos',
                busqueda: '',
                fecha_inicio: null,
                fecha_fin: null
              })}
            >
              Limpiar filtros
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Estadísticas */}
          {stats && !loading && (
            <Grid2 container spacing={3} mb={4}>
              <Grid2 item xs={12} md={3}>
                <StatCard 
                  icon={<PeopleAlt />}
                  title="Total socios"
                  value={stats.total_socios}
                  subtext={`${stats.nuevos_ultimos_30_dias} nuevos en 30 días`}
                />
              </Grid2>
              
              <Grid2 item xs={12} md={3}>
                <StatCard 
                  icon={<CheckCircle />}
                  title="Socios activos"
                  value={stats.socios_activos}
                  subtext={`${Math.round((stats.socios_activos/stats.total_socios)*100)}% del total`}
                />
              </Grid2>
               {/* <Grid2 item xs={12} md={3}>
                <StatCard 
                  icon={<AttachMoney />}
                  title="Recaudación mensual"
                  value={`€${stats.recaudacion.mensual.toFixed(2)}`}
                  subtext={`€${stats.recaudacion.promedio_cuota.toFixed(2)} cuota promedio`}
                />
              </Grid2> */}
              
              {/*   <Grid2 item xs={12} md={3}>
                <StatCard 
                  icon={<TrendingUp />}
                  title="Comisiones"
                  value={`€${stats.comisiones.total}`}
                  subtext={`€${stats.comisiones.por_cobrar} por cobrar`}
                />
              </Grid2> */}
            
              
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
              {/* <Grid2 item xs={12} md={4}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    Recaudación anual proyectada
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    €{stats.recaudacion.anual.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" display="block" mt={1}>
                    {stats.socios_activos} socios activos
                  </Typography>
                  <Typography variant="caption" display="block">
                    {stats.total_socios - stats.socios_activos} socios inactivos
                  </Typography>
                </Card>
              </Grid2> */}
              

            </Grid2>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography variant="subtitle1" fontWeight={600} mb={2} sx={{ color: 'black' }}>
                Listado de socios ({sociosFiltrados.length})
                {filters.fecha_inicio && (
                  <Typography component="span" variant="body2" color="text.secondary" ml={1}>
                    {new Date(filters.fecha_inicio).toLocaleDateString()} - 
                    {filters.fecha_fin ? new Date(filters.fecha_fin).toLocaleDateString() : ''}
                  </Typography>
                )}
              </Typography>
              
              {sociosFiltrados.length > 0 ? (
                <TableContainer component={Paper} sx={{ mb: 4 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Estado</TableCell>
                        {/*<TableCell>Cuota</TableCell> */}
                        
                        <TableCell>Edad</TableCell>
                        <TableCell>Fecha Alta</TableCell>
                         {/* <TableCell>Importe</TableCell> */}
                        
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sociosFiltrados.map((socio) => (
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
                              label={socio.activo ? 'Activo' : 'Inactivo'} 
                              color={socio.activo ? 'success' : 'default'}
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
                              new Date(socio.fecha_creacion).toLocaleDateString() : 
                              new Date(socio.fecha_alta).toLocaleDateString()}
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
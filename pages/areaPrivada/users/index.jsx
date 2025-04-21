import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Paper, Typography, Grid, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Menu, MenuItem, Snackbar, Alert, Chip
} from '@mui/material';
import {
  Edit, Delete, Add, MoreVert, 
  CheckCircle, Cancel, Lock, LockOpen,
  ArrowBack, ExitToApp
} from '@mui/icons-material';
import Avatar from '@mui/material/Avatar';
import ProtectedRole from '@/shared/components/protectedRoute';
import { useRouter } from 'next/router';

const AdminUsers = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // Configuración de axios con interceptor
  const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
  });

  // Interceptor para añadir token
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, error => {
    return Promise.reject(error);
  });

  // Interceptor para manejar errores 401
  api.interceptors.response.use(
    response => response,
    async error => {
      if (error.response?.status === 401) {
        handleLogout();
      }
      return Promise.reject(error);
    }
  );

  // Obtener usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('users/');
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar usuarios');
      setLoading(false);
    }
  };

  // Obtener información del usuario actual
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/areaPrivada/users/login');
        return;
      }
      
      const response = await api.get('users/me/');
      setCurrentUserRole(response.data.role);
    } catch (err) {
      console.error('Error al obtener usuario actual:', err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  // Roles disponibles
  const roles = ['JEFE', 'ADMIN', 'COMERCIAL', 'SOPORTE', 'SOCIO'];

  // Manejar acciones
  const handleCreate = () => {
    // Redirigir a la página de signUp en lugar de abrir modal
    router.push('/areaPrivada/users/signUp');
  };

  const handleEdit = (user) => {
    setCurrentUser({ ...user });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`users/${id}/`);
      setSnackbar({ open: true, message: 'Usuario eliminado', severity: 'success' });
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al eliminar', severity: 'error' });
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.put(`users/${user.id}/`, {
        ...user,
        is_active: !user.is_active
      });
      setSnackbar({ 
        open: true, 
        message: `Usuario ${user.is_active ? 'desactivado' : 'activado'}`, 
        severity: 'success' 
      });
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al actualizar', severity: 'error' });
    }
  };

  const handleSubmit = async () => {
    try {
      // Solo para edición (la creación se maneja en signUp)
      await api.put(`users/${currentUser.id}/`, currentUser);
      setSnackbar({ open: true, message: 'Usuario actualizado', severity: 'success' });
      setOpenDialog(false);
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al guardar', severity: 'error' });
    }
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/areaPrivada/users/login');
  };

  // Filtrado y búsqueda
  const filteredUsers = users.filter(user => 
    `${user.first_name} ${user.last_name} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Estilos para roles
  const roleStyles = {
    JEFE: { color: '#d32f2f', bgcolor: '#ffebee' },
    ADMIN: { color: '#7b1fa2', bgcolor: '#f3e5f5' },
    COMERCIAL: { color: '#0288d1', bgcolor: '#e3f2fd' },
    SOPORTE: { color: '#00796b', bgcolor: '#e0f2f1' },
    SOCIO: { color: '#f57c00', bgcolor: '#fff3e0' }
  };

  if (loading) return <Typography>Cargando usuarios...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <ProtectedRole requiredRoles={["JEFE"]}>
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom>
                Administración de Usuarios
              </Typography>
            </Grid>
            <Grid item xs={8} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={4} md={2} sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreate}
                sx={{ flex: 1 }}
              >
                Nuevo
              </Button>
              {currentUserRole === 'JEFE' ? (
                <Button
                  variant="outlined"
                  onClick={() => router.push('/areaPrivada')}
                  startIcon={<ArrowBack />}
                  sx={{ minWidth: 'auto' }}
                />
              ) : (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleLogout}
                  startIcon={<ExitToApp />}
                  sx={{ minWidth: 'auto' }}
                />
              )}
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Verificado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: getAvatarColor(user) }}>
                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                      </Avatar>
                      {user.first_name} {user.last_name}
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      sx={{
                        ...roleStyles[user.role],
                        fontWeight: 'bold',
                        minWidth: 90
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={user.is_active ? <LockOpen /> : <Lock />}
                      label={user.is_active ? 'Activo' : 'Inactivo'}
                      color={user.is_active ? 'success' : 'error'}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.email_verified ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="error" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => setAnchorEl({ el: e.currentTarget, user })}>
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Menú contextual */}
        <Menu
          anchorEl={anchorEl?.el}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => {
            handleEdit(anchorEl.user);
            setAnchorEl(null);
          }}>
            <Edit sx={{ mr: 1 }} /> Editar
          </MenuItem>
          <MenuItem onClick={() => {
            handleToggleStatus(anchorEl.user);
            setAnchorEl(null);
          }}>
            {anchorEl?.user.is_active ? (
              <><Lock sx={{ mr: 1 }} /> Desactivar</>
            ) : (
              <><LockOpen sx={{ mr: 1 }} /> Activar</>
            )}
          </MenuItem>
          <MenuItem onClick={() => {
            handleDelete(anchorEl.user.id);
            setAnchorEl(null);
          }}>
            <Delete sx={{ mr: 1 }} /> Eliminar
          </MenuItem>
        </Menu>

        {/* Diálogo solo para edición (la creación se maneja en signUp) */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>
            Editar Usuario
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={currentUser?.first_name || ''}
                  onChange={(e) => setCurrentUser({...currentUser, first_name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  value={currentUser?.last_name || ''}
                  onChange={(e) => setCurrentUser({...currentUser, last_name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={currentUser?.email || ''}
                  onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Rol"
                  value={currentUser?.role || 'COMERCIAL'}
                  onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Estado"
                  value={currentUser?.is_active ? 'true' : 'false'}
                  onChange={(e) => setCurrentUser({...currentUser, is_active: e.target.value === 'true'})}
                >
                  <MenuItem value="true">Activo</MenuItem>
                  <MenuItem value="false">Inactivo</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleSubmit}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notificaciones */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({...snackbar, open: false})}
        >
          <Alert severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ProtectedRole>
  );
};

// Función para color de avatar basado en email
function getAvatarColor(user) {
  const colors = [
    '#ff5722', '#2196f3', '#4caf50', 
    '#ffc107', '#9c27b0', '#607d8b'
  ];
  const hash = user.email.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return colors[Math.abs(hash) % colors.length];
}

export default AdminUsers;
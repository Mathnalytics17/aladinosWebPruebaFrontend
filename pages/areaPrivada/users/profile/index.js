import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  TextField, 
  Button, 
  Divider,
  Paper,
  CircularProgress
} from '@mui/material';
import { Lock, Email, Person, Phone, Home, Edit, Save, Cancel } from '@mui/icons-material';
import { useAuth } from '../../../../context/authContext';

const ProfilePage = () => {
  const { user, isLoading, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '+1234567890',
    address: 'Calle Falsa 123'
  });

  // Foto de perfil aleatoria (puedes reemplazar con cualquier URL)
  const randomPhoto = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80';

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: '+1234567890', // Valor por defecto o de tu backend
        address: 'Calle Falsa 123' // Valor por defecto o de tu backend
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Aquí iría la llamada a tu API para actualizar el perfil
      // await api.patch('/users/me/', formData);
      
      // Actualizar el contexto con los nuevos datos
      const updatedUser = {
        ...user,
        first_name: formData.first_name,
        last_name: formData.last_name
      };
      updateUser(updatedUser);
      
      setEditMode(false);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    }
  };

  if (isLoading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const fullName = `${user.first_name} ${user.last_name}`;

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Mi Perfil</Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            src={randomPhoto}
            sx={{ 
              width: 80, 
              height: 80, 
              mr: 3,
              fontSize: '2rem',
              bgcolor: 'primary.main'
            }}
          />
          <Box>
            <Typography variant="h6">{fullName}</Typography>
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
            <Typography variant="caption" color={user.is_active ? 'success.main' : 'error.main'}>
              {user.is_active ? 'Cuenta activa' : 'Cuenta inactiva'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Person sx={{ mr: 2, color: 'action.active', width: 24 }} />
            {editMode ? (
              <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                <TextField
                  name="first_name"
                  label="Nombre"
                  value={formData.first_name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  name="last_name"
                  label="Apellido"
                  value={formData.last_name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Box>
            ) : (
              <Typography>{fullName}</Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Email sx={{ mr: 2, color: 'action.active', width: 24 }} />
            <Typography>{user.email}</Typography>
            {user.email_verified && (
              <Typography 
                variant="caption" 
                color="success.main"
                sx={{ ml: 1 }}
              >
                (Verificado)
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Phone sx={{ mr: 2, color: 'action.active', width: 24 }} />
            {editMode ? (
              <TextField
                name="phone"
                label="Teléfono"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
              />
            ) : (
              <Typography>{formData.phone}</Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Home sx={{ mr: 2, color: 'action.active', width: 24 }} />
            {editMode ? (
              <TextField
                name="address"
                label="Dirección"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
              />
            ) : (
              <Typography>{formData.address}</Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {editMode ? (
              <>
                <Button 
                  variant="outlined" 
                  onClick={() => setEditMode(false)}
                  startIcon={<Cancel />}
                  color="error"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="contained"
                  startIcon={<Save />}
                  color="primary"
                >
                  Guardar cambios
                </Button>
              </>
            ) : (
              <Button 
                variant="contained" 
                onClick={() => setEditMode(true)}
                startIcon={<Edit />}
                color="primary"
              >
                Editar perfil
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          <Lock sx={{ verticalAlign: 'middle', mr: 1 }} />
          Seguridad
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => window.location.href = '/areaPrivada/users/forgotPassword'}
          sx={{ mr: 2 }}
          color="primary"
        >
          Cambiar contraseña
        </Button>
        <Button 
          variant="outlined" 
          color="secondary"
          onClick={() => window.location.href = '/auth/verify-email'}
          disabled={user.email_verified}
        >
          {user.email_verified ? 'Email verificado' : 'Verificar email'}
        </Button>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
// pages/reset-password.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  Link
} from '@mui/material';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    new_password: '',
    new_password2: '',
  });
  const [fieldErrors, setFieldErrors] = useState({
    new_password: '',
    new_password2: '',
  });

  // Configuración directa de Axios
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validaciones en tiempo real
    if (name === 'new_password') {
      setFieldErrors(prev => ({ 
        ...prev, 
        new_password: value.length < 8 ? 'Mínimo 8 caracteres' : '' 
      }));
    }
    if (name === 'new_password2') {
      setFieldErrors(prev => ({ 
        ...prev, 
        new_password2: value !== formData.new_password ? 'Las contraseñas no coinciden' : '' 
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (formData.new_password.length < 8) {
      errors.new_password = 'La contraseña debe tener al menos 8 caracteres';
      isValid = false;
    }

    if (formData.new_password !== formData.new_password2) {
      errors.new_password2 = 'Las contraseñas no coinciden';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');
    
    try {
      await api.post('/users/password-reset/confirm/', {
        token,
        new_password: formData.new_password,
        new_password2: formData.new_password2,
      });
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al restablecer la contraseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            Token no válido o faltante
          </Alert>
          <Link href="/forgot-password" variant="body2" sx={{ mt: 2 }}>
            Solicitar nuevo enlace de recuperación
          </Link>
        </Box>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Contraseña Restablecida
          </Typography>
          <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
            Tu contraseña ha sido restablecida correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.
          </Alert>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => router.push('/areaPrivada/users/login')}
          >
            Ir a Iniciar Sesión
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Restablecer Contraseña
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 1, width: '100%' }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            name="new_password"
            label="Nueva Contraseña"
            type="password"
            id="new_password"
            value={formData.new_password}
            onChange={handleChange}
            error={!!fieldErrors.new_password}
            helperText={fieldErrors.new_password}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="new_password2"
            label="Confirmar Nueva Contraseña"
            type="password"
            id="new_password2"
            value={formData.new_password2}
            onChange={handleChange}
            error={!!fieldErrors.new_password2}
            helperText={fieldErrors.new_password2}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
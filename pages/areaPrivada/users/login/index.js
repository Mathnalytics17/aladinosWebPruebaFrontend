// pages/login.js
import { useState,useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../../context/authContext.js';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Container,
  Alert,
} from '@mui/material';

export default function LoginPage() {
  const router = useRouter();
  const { login,user,isLoading } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validación en tiempo real
    if (name === 'email') {
      setFieldErrors(prev => ({ 
        ...prev, 
        email: !value.includes('@') ? 'Email debe contener @' : '' 
      }));
    }
    if (name === 'password') {
      setFieldErrors(prev => ({ 
        ...prev, 
        password: value.length < 6 ? 'Mínimo 6 caracteres' : '' 
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.email.includes('@')) {
      errors.email = 'Email inválido';
      isValid = false;
    }

    if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };
  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!isLoading && user) {
      // Usar la lógica de redirección por roles que ya tienes
      const userRole = user.role;
      const redirectPaths = {
        'JEFE': '/areaPrivada',
        'GESTOR': '/areaPrivada/areaAdministrador',
        'COMERCIAL': '/areaPrivada/areaComercial',
        'FINANZAS': '/areaPrivada/finanzas',
        'SOPORTE': '/areaPrivada/soporte'
      };
      
      router.push(redirectPaths[userRole] || '/areaPrivada');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      console.log('siuh')
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
    
    setIsSubmitting(false);
  };
console.log(error)


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
          Iniciar Sesión
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
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Link href="/areaPrivada/users/forgotPassword" variant="body2">
              ¿Olvidaste tu contraseña?
            </Link>
            <Link href="/areaPrivada/users/signUp" variant="body2">
              ¿No tienes una cuenta? Regístrate
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
// pages/confirm-email.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
} from '@mui/material';

export default function ConfirmEmailPage() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  // Configuración directa de Axios
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  });

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Token no proporcionado');
      return;
    }

    const confirmEmail = async () => {
      try {
        setStatus('loading');
        await api.post('users/verify-email/', { token });
        setStatus('success');
      } catch (error) {
        setStatus('error');
        setErrorMessage(
          error.response?.data?.detail || 
          'Error al verificar el email. El token puede ser inválido o haber expirado.'
        );
      }
    };

    confirmEmail();
  }, [token]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Verificando tu correo electrónico...
            </Typography>
          </>
        );

      case 'success':
        return (
          <>
            <Typography component="h1" variant="h5">
              ¡Email Verificado!
            </Typography>
            <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
              Tu dirección de correo electrónico ha sido confirmada exitosamente.
            </Alert>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              onClick={() => router.push('/areaPrivada/users/login')}
            >
              Ir a Iniciar Sesión
            </Button>
          </>
        );

      case 'error':
        return (
          <>
            <Typography component="h1" variant="h5">
              Error en la verificación
            </Typography>
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {errorMessage}
            </Alert>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => router.push('/areaPrivada/users/login')}
              >
                Ir a Iniciar Sesión
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push('/areaPrivada/users/signUp')}
              >
                Registrarse Nuevamente
              </Button>
            </Box>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {renderContent()}
      </Box>
    </Container>
  );
}
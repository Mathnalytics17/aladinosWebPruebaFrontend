import { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import AuthLayout from '../../../../shared/components/authLayout';
import Link from 'next/link';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}users/password-reset/`, 
        { email, }
      );
      setMessage(response.data.message || 'Hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico');
    } catch (err) {
      console.log(err)
      setError(err.response?.data?.error || err.response?.data?.detail || 'Ocurrió un error al procesar tu solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Recuperar contraseña" 
      subtitle="Ingresa tu email para recibir instrucciones"
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!error}
          helperText={error}
        />
        {message && (
          <Typography color="success.main" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading || !email}
        >
          {loading ? 'Enviando...' : 'Enviar enlace'}
        </Button>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Link href="/areaPrivada/users/login" passHref>
          <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
            ← Volver a iniciar sesión
          </Typography>
        </Link>
      </Box>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
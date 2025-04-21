// pages/auth/forgot-password.js
import { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import AuthLayout from '../../../../shared/components/authLayout';
import Link from 'next/link';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Lógica para enviar email de recuperación
      setMessage('Hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico');
    } catch (err) {
      setMessage(err.message);
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
        />
        {message && (
          <Typography color={message.includes('enviado') ? 'success.main' : 'error'} sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
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
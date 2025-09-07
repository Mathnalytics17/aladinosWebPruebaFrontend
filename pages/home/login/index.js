// pages/login.js
import { useState,useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/authContext.js';
import { Box, Button, Container, TextField, Typography, Paper, Alert } from "@mui/material";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',  // Cambiado de 'usuario' a 'email'
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


  // REEMPLAZAR la línea problemática con:
  useEffect(() => {
    // Verificar solo en el cliente
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        router.push('/home');
      }
    }
  }, [router]);


const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setIsSubmitting(true);
  setError('');
  
  // Pasar 'home' como tercer parámetro para indicar el origen
  const result = await login(formData.email, formData.password, 'home');
  
  if (result.success) {
    console.log('Login exitoso desde home');
  } else {
    setError(result.error || 'Error al iniciar sesión');
  }
  
  setIsSubmitting(false);
};

  return (
    <Container maxWidth="md" sx={{ height: "70vh", display: "flex", alignItems: "center" }}>
      <Box 
        sx={{ 
          display: "flex", 
          width: "100%", 
          maxWidth: "60rem", 
          bgcolor: "#f8f6e6", 
          p: 3,
          height: "50rem",
          margin: "0 auto"
        }}
      >
        {/* Panel credenciales */}
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{
            flex: 1,
            border: "2px solid #e69500",
            bgcolor: "#f2f2e9",
            p: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}>
            Ingrese sus credenciales
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            variant="outlined"
            placeholder="Email"
            name="email"  // Cambiado de 'usuario' a 'email'
            type="email"  // Agregado type email
            value={formData.email}
            onChange={handleChange}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
            fullWidth
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#fff",
              },
            }}
          />

          <TextField
            variant="outlined"
            placeholder="Contraseña"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
            fullWidth
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#fff",
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
            sx={{
              bgcolor: "#003366",
              "&:hover": { bgcolor: "#002244" },
            }}
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </Paper>

        {/* Panel derecho con logo y mensaje */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            p: 3,
          }}
        >
          <img
            src="/images-removebg-preview.png"
            alt="Logo Aladina"
            style={{ maxWidth: "250px", marginBottom: "20px" }}
          />
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#003366" }}>
            Bienvenidos
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#003366" }}>
            Comerciales
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
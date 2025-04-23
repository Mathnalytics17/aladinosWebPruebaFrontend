import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../../context/authContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Container,
  Alert, 
  MenuItem
} from '@mui/material';
import ProtectedRole from '@/shared/components/protectedRoute';
export default function SignupPage() {
  const roles = [
    { value: 'GESTOR', label: 'Gestor' },
    { value: 'COMERCIAL', label: 'Comercial' },
    { value: 'JEFE', label: 'Jefe' },
  ];

  const RoleSelect = ({ value, onChange, error, helperText }) => {
    return (
      <TextField
        select
        fullWidth
        margin="normal"
        label="Rol"
        name="role"
        value={value}
        onChange={onChange}
        error={error}
        helperText={helperText}
      >
        {roles.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  const router = useRouter();
  const { register: registerUser, validateEmail } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'USER',
    fundRaiserCode: ''
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: '',
    fundRaiserCode: ''
  });

  // Limpiar fundRaiserCode cuando el rol no es COMERCIAL
  useEffect(() => {
    if (formData.role !== 'COMERCIAL') {
      setFormData(prev => ({ ...prev, fundRaiserCode: '' }));
      setFieldErrors(prev => ({ ...prev, fundRaiserCode: '' }));
    }
  }, [formData.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when modifying
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Real-time validations
    if (name === 'email') {
      setFieldErrors(prev => ({ 
        ...prev, 
        email: !validateEmail(value) ? 'Email inválido' : '' 
      }));
    }
    if (name === 'password') {
      setFieldErrors(prev => ({ 
        ...prev, 
        password: value.length < 8 ? 'Mínimo 8 caracteres' : '' 
      }));
    }
    if (name === 'password2') {
      setFieldErrors(prev => ({ 
        ...prev, 
        password2: value !== formData.password ? 'Las contraseñas no coinciden' : '' 
      }));
    }
    if (name === 'first_name' && !value.trim()) {
      setFieldErrors(prev => ({ ...prev, first_name: 'Nombre requerido' }));
    }
    if (name === 'last_name' && !value.trim()) {
      setFieldErrors(prev => ({ ...prev, last_name: 'Apellido requerido' }));
    }
    if (name === 'phone' && value.length < 6) {
      setFieldErrors(prev => ({ ...prev, phone: 'Teléfono inválido' }));
    }
    if (name === 'fundRaiserCode' && formData.role === 'COMERCIAL' && !value.trim()) {
      setFieldErrors(prev => ({ ...prev, fundRaiserCode: 'Código requerido para comerciales' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!validateEmail(formData.email)) {
      errors.email = 'Email inválido';
      isValid = false;
    }

    if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
      isValid = false;
    }

    if (formData.password !== formData.password2) {
      errors.password2 = 'Las contraseñas no coinciden';
      isValid = false;
    }

    if (!formData.first_name.trim()) {
      errors.first_name = 'Nombre requerido';
      isValid = false;
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Apellido requerido';
      isValid = false;
    }

    if (formData.phone.length < 6) {
      errors.phone = 'Teléfono inválido';
      isValid = false;
    }

    if (!formData.role) {
      errors.role = 'Selecciona un rol';
      isValid = false;
    }

    // Validación específica para el código de fundraiser
    if (formData.role === 'COMERCIAL' && !formData.fundRaiserCode.trim()) {
      errors.fundRaiserCode = 'Código de fundraiser requerido para comerciales';
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
    console.log('Submitting form data:', formData);
    
    try {
      const result = await registerUser(formData);
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Error al registrar');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Registro Exitoso
          </Typography>
          <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
           Hemos enviado un correo electrónico con un enlace para verificar la cuenta.
          </Alert>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => router.push('/areaPrivada')}
          >
            Ir a Area Privada
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => router.push('/areaPrivada/users')}
          >
            Ir a usuarios
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <ProtectedRole requiredRoles={["JEFE"]}>
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
         Crear Usuario
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
          noValidate
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password2"
            label="Confirmar Contraseña"
            type="password"
            id="password2"
            value={formData.password2}
            onChange={handleChange}
            error={!!fieldErrors.password2}
            helperText={fieldErrors.password2}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="first_name"
            label="Nombre"
            name="first_name"
            autoComplete="given-name"
            value={formData.first_name}
            onChange={handleChange}
            error={!!fieldErrors.first_name}
            helperText={fieldErrors.first_name}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="last_name"
            label="Apellido"
            name="last_name"
            autoComplete="family-name"
            value={formData.last_name}
            onChange={handleChange}
            error={!!fieldErrors.last_name}
            helperText={fieldErrors.last_name}
          />
          
          <RoleSelect
            value={formData.role}
            onChange={handleChange}
            error={!!fieldErrors.role}
            helperText={fieldErrors.role}
          />

          {/* Campo condicional para el código de fundraiser */}
          {formData.role === 'COMERCIAL' && (
            <TextField
              margin="normal"
              required
              fullWidth
              id="fundRaiserCode"
              label="Código de Fundraiser"
              name="fundRaiserCode"
              value={formData.fundRaiserCode}
              onChange={handleChange}
              error={!!fieldErrors.fundRaiserCode}
              helperText={fieldErrors.fundRaiserCode}
              inputProps={{
                pattern: "[0-9]*", // Solo números
                inputMode: "numeric"
              }}
            />
          )}
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="phone"
            label="Teléfono"
            name="phone"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleChange}
            error={!!fieldErrors.phone}
            helperText={fieldErrors.phone}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando Usuario...' : 'Crear Usuario'}
          </Button>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link href="areaPrivada/users/login" variant="body2">
              ¿Ya tienes una cuenta? Inicia sesión
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
     </ProtectedRole>
  );
}
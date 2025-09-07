import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid2,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ExitToApp,
  AccountCircle,
  VolunteerActivism,
  Dashboard,
  AdminPanelSettings,
  AttachMoney,
  SupportAgent
} from '@mui/icons-material';
import ProtectedRole from '@/shared/components/protectedRoute';
import { useAuth } from '@/context/authContext'; // Importar el contexto de autenticación
import { useTrazability } from '../../shared/hooks/useTrazability';
const Home = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Obtener datos del usuario desde el contexto de autenticación
  const { user, logout, isLoading } = useAuth();
  
  // Extraer información del usuario
  const userRoles = user?.role ? [user.role] : [];
  const userName = user ? `${user.first_name} ${user.last_name}`.trim() : 'Usuario';
  const userEmail = user?.email || '';
 useTrazability('NombreDeLaPagina');
  const handleClick = () => {
    router.push('/formularioGoogleSheets');
  };

  const handleRoleNavigation = () => {
    if (userRoles.includes('COMERCIAL')) {
      router.push('/areaPrivada/areaComercial');
    } else if (userRoles.includes('GESTOR')) {
      router.push('/areaPrivada/areaAdministrador');
    } else if (userRoles.includes('FINANZAS')) {
      router.push('/areaPrivada/finanzas');
    } else if (userRoles.includes('SOPORTE')) {
      router.push('/areaPrivada/soporte');
    } else if (userRoles.includes('JEFE')) {
      router.push('/areaPrivada');
    } else {
      router.push('/areaPrivada');
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/home/login');
  };
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getRoleIcon = () => {
    if (userRoles.includes('COMERCIAL')) return <AttachMoney />;
    if (userRoles.includes('GESTOR')) return <AdminPanelSettings />;
    if (userRoles.includes('FINANZAS')) return <AttachMoney />;
    if (userRoles.includes('SOPORTE')) return <SupportAgent />;
    if (userRoles.includes('JEFE')) return <AdminPanelSettings />;
    return <AccountCircle />;
  };

  const getRoleLabel = () => {
    if (userRoles.includes('COMERCIAL')) return 'Comercial';
    if (userRoles.includes('GESTOR')) return 'Gestor';
    if (userRoles.includes('FINANZAS')) return 'Finanzas';
    if (userRoles.includes('SOPORTE')) return 'Soporte';
    if (userRoles.includes('JEFE')) return 'Jefe';
    return 'Usuario';
  };

  // Mostrar loading mientras se cargan los datos del usuario
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  return (
    <ProtectedRole requiredRoles={["COMERCIAL", "GESTOR", "JEFE"]}>
      <AppBar position="static" sx={{ bgcolor: '#003366', mb: 4 }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <Avatar 
              src="LOGO-ALADINA-2020.png" 
              variant="square"
              sx={{ 
                width: 'auto', 
                height: 40, 
                borderRadius: 0,
                bgcolor: 'transparent'
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={getRoleIcon()}
              label={getRoleLabel()}
              size="small"
              sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
            />
            
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>
                <Box>
                  <Typography variant="subtitle1">{userName}</Typography>
                  <Typography variant="body2" color="textSecondary">{userEmail}</Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={handleRoleNavigation}>
                <Dashboard sx={{ mr: 1 }} /> Mi Área
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} /> Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="100%">

        
        <Paper
          elevation={3}
          sx={{
            p: 4,
            background: 'linear-gradient(135deg, #f8f6e6 0%, #e6f3ff 100%)',
            borderRadius: 3,
            textAlign: 'center',
            mb: 4
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '50vh',
              py: 4
            }}
          >
       
            <Typography variant="h4" gutterBottom>
          Bienvenido al formulario de donaciones para la fundación Aladina
        </Typography>
       

            <Grid2 container spacing={2} justifyContent="center">
  <Grid2 item xs={12} sm={8} md={6}>
    <Button
      fullWidth
      variant="contained"
      size="large"
      onClick={handleClick}
      startIcon={<VolunteerActivism />}
      sx={{
        py: 2,
        bgcolor: '#e69500',
        '&:hover': { bgcolor: '#d08600' },
        fontSize: '1.1rem',
        mb: 2 // Margen inferior para separar los botones
      }}
    >
      Solicitar Donación
    </Button>
    
<Button
  fullWidth
  variant="outlined"
  size="small" // Cambiado de "large" a "small"
  onClick={handleRoleNavigation}
  startIcon={<Dashboard />}
  sx={{
    py: 1, // Reducido de 2 a 1
    borderColor: '#003366',
    color: '#003366',
    '&:hover': { 
      borderColor: '#002244',
      bgcolor: 'rgba(0, 51, 102, 0.04)'
    },
    fontSize: '0.9rem', // Reducido de 1.1rem a 0.9rem
    minHeight: '60px', // Altura mínima reducida
    width:'20rem',
    mt:'5rem'
  }}
>
  Acceder a Mi Área
</Button>
  </Grid2>
</Grid2>
          </Box>
        </Paper>
      </Container>
    </ProtectedRole>
  );
};

export default Home;
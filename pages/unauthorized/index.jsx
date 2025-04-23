// components/UnauthorizedView.js
import { useRouter } from 'next/router';
import { useAuth } from '../../context/authContext';
import Head from 'next/head';
import { 
  Box, 
  Button, 
  Typography, 
  Avatar, 
  Card, 
  CardHeader,
  CardContent,
  Divider,
  Link
} from '@mui/material';
import { Lock, Home, ExitToApp, Warning } from '@mui/icons-material';

const UnauthorizedView = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      
      router.push('/areaPrivada/users/login');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Fallback manual
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      router.push('/areaPrivada/users/login');
    }
  };

    // Función para determinar la ruta según el rol
    const getRolePath = () => {
      switch(user?.role) {
        case 'COMERCIAL':
          return '/areaPrivada/areaComercial';
        case 'JEFE':
          return '/areaPrivada';
        case 'GESTOR':
          return '/areaPrivada/areaAdministrador';
        default:
          return '/';
      }
    };

  return (
    <>
      <Head>
        <title>Acceso Denegado | Aladina</title>
      </Head>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: (theme) => theme.palette.grey[100],
          p: 3
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 450,
            boxShadow: (theme) => theme.shadows[6],
            overflow: 'visible'
          }}
        >
          <CardHeader
            title={
              <Typography variant="h5" component="div" textAlign="center" fontWeight="bold">
                ACCESO DENEGADO
              </Typography>
            }
            avatar={
              <Avatar
                sx={{
                  bgcolor: 'error.light',
                  color: 'error.main',
                  width: 56,
                  height: 56,
                  mt: -4,
                  ml: 'auto',
                  mr: 'auto'
                }}
              >
                <Lock fontSize="large" />
              </Avatar>
            }
            sx={{ pt: 5 }}
          />

          <CardContent>
            <Box textAlign="center" mb={3}>
              <Typography variant="body1" paragraph>
                Hola <strong>{user?.first_name || 'Usuario'}</strong>,
              </Typography>
              <Typography variant="body1" paragraph>
                Tu rol actual: 
                <Box 
                  component="span" 
                  sx={{
                    display: 'inline-block',
                    bgcolor: 'grey.200',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    ml: 1,
                    fontFamily: 'monospace'
                  }}
                >
                  {user?.role || 'N/A'}
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No tienes permisos para acceder a esta sección.
              </Typography>
            </Box>

            <Box 
              display="flex" 
              flexDirection={{ xs: 'column', sm: 'row' }} 
              gap={2}
              mb={4}
            >
               {/* Botón para ir al área según rol */}
               {user?.role && ['COMERCIAL', 'JEFE', 'GESTOR'].includes(user.role) && (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Home />}
                  onClick={() => router.push(getRolePath())}
                  sx={{ py: 1.5 }}
                >
                  Ir a mi área
                </Button>
              )}
              
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<ExitToApp />}
                onClick={handleLogout}
                sx={{ py: 1.5 }}
              >
                Cerrar sesión
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box textAlign="center" mt={3}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                ¿Necesitas acceso a esta sección?
              </Typography>
              <Link
                href="mailto:soporte@aladina.org"
                underline="hover"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: 'primary.main'
                }}
              >
                <Warning fontSize="small" sx={{ mr: 0.5 }} />
                Contacta al administrador
              </Link>
            </Box>
          </CardContent>

          <Box 
            sx={{ 
              p: 2,
              bgcolor: (theme) => theme.palette.grey[50],
              textAlign: 'center'
            }}
          >
            <img 
              src="/LOGO-ALADINA-2020.png" 
              alt="Aladina" 
              style={{ height: 50, marginBottom: 10,marginLeft:180 }}
              p
            />
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} Fundación Aladina. Todos los derechos reservados.
            </Typography>
          </Box>
        </Card>
      </Box>
    </>
  );
};

export default UnauthorizedView;
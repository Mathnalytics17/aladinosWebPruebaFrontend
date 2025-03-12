import React from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import { useRouter } from 'next/router'; // Usamos next/router para la navegación

const Home = () => {
  const router = useRouter(); // Hook de next/router

  const handleClick = () => {
    router.push('/formularioGoogleSheets'); // Redirige a la ruta
  };

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh', // Centra el contenido verticalmente
        }}
      >
        <Typography variant="h4" gutterBottom>
          Bienvenido al formulario de donaciones para la fundación Aladina
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleClick} // Redirige al hacer clic
        >
          Solicitar Donación
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
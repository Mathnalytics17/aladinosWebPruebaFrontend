// components/auth/AuthLayout.js
import { Box, Container, Typography } from '@mui/material';
import Link from 'next/link';

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        mt: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 4,
        boxShadow: 3,
        borderRadius: 2
      }}>
        <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {subtitle}
          </Typography>
        )}
        {children}
        <Box sx={{ mt: 3 }}>
          <Link href="/" passHref>
            <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
              ← Volver al inicio
            </Typography>
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default AuthLayout;
import React from "react";
import { Container, Typography, Link, Button } from "@mui/material";
import NextLink from "next/link";

const PoliticasDePrivacidad = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Título */}
      <Typography variant="h4" align="center" gutterBottom>
        Políticas de Privacidad
      </Typography>

      {/* Contenido de Ejemplo */}
      <Typography variant="body1" paragraph>
        En la Fundación Aladina, nos comprometemos a proteger y respetar tu privacidad. Esta política explica cómo recopilamos, usamos y protegemos tu información personal.
      </Typography>

      <Typography variant="body1" paragraph>
        1. **Información que Recopilamos**: Recopilamos información personal como tu nombre, dirección de correo electrónico y número de teléfono cuando te registras como socio o realizas una donación.
      </Typography>

      <Typography variant="body1" paragraph>
        2. **Uso de la Información**: Utilizamos tu información para procesar donaciones, mantenerte informado sobre nuestras actividades y mejorar nuestros servicios.
      </Typography>

      <Typography variant="body1" paragraph>
        3. **Protección de Datos**: Implementamos medidas de seguridad para proteger tu información personal contra el acceso no autorizado o la divulgación.
      </Typography>

      <Typography variant="body1" paragraph>
        4. **Tus Derechos**: Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento. Para ejercer estos derechos, contáctanos a través de nuestro formulario de contacto.
      </Typography>

      {/* Botón para Volver */}
      <NextLink href="/" passHref>
        <Button variant="contained" color="primary" sx={{ mt: 3 }}>
          Volver al Inicio
        </Button>
      </NextLink>
    </Container>
  );
};

export default PoliticasDePrivacidad;
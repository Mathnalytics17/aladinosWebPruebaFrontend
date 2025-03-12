import React from "react";
import { Container, Typography, Link, Button, Box } from "@mui/material";
import NextLink from "next/link";

const PoliticasDePrivacidad = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Título principal */}
      <Box textAlign="center" sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
          POLÍTICA DE PRIVACIDAD
        </Typography>
      </Box>

      {/* Sección 1: Información General */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: "bold", color: "text.secondary" }}>
          1. INFORMACIÓN GENERAL
        </Typography>
        <Typography variant="body1" paragraph>
          En cumplimiento con lo dispuesto en el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016, relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales y a la libre circulación de estos datos (en adelante, "RGPD"), así como en la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (en adelante, "LOPDGDD"), BOOST IMPACT GROUP FUNDRAISING, SOCIEDAD LIMITADA (en adelante, "la Empresa"), con CIF/NIF B75452847 y domicilio en CALLE HERMOSILLA 48, 28001 MADRID (MADRID), informa a los usuarios de su sitio web https://www.altasfundacionaladina.org sobre su política de privacidad y tratamiento de datos personales.
        </Typography>
      </Box>

      {/* Sección 2: Finalidad del Tratamiento de los Datos */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: "bold", color: "text.secondary" }}>
          2. FINALIDAD DEL TRATAMIENTO DE LOS DATOS
        </Typography>
        <Typography variant="body1" paragraph>
          Los datos personales recabados a través de este sitio web tienen como finalidad:
        </Typography>
        <Box component="ul" sx={{ pl: 4, mb: 2 }}>
          <Typography variant="body1" component="li" paragraph>
            La gestión de socios y colaboradores de la Fundación Aladina.
          </Typography>
          <Typography variant="body1" component="li" paragraph>
            La administración de donaciones y aportaciones económicas.
          </Typography>
          <Typography variant="body1" component="li" paragraph>
            La comunicación con los interesados para informarles sobre iniciativas, eventos y actividades de la Fundación.
          </Typography>
          <Typography variant="body1" component="li" paragraph>
            Garantizar la seguridad y cumplimiento de las normativas legales aplicables.
          </Typography>
        </Box>
      </Box>

      {/* Sección 9: Contacto */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: "bold", color: "text.secondary" }}>
          9. CONTACTO
        </Typography>
        <Typography variant="body1" paragraph>
          Para cualquier consulta sobre esta política de privacidad, el usuario puede dirigirse a:
        </Typography>
        <Box sx={{ bgcolor: "background.paper", p: 3, borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="body1" paragraph>
            <strong>BOOST IMPACT GROUP FUNDRAISING, SOCIEDAD LIMITADA</strong>
          </Typography>
          <Typography variant="body1" paragraph>
            Dirección: CALLE HERMOSILLA 48, 28001 MADRID (MADRID)
          </Typography>
          <Typography variant="body1" paragraph>
            Sitio web:{" "}
            <Link href="https://www.altasfundacionaladina.org/" target="_blank" rel="noopener noreferrer" color="primary">
              https://www.altasfundacionaladina.org/
            </Link>
          </Typography>
        </Box>
      </Box>

      {/* Botón para Atrás */}
      <Box textAlign="center" sx={{ mt: 4 }}>
        <NextLink href="/formularioGoogleSheets" passHref>
          <Button variant="contained" color="primary" size="large">
            Atrás
          </Button>
        </NextLink>
      </Box>
    </Container>
  );
};

export default PoliticasDePrivacidad;
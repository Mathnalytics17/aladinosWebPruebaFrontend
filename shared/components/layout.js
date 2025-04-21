import { useRouter } from "next/router";
import Grid from '@mui/material/Grid';
import Box from "@mui/material/Box";
import Header from "../components/header"
import Footer from "../components/footer"
import { useAuth } from '../../context/authContext';


const Layout = ({ children }) => {
  const router = useRouter();
  const { user } = useAuth();
  // Define las rutas que deben tener un ancho completo
  const isFullWidthPage = [
    "/operations/manage",
    "/operations/manage2",
    "/customers",
    "/customers/account",
    "/brokers",
    "/administration/deposit-emitter",
    "/administration/deposit-investor",
    "/administration/refund",
    "/riskProfile",
    "/administration/new-receipt",
  ].includes(router.pathname);

  return (
    <Grid container sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" ,backgroundColor: "#F5F5DC"}}>
      {/* Header */}
      <Header />

      {/* Contenido Principal */}
      <Grid
        container
        sx={{
          flex: 1,
          marginTop: "60px", // Ajusta según la altura del Header
          display: "flex",
          justifyContent: "center", // Centra horizontalmente
          alignItems: "center", // Centra verticalmente
        }}
      >
        <Grid
          xs
          sx={{
            width: "100%", // Ocupa todo el ancho disponible
            maxWidth: isFullWidthPage ? "100%" : "1200px", // Limita el ancho máximo
            padding: "20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box flex={1}>{children}</Box>
        </Grid>
      </Grid>

      {/* Footer */}
      <Footer />
    </Grid>
  );
};

export default Layout;

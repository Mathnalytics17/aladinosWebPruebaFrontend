import { useRouter } from "next/router";
import {Grid2} from "@mui/material";
import Box from "@mui/material/Box";
import Header from "../components/header"
import Footer from "../components/footer"


const Layout = ({ children }) => {
  const router = useRouter();

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
    <Grid2 container sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" ,backgroundColor: "#F5F5DC"}}>
      {/* Header */}
      <Header />

      {/* Contenido Principal */}
      <Grid2
        container
        sx={{
          flex: 1,
          marginTop: "60px", // Ajusta según la altura del Header
          display: "flex",
          justifyContent: "center", // Centra horizontalmente
          alignItems: "center", // Centra verticalmente
        }}
      >
        <Grid2
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
        </Grid2>
      </Grid2>

      {/* Footer */}
      <Footer />
    </Grid2>
  );
};

export default Layout;

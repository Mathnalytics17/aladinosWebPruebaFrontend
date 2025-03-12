import React from "react";
import Link from "next/link"; // Usar Link de Next.js para la navegación
import Image from "next/image"; // Usar Image de Next.js para optimizar imágenes
import styles from "../../styles/header.module.css"; // Estilos CSS Modules

const Header = () => {
  return (
    <header className={styles.header}>
      {/* Logo centrado */}
      <div className={styles.logoContainer}>
        <Link href="/">
          <Image
            src="/LOGO-ALADINA-2020.png" // Ruta del logo
            alt="Logo Aladina"
            width={150} // Ancho del logo
            height={50} // Alto del logo
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
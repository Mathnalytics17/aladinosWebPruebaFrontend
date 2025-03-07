import React, { useState } from "react";
import Link from "next/link"; // Usar Link de Next.js para la navegación
import Image from "next/image"; // Usar Image de Next.js para optimizar imágenes
import styles from "../../styles/header.module.css"; // Estilos CSS Modules

const Header = () => {
  const [menuActive, setMenuActive] = useState(false);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  return (
    <header className={styles.header}>
      {/* Logo */}
      <div className={styles.logo}>
        <Link href="/">
          <Image
            src="/LOGO-ALADINA-2020.png" // Ruta del logo
            alt="Logo Aladina"
            width={150} // Ancho del logo
            height={50} // Alto del logo
          />
        </Link>
      </div>

      {/* Menú de Navegación */}
      <nav className={`${styles.nav} ${menuActive ? styles.active : ''}`}>
        <Link href="/home">
          Inicio
        </Link>
        <Link href="#servicios">
          Servicios
        </Link>
        <Link href="#nosotros">
          Nosotros
        </Link>
        <Link href="#contacto">
          Contacto
        </Link>
      </nav>

      {/* Ícono del Menú (para móviles) */}
      <div className={styles.menuIcon} onClick={toggleMenu}>
        ☰
      </div>
    </header>
  );
};

export default Header;
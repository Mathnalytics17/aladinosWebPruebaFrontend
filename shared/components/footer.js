import React from 'react';
import styles from '../../styles/footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Columna del logo */}
        <div className={styles.column}>
          <div className={styles.logoContainer}>
            <img src="/LOGO-ALADINA-2020.png" alt="Logo de MiEmpresa" className={styles.logo} />
          </div>
        </div>

        {/* Columna de Contacto */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Contacto</h4>
          <p className={styles.description}>
            <a href="https://aladina.org" target="_blank" rel="noopener noreferrer">
              aladina.org
            </a>
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className={styles.copyright}>
        &copy; 2025 Fundación Aladina. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
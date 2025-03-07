import React from 'react';
import styles from '../../styles/footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.column}>
          <div className={styles.logo}>MiEmpresa</div>
          <p className={styles.description}>
            Somos una empresa comprometida con la innovación y el servicio al cliente.
          </p>
        </div>

        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Enlaces Rápidos</h4>
          <ul className={styles.columnList}>
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#servicios">Servicios</a></li>
            <li><a href="#nosotros">Nosotros</a></li>
            <li><a href="#contacto">Contacto</a></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Contacto</h4>
          <p className={styles.description}>
            Email: info@miempresa.com<br />
            Teléfono: +123 456 7890<br />
            Dirección: Calle Falsa 123, Ciudad
          </p>
        </div>

        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Síguenos</h4>
          <div className={styles.socialIcons}>
            <a href="#">📘</a>
            <a href="#">🐦</a>
            <a href="#">📸</a>
            <a href="#">🔗</a>
          </div>
        </div>
      </div>

      <div className={styles.copyright}>
        &copy; 2023 MiEmpresa. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
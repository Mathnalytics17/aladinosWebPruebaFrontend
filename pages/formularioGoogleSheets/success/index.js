// pages/exito.js
import Link from 'next/link';

export default function Exito() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>¡Formulario enviado con éxito!</h1>
      <p style={styles.message}>Gracias por completar el formulario. Tu información ha sido recibida correctamente.</p>
      <Link href="/home" style={styles.link}>
        Volver al inicio
      </Link>
    </div>
  );
}
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    textAlign: 'center',
    backgroundColor: '#f8f9fa', // Fondo más suave y moderno
    padding: '40px 20px',
    fontFamily: '"Roboto", sans-serif', // Fuente moderna
  },
  title: {
    fontSize: '2.5rem',
    color: '#2c3e50', // Color oscuro y elegante
    marginBottom: '20px',
    fontWeight: '700', // Texto en negrita
  },
  message: {
    fontSize: '1.25rem',
    color: '#34495e', // Color gris oscuro
    marginBottom: '40px',
    lineHeight: '1.6', // Mejor legibilidad
  },
  link: {
    color: '#fff',
    backgroundColor: '#3498db', // Azul moderno
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.3s ease', // Efecto hover suave
    ':hover': {
      backgroundColor: '#2980b9', // Azul más oscuro al pasar el mouse
    },
  },
};
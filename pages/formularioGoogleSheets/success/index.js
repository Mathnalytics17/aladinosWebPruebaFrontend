import Link from 'next/link';
import Image from 'next/image';

export default function Exito() {
  return (
    <div style={styles.container}>
      {/* Imagen */}
      <div style={styles.imageContainer}>
        <Image
          src="/2304-fundacion-aladiina.jpg"
          alt="Fundación Aladina"
          width={600} // Ancho de la imagen
          height={400} // Alto de la imagen
          style={styles.image}
        />
      </div>

      {/* Mensaje de éxito */}
      <h1 style={styles.title}>¡Formulario enviado con éxito!</h1>
      <p style={styles.message}>
        Gracias por completar el formulario. Tu información ha sido recibida correctamente.
      </p>

      {/* Botón para volver al inicio */}
      <Link href="/home" style={styles.link}>
        Volver al inicio
      </Link>
    </div>
  );
}

// Estilos
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    textAlign: 'center',
    backgroundColor: '#f5f5dc', // Fondo beige claro
    padding: '40px 20px',
    fontFamily: '"Roboto", sans-serif', // Fuente moderna
  },
  imageContainer: {
    marginBottom: '40px', // Espacio debajo de la imagen
  },
  image: {
    borderRadius: '12px', // Bordes redondeados para la imagen
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Sombra suave
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
  },
};
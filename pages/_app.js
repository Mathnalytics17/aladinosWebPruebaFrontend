import Layout from '../shared/components/layout'
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import { AuthProvider } from '../context/authContext';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './globals.css'

const pathsWithoutDefaultLayout = [
  "/",
  "/self-management",
  "/users/login",
  "/financialProfile/financialStatement",
  "/financialProfile/indicators",
  "/auth/resetPassword",
  "/auth/forgotPassword",
  "/areaPrivada"
];

// Clase para coordinar y cancelar peticiones
class RequestCoordinator {
  constructor() {
    this.controllers = new Map();
    this.globalController = new AbortController();
  }

  createRequest(source) {
    const requestId = Symbol('request');
    this.controllers.set(requestId, source);
    return requestId;
  }

  cancelRequest(requestId) {
    if (this.controllers.has(requestId)) {
      const source = this.controllers.get(requestId);
      source.cancel('Request canceled');
      this.controllers.delete(requestId);
    }
  }

  cancelAll() {
    this.globalController.abort('All requests canceled');
    this.controllers.forEach(source => {
      source.cancel('Request canceled due to global cancellation');
    });
    this.controllers.clear();
    // Reset global controller for future requests
    this.globalController = new AbortController();
  }
}

// Configuración global de axios
const requestCoordinator = new RequestCoordinator();

axios.interceptors.request.use(config => {
  const source = axios.CancelToken.source();
  const requestId = requestCoordinator.createRequest(source);
  config.cancelToken = source.token;
  config.requestId = requestId;
  return config;
}, error => {
  return Promise.reject(error);
});

axios.interceptors.response.use(response => {
  if (response.config.requestId) {
    requestCoordinator.cancelRequest(response.config.requestId);
  }
  return response;
}, error => {
  if (axios.isCancel(error)) {
    console.log('Request canceled:', error.message);
    return Promise.reject(error);
  }
  
  // Si hay un error, cancelamos todas las peticiones pendientes
  requestCoordinator.cancelAll();
  return Promise.reject(error);
});

// Función para manejar peticiones con reintentos
async function resilientRequest(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios({
        url,
        ...options,
        signal: requestCoordinator.globalController.signal
      });
      return response.data;
    } catch (error) {
      if (i === retries - 1 || error.response?.status < 500) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Formatear fecha
  const formatDate2 = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return 'N/A';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ejecutar peticiones críticas de forma coordinada
        const [socioRes, usersRes, formularioRes] = await Promise.all([
          resilientRequest(`${process.env.NEXT_PUBLIC_API_URL}users/socio/`),
          resilientRequest(`${process.env.NEXT_PUBLIC_API_URL}users/`),
          resilientRequest(`${process.env.NEXT_PUBLIC_API_URL}registro/formularioRows/`)
        ]);

        const users = usersRes;
        const formularioData = formularioRes;

        if (socioRes.length === 0) {
          if (!formularioData || formularioData.length === 0) {
            console.log('No hay datos en formularioRows, no se hace nada.');
            return;
          }

          const sociosData = formularioData.map((data) => {
            const fundraiserCode = String(data.fundraiser_code);
            const fundraiserUser = users.find(user => user.fundRaiserCode === fundraiserCode);

            if (!fundraiserUser) {
              console.warn(`No se encontró fundraiser con code: ${fundraiserCode}`);
              return null;
            }

            return {
              nombre_socio: data.nombre,
              apellido_socio: data.apellidos,
              genero_socio: data.genero,
              tipo_identificacion_socio: data.tipo_identificacion,
              numero_identificacion_socio: data.numero_identificacion,
              fecha_nacimiento: data.fecha_nacimiento,
              via_principal: data.via_principal,
              cp_direccion: data.cp_direccion,
              ciudad_direccion: data.ciudad_direccion,
              estado_provincia: data.estado_provincia,
              importe: parseFloat(data.importe),
              periodicidad: data.periodicidad,
              dia_presentacion: data.dia_presentacion || 5,
              medio_pago: data.medio_pago,
              tipo_pago: data.tipo_pago,
              fundraiser: fundraiserUser ? fundraiserUser.id : null,
              primer_canal_captacion: data.primer_canal_captacion,
              canal_entrada: data.canal_entrada,
              fecha_creacion: data.created_at,
              telefono_socio: data.movil,
            };
          }).filter(Boolean);

          if (sociosData.length > 0) {
            await resilientRequest(`${process.env.NEXT_PUBLIC_API_URL}users/socio/`, {
              method: 'POST',
              data: sociosData
            });
            toast.success('Socios creados exitosamente');
          } else {
            toast.warn('No se pudo crear ningún socio: todos los fundraiser fallaron');
          }
        } else {
          console.log('Ya existen socios, no se hace nada');
        }
      } catch (err) {
        console.error('Error en carga inicial:', err);
        if (!axios.isCancel(err)) {
          toast.error('Error al cargar datos iniciales');
        }
      }
    };

    fetchData();

    // Limpieza al desmontar el componente
    return () => {
      requestCoordinator.cancelAll();
    };
  }, []);

  const isErrorPage = pageProps?.statusCode === 404;
  return (
    <>
      {!pathsWithoutDefaultLayout.includes(router.pathname) && !isErrorPage ? (
        <AuthProvider>
          <Layout>
            <ToastContainer position="top-right" autoClose={3000} />
            <Component {...pageProps} />
          </Layout>
        </AuthProvider>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}
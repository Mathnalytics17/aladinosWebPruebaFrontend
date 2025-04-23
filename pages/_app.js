import Layout from '../shared/components/layout'
import "react-toastify/dist/ReactToastify.css";

import Head from "next/head";
import { useRouter } from "next/router";

import { ToastContainer } from "react-toastify";
import { AuthProvider } from '../context/authContext';
import axios from 'axios';

import React, { useState, useEffect } from 'react';



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

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
// Carga inicial de datos
useEffect(() => {
  const fetchData = async () => {
    try {
      const socioRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}users/socio/`);
      const usersRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}users/`);
      const formularioRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}registro/formularioRows/`);

      const users = usersRes.data;
      const formularioData = formularioRes.data;

      if (socioRes.data.length === 0) {
        if (!formularioData || formularioData.length === 0) {
          console.log('No hay datos en formularioRows, no se hace nada.');
          return;
        }

        const sociosData = formularioData.map((data) => {
          // Obtener fundraiser_code desde los datos del formulario
          const fundraiserCode = String(data.fundraiser_code);     ;
          console.log('data:', data);
          console.log('Fundraiser code:', fundraiserCode);

          // Buscar el usuario correspondiente en la lista de usuarios
          console.log(users)
          const fundraiserUser = users.find(user => user.fundRaiserCode === fundraiserCode);

          if (!fundraiserUser) {
            console.warn(`No se encontró fundraiser con code: ${fundraiserCode}`);
            return null; // se puede filtrar después los null
          }
          console.log('Fundraiser encontrado:', fundraiserUser);
          console.log('Fundraiser encontrado con id:', fundraiserUser.id);
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
            fecha_creacion: new Date().toISOString(),
            telefono: data.movil,
          };
        }).filter(Boolean); // Quitar los null si no se encontró el fundraiser

        if (sociosData.length > 0) {
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}users/socio/`, sociosData);
          console.log('Socios creados exitosamente en un solo POST');
        } else {
          console.warn('No se pudo crear ningún socio: todos los fundraiser fallaron');
        }

      } else {
        console.log('Ya existen socios, no se hace nada');
      }

    } catch (err) {
      console.error('Error:', err);
    }
  };

  fetchData();
}, []);





  const isErrorPage = pageProps?.statusCode === 404;
  return (
    <>
       {!pathsWithoutDefaultLayout.includes(router.pathname) &&
            !isErrorPage ? (
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
  )
}
// hooks/useTrazability.js
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/authContext';
import axios from 'axios';
import { 
  browserName, 
  browserVersion, 
  osName, 
  osVersion, 
  mobileModel,
  isMobile,
  isTablet,
  isDesktop,
  isBrowser,
  getUA
} from 'react-device-detect';

export const useTrazability = (viewName, urlPath) => {
  const { user, isLoading } = useAuth(); // Añadir isLoading
  const [entryId, setEntryId] = useState(null);
  const entryTimeRef = useRef(null);
  const hasExecutedRef = useRef(false);

  // Función para obtener información del dispositivo
  const getDeviceInfo = () => {
    let deviceType = 'desktop';
    if (isMobile) deviceType = 'mobile';
    if (isTablet) deviceType = 'tablet';

    return {
      device_type: deviceType,
      browser_name: browserName,
      browser_version: browserVersion,
      os_name: osName,
      os_version: osVersion,
      device_model: mobileModel || 'Unknown',
      is_bot: !isBrowser,
      user_agent: getUA,
    };
  };

  useEffect(() => {
    // NO ejecutar si está loading o si no hay usuario
    if (hasExecutedRef.current || !viewName || isLoading || !user) return;

    hasExecutedRef.current = true;

    const registerEntry = async () => {
      try {
        entryTimeRef.current = new Date();
        const deviceInfo = getDeviceInfo();

        // Preparar datos - AHORA user siempre existe
        const requestData = {
          view_name: viewName,
          url_path: urlPath || window.location.pathname,
          user: user.id, // user siempre existe aquí
          ...deviceInfo
        };

        console.log('Enviando datos de trazabilidad:', requestData);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}llamadas/trazability/register_entry/`,
          requestData,
          {
            withCredentials: true
          }
        );

        if (response.data.success) {
          setEntryId(response.data.entry_id);
        }
      } catch (error) {
        console.error('Error registrando entrada:', error);
        if (error.response?.data?.details) {
          console.error('Detalles del error:', error.response.data.details);
        }
      }
    };

    registerEntry();

    return () => {
      const registerExit = async () => {
        if (!entryId) return;

        try {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}llamadas/trazability/register_exit/`,
            { entry_id: entryId },
            { withCredentials: true }
          );
        } catch (error) {
          console.error('Error registrando salida:', error);
        }
      };

      registerExit();
    };
  }, [user, viewName, urlPath, entryId, isLoading]); // Añadir isLoading a dependencias

  return { entryId };
};
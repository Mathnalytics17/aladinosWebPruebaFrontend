import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify"; // Importar toast
import {
  Container,
  Typography,
  TextField,
  Radio,
  Box,
  RadioGroup,
  FormControlLabel,
  Button,
  Grid2,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Estilos de react-datepicker
import es from "date-fns/locale/es"; // Locale en español
import SignatureCanvas from "react-signature-canvas"; // Componente de firma
import Link from "next/link"; // Importa Link desde next/link
export default function FormularioGoogleSheets() {
  const { register, handleSubmit, control, formState: { errors }, setValue, watch,getValues } = useForm({
    defaultValues: {
      no_iban: "",
    
    },
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false); // Estado para borrador
  const [loadingGuardar, setLoadingGuardar] = useState(false); // Estado para el botón de guardar borrador
  const [fundraisers, setFundraisers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const signatureRefSocio = useRef(null); // Referencia para la firma del socio
  const signatureRefCaptador = useRef(null); // Referencia para la firma del captador
  const numeroIdentificacionRef = useRef(null);
  const abortControllerRef = useRef(new AbortController());
  const router = useRouter(); // Obtén el objeto router

  


  const apiUrl =process.env.NEXT_PUBLIC_API_URL;

    // Configuración de axios con cancelación
    const api = axios.create({
      baseURL: apiUrl,
      timeout: 15000,
    });
  
    // Interceptor para cancelación
    api.interceptors.request.use((config) => {
      if (abortControllerRef.current) {
        config.signal = abortControllerRef.current.signal;
      }
      return config;
    });
  
    // Limpieza al desmontar el componente
    useEffect(() => {
      return () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, []);
  
    // Función para manejar errores de API
    const handleApiError = (error, defaultMessage = "Error en la operación") => {
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
        return "Operación cancelada";
      }
  
      if (error.response) {
        const { status, data } = error.response;
        
        switch(status) {
          case 400:
            return data.detail || "Datos inválidos";
          case 401:
            return "No autorizado";
          case 403:
            return "No tiene permisos para esta acción";
          case 404:
            return "Recurso no encontrado";
          case 422:
            return "Error de validación: " + JSON.stringify(data.errors || data);
          case 429:
            return "Demasiadas solicitudes. Por favor espere.";
          case 500:
            return "Error interno del servidor";
          default:
            return data.message || `Error (${status})`;
        }
      } else if (error.request) {
        return "Error de conexión. Verifique su internet.";
      } else {
        return error.message || defaultMessage;
      }
    };
  
  console.log(process.env.NEXT_PUBLIC_API_URL)
  // Función para validar el Nº de Identificación
  // Función para validar DNI/NIE con reintentos
  const validarIdentificacion = async (tipo, numero) => {
    cancelPendingRequests();
    
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const response = await api.post('validar-dni/', {
          tipoid: tipo,
          numero_identificacion: numero
        });
        
        if (response.data.valid) {
          return true;
        } else {
          return response.data.message || "Número de identificación inválido";
        }
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  };

  // Función para validar IBAN con reintentos
  const validarIBAN = async (iban) => {
    cancelPendingRequests();
    
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const response = await api.post('validar_iban/', { iban });
        
        if (response.data.valid) {
          return true;
        } else {
          return response.data.message || "IBAN inválido";
        }
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  };

  // Cancelar peticiones pendientes
  const cancelPendingRequests = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
  };

  // Validación del campo de identificación
  const validateIdentificacion = async (value) => {
    const tipo = watch("tipo_identificacion");
    if (!tipo || !value) return "Este campo es obligatorio";
    
    try {
      return await validarIdentificacion(tipo, value);
    } catch (error) {
      return handleApiError(error, "Error al validar identificación");
    }
  };

  // Validación del IBAN
  const validateIBAN = async (value) => {
    if (!value) return "Este campo es obligatorio";
    
    const regex = /^ES[0-9]{22}$/;
    if (!regex.test(value)) {
      return "Formato incorrecto. Debe comenzar con 'ES' seguido de 22 dígitos";
    }
    
    try {
      return await validarIBAN(value);
    } catch (error) {
      return handleApiError(error, "Error al validar IBAN");
    }
  };


  const obtenerFechaFormateada = () => {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0'); // Día con dos dígitos
    const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // Mes con dos dígitos
    const año = hoy.getFullYear(); // Año con cuatro dígitos
    return `${dia}/${mes}/${año}`; // Formato DD/MM/YYYY
  };

// Función para preparar datos de envío
const prepararDatosParaEnvio = (data) => {
  if (typeof data.fecha_nacimiento === "string") {
    const [day, month, year] = data.fecha_nacimiento.split("/");
    data.fecha_nacimiento = new Date(Date.UTC(year, month - 1, day));
    if (isNaN(data.fecha_nacimiento.getTime())) {
      throw new Error("Fecha de nacimiento no válida");
    }
  }

  const fechaFormateadahoy = obtenerFechaFormateada();
  const firmaSocio = signatureRefSocio.current.toDataURL();
  const firmaCaptador = signatureRefCaptador.current.toDataURL();

  data.recibe_correspondencia = data.recibe_correspondencia === "si" ? "SI" : "NO QUIERE";
  data.importe = data.importe == "otra_cantidad" ? data.otra_cantidad : data.importe;
  data.saludo = data.genero === "masculino" ? "D." : "femenino" ? "Dña." : "nada";

  return {
    ...data,
    notas: data.notas,
    firma_socio: firmaSocio,
    firma_captador: firmaCaptador,
    quiere_correspondencia: data.recibe_correspondencia,
    saludo: data.saludo,
    fecha_ingreso_dato: fechaFormateadahoy,
    fecha_nacimiento: data.fecha_nacimiento.toISOString().split("T")[0],
    primer_canal_captacion: "F2F Boost Impact (Madrid)",
    canal_entrada: "F2F",
    recibe_memoria: "SI",
    medio_pago: "Domiciliación",
    tipo_pago: "Cuota",
    concepto_recibo: "GRACIAS POR TU AYUDA - Fundación Aladina",
    tipo_relacion: "Socio",
    importe: data.importe,
    otra_cantidad: data.otra_cantidad || '',
    fecha_primer_pago: '',
    mandato: data.mandato || '',
    persona_id: data.persona_id || '',
    fecha_alta: null,
    descripcion: '',
    mandato: '',
    nombre_autom: `${data.nombre} ${data.apellidos} - Domiciliación`,
    persona_id: '',
    nombre_asterisco: `${data.nombre} ${data.apellidos} - Socio`,
    dia_presentacion: data.dia_presentacion,
    is_borrador: false,
  };
};
  // Función principal para enviar datos
  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLoading(true);
    cancelPendingRequests();

    try {
      const formattedData = prepararDatosParaEnvio(data);
      const response = await api.post('registro/', formattedData);
      
      console.log("Registro exitoso:", response.data);
      setSuccess(true);
      setError(null);
      toast.success("Formulario enviado con éxito");
      localStorage.removeItem("formDraft");
      router.push("/formularioGoogleSheets/success");
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      setSuccess(false);
      
      if (error.response?.data) {
        const errorTranslations = {
          "Ensure this value is less than or equal to 2147483647.": "Asegúrese de que este valor sea menor o igual a 2147483647.",
          "Ensure this field has no more than 10 characters.": "Asegúrese de que el campo CP no tenga más de 10 caracteres.",
        };
        
        Object.keys(error.response.data).forEach((key) => {
          const messages = error.response.data[key].map(
            msg => errorTranslations[msg] || msg
          );
          toast.error(`${key}: ${messages.join(", ")}`);
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };
 
  const API_URL = process.env.NEXT_PUBLIC_API_URL ;


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}users/fundraisers/`// Nota la barra adicional
         
          
        );
        
        setFundraisers(response.data); // Axios usa response.data
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching fundraisers');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  console.log(fundraisers)
  const saveDraft = async (data) => {
    // Verificar que todos los campos obligatorios estén completos (excepto no_iban)
    const fechaFormateadahoy = obtenerFechaFormateada();
    const camposObligatorios = [
      "nombre",
     "fundraiser_code",
     "fundraiser_name",
     
      "movil",
      
    ];
  
    for (const campo of camposObligatorios) {
      if (!data[campo]) {
        toast.error(`El campo ${campo} es obligatorio.`);
        setIsSubmitting(false);
        setLoading(false);
        return;
      }
    }

    try {
      const fechaFormateadahoy = obtenerFechaFormateada();
      const formatDateToDDMMYYYY = (date) => {
        if (!(date instanceof Date) || isNaN(date.getTime())) return "";
        const day = String(date.getUTCDate()).padStart(2, "0");
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
      };

      const parseDateFromString = (dateString) => {
        if (typeof dateString === "string") {
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
            const [day, month, year] = dateString.split("/");
            return new Date(Date.UTC(year, month - 1, day));
          }
          return new Date(dateString);
        }
        return null;
      };

      let fechaNacimiento;
      if (data.fecha_nacimiento instanceof Date) {
        fechaNacimiento = formatDateToDDMMYYYY(data.fecha_nacimiento);
      } else if (typeof data.fecha_nacimiento === "string") {
        const dateObj = parseDateFromString(data.fecha_nacimiento);
        fechaNacimiento = formatDateToDDMMYYYY(dateObj);
      } else {
        fechaNacimiento = "";
      }

      data.importe = data.importe == "otra_cantidad" ? data.otra_cantidad : data.importe;
      data.recibe_correspondencia = data.recibe_correspondencia === "si" ? "SI" : "NO QUIERE";
      data.saludo = data.genero === "masculino" ? "D." : "femenino" ? "Dña." : "nada";

      const draftData = {
        fundraiser_code: data.fundraiser_code,
        fundraiser_name: data.fundraiser_name,
        fecha_ingreso_dato: fechaFormateadahoy,
        saludo: data.saludo,
        nombre: data.nombre,
        apellidos: data.apellidos,
        tipo_identificacion: data.tipo_identificacion,
        numero_identificacion: data.numero_identificacion,
        fecha_nacimiento: fechaNacimiento,
        via_principal: data.via_principal,
        cp_direccion: data.cp_direccion,
        ciudad_direccion: data.ciudad_direccion,
        estado_provincia: data.estado_provincia,
        genero: data.genero,
        recibe_correspondencia: data.recibe_correspondencia,
        correo_electronico: data.correo_electronico,
        movil: data.movil,
        no_iban: data.no_iban,
        importe: data.importe,
        otra_cantidad: data.otra_cantidad || '',
        notas: data.notas,
        telefono_casa: data.telefono_casa || '',
        periodicidad: data.periodicidad,
        primer_canal_captacion: "F2F Boost Impact (Madrid)",
        canal_entrada: "F2F",
        recibe_memoria: "SI",
        medio_pago: "Domiciliación",
        tipo_pago: "Cuota",
        concepto_recibo: "GRACIAS POR TU AYUDA - Fundación Aladina",
        tipo_relacion: "Socio",
        fecha_primer_pago: '',
        mandato: data.mandato || '',
        persona_id: data.persona_id || '',
        fecha_alta: null,
        descripcion: '',
        nombre_autom: `${data.nombre} ${data.apellidos} - Domiciliación`,
        nombre_asterisco: `${data.nombre} ${data.apellidos} - Socio`,
        dia_presentacion: data.dia_presentacion,
        is_borrador: true,
      };
      setLoadingGuardar(true)
      const response = await api.post('registro/guardarBorrador/', draftData);
      
      setIsDraft(true);
      toast.success("Borrador guardado correctamente");
      router.push("/formularioGoogleSheets/successGuardarBorrador");
    } catch (error) {
      const errorMessage = handleApiError(error, "Error al guardar borrador");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setLoadingGuardar(true)
      setIsSubmitting(false);
    }
  };


  const clearSignatureSocio = () => {
    if (signatureRefSocio.current) {
      signatureRefSocio.current.clear(); // Limpiar la firma del socio
    }
  };
  
  const clearSignatureCaptador = () => {
    if (signatureRefCaptador.current) {
      signatureRefCaptador.current.clear(); // Limpiar la firma del captador
    }
  };

  return (
    
    <Container maxWidth="sm" sx={{ mt: 10, mb: 10, width: '100%', overflow: 'hidden' }}>
   {error && <Alert severity="error">{error}</Alert>}
  {success && <Alert severity="success">Registro enviado con éxito</Alert>}
  {isDraft && <Alert severity="info">Tienes un borrador guardado. Puedes continuar completando el formulario.</Alert>}

  <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" >
    {/* Sección: Información del Fundraiser */}
    <Typography variant="h6" gutterBottom>INFORMACIÓN DEL FUNDAISER</Typography>
    <Grid2 container spacing={3} sx={{ mb: 3 }}>
      <Grid2 item xs={6}>
  <FormControl fullWidth error={!!errors.fundraiser_code}>
    <InputLabel>Código Fundraiser</InputLabel>
    <Select {...register("fundraiser_code")}
      sx={{
        minWidth: "250px", // Ajusta este valor según necesites
        '& .MuiSelect-select': {
          padding: '12px 14px', // Ajusta el padding si es necesario
        },
      }}>
  {fundraisers.map((f) => (
    <MenuItem key={f.fundraiser_code} value={f.fundraiser_code}>{f.fundraiser_code}</MenuItem>
  ))}
</Select>
    {errors.fundraiser_code && (
      <FormHelperText>Este campo es obligatorio</FormHelperText>
    )}
  </FormControl>
</Grid2>
<Grid2 item xs={6}>
  <FormControl fullWidth error={!!errors.fundraiser_name}>
    <InputLabel>Nombre Fundraiser</InputLabel>
    
<Select {...register("fundraiser_name")}
  sx={{
    minWidth: "250px", // Ajusta este valor según necesites
    '& .MuiSelect-select': {
      padding: '12px 14px', // Ajusta el padding si es necesario
    },
  }}>
  {fundraisers.map((f) => (
    <MenuItem key={f.fundraiser_code} value={`${f.first_name} ${f.last_name}`}>{f.first_name} {f.last_name} </MenuItem>
  ))}
</Select>
    {errors.fundraiser_name && (
      <FormHelperText>Este campo es obligatorio</FormHelperText>
    )}
  </FormControl>
</Grid2>
    </Grid2>

    {/* Sección: Información Personal */}
    <Typography variant="h6" gutterBottom>INFORMACIÓN PERSONAL</Typography>
    <Grid2 container spacing={3} sx={{ mb: 3 }}>
      <Grid2 item xs={6}>
        <TextField
          fullWidth
          label="Nombre"
          autoComplete="off"
          {...register("nombre", { required: true })}
          error={!!errors.nombre}
          helperText={errors.nombre && "Este campo es obligatorio"}
        />
      </Grid2>
      <Grid2 item xs={6}>
        <TextField
          fullWidth
          label="Apellidos"
          autoComplete="off"
          {...register("apellidos", { required: true })}
          error={!!errors.apellidos}
          helperText={errors.apellidos && "Este campo es obligatorio"}
        />
      </Grid2>
    </Grid2>

    {/* Tipo de Identificación */}
    <Grid2 container spacing={3} sx={{ mb: 3 }}>
      <Grid2 item xs={6}>
        <FormControl sx={{ minWidth: "230px" }}>
          <InputLabel >Tipo de Identificación</InputLabel>
          <Select
            label="Tipo de Identificación"
            autoComplete="off"
            {...register("tipo_identificacion", { required: true })}
            error={!!errors.tipo_identificacion}
          >
            <MenuItem value="NIF">NIF</MenuItem>
            <MenuItem value="NIE">NIE</MenuItem>
            <MenuItem value="Pasaporte">Pasaporte</MenuItem>
            <MenuItem value="CIF">CIF</MenuItem>
          </Select>
        </FormControl>
      </Grid2>
      <Grid2 item xs={6}>
        <TextField
          fullWidth
          label="Nº Identificación"
          autoComplete="off"
          {...register("numero_identificacion", {
            required: "Este campo es obligatorio", // Mensaje de error si está vacío
            validate: async (value) => {
              // Validar solo si el tipo de identificación es "NIF"
              if (watch("tipo_identificacion") === "NIF") {
                try {
                  // Realizar la solicitud al backend
                  const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}validar-dni/`, {
                    tipoid:'nif',
                    numero_identificacion: value, // Enviar el valor al backend
                  });
      
                  // Si la respuesta es exitosa, devolver true
                  if (response.data.valid) {
                    return true;
                  } else {
                    // Si el backend devuelve un error, mostrar el mensaje
                    return response.data.message || "Número de identificación inválido";
                  }
                } catch (error) {
                  // Manejar errores de red o del servidor
                  console.error("Error al validar el número de identificación:", error);
                  return "Error al validar el número de identificación";
                }
              }
              else if(watch("tipo_identificacion") === "NIE"){
                try {
                  // Realizar la solicitud al backend
                  const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}validar-dni/`, {
                    tipoid:'nie',
                    numero_identificacion: value, // Enviar el valor al backend
                  });
      
                  // Si la respuesta es exitosa, devolver true
                  if (response.data.valid) {
                    return true;
                  } else {
                    // Si el backend devuelve un error, mostrar el mensaje
                    return response.data.message || "Número de identificación inválido";
                  }
                } catch (error) {
                  // Manejar errores de red o del servidor
                  console.error("Error al validar el número de identificación:", error);
                  return "Error al validar el número de identificación";
                }
      
      
              }
              return true; // Si no es "NIF", no se valida
            },
          })}
          error={!!errors.numero_identificacion} // Mostrar error si hay un problema
          helperText={
            errors.numero_identificacion
              ? errors.numero_identificacion.message === "The number has an invalid length."
                ? "El número tiene una longitud inválida."
                : errors.numero_identificacion.message === "The number's checksum or check digit is invalid."
                ? "El dígito de control o checksum del número es inválido."
                : errors.numero_identificacion.message === "The number has an invalid format."
                ? "El número tiene un formato inválido."
                : "Este campo es obligatorio"
              : "Este campo es obligatorio"
          }
        />
      </Grid2>
    </Grid2>

    {/* Fecha de Nacimiento */}
   <Grid2 item xs={12}>
  <TextField
    fullWidth
    sx={{ minWidth: "480px" }}
    label="Fecha de Nacimiento"
    autoComplete="off"
    placeholder="dd/mm/yyyy" // Placeholder para indicar el formato
    InputLabelProps={{ shrink: true }}
    {...register("fecha_nacimiento", {
      required: true,
      pattern: {
        value: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, // Expresión regular para validar el formato
        message: "El formato debe ser dd/mm/yyyy",
      },
    })}
    error={!!errors.fecha_nacimiento} // Estado de error
    helperText={
      errors.fecha_nacimiento &&
      (errors.fecha_nacimiento.type === "required"
        ? "Este campo es obligatorio"
        : errors.fecha_nacimiento.message) // Mensaje de error personalizado
    }
    inputProps={{
      style: {
        color: "black", // Color del texto ingresado
      },
    }}
    InputProps={{
      sx: {
        "&::placeholder": {
          color: errors.fecha_nacimiento ? "red" : "black", // Placeholder rojo si hay error, negro si no
          opacity: 1, // Asegura que el placeholder sea completamente visible
        },
      },
    }}
  />
</Grid2>

    {/* Dirección */}
    <Grid2 container spacing={3} sx={{ mb: 3 }}>
      <Grid2 item xs={12}>
        <TextField
          fullWidth
          sx={{ minWidth: "480px" }}
          label="Dirección completa (calle, número, escalera, piso, puerta...)*"
          autoComplete="off"
          {...register("via_principal", { required: true })}
          error={!!errors.via_principal}
          helperText={errors.via_principal && "Este campo es obligatorio"}
        />
      </Grid2>
      <Grid2 item xs={6}>
  <TextField
    fullWidth
    label="CP*"
    autoComplete="off"
    {...register("cp_direccion", {
      required: true,
      maxLength: 5,
      pattern: /^[0-9]+$/, // Solo permite números
    })}
    error={!!errors.cp_direccion} // Activa el estado de error
    helperText={
      errors.cp_direccion &&
      (errors.cp_direccion.type === "required"
        ? "Este campo es obligatorio"
        : errors.cp_direccion.type === "maxLength"
        ? "Máximo 5 caracteres"
        : "Solo se permiten números")
    }
    inputProps={{
      maxLength: 5, // Limita físicamente la entrada a 5 caracteres
    }}
  />
</Grid2>
      <Grid2 item xs={6}>
        <TextField
          fullWidth
          label="Población*"
          autoComplete="off"
          {...register("ciudad_direccion", { required: true })}
          error={!!errors.ciudad_direccion}
          helperText={errors.ciudad_direccion && "Este campo es obligatorio"}
        />
      </Grid2>
      <Grid2 item xs={12}>
        <TextField
          fullWidth
          label="Estado/Provincia"
          autoComplete="off"
          {...register("estado_provincia", { required: true })}
          error={!!errors.estado_provincia}
          helperText={errors.estado_provincia && "Este campo es obligatorio"}
        />
      </Grid2>
    </Grid2>

    {/* Género */}
    <Grid2 container spacing={3} sx={{ mb: 3 }}>
      <Grid2 item xs={12}>
        <Typography variant="body1">Género</Typography>
        <Controller
          name="genero"
          control={control}
          defaultValue=""
          rules={{ required: true }}
          render={({ field }) => (
            <RadioGroup {...field} row>
              <FormControlLabel value="masculino" control={<Radio />} label="Masculino" />
              <FormControlLabel value="femenino" control={<Radio />} label="Femenino" />
            </RadioGroup>
          )}
        />
        {errors.genero && (
          <Typography color="error" variant="body2">
            Este campo es obligatorio
          </Typography>
        )}
      </Grid2>
    </Grid2>

    {/* Recibe correspondencia */}
    <Grid2 container spacing={3} sx={{ mb: 3 }}>
      <Grid2 item xs={12}>
        <Typography variant="body1">¿Quieres recibir correspondencia por correo?</Typography>
        <RadioGroup row>
          <FormControlLabel value="si" control={<Radio />} label="Sí" {...register("recibe_correspondencia", { required: true })} />
          <FormControlLabel value="no" control={<Radio />} label="No" {...register("recibe_correspondencia", { required: true })} />
        </RadioGroup>
        {errors.recibe_correspondencia && (
          <Typography color="error" variant="body2">
            Debes seleccionar una opción.
          </Typography>
        )}
      </Grid2>
    </Grid2>

    {/* Correo Electrónico */}
    <Grid2 container spacing={3} sx={{ mb: 3 }}>
      <Grid2 item xs={12}>
        <TextField
          fullWidth
          label="email"
          autoComplete="off"
          {...register("correo_electronico")}
          error={!!errors.correo_electronico}
          helperText={errors.correo_electronico && "Este campo es obligatorio"}
          sx={{ minWidth: "482px" }} />
      </Grid2>
    </Grid2>

    {/* Móvil y Teléfono Casa */}
    <Grid2 container spacing={3} sx={{ mb: 3 }}>
      <Grid2 item xs={6}>
        <TextField
          fullWidth
          label="Móvil*"
          autoComplete="off"
          {...register("movil", { required: true })}
          error={!!errors.movil}
          helperText={errors.movil && "Este campo es obligatorio"}
        />
      </Grid2>
      <Grid2 item xs={6}>
        <TextField
          fullWidth
          label="Otro Teléfono"
          autoComplete="off"
          {...register("telefono_casa")}
        />
      </Grid2>
    </Grid2>

    {/* Sección: Datos de Pago */}
    <Typography variant="h6" gutterBottom>DATOS DE PAGO</Typography>
    <Grid2 container spacing={3} sx={{ mb: 3 }}>
      <Grid2 item xs={12}>
        <TextField
          fullWidth

          sx={{ minWidth: "500px" }}
          label="IBAN*"
          autoComplete="off"
          {...register("no_iban", {
            required: "Este campo es obligatorio", // Mensaje de error si está vacío
            validate: async (value) => {
              // Expresión regular para validar el formato básico del IBAN
              const regex = /^ES[0-9]{22}$/;
              if (!regex.test(value)) {
                return "Formato incorrecto. El IBAN debe comenzar con 'ES' seguido de 22 dígitos (ejemplo: ES9121000418450200051332).";
              }
      
              try {
                // Realizar la solicitud al backend para validar el IBAN
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}validar_iban/`, {
                  iban: value, // Enviar el IBAN al backend
                });
      
                // Si la respuesta es exitosa, devolver true
                if (response.data.valid) {
                  return true;
                } else {
                  // Si el backend devuelve un error, mostrar el mensaje
                  return response.data.message || "IBAN inválido";
                }
              } catch (error) {
                // Manejar errores de red o del servidor
                console.error("Error al validar el IBAN:", error);
                return "Error al validar el IBAN";
              }
            },
          })}
          
          error={!!errors.no_iban}
          helperText={
            errors.no_iban
              ? errors.no_iban.message || "Este campo es obligatorio"
              : "Este campo es obligatorio"
          }
        />
      </Grid2>
      <Grid2 item xs={12}>
        <TextField
          fullWidth
          sx={{ minWidth: "490px" }}
          label="Nombre Titular (en caso de que sea distinto)"
          {...register("nombre_titular")}
          
        />
      </Grid2>
    </Grid2>

    {/* Sección: Datos de Donación */}
    <Typography variant="h6" gutterBottom>DATOS DE DONACIÓN</Typography>
    <Grid2 container spacing={3} sx={{ mb: 3 }}>
      <Grid2 item xs={6}>
        <FormControl  sx={{ minWidth: "230px" }}>
          <InputLabel>Importe</InputLabel>
          <Select
            label="Importe"
            {...register("importe", { required: true })}
            error={!!errors.importe}
          >
            <MenuItem value="20">20</MenuItem>
            <MenuItem value="30">30</MenuItem>
            <MenuItem value="50">50</MenuItem>
            <MenuItem value="otra_cantidad">Otra Cantidad</MenuItem>
          </Select>
        </FormControl>
        {errors.importe && (
          <Typography color="error" variant="body2">
            Debes seleccionar un importe.
          </Typography>
        )}
      </Grid2>
      {watch("importe") === "otra_cantidad" && (
        <Grid2 item xs={6}>
          <TextField
            fullWidth
            autoComplete="off"
            label="Especifica la cantidad"
            {...register("otra_cantidad", { required: true })}
            error={!!errors.otra_cantidad}
            helperText={errors.otra_cantidad && "Debes especificar la cantidad."}
          />
        </Grid2>
      )}
      <Grid2 item xs={6}>
        <TextField
          select
          fullWidth
          autoComplete="off"
          label="Periodicidad"
          {...register("periodicidad", { required: true })}
          error={!!errors.periodicidad}
          helperText={errors.periodicidad && "Este campo es obligatorio"}
           sx={{ minWidth: "230px" }}
        >
          <MenuItem value="Mensual">Mensual</MenuItem>
          <MenuItem value="Trimestral">Trimestral</MenuItem>
          <MenuItem value="Semestral">Semestral</MenuItem>
          <MenuItem value="Anual">Anual</MenuItem>
        </TextField>
      </Grid2>
      <Grid2 item xs={6}>
        <FormControl  sx={{ minWidth: "482px" }}>
          <InputLabel>Día Presentación</InputLabel>
          <Select
            label="Día Presentación"
            {...register("dia_presentacion", { required: true })}
            error={!!errors.dia_presentacion}
          >
            <MenuItem value="Del 1 al 5">Del 1 al 5</MenuItem>
            <MenuItem value="El 11">El 11</MenuItem>
            <MenuItem value="Del 25 al 30">Del 25 al 30</MenuItem>
          </Select>
          {errors.dia_presentacion && (
            <Typography color="error" variant="body2">
              Este campo es obligatorio
            </Typography>
          )}
        </FormControl>
      </Grid2>
    </Grid2>

    {/* Sección: Control de Calidad */}
    <Typography variant="h6" gutterBottom>CONTROL DE CALIDAD</Typography>
    <Typography variant="body1" gutterBottom>
      Para asegurarnos de que comprendes tu compromiso como socio, responde las siguientes preguntas:
    </Typography>
    <Grid2 container spacing={3} sx={{ mb: 3 }}>
      <Grid2 item xs={12}>
        <Typography variant="body1" gutterBottom>
          ¿El captador de fondos te ha explicado que es una donación continua?
        </Typography>
        <Controller
          name="explicacion_donacion_continua"
          control={control}
          defaultValue=""
          rules={{ required: true }}
          render={({ field }) => (
            <RadioGroup {...field} row>
              <FormControlLabel value="si" control={<Radio />} label="Sí" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          )}
        />
        {errors.explicacion_donacion_continua && (
          <Typography color="error" variant="body2">
            Debes seleccionar una opción.
          </Typography>
        )}
      </Grid2>
      <Grid2 item xs={12}>
        <Typography variant="body1" gutterBottom>
          ¿El captador de fondos te ha explicado que éste no es un programa de una sola donación?
        </Typography>
        <Controller
          name="explicacion_no_programa_unico"
          control={control}
          defaultValue=""
          rules={{ required: true }}
          render={({ field }) => (
            <RadioGroup {...field} row>
              <FormControlLabel value="si" control={<Radio />} label="Sí" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          )}
        />
        {errors.explicacion_no_programa_unico && (
          <Typography color="error" variant="body2">
            Debes seleccionar una opción.
          </Typography>
        )}
      </Grid2>
    </Grid2>

    {/* Sección: Firmas */}
    <Grid2 container spacing={3} sx={{ mb: 3 }}>
      <Grid2 item xs={6}>
        <Typography variant="h6" gutterBottom>Firma del Socio</Typography>
        <div style={{ border: "2px solid #000", borderRadius: "4px", padding: "10px" }}>
          <SignatureCanvas
            ref={signatureRefSocio}
            canvasProps={{ width: 480, height: 200, className: "signature-canvas" }}
          />
        </div>
        <Button variant="outlined" onClick={clearSignatureSocio} sx={{ mt: 2 }}>
          Limpiar Firma
        </Button>
      </Grid2>
      <Grid2 item xs={6}>
        <Typography variant="h6" gutterBottom>Firma del Captador de Fondos</Typography>
        <div style={{ border: "2px solid #000", borderRadius: "4px", padding: "10px" }}>
          <SignatureCanvas
            ref={signatureRefCaptador}
            canvasProps={{ width: 480, height: 200, className: "signature-canvas" }}
          />
        </div>
        <Button variant="outlined" onClick={clearSignatureCaptador} sx={{ mt: 2 }}>
          Limpiar Firma
        </Button>
      </Grid2>

      <Grid2 container spacing={3} sx={{ mb: 3 }}>
  <Grid2 item xs={12}>
    <TextField
      fullWidth
      label="Notas"
      autoComplete="off"
      multiline // Permite múltiples líneas
      rows={4} // Número de filas visibles
      {...register("notas")} // Registra el campo en el formulario
      sx={{ minWidth: "480px" }} // Ajusta el ancho del campo
      inputProps={{
        maxLength: 500, // Limita la cantidad de caracteres (opcional)
      }}
      helperText="Agrega cualquier información adicional que consideres relevante." // Texto de ayuda
    />
  </Grid2>
</Grid2>
    </Grid2>

    {/* Aceptación de ser socio/a */}
    <FormControlLabel
      control={
        <Checkbox
          {...register("aceptacion_socio", { required: true })}
        />
      }
      label="Sí, quiero ser socio/a de la Fundación Aladina"
    />
    {errors.aceptacion_socio && (
      <Typography color="error" variant="body2">
        Debes marcar esta casilla.
      </Typography>
    )}

    {/* Aceptación de política de privacidad */}
    <FormControlLabel
      control={
        <Checkbox
          {...register("aceptacion_politica_privacidad", { required: true })}
        />
      }
      label={
        <Typography variant="body2">
          He leído y acepto la{" "}
          
            Política de privacidad
        
        </Typography>
      }
    />
    {errors.aceptacion_politica_privacidad && (
      <Typography color="error" variant="body2">
        Debes aceptar la política de privacidad.
      </Typography>
    )}

    {/* Botones de Envío y Guardar Borrador */}
    <Grid2 container spacing={3} sx={{ mb: 3 }}>
      <Grid2 item xs={6}>
        <Button
          type="button"
          variant="contained"
          color="secondary"
          fullWidth
          onClick={() => saveDraft(getValues())}
          disabled={loading}
        >
          {(loadingGuardar || loading) ? <CircularProgress size={24} /> : "Guardar Borrador"}

        </Button>
      </Grid2>
      <Grid2 item xs={6}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Continuar"}
        </Button>
      </Grid2>
    </Grid2>       
    <Box
  sx={{
    backgroundColor: "#f5f5f5",
    padding: { xs: 2, sm: 3 },
    borderRadius: 2,
    boxShadow: 1,
    maxWidth: "800px",
    margin: "auto",
  }}
>
  <Typography variant="body1" paragraph>
    Gracias por ayudarnos a regalar sonrisas a los niños enfermos de cáncer y sus familias.
  </Typography>

  <Typography variant="body2" paragraph>
    Te informamos que tus datos personales serán incluidos en un fichero automatizado para su tratamiento, titularidad de la Fundación Aladina. La finalidad del tratamiento es la gestión administrativa de las donaciones recurrentes y puntuales, así como informarte de nuestras actividades, eventos y campañas solidarias.
  </Typography>

  <Typography variant="body2" paragraph>
    Puedes ejercer tus derechos de acceso, rectificación, supresión y, en su caso, de revocación del consentimiento prestado. Podrás ejercer estos derechos mediante una comunicación escrita dirigida a la Fundación Aladina, C/ Tomás Bretón 50-52 3ª planta Oficina 5, 28045 Madrid, o mediante un correo electrónico a{" "}
    <Link href="mailto:socios@aladina.org" underline="hover">
      socios@aladina.org
    </Link>{" "}
    adjuntando fotocopia de tu DNI o documento identificativo similar.
  </Typography>

  <Typography variant="body2" paragraph>
    Además, tienes derecho a oponerte al tratamiento en cualquier momento, a través de los medios señalados en el apartado anterior, por motivos relacionados con tu situación particular en caso de que el tratamiento esté basado en nuestro interés legítimo. En el siguiente enlace puedes ampliar esta información:{" "}
    <Link href="https://aladina.org/aviso-legal-y-politica-de-privacidad/" target="_blank" underline="hover">
      Política de privacidad
    </Link>.
  </Typography>

  <Box component="ul" sx={{ paddingLeft: 3 }}>
    <Box component="li">
      Me opongo al envío de comunicaciones sobre productos, actividades y campañas solidarias de la Fundación Aladina, por cualquier medio o soporte de comunicación (electrónico o físico).
    </Box>
    <Box component="li">
      Consiento el envío de comunicaciones sobre productos, actividades y campañas solidarias de la Fundación Aladina en aquellos casos en los que no sea colaborador recurrente o puntual de Fundación Aladina, por cualquier medio o soporte de comunicación (electrónico o físico).
    </Box>
  </Box>
</Box>

      </form>
    </Container>
  );
}
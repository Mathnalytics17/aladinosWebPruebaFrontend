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
  const signatureRefSocio = useRef(null); // Referencia para la firma del socio
  const signatureRefCaptador = useRef(null); // Referencia para la firma del captador
  const router = useRouter(); // Obtén el objeto router
  const [validationError, setValidationError] = useState('');
  
  const numeroIdentificacionRef = useRef(null); // Referencia para el campo de Nº Identificación

  // Función para validar el Nº de Identificación
  const validarNumeroIdentificacion = async () => {
    setLoading(true);
    setValidationError('');
  
    const numeroIdentificacion = numeroIdentificacionRef.current.value;
  
    if (!numeroIdentificacion) {
      setValidationError('Por favor, ingresa un número de identificación');
      setLoading(false);
      return;
    }
  
    try {
      const response = await axios.post(
        'https://api.altasfundacionaladina.org/api/validar-dni/', // Usa el endpoint de Django
        { numeroIdentificacion },
      );
  
      if (response.data.valido) {
        setValidationError('');
        alert('Número de identificación válido');
      } else {
        setValidationError('Número de identificación incorrecto');
      }
    } catch (error) {
      console.error('Error al validar el número de identificación:', error);
      setValidationError('Error al validar el número de identificación');
    } finally {
      setLoading(false);
    }
  };

  // Cargar borrador desde localStorage al iniciar
  useEffect(() => {
    const draft = JSON.parse(localStorage.getItem("formDraft"));
    if (draft) {
      Object.keys(draft).forEach((key) => {
        if (key === "firma" && draft[key]) {
          // Si hay una firma guardada, la cargamos en el canvas
          signatureRefSocio.current.fromDataURL(draft[key]);
        } else if (key === "fecha_nacimiento" && draft[key]) {
          // Convertir fecha_nacimiento a objeto Date si es una cadena
          setValue(key, new Date(draft[key]));
        } else {
          setValue(key, draft[key]);
        }
      });
      setIsDraft(true);
    }
  }, [setValue]);


  const obtenerFechaFormateada = () => {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0'); // Día con dos dígitos
    const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // Mes con dos dígitos
    const año = hoy.getFullYear(); // Año con cuatro dígitos
    return `${dia}/${mes}/${año}`; // Formato DD/MM/YYYY
  };


  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Convertir fecha_nacimiento a objeto Date si es una cadena
      if (typeof data.fecha_nacimiento === "string") {
        // Dividir la cadena en día, mes y año
        const [day, month, year] = data.fecha_nacimiento.split("/");
      
        // Crear el objeto Date (los meses en JavaScript son base 0, por eso restamos 1 al mes)
        data.fecha_nacimiento = new Date(year, month - 1, day);
      
        // Verificar si la fecha es válida
        if (isNaN(data.fecha_nacimiento.getTime())) {
          throw new Error("Fecha de nacimiento no válida");
        }
      }
      const fechaFormateadahoy = obtenerFechaFormateada();
      console.log(fechaFormateadahoy);
      console.log(data.importe)

      // Capturar las firmas como imágenes base64
    const firmaSocio = signatureRefSocio.current.toDataURL(); // Firma del socio
    const firmaCaptador = signatureRefCaptador.current.toDataURL(); // Firma del captado
      data.recibe_correspondencia = data.recibe_correspondencia === "si" ? "SI" : "NO QUIERE";
      data.importe = data.importe == "otra_cantidad" ? data.otra_cantidad +"€": data.importe ;
      data.saludo= data.genero === "masculino" ? "D." : "femenino"? "Dña.":"nada";
      console.log(data.importe)
      const formattedData = {
        ...data,
        
        firma_socio: firmaSocio, // Agregar firma del socio
        firma_captador: firmaCaptador, // Agregar firma del captador
        quiere_correspondencia: data.recibe_correspondencia,
        saludo: data.saludo,
        fecha_ingreso_dato:fechaFormateadahoy,
        fecha_nacimiento: data.fecha_nacimiento.toISOString().split("T")[0], // Formato YYYY-MM-DD
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
        fecha_alta:  null,
        descripcion:'',
        mandato:'',
        nombre_autom: data.nombre + ' '+ data.apellidos+ ' '+ '-'+ ' '+ 'Domiciliación',
        persona_id:'',
        nombre_asterisco:data.nombre + ' ' +  data.apellidos+ ' '+'-'+ ' '+ 'Socio'
      };

      const response = await axios.post("https://api.altasfundacionaladina.org/api/registro/", formattedData);
      console.log("Registro exitoso:", response.data);
      setSuccess(true);
      setError(null);
      toast.success("Formulario enviado con éxito");
      localStorage.removeItem("formDraft"); // Eliminar borrador después de enviar
      // Redirigir a la página de éxito
      router.push("/formularioGoogleSheets/success");
    } catch (error) {
      console.error("Error al enviar el formulario:", error.response?.data || error.message);
      setError("Hubo un error al enviar el formulario");
      setSuccess(false);
    
    // Mostrar errores de validación del backend
    if (error.response?.data) {

      const errorTranslations = {
        "Ensure this value is less than or equal to 2147483647.": "Asegúrese de que este valor sea menor o igual a 2147483647.",
        "Ensure this field has no more than 10 characters.": "Asegúrese de que el campo CP no tenga más de 10 caracteres.",
        // Agrega más traducciones según sea necesario
      };
      Object.keys(error.response.data).forEach((key) => {
        const messages = error?.response?.data[key]?.map((msg) => errorTranslations[msg] || msg); // Traducción o mensaje original
        toast.error(`${key}: ${messages.join(", ")}`);
      });
    } else {
      toast.error("Error de red. Por favor, intenta de nuevo.");
    }
  } finally {
    setLoading(false);
  }
  };

  const saveDraft = async (data) => {
    // Verificar que todos los campos obligatorios estén completos (excepto no_iban)
    const fechaFormateadahoy = obtenerFechaFormateada();
    const camposObligatorios = [
      "nombre",
      "apellidos",
      "tipo_identificacion",
      "numero_identificacion",
      "fecha_nacimiento",
      "via_principal",
      "cp_direccion",
      "ciudad_direccion",
      "estado_provincia","dia_presentacion",
      "genero",
      "recibe_correspondencia",
     
      "movil",
      "importe",
      "periodicidad",
      "explicacion_donacion_continua", // Validación solo en frontend
      "explicacion_no_programa_unico", // Validación solo en frontend
      "aceptacion_socio", // Validación solo en frontend
      "aceptacion_politica_privacidad", // Validación solo en frontend
    ];
  
    for (const campo of camposObligatorios) {
      if (!data[campo]) {
        toast.error(`El campo ${campo} es obligatorio.`);
        return; // Detener la ejecución si falta un campo obligatorio
      }
    }
  
    const formatDateToDDMMYYYY = (date) => {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return ""; // Devuelve una cadena vacía si la fecha no es válida
      }
      const day = String(date.getUTCDate()).padStart(2, "0"); // Usar getUTCDate() en lugar de getDate()
      const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Usar getUTCMonth() en lugar de getMonth()
      const year = date.getUTCFullYear(); // Usar getUTCFullYear() en lugar de getFullYear()
      return `${day}/${month}/${year}`;
    };
    
    // Convertir la cadena a objeto Date si es necesario
    const parseDateFromString = (dateString) => {
      if (typeof dateString === "string") {
        // Si la cadena está en formato dd/mm/yyyy, convertirla a yyyy-mm-dd
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
          const [day, month, year] = dateString.split("/");
          return new Date(Date.UTC(year, month - 1, day)); // Crear la fecha en horario UTC
        }
        // Si la cadena ya está en un formato que new Date() puede interpretar (por ejemplo, yyyy-mm-dd)
        return new Date(dateString);
      }
      return null;
    };
    
    // Procesar la fecha de nacimiento
    let fechaNacimiento;
    if (data.fecha_nacimiento instanceof Date) {
      fechaNacimiento = formatDateToDDMMYYYY(data.fecha_nacimiento);
    } else if (typeof data.fecha_nacimiento === "string") {
      const dateObj = parseDateFromString(data.fecha_nacimiento);
      fechaNacimiento = formatDateToDDMMYYYY(dateObj);
    } else {
      fechaNacimiento = "";
    }
    
    console.log(fechaNacimiento); // Salida: "12/03/2022" o "" si la fecha no es válida
       
    data.importe = data.importe == "otra_cantidad" ? data.otra_cantidad +"€": data.importe;
    console.log(data.importe)
    // Preparar los datos para enviar (excluyendo firma y campos de validación frontend)
    const draftData = {
      fundraiser_code:data.fundraiser_code,
      fundraiser_name:data.fundraiser_name,
      fecha_ingreso_dato:fechaFormateadahoy,
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
      importe: data.importe,
      otra_cantidad: data.otra_cantidad || '',
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
      nombre_autom: data.nombre + ' ' + data.apellidos + ' ' + '-' + ' ' + 'Domiciliación',
      nombre_asterisco: data.nombre + ' ' + data.apellidos + ' ' + '-' + ' ' + 'Socio',
      dia_presentacion:data.dia_presentacion
    };
  
    // Guardar borrador en localStorage
    localStorage.setItem("formDraft", JSON.stringify(draftData));
    setIsDraft(true);
    toast.info("Borrador guardado correctamente");
  
    // Enviar datos al backend
    try {
      const response = await fetch("https://api.altasfundacionaladina.org/api/registro/guardarBorrador/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftData),
      });
  
      if (response.ok) {
        toast.success("Datos enviados a Google Sheets correctamente");
      } else {
        toast.error("Error al enviar datos a Google Sheets");
      }
    } catch (error) {
      console.error("Error al enviar datos:", error);
      toast.error("Error al enviar datos");
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
        <TextField
          fullWidth
          label="Código Fundraiser"
          autoComplete="off"
          {...register("fundraiser_code", { required: true })}
          error={!!errors.fundraiser_code}
          helperText={errors.fundraiser_code && "Este campo es obligatorio"}
        />
      </Grid2>
      <Grid2 item xs={6}>
        <TextField
          fullWidth
          label="Nombre Fundraiser"
          autoComplete="off"
          {...register("fundraiser_name", { required: true })}
          error={!!errors.fundraiser_name}
          helperText={errors.fundraiser_name && "Este campo es obligatorio"}
        />
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
                  const response = await axios.post("https://api.altasfundacionaladina.org/api/validar-dni/", {
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
                  const response = await axios.post("https://api.altasfundacionaladina.org/api/validar-dni/", {
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
    <Grid2 container spacing={3} sx={{ mb: 3 }}>
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
    error={!!errors.fecha_nacimiento}
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
          color: "black", // Color del placeholder
          opacity: 1, // Asegura que el placeholder sea completamente visible
        },
      },
    }}
  />
</Grid2>
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
                const response = await axios.post("https://api.altasfundacionaladina.org/api/validar_iban/", {
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
            <MenuItem value="20€">20€</MenuItem>
            <MenuItem value="30€">30€</MenuItem>
            <MenuItem value="50€">50€</MenuItem>
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
            <MenuItem value="Del 11 al 15">Del 11 al 15</MenuItem>
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
          {loading ? <CircularProgress size={24} /> : "Guardar Borrador"}
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
    </Grid2>       <Box
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
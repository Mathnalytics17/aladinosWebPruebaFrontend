import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Radio,
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
  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDraft, setIsDraft] = useState(false); // Estado para borrador
  const signatureRefSocio = useRef(null); // Referencia para la firma del socio
  const signatureRefCaptador = useRef(null); // Referencia para la firma del captador
  const router = useRouter(); // Obtén el objeto router
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);
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
        'http://localhost:8000/api/validar-dni/', // Usa el endpoint de Django
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

  const onSubmit = async (data) => {
    try {
      // Convertir fecha_nacimiento a objeto Date si es una cadena
      if (typeof data.fecha_nacimiento === "string") {
        data.fecha_nacimiento = new Date(data.fecha_nacimiento);
      }

      const signature = signatureRefSocio.current.toDataURL(); // Obtener firma como imagen
      data.recibe_correspondencia = data.recibe_correspondencia === "si" ? "SI" : "NO QUIERE";
      data.importe = data.importe == "otra_cantidad" ? "Otra Cantidad" : data.importe;
      data.saludo= data.genero === "masculino" ? "D." : "femenino"? "Dña.":"nada";
      const formattedData = {
        ...data,
        quiere_correspondencia: data.recibe_correspondencia,
        saludo: data.saludo,
        firma: signature, // Agregar firma al formulario
        fecha_nacimiento: data.fecha_nacimiento.toISOString().split("T")[0], // Formato YYYY-MM-DD
        primer_canal_captacion: "F2F Boost Impact (Madrid)",
        canal_entrada: "F2F",
        recibe_memoria: "SI",
        medio_pago: "DOMICILIACIÓN",
        tipo_pago: "CUOTA",
        concepto_recibo: "GRACIAS POR TU AYUDA - Fundación Aladina",
        tipo_relacion: "Socio",
        importe: data.importe || '',
        otra_cantidad: data.otra_cantidad || '',
        fecha_primer_pago: data.fecha_primer_pago || '',
        mandato: data.mandato || '',
        persona_id: data.persona_id || '',
        fecha_alta:  null,
        descripcion:'',
        mandato:'',
        nombre_autom: data.nombre + ''+ '-'+ ''+ 'Domiciliación',
        persona_id:'',
        nombre_asterisco:data.nombre + '' + '-'+ ''+ 'Socio'
      };

      const response = await axios.post("http://localhost:8000/api/registro/", formattedData);
      console.log("Registro exitoso:", response.data);
      setSuccess(true);
      setError(null);
      localStorage.removeItem("formDraft"); // Eliminar borrador después de enviar
      // Redirigir a la página de éxito
      router.push("/formularioGoogleSheets/success");
    } catch (error) {
      console.error("Error al enviar el formulario:", error.response?.data || error.message);
      setError("Hubo un error al enviar el formulario");
      setSuccess(false);
    }
  };

  const saveDraft = (data) => {
    const signature = signatureRefSocio.current.toDataURL(); // Obtener firma como imagen
    const draftData = {
      ...data,
      firma: signature, // Guardar firma en el borrador
    };
    localStorage.setItem("formDraft", JSON.stringify(draftData)); // Guardar borrador en localStorage
    setIsDraft(true);
    alert("Borrador guardado correctamente.");
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Registro enviado con éxito</Alert>}
      {isDraft && <Alert severity="info">Tienes un borrador guardado. Puedes continuar completando el formulario.</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h6">INFORMACION PERSONAL</Typography>
      <Grid2 item xs={6}>
          <TextField
            fullWidth
            label="Código Fundraiser"
            {...register("fundraiser_code", { required: true })}
            error={!!errors.codigo_fundraiser}
            helperText={errors.codigo_fundraiser && "Este campo es obligatorio"}
          />
        </Grid2>

        {/* Campo de Nombre Fundraiser */}
        <Grid2 item xs={6}>
          <TextField
            fullWidth
            label="Nombre Fundraiser"
            {...register("fundraiser_name", { required: true })}
            error={!!errors.nombre_fundraiser}
            helperText={errors.nombre_fundraiser && "Este campo es obligatorio"}
          />
        </Grid2>
        

       
        {/* Nombre y Apellidos */}
        <Grid2 container spacing={3} sx={{ mb: 3 }}>
          <Grid2 item xs={6}>
            <TextField
              fullWidth
              label="Nombre"
              {...register("nombre", { required: true })}
              error={!!errors.nombre}
              helperText={errors.nombre && "Este campo es obligatorio"}
            />
          </Grid2>
          <Grid2 item xs={6}>
            <TextField
              fullWidth
              label="Apellidos"
              {...register("apellidos", { required: true })}
              error={!!errors.apellidos}
              helperText={errors.apellidos && "Este campo es obligatorio"}
            />
          </Grid2>
        </Grid2>

        {/* Tipo de Identificación */}
        <Grid2 container spacing={3} sx={{ mb: 3 }}>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Identificación</InputLabel>
              <Select
                label="Tipo de Identificación"
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
              {...register('numero_identificacion', { required: true })}
              error={!!errors.numero_identificacion || !!validationError}
              helperText={
                (errors.numero_identificacion && 'Este campo es obligatorio') ||
                validationError
              }
              inputRef={numeroIdentificacionRef} // Asignar la referencia al campo de texto
            />
          </Grid2>
          <Grid2 item xs={6}>
            <Button
              variant="contained"
              color="primary"
              onClick={validarNumeroIdentificacion}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Validar'}
            </Button>
          </Grid2>
        </Grid2>


        {/* Fecha de Nacimiento */}
        <Grid2 container spacing={3} sx={{ mb: 3 }}>
        <Grid2 item xs={12}>
  <TextField
    fullWidth
    label="Fecha de Nacimiento"
    type="date"
    InputLabelProps={{ shrink: true }} // Asegura que el label no se superponga
    {...register("fecha_nacimiento", { required: true })}
    error={!!errors.fecha_nacimiento}
    helperText={errors.fecha_nacimiento && "Este campo es obligatorio"}
  />
</Grid2>
        </Grid2>
        <Grid2 item xs={12}>
            <TextField
              fullWidth
              label="Dirección completa (calle, no, escalera, piso, puerta...)*"
              {...register("via_principal", { required: true })}
              error={!!errors.via_principal}
              helperText={errors.via_principal && "Este campo es obligatorio"}
            />
          </Grid2>
        {/* Dirección */}
        <Grid2 container spacing={3} sx={{ mb: 3 }}>
          
          <Grid2 item xs={6}>
            <TextField
              fullWidth
              label="CP*"
              {...register("cp_direccion", { required: true })}
              error={!!errors.codigo_postal}
              helperText={errors.codigo_postal && "Este campo es obligatorio"}
            />
          </Grid2>
          <Grid2 item xs={6}>
            <TextField
              fullWidth
              label="Población*"
              {...register("ciudad_direccion", { required: true })}
              error={!!errors.ciudad}
              helperText={errors.ciudad && "Este campo es obligatorio"}
            />
          </Grid2>
          
          {/*Estado provincia */}

              <Grid2 container spacing={3} sx={{ mb: 3 }}>
        <Grid2 item xs={6}>
          <TextField
            fullWidth
            label="Estado/Provincia"
            {...register("estado_provincia", { required: true })}
            error={!!errors.estado_provincia}
            helperText={errors.estado_provincia && "Este campo es obligatorio"}
          />
        </Grid2>
      </Grid2>
          <Grid2 item xs={12}>
            Género
          <Controller
            name="genero"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => (
              <RadioGroup {...field} row>
                <FormControlLabel value="masculino" control={<Radio />} label="Masculino" />
                <FormControlLabel value="femenino" control={<Radio />} label="Femenino" />
                <FormControlLabel value="otro" control={<Radio />} label="Otro" />
              </RadioGroup>
            )}
            {...register("genero", { required: true})}
          />
          {errors.genero && (
            <p style={{ color: "red", margin: "4px 0 0 14px", fontSize: "0.75rem" }}>
              Este campo es obligatorio
            </p>
          )}
        </Grid2>
        </Grid2>

        {/* Recibe correspondencia */}
        <Grid2 container spacing={3} sx={{ mb: 3 }}>
          <Grid2 item xs={12}>
            <Typography variant="h6">¿Quieres recibir información por correo?</Typography>
            <RadioGroup row>
              <FormControlLabel value="si" control={<Radio />} label="Sí" {...register("recibe_correspondencia", { required: true })} />
              <FormControlLabel value="no" control={<Radio />} label="No" {...register("recibe_correspondencia", { required: true })} />
            </RadioGroup>
            {errors.recibe_correspondencia && <Typography color="error">Debes seleccionar una opción.</Typography>}
          </Grid2>
        </Grid2>

        {/* Móvil y Teléfono Casa */}
        <Grid2 container spacing={3} sx={{ mb: 3 }}>
          <Grid2 item xs={6}>
            <TextField
              fullWidth
              label="Móvil"
              {...register("movil", { required: false })}
              error={!!errors.movil}
            />
          </Grid2>
          <Grid2 item xs={6}>
            <TextField
              fullWidth
              label="Teléfono Casa"
              {...register("telefono_casa", { required: false })}
              error={!!errors.telefono_casa}
            />
          </Grid2>
        </Grid2>

        {/* Correo Electrónico */}
        <Grid2 container spacing={3} sx={{ mb: 3 }}>
          <Grid2 item xs={12}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              {...register("correo_electronico", { required: true })}
              error={!!errors.correo}
              helperText={errors.correo && "Este campo es obligatorio"}
            />
          </Grid2>
        </Grid2>
        <Typography variant="h6">DATOS DE PAGO</Typography>
        <Grid2 item xs={12}>
          <TextField
            fullWidth
            label="No IBAN"
            {...register("no_iban", { required: true })}
            error={!!errors.no_iban}
            helperText={errors.no_iban && "Este campo es obligatorio"}
          />
        </Grid2>

        {/* Campo de Nombre Titular (en caso de que sea distinto) */}
        <Grid2 item xs={12}>
          <TextField
            fullWidth
            label="Nombre Titular (en caso de que sea distinto)"
            {...register("nombre_titular")}
          />
        </Grid2>
        <Typography variant="h6">DATOS DE DONACION</Typography>
        {/* Descripción y Periodicidad */}
        <Grid2 container spacing={10} sx={{ mb: 3 }}>
         

        <Grid2 item size={{ xs: 12, sm: 3 }}>
    <FormControl fullWidth>
      <InputLabel>Importe</InputLabel>
      <Select
        label="Importe"
        {...register("importe", { required: true })}
        error={!!errors.importe}
      >
        <MenuItem value="10€">10€</MenuItem>
        <MenuItem value="20€">20€</MenuItem>
        <MenuItem value="30€">30€</MenuItem>
        <MenuItem value="50€">50€</MenuItem>
        <MenuItem value="otra_cantidad">Otra Cantidad</MenuItem>
      </Select>
    </FormControl>
    {errors.importe && (
      <Typography color="error">Debes seleccionar un importe.</Typography>
    )}
  </Grid2>
  {/* Campo para ingresar otra cantidad */}
  {watch("importe") === "otra_cantidad" && (
    <Grid2 size={{ xs: 12, sm: 3 }}>
      <TextField
        fullWidth
        label="Especifica la cantidad"
        {...register("otra_cantidad", { required: true })}
        error={!!errors.otra_cantidad}
        helperText={errors.otra_cantidad && "Debes especificar la cantidad."}
      />
    </Grid2>
  )}
          <Grid2 size={{ xs: 5, sm: 3 }}>
            <TextField
              select
              fullWidth
              label="Periodicidad"
              {...register("periodicidad", { required: true })}
              error={!!errors.periodicidad}
              helperText={errors.periodicidad && "Este campo es obligatorio"}
            >
              <MenuItem value="Mensual">Mensual</MenuItem>
              <MenuItem value="Trimestral">Trimestral</MenuItem>
              <MenuItem value="Semestral">Semestral</MenuItem>
              <MenuItem value="Anual">Anual</MenuItem>
            </TextField>
          </Grid2>
        </Grid2>

        {/* Fecha Primer Pago y Día Presentación */}
        <Grid2 container spacing={3} sx={{ mb: 3 }}>
          <Grid2 item xs={6}>
            <TextField
              fullWidth
              label="Fecha Primer Pago"
              type="date"
              InputLabelProps={{ shrink: true }}
              {...register("fecha_primer_pago", { required: true })}
              error={!!errors.fecha_primer_pago}
              helperText={errors.fecha_primer_pago && "Este campo es obligatorio"}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 3 }}>
  <FormControl fullWidth>
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


        
        <Grid2 item xs={12}>
  <Typography variant="h6" gutterBottom>
    CONTROL DE CALIDAD
  </Typography>
  <Typography variant="body1" gutterBottom>
    Para asegurarnos de que comprendes tu compromiso como socio, responde las siguientes preguntas:
  </Typography>

  {/* Pregunta 1 */}
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

  {/* Pregunta 2 */}
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
      <Link href="/formularioGoogleSheets/policyPrivate" passHref>
        Politica de privacidad
      </Link>.
    </Typography>
  }
/>
{errors.aceptacion_politica_privacidad && (
  <Typography color="error" variant="body2">
    Debes aceptar la política de privacidad.
  </Typography>
)}
</Grid2>

<Grid2 container spacing={3} sx={{ mb: 3 }}>
  {/* Firma del Socio */}
  <Grid2 item xs={6}>
    <Typography variant="h6">Firma del Socio</Typography>
    <div
      style={{
        border: "2px solid #000", // Borde negro de 2px
        borderRadius: "4px", // Bordes redondeados
        padding: "10px", // Espacio interno
        width: "100%", // Ancho del contenedor
        marginBottom: "10px", // Margen inferior
      }}
    >
      <SignatureCanvas
        ref={signatureRefSocio} // Referencia para la firma del socio
        canvasProps={{
          width: 480, // Ancho del canvas (ajustado para el padding)
          height: 200,
          className: "signature-canvas",
        }}
      />
    </div>
    <Button variant="outlined" onClick={clearSignatureSocio} sx={{ mt: 2 }}>
      Limpiar Firma
    </Button>
  </Grid2>

  {/* Firma del Captador de Fondos */}
  <Grid2 item xs={6}>
    <Typography variant="h6">Firma del Captador de Fondos</Typography>
    <div
      style={{
        border: "2px solid #000", // Borde negro de 2px
        borderRadius: "4px", // Bordes redondeados
        padding: "10px", // Espacio interno
        width: "100%", // Ancho del contenedor
        marginBottom: "10px", // Margen inferior
      }}
    >
      <SignatureCanvas
        ref={signatureRefCaptador} // Referencia para la firma del captador
        canvasProps={{
          width: 480, // Ancho del canvas (ajustado para el padding)
          height: 200,
          className: "signature-canvas",
        }}
      />
    </div>
    <Button variant="outlined" onClick={clearSignatureCaptador} sx={{ mt: 2 }}>
      Limpiar Firma
    </Button>
  </Grid2>
</Grid2>
        
        {/* Botones de Envío y Guardar Borrador */}
        <Grid2 container spacing={3} sx={{ mb: 3 }}>
          <Grid2 item xs={6}>
            <Button
              type="button"
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleSubmit(saveDraft)} // Guardar borrador
            >
              Guardar Borrador
            </Button>
          </Grid2>
          <Grid2 item xs={6}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Continuar
            </Button>
          </Grid2>
        </Grid2>
      </form>
    </Container>
  );
}
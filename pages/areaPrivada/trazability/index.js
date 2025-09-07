// components/TrazabilityDashboard.js
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Grid,
  Alert
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  PhoneAndroid,
  Computer,
  TabletAndroid,
  Devices
} from '@mui/icons-material';
import axios from 'axios';

const DeviceIcon = ({ deviceType }) => {
  switch (deviceType) {
    case 'mobile': return <PhoneAndroid />;
    case 'tablet': return <TabletAndroid />;
    case 'desktop': return <Computer />;
    default: return <Devices />;
  }
};

const TrazabilityRow = ({ log }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          {log.user_first_name} {log.user_last_name}
          <br />
          <small>{log.user_email}</small>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeviceIcon deviceType={log.device_type} />
            {log.device_type}
          </Box>
        </TableCell>
        <TableCell>
          <strong>{log.view_name}</strong>
          <br />
          <small>{log.url_path}</small>
        </TableCell>
        <TableCell>
          {new Date(log.entry_time).toLocaleString()}
        </TableCell>
        <TableCell>
          <Chip 
            label={log.duration ? `${Math.round(log.duration)} seg` : 'N/A'} 
            color={log.duration ? 'primary' : 'default'}
          />
        </TableCell>
        <TableCell>{log.ip_address}</TableCell>
      </TableRow>
      
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Card sx={{ margin: 1, bgcolor: '#f5f5f5' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Detalles del Dispositivo
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography><strong>Navegador:</strong> {log.browser_name} {log.browser_version}</Typography>
                    <Typography><strong>Sistema Operativo:</strong> {log.os_name} {log.os_version}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><strong>Modelo:</strong> {log.device_model || 'N/A'}</Typography>
                    <Typography><strong>Es bot:</strong> {log.is_bot ? 'Sí' : 'No'}</Typography>
                    <Typography><strong>User Agent:</strong> {log.user_agent}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const TrazabilityDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}llamadas/trazability/`,
          { withCredentials: true }
        );
        setLogs(response.data);
      } catch (error) {
        console.error('Error fetching logs:', error);
        setError('Error cargando los datos de trazabilidad');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) return <Typography>Cargando...</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Trazabilidad de Usuarios
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Usuario</TableCell>
              <TableCell>Dispositivo</TableCell>
              <TableCell>Vista</TableCell>
              <TableCell>Entrada</TableCell>
              <TableCell>Duración</TableCell>
              <TableCell>IP</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <TrazabilityRow key={log.id} log={log} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No hay datos de trazabilidad disponibles
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TrazabilityDashboard;
// pages/areaPrivada/index.js

'use client' // Necesario para usar hooks y contextos
import React, { useState } from 'react';

import { Box, Tabs, Tab, Paper } from '@mui/material';
import { PeopleAlt, PieChart } from '@mui/icons-material';
import AdminPanel from './areaAdministrador/index';
import ComercialPanel from './areaComercial/index';
import StatsPanel from './stats/index';
import styles from './areaPrivada.module.css'



import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "../../shared/components/Sidebar";
import { AppSidebar } from "../../shared/components/ui/navigation/AppSidebar";
import { SidebarTrigger } from "../../shared/components/Sidebar";
import { Breadcrumbs } from "../../shared/components/ui/navigation/Breadcrumbs";
import { useRouter } from "next/router";
import { AuthProvider } from "../../context/authContext";
import localFont from "next/font/local"

import ProtectedRole from '@/shared/components/protectedRoute';
const pathsWithoutDefaultLayout = [
  "/",
  "/self-management",
  "/users/login",
  "/financialProfile/financialStatement",
  "/financialProfile/indicators",
  "/auth/resetPassword",
  "/auth/forgotPassword"
];
const geistSans = localFont({
  src: "../../shared/components/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "../../shared/components/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})


const AreaPrivada = () => {
  const router = useRouter();
  const { tab = 'admin' } = router.query;

  const handleTabChange = (event, newValue) => {
    const tabs = [  'estadisticas','admin',];
    router.push(`/areaPrivada?tab=${tabs[newValue]}`, undefined, { shallow: true });
  };

  const tabValue = [ 'estadisticas','admin'].indexOf(tab);

  return (
    <AuthProvider>
    <ProtectedRole requiredRoles="JEFE">
<ThemeProvider
      defaultTheme="system"
      disableTransitionOnChange
      attribute="class"
    >
   
        
          <SidebarProvider defaultOpen={true}>
            
              <AppSidebar />
              <div className="w-full">
                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
                  <SidebarTrigger className="-ml-1" />
                  <div className="mr-2 h-4 w-px bg-border" />
                  <Breadcrumbs />
                </header>
                <main    ><Box 
              sx={{ 
                p: 3,
                backgroundColor: 'background.default',
                color: 'text.primary'
              }}
            >
      {/* Barra de navegación con pestañas */}
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              height: 4,
            }
          }}
        >
           <Tab 
            label="Estadísticas" 
            icon={<PieChart />}
            iconPosition="start"
          />
          <Tab 
            label="Administración" 
         
            iconPosition="start"
          />
         
         
        </Tabs>
      </Paper>

      {/* Contenido del panel */}
      
      {tab === 'estadisticas' && <StatsPanel />}
      {tab === 'admin' && <AdminPanel />}
 
    </Box></main>
              </div>
            
          </SidebarProvider>
        
    
    </ThemeProvider>


    </ProtectedRole>
    </AuthProvider>
   
    
  );
};

export default AreaPrivada;
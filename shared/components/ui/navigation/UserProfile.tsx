"use client"

import { Button } from "../../Button"
import { cx, focusRing } from "../../../lib/utils"
import { ChevronsUpDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from '../../../../context/authContext';
import { DropdownUserProfile } from "./DropdownUserProfile"

export function UserProfile() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInitials, setUserInitials] = useState("");
  const [userEmail, setUserEmail] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    // Obtener el email del Local Storage o del contexto de autenticación
    const storedEmail = localStorage.getItem('access_email') || user?.email;
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, [user]);
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      console.log(token)
      setIsAuthenticated(!!token);
      
      // Obtener información del usuario si está autenticado
      if (token) {
        // Aquí puedes obtener los datos del usuario desde localStorage o donde los tengas almacenados
        const userData = localStorage.getItem("user_data");
        console.log(userData )
        if (userData) {
          try {
            const user = JSON.parse(userData);
            
            // Generar iniciales del usuario
            if (user.first_name && user.last_name) {
              setUserInitials(`${user.first_name[0]}${user.last_name[0]}`);
            } else if (user.email) {
              setUserInitials(user.email[0].toUpperCase());
            }
          } catch (e) {
            console.error("Error parsing user data", e);
          }
        }
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
    setIsAuthenticated(false);
    window.dispatchEvent(new Event("storage"));
    router.push("/areaPrivada/users/login");
  };

  if (!isAuthenticated) {
    return null; // O podrías devolver un botón de login aquí
  }

  return (
    <DropdownUserProfile 
  onLogout={handleLogout} 
  userEmail={userEmail}
>
      <Button
        aria-label="User settings"
        variant="ghost"
        className={cx(
          "group flex w-full items-center justify-between rounded-md px-1 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200/50 data-[state=open]:bg-gray-200/50 hover:dark:bg-gray-800/50 data-[state=open]:dark:bg-gray-900",
          focusRing,
        )}
      >
        <span className="flex items-center gap-3">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            aria-hidden="true"
          >
            {userInitials || "US"}
          </span>
          <span>Mi cuenta</span>
        </span>
        <ChevronsUpDown
          className="size-4 shrink-0 text-gray-500 group-hover:text-gray-700 group-hover:dark:text-gray-400"
          aria-hidden="true"
        />
      </Button>
    </DropdownUserProfile>
  )
}
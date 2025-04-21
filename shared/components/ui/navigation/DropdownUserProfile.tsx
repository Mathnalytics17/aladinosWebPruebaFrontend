"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSubMenu,
  DropdownMenuSubMenuContent,
  DropdownMenuSubMenuTrigger,
  DropdownMenuTrigger,
} from "../../DropdownMenu"
import { ArrowUpRight, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"
import { useRouter } from "next/navigation";
import Link from "next/link";
export type DropdownUserProfileProps = {
  children: React.ReactNode
  align?: "center" | "start" | "end"
  onLogout?: () => void
  userEmail?: string
}

export function DropdownUserProfile({
  children,
  align = "start",
  onLogout,
  userEmail = "",
}: DropdownUserProfileProps) {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()
// Dentro de tu componente
const router = useRouter();
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="sm:!min-w-[calc(var(--radix-dropdown-menu-trigger-width))]"
      >
        {userEmail && <DropdownMenuLabel>{userEmail}</DropdownMenuLabel>}
        
        <DropdownMenuGroup>
          <DropdownMenuSubMenu>
            <DropdownMenuSubMenuTrigger>Theme</DropdownMenuSubMenuTrigger>
            <DropdownMenuSubMenuContent>
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) => {
                  setTheme(value)
                }}
              >
                <DropdownMenuRadioItem
                  aria-label="Switch to Light Mode"
                  value="light"
                  iconType="check"
                >
                  <Sun className="size-4 shrink-0" aria-hidden="true" />
                  Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  aria-label="Switch to Dark Mode"
                  value="dark"
                  iconType="check"
                >
                  <Moon className="size-4 shrink-0" aria-hidden="true" />
                  Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  aria-label="Switch to System Mode"
                  value="system"
                  iconType="check"
                >
                  <Monitor className="size-4 shrink-0" aria-hidden="true" />
                  System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubMenuContent>
          </DropdownMenuSubMenu>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
       
        <DropdownMenuItem className="p-0"> {/* Elimina el padding para que el Link ocupe todo el espacio */}
  <Link 
    href="areaPrivada/users/profile" 
    className="flex items-center justify-between w-full px-2 py-1.5" /* Añade padding aquí */
  >
    Perfil
    <ArrowUpRight className="ml-1 size-3 text-gray-500" />
  </Link>
</DropdownMenuItem>
          <DropdownMenuItem>
            Documentation
            <ArrowUpRight
              className="mb-1 ml-1 size-3 shrink-0 text-gray-500"
              aria-hidden="true"
            />
          </DropdownMenuItem>
          
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onLogout}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
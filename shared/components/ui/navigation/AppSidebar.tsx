"use client"
import { Divider } from "../../Divider"
import { Input } from "../../Input"
import Image from 'next/image';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarLink,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarSubLink,
} from "../../Sidebar"
import { cx, focusRing } from "../../../lib/utils"
import { RiArrowDownSFill } from "@remixicon/react"
import { BookText, Home, PackageSearch } from "lucide-react"
import * as React from "react"
import { Logo } from "../../../../public/Logo"
import { UserProfile } from "./UserProfile"

const navigation = [
  {
    name: "Home",
    href: "/areaPrivada",
    icon: Home,
    notifications: false,
    active: false,
  },
  {
    name: "Area Administrador",
    href: "/areaPrivada/areaAdministrador",
    icon: PackageSearch,
    notifications: 2,
    active: false,
  },

  {
    name: "Estadisticas",
    href: "/areaPrivada/stats",
    icon: PackageSearch,
    notifications: false,
    active: false,
    
  },

 
 
  {
    name: "Usuarios",
    href: "/areaPrivada/users",
    icon: PackageSearch,
    notifications: false,
    active: false,
    
  },
  
   {
    name: "Formulario",
    href: "/home",
    icon: PackageSearch,
    notifications: false,
    active: false,
    
  },
] as const



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [openMenus, setOpenMenus] = React.useState<string[]>([

    
  ])
  const toggleMenu = (name: string) => {
    setOpenMenus((prev: string[]) =>
      prev.includes(name)
        ? prev.filter((item: string) => item !== name)
        : [...prev, name],
    )
  }
  return (
    <Sidebar {...props} className="bg-gray-50 dark:bg-gray-925">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3">
          
          <div className="flex items-center">
            <Image
              src="/LOGO-ALADINA-2020.png"
              alt="Intranet Logo"
              width={120}  // Ajusta según tu logo
              height={100}
              className="h-8 w-auto"
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Input
              type="search"
              placeholder="Search items..."
              className="[&>input]:sm:py-1.5"
            />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="pt-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarLink
                    href= {item.href}
                    isActive={item.active}
                    icon={item.icon}
                    notifications={item.notifications}
                  >
                    {item.name}
                  </SidebarLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="px-3">
          <Divider className="my-0 py-0" />
        </div>
        
      </SidebarContent>
      <SidebarFooter>
        <div className="border-t border-gray-200 dark:border-gray-800" />
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  )
}

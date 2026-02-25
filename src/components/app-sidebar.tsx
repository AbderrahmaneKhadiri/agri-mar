"use client"

import * as React from "react"
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  MessageSquare,
  Users,
  Settings,
  PackageOpen,
  Leaf,
  HelpCircle,
  Search,
  LogOut,
  Bell
} from "lucide-react"

import { usePathname } from "next/navigation"
import { useSession, signOut } from "@/lib/auth-client"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  FARMER_NAV_ITEMS,
  COMPANY_NAV_ITEMS,
  COMMON_FOOTER_NAV_ITEMS,
} from "@/lib/config/navigation"

export function AppSidebar({
  profileName,
  role: initialRole,
  userEmail,
  userAvatar,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  profileName?: string,
  role?: "FARMER" | "COMPANY",
  userEmail?: string | null,
  userAvatar?: string | null
}) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const role = initialRole || session?.user?.role as "FARMER" | "COMPANY" | undefined
  const rawNavItems = role === "FARMER" ? FARMER_NAV_ITEMS : COMPANY_NAV_ITEMS

  // Transform internal nav items to match Shadcn block structure
  const navMain = rawNavItems.map(item => ({
    title: item.title,
    url: item.href,
    icon: item.icon,
    isActive: pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard/farmer" && item.href !== "/dashboard/company")
  }))

  const navSecondary = COMMON_FOOTER_NAV_ITEMS.map(item => ({
    title: item.title,
    url: item.href,
    icon: item.icon
  }))

  const userData = {
    name: profileName || session?.user?.name || "Utilisateur",
    email: userEmail || session?.user?.email || "",
    avatar: userAvatar || session?.user?.image || "",
  }

  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-slate-100 shadow-sm">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-600 text-sidebar-primary-foreground">
                  <Leaf className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-slate-900 tracking-tight">AGRIMAR</span>
                  <span className="truncate text-xs text-muted-foreground font-medium uppercase tracking-widest leading-none mt-0.5">
                    {role === "FARMER" ? "Agriculteur" : "Entreprise"}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}

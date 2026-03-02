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
import { getUnreadCountsByCategoryAction } from "@/actions/notifications.actions"
import { pusherClient } from "@/lib/pusher-client"
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
  const [counts, setCounts] = React.useState({ messages: 0, requests: 0 })

  const loadCounts = React.useCallback(async () => {
    const data = await getUnreadCountsByCategoryAction()
    setCounts(data)
  }, [])

  React.useEffect(() => {
    if (session?.user?.id) {
      loadCounts()
    }
  }, [session?.user?.id, loadCounts])

  // Real-time updates via Pusher
  React.useEffect(() => {
    const userId = session?.user?.id
    if (!userId) return

    const channelName = `user-${userId}`
    const channel = pusherClient.subscribe(channelName)

    channel.bind("new-notification", (notification: any) => {
      if (notification.type === "NEW_MESSAGE") {
        setCounts(prev => ({ ...prev, messages: prev.messages + 1 }))
      } else if (["CONNECTION_REQUEST", "NEW_QUOTE"].includes(notification.type)) {
        setCounts(prev => ({ ...prev, requests: prev.requests + 1 }))
      }
    })

    channel.bind("notifications-refresh", () => {
      // Small delay to ensure DB state is stable
      setTimeout(loadCounts, 500)
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [session?.user?.id])

  const role = initialRole || session?.user?.role as "FARMER" | "COMPANY" | undefined
  const rawNavItems = role === "FARMER" ? FARMER_NAV_ITEMS : COMPANY_NAV_ITEMS

  // Transform internal nav items to match Shadcn block structure
  const navMain = rawNavItems.map(item => {
    let badge = 0
    if (item.title === "Messagerie") {
      badge = counts.messages
    }

    return {
      title: item.title,
      url: item.href,
      icon: item.icon,
      badge,
      isActive: pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard/farmer" && item.href !== "/dashboard/company")
    }
  })

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
    <Sidebar collapsible="icon" {...props} className="border-r border-slate-200 bg-white">
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="data-[slot=sidebar-menu-button]:!p-0 hover:bg-transparent active:bg-transparent"
            >
              <a href="/dashboard" className="flex items-center gap-3">
                <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-100">
                  <Leaf className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-heading font-black text-slate-900 tracking-tighter text-lg leading-none">AGRIMAR</span>
                  <span className="truncate text-[9px] text-emerald-600 font-bold uppercase tracking-[0.2em] leading-none mt-1">
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

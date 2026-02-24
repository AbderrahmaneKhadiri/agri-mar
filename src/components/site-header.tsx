"use client";

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { NotificationBell } from "./dashboard/notifications/notification-bell"

export function SiteHeader({ userId }: { userId?: string }) {
  const pathname = usePathname()

  // Extract breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(segment => segment && segment !== "dashboard")

  const getLabel = (segment: string) => {
    const labels: Record<string, string> = {
      farmer: "Agriculteur",
      company: "Entreprise",
      products: "Catalogue",
      market: "Marché",
      requests: "Demandes",
      partners: "Partenaires",
      suppliers: "Fournisseurs",
      messages: "Messagerie",
      settings: "Paramètres",
    }
    return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-white transition-[width,height] ease-linear px-4">
      <div className="flex w-full items-center gap-2">
        <SidebarTrigger className="-ml-1 text-slate-400 hover:text-slate-900" />
        <Separator
          orientation="vertical"
          className="mr-2 h-4"
        />
        <nav className="flex items-center gap-2 text-[13px] font-semibold">
          {pathSegments.length === 0 ? (
            <span className="text-slate-900">Tableau de bord</span>
          ) : (
            pathSegments.map((segment, index) => (
              <div key={segment} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="size-3 text-slate-400" />}
                <span className={index === pathSegments.length - 1 ? "text-slate-900" : "text-slate-400"}>
                  {getLabel(segment)}
                </span>
              </div>
            ))
          )}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <NotificationBell userId={userId} />
        </div>
      </div>
    </header>
  )
}

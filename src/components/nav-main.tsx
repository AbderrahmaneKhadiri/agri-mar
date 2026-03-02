"use client"

import Link from "next/link"
import { type LucideIcon, Plus, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    badge?: number | string
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-black text-slate-900/40 uppercase tracking-[0.2em] mb-4 px-4">
        MENU PRINCIPAL
      </SidebarGroupLabel>
      <SidebarMenu className="gap-2 px-2">


        <div className="space-y-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={item.isActive}
                className="data-[active=true]:bg-emerald-50/80 data-[active=true]:text-emerald-700 h-12 rounded-xl px-4 transition-all hover:bg-slate-50 border-0 group/menu-item"
              >
                <Link href={item.url} className="flex items-center gap-3">
                  {item.icon && <item.icon strokeWidth={item.isActive ? 2.5 : 2} className={item.isActive ? "size-5 text-emerald-600" : "size-5 text-slate-600 group-hover/menu-item:text-slate-900 transition-colors"} />}
                  <span className={item.isActive ? "font-bold text-[13px] tracking-tight text-slate-900" : "font-bold text-[13px] text-slate-700 group-hover/menu-item:text-slate-900 transition-colors"}>
                    {item.title}
                  </span>
                  {typeof item.badge === "number" && item.badge > 0 && (
                    <span className={cn(
                      "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold transition-all",
                      item.isActive ? "bg-emerald-600 text-white" : "bg-emerald-600 text-white"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </div>
      </SidebarMenu>
    </SidebarGroup>
  )
}

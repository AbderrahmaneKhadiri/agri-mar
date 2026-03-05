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
  groups,
}: {
  groups: {
    title: string
    items: {
      title: string
      url: string
      icon?: LucideIcon
      isActive?: boolean
      badge?: number | string
    }[]
  }[]
}) {
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <SidebarGroup key={group.title} className="p-0 px-2">
          <SidebarGroupLabel className="text-[10px] font-black text-slate-900/40 uppercase tracking-[0.2em] mb-2 px-4 h-auto">
            {group.title}
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {group.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={item.isActive}
                  className="data-[active=true]:bg-[#f0f8f4] data-[active=true]:text-[#2c5f42] h-10 rounded-xl px-4 transition-all hover:bg-slate-50 border-0 group/menu-item"
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    {item.icon && <item.icon strokeWidth={item.isActive ? 2.5 : 2} className={item.isActive ? "size-4.5 text-[#2c5f42]" : "size-4.5 text-slate-600 group-hover/menu-item:text-slate-900 transition-colors"} />}
                    <span className={item.isActive ? "font-bold text-[12.5px] tracking-tight text-slate-900" : "font-bold text-[12.5px] text-slate-700 group-hover/menu-item:text-slate-900 transition-colors"}>
                      {item.title}
                    </span>
                    {typeof item.badge === "number" && item.badge > 0 && (
                      <span className={cn(
                        "ml-auto flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[9px] font-bold transition-all bg-[#4a8c5c] text-white"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </div>
  )
}

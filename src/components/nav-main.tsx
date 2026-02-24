"use client"

import Link from "next/link"
import { type LucideIcon, Plus, Mail } from "lucide-react"

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
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] mb-2 px-2">
        Menu Principal
      </SidebarGroupLabel>
      <SidebarMenu className="gap-2 px-2">


        <div className="space-y-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={item.isActive}
                className="data-[active=true]:bg-slate-100/60 data-[active=true]:text-slate-900 h-11 rounded-lg px-4 transition-all hover:bg-slate-50 border-0"
              >
                <Link href={item.url}>
                  {item.icon && <item.icon className={item.isActive ? "size-5 text-slate-900" : "size-5 text-slate-400"} />}
                  <span className={item.isActive ? "font-bold text-[13px] text-slate-900" : "font-semibold text-[13px] text-slate-500"}>
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </div>
      </SidebarMenu>
    </SidebarGroup>
  )
}

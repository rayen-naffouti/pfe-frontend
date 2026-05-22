"use client"

import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { MinotaurLogo } from "./MinotaurLogo"
import {
  LayoutDashboard,
  Key,
  Users,
  Bell,
  Settings,
  Zap,
  Code,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { clearAuthSession } from "@/lib/auth"

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/licenses", icon: Key, label: "Licenses" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/automation", icon: Zap, label: "Automation" },
  { href: "/admin/notifications", icon: Bell, label: "Notifications" },
  { href: "/admin/api-console", icon: Code, label: "API Console" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
]

export function AdminSidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-50 transition-all duration-300 flex flex-col",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div
          className={cn("p-4 border-b border-sidebar-border flex items-center", collapsed ? "justify-center" : "gap-3")}
        >
          <MinotaurLogo size="sm" glowing />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-foreground glow-text">MINOTAUR</span>
              <span className="text-xs text-muted-foreground">License Management</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/")
            const NavLink = (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary glow-blue"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover border-border">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }
            return NavLink
          })}
        </nav>

        <div className="p-2 border-t border-sidebar-border space-y-1">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                to="/login"
                onClick={clearAuthSession}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200",
                  collapsed && "justify-center",
                )}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">Logout</span>}
              </Link>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-popover border-border">
                Logout
              </TooltipContent>
            )}
          </Tooltip>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span className="ml-2 text-sm">Collapse</span>}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}

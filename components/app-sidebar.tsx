"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Star,
  Tag,
  Settings,
  User,
  LogOut,
} from "lucide-react"
import { logoutUser } from "@/lib/firebase-auth"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { useAuthState } from "react-firebase-hooks/auth"

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Profile Score",
    href: "/dashboard/profile-score",
    icon: Star,
  },
  {
    label: "Keywords",
    href: "/dashboard/keywords",
    icon: Tag,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user] = useAuthState(auth)

  async function handleLogout() {
    await logoutUser()
    router.push("/login")
  }

  return (
    <Sidebar>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <span
          className="text-lg font-semibold tracking-tight text-gradient"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          Upvik
        </span>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground/60 uppercase tracking-widest px-3 mb-1">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={
                        isActive
                          ? "text-primary bg-primary/10 border border-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — logged in user + logout */}
      <SidebarFooter className="border-t border-border p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-secondary/60 mb-2">
          {/* Avatar */}
          <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-primary">
              {user?.email?.charAt(0).toUpperCase() ?? "U"}
            </span>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {user?.displayName ?? "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email ?? ""}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Log out</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
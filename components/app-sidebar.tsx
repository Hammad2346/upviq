"use client"

import Link from "next/link"
import Image from "next/image"
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
    <Sidebar className="bg-white border-r border-border">

      <div className="px-4 h-14 border-b border-border flex items-center justify-center gap-3">
        <Image
          src="/UPVIQlogo.png"
          alt="Upviq Logo"
          width={32}
          height={32}
          className="h-8 w-8 shrink-0"
        />
        <span
          className="text-lg font-bold tracking-tight text-primary"
          style={{ fontFamily: "Arial, sans-serif", letterSpacing: "-0.02em" }}
        >
          UPVIQ
        </span>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2 mt-2">
            Workspace
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
                      className={`
                        h-10 rounded-lg px-3 transition-all duration-200
                        ${
                          isActive
                            ? "bg-accent text-accent-foreground font-semibold border border-primary/20 shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-gray-100"
                        }
                      `}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="text-sm font-bold">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">

        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-accent/50 border border-primary/10 mb-3">
          <div className="h-9 w-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 flex-none">
            <span className="text-xs font-bold text-primary">
              {user?.email?.charAt(0).toUpperCase() ?? "U"}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {user?.displayName ?? "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email ?? ""}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Log out</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
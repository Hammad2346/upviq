"use client"

import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Bell, Search } from "lucide-react"

const placeholderNotifications = [
  {
    id: 1,
    title: "Profile score updated",
    description: "Your score improved by 12 points",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    title: "New keyword suggestion",
    description: "3 new high-value keywords found",
    time: "1h ago",
    unread: true,
  },
  {
    id: 3,
    title: "Weekly report ready",
    description: "Your weekly summary is available",
    time: "1d ago",
    unread: false,
  },
]

export function DashboardHeader() {
  const [engineLive,setEngineLive]=useState(true)
  const [notifOpen, setNotifOpen] = useState(false)
  const [search, setSearch] = useState("")

  const unreadCount = placeholderNotifications.filter((n) => n.unread).length

  return (
    <header className="h-14 border-b border-border flex items-center gap-3 px-4 bg-card/60 backdrop-blur-sm sticky top-0 z-10">

      {/* Sidebar trigger */}
      <SidebarTrigger className="text-muted-foreground hover:text-foreground shrink-0" />

      {/* Search bar */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-1 focus-visible:border-primary/60 text-sm"
        />
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">

        {/* Engine status badge */}
        <Badge
          variant="outline"
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border select-none ${
            engineLive
              ? "border-green-500/30 text-green-400 bg-green-500/10"
              : "border-red-500/30 text-red-400 bg-red-500/10"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                engineLive ? "bg-green-400" : "bg-red-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                engineLive ? "bg-green-400" : "bg-red-400"
              }`}
            />
          </span>
          Engine {engineLive ? "Live" : "Offline"}
        </Badge>

        {/* Bell with notification popover */}
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-80 p-0 bg-card border-border shadow-lg"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span
                className="text-sm font-semibold text-foreground"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-xs text-primary">{unreadCount} unread</span>
              )}
            </div>

            <div className="divide-y divide-border">
              {placeholderNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 hover:bg-secondary/60 transition-colors cursor-pointer ${
                    n.unread ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {n.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground/60 shrink-0 mt-0.5">
                      {n.time}
                    </span>
                  </div>
                  {n.unread && (
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  )}
                </div>
              ))}
            </div>

            <div className="px-4 py-2.5 border-t border-border">
              <button
                type="button"
                className="text-xs text-primary hover:text-primary/80 transition-colors w-full text-center"
              >
                View all notifications
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
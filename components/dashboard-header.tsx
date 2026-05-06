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
import SearchCommand from "./header/search-bar"

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
  const [engineLive, setEngineLive] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [search, setSearch] = useState("")

  const unreadCount = placeholderNotifications.filter((n) => n.unread).length

  return (
    <header className="h-14 border-b border-border flex items-center gap-3 px-4 bg-background sticky top-0 z-10">

      <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-gray-300 shrink-0" />

      <SearchCommand />

      <div className="ml-auto flex items-center gap-3">
  
        <Badge
          variant="outline"
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border select-none transition-all ${
            engineLive
              ? "border-primary/30 text-primary bg-primary/5"
              : "border-destructive/30 text-destructive bg-destructive/5"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                engineLive ? "bg-primary" : "bg-destructive"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                engineLive ? "bg-primary" : "bg-destructive"
              }`}
            />
          </span>
          Engine {engineLive ? "Live" : "Offline"}
        </Badge>


        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors"
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
            className="w-80 p-0 bg-white border-border shadow-lg"
          >

            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span
                className="text-sm font-bold text-foreground"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-xs font-semibold text-primary">{unreadCount} unread</span>
              )}
            </div>

            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {placeholderNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                    n.unread ? "bg-primary/3" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
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

            <div className="px-4 py-3 border-t border-border bg-gray-50">
              <button
                type="button"
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors w-full text-center"
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
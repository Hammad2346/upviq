"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { AnalyzeProvider } from "@/contexts/analyze-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AnalyzeProvider>
        <DashboardHeader />
        <main className="flex-1 p-0 lg:p-6">
          {children}
        </main>
        </AnalyzeProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
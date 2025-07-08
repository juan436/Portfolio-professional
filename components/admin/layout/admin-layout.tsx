"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, LogOut } from "lucide-react"
import { logout, redirectToLogin } from "@/services/client/logout"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout();
      redirectToLogin();
    } catch (error) {
      redirectToLogin();
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="bg-black/80 backdrop-blur-md border-b border-blue-700/20 sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/admin/dashboard?tab=projects" className="flex items-center">
              <span className="font-bold text-xl">Panel Administrativo</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-slate-300 hover:text-blue-500">
              <Link href="/" target="_blank">
                <Home className="mr-2 h-4 w-4" />
                Ver Sitio
              </Link>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout} 
              className="text-slate-300 hover:text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}

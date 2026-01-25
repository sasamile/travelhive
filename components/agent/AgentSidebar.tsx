"use client";

import { LogOut, Shield, User } from 'lucide-react'
import type { NavItem } from './data'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'

type AgentSidebarProps = {
  navItems: NavItem[]
}

export function AgentSidebar({ navItems }: AgentSidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/sign-out");
      localStorage.removeItem("auth_token");
      router.push("/auth/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Aún así redirigir al login
      localStorage.removeItem("auth_token");
      router.push("/auth/login");
    }
  };
  return (
    <aside className="w-72 bg-white dark:bg-[#242424] border-r border-gray-100 dark:border-gray-800 flex flex-col h-full shrink-0">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
            <Shield className="size-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">Viatge</span>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <div className="p-4 mb-6 bg-background-light dark:bg-[#1a1a1a] rounded-xl flex items-center gap-3 border border-gray-100 dark:border-gray-800">
          <div
            className="size-10 rounded-full bg-cover bg-center"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAobP5ta5rHnkGzYzITiqYbGDZolaZhS8soO3mRj9_7b1Ys-MbLZWMFQ191nhdt8ZHv3f74jCAHdwgI761qdqC_5QV0zuIe5JTN4x1kbTzv7G91hdF2J2j6xc96C4dfvW2ExW_OJFtlh78Qz6rqdtsbTisiE5Asd7p-h3ukv-fxmDAk6gpHGMB3AlD41v-ln7vbVL29XA-gbTgW_KFeME9ov5qw2JxI19SkMerQ4qvgdmuXyGP8sX4cFzBnct_byloSrbra6UEBaXUN")',
            }}
            aria-label="Retrato de un agente de viajes profesional"
            role="img"
          />
          <div>
            <p className="text-sm font-bold">Julián Rivera</p>
            <p className="text-xs text-[#657f81]">Agente Premium</p>
          </div>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <a
              key={item.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                item.isActive
                  ? 'bg-background-light dark:bg-[#1a1a1a] text-primary border-r-2 border-primary'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-[#657f81] hover:text-primary'
              }`}
              href="#"
            >
              <Icon className="size-4" />
              <span className="text-sm font-semibold">{item.label}</span>
              {item.badge ? (
                <span className="ml-auto bg-accent-peach text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </a>
          )
        })}
      </nav>
      <div className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <a className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-[#657f81] transition-all" href="#">
          <User className="size-4" />
          <span className="text-sm font-medium">Mi Perfil</span>
        </a>
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-50 text-red-400 transition-all"
        >
          <LogOut className="size-4" />
          <span className="text-sm font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}

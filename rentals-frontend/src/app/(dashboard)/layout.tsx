"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Home, Users, ScrollText, Settings2, ChevronLeft, ChevronRight, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/",            label: "Dashboard",    icon: LayoutDashboard },
  { href: "/rentals",     label: "Propiedades",  icon: Home },
  { href: "/tenants",     label: "Inquilinos",   icon: Users },
  { href: "/contracts",   label: "Contratos",    icon: ScrollText },
  { href: "/settings",    label: "Personalización",icon: Settings2 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [userName, setUserName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); return; }
    setUserName(localStorage.getItem("userName") || "Usuario");
    setReady(true);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    router.replace("/login");
  };

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col justify-between border-r transition-all duration-300 shrink-0 ${sidebarOpen ? "w-64" : "w-[72px]"}`}
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <div>
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "var(--color-border)" }}>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}>
              <span className="text-base font-bold text-white">R</span>
            </div>
            {sidebarOpen && <span className="text-lg font-bold text-white tracking-tight">RentCote</span>}
          </div>

          {/* Nav */}
          <nav className="mt-4 px-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon as any;
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "text-white"
                      : "text-[var(--color-muted)] hover:text-white"
                  }`}
                  style={active ? { background: "var(--color-primary)", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" } : { }}
                >
                  <Icon className="w-5 h-5" />
                  {sidebarOpen && item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="px-3 pb-4 space-y-2">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-[var(--color-muted)] hover:text-white transition-all"
            style={{ background: "var(--color-surface-light)" }}>
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            {sidebarOpen && "Contraer"}
          </button>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "var(--color-surface-light)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-info))" }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <button onClick={logout} className="text-xs text-[var(--color-danger)] hover:underline">Cerrar sesión</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

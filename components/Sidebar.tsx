"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Route,
  BarChart3,
  AlertTriangle,
  Gauge,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vehicles", label: "Veículos", icon: Car },
  { href: "/trips", label: "Viagens", icon: Route },
  { href: "/analytics", label: "Análises", icon: BarChart3 },
  { href: "/anomalies", label: "Anomalias", icon: AlertTriangle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
          <Gauge className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <span className="text-sm font-semibold text-foreground leading-none block">VehicleIQ</span>
          <span className="text-xs text-muted-foreground">Telemetria</span>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        <p className="px-2 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
          Navegação
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Base:{" "}
          <span className="font-mono text-foreground/70 text-[11px] break-all">
            {process.env.NEXT_PUBLIC_API_URL ?? "localhost:8000"}
          </span>
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-sidebar border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary">
            <Gauge className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">VehicleIQ</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 flex flex-col w-64 bg-sidebar border-r border-border h-full">
            <NavContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-sidebar border-r border-border h-screen sticky top-0 shrink-0">
        <NavContent />
      </aside>
    </>
  );
}

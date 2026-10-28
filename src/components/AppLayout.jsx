import { Link } from "@tanstack/react-router";
import {
  Droplet,
  Droplets,
  GraduationCap,
  HeartPulse,
  LayoutDashboard,
  Leaf,
  LogOut,
  Utensils,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Overview", short: "Home", icon: LayoutDashboard },
  { to: "/food", label: "Food rescue", short: "Food", icon: Utensils },
  { to: "/care", label: "Care circle", short: "Care", icon: HeartPulse },
  { to: "/fixes", label: "Street fixes", short: "Streets", icon: Wrench },
  { to: "/blood", label: "Blood donors", short: "Blood", icon: Droplet },
  { to: "/water", label: "Water supply", short: "Water", icon: Droplets },
  { to: "/tuition", label: "Free tuition", short: "Tuition", icon: GraduationCap },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const initials = (user?.full_name || user?.email || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="h-4.5 w-4.5" strokeWidth={2.2} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Common Ground</span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "bg-primary/10 text-primary" }}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="hidden xl:inline">{item.label}</span>
                <span className="sr-only xl:hidden">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
              {initials || "?"}
            </span>
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pt-8 pb-28 sm:px-8 md:pb-16">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
        <div className="no-scrollbar mx-auto flex max-w-md items-stretch justify-between overflow-x-auto px-1 py-1.5">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[0.64rem] font-medium text-muted-foreground"
              activeProps={{ className: "text-primary" }}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.short}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
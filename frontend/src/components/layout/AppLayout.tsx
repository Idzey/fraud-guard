import { Activity, BrainCircuit, Database, LayoutDashboard, ShieldCheck, Sparkles } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navigation = [
  { title: "Обзор", href: "/", icon: LayoutDashboard },
  { title: "Датасет", href: "/dataset", icon: Database },
  { title: "Модели", href: "/models", icon: BrainCircuit },
  { title: "Предсказание", href: "/predict", icon: ShieldCheck },
];

function NavigationItems({ mobile = false }: { mobile?: boolean }) {
  return (
    <>
      {navigation.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          end={item.href === "/"}
          className={({ isActive }) =>
            cn(
              mobile
                ? "grid place-items-center gap-1 px-1 py-1.5 text-[10px] text-[var(--text-4)]"
                : "group flex min-h-9 items-center gap-2.5 rounded-md border border-transparent px-2.5 text-sm font-medium text-[var(--text-3)] transition-colors hover:bg-white/[0.025] hover:text-[var(--text-2)]",
              isActive &&
                (mobile
                  ? "text-foreground"
                  : "border-white/[0.05] bg-white/[0.045] text-foreground"),
            )
          }
        >
          <item.icon className="size-4 shrink-0" />
          <span className={mobile ? "" : "sidebar-label"}>{item.title}</span>
        </NavLink>
      ))}
    </>
  );
}

export function AppLayout() {
  return (
    <div className="app-shell">
      <div className="app-grid">
        <aside className="app-sidebar">
          <NavLink to="/" className="flex h-10 items-center gap-2.5 px-2">
            <div className="grid size-7 place-items-center rounded-md border border-primary/35 bg-[linear-gradient(180deg,rgba(113,112,255,.16),rgba(25,180,122,.08))] text-[13px] font-semibold">
              FG
            </div>
            <div className="sidebar-label min-w-0">
              <div className="text-sm font-semibold text-foreground">FraudGuard ML</div>
              <div className="sidebar-subtitle mt-0.5 text-[11px] leading-none text-[var(--text-4)]">
                Risk analytics dashboard
              </div>
            </div>
          </NavLink>

          <nav className="grid w-full gap-1" aria-label="Основная навигация">
            <NavigationItems />
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between gap-4 border-b border-white/[0.05] bg-[#08090a]/90 px-4 backdrop-blur md:px-6">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground md:hidden">FraudGuard ML</div>
              <div className="hidden min-w-0 items-center gap-2 text-[13px] text-[var(--text-3)] md:flex">
                <span className="size-[7px] shrink-0 rounded-full bg-[var(--normal)]" />
                <span className="truncate">Backend подключен</span>
                <Badge>Dataset CSV</Badge>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Badge variant="warning" className="hidden sm:inline-flex">
                <Activity className="size-3" />
                Training по запросу
              </Badge>
              <Badge>
                <Sparkles className="size-3" />
                Random Forest · XGBoost · CatBoost
              </Badge>
            </div>
          </header>

          <main className="app-content">
            <Outlet />
          </main>
        </div>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid h-[62px] grid-cols-4 border-t border-border bg-[#08090a]/95 backdrop-blur md:hidden"
        aria-label="Мобильная навигация"
      >
        <NavigationItems mobile />
      </nav>
    </div>
  );
}

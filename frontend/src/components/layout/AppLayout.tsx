import {
  Activity,
  BrainCircuit,
  Database,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navigation = [
  { title: "Обзор", href: "/", icon: LayoutDashboard },
  { title: "Датасет", href: "/dataset", icon: Database },
  { title: "Модели", href: "/models", icon: BrainCircuit },
  { title: "Предсказание", href: "/predict", icon: ShieldCheck },
];

export function AppLayout() {
  return (
    <div className="app-surface min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-border/70 bg-background/50 px-4 py-4 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-5">
          <div className="flex items-center justify-between lg:block">
            <NavLink to="/" className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <div className="text-base font-semibold">FraudGuard ML</div>
                <div className="text-xs text-muted-foreground">Риск банковских транзакций</div>
              </div>
            </NavLink>
            <Badge variant="success" className="lg:mt-5">
              API активно
            </Badge>
          </div>

          <nav className="mt-4 grid grid-cols-2 gap-2 lg:mt-8 lg:grid-cols-1">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/"}
                className={({ isActive }) =>
                  cn(
                    "group flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                    isActive && "bg-primary/15 text-primary ring-1 ring-primary/30",
                  )
                }
              >
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex min-h-16 items-center justify-between border-b border-border/70 bg-background/35 px-4 backdrop-blur md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Activity className="size-5 text-primary" />
              <span className="truncate text-sm text-muted-foreground">
                ML-мониторинг банковских транзакций
              </span>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <Sparkles className="size-4 text-accent" />
              <span className="text-sm text-muted-foreground">Random Forest · XGBoost · CatBoost</span>
            </div>
          </header>

          <main className="px-4 py-6 md:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

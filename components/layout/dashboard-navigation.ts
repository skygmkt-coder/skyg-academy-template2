import type { ComponentType } from "react";
import {
  BookOpen,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Package,
  Settings
} from "lucide-react";

import type { Profile } from "@/lib/engines/auth/types";

export type DashboardNavItem = {
  href: string;
  label: string;
  description?: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

export type DashboardNavGroup = {
  label: string;
  items: DashboardNavItem[];
};

export function getDashboardNavigation(profile: Profile): DashboardNavGroup[] {
  const learningGroup: DashboardNavGroup = {
    label: "Aprendizaje",
    items: [
      {
        href: "/mis-productos",
        label: "Mis productos",
        description: "Cursos y accesos activos",
        icon: GraduationCap
      }
    ]
  };

  if (profile.role !== "admin") {
    return [learningGroup];
  }

  return [
    {
      label: "Administracion",
      items: [
        {
          href: "/admin",
          label: "Dashboard",
          description: "Vista general",
          icon: LayoutDashboard
        },
        {
          href: "/admin/cursos",
          label: "Cursos",
          description: "Contenido y alumnos",
          icon: BookOpen
        },
        {
          href: "/admin/productos",
          label: "Productos",
          description: "Catalogo legacy",
          icon: Package
        },
        {
          href: "/admin/pagos",
          label: "Pagos",
          description: "Comprobantes manuales",
          icon: CreditCard
        }
      ]
    },
    learningGroup,
    {
      label: "Sistema",
      items: [
        {
          href: "/admin/cursos",
          label: "Configuracion",
          description: "Base SaaS",
          icon: Settings
        }
      ]
    }
  ];
}

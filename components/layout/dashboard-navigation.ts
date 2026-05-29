import type { Profile } from "@/lib/engines/auth/types";

export type DashboardNavIcon = "bot" | "book" | "credit-card" | "graduation-cap" | "layout-dashboard" | "package" | "rocket" | "settings";

export type DashboardNavItem = {
  href: string;
  label: string;
  description?: string;
  icon: DashboardNavIcon;
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
        icon: "graduation-cap"
      },
      {
        href: "/onboarding",
        label: "Onboarding",
        description: "Setup guiado",
        icon: "rocket"
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
          icon: "layout-dashboard"
        },
        {
          href: "/admin/cursos",
          label: "Cursos",
          description: "Contenido y alumnos",
          icon: "book"
        },
        {
          href: "/admin/productos",
          label: "Productos",
          description: "Catalogo legacy",
          icon: "package"
        },
        {
          href: "/admin/pagos",
          label: "Pagos",
          description: "Comprobantes manuales",
          icon: "credit-card"
        },
        {
          href: "/admin/crm",
          label: "AI CRM",
          description: "Leads y automatizaciones",
          icon: "bot"
        }
      ]
    },
    learningGroup,
    {
      label: "Sistema",
      items: [
        {
          href: "/admin/settings",
          label: "Configuracion",
          description: "Workspace y marca",
          icon: "settings"
        }
      ]
    }
  ];
}

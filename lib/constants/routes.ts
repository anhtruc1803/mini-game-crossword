/** Centralized route definitions to avoid magic strings. */

export const ROUTES = {
  home: "/",
  viewer: (slug: string) => `/${slug}`,

  admin: {
    login: "/admin/login",
    programs: "/admin/programs",
    newProgram: "/admin/programs/new",
    program: (id: string) => `/admin/programs/${id}`,
    theme: (id: string) => `/admin/programs/${id}/theme`,
    game: (id: string) => `/admin/programs/${id}/game`,
    rows: (id: string) => `/admin/programs/${id}/rows`,
  },

  api: {
    health: "/api/health",
  },
} as const;

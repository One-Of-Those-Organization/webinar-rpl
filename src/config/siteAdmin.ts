export type SiteConfig = typeof siteConfig;

// Navigation items for the site

export const siteConfig = {
  navMenuItems: [
    {
      label: "Dashboard",
      href: "/admin",
    },
    {
      label: "User",
      href: "/admin/user",
    },
    {
      label: "Webinar",
      href: "/admin/webinar",
    },
  ],
  links: {},
};

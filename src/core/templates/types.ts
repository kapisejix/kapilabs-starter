export type KapiLayout =
  | "content-sidebar"
  | "sidebar-content"
  | "content-sidebar-sidebar"
  | "sidebar-sidebar-content"
  | "sidebar-content-sidebar"
  | "full-width-content"
  | "blank"
  | "centered";

export type KapiLayoutConfig = {
  layout: KapiLayout;
  containerWidth?: string;
  contentWidth?: string;
  sidebarWidth?: string;
  sidebarSticky?: boolean;
  gap?: string;
  padding?: string;
  background?: string;
};

export const defaultLayout: KapiLayout = "content-sidebar";

export const defaultLayoutConfig: KapiLayoutConfig = {
  layout: defaultLayout,
  containerWidth: "1200px",
  contentWidth: "760px",
  sidebarWidth: "320px",
  sidebarSticky: true,
  gap: "24px",
  padding: "0",
};

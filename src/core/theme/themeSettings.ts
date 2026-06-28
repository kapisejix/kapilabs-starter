import type { KapiLayout } from "../templates/types";

export type KapiThemeSettings = {
  defaultLayout: KapiLayout;
  blogLayout: KapiLayout;
  archiveLayout: KapiLayout;
  singlePostLayout: KapiLayout;
  footerColumns: 1 | 2 | 3 | 4;
  headerMode: "standard" | "centered" | "split";
  logoPosition: "left" | "center";
};

export const themeSettings: KapiThemeSettings = {
  defaultLayout: "content-sidebar",
  blogLayout: "content-sidebar",
  archiveLayout: "content-sidebar",
  singlePostLayout: "content-sidebar",
  footerColumns: 3,
  headerMode: "standard",
  logoPosition: "left",
};



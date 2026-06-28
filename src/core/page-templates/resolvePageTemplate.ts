import DefaultPage from "./DefaultPage.astro";
import LandingPage from "./LandingPage.astro";
import SimplePage from "./SimplePage.astro";

export function resolvePageTemplate(template?: string) {
  if (template === "landing") return LandingPage;
  if (template === "simple") return SimplePage;

  return DefaultPage;
}


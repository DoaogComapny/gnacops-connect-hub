import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const DynamicSiteConfig = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    // Update page title
    if (settings.siteName) {
      document.title = `${settings.siteName} - ${settings.tagline || "Ghana National Council of Private Schools"}`;
    }

    // Update favicon
    if (settings.faviconUrl) {
      const favicon = document.querySelector("#dynamic-favicon") as HTMLLinkElement;
      if (favicon) {
        favicon.href = settings.faviconUrl;
      }
    }

    // Update meta tags
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta && settings.tagline) {
      descriptionMeta.setAttribute('content', settings.tagline);
    }

    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (ogTitleMeta && settings.siteName) {
      ogTitleMeta.setAttribute('content', `${settings.siteName} - ${settings.tagline || ""}`);
    }
  }, [settings]);

  return null; // This component doesn't render anything
};

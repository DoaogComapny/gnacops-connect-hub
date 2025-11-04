import { useSiteSettings } from "@/hooks/useSiteSettings";

export const AdminSidebarHeader = () => {
  const { settings } = useSiteSettings();

  return (
    <div className="p-4 border-b border-card-border">
      {settings.logoUrl ? (
        <img 
          src={settings.logoUrl} 
          alt={settings.siteName || "GNACOPS"} 
          className="h-10 w-auto object-contain mb-2" 
        />
      ) : (
        <h2 className="text-xl font-bold text-gradient-accent">
          {settings.siteName || "GNACOPS"} Admin
        </h2>
      )}
      <p className="text-sm text-muted-foreground">Control Panel</p>
    </div>
  );
};

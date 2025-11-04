import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
export interface SiteSettings {
  siteName?: string;
  tagline?: string;
  logoUrl?: string;
  faviconUrl?: string;
  aboutText?: string;
  paymentProvider?: string;
  paymentApiKey?: string;
  paymentPublicKey?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  aboutSectionTitle?: string;
  aboutSectionText?: string;
  foundingYear?: number;
  memberships?: {
    institutional?: { title: string; description: string; price: string };
    teacher?: { title: string; description: string; price: string };
    parent?: { title: string; description: string; price: string };
    proprietor?: { title: string; description: string; price: string };
    serviceProvider?: { title: string; description: string; price: string };
    nonTeachingStaff?: { title: string; description: string; price: string };
  };
  howItWorks?: Array<{ title: string; description: string }>;
  footer?: { email: string; phone: string; address: string };
  aboutPage?: {
    title: string;
    intro: string;
    mission: { title: string; text: string };
    vision: { title: string; text: string };
    values: { title: string; items: string[] };
  };
  contactPage?: { title: string; email: string; phone: string; address: string };
  smtp?: {
    host: string;
    port: number;
    user: string;
    password: string;
    fromEmail: string;
    fromName: string;
  };
}

export const useSiteSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("settings_data")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return (data?.settings_data as SiteSettings) || {};
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: SiteSettings) => {
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("site_settings")
          .update({ settings_data: newSettings as any })
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert([{ settings_data: newSettings as any }]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({
        title: "Settings Saved",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save settings: " + error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('site_settings_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['site-settings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    settings: settings || {},
    isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
};

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditablePage {
  id: string;
  page_key: string;
  title: string;
  slug: string;
  is_published: boolean;
}

interface PageBlock {
  id: string;
  page_id: string;
  block_type: string;
  block_data: Record<string, any>;
  position: number;
}

export const useEditablePage = (pageKey: string, requirePublished = true) => {
  const [page, setPage] = useState<EditablePage | null>(null);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPage();
  }, [pageKey]);

  const fetchPage = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch page
      let pageQuery = supabase
        .from("editable_pages")
        .select("*")
        .eq("page_key", pageKey);

      if (requirePublished) {
        pageQuery = pageQuery.eq("is_published", true);
      }

      const { data: pageData, error: pageError } = await pageQuery.single();

      if (pageError) throw pageError;
      setPage(pageData);

      // Fetch blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from("page_blocks")
        .select("*")
        .eq("page_id", pageData.id)
        .order("position", { ascending: true });

      if (blocksError) throw blocksError;
      setBlocks((blocksData || []) as PageBlock[]);
    } catch (err: any) {
      console.error("Error fetching page:", err);
      setError(err.message || "Failed to load page");
      toast.error("Failed to load page");
    } finally {
      setIsLoading(false);
    }
  };

  return { page, blocks, isLoading, error };
};
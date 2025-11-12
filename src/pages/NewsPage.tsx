import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Newspaper } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  published_at: string | null;
}

const NewsPage = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false, nullsFirst: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching news articles:", error);
      toast.error("Failed to load news articles");
    } finally {
      setIsLoading(false);
    }
  };

  const getPreviewText = (content: string, excerpt: string | null) => {
    if (excerpt) return excerpt;
    return content.length > 150 ? `${content.slice(0, 150)}...` : content;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-5xl font-bold mb-4 text-center text-gradient-accent">Latest News</h1>
          <p className="text-xl text-center text-muted-foreground mb-12">
            Stay updated with our latest announcements
          </p>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <Newspaper className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">No news articles available at this time</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.map((article) => (
                <Card
                  key={article.id}
                  className="hover-glow hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-card/80 to-card overflow-hidden"
                >
                  {article.image_url && (
                    <div className="w-full h-56 overflow-hidden">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    {article.published_at && (
                      <Badge variant="secondary" className="w-fit mb-2">
                        {format(new Date(article.published_at), "MMM dd, yyyy")}
                      </Badge>
                    )}
                    <CardTitle className="text-2xl">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {getPreviewText(article.content, article.excerpt)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NewsPage;
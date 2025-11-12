import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlayCircle, Tv } from "lucide-react";
import { toast } from "sonner";

interface Video {
  id: string;
  title: string;
  video_url: string;
  description: string | null;
  thumbnail_url: string | null;
}

const EducationTVPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("education_tv_videos")
        .select("*")
        .eq("is_published", true)
        .order("position", { ascending: true });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Failed to load videos");
    } finally {
      setIsLoading(false);
    }
  };

  const getEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be")
        ? url.split("youtu.be/")[1]
        : new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Vimeo
    if (url.includes("vimeo.com")) {
      const videoId = url.split("vimeo.com/")[1];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    // Direct video URL
    return url;
  };

  const isEmbeddable = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-5xl font-bold mb-4 text-center text-gradient-accent">Education TV</h1>
          <p className="text-xl text-center text-muted-foreground mb-12">
            Watch our educational videos
          </p>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20">
              <Tv className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">No videos available at this time</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <Card
                  key={video.id}
                  className="hover-glow hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-card/80 to-card overflow-hidden cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative w-full h-48 bg-muted">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PlayCircle className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <PlayCircle className="h-16 w-16 text-white" />
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{video.title}</CardTitle>
                  </CardHeader>
                  {video.description && (
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2">{video.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedVideo && (
            <div>
              <div className="relative w-full aspect-video bg-black">
                {isEmbeddable(selectedVideo.video_url) ? (
                  <iframe
                    src={getEmbedUrl(selectedVideo.video_url)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={selectedVideo.video_url}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>
              <div className="p-6 bg-background">
                <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
                {selectedVideo.description && (
                  <p className="text-muted-foreground">{selectedVideo.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EducationTVPage;
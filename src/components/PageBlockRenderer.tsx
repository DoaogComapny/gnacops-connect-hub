import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PageBlock {
  id: string;
  block_type: string;
  block_data: Record<string, any>;
  position: number;
}

interface PageBlockRendererProps {
  blocks: PageBlock[];
}

const PageBlockRenderer = ({ blocks }: PageBlockRendererProps) => {
  const renderBlock = (block: PageBlock) => {
    const { block_type, block_data } = block;

    switch (block_type) {
      case "text":
        return (
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {block_data.content}
            </p>
          </div>
        );

      case "title":
        return (
          <h2 className="text-4xl font-bold text-gradient-accent mb-6">
            {block_data.text}
          </h2>
        );

      case "image":
        return (
          <div className="rounded-2xl overflow-hidden border border-card-border">
            <img
              src={block_data.url}
              alt={block_data.alt || "Image"}
              className="w-full h-auto"
            />
          </div>
        );

      case "video":
        if (block_data.url.includes("youtube.com") || block_data.url.includes("youtu.be")) {
          const videoId = block_data.url.includes("youtu.be")
            ? block_data.url.split("youtu.be/")[1]
            : new URL(block_data.url).searchParams.get("v");
          return (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        } else if (block_data.url.includes("vimeo.com")) {
          const videoId = block_data.url.split("vimeo.com/")[1];
          return (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
              <iframe
                src={`https://player.vimeo.com/video/${videoId}`}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        } else {
          return (
            <video controls className="w-full rounded-2xl">
              <source src={block_data.url} />
            </video>
          );
        }

      case "button":
        if (block_data.link.startsWith("http")) {
          return (
            <a href={block_data.link} target="_blank" rel="noopener noreferrer">
              <Button variant="hero" className="hover-glow">
                {block_data.text}
              </Button>
            </a>
          );
        }
        return (
          <Link to={block_data.link}>
            <Button variant="hero" className="hover-glow">
              {block_data.text}
            </Button>
          </Link>
        );

      case "divider":
        return <Separator className="my-8" />;

      case "card":
        return (
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle>{block_data.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">
                {block_data.content}
              </p>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {blocks.map((block) => (
        <div key={block.id}>{renderBlock(block)}</div>
      ))}
    </div>
  );
};

export default PageBlockRenderer;
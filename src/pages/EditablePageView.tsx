import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBlockRenderer from "@/components/PageBlockRenderer";
import { useEditablePage } from "@/hooks/useEditablePage";
import { Loader2 } from "lucide-react";

const EditablePageView = () => {
  const { pageKey } = useParams<{ pageKey: string }>();
  const { page, blocks, isLoading, error } = useEditablePage(pageKey || "", true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or hasn't been published yet.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl font-bold mb-12 text-center text-gradient-accent">
            {page.title}
          </h1>
          <PageBlockRenderer blocks={blocks} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditablePageView;
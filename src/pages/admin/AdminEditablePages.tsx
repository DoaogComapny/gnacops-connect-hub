import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileEdit, Users, Briefcase, Newspaper, Image, Calendar, Tv, ExternalLink } from "lucide-react";

const pages = [
  {
    key: "team",
    title: "The Team",
    description: "Manage team members and their information",
    icon: Users,
  },
  {
    key: "services",
    title: "Services",
    description: "Edit services offered to members",
    icon: Briefcase,
  },
  {
    key: "news",
    title: "News",
    description: "Publish and manage news articles",
    icon: Newspaper,
  },
  {
    key: "gallery",
    title: "Gallery",
    description: "Upload and organize photo gallery",
    icon: Image,
  },
  {
    key: "events",
    title: "Events",
    description: "Create and manage upcoming events",
    icon: Calendar,
  },
  {
    key: "education-tv",
    title: "Education TV",
    description: "Upload and manage educational videos",
    icon: Tv,
  },
];

const AdminEditablePages = () => {
  const navigate = useNavigate();

  const handleEditClick = (pageKey: string) => {
    navigate(`/admin/panel/editable-pages/${pageKey}`);
  };

  const handleViewClick = (pageKey: string) => {
    window.open(`/${pageKey}`, '_blank');
  };
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Editable Pages</h1>
        <p className="text-muted-foreground">
          Manage content for your dynamic pages using the page builder
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <Card key={page.key} className="hover-glow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <page.icon className="h-5 w-5 text-primary" />
                <CardTitle>{page.title}</CardTitle>
              </div>
              <CardDescription>{page.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button 
                variant="default" 
                className="flex-1"
                onClick={() => handleEditClick(page.key)}
              >
                <FileEdit className="mr-2 h-4 w-4" />
                Edit Page
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleViewClick(page.key)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminEditablePages;
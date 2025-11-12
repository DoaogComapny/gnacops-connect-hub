import { Link } from "react-router-dom";
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
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Editable Pages</h1>
        <p className="text-muted-foreground">
          Manage content for all editable pages using drag-and-drop builder
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => {
          const Icon = page.icon;
          return (
            <Card
              key={page.key}
              className="hover-glow hover:-translate-y-1 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle>{page.title}</CardTitle>
                <CardDescription>{page.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Link to={`/admin/panel/editable-pages/${page.key}`} className="flex-1">
                  <Button variant="default" className="w-full">
                    <FileEdit className="mr-2 h-4 w-4" />
                    Edit Page
                  </Button>
                </Link>
                <Link to={`/${page.key}`} target="_blank">
                  <Button variant="outline" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminEditablePages;
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuickLink {
  label: string;
  path: string;
}

const QuickLinksManager = () => {
  const { toast } = useToast();
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Membership", path: "/membership" },
    { label: "Contact", path: "/contact" },
  ]);

  const addQuickLink = () => {
    setQuickLinks([...quickLinks, { label: "", path: "" }]);
  };

  const removeQuickLink = (index: number) => {
    setQuickLinks(quickLinks.filter((_, i) => i !== index));
  };

  const updateQuickLink = (index: number, field: keyof QuickLink, value: string) => {
    const newLinks = [...quickLinks];
    newLinks[index][field] = value;
    setQuickLinks(newLinks);
  };

  const handleSave = () => {
    toast({
      title: "Quick Links Saved",
      description: "Your quick links have been saved successfully.",
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Quick Links Manager</h2>
          <p className="text-sm text-muted-foreground">Manage navigation quick links</p>
        </div>
        <Button onClick={addQuickLink} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Link
        </Button>
      </div>

      <div className="space-y-4">
        {quickLinks.map((link, index) => (
          <div key={index} className="grid grid-cols-[1fr,1fr,auto] gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <label className="text-sm font-medium mb-2 block">Link Label</label>
              <Input
                value={link.label}
                onChange={(e) => updateQuickLink(index, "label", e.target.value)}
                placeholder="Home"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Link Path</label>
              <Input
                value={link.path}
                onChange={(e) => updateQuickLink(index, "path", e.target.value)}
                placeholder="/"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => removeQuickLink(index)}
                variant="destructive"
                size="icon"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <Button variant="cta" onClick={handleSave} className="mt-4">
          <Save className="mr-2 h-4 w-4" />
          Save Quick Links
        </Button>
      </div>
    </Card>
  );
};

export default QuickLinksManager;
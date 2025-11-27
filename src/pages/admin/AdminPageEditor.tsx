import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Edit, Save, Eye, GripVertical, Type, Image as ImageIcon, Video, Link as LinkIcon, Minus, Square } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EditablePage {
  id: string;
  page_key: string;
  title: string;
  slug: string;
  is_published: boolean | null;
}

interface PageBlock {
  id: string;
  page_id: string;
  block_type: string;
  block_data: any;
  position: number;
}

const BLOCK_TYPES = [
  { value: "text", label: "Text", icon: Type },
  { value: "title", label: "Title", icon: Type },
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "video", label: "Video", icon: Video },
  { value: "button", label: "Button", icon: LinkIcon },
  { value: "divider", label: "Divider", icon: Minus },
  { value: "card", label: "Card", icon: Square },
];

const AdminPageEditor = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<EditablePage[]>([]);
  const [selectedPage, setSelectedPage] = useState<EditablePage | null>(null);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddBlockDialogOpen, setIsAddBlockDialogOpen] = useState(false);
  const [newBlockType, setNewBlockType] = useState<string>("");
  const [editingBlock, setEditingBlock] = useState<PageBlock | null>(null);
  const [editBlockData, setEditBlockData] = useState<any>({});

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      fetchBlocks(selectedPage.id);
    }
  }, [selectedPage]);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from("editable_pages")
        .select("*")
        .order("title", { ascending: true });

      if (error) {
        console.error("Error fetching pages:", error);
        toast.error("Failed to load pages");
        return;
      }

      setPages(data || []);
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast.error("Failed to load pages");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBlocks = async (pageId: string) => {
    try {
      const { data, error } = await supabase
        .from("page_blocks")
        .select("*")
        .eq("page_id", pageId)
        .order("position", { ascending: true });

      if (error) {
        console.error("Error fetching blocks:", error);
        toast.error("Failed to load page blocks");
        return;
      }

      setBlocks(data || []);
    } catch (error) {
      console.error("Error fetching blocks:", error);
      toast.error("Failed to load page blocks");
    }
  };

  const addBlock = async () => {
    if (!selectedPage || !newBlockType) {
      toast.error("Please select a page and block type");
      return;
    }

    setIsSaving(true);
    try {
      // Get the next position
      const maxPosition = blocks.length > 0 
        ? Math.max(...blocks.map(b => b.position)) 
        : -1;

      // Default block data based on type
      const defaultData: any = {};
      if (newBlockType === "text") {
        defaultData.content = "";
      } else if (newBlockType === "title") {
        defaultData.text = "";
        defaultData.size = "h1";
      } else if (newBlockType === "image") {
        defaultData.url = "";
        defaultData.alt = "";
      } else if (newBlockType === "video") {
        defaultData.url = "";
        defaultData.title = "";
      } else if (newBlockType === "button") {
        defaultData.text = "";
        defaultData.url = "";
        defaultData.variant = "default";
      } else if (newBlockType === "card") {
        defaultData.title = "";
        defaultData.content = "";
        defaultData.image_url = "";
      }

      const { data, error } = await supabase
        .from("page_blocks")
        .insert({
          page_id: selectedPage.id,
          block_type: newBlockType,
          block_data: defaultData,
          position: maxPosition + 1,
        })
        .select()
        .single();

      if (error) {
        console.error("Database error adding block:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        toast.error(`Failed to add block: ${error.message || "Database error"}`);
        return;
      }

      if (!data) {
        console.error("No data returned from insert");
        toast.error("Failed to add block: No data returned");
        return;
      }

      toast.success("Block added successfully");
      setIsAddBlockDialogOpen(false);
      setNewBlockType("");
      fetchBlocks(selectedPage.id);
    } catch (error: any) {
      console.error("Error adding block:", error);
      toast.error(`Failed to add block: ${error.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const updateBlock = async (blockId: string, data: any) => {
    try {
      const { error } = await supabase
        .from("page_blocks")
        .update({ block_data: data })
        .eq("id", blockId);

      if (error) {
        console.error("Error updating block:", error);
        toast.error("Failed to update block");
        return;
      }

      toast.success("Block updated successfully");
      if (selectedPage) {
        fetchBlocks(selectedPage.id);
      }
      setEditingBlock(null);
      setEditBlockData({});
    } catch (error) {
      console.error("Error updating block:", error);
      toast.error("Failed to update block");
    }
  };

  const deleteBlock = async (blockId: string) => {
    if (!confirm("Are you sure you want to delete this block?")) return;

    try {
      const { error } = await supabase
        .from("page_blocks")
        .delete()
        .eq("id", blockId);

      if (error) {
        console.error("Error deleting block:", error);
        toast.error("Failed to delete block");
        return;
      }

      toast.success("Block deleted successfully");
      if (selectedPage) {
        fetchBlocks(selectedPage.id);
      }
    } catch (error) {
      console.error("Error deleting block:", error);
      toast.error("Failed to delete block");
    }
  };

  const handlePublish = async () => {
    if (!selectedPage) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("editable_pages")
        .update({ is_published: true })
        .eq("id", selectedPage.id);

      if (error) {
        console.error("Error publishing page:", error);
        toast.error("Failed to publish page");
        return;
      }

      toast.success("Page published successfully");
      fetchPages();
      if (selectedPage) {
        const updated = pages.find(p => p.id === selectedPage.id);
        if (updated) {
          setSelectedPage({ ...updated, is_published: true });
        }
      }
    } catch (error) {
      console.error("Error publishing page:", error);
      toast.error("Failed to publish page");
    } finally {
      setIsSaving(false);
    }
  };

  const startEditingBlock = (block: PageBlock) => {
    setEditingBlock(block);
    setEditBlockData(block.block_data || {});
  };

  const saveBlockEdit = () => {
    if (!editingBlock) return;
    updateBlock(editingBlock.id, editBlockData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Editable Pages</h1>
          <p className="text-muted-foreground">Edit and manage page content with blocks</p>
        </div>
        {selectedPage && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/${selectedPage.slug}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              onClick={handlePublish}
              disabled={isSaving || selectedPage.is_published === true}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </div>
        )}
      </div>

      {/* Page Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Page to Edit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.map((page) => (
              <Card
                key={page.id}
                className={`cursor-pointer hover:border-primary transition-colors ${
                  selectedPage?.id === page.id ? "border-primary" : ""
                }`}
                onClick={() => setSelectedPage(page)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{page.title}</h3>
                      <p className="text-sm text-muted-foreground">/{page.slug}</p>
                    </div>
                    {page.is_published ? (
                      <Badge variant="default">Published</Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Block Editor */}
      {selectedPage && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Editing: {selectedPage.title}</CardTitle>
              <Dialog open={isAddBlockDialogOpen} onOpenChange={setIsAddBlockDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Block
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Block</DialogTitle>
                    <DialogDescription>
                      Select the type of block you want to add to this page.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-3">
                      {BLOCK_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <Button
                            key={type.value}
                            variant={newBlockType === type.value ? "default" : "outline"}
                            className="h-auto py-4 flex flex-col gap-2"
                            onClick={() => setNewBlockType(type.value)}
                          >
                            <Icon className="h-6 w-6" />
                            <span>{type.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddBlockDialogOpen(false);
                        setNewBlockType("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={addBlock} disabled={!newBlockType || isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add Block
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {blocks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No blocks yet. Click "Add Block" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blocks.map((block) => (
                  <Card key={block.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                          <Badge variant="outline">{block.block_type}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditingBlock(block)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteBlock(block.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {/* Render block preview */}
                      <div className="border rounded p-4 bg-muted/50">
                        {block.block_type === "text" && (
                          <p>{block.block_data?.content || "Empty text block"}</p>
                        )}
                        {block.block_type === "title" && (
                          <h2 className="text-2xl font-bold">
                            {block.block_data?.text || "Empty title"}
                          </h2>
                        )}
                        {block.block_type === "image" && block.block_data?.url && (
                          <img
                            src={block.block_data.url}
                            alt={block.block_data.alt || ""}
                            className="max-w-full h-auto rounded"
                          />
                        )}
                        {block.block_type === "video" && block.block_data?.url && (
                          <div className="aspect-video bg-muted rounded flex items-center justify-center">
                            <Video className="h-12 w-12 text-muted-foreground" />
                            <span className="ml-2">{block.block_data.title || "Video"}</span>
                          </div>
                        )}
                        {block.block_type === "button" && (
                          <Button variant={block.block_data?.variant || "default"}>
                            {block.block_data?.text || "Button"}
                          </Button>
                        )}
                        {block.block_type === "divider" && (
                          <hr className="border-t" />
                        )}
                        {block.block_type === "card" && (
                          <div className="border rounded p-4">
                            <h3 className="font-semibold mb-2">
                              {block.block_data?.title || "Card Title"}
                            </h3>
                            <p>{block.block_data?.content || "Card content"}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Block Dialog */}
      {editingBlock && (
        <Dialog open={!!editingBlock} onOpenChange={() => {
          setEditingBlock(null);
          setEditBlockData({});
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit {editingBlock.block_type} Block</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {editingBlock.block_type === "text" && (
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={editBlockData.content || ""}
                    onChange={(e) => setEditBlockData({ ...editBlockData, content: e.target.value })}
                    rows={6}
                  />
                </div>
              )}

              {editingBlock.block_type === "title" && (
                <>
                  <div className="space-y-2">
                    <Label>Text</Label>
                    <Input
                      value={editBlockData.text || ""}
                      onChange={(e) => setEditBlockData({ ...editBlockData, text: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Size</Label>
                    <Select
                      value={editBlockData.size || "h1"}
                      onValueChange={(value) => setEditBlockData({ ...editBlockData, size: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="h1">H1 (Largest)</SelectItem>
                        <SelectItem value="h2">H2</SelectItem>
                        <SelectItem value="h3">H3</SelectItem>
                        <SelectItem value="h4">H4 (Smallest)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {editingBlock.block_type === "image" && (
                <>
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      value={editBlockData.url || ""}
                      onChange={(e) => setEditBlockData({ ...editBlockData, url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Alt Text</Label>
                    <Input
                      value={editBlockData.alt || ""}
                      onChange={(e) => setEditBlockData({ ...editBlockData, alt: e.target.value })}
                      placeholder="Description of image"
                    />
                  </div>
                </>
              )}

              {editingBlock.block_type === "video" && (
                <>
                  <div className="space-y-2">
                    <Label>Video URL</Label>
                    <Input
                      value={editBlockData.url || ""}
                      onChange={(e) => setEditBlockData({ ...editBlockData, url: e.target.value })}
                      placeholder="YouTube, Vimeo, or direct video URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={editBlockData.title || ""}
                      onChange={(e) => setEditBlockData({ ...editBlockData, title: e.target.value })}
                      placeholder="Video title"
                    />
                  </div>
                </>
              )}

              {editingBlock.block_type === "button" && (
                <>
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      value={editBlockData.text || ""}
                      onChange={(e) => setEditBlockData({ ...editBlockData, text: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      value={editBlockData.url || ""}
                      onChange={(e) => setEditBlockData({ ...editBlockData, url: e.target.value })}
                      placeholder="/page or https://example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Variant</Label>
                    <Select
                      value={editBlockData.variant || "default"}
                      onValueChange={(value) => setEditBlockData({ ...editBlockData, variant: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                        <SelectItem value="ghost">Ghost</SelectItem>
                        <SelectItem value="destructive">Destructive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {editingBlock.block_type === "card" && (
                <>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={editBlockData.title || ""}
                      onChange={(e) => setEditBlockData({ ...editBlockData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                      value={editBlockData.content || ""}
                      onChange={(e) => setEditBlockData({ ...editBlockData, content: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Image URL (Optional)</Label>
                    <Input
                      value={editBlockData.image_url || ""}
                      onChange={(e) => setEditBlockData({ ...editBlockData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingBlock(null);
                  setEditBlockData({});
                }}
              >
                Cancel
              </Button>
              <Button onClick={saveBlockEdit}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminPageEditor;


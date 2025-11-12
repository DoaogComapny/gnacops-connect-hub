import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, GripVertical, Trash2, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import MediaUpload from "@/components/admin/MediaUpload";

interface PageBlock {
  id: string;
  block_type: string;
  block_data: Record<string, any>;
  position: number;
}

const blockTypes = [
  { type: "text", label: "Text Block", icon: "📝" },
  { type: "title", label: "Title", icon: "📰" },
  { type: "image", label: "Image", icon: "🖼️" },
  { type: "video", label: "Video", icon: "🎥" },
  { type: "button", label: "Button", icon: "🔘" },
  { type: "divider", label: "Divider", icon: "➖" },
  { type: "card", label: "Card", icon: "🃏" },
];

const SortableBlock = ({ block, onUpdate, onDelete }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(block.block_data);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: transform ? 0.5 : 1,
  };

  const handleSave = () => {
    onUpdate(block.id, data);
    setIsEditing(false);
  };

  const renderEditor = () => {
    switch (block.block_type) {
      case "text":
        return (
          <Textarea
            value={data.content || ""}
            onChange={(e) => setData({ ...data, content: e.target.value })}
            placeholder="Enter text content..."
            rows={5}
          />
        );
      case "title":
        return (
          <Input
            value={data.text || ""}
            onChange={(e) => setData({ ...data, text: e.target.value })}
            placeholder="Enter title text..."
          />
        );
      case "image":
        return (
          <div className="space-y-4">
            <Input
              value={data.url || ""}
              onChange={(e) => setData({ ...data, url: e.target.value })}
              placeholder="Image URL..."
            />
            <Input
              value={data.alt || ""}
              onChange={(e) => setData({ ...data, alt: e.target.value })}
              placeholder="Alt text..."
            />
            <MediaUpload
              onUploadComplete={(url) => setData({ ...data, url })}
              accept="image/*"
            />
          </div>
        );
      case "video":
        return (
          <div className="space-y-4">
            <Input
              value={data.url || ""}
              onChange={(e) => setData({ ...data, url: e.target.value })}
              placeholder="Video URL (YouTube, Vimeo, or direct link)..."
            />
            <MediaUpload
              onUploadComplete={(url) => setData({ ...data, url })}
              accept="video/*"
            />
          </div>
        );
      case "button":
        return (
          <div className="space-y-4">
            <Input
              value={data.text || ""}
              onChange={(e) => setData({ ...data, text: e.target.value })}
              placeholder="Button text..."
            />
            <Input
              value={data.link || ""}
              onChange={(e) => setData({ ...data, link: e.target.value })}
              placeholder="Button link..."
            />
          </div>
        );
      case "card":
        return (
          <div className="space-y-4">
            <Input
              value={data.title || ""}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              placeholder="Card title..."
            />
            <Textarea
              value={data.content || ""}
              onChange={(e) => setData({ ...data, content: e.target.value })}
              placeholder="Card content..."
              rows={4}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center gap-4 py-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-sm flex-1">
            {blockTypes.find((t) => t.type === block.block_type)?.label || block.block_type}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel" : "Edit"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(block.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </CardHeader>
        {isEditing && (
          <CardContent className="space-y-4">
            {renderEditor()}
            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

const AdminPageEditor = () => {
  const { pageKey } = useParams<{ pageKey: string }>();
  const [page, setPage] = useState<any>(null);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (pageKey) fetchPage();
  }, [pageKey]);

  const fetchPage = async () => {
    try {
      const { data: pageData, error: pageError } = await supabase
        .from("editable_pages")
        .select("*")
        .eq("page_key", pageKey)
        .single();

      if (pageError) throw pageError;
      setPage(pageData);

      const { data: blocksData, error: blocksError } = await supabase
        .from("page_blocks")
        .select("*")
        .eq("page_id", pageData.id)
        .order("position");

      if (blocksError) throw blocksError;
      setBlocks(blocksData as PageBlock[] || []);
    } catch (error) {
      console.error("Error fetching page:", error);
      toast.error("Failed to load page");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addBlock = async (type: string) => {
    try {
      const { data, error } = await supabase
        .from("page_blocks")
        .insert({
          page_id: page.id,
          block_type: type,
          block_data: {},
          position: blocks.length,
        })
        .select()
        .single();

      if (error) throw error;
      setBlocks([...blocks, data as PageBlock]);
      toast.success("Block added");
    } catch (error) {
      console.error("Error adding block:", error);
      toast.error("Failed to add block");
    }
  };

  const updateBlock = async (id: string, data: Record<string, any>) => {
    try {
      const { error } = await supabase
        .from("page_blocks")
        .update({ block_data: data })
        .eq("id", id);

      if (error) throw error;
      setBlocks(blocks.map((b) => (b.id === id ? { ...b, block_data: data } : b)));
      toast.success("Block updated");
    } catch (error) {
      console.error("Error updating block:", error);
      toast.error("Failed to update block");
    }
  };

  const deleteBlock = async (id: string) => {
    try {
      const { error } = await supabase.from("page_blocks").delete().eq("id", id);
      if (error) throw error;
      setBlocks(blocks.filter((b) => b.id !== id));
      toast.success("Block deleted");
    } catch (error) {
      console.error("Error deleting block:", error);
      toast.error("Failed to delete block");
    }
  };

  const savePositions = async () => {
    setIsSaving(true);
    try {
      const updates = blocks.map((block, index) => ({
        id: block.id,
        position: index,
      }));

      for (const update of updates) {
        await supabase.from("page_blocks").update({ position: update.position }).eq("id", update.id);
      }

      toast.success("Changes saved");
    } catch (error) {
      console.error("Error saving positions:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublish = async () => {
    try {
      const { error } = await supabase
        .from("editable_pages")
        .update({ is_published: !page.is_published })
        .eq("id", page.id);

      if (error) throw error;
      setPage({ ...page, is_published: !page.is_published });
      toast.success(page.is_published ? "Page unpublished" : "Page published");
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast.error("Failed to update page status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/panel/editable-pages">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pages
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mt-2">{page?.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={savePositions} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Draft
          </Button>
          <Button onClick={togglePublish} variant={page?.is_published ? "secondary" : "default"}>
            {page?.is_published ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              {blocks.map((block) => (
                <SortableBlock key={block.id} block={block} onUpdate={updateBlock} onDelete={deleteBlock} />
              ))}
            </SortableContext>
          </DndContext>
          {blocks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No blocks yet. Add blocks using the panel on the right.
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Add Block</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {blockTypes.map((type) => (
                <Button
                  key={type.type}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => addBlock(type.type)}
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPageEditor;
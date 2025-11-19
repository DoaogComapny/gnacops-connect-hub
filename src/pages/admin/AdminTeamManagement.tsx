import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface TeamMember {
  id: string;
  name: string;
  position: string;
  description: string | null;
  photo_url: string | null;
  position_order: number;
  is_active: boolean;
}

const AdminTeamManagement = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    description: "",
    photo_url: "",
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("position_order", { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.position) {
      toast.error("Name and position are required");
      return;
    }

    setIsSaving(true);
    try {
      if (editingMember) {
        const { error } = await supabase
          .from("team_members")
          .update({
            name: formData.name,
            position: formData.position,
            description: formData.description || null,
            photo_url: formData.photo_url || null,
          })
          .eq("id", editingMember.id);

        if (error) throw error;
        toast.success("Team member updated successfully");
      } else {
        const maxOrder = members.length > 0 ? Math.max(...members.map(m => m.position_order)) : 0;
        const { error } = await supabase
          .from("team_members")
          .insert({
            name: formData.name,
            position: formData.position,
            description: formData.description || null,
            photo_url: formData.photo_url || null,
            position_order: maxOrder + 1,
            is_active: true,
          });

        if (error) throw error;
        toast.success("Team member added successfully");
      }

      setIsDialogOpen(false);
      setFormData({ name: "", position: "", description: "", photo_url: "" });
      setEditingMember(null);
      fetchMembers();
    } catch (error) {
      console.error("Error saving team member:", error);
      toast.error("Failed to save team member");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      position: member.position,
      description: member.description || "",
      photo_url: member.photo_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;

    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Team member deleted successfully");
      fetchMembers();
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error("Failed to delete team member");
    }
  };

  const handleNewMember = () => {
    setEditingMember(null);
    setFormData({ name: "", position: "", description: "", photo_url: "" });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage team members displayed on the Team page</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewMember}>
              <Plus className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingMember ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g., Director, Manager"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief bio or description"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="photo_url">Photo URL</Label>
                <Input
                  id="photo_url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingMember ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <Card key={member.id} className="hover-glow">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{member.name}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-accent font-medium mb-2">{member.position}</p>
              {member.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">{member.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No team members yet. Add your first team member!</p>
        </div>
      )}
    </div>
  );
};

export default AdminTeamManagement;

import { useState, useEffect } from "react";
import { Building2, Plus, Edit, Trash, Loader2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuditLog } from "@/hooks/useAuditLog";

interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  unit_id: string | null;
  head_user_id: string | null;
  is_active: boolean;
  gnacops_units?: { name: string };
  profiles?: { full_name: string };
}

export default function DepartmentsPage() {
  const { hasPermission } = usePermissions();
  const { logAudit } = useAuditLog();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    unit_id: '',
  });

  const canManage = hasPermission('manage_departments');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptResult, unitsResult] = await Promise.all([
        supabase
          .from('departments')
          .select('*, gnacops_units(name)')
          .order('name'),
        supabase.from('gnacops_units').select('*').eq('is_active', true),
      ]);

      if (deptResult.error) throw deptResult.error;
      if (unitsResult.error) throw unitsResult.error;

      // Fetch profiles separately for department heads
      const headIds = deptResult.data?.map(d => d.head_user_id).filter(Boolean) || [];
      const uniqueHeadIds = [...new Set(headIds)];

      let profilesMap: Record<string, any> = {};
      if (uniqueHeadIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', uniqueHeadIds);

        profilesMap = (profilesData || []).reduce((acc, p) => {
          acc[p.id] = { full_name: p.full_name };
          return acc;
        }, {} as Record<string, any>);
      }

      const enrichedDepts = deptResult.data?.map(dept => ({
        ...dept,
        profiles: dept.head_user_id ? profilesMap[dept.head_user_id] : undefined,
      })) || [];

      setDepartments(enrichedDepts as Department[]);
      setUnits(unitsResult.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canManage) {
      toast.error('You do not have permission to manage departments');
      return;
    }

    try {
      if (editingDept) {
        const { error } = await supabase
          .from('departments')
          .update(formData)
          .eq('id', editingDept.id);

        if (error) throw error;

        await logAudit({
          action: 'update',
          entityType: 'department',
          entityId: editingDept.id,
          oldData: editingDept,
          newData: formData,
          module: 'office_management',
        });

        toast.success('Department updated successfully');
      } else {
        const { error } = await supabase
          .from('departments')
          .insert([formData]);

        if (error) throw error;

        await logAudit({
          action: 'create',
          entityType: 'department',
          newData: formData,
          module: 'office_management',
        });

        toast.success('Department created successfully');
      }

      setShowDialog(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving department:', error);
      toast.error(error.message || 'Failed to save department');
    }
  };

  const handleDelete = async (dept: Department) => {
    if (!canManage) {
      toast.error('You do not have permission to delete departments');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${dept.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', dept.id);

      if (error) throw error;

      await logAudit({
        action: 'delete',
        entityType: 'department',
        entityId: dept.id,
        oldData: dept,
        module: 'office_management',
      });

      toast.success('Department deleted successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting department:', error);
      toast.error(error.message || 'Failed to delete department');
    }
  };

  const openDialog = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name,
        code: dept.code,
        description: dept.description || '',
        unit_id: dept.unit_id || '',
      });
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingDept(null);
    setFormData({ name: '', code: '', description: '', unit_id: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Departments Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Organize departments within GNACOPS units
          </p>
        </div>
        {canManage && (
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        )}
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <Card key={dept.id} className="p-6 hover-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{dept.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {dept.code}
                </Badge>
              </div>
              {canManage && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openDialog(dept)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(dept)}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
            </div>

            {dept.gnacops_units && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Building2 className="h-4 w-4" />
                <span>{dept.gnacops_units.name}</span>
              </div>
            )}

            {dept.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {dept.description}
              </p>
            )}

            {dept.profiles && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">Head: {dept.profiles.full_name}</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* GNACOPS Units - Department Dashboards */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Department Dashboards</CardTitle>
          <p className="text-sm text-muted-foreground">
            Access dedicated dashboards for each GNACOPS unit
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => window.location.href = '/admin/panel/office-management/departments/cpdu'}
            >
              <Building2 className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">CPDU</div>
                <div className="text-xs text-muted-foreground">Coordination & Policy Development</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => window.location.href = '/admin/panel/office-management/departments/escu'}
            >
              <Building2 className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">ESCU</div>
                <div className="text-xs text-muted-foreground">Educational Standards & Compliance</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => window.location.href = '/admin/panel/office-management/departments/fsdsu'}
            >
              <Building2 className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">FSDSU</div>
                <div className="text-xs text-muted-foreground">Financial Sustainability & Development</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => window.location.href = '/admin/panel/office-management/departments/csedu'}
            >
              <Building2 className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">CSEDU</div>
                <div className="text-xs text-muted-foreground">Curriculum Standardization & Educational Development</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => window.location.href = '/admin/panel/office-management/departments/riseu'}
            >
              <Building2 className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">RISEU</div>
                <div className="text-xs text-muted-foreground">Research, Innovation & Stakeholder Engagement</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => window.location.href = '/admin/panel/office-management/departments/ssau'}
            >
              <Building2 className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">SSAU</div>
                <div className="text-xs text-muted-foreground">Support Services & Advocacy</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => window.location.href = '/admin/panel/office-management/departments/pecu'}
            >
              <Building2 className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">PECU</div>
                <div className="text-xs text-muted-foreground">Private Education & Compliance</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {departments.length === 0 && (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Departments Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first department to get started
          </p>
          {canManage && (
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          )}
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDept ? 'Edit Department' : 'Add Department'}
            </DialogTitle>
            <DialogDescription>
              {editingDept ? 'Update department information' : 'Create a new department'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Department Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="code">Department Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                placeholder="e.g., DEPT_CODE"
              />
            </div>

            <div>
              <Label htmlFor="unit">GNACOPS Unit</Label>
              <Select
                value={formData.unit_id}
                onValueChange={(value) => setFormData({ ...formData, unit_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingDept ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CertificateBuilder } from '@/components/CertificateBuilder';

interface CertificateTemplate {
  id: string;
  name: string;
  category_id: string;
  template_html: string;
  template_config: any;
  background_url: string | null;
  is_active: boolean;
}

interface FormCategory {
  id: string;
  name: string;
  type: string;
}

const AdminCertificates = () => {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [categories, setCategories] = useState<FormCategory[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    template_html: '', // Now stores Fabric.js JSON
  });

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, []);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('certificate_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load templates');
      return;
    }

    setTemplates(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('form_categories')
      .select('id, name, type')
      .eq('is_active', true);

    if (error) {
      toast.error('Failed to load categories');
      return;
    }

    setCategories(data || []);
  };

  const handleSaveFromBuilder = async (jsonData: string, previewUrl: string) => {
    if (!formData.name || !formData.category_id) {
      toast.error('Please enter template name and select category');
      return;
    }

    const templateData = {
      name: formData.name,
      category_id: formData.category_id,
      template_html: jsonData,
      template_config: { preview_url: previewUrl },
      background_url: null,
      is_active: true
    };

    const { error } = selectedTemplate
      ? await supabase.from('certificate_templates').update(templateData).eq('id', selectedTemplate)
      : await supabase.from('certificate_templates').insert(templateData);

    if (error) {
      toast.error('Failed to save template');
      return;
    }

    toast.success(selectedTemplate ? 'Template updated' : 'Template created');
    setSelectedTemplate('');
    setFormData({
      name: '',
      category_id: '',
      template_html: '',
    });
    fetchTemplates();
  };

  const editTemplate = (template: CertificateTemplate) => {
    setSelectedTemplate(template.id);
    setFormData({
      name: template.name,
      category_id: template.category_id,
      template_html: template.template_html,
    });
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase
      .from('certificate_templates')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete template');
      return;
    }

    toast.success('Template deleted');
    fetchTemplates();
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Certificate Builder</h1>
        <p className="text-muted-foreground">Design and manage certificate templates</p>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">Create/Edit Template</TabsTrigger>
          <TabsTrigger value="templates">Manage Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedTemplate ? 'Edit Template' : 'Create New Template'}
              </CardTitle>
              <CardDescription>
                Design your certificate using the drag-and-drop builder
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Template Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Professional Certificate"
                  />
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name} ({cat.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <CertificateBuilder 
            onSave={handleSaveFromBuilder}
            initialData={selectedTemplate ? formData.template_html : undefined}
          />
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Templates ({templates.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No templates created yet</p>
              ) : (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center gap-3 p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{template.name}</p>
                          {template.is_active && <Badge variant="default">Active</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Category: {categories.find(c => c.id === template.category_id)?.name}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editTemplate(template)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCertificates;
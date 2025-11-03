import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Save, Eye, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

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
    background_url: '',
    template_html: `<div style="width: 800px; height: 600px; padding: 40px; background: white; border: 10px solid #2563eb;">
  <div style="text-align: center; font-family: 'Times New Roman', serif;">
    <h1 style="font-size: 48px; color: #1e40af; margin-bottom: 20px;">Certificate of Achievement</h1>
    <p style="font-size: 20px; margin-bottom: 40px;">This is to certify that</p>
    <h2 style="font-size: 36px; color: #000; margin-bottom: 40px; border-bottom: 2px solid #000; display: inline-block; padding-bottom: 10px;">{{FULL_NAME}}</h2>
    <p style="font-size: 18px; margin-bottom: 20px;">has successfully completed the requirements for</p>
    <h3 style="font-size: 28px; color: #1e40af; margin-bottom: 40px;">{{MEMBERSHIP_TYPE}}</h3>
    <p style="font-size: 16px; margin-bottom: 40px;">GNACOPS ID: {{GNACOPS_ID}}</p>
    <div style="display: flex; justify-content: space-between; margin-top: 80px;">
      <div style="text-align: center;">
        <div style="border-top: 2px solid #000; width: 200px; margin-bottom: 5px;"></div>
        <p style="font-size: 14px;">Signature</p>
      </div>
      <div style="text-align: center;">
        <div style="border-top: 2px solid #000; width: 200px; margin-bottom: 5px;"></div>
        <p style="font-size: 14px;">Date: {{ISSUE_DATE}}</p>
      </div>
    </div>
  </div>
</div>`,
    template_config: JSON.stringify({
      variables: ['FULL_NAME', 'MEMBERSHIP_TYPE', 'GNACOPS_ID', 'ISSUE_DATE'],
      width: 800,
      height: 600
    }, null, 2)
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

  const saveTemplate = async () => {
    if (!formData.name || !formData.category_id || !formData.template_html) {
      toast.error('Please fill in all required fields');
      return;
    }

    let configData;
    try {
      configData = JSON.parse(formData.template_config);
    } catch (e) {
      toast.error('Invalid template config JSON');
      return;
    }

    const templateData = {
      name: formData.name,
      category_id: formData.category_id,
      template_html: formData.template_html,
      template_config: configData,
      background_url: formData.background_url || null,
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
      background_url: '',
      template_html: formData.template_html,
      template_config: formData.template_config
    });
    fetchTemplates();
  };

  const editTemplate = (template: CertificateTemplate) => {
    setSelectedTemplate(template.id);
    setFormData({
      name: template.name,
      category_id: template.category_id,
      background_url: template.background_url || '',
      template_html: template.template_html,
      template_config: JSON.stringify(template.template_config, null, 2)
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

  const previewTemplate = () => {
    const previewHtml = formData.template_html
      .replace(/{{FULL_NAME}}/g, 'John Doe')
      .replace(/{{MEMBERSHIP_TYPE}}/g, 'Professional Member')
      .replace(/{{GNACOPS_ID}}/g, 'GNACOPS251001')
      .replace(/{{ISSUE_DATE}}/g, new Date().toLocaleDateString());

    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(previewHtml);
      previewWindow.document.close();
    }
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
                Design your certificate using HTML and template variables
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

              <div>
                <Label>Background Image URL (Optional)</Label>
                <Input
                  value={formData.background_url}
                  onChange={(e) => setFormData({ ...formData, background_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label>Template HTML *</Label>
                <Textarea
                  value={formData.template_html}
                  onChange={(e) => setFormData({ ...formData, template_html: e.target.value })}
                  rows={12}
                  className="font-mono text-sm"
                  placeholder="Enter HTML with variables like {{FULL_NAME}}, {{MEMBERSHIP_TYPE}}"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Available variables: {`{{FULL_NAME}}`}, {`{{MEMBERSHIP_TYPE}}`}, {`{{GNACOPS_ID}}`}, {`{{ISSUE_DATE}}`}
                </p>
              </div>

              <div>
                <Label>Template Config (JSON)</Label>
                <Textarea
                  value={formData.template_config}
                  onChange={(e) => setFormData({ ...formData, template_config: e.target.value })}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={saveTemplate} variant="cta">
                  <Save className="mr-2 h-4 w-4" />
                  {selectedTemplate ? 'Update Template' : 'Create Template'}
                </Button>
                <Button onClick={previewTemplate} variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                {selectedTemplate && (
                  <Button 
                    onClick={() => {
                      setSelectedTemplate('');
                      setFormData({
                        name: '',
                        category_id: '',
                        background_url: '',
                        template_html: formData.template_html,
                        template_config: formData.template_config
                      });
                    }}
                    variant="ghost"
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
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
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Eye } from "lucide-react";
import { useSecretaryAuth } from "@/hooks/useSecretaryAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmailTemplate {
  id: string;
  template_key: string;
  subject: string;
  html_body: string;
  variables: any;
  is_active: boolean;
}

const SecretaryEmailTemplates = () => {
  const { toast } = useToast();
  const { user } = useSecretaryAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_key');

      if (error) throw error;
      setTemplates(data || []);
      if (data && data.length > 0) {
        setSelectedTemplate(data[0]);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load email templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({
          subject: selectedTemplate.subject,
          html_body: selectedTemplate.html_body,
        })
        .eq('id', selectedTemplate.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email template saved successfully",
      });

      await fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save email template",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gradient-accent">Email Template Customization</h1>
      </div>

      <Tabs value={selectedTemplate?.template_key} onValueChange={(key) => {
        const template = templates.find(t => t.template_key === key);
        if (template) setSelectedTemplate(template);
      }}>
        <TabsList className="mb-6">
          {templates.map((template) => (
            <TabsTrigger key={template.id} value={template.template_key}>
              {template.template_key.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </TabsTrigger>
          ))}
        </TabsList>

        {templates.map((template) => (
          <TabsContent key={template.id} value={template.template_key}>
            <Card className="p-6">
              <div className="space-y-6">
                {/* Available Variables */}
                <div>
                  <Label>Available Variables</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {template.variables && Object.keys(template.variables).map((key) => (
                      <code key={key} className="px-2 py-1 bg-muted rounded text-sm">
                        {'{{' + key + '}}'}
                      </code>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Use these placeholders in your subject and body to insert dynamic content
                  </p>
                </div>

                {/* Subject */}
                <div>
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={selectedTemplate?.id === template.id ? selectedTemplate.subject : template.subject}
                    onChange={(e) => {
                      if (selectedTemplate?.id === template.id) {
                        setSelectedTemplate({ ...selectedTemplate, subject: e.target.value });
                      }
                    }}
                    placeholder="Enter email subject..."
                  />
                </div>

                {/* HTML Body */}
                <div>
                  <Label htmlFor="body">Email Body (HTML)</Label>
                  <Textarea
                    id="body"
                    value={selectedTemplate?.id === template.id ? selectedTemplate.html_body : template.html_body}
                    onChange={(e) => {
                      if (selectedTemplate?.id === template.id) {
                        setSelectedTemplate({ ...selectedTemplate, html_body: e.target.value });
                      }
                    }}
                    rows={15}
                    className="font-mono text-sm"
                    placeholder="Enter HTML template..."
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    You can use HTML and inline CSS for styling
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={handlePreview}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div>
              <div className="mb-4">
                <Label>Subject:</Label>
                <p className="font-medium">{selectedTemplate.subject}</p>
              </div>
              <div className="border rounded-lg p-4 bg-background">
                <div dangerouslySetInnerHTML={{ __html: selectedTemplate.html_body }} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecretaryEmailTemplates;

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Link {
  id: string;
  label: string;
  url: string;
  position: number;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon_name: string;
  position: number;
}

const AdminWebSettings = () => {
  const [pageContent, setPageContent] = useState<any>({});
  const [headerLinks, setHeaderLinks] = useState<Link[]>([]);
  const [footerLinks, setFooterLinks] = useState<Link[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [legalLinks, setLegalLinks] = useState<Link[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    // Fetch page content
    const { data: content } = await supabase.from('page_content').select('*');
    if (content) {
      const contentMap = content.reduce((acc, item) => {
        acc[item.page_key] = item.content;
        return acc;
      }, {});
      setPageContent(contentMap);
    }

    // Fetch links
    const { data: header } = await supabase.from('header_links').select('*').order('position');
    const { data: footer } = await supabase.from('footer_quick_links').select('*').order('position');
    const { data: social } = await supabase.from('footer_social_links').select('*').order('position');
    const { data: legal } = await supabase.from('footer_legal_links').select('*').order('position');

    if (header) setHeaderLinks(header);
    if (footer) setFooterLinks(footer);
    if (social) setSocialLinks(social);
    if (legal) setLegalLinks(legal);
  };

  const updatePageContent = async (pageKey: string, content: any) => {
    const { error } = await supabase
      .from('page_content')
      .upsert({ page_key: pageKey, content }, { onConflict: 'page_key' });

    if (error) {
      toast.error('Failed to update content');
      return;
    }

    toast.success('Content updated successfully');
    fetchAllData();
  };

  const addLink = async (table: 'header_links' | 'footer_quick_links' | 'footer_social_links' | 'footer_legal_links', data: any) => {
    const { error } = await supabase.from(table).insert(data);
    
    if (error) {
      toast.error('Failed to add link');
      return;
    }

    toast.success('Link added successfully');
    fetchAllData();
  };

  const deleteLink = async (table: 'header_links' | 'footer_quick_links' | 'footer_social_links' | 'footer_legal_links', id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    
    if (error) {
      toast.error('Failed to delete link');
      return;
    }

    toast.success('Link deleted successfully');
    fetchAllData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Web Settings</h1>
        <p className="text-muted-foreground">Manage website content, links, and settings</p>
      </div>

      <Tabs defaultValue="about" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Page Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={pageContent.about?.title || ''}
                  onChange={(e) => setPageContent({
                    ...pageContent,
                    about: { ...pageContent.about, title: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Introduction</Label>
                <Textarea
                  value={pageContent.about?.intro || ''}
                  onChange={(e) => setPageContent({
                    ...pageContent,
                    about: { ...pageContent.about, intro: e.target.value }
                  })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Mission</Label>
                <Textarea
                  value={pageContent.about?.mission || ''}
                  onChange={(e) => setPageContent({
                    ...pageContent,
                    about: { ...pageContent.about, mission: e.target.value }
                  })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Vision</Label>
                <Textarea
                  value={pageContent.about?.vision || ''}
                  onChange={(e) => setPageContent({
                    ...pageContent,
                    about: { ...pageContent.about, vision: e.target.value }
                  })}
                  rows={3}
                />
              </div>
              <Button onClick={() => updatePageContent('about', pageContent.about)} variant="cta">
                <Save className="mr-2 h-4 w-4" />
                Save About Page
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Page Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={pageContent.contact?.title || ''}
                  onChange={(e) => setPageContent({
                    ...pageContent,
                    contact: { ...pageContent.contact, title: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={pageContent.contact?.email || ''}
                  onChange={(e) => setPageContent({
                    ...pageContent,
                    contact: { ...pageContent.contact, email: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={pageContent.contact?.phone || ''}
                  onChange={(e) => setPageContent({
                    ...pageContent,
                    contact: { ...pageContent.contact, phone: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Address</Label>
                <Textarea
                  value={pageContent.contact?.address || ''}
                  onChange={(e) => setPageContent({
                    ...pageContent,
                    contact: { ...pageContent.contact, address: e.target.value }
                  })}
                  rows={3}
                />
              </div>
              <Button onClick={() => updatePageContent('contact', pageContent.contact)} variant="cta">
                <Save className="mr-2 h-4 w-4" />
                Save Contact Page
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="header">
          <Card>
            <CardHeader>
              <CardTitle>Header Links</CardTitle>
              <CardDescription>Manage navigation links in the header</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {headerLinks.map((link) => (
                  <div key={link.id} className="flex items-center gap-3 p-3 border rounded">
                    <div className="flex-1">
                      <p className="font-medium">{link.label}</p>
                      <p className="text-sm text-muted-foreground">{link.url}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteLink('header_links', link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle>Footer Quick Links</CardTitle>
              <CardDescription>Manage quick links and legal links in footer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold">Quick Links</h3>
                {footerLinks.map((link) => (
                  <div key={link.id} className="flex items-center gap-3 p-3 border rounded">
                    <div className="flex-1">
                      <p className="font-medium">{link.label}</p>
                      <p className="text-sm text-muted-foreground">{link.url}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteLink('footer_quick_links', link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Legal Links</h3>
                {legalLinks.map((link) => (
                  <div key={link.id} className="flex items-center gap-3 p-3 border rounded">
                    <div className="flex-1">
                      <p className="font-medium">{link.label}</p>
                      <p className="text-sm text-muted-foreground">{link.url}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteLink('footer_legal_links', link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Manage social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-3 p-3 border rounded">
                  <Badge>{link.platform}</Badge>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{link.url}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteLink('footer_social_links', link.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminWebSettings;

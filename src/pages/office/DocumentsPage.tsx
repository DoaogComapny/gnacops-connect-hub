import { useState, useEffect } from "react";
import { FileText, Upload, Download, Trash, Loader2, Eye, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuditLog } from "@/hooks/useAuditLog";
import { format } from "date-fns";
import MediaUpload from "@/components/admin/MediaUpload";

interface Document {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  category: string | null;
  is_public: boolean;
  created_at: string;
  uploaded_by: string | null;
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { logAudit } = useAuditLog();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    is_public: false,
    file_url: '',
  });

  const canUpload = hasPermission('upload_documents');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (url: string) => {
    setFormData({ ...formData, file_url: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canUpload) {
      toast.error('You do not have permission to upload documents');
      return;
    }

    if (!formData.file_url) {
      toast.error('Please upload a file');
      return;
    }

    try {
      // Extract file info from URL
      const fileName = formData.file_url.split('/').pop() || 'unknown';
      
      const docData = {
        ...formData,
        file_name: fileName,
        uploaded_by: user!.id,
      };

      const { error } = await supabase
        .from('documents')
        .insert([docData]);

      if (error) throw error;

      await logAudit({
        action: 'upload',
        entityType: 'document',
        newData: docData,
        module: 'office_management',
      });

      toast.success('Document uploaded successfully');
      setShowDialog(false);
      resetForm();
      fetchDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Failed to upload document');
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Are you sure you want to delete "${doc.title}"?`)) return;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;

      await logAudit({
        action: 'delete',
        entityType: 'document',
        entityId: doc.id,
        oldData: doc,
        module: 'office_management',
      });

      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      // Log the download
      await supabase.from('document_access_log').insert([{
        document_id: doc.id,
        user_id: user!.id,
        action: 'download',
      }]);

      window.open(doc.file_url, '_blank');
    } catch (error) {
      console.error('Error logging download:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'other',
      is_public: false,
      file_url: '',
    });
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'policy': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'report': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'form': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'template': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = searchTerm === '' || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

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
            <FileText className="h-8 w-8 text-primary" />
            Document Center
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage organizational documents
          </p>
        </div>
        {canUpload && (
          <Button onClick={() => setShowDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="policy">Policies</SelectItem>
              <SelectItem value="report">Reports</SelectItem>
              <SelectItem value="form">Forms</SelectItem>
              <SelectItem value="template">Templates</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Documents Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || categoryFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Upload your first document to get started'}
          </p>
          {canUpload && !searchTerm && categoryFilter === 'all' && (
            <Button onClick={() => setShowDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} className="p-6 hover-card">
              <div className="flex items-start justify-between mb-4">
                <FileText className="h-8 w-8 text-primary" />
                {doc.is_public && (
                  <Badge variant="outline" className="text-xs">Public</Badge>
                )}
              </div>

              <h3 className="font-semibold mb-2 line-clamp-2">{doc.title}</h3>
              
              {doc.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {doc.description}
                </p>
              )}

              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className={getCategoryColor(doc.category)}>
                  {doc.category || 'other'}
                </Badge>
                {doc.file_size && (
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(doc.file_size)}
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                Uploaded {format(new Date(doc.created_at), 'MMM dd, yyyy')}
              </p>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(doc)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                {(canUpload || doc.uploaded_by === user?.id) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(doc)}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add a new document to the library
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Enter document title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe the document"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="form">Form</SelectItem>
                    <SelectItem value="template">Template</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 mt-8">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_public" className="cursor-pointer">
                  Make Public
                </Label>
              </div>
            </div>

            <div>
              <Label>Upload File *</Label>
              <MediaUpload
                onUploadComplete={handleFileUpload}
                accept="*/*"
                bucket="page-media"
                folder="documents"
                maxSizeMB={20}
              />
              {formData.file_url && (
                <p className="text-sm text-green-600 mt-2">✓ File uploaded successfully</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={!formData.file_url}>
                Upload Document
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

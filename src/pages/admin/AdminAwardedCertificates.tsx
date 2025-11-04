import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Download, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AwardedCertificate {
  id: string;
  user_id: string;
  membership_id: string;
  certificate_url: string | null;
  issued_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
  memberships: {
    gnacops_id: string;
    status: string;
  } | null;
}

const AdminAwardedCertificates = () => {
  const [certificates, setCertificates] = useState<AwardedCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          profiles:user_id(full_name, email),
          memberships:membership_id(gnacops_id, status)
        `)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certificateUrl: string | null) => {
    if (!certificateUrl) {
      toast.error('Certificate file not available');
      return;
    }
    window.open(certificateUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Awarded Certificates</h1>
        <p className="text-muted-foreground">View all issued member certificates</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            All Certificates ({certificates.length})
          </CardTitle>
          <CardDescription>Complete list of certificates issued to members</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Certificates Issued Yet</h3>
              <p className="text-muted-foreground">Certificates will appear here once they are issued to members.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>GNACOPS ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Issued</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">
                      {cert.profiles?.full_name || 'Unknown'}
                    </TableCell>
                    <TableCell>{cert.profiles?.email || 'N/A'}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {cert.memberships?.gnacops_id || 'N/A'}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={cert.memberships?.status === 'approved' ? 'default' : 'secondary'}
                      >
                        {cert.memberships?.status === 'approved' ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(cert.issued_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(cert.certificate_url)}
                          disabled={!cert.certificate_url}
                        >
                          {cert.certificate_url ? (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </>
                          ) : (
                            'No File'
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAwardedCertificates;

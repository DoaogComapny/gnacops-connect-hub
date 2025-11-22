import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Check, Eye, X } from 'lucide-react';

export default function AdminMarketplaceMarketing() {
  const queryClient = useQueryClient();

  const { data: materials, isLoading } = useQuery({
    queryKey: ['marketing-materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_marketing_materials')
        .select('*, marketplace_vendors(business_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const approveMaterial = useMutation({
    mutationFn: async (materialId: string) => {
      const { error } = await supabase
        .from('marketplace_marketing_materials')
        .update({
          admin_approved: true,
          admin_approved_at: new Date().toISOString(),
          admin_approved_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', materialId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-materials'] });
      toast.success('Marketing material approved successfully');
    },
  });

  const rejectMaterial = useMutation({
    mutationFn: async (materialId: string) => {
      const { error } = await supabase
        .from('marketplace_marketing_materials')
        .update({
          admin_approved: false,
          is_active: false,
        })
        .eq('id', materialId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-materials'] });
      toast.success('Marketing material rejected');
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading marketing materials...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Marketing Management</h1>
        <p className="text-muted-foreground">Manage vendor marketing materials and platform promotions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Marketing Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Impressions</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials?.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.title}</TableCell>
                  <TableCell>{material.marketplace_vendors?.business_name}</TableCell>
                  <TableCell>{material.material_type}</TableCell>
                  <TableCell>
                    <Badge variant={material.admin_approved ? 'default' : 'secondary'}>
                      {material.admin_approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>{material.impressions}</TableCell>
                  <TableCell>{material.clicks}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(material.image_url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!material.admin_approved && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => approveMaterial.mutate(material.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectMaterial.mutate(material.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!materials || materials.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No marketing materials yet
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Banners & Promotions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Manage platform-wide promotional banners and carousel images here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

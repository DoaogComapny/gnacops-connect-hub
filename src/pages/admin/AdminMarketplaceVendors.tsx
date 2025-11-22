import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Check, X, Eye, Ban } from 'lucide-react';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function AdminMarketplaceVendors() {
  const queryClient = useQueryClient();
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['admin-vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_vendors')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const approveVendor = useMutation({
    mutationFn: async (vendorId: string) => {
      const { error } = await supabase
        .from('marketplace_vendors')
        .update({ 
          status: 'approved', 
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', vendorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      toast.success('Vendor approved successfully');
      setShowDetailsDialog(false);
    },
  });

  const rejectVendor = useMutation({
    mutationFn: async ({ vendorId, reason }: { vendorId: string; reason: string }) => {
      const { error } = await supabase
        .from('marketplace_vendors')
        .update({ status: 'rejected', rejection_reason: reason })
        .eq('id', vendorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      toast.success('Vendor rejected');
      setShowDetailsDialog(false);
      setRejectionReason('');
    },
  });

  const suspendVendor = useMutation({
    mutationFn: async (vendorId: string) => {
      const { error } = await supabase
        .from('marketplace_vendors')
        .update({ status: 'suspended' })
        .eq('id', vendorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      toast.success('Vendor suspended');
      setShowDetailsDialog(false);
    },
  });

  const handleViewDetails = (vendor: any) => {
    setSelectedVendor(vendor);
    setShowDetailsDialog(true);
  };

  const handleReject = () => {
    if (!selectedVendor || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    rejectVendor.mutate({ vendorId: selectedVendor.id, reason: rejectionReason });
  };

  if (isLoading) {
    return <div className="p-6">Loading vendors...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Vendor Management</h1>
        <p className="text-muted-foreground">Review and manage vendor applications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors?.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.business_name}</TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>{vendor.business_category}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        vendor.status === 'approved'
                          ? 'default'
                          : vendor.status === 'rejected'
                          ? 'destructive'
                          : vendor.status === 'suspended'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {vendor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(vendor.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(vendor)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {vendor.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => approveVendor.mutate(vendor.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleViewDetails(vendor)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {vendor.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => suspendVendor.mutate(vendor.id)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!vendors || vendors.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No vendor applications yet
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
            <DialogDescription>Review vendor application information</DialogDescription>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Business Name</Label>
                  <p>{selectedVendor.business_name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Category</Label>
                  <p>{selectedVendor.business_category}</p>
                </div>
                <div>
                  <Label className="font-semibold">Email</Label>
                  <p>{selectedVendor.email}</p>
                </div>
                <div>
                  <Label className="font-semibold">Phone</Label>
                  <p>{selectedVendor.phone}</p>
                </div>
                <div className="col-span-2">
                  <Label className="font-semibold">Address</Label>
                  <p>{selectedVendor.business_address}</p>
                </div>
                <div>
                  <Label className="font-semibold">Bank Name</Label>
                  <p>{selectedVendor.bank_name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="font-semibold">Account Number</Label>
                  <p>{selectedVendor.bank_account_number || 'N/A'}</p>
                </div>
              </div>

              {selectedVendor.business_documents?.length > 0 && (
                <div>
                  <Label className="font-semibold">Business Documents</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedVendor.business_documents.map((doc: string, index: number) => (
                      <a
                        key={index}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Document {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedVendor.identification_document && (
                <div>
                  <Label className="font-semibold">Identification</Label>
                  <a
                    href={selectedVendor.identification_document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline block mt-2"
                  >
                    View ID Document
                  </a>
                </div>
              )}

              {selectedVendor.status === 'pending' && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => approveVendor.mutate(selectedVendor.id)}
                      disabled={approveVendor.isPending}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve Vendor
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rejection-reason">Rejection Reason</Label>
                    <Textarea
                      id="rejection-reason"
                      placeholder="Provide reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={rejectVendor.isPending || !rejectionReason.trim()}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject Vendor
                    </Button>
                  </div>
                </div>
              )}

              {selectedVendor.status === 'rejected' && selectedVendor.rejection_reason && (
                <div className="p-4 bg-destructive/10 rounded-md">
                  <Label className="font-semibold">Rejection Reason</Label>
                  <p className="text-sm mt-2">{selectedVendor.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

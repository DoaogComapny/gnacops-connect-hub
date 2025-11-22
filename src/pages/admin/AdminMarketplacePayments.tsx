import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useState } from 'react';

export default function AdminMarketplacePayments() {
  const queryClient = useQueryClient();
  const [commissionRate, setCommissionRate] = useState('15');
  const [paystackPublicKey, setPaystackPublicKey] = useState('');
  const [paystackSecretKey, setPaystackSecretKey] = useState('');

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['marketplace-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_wallet_transactions')
        .select('*, marketplace_vendors(business_name)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['marketplace-withdrawals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_withdrawal_requests')
        .select('*, marketplace_vendors(business_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveSettings = useMutation({
    mutationFn: async () => {
      // Save commission rate and Paystack keys to site_settings or a dedicated table
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 'marketplace_settings',
          settings: {
            commission_rate: parseFloat(commissionRate),
            paystack_public_key: paystackPublicKey,
            paystack_secret_key: paystackSecretKey,
          },
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Payment settings saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save settings: ' + error.message);
    },
  });

  const processWithdrawal = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('marketplace_withdrawal_requests')
        .update({
          status,
          processed_at: new Date().toISOString(),
          processed_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-withdrawals'] });
      toast.success('Withdrawal processed successfully');
    },
  });

  if (transactionsLoading || withdrawalsLoading) {
    return <div className="p-6">Loading payment data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Payments & Paystack</h1>
        <p className="text-muted-foreground">Manage payment settings and transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paystack Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="commission_rate">Commission Rate (%)</Label>
              <Input
                id="commission_rate"
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="15"
              />
            </div>
            <div>
              <Label htmlFor="paystack_public_key">Paystack Public Key</Label>
              <Input
                id="paystack_public_key"
                value={paystackPublicKey}
                onChange={(e) => setPaystackPublicKey(e.target.value)}
                placeholder="pk_test_..."
              />
            </div>
          </div>
          <div>
            <Label htmlFor="paystack_secret_key">Paystack Secret Key</Label>
            <Input
              id="paystack_secret_key"
              type="password"
              value={paystackSecretKey}
              onChange={(e) => setPaystackSecretKey(e.target.value)}
              placeholder="sk_test_..."
            />
          </div>
          <Button onClick={() => saveSettings.mutate()}>
            Save Settings
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{transaction.marketplace_vendors?.business_name}</TableCell>
                      <TableCell>{transaction.transaction_type}</TableCell>
                      <TableCell>GH₵ {transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>GH₵ {transaction.balance_after?.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {!transactions || transactions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals?.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        {format(new Date(withdrawal.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{withdrawal.marketplace_vendors?.business_name}</TableCell>
                      <TableCell>GH₵ {withdrawal.amount.toFixed(2)}</TableCell>
                      <TableCell>{withdrawal.status}</TableCell>
                      <TableCell>
                        {withdrawal.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => processWithdrawal.mutate({ id: withdrawal.id, status: 'approved' })}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => processWithdrawal.mutate({ id: withdrawal.id, status: 'rejected' })}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {!withdrawals || withdrawals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No withdrawal requests
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

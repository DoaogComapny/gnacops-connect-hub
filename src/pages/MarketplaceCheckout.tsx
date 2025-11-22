import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarketplaceCart } from '@/hooks/useMarketplaceCart';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MarketplaceCheckout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useMarketplaceCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    deliveryPhone: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartItems || cartItems.length === 0) return;

    setIsProcessing(true);
    try {
      // Group items by vendor
      const itemsByVendor = cartItems.reduce((acc, item) => {
        const vendorId = item.marketplace_products?.vendor_id;
        if (!vendorId) return acc;
        if (!acc[vendorId]) acc[vendorId] = [];
        acc[vendorId].push(item);
        return acc;
      }, {} as Record<string, typeof cartItems>);

      // Create order for each vendor
      for (const [vendorId, items] of Object.entries(itemsByVendor)) {
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const totalAmount = items.reduce((sum, item) => {
          return sum + (item.marketplace_products?.price || 0) * item.quantity;
        }, 0);

        // Create order
        const { data: order, error: orderError } = await supabase
          .from('marketplace_orders')
          .insert({
            buyer_id: user!.id,
            vendor_id: vendorId,
            order_number: orderNumber,
            total_amount: totalAmount,
            delivery_address: formData.deliveryAddress,
            delivery_phone: formData.deliveryPhone,
            notes: formData.notes,
            payment_status: 'pending',
            order_status: 'pending',
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.marketplace_products?.price || 0,
          total_price: (item.marketplace_products?.price || 0) * item.quantity,
        }));

        const { error: itemsError } = await supabase
          .from('marketplace_order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      // Clear cart
      await clearCart();

      toast.success('Order placed successfully!');
      navigate('/marketplace/orders');
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    navigate('/marketplace/cart');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                    <Textarea
                      id="deliveryAddress"
                      required
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                      placeholder="Enter your full delivery address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryPhone">Phone Number *</Label>
                    <Input
                      id="deliveryPhone"
                      required
                      value={formData.deliveryPhone}
                      onChange={(e) => setFormData({ ...formData, deliveryPhone: e.target.value })}
                      placeholder="Contact number for delivery"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any special instructions for your order"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Items ({cartItems.length})</span>
                      <span>GH₵ {cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>GH₵ 0.00</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>GH₵ {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : 'Place Order'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

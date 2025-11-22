import { useMarketplaceCart } from '@/hooks/useMarketplaceCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MarketplaceCart() {
  const navigate = useNavigate();
  const { cartItems, isLoading, cartTotal, updateQuantity, removeFromCart } = useMarketplaceCart();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">Loading cart...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Start shopping to add items to your cart</p>
              <Link to="/marketplace">
                <Button>Continue Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const product = item.marketplace_products;
              const primaryImage = product?.marketplace_product_images?.find(img => img.is_primary)?.image_url;

              return (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {primaryImage && (
                        <img
                          src={primaryImage}
                          alt={product?.title}
                          className="w-24 h-24 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product?.title}</h3>
                        <p className="text-muted-foreground text-sm mb-2">
                          {product?.description?.substring(0, 100)}...
                        </p>
                        <p className="text-lg font-bold text-primary">
                          GH₵ {product?.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            className="w-16 text-center"
                            readOnly
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity({ id: item.id, quantity: item.quantity + 1 })}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
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
                <Button className="w-full" onClick={() => navigate('/marketplace/checkout')}>
                  Proceed to Checkout
                </Button>
                <Link to="/marketplace">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

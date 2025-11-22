import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarketplaceProducts } from '@/hooks/useMarketplaceProducts';
import { useMarketplaceCart } from '@/hooks/useMarketplaceCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MarketplacePage() {
  const { products, isLoading } = useMarketplaceProducts();
  const { addToCart, cartItems } = useMarketplaceCart();

  const cartCount = cartItems?.length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">Loading products...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <div className="flex gap-4">
            <Link to="/marketplace/cart">
              <Button variant="outline" className="relative">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart
                {cartCount > 0 && (
                  <Badge className="ml-2 absolute -top-2 -right-2">{cartCount}</Badge>
                )}
              </Button>
            </Link>
            <Link to="/vendor/signup">
              <Button>Become a Vendor</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((product) => {
            const primaryImage = product.marketplace_product_images?.find(img => img.is_primary)?.image_url;
            return (
              <Card key={product.id} className="hover-glow">
                <CardContent className="p-4">
                  {primaryImage && (
                    <img
                      src={primaryImage}
                      alt={product.title}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    GH₵ {product.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {product.marketplace_vendors?.business_name}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => addToCart({ productId: product.id })}
                  >
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {!products || products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products available yet.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

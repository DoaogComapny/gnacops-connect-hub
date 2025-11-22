import { useVendor } from '@/hooks/useVendor';
import { useMarketplaceProducts } from '@/hooks/useMarketplaceProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function VendorDashboard() {
  const { vendor, isLoading: vendorLoading } = useVendor();
  const { products, isLoading: productsLoading } = useMarketplaceProducts(vendor?.id);

  if (vendorLoading) {
    return <div>Loading...</div>;
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">You don't have a vendor account yet.</p>
              <Link to="/vendor/signup">
                <Button>Apply to become a vendor</Button>
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
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
            <Badge variant={vendor.status === 'approved' ? 'default' : 'secondary'}>
              {vendor.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{vendor.business_name}</p>
        </div>

        {vendor.status === 'pending' && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <p>Your vendor application is pending approval. You'll be able to add products once approved.</p>
            </CardContent>
          </Card>
        )}

        {vendor.status === 'approved' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">My Products</h2>
              <Link to="/vendor/products/new">
                <Button>Add New Product</Button>
              </Link>
            </div>

            {productsLoading ? (
              <div>Loading products...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products?.map((product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{product.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      <p className="text-lg font-bold text-primary mb-2">
                        GH₵ {product.price.toFixed(2)}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {product.requires_admin_approval && (
                          <Badge variant={product.admin_approved ? 'default' : 'secondary'}>
                            {product.admin_approved ? 'Approved' : 'Pending'}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-4">
                        <Link to={`/vendor/products/${product.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {products?.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">You haven't added any products yet.</p>
                  <Link to="/vendor/products/new">
                    <Button>Add Your First Product</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

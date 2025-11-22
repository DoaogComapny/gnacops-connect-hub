import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVendor } from '@/hooks/useVendor';
import { useMarketplaceProducts } from '@/hooks/useMarketplaceProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const categories = [
  'School Supplies',
  'Uniforms & Apparel',
  'Books & Educational Materials',
  'Technology & Electronics',
  'Furniture & Equipment',
  'Food & Catering',
  'Other',
];

export default function VendorProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vendor } = useVendor();
  const { createProduct, updateProduct, isCreating, isUpdating } = useMarketplaceProducts(vendor?.id);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    inventory_quantity: '',
    sku: '',
  });

  useEffect(() => {
    if (id) {
      // Fetch product data for editing
      supabase
        .from('marketplace_products')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) {
            setFormData({
              title: data.title,
              description: data.description || '',
              category: data.category,
              price: data.price.toString(),
              inventory_quantity: data.inventory_quantity?.toString() || '0',
              sku: data.sku || '',
            });
          }
        });
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      inventory_quantity: parseInt(formData.inventory_quantity),
      vendor_id: vendor!.id,
    };

    if (id) {
      updateProduct({ id, ...productData }, {
        onSuccess: () => navigate('/vendor/dashboard'),
      });
    } else {
      createProduct(productData, {
        onSuccess: () => navigate('/vendor/dashboard'),
      });
    }
  };

  if (!vendor || vendor.status !== 'approved') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p>You need to be an approved vendor to manage products.</p>
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
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{id ? 'Edit Product' : 'Add New Product'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (GH₵) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inventory_quantity">Stock Quantity *</Label>
                  <Input
                    id="inventory_quantity"
                    type="number"
                    required
                    value={formData.inventory_quantity}
                    onChange={(e) => setFormData({ ...formData, inventory_quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Product SKU (optional)"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/vendor/dashboard')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

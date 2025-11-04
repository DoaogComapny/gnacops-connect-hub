import { useState, useEffect } from "react";
import { Save, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FormCategory {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string | null;
}

const AdminPricingSettings = () => {
  const [categories, setCategories] = useState<FormCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('form_categories')
        .select('*')
        .eq('is_active', true)
        .order('position');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load membership categories');
    } finally {
      setLoading(false);
    }
  };

  const updatePrice = (id: string, newPrice: string) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, price: parseFloat(newPrice) || 0 } : cat
    ));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Update each category's price
      const updates = categories.map(cat => 
        supabase
          .from('form_categories')
          .update({ price: cat.price })
          .eq('id', cat.id)
      );

      await Promise.all(updates);

      toast.success('All prices updated successfully!');
      fetchCategories(); // Refresh to confirm
    } catch (error: any) {
      console.error('Error updating prices:', error);
      toast.error(error.message || 'Failed to update prices');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading pricing settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Membership Pricing</h1>
          <p className="text-muted-foreground">Set annual membership fees for each category</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <DollarSign className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-semibold">Annual Membership Fees</h2>
        </div>
        
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="border-b border-border pb-6 last:border-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <div className="w-48">
                  <label className="text-sm font-medium mb-2 block">Annual Fee (GHS)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₵</span>
                    <Input 
                      type="number"
                      step="0.01"
                      min="0"
                      value={category.price}
                      onChange={(e) => updatePrice(category.id, e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-4">
            <Button 
              variant="cta" 
              onClick={handleSaveAll}
              disabled={saving}
              size="lg"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save All Prices'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          Important Notes
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>These are annual membership fees charged to members</li>
          <li>Prices are automatically used in the payment system</li>
          <li>Changes take effect immediately for new registrations</li>
          <li>Existing pending payments will use the price at time of registration</li>
        </ul>
      </Card>
    </div>
  );
};

export default AdminPricingSettings;

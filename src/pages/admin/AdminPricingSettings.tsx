import { useState, useEffect } from "react";
import { Save, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";

interface FormCategory {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string | null;
  secondary_price: number | null;
  secondary_price_label: string | null;
}

const AdminPricingSettings = () => {
  const [categories, setCategories] = useState<FormCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { settings, updateSettings } = useSiteSettings();
  const [enableSecondaryPricing, setEnableSecondaryPricing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (settings) {
      setEnableSecondaryPricing(settings.enableSecondaryPricing || false);
    }
  }, [settings]);

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

  const updateCategory = (id: string, field: 'name' | 'description' | 'price' | 'secondary_price' | 'secondary_price_label', value: string | number) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { 
        ...cat, 
        [field]: (field === 'price' || field === 'secondary_price') ? parseFloat(value as string) || 0 : value 
      } : cat
    ));
  };

  const handleToggleSecondaryPricing = async (enabled: boolean) => {
    setEnableSecondaryPricing(enabled);
    
    if (settings) {
      updateSettings({
        ...settings,
        enableSecondaryPricing: enabled
      });
      toast.success(enabled ? 'Secondary pricing enabled' : 'Secondary pricing disabled');
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Update each category
      const updates = categories.map(cat => 
        supabase
          .from('form_categories')
          .update({ 
            name: cat.name,
            description: cat.description,
            price: cat.price,
            secondary_price: cat.secondary_price,
            secondary_price_label: cat.secondary_price_label
          })
          .eq('id', cat.id)
      );

      await Promise.all(updates);

      toast.success('All membership details updated successfully!');
      fetchCategories(); // Refresh to confirm
    } catch (error: any) {
      console.error('Error updating membership details:', error);
      toast.error(error.message || 'Failed to update membership details');
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
          <h1 className="text-3xl font-bold">Membership Management</h1>
          <p className="text-muted-foreground">Manage membership categories, titles, descriptions, and annual fees</p>
        </div>
      </div>

      {/* Secondary Pricing Toggle */}
      <Card className="p-6 bg-accent/10 border-accent/30">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="secondary-pricing" className="text-lg font-semibold">
              Enable Secondary Pricing (SMS/LMS Add-on)
            </Label>
            <p className="text-sm text-muted-foreground">
              When enabled, institutional memberships will display the School Management System fee as an additional charge. 
              Both prices will be combined and shown to users during registration.
            </p>
          </div>
          <Switch
            id="secondary-pricing"
            checked={enableSecondaryPricing}
            onCheckedChange={handleToggleSecondaryPricing}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <DollarSign className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-semibold">Membership Categories & Pricing</h2>
        </div>
        
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category.id} className="border-b border-border pb-8 last:border-0">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Membership Title</label>
                  <Input 
                    value={category.name}
                    onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                    placeholder="e.g., Institutional Membership"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea 
                    value={category.description || ''}
                    onChange={(e) => updateCategory(category.id, 'description', e.target.value)}
                    placeholder="Brief description of this membership type"
                    rows={3}
                  />
                </div>

                <div className="w-64">
                  <label className="text-sm font-medium mb-2 block">Annual Fee (GHS)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₵</span>
                    <Input 
                      type="number"
                      step="0.01"
                      min="0"
                      value={category.price}
                      onChange={(e) => updateCategory(category.id, 'price', e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                {category.type === 'institutional' && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold mb-3 text-accent">Secondary Price (SMS/LMS Add-on)</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        This secondary price will be added to the main fee and displayed together when secondary pricing is enabled above.
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Secondary Price Label</label>
                      <Input 
                        value={category.secondary_price_label || ''}
                        onChange={(e) => updateCategory(category.id, 'secondary_price_label', e.target.value)}
                        placeholder="e.g., School Management System Fee"
                      />
                    </div>

                    <div className="w-64">
                      <label className="text-sm font-medium mb-2 block">Secondary Price (GHS)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₵</span>
                        <Input 
                          type="number"
                          step="0.01"
                          min="0"
                          value={category.secondary_price || 0}
                          onChange={(e) => updateCategory(category.id, 'secondary_price', e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>

                    {enableSecondaryPricing && category.secondary_price && (
                      <div className="bg-accent/10 p-4 rounded-lg">
                        <p className="text-sm font-medium">
                          Total displayed to users: <span className="text-accent text-lg">GHS ₵{(category.price + (category.secondary_price || 0)).toFixed(2)}</span>
                        </p>
                      </div>
                    )}
                  </>
                )}
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
              {saving ? 'Saving...' : 'Save All Changes'}
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
          <li>Membership titles and descriptions appear on the registration pages</li>
          <li>Annual fees are automatically used in the payment system</li>
          <li>Changes take effect immediately for new registrations</li>
          <li>Existing pending payments will use the price at time of registration</li>
          <li>Titles should be clear and descriptions should explain the membership benefits</li>
          <li><strong>Secondary pricing:</strong> When enabled, the School Management System fee is shown alongside the main fee for institutional memberships</li>
        </ul>
      </Card>
    </div>
  );
};

export default AdminPricingSettings;
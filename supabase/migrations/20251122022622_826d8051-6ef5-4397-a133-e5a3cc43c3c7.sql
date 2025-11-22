-- =============================================
-- MULTI-VENDOR MARKETPLACE DATABASE SCHEMA
-- =============================================

-- Vendor applications and profiles
CREATE TABLE IF NOT EXISTS public.marketplace_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_category TEXT NOT NULL,
  business_address TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  bank_account_name TEXT,
  bank_account_number TEXT,
  bank_name TEXT,
  social_media_links JSONB DEFAULT '{}',
  business_documents JSONB DEFAULT '[]',
  identification_document TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  rejection_reason TEXT,
  commission_rate NUMERIC DEFAULT 15.0,
  wallet_balance NUMERIC DEFAULT 0,
  total_sales NUMERIC DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Admin-configurable onboarding questions
CREATE TABLE IF NOT EXISTS public.marketplace_onboarding_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'text' CHECK (question_type IN ('text', 'textarea', 'select', 'file')),
  options JSONB,
  is_required BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vendor application answers
CREATE TABLE IF NOT EXISTS public.marketplace_vendor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.marketplace_onboarding_questions(id) ON DELETE CASCADE,
  answer TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS public.marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  discount_percentage NUMERIC DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  sku TEXT,
  inventory_quantity INTEGER DEFAULT 0 CHECK (inventory_quantity >= 0),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  requires_admin_approval BOOLEAN DEFAULT false,
  admin_approved BOOLEAN DEFAULT false,
  admin_approved_by UUID REFERENCES auth.users(id),
  admin_approved_at TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Product images
CREATE TABLE IF NOT EXISTS public.marketplace_product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Shopping cart
CREATE TABLE IF NOT EXISTS public.marketplace_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Orders
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
  total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
  commission_amount NUMERIC DEFAULT 0,
  vendor_earnings NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  delivery_address TEXT NOT NULL,
  delivery_phone TEXT NOT NULL,
  payment_method TEXT DEFAULT 'paystack',
  payment_reference TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'ready_for_pickup', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled', 'failed')),
  notes TEXT,
  paid_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  dispatched_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order items
CREATE TABLE IF NOT EXISTS public.marketplace_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vendor staff
CREATE TABLE IF NOT EXISTS public.marketplace_vendor_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
  staff_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('product_manager', 'order_manager', 'marketing_manager', 'full_access')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(vendor_id, staff_user_id)
);

-- Delivery personnel
CREATE TABLE IF NOT EXISTS public.marketplace_delivery_personnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_type TEXT,
  is_active BOOLEAN DEFAULT true,
  total_deliveries INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Delivery assignments
CREATE TABLE IF NOT EXISTS public.marketplace_delivery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
  delivery_personnel_id UUID NOT NULL REFERENCES public.marketplace_delivery_personnel(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'picked_up', 'in_transit', 'delivered', 'failed')),
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  notes TEXT,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Marketing materials
CREATE TABLE IF NOT EXISTS public.marketplace_marketing_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
  material_type TEXT NOT NULL CHECK (material_type IN ('flyer', 'banner', 'sponsored_product')),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  admin_approved BOOLEAN DEFAULT false,
  admin_approved_by UUID REFERENCES auth.users(id),
  admin_approved_at TIMESTAMPTZ,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vendor wallet transactions
CREATE TABLE IF NOT EXISTS public.marketplace_wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'commission', 'withdrawal', 'refund')),
  amount NUMERIC NOT NULL,
  order_id UUID REFERENCES public.marketplace_orders(id),
  description TEXT,
  balance_after NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Withdrawal requests
CREATE TABLE IF NOT EXISTS public.marketplace_withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
  bank_details JSONB NOT NULL,
  admin_notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Product reviews
CREATE TABLE IF NOT EXISTS public.marketplace_product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, user_id, order_id)
);

-- Marketplace staff (separate from vendor staff)
CREATE TABLE IF NOT EXISTS public.marketplace_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('marketplace_admin', 'product_moderator', 'order_manager', 'delivery_manager', 'marketing_manager')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketplace_vendors_user_id ON public.marketplace_vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_vendors_status ON public.marketplace_vendors(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_vendor_id ON public.marketplace_products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category ON public.marketplace_products(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_is_active ON public.marketplace_products(is_active);
CREATE INDEX IF NOT EXISTS idx_marketplace_cart_user_id ON public.marketplace_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer_id ON public.marketplace_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_vendor_id ON public.marketplace_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status ON public.marketplace_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_marketplace_delivery_assignments_personnel ON public.marketplace_delivery_assignments(delivery_personnel_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_delivery_assignments_order ON public.marketplace_delivery_assignments(order_id);

-- Enable RLS
ALTER TABLE public.marketplace_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_onboarding_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_vendor_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_delivery_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_marketing_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_staff ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendors
CREATE POLICY "Vendors can view own profile" ON public.marketplace_vendors FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Vendors can update own profile" ON public.marketplace_vendors FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Anyone can create vendor application" ON public.marketplace_vendors FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage all vendors" ON public.marketplace_vendors FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for products
CREATE POLICY "Anyone can view active approved products" ON public.marketplace_products FOR SELECT USING (is_active = true AND (requires_admin_approval = false OR admin_approved = true));
CREATE POLICY "Vendors can manage own products" ON public.marketplace_products FOR ALL USING (vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all products" ON public.marketplace_products FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for cart
CREATE POLICY "Users can manage own cart" ON public.marketplace_cart FOR ALL USING (user_id = auth.uid());

-- RLS Policies for orders
CREATE POLICY "Buyers can view own orders" ON public.marketplace_orders FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Vendors can view own orders" ON public.marketplace_orders FOR SELECT USING (vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can update own orders" ON public.marketplace_orders FOR UPDATE USING (vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all orders" ON public.marketplace_orders FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for order items
CREATE POLICY "Users can view own order items" ON public.marketplace_order_items FOR SELECT USING (order_id IN (SELECT id FROM public.marketplace_orders WHERE buyer_id = auth.uid() OR vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid())));

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.marketplace_product_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.marketplace_product_reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own reviews" ON public.marketplace_product_reviews FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for delivery
CREATE POLICY "Delivery personnel can view own assignments" ON public.marketplace_delivery_assignments FOR SELECT USING (delivery_personnel_id IN (SELECT id FROM public.marketplace_delivery_personnel WHERE user_id = auth.uid()));
CREATE POLICY "Delivery personnel can update own assignments" ON public.marketplace_delivery_assignments FOR UPDATE USING (delivery_personnel_id IN (SELECT id FROM public.marketplace_delivery_personnel WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage delivery" ON public.marketplace_delivery_assignments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for marketing materials
CREATE POLICY "Vendors can manage own marketing" ON public.marketplace_marketing_materials FOR ALL USING (vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()));
CREATE POLICY "Anyone can view approved marketing" ON public.marketplace_marketing_materials FOR SELECT USING (is_active = true AND admin_approved = true);
CREATE POLICY "Admins can manage all marketing" ON public.marketplace_marketing_materials FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for vendor staff
CREATE POLICY "Vendors can manage own staff" ON public.marketplace_vendor_staff FOR ALL USING (vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()));
CREATE POLICY "Staff can view own assignment" ON public.marketplace_vendor_staff FOR SELECT USING (staff_user_id = auth.uid());

-- RLS Policies for wallet transactions
CREATE POLICY "Vendors can view own transactions" ON public.marketplace_wallet_transactions FOR SELECT USING (vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all transactions" ON public.marketplace_wallet_transactions FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for withdrawal requests
CREATE POLICY "Vendors can manage own withdrawals" ON public.marketplace_withdrawal_requests FOR ALL USING (vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all withdrawals" ON public.marketplace_withdrawal_requests FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for onboarding questions
CREATE POLICY "Anyone can view active questions" ON public.marketplace_onboarding_questions FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage questions" ON public.marketplace_onboarding_questions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for vendor applications
CREATE POLICY "Vendors can view own applications" ON public.marketplace_vendor_applications FOR SELECT USING (vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()));
CREATE POLICY "Vendors can create applications" ON public.marketplace_vendor_applications FOR INSERT WITH CHECK (vendor_id IN (SELECT id FROM public.marketplace_vendors WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all applications" ON public.marketplace_vendor_applications FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
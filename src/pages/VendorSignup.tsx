import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { Upload, FileText } from 'lucide-react';

const businessCategories = [
  'School Supplies',
  'Uniforms & Apparel',
  'Books & Educational Materials',
  'Technology & Electronics',
  'Furniture & Equipment',
  'Food & Catering',
  'Sports & Recreation',
  'Arts & Crafts',
  'Laboratory Equipment',
  'Other',
];

const productCategories = [
  'Stationery',
  'Textbooks',
  'Uniforms',
  'Electronics',
  'Furniture',
  'Sports Equipment',
  'Art Supplies',
  'Science Equipment',
  'Food & Beverages',
];

export default function VendorSignup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingQuestions, setOnboardingQuestions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    businessName: '',
    businessCategory: '',
    email: '',
    phone: '',
    businessAddress: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    websiteUrl: '',
  });
  const [selectedProductCategories, setSelectedProductCategories] = useState<string[]>([]);
  const [businessDocuments, setBusinessDocuments] = useState<File[]>([]);
  const [identificationDoc, setIdentificationDoc] = useState<File | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      toast.error('Please login to apply as a vendor');
      navigate('/login');
      return;
    }
    fetchOnboardingQuestions();
  }, [user, navigate]);

  const fetchOnboardingQuestions = async () => {
    const { data, error } = await supabase
      .from('marketplace_onboarding_questions')
      .select('*')
      .eq('is_active', true)
      .order('position');
    
    if (!error && data) {
      setOnboardingQuestions(data);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'business' | 'id') => {
    const files = e.target.files;
    if (!files) return;

    if (type === 'business') {
      setBusinessDocuments(Array.from(files));
    } else {
      setIdentificationDoc(files[0]);
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('site-assets')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Upload business documents
      const businessDocUrls = await Promise.all(
        businessDocuments.map(file => uploadFile(file, 'vendor-documents'))
      );

      // Upload identification document
      let idDocUrl = '';
      if (identificationDoc) {
        idDocUrl = await uploadFile(identificationDoc, 'vendor-id-documents');
      }

      // Create vendor application
      const { data: vendor, error: vendorError } = await supabase
        .from('marketplace_vendors')
        .insert({
          user_id: user.id,
          business_name: formData.businessName,
          business_category: formData.businessCategory,
          email: formData.email,
          phone: formData.phone,
          business_address: formData.businessAddress,
          bank_name: formData.bankName,
          bank_account_number: formData.bankAccountNumber,
          bank_account_name: formData.bankAccountName,
          business_documents: businessDocUrls,
          identification_document: idDocUrl,
          social_media_links: {
            facebook: formData.facebookUrl,
            instagram: formData.instagramUrl,
            twitter: formData.twitterUrl,
            website: formData.websiteUrl,
          },
          status: 'pending',
        })
        .select()
        .single();

      if (vendorError) throw vendorError;

      // Save onboarding question answers
      if (onboardingQuestions.length > 0) {
        const answers = onboardingQuestions.map(q => ({
          vendor_id: vendor.id,
          question_id: q.id,
          answer: questionAnswers[q.id] || '',
        }));

        const { error: answersError } = await supabase
          .from('marketplace_vendor_applications')
          .insert(answers);

        if (answersError) throw answersError;
      }

      toast.success('Vendor application submitted successfully! You will be notified once approved.');
      navigate('/vendor/dashboard');
    } catch (error: any) {
      console.error('Error submitting vendor application:', error);
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProductCategory = (category: string) => {
    setSelectedProductCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Become a Vendor</CardTitle>
            <CardDescription>
              Join our marketplace to sell your products to schools and educators across Ghana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessCategory">Business Category *</Label>
                    <Select
                      value={formData.businessCategory}
                      onValueChange={(value) => setFormData({ ...formData, businessCategory: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Business Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Business Address *</Label>
                  <Textarea
                    id="businessAddress"
                    required
                    value={formData.businessAddress}
                    onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                  />
                </div>
              </div>

              {/* Product Categories */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Categories You Want to Sell *</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {productCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedProductCategories.includes(category)}
                        onCheckedChange={() => toggleProductCategory(category)}
                      />
                      <label htmlFor={category} className="text-sm cursor-pointer">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payment Information *</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      required
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber">Account Number</Label>
                    <Input
                      id="bankAccountNumber"
                      required
                      value={formData.bankAccountNumber}
                      onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAccountName">Account Name</Label>
                    <Input
                      id="bankAccountName"
                      required
                      value={formData.bankAccountName}
                      onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Media & Online Presence</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebookUrl">Facebook URL</Label>
                    <Input
                      id="facebookUrl"
                      type="url"
                      placeholder="https://facebook.com/yourpage"
                      value={formData.facebookUrl}
                      onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagramUrl">Instagram URL</Label>
                    <Input
                      id="instagramUrl"
                      type="url"
                      placeholder="https://instagram.com/yourpage"
                      value={formData.instagramUrl}
                      onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitterUrl">Twitter/X URL</Label>
                    <Input
                      id="twitterUrl"
                      type="url"
                      placeholder="https://twitter.com/yourpage"
                      value={formData.twitterUrl}
                      onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <Input
                      id="websiteUrl"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Document Uploads */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Required Documents *</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessDocs">Business Documents (Registration, Licenses, etc.)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="businessDocs"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        required
                        onChange={(e) => handleFileChange(e, 'business')}
                      />
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    {businessDocuments.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {businessDocuments.length} file(s) selected
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idDoc">Identification Document (Ghana Card, Passport, etc.)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="idDoc"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        required
                        onChange={(e) => handleFileChange(e, 'id')}
                      />
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    {identificationDoc && (
                      <div className="text-sm text-muted-foreground">
                        {identificationDoc.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Onboarding Questions */}
              {onboardingQuestions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Information</h3>
                  {onboardingQuestions.map((question) => (
                    <div key={question.id} className="space-y-2">
                      <Label htmlFor={question.id}>
                        {question.question_text}
                        {question.is_required && ' *'}
                      </Label>
                      {question.question_type === 'text' && (
                        <Input
                          id={question.id}
                          required={question.is_required}
                          value={questionAnswers[question.id] || ''}
                          onChange={(e) =>
                            setQuestionAnswers({ ...questionAnswers, [question.id]: e.target.value })
                          }
                        />
                      )}
                      {question.question_type === 'textarea' && (
                        <Textarea
                          id={question.id}
                          required={question.is_required}
                          value={questionAnswers[question.id] || ''}
                          onChange={(e) =>
                            setQuestionAnswers({ ...questionAnswers, [question.id]: e.target.value })
                          }
                        />
                      )}
                      {question.question_type === 'select' && (
                        <Select
                          value={questionAnswers[question.id] || ''}
                          onValueChange={(value) =>
                            setQuestionAnswers({ ...questionAnswers, [question.id]: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            {question.options?.map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting Application...' : 'Submit Vendor Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

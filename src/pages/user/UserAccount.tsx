import { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, MapPin, Building, Save, Upload, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const UserAccount = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    avatar_url: "",
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    
    setUser(user);
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (profile) {
      setFormData({
        fullName: profile.full_name || "",
        email: user.email || "",
        phone: profile.phone || "",
        address: "",
        avatar_url: profile.avatar_url || "",
      });
    }

    const { data: membershipData } = await supabase
      .from("memberships")
      .select("*, form_categories(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    if (membershipData) {
      setMembership(membershipData);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    setUploading(true);
    try {
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setFormData({ ...formData, avatar_url: publicUrl });
      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
      await loadProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
      await loadProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      
      setPasswordData({
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-muted-foreground">Manage your profile information</p>
        </div>
        {!isEditing && (
          <Button variant="cta" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Overview */}
      <Card className="p-6 hover-card">
        <div className="flex items-center gap-6 mb-6">
          {formData.avatar_url ? (
            <img 
              src={formData.avatar_url} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white">
              {formData.fullName ? formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{formData.fullName || "User"}</h2>
            <p className="text-muted-foreground">{formData.email}</p>
            {membership && (
              <Badge variant="default" className="mt-2">
                {membership.status === 'approved' ? 'Active Member' : membership.status === 'pending' ? 'Pending Approval' : 'Inactive'}
              </Badge>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Photo"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG or WEBP. Max 5MB.
            </p>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </label>
            <Input 
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </label>
            <Input 
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </label>
            <Input 
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button variant="cta" onClick={handleSubmit} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          <Lock className="inline h-5 w-5 mr-2" />
          Change Password
        </h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="new_password">New Password</Label>
            <Input
              id="new_password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="Enter new password (min 6 characters)"
            />
          </div>

          <div>
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <Input
              id="confirm_password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
            />
          </div>

          <Button variant="cta" onClick={handlePasswordUpdate} disabled={loading}>
            <Lock className="mr-2 h-4 w-4" />
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </Card>

      {/* Membership Details */}
      {membership && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Membership Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">GNACOPS ID:</span>
              <span className="font-mono font-semibold">{membership.gnacops_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Membership Type:</span>
              <span className="font-semibold">{membership.form_categories?.name || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Join Date:</span>
              <span className="font-semibold">{new Date(membership.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Status:</span>
              <Badge variant={membership.payment_status === 'paid' ? 'default' : 'secondary'}>
                {membership.payment_status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={membership.status === 'approved' ? 'default' : 'secondary'}>
                {membership.status}
              </Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UserAccount;

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, MapPin, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Assignment {
  region: string;
  district: string;
}

interface Profile {
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
}

const DistrictAccountPage = () => {
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch assignment
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("staff_assignments")
        .select("region, district")
        .eq("user_id", user.id)
        .eq("role", "district_coordinator")
        .single();

      if (assignmentError) throw assignmentError;
      setAssignment(assignmentData);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email, phone, avatar_url")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      setFormData({
        full_name: profileData.full_name || "",
        phone: profileData.phone || "",
      });

    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load account data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      setUpdating(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      await fetchUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setUpdating(true);

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient-accent">My Account</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment Info (Read-Only) */}
        <Card className="hover-glow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>District Assignment</CardTitle>
            </div>
            <CardDescription>Your assigned region and district (read-only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Region</Label>
              <p className="text-lg font-semibold">{assignment?.region || "N/A"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">District</Label>
              <p className="text-lg font-semibold">{assignment?.district || "N/A"}</p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                To change your assignment, please contact the system administrator.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Role Info (Read-Only) */}
        <Card className="hover-glow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Role & Permissions</CardTitle>
            </div>
            <CardDescription>Your system role and access level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Role</Label>
              <p className="text-lg font-semibold">District Coordinator</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Access Level</Label>
              <p className="text-lg">Read-Only (View & Report)</p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                You can view all schools in your district and generate reports.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Settings */}
      <Card className="hover-glow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email (Read-Only)</Label>
              <Input
                id="email"
                value={profile?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleUpdateProfile} disabled={updating}>
              {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Update */}
      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleUpdatePassword} disabled={updating}>
              {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DistrictAccountPage;

import { useState } from "react";
import { User, Mail, Phone, MapPin, Building, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const UserAccount = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    email: "john@example.com",
    phone: "+233 50 123 4567",
    school: "ABC Academy",
    address: "123 Education Street, Accra",
    position: "Principal",
    bio: "Dedicated educator with 15 years of experience in private education management.",
  });

  const handleSubmit = () => {
    toast({
      title: "Profile Updated",
      description: "Your changes have been submitted for review.",
    });
    setIsEditing(false);
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
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white">
            {formData.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{formData.fullName}</h2>
            <p className="text-muted-foreground">{formData.position}</p>
            <Badge variant="default" className="mt-2">Active Member</Badge>
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

          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Building className="h-4 w-4" />
              School/Institution
            </label>
            <Input 
              value={formData.school}
              onChange={(e) => handleChange('school', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Position/Role
            </label>
            <Input 
              value={formData.position}
              onChange={(e) => handleChange('position', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </label>
            <Input 
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Bio</label>
            <Textarea 
              rows={4}
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button variant="cta" onClick={handleSubmit}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Membership Details */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Membership Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">GNACOPS ID:</span>
            <span className="font-mono font-semibold">GNACOPS251002</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Membership Type:</span>
            <span className="font-semibold">Institutional Membership</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Join Date:</span>
            <span className="font-semibold">January 10, 2025</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant="default">Active</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserAccount;

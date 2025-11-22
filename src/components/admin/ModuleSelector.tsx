import { Building2, Users, ShoppingBag } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ModuleSelector() {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentModule = () => {
    const path = location.pathname;
    if (path.includes('/office-management')) return 'office';
    if (path.includes('/marketplace')) return 'marketplace';
    return 'membership';
  };

  const handleModuleChange = (value: string) => {
    if (value === 'office') {
      navigate('/admin/panel/office-management');
    } else if (value === 'marketplace') {
      navigate('/admin/panel/marketplace');
    } else {
      navigate('/admin/panel');
    }
  };

  return (
    <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm">
      <div className="px-6 py-3 flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Module:</span>
        <Select value={getCurrentModule()} onValueChange={handleModuleChange}>
          <SelectTrigger className="w-[220px] bg-background/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Select Module</SelectLabel>
              <SelectItem value="membership">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>GNACOPS Membership</span>
                </div>
              </SelectItem>
              <SelectItem value="office">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>Office Management</span>
                </div>
              </SelectItem>
              <SelectItem value="marketplace">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Marketplace</span>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

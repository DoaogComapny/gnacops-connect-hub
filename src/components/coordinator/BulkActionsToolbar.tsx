import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BulkActionsToolbarProps {
  selectedSchools: string[];
  onActionComplete: () => void;
  coordinatorId: string;
}

export function BulkActionsToolbar({ selectedSchools, onActionComplete, coordinatorId }: BulkActionsToolbarProps) {
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false);
  const [flagType, setFlagType] = useState("");
  const [priority, setPriority] = useState("normal");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBulkFlag = async () => {
    if (!flagType) {
      toast.error("Please select a flag type");
      return;
    }

    if (selectedSchools.length === 0) {
      toast.error("No schools selected");
      return;
    }

    setIsSubmitting(true);

    try {
      const flags = selectedSchools.map(schoolId => ({
        school_id: schoolId,
        coordinator_id: coordinatorId,
        flag_type: flagType,
        notes: notes || null,
        priority,
        status: "open",
      }));

      const { error } = await supabase
        .from("school_flags")
        .insert(flags);

      if (error) throw error;

      toast.success(`Successfully flagged ${selectedSchools.length} school(s)`);
      setIsFlagDialogOpen(false);
      resetForm();
      onActionComplete();
    } catch (error) {
      console.error("Error flagging schools:", error);
      toast.error("Failed to flag schools");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkExport = async () => {
    if (selectedSchools.length === 0) {
      toast.error("No schools selected");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("form_submissions")
        .select(`
          id,
          submission_data,
          memberships!inner(
            gnacops_id,
            status,
            payment_status
          ),
          profiles!inner(
            status,
            paid_until
          )
        `)
        .in("id", selectedSchools);

      if (error) throw error;

      // Generate CSV
      const headers = ["School Name", "GNACOPS ID", "Region", "District", "Status", "Payment Status", "Expiry Date"];
      const csvRows = [headers.join(",")];

      data?.forEach(school => {
        const schoolData = school.submission_data as any;
        const membership = Array.isArray(school.memberships) ? school.memberships[0] : school.memberships;
        const profile = Array.isArray(school.profiles) ? school.profiles[0] : school.profiles;

        const row = [
          schoolData?.schoolName || "N/A",
          membership?.gnacops_id || "N/A",
          schoolData?.region || "N/A",
          schoolData?.district || "N/A",
          profile?.status || "N/A",
          membership?.payment_status || "N/A",
          profile?.paid_until ? new Date(profile.paid_until).toLocaleDateString() : "N/A",
        ];
        csvRows.push(row.map(cell => `"${cell}"`).join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `selected_schools_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${selectedSchools.length} school(s) to CSV`);
    } catch (error) {
      console.error("Error exporting schools:", error);
      toast.error("Failed to export schools");
    }
  };

  const resetForm = () => {
    setFlagType("");
    setPriority("normal");
    setNotes("");
  };

  if (selectedSchools.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2 p-4 bg-muted/50 border rounded-lg">
        <span className="text-sm font-medium">
          {selectedSchools.length} school(s) selected
        </span>
        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFlagDialogOpen(true)}
            className="gap-2"
          >
            <Flag className="h-4 w-4" />
            Flag Schools
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export to CSV
          </Button>
        </div>
      </div>

      <Dialog open={isFlagDialogOpen} onOpenChange={setIsFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Selected Schools</DialogTitle>
            <DialogDescription>
              Add a flag to {selectedSchools.length} selected school(s) for follow-up
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="flagType">
                Flag Type <span className="text-destructive">*</span>
              </Label>
              <Select value={flagType} onValueChange={setFlagType}>
                <SelectTrigger id="flagType">
                  <SelectValue placeholder="Select flag type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="follow_up">Follow Up Required</SelectItem>
                  <SelectItem value="compliance_issue">Compliance Issue</SelectItem>
                  <SelectItem value="payment_issue">Payment Issue</SelectItem>
                  <SelectItem value="documentation_needed">Documentation Needed</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or context..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFlagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkFlag} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Flag Schools
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
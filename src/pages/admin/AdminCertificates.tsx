import { useState } from "react";
import { Shield, Download, Send, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const AdminCertificates = () => {
  const { toast } = useToast();
  const [certificates] = useState([
    { id: 1, gnacopsId: "GNACOPS251001", name: "John Doe", type: "Institutional", status: "Generated", date: "2025-01-16" },
    { id: 2, gnacopsId: "GNACOPS251002", name: "Jane Smith", type: "Teacher Council", status: "Sent", date: "2025-01-15" },
    { id: 3, gnacopsId: "GNACOPS251003", name: "Bob Johnson", type: "Proprietor", status: "Pending", date: "2025-01-14" },
  ]);

  const handleGenerate = (id: number) => {
    toast({
      title: "Certificate Generated",
      description: "The certificate has been created successfully.",
    });
  };

  const handleSend = (id: number) => {
    toast({
      title: "Certificate Sent",
      description: "The certificate has been sent via email.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Certificate Management</h1>
          <p className="text-muted-foreground">Generate and manage member certificates</p>
        </div>
        <Button variant="cta">
          <FileText className="mr-2 h-4 w-4" />
          Bulk Generate
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Generated</p>
              <p className="text-3xl font-bold text-primary">
                {certificates.filter(c => c.status === "Generated").length}
              </p>
            </div>
            <Shield className="h-10 w-10 text-primary/50" />
          </div>
        </Card>

        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sent</p>
              <p className="text-3xl font-bold text-green-600">
                {certificates.filter(c => c.status === "Sent").length}
              </p>
            </div>
            <Send className="h-10 w-10 text-green-500/50" />
          </div>
        </Card>

        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {certificates.filter(c => c.status === "Pending").length}
              </p>
            </div>
            <FileText className="h-10 w-10 text-yellow-500/50" />
          </div>
        </Card>
      </div>

      {/* Certificates Table */}
      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>GNACOPS ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell className="font-mono font-medium">{cert.gnacopsId}</TableCell>
                <TableCell className="font-medium">{cert.name}</TableCell>
                <TableCell>{cert.type}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      cert.status === "Sent" ? "default" : 
                      cert.status === "Generated" ? "secondary" : 
                      "outline"
                    }
                  >
                    {cert.status}
                  </Badge>
                </TableCell>
                <TableCell>{cert.date}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {cert.status === "Pending" && (
                      <Button size="sm" variant="outline" onClick={() => handleGenerate(cert.id)}>
                        <Shield className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    )}
                    {cert.status === "Generated" && (
                      <Button size="sm" variant="cta" onClick={() => handleSend(cert.id)}>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminCertificates;

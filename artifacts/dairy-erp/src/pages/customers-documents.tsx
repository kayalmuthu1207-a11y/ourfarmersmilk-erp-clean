import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, Download, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { customers } from "@/data/mock";
import { useToast } from "@/hooks/use-toast";

const mockDocs = [
  { id: 1, customer: "Prestige Towers Apartments", type: "Contract", filename: "contract_2026.pdf", uploaded: "15 Jan 2026", expiry: "31 Dec 2026", status: "Valid" },
  { id: 2, customer: "Prestige Towers Apartments", type: "GST Certificate", filename: "gst_cert.pdf", uploaded: "10 Jan 2025", expiry: "-", status: "Valid" },
  { id: 3, customer: "Hotel Saravana Bhavan", type: "Address Proof", filename: "eb_bill.pdf", uploaded: "05 Jun 2025", expiry: "05 Jun 2026", status: "Expired" },
  { id: 4, customer: "TCS Office Campus", type: "Contract", filename: "vendor_agreement.pdf", uploaded: "01 Aug 2025", expiry: "31 Jul 2026", status: "Expiring Soon" },
];

export default function CustomerDocuments() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleUpload = () => {
    toast({ title: "Document Uploaded", description: "The document has been successfully uploaded and saved." });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Customer Documents</h1>
          <p className="text-muted-foreground">Manage contracts, certificates and proofs.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Upload className="h-4 w-4" /> Upload Document</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Customer</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Document Type</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="gst">GST Certificate</SelectItem>
                    <SelectItem value="pan">PAN Card</SelectItem>
                    <SelectItem value="address">Address Proof</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>File</Label>
                <Input type="file" />
              </div>
              <div className="grid gap-2">
                <Label>Expiry Date (Optional)</Label>
                <Input type="date" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleUpload}>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <CardTitle>Document Repository</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Filename</TableHead>
                <TableHead>Uploaded On</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDocs.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.customer}</TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell className="text-blue-600 hover:underline cursor-pointer">{doc.filename}</TableCell>
                  <TableCell>{doc.uploaded}</TableCell>
                  <TableCell>{doc.expiry}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      doc.status === 'Valid' ? 'text-green-600 border-green-600' :
                      doc.status === 'Expiring Soon' ? 'text-amber-600 border-amber-600' :
                      'text-destructive border-destructive'
                    }>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
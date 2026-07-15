import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { customers, products } from "@/data/mock";

const creditNotes = [
  { id: "cn1", num: "CN-0041", date: "2026-07-02", customer: "Prestige Towers Apartments", invoice: "INV-2210", reason: "Leakage", product: "Pasteurized Milk 500ml pouch", qty: 5, amount: 140, status: "Approved" },
  { id: "cn2", num: "CN-0040", date: "2026-07-01", customer: "Hotel Saravana Bhavan", invoice: "INV-2205", reason: "Shortage", product: "Toned Milk 1L", qty: 10, amount: 500, status: "Applied" },
  { id: "cn3", num: "CN-0039", date: "2026-06-30", customer: "TCS Office Campus", invoice: "INV-2199", reason: "Damage", product: "Curd 200g", qty: 20, amount: 300, status: "Applied" },
  { id: "cn4", num: "CN-0038", date: "2026-06-29", customer: "Brigade Residency", invoice: "INV-2195", reason: "Pricing Error", product: "Pasteurized Milk 1L", qty: 80, amount: 800, status: "Applied" },
  { id: "cn5", num: "CN-0037", date: "2026-06-28", customer: "Infosys Cafeteria", invoice: "INV-2190", reason: "Return", product: "Curd 200g", qty: 30, amount: 450, status: "Applied" },
  { id: "cn6", num: "CN-0036", date: "2026-06-27", customer: "Hotel Palmgrove", invoice: "INV-2185", reason: "Leakage", product: "Toned Milk 500ml", qty: 8, amount: 208, status: "Approved" },
  { id: "cn7", num: "CN-0035", date: "2026-06-26", customer: "Anjappar Restaurant", invoice: "INV-2180", reason: "Shortage", product: "Paneer 200g", qty: 5, amount: 450, status: "Draft" },
  { id: "cn8", num: "CN-0034", date: "2026-06-25", customer: "Sri Murugan Stores", invoice: "INV-2174", reason: "Damage", product: "Butter 100g", qty: 3, amount: 165, status: "Applied" },
  { id: "cn9", num: "CN-0033", date: "2026-06-24", customer: "Fresh Mart", invoice: "INV-2170", reason: "Return", product: "Ghee 500ml", qty: 2, amount: 700, status: "Applied" },
  { id: "cn10", num: "CN-0032", date: "2026-06-23", customer: "Quality Dairy Shop", invoice: "INV-2165", reason: "Leakage", product: "Pasteurized Milk 500ml pouch", qty: 6, amount: 168, status: "Applied" },
];

const statusBadge: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-600 border-gray-200",
  Approved: "bg-blue-100 text-blue-800 border-blue-200",
  Applied: "bg-green-100 text-green-800 border-green-200",
};

export default function CreditNotes() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const totalThisMonth = creditNotes.filter((cn) => cn.date.startsWith("2026-07")).reduce((s, cn) => s + cn.amount, 0) + 9510;

  const filtered = creditNotes.filter((cn) => cn.customer.toLowerCase().includes(search.toLowerCase()) || cn.num.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Credit Notes</h1>
          <p className="text-muted-foreground text-sm mt-1">Issued adjustments and deductions against customer invoices</p>
        </div>
        <Button onClick={() => setOpen(true)} data-testid="btn-create-cn"><Plus className="h-4 w-4 mr-2" />Create Credit Note</Button>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Credit Notes — This Month</p>
            <p className="text-2xl font-bold text-primary mt-1">₹{totalThisMonth.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Pending Application</p>
            <p className="text-xl font-bold text-amber-600 mt-1">₹{creditNotes.filter((cn) => cn.status !== "Applied").reduce((s, cn) => s + cn.amount, 0).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search credit notes..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="search-cn" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Credit Note#</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Against Invoice</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cn) => (
                <TableRow key={cn.id}>
                  <TableCell className="font-mono font-medium">{cn.num}</TableCell>
                  <TableCell className="text-sm">{cn.date}</TableCell>
                  <TableCell>{cn.customer}</TableCell>
                  <TableCell className="font-mono text-sm">{cn.invoice}</TableCell>
                  <TableCell><Badge variant="outline">{cn.reason}</Badge></TableCell>
                  <TableCell className="text-sm">{cn.product}</TableCell>
                  <TableCell className="text-right">{cn.qty}</TableCell>
                  <TableCell className="text-right font-medium">₹{cn.amount.toLocaleString()}</TableCell>
                  <TableCell><Badge className={statusBadge[cn.status]}>{cn.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Credit Note</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Customer</Label>
              <Select><SelectTrigger className="mt-1" data-testid="select-customer"><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Against Invoice#</Label><Input className="mt-1" placeholder="INV-XXXX" data-testid="input-invoice" /></div>
            <div><Label>Reason</Label>
              <Select><SelectTrigger className="mt-1" data-testid="select-reason"><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>{["Leakage","Shortage","Damage","Return","Pricing Error"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Product</Label>
              <Select><SelectTrigger className="mt-1" data-testid="select-product"><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantity</Label><Input type="number" className="mt-1" data-testid="input-qty" /></div>
              <div><Label>Amount (₹)</Label><Input type="number" className="mt-1" data-testid="input-amount" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)} data-testid="btn-save-cn">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

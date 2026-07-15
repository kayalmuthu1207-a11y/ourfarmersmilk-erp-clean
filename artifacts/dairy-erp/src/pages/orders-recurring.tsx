import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pause, Play, Edit2, Trash2, RefreshCw } from "lucide-react";
import { customers, products } from "@/data/mock";

const recurring = [
  { id: "ro1", customer: "Prestige Towers Apartments", product: "Pasteurized Milk 500ml pouch", qty: 120, unit: "Pouches", from: "2026-06-01", to: "2026-08-31", status: "Active", modified: "2026-06-28" },
  { id: "ro2", customer: "Prestige Towers Apartments", product: "Curd 200g", qty: 60, unit: "Cups", from: "2026-06-01", to: "2026-08-31", status: "Active", modified: "2026-06-15" },
  { id: "ro3", customer: "Brigade Residency", product: "Pasteurized Milk 1L", qty: 80, unit: "Packets", from: "2026-05-01", to: "2026-07-31", status: "Active", modified: "2026-06-01" },
  { id: "ro4", customer: "Hotel Saravana Bhavan", product: "Toned Milk 1L", qty: 200, unit: "Packets", from: "2026-04-01", to: "2026-12-31", status: "Active", modified: "2026-04-01" },
  { id: "ro5", customer: "Hotel Saravana Bhavan", product: "Curd 500g", qty: 50, unit: "Pouches", from: "2026-04-01", to: "2026-12-31", status: "Active", modified: "2026-05-10" },
  { id: "ro6", customer: "TCS Office Campus", product: "Pasteurized Milk 500ml pouch", qty: 500, unit: "Pouches", from: "2026-01-01", to: "2026-12-31", status: "Active", modified: "2026-01-01" },
  { id: "ro7", customer: "TCS Office Campus", product: "Curd 200g", qty: 150, unit: "Cups", from: "2026-01-01", to: "2026-12-31", status: "Paused", modified: "2026-06-20" },
  { id: "ro8", customer: "Infosys Cafeteria", product: "Paneer 200g", qty: 30, unit: "Packets", from: "2026-03-01", to: "2026-06-30", status: "Expired", modified: "2026-03-01" },
  { id: "ro9", customer: "Sri Murugan Stores", product: "Ghee 500ml", qty: 10, unit: "Jars", from: "2026-05-01", to: "2026-07-31", status: "Active", modified: "2026-05-01" },
  { id: "ro10", customer: "Fresh Mart", product: "Butter 100g", qty: 20, unit: "Cartons", from: "2026-06-15", to: "2026-09-15", status: "Active", modified: "2026-06-15" },
];

const statusBadge: Record<string, string> = {
  Active: "bg-green-100 text-green-800 border-green-200",
  Paused: "bg-amber-100 text-amber-800 border-amber-200",
  Expired: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function RecurringOrders() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? recurring : recurring.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recurring Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">Standing daily orders auto-generated at 12:00 AM each day</p>
        </div>
        <Button data-testid="btn-add-recurring" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Recurring Order</Button>
      </div>

      <Card className="border-amber-200 bg-amber-50/60">
        <CardContent className="p-4 flex items-start gap-3">
          <RefreshCw className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">Recurring orders auto-generate as order entries each day at 12:00 AM. Customers can still override quantities via the portal before the 8:00 PM cutoff.</p>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Filter:</span>
        {["All", "Active", "Paused", "Expired"].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} data-testid={`filter-${s.toLowerCase()}`}>{s}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Daily Qty</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Valid From</TableHead>
                <TableHead>Valid To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.customer}</TableCell>
                  <TableCell>{r.product}</TableCell>
                  <TableCell className="text-right font-mono">{r.qty}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.unit}</TableCell>
                  <TableCell className="text-sm">{r.from}</TableCell>
                  <TableCell className="text-sm">{r.to}</TableCell>
                  <TableCell><Badge className={statusBadge[r.status]}>{r.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.modified}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {r.status === "Active" && <Button size="icon" variant="ghost" className="h-7 w-7"><Pause className="h-3.5 w-3.5" /></Button>}
                      {r.status === "Paused" && <Button size="icon" variant="ghost" className="h-7 w-7"><Play className="h-3.5 w-3.5" /></Button>}
                      <Button size="icon" variant="ghost" className="h-7 w-7"><Edit2 className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Recurring Order</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Customer</Label>
              <Select><SelectTrigger className="mt-1" data-testid="select-customer"><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Product</Label>
              <Select><SelectTrigger className="mt-1" data-testid="select-product"><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Daily Qty</Label><Input type="number" className="mt-1" placeholder="0" data-testid="input-qty" /></div>
              <div><Label>Unit</Label><Input className="mt-1" placeholder="Pouches" data-testid="input-unit" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date</Label><Input type="date" className="mt-1" defaultValue="2026-07-04" /></div>
              <div><Label>End Date</Label><Input type="date" className="mt-1" defaultValue="2026-09-30" /></div>
            </div>
            <div><Label>Notes</Label><Input className="mt-1" placeholder="Optional notes" data-testid="input-notes" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button data-testid="btn-save-recurring" onClick={() => setOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

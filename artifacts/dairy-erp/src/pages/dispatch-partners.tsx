import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit2, Star } from "lucide-react";

const partners = [
  { id: "d1", name: "Suresh K", mobile: "9841234567", vehicle: "TN 01 AB 1234", route: "Route A — South West", status: "Active", deliveries: 143, rating: 4.8, joined: "2024-03-15" },
  { id: "d2", name: "Arjun P", mobile: "9842345678", vehicle: "TN 01 EF 9012", route: "Route B — Central South", status: "Active", deliveries: 128, rating: 4.7, joined: "2024-05-01" },
  { id: "d3", name: "Senthil R", mobile: "9843456789", vehicle: "TN 01 CD 5678", route: "Route C — South Suburbs", status: "Active", deliveries: 156, rating: 4.9, joined: "2024-01-10" },
  { id: "d4", name: "Manoj G", mobile: "9844567890", vehicle: "TN 01 AB 1234", route: "Route D — Hotels", status: "Active", deliveries: 98, rating: 4.6, joined: "2024-08-20" },
  { id: "d5", name: "Vijay C", mobile: "9845678901", vehicle: "TN 01 CD 5678", route: "Route E — IT Offices", status: "On Leave", deliveries: 112, rating: 4.5, joined: "2024-06-05" },
  { id: "d6", name: "Karthik M", mobile: "9846789012", vehicle: "TN 01 GH 3456", route: "Route F — Retail", status: "Active", deliveries: 87, rating: 4.7, joined: "2024-11-12" },
  { id: "d7", name: "Balu S", mobile: "9847890123", vehicle: "TN 01 IJ 7890", route: "Route B — Central South", status: "Active", deliveries: 73, rating: 4.4, joined: "2025-01-08" },
  { id: "d8", name: "Rajan T", mobile: "9848901234", vehicle: "—", route: "—", status: "Inactive", deliveries: 0, rating: 0, joined: "2025-03-22" },
];

const statusBadge: Record<string, string> = {
  Active: "bg-green-100 text-green-800 border-green-200",
  "On Leave": "bg-amber-100 text-amber-800 border-amber-200",
  Inactive: "bg-gray-100 text-gray-600 border-gray-200",
};

function RatingStars({ val }: { val: number }) {
  return (
    <span className="flex items-center gap-1 text-sm">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      {val > 0 ? val.toFixed(1) : "—"}
    </span>
  );
}

export default function DeliveryPartners() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? partners : partners.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Delivery Partners</h1>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Preview</Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">Driver and delivery partner management</p>
        </div>
        <Button onClick={() => setOpen(true)} data-testid="btn-add-partner"><Plus className="h-4 w-4 mr-2" />Add Partner</Button>
      </div>

      <Card className="border-blue-200 bg-blue-50/60">
        <CardContent className="p-4 text-sm text-blue-800">
          Illustrative preview only — there's no delivery-partner or vehicle table in the schema yet, so nothing here
          is persisted or linked to real dispatch/route data.
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active", value: partners.filter((p) => p.status === "Active").length, color: "text-green-600" },
          { label: "On Leave", value: partners.filter((p) => p.status === "On Leave").length, color: "text-amber-600" },
          { label: "This Month Deliveries", value: partners.reduce((s, p) => s + p.deliveries, 0), color: "text-foreground" },
        ].map((s) => (
          <Card key={s.label}><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle></CardHeader><CardContent><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></CardContent></Card>
        ))}
      </div>

      <div className="flex gap-2">
        {["All", "Active", "On Leave", "Inactive"].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} data-testid={`filter-${s.toLowerCase().replace(" ", "-")}`}>{s}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Deliveries (Month)</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="font-mono text-sm">{p.mobile}</TableCell>
                  <TableCell className="font-mono text-sm">{p.vehicle}</TableCell>
                  <TableCell className="text-sm">{p.route}</TableCell>
                  <TableCell><Badge className={statusBadge[p.status]}>{p.status}</Badge></TableCell>
                  <TableCell className="text-right">{p.deliveries}</TableCell>
                  <TableCell><RatingStars val={p.rating} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.joined}</TableCell>
                  <TableCell><Button size="icon" variant="ghost" className="h-7 w-7"><Edit2 className="h-3.5 w-3.5" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Delivery Partner</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Full Name</Label><Input className="mt-1" data-testid="input-name" /></div>
              <div><Label>Mobile</Label><Input className="mt-1" data-testid="input-mobile" /></div>
            </div>
            <div><Label>Vehicle Assigned</Label><Input className="mt-1" placeholder="Registration number" data-testid="input-vehicle" /></div>
            <div><Label>Route</Label><Input className="mt-1" placeholder="Route name" data-testid="input-route" /></div>
            <div><Label>Joined Date</Label><Input type="date" className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)} data-testid="btn-save-partner">Add Partner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

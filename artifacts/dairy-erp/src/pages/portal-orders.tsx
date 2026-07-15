import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Eye } from "lucide-react";

const orders = Array.from({ length: 15 }, (_, i) => {
  const statuses = ["Delivered", "Delivered", "Delivered", "Placed", "Modified"];
  const day = String(3 - Math.floor(i / 5)).padStart(2, "0");
  const val = 4440 + (i % 3) * 540;
  return {
    id: `ORD-${2441 - i}`,
    date: `2026-07-0${Math.max(1, 3 - Math.floor(i / 5))}`,
    products: i % 2 === 0 ? ["Pasteurized Milk 500ml ×120", "Curd 200g ×60"] : ["Pasteurized Milk 500ml ×140", "Curd 200g ×60"],
    totalVal: val,
    status: statuses[i % statuses.length],
    mods: i % 4 === 0 ? ["14:32 — Qty changed: 120→140 pouches milk (by Customer)"] : [],
  };
});

const statusBadge: Record<string, string> = {
  Delivered: "bg-green-100 text-green-800 border-green-200",
  Placed: "bg-blue-100 text-blue-800 border-blue-200",
  Modified: "bg-amber-100 text-amber-800 border-amber-200",
  Cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function PortalOrders() {
  const [selected, setSelected] = useState<(typeof orders)[0] | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = orders.filter((o) => {
    const ms = o.id.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "All" || o.status === filter;
    return ms && mf;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Order History</h1>
        <p className="text-muted-foreground text-sm mt-1">Prestige Towers Apartments — last 30 days</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search order#..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="search-orders" /></div>
            <Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-40" data-testid="filter-status"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="All">All</SelectItem>{["Delivered","Placed","Modified","Cancelled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order#</TableHead>
                <TableHead>For Date</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Value (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono font-medium">{o.id}</TableCell>
                  <TableCell className="text-sm">{o.date}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{o.products.join(", ")}</TableCell>
                  <TableCell className="text-right font-medium">₹{o.totalVal.toLocaleString()}</TableCell>
                  <TableCell><Badge className={statusBadge[o.status]}>{o.status}</Badge></TableCell>
                  <TableCell><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelected(o)} data-testid={`view-${o.id}`}><Eye className="h-3.5 w-3.5" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Order — {selected?.id}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Delivery Date</p><p className="font-medium">{selected.date}</p></div>
                <div><p className="text-muted-foreground">Status</p><Badge className={statusBadge[selected.status]}>{selected.status}</Badge></div>
              </div>
              <div>
                <p className="font-medium mb-2">Products</p>
                <div className="border rounded divide-y">
                  {selected.products.map((p, i) => <div key={i} className="px-3 py-2 text-sm">{p}</div>)}
                </div>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Total Value</span><span>₹{selected.totalVal.toLocaleString()}</span>
              </div>
              {selected.mods.length > 0 && (
                <div>
                  <p className="font-medium mb-2 text-amber-700">Modifications</p>
                  {selected.mods.map((m, i) => <div key={i} className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">{m}</div>)}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

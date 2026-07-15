import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Download } from "lucide-react";
import { farmers } from "@/data/mock";

const periods = [
  { id: "p1", period: "21 Jun – 30 Jun 2026", date: "2026-07-01", farmers: 87, qty: 48200, amount: 1586600, deductions: 12400, netPaid: 1574200, status: "Paid" },
  { id: "p2", period: "11 Jun – 20 Jun 2026", date: "2026-06-21", farmers: 84, qty: 46800, amount: 1544400, deductions: 11800, netPaid: 1532600, status: "Paid" },
  { id: "p3", period: "01 Jun – 10 Jun 2026", date: "2026-06-11", farmers: 86, qty: 47500, amount: 1567500, deductions: 12100, netPaid: 1555400, status: "Paid" },
  { id: "p4", period: "21 May – 31 May 2026", date: "2026-06-01", farmers: 85, qty: 52700, amount: 1739100, deductions: 13200, netPaid: 1725900, status: "Paid" },
  { id: "p5", period: "11 May – 20 May 2026", date: "2026-05-21", farmers: 83, qty: 46200, amount: 1524600, deductions: 11500, netPaid: 1513100, status: "Paid" },
  { id: "p6", period: "01 May – 10 May 2026", date: "2026-05-11", farmers: 82, qty: 45800, amount: 1511400, deductions: 11200, netPaid: 1500200, status: "Paid" },
  { id: "p7", period: "21 Apr – 30 Apr 2026", date: "2026-05-01", farmers: 81, qty: 44900, amount: 1481700, deductions: 10800, netPaid: 1470900, status: "Paid" },
  { id: "p8", period: "11 Apr – 20 Apr 2026", date: "2026-04-21", farmers: 80, qty: 44200, amount: 1458600, deductions: 10500, netPaid: 1448100, status: "Paid" },
  { id: "p9", period: "01 Jul – 10 Jul 2026", date: "", farmers: 0, qty: 0, amount: 0, deductions: 0, netPaid: 0, status: "Pending" },
];

const statusBadge: Record<string, string> = {
  Paid: "bg-green-100 text-green-800 border-green-200",
  "Partially Paid": "bg-amber-100 text-amber-800 border-amber-200",
  Pending: "bg-gray-100 text-gray-600 border-gray-200",
};

const farmerBreakdown = farmers.map((f, i) => ({
  ...f,
  amQty: 1200 + i * 80,
  pmQty: 1000 + i * 70,
  totalQty: 2200 + i * 150,
  avgFat: +(3.9 + i * 0.05).toFixed(2),
  avgSnf: +(8.2 + i * 0.03).toFixed(2),
  rate: +(32 + i * 0.4).toFixed(2),
  amount: Math.round((2200 + i * 150) * (32 + i * 0.4)),
  deduction: 1200 + i * 50,
  netPaid: 0,
})).map((f) => ({ ...f, netPaid: f.amount - f.deduction }));

export default function FarmerSettlementHistory() {
  const [selected, setSelected] = useState<(typeof periods)[0] | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settlement History</h1>
          <p className="text-muted-foreground text-sm mt-1">All 10-day farmer settlement periods</p>
        </div>
        <Select defaultValue="2026">
          <SelectTrigger className="w-36" data-testid="filter-year"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="2026">2026</SelectItem><SelectItem value="2025">2025</SelectItem></SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Settlement Period</TableHead>
                <TableHead>Settlement Date</TableHead>
                <TableHead className="text-right">Farmers</TableHead>
                <TableHead className="text-right">Total Qty (L)</TableHead>
                <TableHead className="text-right">Gross Amount (₹)</TableHead>
                <TableHead className="text-right">Deductions (₹)</TableHead>
                <TableHead className="text-right">Net Paid (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.period}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.date || "—"}</TableCell>
                  <TableCell className="text-right">{p.farmers || "—"}</TableCell>
                  <TableCell className="text-right">{p.qty > 0 ? `${p.qty.toLocaleString()} L` : "—"}</TableCell>
                  <TableCell className="text-right">{p.amount > 0 ? `₹${p.amount.toLocaleString()}` : "—"}</TableCell>
                  <TableCell className="text-right">{p.deductions > 0 ? `₹${p.deductions.toLocaleString()}` : "—"}</TableCell>
                  <TableCell className="text-right font-bold">{p.netPaid > 0 ? `₹${p.netPaid.toLocaleString()}` : "—"}</TableCell>
                  <TableCell><Badge className={statusBadge[p.status]}>{p.status}</Badge></TableCell>
                  <TableCell>
                    {p.status !== "Pending" && (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelected(p)} data-testid={`view-${p.id}`}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Farmer Breakdown — {selected?.period}</DialogTitle></DialogHeader>
          <div className="overflow-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead className="text-right">AM Qty (L)</TableHead>
                  <TableHead className="text-right">PM Qty (L)</TableHead>
                  <TableHead className="text-right">Total (L)</TableHead>
                  <TableHead className="text-right">Avg FAT</TableHead>
                  <TableHead className="text-right">Avg SNF</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                  <TableHead className="text-right">Deduction (₹)</TableHead>
                  <TableHead className="text-right">Net (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {farmerBreakdown.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{f.village}</TableCell>
                    <TableCell className="text-right">{f.amQty}</TableCell>
                    <TableCell className="text-right">{f.pmQty}</TableCell>
                    <TableCell className="text-right font-medium">{f.totalQty}</TableCell>
                    <TableCell className="text-right font-mono">{f.avgFat}</TableCell>
                    <TableCell className="text-right font-mono">{f.avgSnf}</TableCell>
                    <TableCell className="text-right">₹{f.rate}</TableCell>
                    <TableCell className="text-right">₹{f.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-destructive">₹{f.deduction.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold">₹{f.netPaid.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

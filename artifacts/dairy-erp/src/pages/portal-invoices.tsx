import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search } from "lucide-react";

const invoices = [
  { id: "i1", num: "INV-2220", date: "2026-07-03", dispatch: "DISP-2026-07-03-001", products: "Pasteurized Milk 500ml ×140 + Curd 200g ×60", gross: 4980, adj: 0, net: 4980, status: "Outstanding" },
  { id: "i2", num: "INV-2218", date: "2026-07-02", dispatch: "DISP-2026-07-02-001", products: "Pasteurized Milk 500ml ×120 + Curd 200g ×60", gross: 4440, adj: 140, net: 4300, status: "Outstanding" },
  { id: "i3", num: "INV-2210", date: "2026-07-01", dispatch: "DISP-2026-07-01-001", products: "Pasteurized Milk 500ml ×120 + Curd 200g ×60", gross: 4440, adj: 0, net: 4440, status: "Outstanding" },
  { id: "i4", num: "INV-2198", date: "2026-06-30", dispatch: "DISP-2026-06-30-001", products: "Pasteurized Milk 500ml ×120 + Curd 200g ×60", gross: 4440, adj: 0, net: 4440, status: "Paid" },
  { id: "i5", num: "INV-2188", date: "2026-06-29", dispatch: "DISP-2026-06-29-001", products: "Pasteurized Milk 500ml ×120 + Curd 200g ×60", gross: 4440, adj: 0, net: 4440, status: "Paid" },
  { id: "i6", num: "INV-2178", date: "2026-06-28", dispatch: "DISP-2026-06-28-001", products: "Pasteurized Milk 500ml ×120 + Curd 200g ×60", gross: 4440, adj: 0, net: 4440, status: "Paid" },
  { id: "i7", num: "INV-2168", date: "2026-06-27", dispatch: "DISP-2026-06-27-001", products: "Pasteurized Milk 500ml ×120 + Curd 200g ×60", gross: 4440, adj: 350, net: 4090, status: "Paid" },
  { id: "i8", num: "INV-2158", date: "2026-06-26", dispatch: "DISP-2026-06-26-001", products: "Pasteurized Milk 500ml ×120 + Curd 200g ×60", gross: 4440, adj: 0, net: 4440, status: "Paid" },
  { id: "i9", num: "INV-2148", date: "2026-06-25", dispatch: "DISP-2026-06-25-001", products: "Pasteurized Milk 500ml ×120 + Curd 200g ×60", gross: 4440, adj: 400, net: 4040, status: "Paid" },
  { id: "i10", num: "INV-2138", date: "2026-06-24", dispatch: "DISP-2026-06-24-001", products: "Pasteurized Milk 500ml ×120 + Curd 200g ×60", gross: 4440, adj: 0, net: 4440, status: "Paid" },
];

const statusBadge: Record<string, string> = {
  Outstanding: "bg-amber-100 text-amber-800 border-amber-200",
  Paid: "bg-green-100 text-green-800 border-green-200",
};

export default function PortalInvoices() {
  const total = invoices.reduce((s, i) => s + i.gross, 0);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invoice History</h1>
        <p className="text-muted-foreground text-sm mt-1">Prestige Towers Apartments — all delivery invoices</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Invoices This Month</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{invoices.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Gross Value</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">₹{total.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Outstanding Invoices</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-600">{invoices.filter((i) => i.status === "Outstanding").length}</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search invoice#..." className="pl-9" data-testid="search-invoices" /></div>
            <Select defaultValue="all"><SelectTrigger className="w-36" data-testid="filter-status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="outstanding">Outstanding</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice#</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Gross (₹)</TableHead>
                <TableHead className="text-right">Adj Credit (₹)</TableHead>
                <TableHead className="text-right">Net (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono font-medium">{inv.num}</TableCell>
                  <TableCell className="text-sm">{inv.date}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px]">{inv.products}</TableCell>
                  <TableCell className="text-right">₹{inv.gross.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-green-600">{inv.adj > 0 ? `-₹${inv.adj}` : "—"}</TableCell>
                  <TableCell className="text-right font-bold">₹{inv.net.toLocaleString()}</TableCell>
                  <TableCell><Badge className={statusBadge[inv.status]}>{inv.status}</Badge></TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" data-testid={`download-${inv.id}`}><Download className="h-3.5 w-3.5 mr-1" />PDF</Button>
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

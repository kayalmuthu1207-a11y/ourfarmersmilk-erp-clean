import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, FileSpreadsheet, FileText, ChevronDown, ChevronRight, CheckCircle } from "lucide-react";

const statements = [
  { id: "s1", num: "STMT-2026-014", period: "01 Jul – 10 Jul 2026", gross: 13860, adj: 140, net: 13720, paid: 2000, balance: 11720, status: "Outstanding", current: true },
  { id: "s2", num: "STMT-2026-013", period: "21 Jun – 30 Jun 2026", gross: 42000, adj: 350, net: 41650, paid: 41650, balance: 0, status: "Fully Paid", current: false },
  { id: "s3", num: "STMT-2026-012", period: "11 Jun – 20 Jun 2026", gross: 38500, adj: 0, net: 38500, paid: 38500, balance: 0, status: "Fully Paid", current: false },
  { id: "s4", num: "STMT-2026-011", period: "01 Jun – 10 Jun 2026", gross: 39200, adj: 750, net: 38450, paid: 38450, balance: 0, status: "Fully Paid", current: false },
  { id: "s5", num: "STMT-2026-010", period: "21 May – 31 May 2026", gross: 44000, adj: 0, net: 44000, paid: 44000, balance: 0, status: "Fully Paid", current: false },
];

const statusBadge: Record<string, string> = {
  Outstanding: "bg-amber-100 text-amber-800 border-amber-200",
  "Partially Paid": "bg-blue-100 text-blue-800 border-blue-200",
  "Fully Paid": "bg-green-100 text-green-800 border-green-200",
};

const currentDetail = [
  { date: "2026-07-01", desc: "Dispatched: 120 pouches Milk + 60 cups Curd", amount: 4440 },
  { date: "2026-07-02", desc: "Dispatched: 120 pouches Milk + 60 cups Curd", amount: 4440 },
  { date: "2026-07-02", desc: "Adjustment Credit: Leakage 5 pouches", amount: -140 },
  { date: "2026-07-03", desc: "Dispatched: 140 pouches Milk + 60 cups Curd", amount: 4980 },
  { date: "2026-07-02", desc: "Payment Received: NEFT HDFC0000123456", amount: -2000 },
];

export default function PortalStatements() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Statement Downloads</h1>
        <p className="text-muted-foreground text-sm mt-1">Prestige Towers Apartments — billing cycle statements</p>
      </div>

      <Collapsible open={open} onOpenChange={setOpen}>
        <Card className="border-primary/30">
          <CardHeader>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <div>
                  <CardTitle className="text-base">Current Statement Preview — STMT-2026-014</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">01 Jul – 10 Jul 2026 (In Progress)</p>
                </div>
                {open ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Amount (₹)</TableHead></TableRow></TableHeader>
                <TableBody>
                  {currentDetail.map((d, i) => (
                    <TableRow key={i}><TableCell className="text-sm">{d.date}</TableCell><TableCell className="text-sm">{d.desc}</TableCell>
                      <TableCell className={`text-right font-medium ${d.amount < 0 ? "text-green-600" : ""}`}>{d.amount < 0 ? `-₹${Math.abs(d.amount).toLocaleString()}` : `₹${d.amount.toLocaleString()}`}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-primary/5 font-bold"><TableCell colSpan={2}>Balance Due</TableCell><TableCell className="text-right text-primary">₹11,720</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Statement#</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Gross (₹)</TableHead>
                <TableHead className="text-right">Adjustments (₹)</TableHead>
                <TableHead className="text-right">Net (₹)</TableHead>
                <TableHead className="text-right">Paid (₹)</TableHead>
                <TableHead className="text-right">Balance (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statements.map((s) => (
                <TableRow key={s.id} className={s.current ? "bg-primary/5" : ""}>
                  <TableCell className="font-mono font-medium text-sm">{s.num}</TableCell>
                  <TableCell className="text-sm">{s.period}</TableCell>
                  <TableCell className="text-right">₹{s.gross.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-green-600">{s.adj > 0 ? `-₹${s.adj}` : "—"}</TableCell>
                  <TableCell className="text-right">₹{s.net.toLocaleString()}</TableCell>
                  <TableCell className="text-right">₹{s.paid.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-bold">{s.balance > 0 ? `₹${s.balance.toLocaleString()}` : <span className="text-green-600 flex items-center gap-1 justify-end"><CheckCircle className="h-3.5 w-3.5" />Cleared</span>}</TableCell>
                  <TableCell><Badge className={statusBadge[s.status]}>{s.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" data-testid={`download-pdf-${s.id}`}><FileText className="h-3.5 w-3.5 text-red-600" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" data-testid={`download-xlsx-${s.id}`}><FileSpreadsheet className="h-3.5 w-3.5 text-green-700" /></Button>
                    </div>
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

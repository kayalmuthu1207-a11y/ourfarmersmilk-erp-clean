import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CreditCard, CheckCircle } from "lucide-react";

const currentCycle = [
  { date: "2026-07-01", products: "Pasteurized Milk 500ml ×120 + Curd 200g ×60", value: 4440 },
  { date: "2026-07-02", products: "Pasteurized Milk 500ml ×120 + Curd 200g ×60", value: 4440 },
  { date: "2026-07-03", products: "Pasteurized Milk 500ml ×140 + Curd 200g ×60", value: 4980 },
];

const adjustments = [
  { date: "2026-07-01", reason: "Leakage — 5 pouches", credit: -140 },
];

const payments = [
  { date: "2026-07-02", mode: "NEFT", reference: "HDFC0000123456", amount: 2000 },
];

const prevCycles = [
  { period: "21 Jun – 30 Jun 2026", gross: 42000, adjustments: 350, net: 41650, paid: 41650, status: "Fully Paid" },
  { period: "11 Jun – 20 Jun 2026", gross: 38500, adjustments: 0, net: 38500, paid: 38500, status: "Fully Paid" },
  { period: "01 Jun – 10 Jun 2026", gross: 39200, adjustments: 750, net: 38450, paid: 38450, status: "Fully Paid" },
];

const grossTotal = currentCycle.reduce((s, r) => s + r.value, 0);
const totalAdjustments = adjustments.reduce((s, a) => s + a.credit, 0);
const totalPayments = payments.reduce((s, p) => s + p.amount, 0);
const outstanding = grossTotal + totalAdjustments - totalPayments;

export default function PortalOutstanding() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Outstanding Balance</h1>
        <p className="text-muted-foreground text-sm mt-1">Prestige Towers Apartments — Current billing cycle</p>
      </div>

      <Card className="border-2 border-primary/30">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Outstanding</p>
              <p className="text-4xl font-bold text-primary mt-1">₹{outstanding.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="text-2xl font-bold mt-1">July 13, 2026</p>
              <Badge className="mt-1 bg-green-100 text-green-800 border-green-200">10 days remaining</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Billing Cycle</p>
              <p className="text-lg font-semibold mt-1">10-Day</p>
              <p className="text-xs text-muted-foreground">Jul 1 – Jul 10, 2026</p>
            </div>
          </div>
          <Separator className="my-4" />
          <Button className="w-full sm:w-auto mx-auto block" data-testid="btn-pay-now">
            <CreditCard className="h-4 w-4 mr-2" />Pay Now — ₹{outstanding.toLocaleString()}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">NEFT / UPI: shriambaldairy@hdfcbank | A/C: 50100234567890 | IFSC: HDFC0001234</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Current Cycle Breakdown (Jul 1–10, 2026)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Daily Dispatches</p>
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Products</TableHead><TableHead className="text-right">Value (₹)</TableHead></TableRow></TableHeader>
              <TableBody>
                {currentCycle.map((r, i) => <TableRow key={i}><TableCell className="text-sm">{r.date}</TableCell><TableCell className="text-sm">{r.products}</TableCell><TableCell className="text-right font-medium">₹{r.value.toLocaleString()}</TableCell></TableRow>)}
                <TableRow className="bg-muted/30 font-semibold"><TableCell colSpan={2}>Gross Total</TableCell><TableCell className="text-right">₹{grossTotal.toLocaleString()}</TableCell></TableRow>
              </TableBody>
            </Table>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Adjustment Credits</p>
            {adjustments.map((a, i) => (
              <div key={i} className="flex justify-between text-sm p-2 border rounded bg-green-50">
                <span>{a.date} — {a.reason}</span>
                <span className="font-medium text-green-700">₹{Math.abs(a.credit)}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Payments Received</p>
            {payments.map((p, i) => (
              <div key={i} className="flex justify-between text-sm p-2 border rounded bg-blue-50">
                <span>{p.date} — {p.mode} ({p.reference})</span>
                <span className="font-medium text-blue-700">₹{p.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Balance Due</span>
            <span className="text-primary">₹{outstanding.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Previous Cycle Summary</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Gross (₹)</TableHead>
                <TableHead className="text-right">Adjustments (₹)</TableHead>
                <TableHead className="text-right">Net (₹)</TableHead>
                <TableHead className="text-right">Paid (₹)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prevCycles.map((c, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-sm">{c.period}</TableCell>
                  <TableCell className="text-right">₹{c.gross.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-green-600">{c.adjustments > 0 ? `-₹${c.adjustments}` : "—"}</TableCell>
                  <TableCell className="text-right">₹{c.net.toLocaleString()}</TableCell>
                  <TableCell className="text-right">₹{c.paid.toLocaleString()}</TableCell>
                  <TableCell><Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3" />{c.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

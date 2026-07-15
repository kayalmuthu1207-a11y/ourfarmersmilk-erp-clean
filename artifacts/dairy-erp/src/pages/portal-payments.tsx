import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Clock } from "lucide-react";

const payments = [
  { id: "p1", date: "2026-07-02", amount: 2000, mode: "NEFT", reference: "HDFC0000123456", statement: "STMT-2026-014 (Jul 1-10)", acknowledged: "Accounts Team", status: "Confirmed" },
  { id: "p2", date: "2026-06-30", amount: 41650, mode: "NEFT", reference: "HDFC0000099812", statement: "STMT-2026-013 (Jun 21-30)", acknowledged: "Accounts Team", status: "Confirmed" },
  { id: "p3", date: "2026-06-20", amount: 38500, mode: "RTGS", reference: "ICICI0000234567", statement: "STMT-2026-012 (Jun 11-20)", acknowledged: "Accounts Team", status: "Confirmed" },
  { id: "p4", date: "2026-06-10", amount: 38450, mode: "NEFT", reference: "HDFC0000087654", statement: "STMT-2026-011 (Jun 1-10)", acknowledged: "Accounts Team", status: "Confirmed" },
  { id: "p5", date: "2026-05-31", amount: 44000, mode: "UPI", reference: "UPI12345678901234", statement: "STMT-2026-010 (May 21-31)", acknowledged: "Accounts Team", status: "Confirmed" },
  { id: "p6", date: "2026-05-20", amount: 39200, mode: "Cheque", reference: "CHQ-000432", statement: "STMT-2026-009 (May 11-20)", acknowledged: "Accounts Team", status: "Confirmed" },
];

const modeBadge: Record<string, string> = {
  NEFT: "bg-blue-100 text-blue-800 border-blue-200",
  RTGS: "bg-purple-100 text-purple-800 border-purple-200",
  UPI: "bg-green-100 text-green-800 border-green-200",
  Cheque: "bg-amber-100 text-amber-800 border-amber-200",
  Cash: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function PortalPayments() {
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground text-sm mt-1">Prestige Towers Apartments — all payments recorded</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Paid (This Month)</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">₹2,000</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Outstanding Balance</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-600">₹11,720</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Paid (All Time)</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">₹{totalPaid.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Reference#</TableHead>
                <TableHead>Against Statement</TableHead>
                <TableHead>Acknowledged By</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm">{p.date}</TableCell>
                  <TableCell className="text-right font-bold">₹{p.amount.toLocaleString()}</TableCell>
                  <TableCell><Badge className={modeBadge[p.mode]}>{p.mode}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                  <TableCell className="text-sm">{p.statement}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.acknowledged}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {p.status === "Confirmed" ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <Clock className="h-3.5 w-3.5 text-amber-500" />}
                      <Badge className={p.status === "Confirmed" ? "bg-green-100 text-green-800 border-green-200" : "bg-amber-100 text-amber-800 border-amber-200"}>{p.status}</Badge>
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

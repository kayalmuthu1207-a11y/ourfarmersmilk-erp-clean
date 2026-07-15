import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle, Download } from "lucide-react";
import { farmers } from "@/data/mock";

const period = { from: "2026-07-01", to: "2026-07-10", num: "STLMT-2026-015", status: "Pending" };

const farmerRows = farmers.map((f, i) => ({
  id: `F-${String(i + 1).padStart(3, "0")}`,
  name: f.name,
  village: f.village,
  amQty: 1200 + i * 80,
  pmQty: 1000 + i * 70,
  totalQty: 2200 + i * 150,
  avgFat: +(3.9 + i * 0.05).toFixed(2),
  avgSnf: +(8.2 + i * 0.03).toFixed(2),
  rate: +(32 + i * 0.4).toFixed(2),
  gross: Math.round((2200 + i * 150) * (32 + i * 0.4)),
  deduction: 1200 + i * 50,
  net: 0,
  approved: false,
})).map((f) => ({ ...f, net: f.gross - f.deduction }));

const totals = {
  amQty: farmerRows.reduce((s, f) => s + f.amQty, 0),
  pmQty: farmerRows.reduce((s, f) => s + f.pmQty, 0),
  total: farmerRows.reduce((s, f) => s + f.totalQty, 0),
  gross: farmerRows.reduce((s, f) => s + f.gross, 0),
  deductions: farmerRows.reduce((s, f) => s + f.deduction, 0),
  net: farmerRows.reduce((s, f) => s + f.net, 0),
};

export default function SettlementTenDay() {
  const [approved, setApproved] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">10-Day Settlement</h1>
          <p className="text-muted-foreground text-sm mt-1">{period.from} — {period.to} | {period.num}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="btn-export"><Download className="h-4 w-4 mr-2" />Export</Button>
          {!approved ? (
            <Button onClick={() => setApproved(true)} data-testid="btn-approve"><CheckCircle className="h-4 w-4 mr-2" />Approve & Send</Button>
          ) : (
            <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1 px-3 py-2">
              <CheckCircle className="h-4 w-4" />Settlement Approved
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Period</CardTitle></CardHeader><CardContent><p className="font-bold">Jul 1–10, 2026</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Farmers</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{farmerRows.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Milk Collected</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-primary">{totals.total.toLocaleString()} L</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Net Amount Payable</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">₹{totals.net.toLocaleString()}</p></CardContent></Card>
      </div>

      {!approved && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">Review the settlement below. Once approved, vouchers will be auto-generated and farmers will be notified via WhatsApp.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">Farmer-wise Breakdown</CardTitle>
            <div className="flex gap-6 text-sm">
              <div><span className="text-muted-foreground">Gross: </span><span className="font-bold">₹{totals.gross.toLocaleString()}</span></div>
              <div><span className="text-muted-foreground">Deductions: </span><span className="font-bold text-destructive">₹{totals.deductions.toLocaleString()}</span></div>
              <div><span className="text-muted-foreground">Net: </span><span className="font-bold text-green-600">₹{totals.net.toLocaleString()}</span></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farmer ID</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Village</TableHead>
                <TableHead className="text-right">AM (L)</TableHead>
                <TableHead className="text-right">PM (L)</TableHead>
                <TableHead className="text-right">Total (L)</TableHead>
                <TableHead className="text-right">Avg FAT</TableHead>
                <TableHead className="text-right">Avg SNF</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Gross (₹)</TableHead>
                <TableHead className="text-right">Ded. (₹)</TableHead>
                <TableHead className="text-right">Net (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farmerRows.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-mono text-xs">{f.id}</TableCell>
                  <TableCell className="font-medium text-sm">{f.name}</TableCell>
                  <TableCell className="text-sm">{f.village}</TableCell>
                  <TableCell className="text-right text-sm">{f.amQty}</TableCell>
                  <TableCell className="text-right text-sm">{f.pmQty}</TableCell>
                  <TableCell className="text-right font-medium text-sm">{f.totalQty}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{f.avgFat}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{f.avgSnf}</TableCell>
                  <TableCell className="text-right text-sm">₹{f.rate}</TableCell>
                  <TableCell className="text-right text-sm">₹{f.gross.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm text-destructive">₹{f.deduction.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-bold text-sm">₹{f.net.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="text-right">{totals.amQty.toLocaleString()}</TableCell>
                <TableCell className="text-right">{totals.pmQty.toLocaleString()}</TableCell>
                <TableCell className="text-right">{totals.total.toLocaleString()}</TableCell>
                <TableCell colSpan={3}></TableCell>
                <TableCell className="text-right">₹{totals.gross.toLocaleString()}</TableCell>
                <TableCell className="text-right text-destructive">₹{totals.deductions.toLocaleString()}</TableCell>
                <TableCell className="text-right text-green-600">₹{totals.net.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Printer, Download, CheckSquare } from "lucide-react";
import { farmers } from "@/data/mock";

const periods = [
  "21 Jun – 30 Jun 2026",
  "11 Jun – 20 Jun 2026",
  "01 Jun – 10 Jun 2026",
  "21 May – 31 May 2026",
];

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
})).map((f) => ({ ...f, net: f.gross - f.deduction }));

const totals = {
  amQty: farmerRows.reduce((s, f) => s + f.amQty, 0),
  pmQty: farmerRows.reduce((s, f) => s + f.pmQty, 0),
  totalQty: farmerRows.reduce((s, f) => s + f.totalQty, 0),
  gross: farmerRows.reduce((s, f) => s + f.gross, 0),
  deduction: farmerRows.reduce((s, f) => s + f.deduction, 0),
  net: farmerRows.reduce((s, f) => s + f.net, 0),
};

export default function SettlementVoucher() {
  const [period, setPeriod] = useState(periods[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settlement Voucher Preview</h1>
          <p className="text-muted-foreground text-sm mt-1">Print-ready farmer settlement document</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-60" data-testid="select-period"><SelectValue /></SelectTrigger>
            <SelectContent>{periods.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" data-testid="btn-print"><Printer className="h-4 w-4 mr-2" />Print</Button>
          <Button variant="outline" data-testid="btn-export-pdf"><Download className="h-4 w-4 mr-2" />Export PDF</Button>
          <Button data-testid="btn-mark-sent"><CheckSquare className="h-4 w-4 mr-2" />Mark as Sent</Button>
        </div>
      </div>

      <Card className="border-2">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold">Shri Ambal Dairy</h2>
            <p className="text-sm text-muted-foreground">123 Dairy Road, Tambaram, Chennai – 600045</p>
            <p className="text-sm text-muted-foreground">GSTIN: 33AAAAA0000A1Z5 | Phone: +91 44 2234 5678</p>
          </div>

          <Separator />

          <div className="flex justify-between items-start">
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Settlement#:</span> <span className="font-mono font-medium">STLMT-2026-014</span></p>
              <p><span className="text-muted-foreground">Settlement Period:</span> <span className="font-medium">{period}</span></p>
              <p><span className="text-muted-foreground">Settlement Date:</span> <span className="font-medium">July 1, 2026</span></p>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Farmer ID</TableHead>
                <TableHead>Farmer Name</TableHead>
                <TableHead>Village</TableHead>
                <TableHead className="text-right">AM (L)</TableHead>
                <TableHead className="text-right">PM (L)</TableHead>
                <TableHead className="text-right">Total (L)</TableHead>
                <TableHead className="text-right">Avg FAT</TableHead>
                <TableHead className="text-right">Avg SNF</TableHead>
                <TableHead className="text-right">Rate (₹)</TableHead>
                <TableHead className="text-right">Gross (₹)</TableHead>
                <TableHead className="text-right">Deduction (₹)</TableHead>
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
                <TableCell className="text-right">{totals.totalQty.toLocaleString()}</TableCell>
                <TableCell colSpan={3}></TableCell>
                <TableCell className="text-right">₹{totals.gross.toLocaleString()}</TableCell>
                <TableCell className="text-right text-destructive">₹{totals.deduction.toLocaleString()}</TableCell>
                <TableCell className="text-right">₹{totals.net.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="text-sm text-muted-foreground italic border rounded p-3 bg-muted/30">
            This settlement is correct as per Vertex DPU records for the period {period}. All amounts are calculated based on FAT/SNF testing conducted at the respective collection centers.
          </div>

          <div className="grid grid-cols-3 gap-8 pt-4">
            {["Prepared by", "Reviewed by", "Approved by"].map((role) => (
              <div key={role} className="text-center">
                <div className="h-12 border-b border-dashed border-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">{role}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

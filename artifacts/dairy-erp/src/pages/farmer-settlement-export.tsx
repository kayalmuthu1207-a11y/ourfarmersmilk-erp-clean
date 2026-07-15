import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileSpreadsheet, FileText, CheckCircle, XCircle, Clock } from "lucide-react";

const exports = [
  { id: "ex1", period: "21 Jun – 30 Jun 2026", type: "Excel", exportedOn: "2026-07-01 10:22", exportedBy: "Owner", fileName: "settlement_2026-06-21_30.xlsx", status: "Exported" },
  { id: "ex2", period: "21 Jun – 30 Jun 2026", type: "PDF", exportedOn: "2026-07-01 10:24", exportedBy: "Owner", fileName: "settlement_2026-06-21_30.pdf", status: "Exported" },
  { id: "ex3", period: "11 Jun – 20 Jun 2026", type: "Excel", exportedOn: "2026-06-21 09:55", exportedBy: "Owner", fileName: "settlement_2026-06-11_20.xlsx", status: "Exported" },
  { id: "ex4", period: "11 Jun – 20 Jun 2026", type: "PDF", exportedOn: "2026-06-21 09:57", exportedBy: "Owner", fileName: "settlement_2026-06-11_20.pdf", status: "Exported" },
  { id: "ex5", period: "01 Jun – 10 Jun 2026", type: "Excel", exportedOn: "2026-06-11 08:30", exportedBy: "Manager", fileName: "settlement_2026-06-01_10.xlsx", status: "Exported" },
  { id: "ex6", period: "01 Jun – 10 Jun 2026", type: "Tally", exportedOn: "2026-06-11 08:45", exportedBy: "Accountant", fileName: "tally_purchase_2026-06-01_10.xml", status: "Failed" },
  { id: "ex7", period: "21 May – 31 May 2026", type: "Excel", exportedOn: "2026-06-01 09:10", exportedBy: "Owner", fileName: "settlement_2026-05-21_31.xlsx", status: "Exported" },
  { id: "ex8", period: "01 Jul – 10 Jul 2026", type: "Excel", exportedOn: "", exportedBy: "", fileName: "", status: "Pending" },
];

const statusIcon: Record<string, React.ReactElement> = {
  Exported: <CheckCircle className="h-4 w-4 text-green-600" />,
  Failed: <XCircle className="h-4 w-4 text-destructive" />,
  Pending: <Clock className="h-4 w-4 text-amber-500" />,
};
const statusBadge: Record<string, string> = {
  Exported: "bg-green-100 text-green-800 border-green-200",
  Failed: "bg-red-100 text-red-800 border-red-200",
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
};
const typeIcon: Record<string, React.ReactElement> = {
  Excel: <FileSpreadsheet className="h-4 w-4 text-green-700" />,
  PDF: <FileText className="h-4 w-4 text-red-600" />,
  Tally: <FileText className="h-4 w-4 text-blue-600" />,
};

export default function SettlementExportStatus() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settlement Export Status</h1>
          <p className="text-muted-foreground text-sm mt-1">Track all settlement export operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="btn-export-excel"><FileSpreadsheet className="h-4 w-4 mr-2" />Export to Excel</Button>
          <Button variant="outline" data-testid="btn-export-pdf"><FileText className="h-4 w-4 mr-2" />Export to PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Exports</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{exports.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Successful</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">{exports.filter((e) => e.status === "Exported").length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Failed / Pending</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-600">{exports.filter((e) => e.status !== "Exported").length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-48" data-testid="filter-period"><SelectValue placeholder="All Periods" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Periods</SelectItem>{["21 Jun – 30 Jun 2026","11 Jun – 20 Jun 2026","01 Jun – 10 Jun 2026"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-36" data-testid="filter-type"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Types</SelectItem>{["Excel","PDF","Tally"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Settlement Period</TableHead>
                <TableHead>Export Type</TableHead>
                <TableHead>Exported On</TableHead>
                <TableHead>Exported By</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exports.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.period}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">{typeIcon[e.type]}<span>{e.type}</span></div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.exportedOn || "—"}</TableCell>
                  <TableCell className="text-sm">{e.exportedBy || "—"}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{e.fileName || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">{statusIcon[e.status]}<Badge className={statusBadge[e.status]}>{e.status}</Badge></div>
                  </TableCell>
                  <TableCell>
                    {e.status === "Exported" && (
                      <Button size="icon" variant="ghost" className="h-7 w-7" data-testid={`download-${e.id}`}><Download className="h-3.5 w-3.5" /></Button>
                    )}
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

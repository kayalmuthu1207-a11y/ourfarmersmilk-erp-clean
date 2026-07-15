import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw, Search, CheckCircle } from "lucide-react";

const byDateRecords = [
  { id: "r1", ref: "INV-2220", type: "Sales Invoice", customer: "Hotel Saravana Bhavan", amount: 18500, tally: "Failed" },
  { id: "r2", ref: "INV-2219", type: "Sales Invoice", customer: "TCS Office Campus", amount: 32400, tally: "Pushed" },
  { id: "r3", ref: "PV-2026-07-03-001", type: "Purchase Voucher", customer: "Mullipakam Village", amount: 45200, tally: "Failed" },
  { id: "r4", ref: "BATCH-03-001", type: "Stock Entry", customer: "—", amount: 0, tally: "Pushed" },
  { id: "r5", ref: "SO-2026-07-03-001", type: "Sales Order", customer: "Prestige Towers", amount: 8400, tally: "Pushed" },
];

const resyncLog = [
  { ts: "2026-07-03 10:15", what: "Manual re-sync: INV-2218, INV-2219 (2 invoices)", result: "Success", by: "Accountant" },
  { ts: "2026-07-02 16:30", what: "Full date re-sync: 2026-07-01 (18 vouchers)", result: "15 success, 3 failed", by: "Owner" },
  { ts: "2026-07-01 14:00", what: "Re-sync by type: Purchase Vouchers (Jun 28-30)", result: "Success", by: "Accountant" },
  { ts: "2026-06-30 11:45", what: "Re-sync: TCS Office Campus (all pending)", result: "Success", by: "Manager" },
  { ts: "2026-06-29 09:00", what: "Re-sync: Failed records batch (8 vouchers)", result: "6 success, 2 failed", by: "Owner" },
];

const statusBadge: Record<string, string> = {
  Pushed: "bg-green-100 text-green-800 border-green-200",
  Failed: "bg-red-100 text-red-800 border-red-200",
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
};

export default function TallyResync() {
  const [selectedDate, setSelectedDate] = useState("2026-07-03");
  const [fetched, setFetched] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (id: string) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manual Re-sync</h1>
        <p className="text-muted-foreground text-sm mt-1">Manually re-push specific vouchers to TallyPrime</p>
      </div>

      <Tabs defaultValue="bydate">
        <TabsList data-testid="tabs-resync">
          <TabsTrigger value="bydate">By Date</TabsTrigger>
          <TabsTrigger value="bytype">By Voucher Type</TabsTrigger>
          <TabsTrigger value="bycustomer">By Customer</TabsTrigger>
        </TabsList>

        <TabsContent value="bydate" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1"><Label>Select Date</Label><Input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setFetched(false); }} className="mt-1" data-testid="input-date" /></div>
                <Button onClick={() => setFetched(true)} data-testid="btn-fetch-date"><Search className="h-4 w-4 mr-2" />Fetch Records</Button>
              </div>
            </CardContent>
          </Card>

          {fetched && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Records for {selectedDate}</CardTitle>
                  <Button size="sm" disabled={selected.length === 0} data-testid="btn-resync-selected">
                    <RefreshCw className="h-4 w-4 mr-2" />Re-sync Selected ({selected.length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Customer/Vendor</TableHead>
                      <TableHead className="text-right">Amount (₹)</TableHead>
                      <TableHead>Tally Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byDateRecords.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <Checkbox checked={selected.includes(r.id)} onCheckedChange={() => toggleSelect(r.id)} data-testid={`select-${r.id}`} />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{r.ref}</TableCell>
                        <TableCell><Badge variant="outline">{r.type}</Badge></TableCell>
                        <TableCell className="text-sm">{r.customer}</TableCell>
                        <TableCell className="text-right">{r.amount > 0 ? `₹${r.amount.toLocaleString()}` : "—"}</TableCell>
                        <TableCell><Badge className={statusBadge[r.tally]}>{r.tally}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bytype" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div><Label>Voucher Type</Label>
                  <Select>
                    <SelectTrigger className="mt-1 w-52" data-testid="select-vtype"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{["Sales Invoice","Purchase Voucher","Receipt Voucher","Stock Entry","Sales Order"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>From Date</Label><Input type="date" className="mt-1" defaultValue="2026-07-01" /></div>
                <div><Label>To Date</Label><Input type="date" className="mt-1" defaultValue="2026-07-03" /></div>
                <Button data-testid="btn-fetch-type"><Search className="h-4 w-4 mr-2" />Fetch</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bycustomer" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1"><Label>Customer</Label>
                  <Select>
                    <SelectTrigger className="mt-1" data-testid="select-customer"><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>{["TCS Office Campus","Infosys Cafeteria","Hotel Saravana Bhavan","Prestige Towers Apartments"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>From Date</Label><Input type="date" className="mt-1" defaultValue="2026-07-01" /></div>
                <div><Label>To Date</Label><Input type="date" className="mt-1" defaultValue="2026-07-03" /></div>
                <Button data-testid="btn-fetch-customer"><Search className="h-4 w-4 mr-2" />Fetch</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader><CardTitle className="text-sm">Recent Re-sync Operations</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Performed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resyncLog.map((l, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-sm text-muted-foreground">{l.ts}</TableCell>
                  <TableCell className="text-sm">{l.what}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-sm">{l.result}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{l.by}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

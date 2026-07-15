import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { Download, AlertTriangle } from "lucide-react";
import { farmers, villages } from "@/data/mock";

const fatTrend = Array.from({ length: 14 }, (_, i) => ({
  date: `Jun ${20 + i}`,
  avgFAT: +(3.8 + Math.sin(i / 3) * 0.3).toFixed(2),
  avgSNF: +(8.2 + Math.cos(i / 4) * 0.3).toFixed(2),
}));

const records = farmers.flatMap((f, fi) =>
  Array.from({ length: 3 }, (_, di) => ({
    id: `${f.id}-${di}`,
    date: `2026-07-0${3 - di}`,
    shift: di % 2 === 0 ? "AM" : "PM",
    farmer: f.name,
    village: f.village,
    qty: 80 + fi * 15 + di * 10,
    fat: +(3.8 + fi * 0.08 + di * 0.05).toFixed(2),
    snf: +(8.1 + fi * 0.05 + di * 0.04).toFixed(2),
    clr: 26 + fi,
    rate: 32 + fi * 0.5,
    amount: 0,
  })).map((r) => ({ ...r, amount: Math.round(r.qty * r.rate) }))
);

export default function FatSnfHistory() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">FAT / SNF History</h1>
          <p className="text-muted-foreground text-sm mt-1">Milk quality tracking by farmer, village, and date</p>
        </div>
        <Button variant="outline" data-testid="btn-export"><Download className="h-4 w-4 mr-2" />Export</Button>
      </div>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">Quality thresholds: FAT must be &gt; 3.5%, SNF must be &gt; 8.0%. Records highlighted in amber are at the lower threshold boundary.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Average FAT — Last 14 Days</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={fatTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[3.4, 4.6]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <ReferenceLine y={3.5} stroke="#dc2626" strokeDasharray="4 4" label={{ value: "Min 3.5", fontSize: 10, fill: "#dc2626" }} />
                <Line type="monotone" dataKey="avgFAT" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} name="Avg FAT" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Average SNF — Last 14 Days</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={fatTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[7.8, 8.8]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <ReferenceLine y={8.0} stroke="#dc2626" strokeDasharray="4 4" label={{ value: "Min 8.0", fontSize: 10, fill: "#dc2626" }} />
                <Line type="monotone" dataKey="avgSNF" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} name="Avg SNF" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-44" data-testid="filter-village"><SelectValue placeholder="All Villages" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Villages</SelectItem>{villages.slice(0, 8).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-36" data-testid="filter-shift"><SelectValue placeholder="All Shifts" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Shifts</SelectItem><SelectItem value="AM">AM</SelectItem><SelectItem value="PM">PM</SelectItem></SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Village</TableHead>
                <TableHead className="text-right">Qty (L)</TableHead>
                <TableHead className="text-right">FAT</TableHead>
                <TableHead className="text-right">SNF</TableHead>
                <TableHead className="text-right">CLR</TableHead>
                <TableHead className="text-right">Rate (₹/L)</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.slice(0, 20).map((r) => {
                const lowFat = r.fat < 3.7;
                const lowSnf = r.snf < 8.15;
                return (
                  <TableRow key={r.id} className={lowFat || lowSnf ? "bg-amber-50/50" : ""}>
                    <TableCell className="text-sm">{r.date}</TableCell>
                    <TableCell><Badge variant="outline">{r.shift}</Badge></TableCell>
                    <TableCell className="font-medium">{r.farmer}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.village}</TableCell>
                    <TableCell className="text-right">{r.qty}</TableCell>
                    <TableCell className={`text-right font-mono ${lowFat ? "text-amber-600 font-bold" : ""}`}>{r.fat}</TableCell>
                    <TableCell className={`text-right font-mono ${lowSnf ? "text-amber-600 font-bold" : ""}`}>{r.snf}</TableCell>
                    <TableCell className="text-right font-mono">{r.clr}</TableCell>
                    <TableCell className="text-right">₹{r.rate.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">₹{r.amount.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

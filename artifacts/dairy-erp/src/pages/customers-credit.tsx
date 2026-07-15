import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit2, AlertTriangle, CheckCircle } from "lucide-react";
import { customers } from "@/data/mock";

const creditData = customers.map((c) => {
  const util = Math.round((c.outstanding / c.limit) * 100);
  const overdue = c.outstanding > 0 ? Math.floor(Math.random() * 35) : 0;
  return { ...c, utilization: util, overdueDays: overdue };
});

function statusColor(util: number) {
  if (util >= 80) return "bg-red-100 text-red-800 border-red-200";
  if (util >= 50) return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-green-100 text-green-800 border-green-200";
}

export default function CreditManagement() {
  const [editing, setEditing] = useState<(typeof creditData)[0] | null>(null);
  const [newLimit, setNewLimit] = useState("");
  const [reason, setReason] = useState("");

  const totalCredit = creditData.reduce((s, c) => s + c.limit, 0);
  const totalOutstanding = creditData.reduce((s, c) => s + c.outstanding, 0);
  const totalAvailable = totalCredit - totalOutstanding;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Credit Limit Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor and manage customer credit exposure</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Credit Extended</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">₹{totalCredit.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Outstanding</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-destructive">₹{totalOutstanding.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Available Credit</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">₹{totalAvailable.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Customer Credit Overview</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Credit Limit</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Overdue Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditData.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell><Badge variant="outline">{c.type}</Badge></TableCell>
                  <TableCell className="text-right">₹{c.limit.toLocaleString()}</TableCell>
                  <TableCell className="text-right">₹{c.outstanding.toLocaleString()}</TableCell>
                  <TableCell className="text-right">₹{(c.limit - c.outstanding).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <Progress value={c.utilization} className="h-2 flex-1" />
                      <span className="text-xs w-10 text-right">{c.utilization}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.overdueDays > 0 ? (
                      <span className="flex items-center gap-1 text-destructive text-sm">
                        <AlertTriangle className="h-3 w-3" /> {c.overdueDays}d
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="h-3 w-3" /> Current</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColor(c.utilization)}>
                      {c.utilization >= 80 ? "Critical" : c.utilization >= 50 ? "Watch" : "Healthy"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" data-testid={`edit-credit-${c.id}`} onClick={() => { setEditing(c); setNewLimit(String(c.limit)); setReason(""); }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Credit Limit — {editing?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Current Limit</Label><Input value={`₹${editing?.limit.toLocaleString()}`} disabled className="mt-1" /></div>
            <div><Label>New Limit (₹)</Label><Input value={newLimit} onChange={(e) => setNewLimit(e.target.value)} className="mt-1" data-testid="input-new-limit" /></div>
            <div><Label>Reason</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Good payment history, increased business" className="mt-1" data-testid="input-reason" /></div>
            <div><Label>Effective From</Label><Input type="date" defaultValue="2026-07-04" className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button data-testid="btn-save-limit" onClick={() => setEditing(null)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

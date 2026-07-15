import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useEmployees } from "@/hooks/useEmployees";
import { useSalaryPayments } from "@/hooks/useSalaryPayments";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthLabel(month: number, year: number) {
  return `${MONTHS[month - 1] ?? month} ${year}`;
}

export default function SalaryPayments() {
  const now = new Date();
  const { data: payments, isLoading, isError, error } = useSalaryPayments();
  const { data: employees } = useEmployees();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formUserId, setFormUserId] = useState("");
  const [formMonth, setFormMonth] = useState(String(now.getMonth() + 1));
  const [formYear, setFormYear] = useState(String(now.getFullYear()));
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(now.toISOString().slice(0, 10));
  const [formMethod, setFormMethod] = useState("");
  const [formRemarks, setFormRemarks] = useState("");

  const recordMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("record_salary_payment", {
        p_user_id: Number(formUserId),
        p_amount: Number(formAmount),
        p_pay_period_month: Number(formMonth),
        p_pay_period_year: Number(formYear),
        p_payment_date: formDate,
        p_payment_method: formMethod || null,
        p_remarks: formRemarks || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-payments"] });
      toast({ title: "Salary payment recorded" });
      setDialogOpen(false);
      setFormUserId("");
      setFormAmount("");
      setFormMethod("");
      setFormRemarks("");
    },
    onError: (err: Error) => {
      toast({ title: "Could not record payment", description: err.message, variant: "destructive" });
    },
  });

  const list = payments ?? [];
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const thisMonthPayments = list.filter(
    (p) => p.pay_period_month === currentMonth && p.pay_period_year === currentYear,
  );
  const totalPaidThisMonth = thisMonthPayments.reduce((s, p) => s + p.amount, 0);
  const employeesPaidThisMonth = new Set(thisMonthPayments.map((p) => p.user_id)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Salary Payments</h1>
          <p className="text-muted-foreground text-sm mt-1">Record and review employee salary payments.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2" data-testid="btn-record-payment">
          <Plus className="h-4 w-4" />Record Salary Payment
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Paid This Month</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-primary">₹{totalPaidThisMonth.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Employees Paid This Month</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{employeesPaidThisMonth}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Payments</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{list.length}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading salary payments…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load salary payments</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((p) => (
                  <TableRow key={p.payment_id}>
                    <TableCell className="font-medium">{p.users?.full_name ?? "—"}</TableCell>
                    <TableCell className="text-sm">{monthLabel(p.pay_period_month, p.pay_period_year)}</TableCell>
                    <TableCell className="text-right font-bold">₹{p.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.payment_date}</TableCell>
                    <TableCell className="text-sm">{p.payment_method ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.remarks ?? "—"}</TableCell>
                  </TableRow>
                ))}
                {list.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No salary payments recorded.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Salary Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div>
              <Label>Employee</Label>
              <Select value={formUserId} onValueChange={setFormUserId}>
                <SelectTrigger className="mt-1" data-testid="select-employee"><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {(employees ?? []).map((e) => (
                    <SelectItem key={e.user_id} value={String(e.user_id)}>{e.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Month</Label>
                <Select value={formMonth} onValueChange={setFormMonth}>
                  <SelectTrigger className="mt-1" data-testid="select-month"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={formYear}
                  onChange={(e) => setFormYear(e.target.value)}
                  data-testid="input-year"
                />
              </div>
            </div>
            <div>
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                className="mt-1"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="0.00"
                data-testid="input-amount"
              />
            </div>
            <div>
              <Label>Payment Date</Label>
              <Input type="date" className="mt-1" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Input
                className="mt-1"
                value={formMethod}
                onChange={(e) => setFormMethod(e.target.value)}
                placeholder="e.g. Bank Transfer, Cash, UPI"
                data-testid="input-method"
              />
            </div>
            <div>
              <Label>Remarks</Label>
              <Input
                className="mt-1"
                value={formRemarks}
                onChange={(e) => setFormRemarks(e.target.value)}
                data-testid="input-remarks"
              />
            </div>

            {recordMutation.isError && (
              <div className="rounded-lg border border-destructive/50 bg-red-50 px-3 py-2 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{(recordMutation.error as Error)?.message}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              disabled={!formUserId || !formAmount || !formMonth || !formYear || recordMutation.isPending}
              onClick={() => recordMutation.mutate()}
              data-testid="btn-save-payment"
            >
              {recordMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

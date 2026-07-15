import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useCustomers } from "@/hooks/useCustomers";
import { useCustomerOutstandingBalances } from "@/hooks/useCustomerOutstandingBalances";
import { useApprovedStatementsForCustomer } from "@/hooks/useApprovedStatementsForCustomer";
import { useRecentPayments } from "@/hooks/useRecentPayments";

const PAYMENT_METHODS = ["NEFT", "RTGS", "UPI", "Cheque", "Cash"];

export default function PaymentEntry() {
  const { data: customers } = useCustomers();
  const { data: balances } = useCustomerOutstandingBalances();
  const { data: recentPayments, isLoading: isLoadingPayments, isError: isPaymentsError, error: paymentsError } = useRecentPayments();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedStatement, setSelectedStatement] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));

  const customerId = selectedCustomer ? Number(selectedCustomer) : undefined;
  const customer = customers?.find((c) => c.customer_id === customerId);
  const { data: approvedStatements } = useApprovedStatementsForCustomer(customerId);

  const outstandingBalance = customerId !== undefined ? balances?.get(customerId) ?? 0 : 0;

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("record_payment", {
        p_customer_id: customerId,
        p_payment_amount: Number(amount),
        p_statement_id: customer?.billing_mode === "CYCLE" ? Number(selectedStatement) : null,
        p_payment_date: paymentDate,
        p_payment_method: mode || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recent-payments"] });
      queryClient.invalidateQueries({ queryKey: ["billing-statements"] });
      queryClient.invalidateQueries({ queryKey: ["customer-outstanding-balances"] });
      toast({ title: "Payment recorded" });
      setSelectedCustomer("");
      setSelectedStatement("");
      setAmount("");
      setMode("");
    },
    onError: (err: Error) => {
      toast({ title: "Could not record payment", description: err.message, variant: "destructive" });
    },
  });

  const canSubmit =
    !!customerId &&
    Number(amount) > 0 &&
    (customer?.billing_mode !== "CYCLE" || !!selectedStatement);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment Entry</h1>
        <p className="text-muted-foreground text-sm mt-1">Record incoming customer payments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Record New Payment</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>Customer</Label>
              <Select
                value={selectedCustomer}
                onValueChange={(v) => { setSelectedCustomer(v); setSelectedStatement(""); }}
              >
                <SelectTrigger className="mt-1" data-testid="select-customer"><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {(customers ?? []).map((c) => (
                    <SelectItem key={c.customer_id} value={String(c.customer_id)}>{c.customer_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {customer && (
              <div className="bg-muted/50 rounded p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Outstanding Balance</span>
                  <span className="font-bold text-amber-600">₹{outstandingBalance.toLocaleString()}</span>
                </div>
              </div>
            )}

            {customer?.billing_mode === "CYCLE" ? (
              <div>
                <Label>Against Statement</Label>
                <Select value={selectedStatement} onValueChange={setSelectedStatement}>
                  <SelectTrigger className="mt-1" data-testid="select-statement"><SelectValue placeholder="Select approved statement" /></SelectTrigger>
                  <SelectContent>
                    {(approvedStatements ?? []).map((s) => (
                      <SelectItem key={s.statement_id} value={String(s.statement_id)}>
                        {s.cycle_start_date} – {s.cycle_end_date} (₹{(s.total_amount ?? 0).toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : customer ? (
              <div className="rounded border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                This customer pays directly, no statement required.
              </div>
            ) : null}

            <div><Label>Payment Date</Label><Input type="date" className="mt-1" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} /></div>
            <div><Label>Amount Received (₹)</Label><Input type="number" className="mt-1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" data-testid="input-amount" /></div>
            <div>
              <Label>Payment Mode</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="mt-1" data-testid="select-mode"><SelectValue placeholder="Select mode" /></SelectTrigger>
                <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {paymentMutation.isError && (
              <div className="rounded-lg border border-destructive/50 bg-red-50 px-3 py-2 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{(paymentMutation.error as Error)?.message}</p>
              </div>
            )}

            <Button
              className="w-full"
              disabled={!canSubmit || paymentMutation.isPending}
              onClick={() => paymentMutation.mutate()}
              data-testid="btn-save-payment"
            >
              {paymentMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Record Payment
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Payments</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoadingPayments ? (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading recent payments…</span>
              </div>
            ) : isPaymentsError ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center px-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <p className="text-sm font-semibold text-destructive">Failed to load payments</p>
                <p className="text-xs text-muted-foreground max-w-sm">{(paymentsError as Error)?.message}</p>
              </div>
            ) : (
              <Table>
                {/* TODO: filter to today's payments specifically; currently shows the 10 most recent overall */}
                <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Mode</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(recentPayments ?? []).map((r) => (
                    <TableRow key={r.payment_id}>
                      <TableCell className="text-sm font-medium">{r.customer_master?.customer_name ?? "—"}</TableCell>
                      <TableCell className="text-right font-bold">₹{r.payment_amount.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline">{r.payment_method ?? "—"}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {(recentPayments ?? []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No payments recorded.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

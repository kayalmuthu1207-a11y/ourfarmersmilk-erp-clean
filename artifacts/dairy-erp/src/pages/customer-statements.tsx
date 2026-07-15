import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Search, CheckCircle2, FileText, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useBillingStatements, type BillingStatement } from "@/hooks/useBillingStatements";
import { useCustomers } from "@/hooks/useCustomers";

const statusBadge: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-800 border-green-200",
  DRAFT: "bg-amber-100 text-amber-800 border-amber-200",
};

function totalSupplyValue(stmt: BillingStatement) {
  return stmt.billing_statement_line
    .filter((l) => l.line_amount > 0)
    .reduce((s, l) => s + l.line_amount, 0);
}

function totalCredits(stmt: BillingStatement) {
  return stmt.billing_statement_line
    .filter((l) => l.line_amount < 0)
    .reduce((s, l) => s + Math.abs(l.line_amount), 0);
}

export default function CustomerStatements() {
  const { data: statements, isLoading, isError, error } = useBillingStatements();
  const { data: customers } = useCustomers();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailStmt, setDetailStmt] = useState<BillingStatement | null>(null);
  const [genCustomerId, setGenCustomerId] = useState<string>("");

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("generate_billing_cycle", {
        p_customer_id: Number(genCustomerId),
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-statements"] });
      toast({ title: "Statement generated", description: "The billing cycle statement has been created." });
      setGenCustomerId("");
    },
    onError: (err: Error) => {
      toast({ title: "Could not generate statement", description: err.message, variant: "destructive" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (statementId: number) => {
      const { error } = await supabase.rpc("approve_billing_statement", {
        p_statement_id: statementId,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-statements"] });
      toast({ title: "Statement approved" });
    },
    onError: (err: Error) => {
      toast({ title: "Could not approve statement", description: err.message, variant: "destructive" });
    },
  });

  const list = statements ?? [];
  const cycleCustomers = (customers ?? []).filter((c) => c.billing_mode === "CYCLE");

  const filtered = list.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (s.customer_master?.customer_name ?? "").toLowerCase().includes(term) ||
      String(s.statement_id).includes(term);
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Customer Statements</h1>
        <p className="text-muted-foreground">End-of-cycle billing statements.</p>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle>Generate Statement</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4">
          <Select value={genCustomerId} onValueChange={setGenCustomerId}>
            <SelectTrigger className="w-full sm:w-72" data-testid="select-gen-customer">
              <SelectValue placeholder="Select cycle-billed customer" />
            </SelectTrigger>
            <SelectContent>
              {cycleCustomers.map((c) => (
                <SelectItem key={c.customer_id} value={String(c.customer_id)}>{c.customer_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            disabled={!genCustomerId || generateMutation.isPending}
            onClick={() => generateMutation.mutate()}
            data-testid="btn-generate-statement"
          >
            {generateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Generate Statement
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Billing Statements</CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search statement or customer..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Awaiting Approval</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading statements…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load statements</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Statement</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total Supply Value</TableHead>
                  <TableHead className="text-right">Total Credits</TableHead>
                  <TableHead className="text-right">Net Payable</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((stmt) => {
                  const supply = totalSupplyValue(stmt);
                  const credits = totalCredits(stmt);
                  const netPayable = stmt.total_amount ?? 0;
                  return (
                    <TableRow key={stmt.statement_id} className="cursor-pointer hover:bg-muted/30" onClick={() => setDetailStmt(stmt)}>
                      <TableCell>
                        <div className="font-medium text-primary flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          STMT-{stmt.statement_id}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {stmt.cycle_start_date} – {stmt.cycle_end_date}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{stmt.customer_master?.customer_name ?? "—"}</TableCell>
                      <TableCell className="text-right">₹{supply.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        {credits > 0 ? (
                          <span className="text-destructive">–₹{credits.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">₹{netPayable.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`text-xs ${statusBadge[stmt.status]}`}>
                          {stmt.status === "APPROVED" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {stmt.status === "APPROVED" ? "Approved" : "Awaiting Approval"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost" size="icon" title="View breakdown"
                            onClick={(e) => { e.stopPropagation(); setDetailStmt(stmt); }}
                          >
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          {stmt.status === "DRAFT" && (
                            <Button
                              variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50"
                              disabled={approveMutation.isPending}
                              onClick={(e) => { e.stopPropagation(); approveMutation.mutate(stmt.statement_id); }}
                              data-testid={`btn-approve-${stmt.statement_id}`}
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No statements found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detailStmt} onOpenChange={() => setDetailStmt(null)}>
        {detailStmt && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Statement Breakdown — STMT-{detailStmt.statement_id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-1 text-sm text-muted-foreground py-1">
              <p className="font-semibold text-foreground">{detailStmt.customer_master?.customer_name ?? "—"}</p>
              <p>Period: {detailStmt.cycle_start_date} – {detailStmt.cycle_end_date}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Total Supply Value</span>
                <span className="font-semibold">₹{totalSupplyValue(detailStmt).toLocaleString()}</span>
              </div>

              {detailStmt.billing_statement_line.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Line Items</p>
                  {detailStmt.billing_statement_line.map((line) => (
                    <div key={line.statement_line_id} className="flex justify-between items-start gap-3 py-1.5 border-b border-dashed last:border-0">
                      <div className="flex-1">
                        <p className="text-muted-foreground leading-snug">
                          {line.line_amount < 0 ? (
                            <>Less: <span className="font-medium text-foreground">{line.line_description ?? "Credit"}</span></>
                          ) : (
                            <span className="font-medium text-foreground">{line.line_description ?? "Charge"}</span>
                          )}
                        </p>
                      </div>
                      <span className={`font-medium shrink-0 ${line.line_amount < 0 ? "text-destructive" : ""}`}>
                        {line.line_amount < 0 ? "–" : ""}₹{Math.abs(line.line_amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs italic">No line items for this period.</p>
              )}

              <Separator />
              <div className="flex justify-between items-center pt-1">
                <span className="text-base font-bold">Net Amount Payable</span>
                <span className="text-xl font-bold text-primary">
                  ₹{(detailStmt.total_amount ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
            <DialogFooter className="gap-2">
              {/* TODO: no PDF generation exists yet */}
              <Button onClick={() => setDetailStmt(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

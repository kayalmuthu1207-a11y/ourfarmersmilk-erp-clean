import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useBankStatementUploads } from "@/hooks/useBankStatementUploads";
import { usePaymentMatches, type PaymentMatch } from "@/hooks/usePaymentMatches";

const statusBadge: Record<string, string> = {
  PROPOSED: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-green-100 text-green-800 border-green-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
};

function variance(m: PaymentMatch) {
  const bank = m.bank_transaction?.amount ?? 0;
  const pay = m.customer_payment?.payment_amount ?? 0;
  return Math.round((bank - pay) * 100) / 100;
}

export default function PaymentReconciliation() {
  const { data: uploads, isLoading: uploadsLoading } = useBankStatementUploads();
  const { data: matches, isLoading, isError, error } = usePaymentMatches();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedUploadId, setSelectedUploadId] = useState<string>("");
  const [tab, setTab] = useState<"PROPOSED" | "CONFIRMED" | "REJECTED">("PROPOSED");

  const proposeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("propose_payment_matches", {
        p_upload_id: Number(selectedUploadId),
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-matches"] });
      toast({ title: "Matches proposed", description: "Review them in the Proposed tab below." });
    },
    onError: (err: Error) => {
      toast({ title: "Could not propose matches", description: err.message, variant: "destructive" });
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async ({ matchId, confirmed }: { matchId: number; confirmed: boolean }) => {
      const { error } = await supabase.rpc("confirm_payment_match", {
        p_match_id: matchId,
        p_confirmed: confirmed,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payment-matches"] });
      toast({ title: variables.confirmed ? "Match confirmed" : "Match rejected" });
    },
    onError: (err: Error) => {
      toast({ title: "Could not update match", description: err.message, variant: "destructive" });
    },
  });

  const list = matches ?? [];
  const filtered = list.filter((m) => m.match_status === tab);
  const counts = {
    PROPOSED: list.filter((m) => m.match_status === "PROPOSED").length,
    CONFIRMED: list.filter((m) => m.match_status === "CONFIRMED").length,
    REJECTED: list.filter((m) => m.match_status === "REJECTED").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment Reconciliation</h1>
        <p className="text-muted-foreground text-sm mt-1">Match bank transactions against ERP-recorded customer payments</p>
      </div>

      <div className="rounded-lg border bg-blue-50/60 border-blue-200 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-800">
          Bank statement upload/parsing isn't built yet — this page works against transactions already present
          in <code>bank_transaction</code>. Uploading is a separate pass (needs a Storage bucket decision first).
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base">Run Matching for an Upload</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Select value={selectedUploadId} onValueChange={setSelectedUploadId}>
            <SelectTrigger className="w-72" data-testid="select-upload">
              <SelectValue placeholder={uploadsLoading ? "Loading uploads…" : "Select a bank statement upload…"} />
            </SelectTrigger>
            <SelectContent>
              {(uploads ?? []).map((u) => (
                <SelectItem key={u.upload_id} value={String(u.upload_id)}>
                  Upload #{u.upload_id} — {u.upload_date} ({u.transaction_count} txns)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            disabled={!selectedUploadId || proposeMutation.isPending}
            onClick={() => proposeMutation.mutate()}
            data-testid="btn-propose-matches"
          >
            {proposeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Propose Matches
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-0">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList>
              <TabsTrigger value="PROPOSED" data-testid="tab-proposed">Proposed ({counts.PROPOSED})</TabsTrigger>
              <TabsTrigger value="CONFIRMED" data-testid="tab-confirmed">Confirmed ({counts.CONFIRMED})</TabsTrigger>
              <TabsTrigger value="REJECTED" data-testid="tab-rejected">Rejected ({counts.REJECTED})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading matches…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load payment matches</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank Transaction Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Bank Amount (₹)</TableHead>
                  <TableHead>Matched Customer</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead className="text-right">Payment Amount (₹)</TableHead>
                  <TableHead className="text-right">Variance (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  {tab === "PROPOSED" && <TableHead></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => {
                  const v = variance(m);
                  return (
                    <TableRow key={m.match_id} className={v !== 0 ? "bg-red-50/30" : ""}>
                      <TableCell className="text-sm">{m.bank_transaction?.transaction_date ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {m.bank_transaction?.description ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">₹{(m.bank_transaction?.amount ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="font-medium">{m.customer_payment?.customer_master?.customer_name ?? "—"}</TableCell>
                      <TableCell className="text-sm">{m.customer_payment?.payment_date ?? "—"}</TableCell>
                      <TableCell className="text-right">₹{(m.customer_payment?.payment_amount ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={v !== 0 ? "text-destructive font-bold" : "text-green-600"}>
                          {v !== 0 ? `₹${v}` : "—"}
                        </span>
                      </TableCell>
                      <TableCell><Badge className={statusBadge[m.match_status]}>{m.match_status}</Badge></TableCell>
                      {tab === "PROPOSED" && (
                        <TableCell className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={confirmMutation.isPending}
                            onClick={() => confirmMutation.mutate({ matchId: m.match_id, confirmed: true })}
                            data-testid={`confirm-${m.match_id}`}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-destructive"
                            disabled={confirmMutation.isPending}
                            onClick={() => confirmMutation.mutate({ matchId: m.match_id, confirmed: false })}
                            data-testid={`reject-${m.match_id}`}
                          >
                            <XCircle className="h-3 w-3 mr-1" />Reject
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      No {tab.toLowerCase()} matches.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

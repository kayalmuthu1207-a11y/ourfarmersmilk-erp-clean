import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertTriangle, CheckCircle2, XCircle, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useCustomers } from "@/hooks/useCustomers";
import { useVapQueue } from "@/hooks/useVapQueue";

export default function PortalVapOrders() {
  const { data: customers } = useCustomers();
  const { data: lines, isLoading, isError, error } = useVapQueue();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const confirmMutation = useMutation({
    mutationFn: async ({ orderLineId, confirmed }: { orderLineId: number; confirmed: boolean }) => {
      const { error } = await supabase.rpc("confirm_vap_line", {
        p_order_line_id: orderLineId,
        p_confirmed: confirmed,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { confirmed }) => {
      queryClient.invalidateQueries({ queryKey: ["vap-queue"] });
      queryClient.invalidateQueries({ queryKey: ["dispatchable-orders"] });
      toast({
        title: confirmed ? "Line confirmed available" : "Line marked not available",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Action failed", description: err.message, variant: "destructive" });
    },
  });

  const allLines = lines ?? [];
  const filtered = selectedCustomerId
    ? allLines.filter(
        (l) => l.customer_order?.customer_id === Number(selectedCustomerId),
      )
    : allLines;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">VAP Order Confirmation (Portal)</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Confirm or reject VAP lines on behalf of a customer. This is a staff-usable stand-in
          until customer phone-OTP login is live.
        </p>
      </div>

      {/* Customer selector */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Label className="shrink-0 text-sm">Filter by Customer</Label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className="w-full sm:w-80" data-testid="select-portal-vap-customer">
                <SelectValue placeholder="All customers (show full queue)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All customers</SelectItem>
                {(customers ?? []).map((c) => (
                  <SelectItem key={c.customer_id} value={String(c.customer_id)}>
                    {c.customer_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base">
            Pending VAP Lines
            {selectedCustomerId && customers && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                — {customers.find((c) => String(c.customer_id) === selectedCustomerId)?.customer_name}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading VAP queue…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load VAP queue</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : !selectedCustomerId ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <Users className="h-8 w-8 opacity-40" />
              <p className="text-sm">Select a customer above, or leave blank to see the full queue.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-1 py-12 text-center">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                No pending lines
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                This customer has no VAP lines awaiting confirmation.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((line) => (
                  <TableRow key={line.order_line_id}>
                    <TableCell className="font-medium text-primary">#{line.order_id}</TableCell>
                    <TableCell className="text-sm">{line.customer_order?.order_date ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                      {line.customer_order?.delivery_location?.location_name ?? "—"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {line.product_master?.product_name ?? `Product #${line.product_id}`}
                    </TableCell>
                    <TableCell className="text-right">{line.ordered_qty}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-700 border-green-300 hover:bg-green-50"
                          disabled={confirmMutation.isPending}
                          onClick={() =>
                            confirmMutation.mutate({ orderLineId: line.order_line_id, confirmed: true })
                          }
                          data-testid={`btn-confirm-${line.order_line_id}`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Available
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          disabled={confirmMutation.isPending}
                          onClick={() =>
                            confirmMutation.mutate({ orderLineId: line.order_line_id, confirmed: false })
                          }
                          data-testid={`btn-unavailable-${line.order_line_id}`}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Not Available
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

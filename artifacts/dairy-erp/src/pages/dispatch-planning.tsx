import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, AlertTriangle, Search, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useDispatchableOrders } from "@/hooks/useDispatchableOrders";
import { useInventoryBalances } from "@/hooks/useInventoryBalances";

export default function DispatchPlanning() {
  const { data: orders, isLoading, isError, error } = useDispatchableOrders();
  const { data: balances } = useInventoryBalances();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const confirmMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const { data, error } = await supabase.rpc("confirm_dispatch", {
        p_order_id: orderId,
      });
      if (error) throw new Error(error.message);
      return data[0] as { had_shortage: boolean; invoice_amount: number };
    },
    onMutate: (orderId) => setConfirmingId(orderId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["dispatchable-orders"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-balances"] });
      toast({
        title: result.had_shortage ? "Dispatched with a shortage" : "Dispatched",
        description: result.had_shortage
          ? `Owner has been notified. Invoice: ₹${result.invoice_amount}`
          : `Invoice: ₹${result.invoice_amount}`,
      });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to dispatch order", description: err.message, variant: "destructive" });
    },
    onSettled: () => setConfirmingId(null),
  });

  const list = orders ?? [];
  const balanceMap = balances ?? new Map<number, number>();

  const filteredData = list.filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      (o.customer_master?.customer_name ?? "").toLowerCase().includes(term) ||
      (o.delivery_location?.location_name ?? "").toLowerCase().includes(term)
    );
  });

  const shortageCount = list.reduce(
    (s, o) => s + o.customer_order_line.filter((l) => (balanceMap.get(l.product_id) ?? 0) < l.ordered_qty).length,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dispatch Planning</h1>
          <p className="text-muted-foreground">Review placed orders and confirm dispatch.</p>
        </div>
      </div>

      {shortageCount > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-red-50 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">
              {shortageCount} potential stock shortage{shortageCount > 1 ? "s" : ""} detected
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              Available stock is less than ordered for some items shown below. Confirming dispatch will
              automatically cap the dispatched quantity at available stock and notify the Owner.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Placed Orders</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customer or location..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-dispatch"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading placed orders…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load orders</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px]">Customer / Location</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Ordered</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center w-[220px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((order) => {
                  const pendingVapLines = order.customer_order_line.filter(
                    (l) => l.vap_confirmation_status === "PENDING_CONFIRMATION",
                  );
                  const isBlocked = pendingVapLines.length > 0;

                  return (
                    <TableRow key={order.order_id} className="group">
                      <TableCell className="align-top pt-4">
                        <div className="font-medium">{order.customer_master?.customer_name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          {order.delivery_location?.location_name ?? "—"}
                        </div>
                        {isBlocked && (
                          <p className="text-xs text-amber-700 mt-1 max-w-[200px]">
                            {pendingVapLines.length} VAP line{pendingVapLines.length > 1 ? "s" : ""} awaiting
                            confirmation — resolve on the VAP Queue page first
                          </p>
                        )}
                      </TableCell>
                      <TableCell colSpan={5} className="p-0">
                        <Table>
                          <TableBody>
                            {order.customer_order_line.map((line, idx) => {
                              const available = balanceMap.get(line.product_id) ?? 0;
                              const shortage = available < line.ordered_qty;
                              const isLast = idx === order.customer_order_line.length - 1;
                              return (
                                <TableRow key={line.order_line_id} className="border-0 border-b last:border-0 bg-transparent hover:bg-transparent">
                                  <TableCell className="border-0 w-[220px] text-sm">
                                    {line.product_master?.product_name ?? "—"}
                                  </TableCell>
                                  <TableCell className="text-right border-0 w-[100px]">{line.ordered_qty}</TableCell>
                                  <TableCell className="text-right border-0 w-[110px]">
                                    <span className={shortage ? "text-destructive font-medium" : ""}>{available}</span>
                                  </TableCell>
                                  <TableCell className="text-center border-0 w-[100px]">
                                    <Badge variant="outline" className="text-xs">{order.order_type}</Badge>
                                  </TableCell>
                                  <TableCell className="text-center border-0 w-[220px]">
                                    {isLast && (
                                      <Button
                                        size="sm"
                                        className="gap-1.5"
                                        disabled={isBlocked || (confirmMutation.isPending && confirmingId === order.order_id)}
                                        onClick={() => confirmMutation.mutate(order.order_id)}
                                        data-testid={`btn-confirm-dispatch-${order.order_id}`}
                                      >
                                        {confirmMutation.isPending && confirmingId === order.order_id ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <Truck className="h-3.5 w-3.5" />
                                        )}
                                        Confirm Dispatch
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No placed orders found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Note:</span> Confirming dispatch automatically caps the
        dispatched quantity at available stock and invoices based on what was actually dispatched — no manual
        entry needed. Post-delivery issues (damage, shortage discovered after delivery, returns) are handled on
        the Delivery Confirmation page.
      </div>
    </div>
  );
}

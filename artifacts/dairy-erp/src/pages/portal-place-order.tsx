import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import StaffOrderForm from "@/components/orders/StaffOrderForm";

export default function PortalPlaceOrder() {
  const { data: customers, isLoading, error } = useCustomers();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const customerList = customers ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Place Order for Customer</h1>
        <p className="text-muted-foreground">
          Place an order on behalf of a customer. This will be replaced by customer self-service ordering once phone login is live.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-1.5 max-w-md">
            <Label>Customer</Label>
            {error && (
              <p className="text-sm text-destructive border border-destructive/30 bg-destructive/10 rounded px-3 py-2">
                Error loading customers: {(error as Error).message}
              </p>
            )}
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId} disabled={isLoading || !!error}>
              <SelectTrigger data-testid="select-order-customer">
                <SelectValue placeholder={isLoading ? "Loading customers…" : "Select a customer…"} />
              </SelectTrigger>
              <SelectContent>
                {customerList.map((c) => (
                  <SelectItem key={c.customer_id} value={String(c.customer_id)}>{c.customer_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedCustomerId ? (
        <StaffOrderForm customerId={Number(selectedCustomerId)} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground border rounded-lg bg-muted/20">
          <Users className="h-8 w-8 opacity-40" />
          <p className="text-sm">Select a customer to place an order on their behalf.</p>
        </div>
      )}
    </div>
  );
}

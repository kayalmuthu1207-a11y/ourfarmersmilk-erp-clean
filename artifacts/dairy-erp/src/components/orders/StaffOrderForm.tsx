import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Minus, Plus, CheckCircle, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCustomerDeliveryLocations } from "@/hooks/useCustomerDeliveryLocations";
import { useCustomerOrderableItems } from "@/hooks/useCustomerOrderableItems";

interface StaffOrderFormProps {
  customerId: number;
}

interface PlaceOrderResult {
  order_id: number;
  order_type: string;
  order_date: string;
}

export default function StaffOrderForm({ customerId }: StaffOrderFormProps) {
  const { data: locations, isLoading: locationsLoading, isError: locationsError, error: locationsErrorObj } =
    useCustomerDeliveryLocations(customerId);
  const { data: items, isLoading: itemsLoading, isError: itemsError, error: itemsErrorObj } =
    useCustomerOrderableItems(customerId);

  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [orderResult, setOrderResult] = useState<PlaceOrderResult | null>(null);

  const locationList = locations ?? [];
  const itemList = items ?? [];
  const hasMultipleLocations = locationList.length > 1;
  const effectiveLocationId = hasMultipleLocations ? selectedLocationId : String(locationList[0]?.location_id ?? "");
  const locationSelected = !!effectiveLocationId;
  const selectedLoc = locationList.find((l) => String(l.location_id) === effectiveLocationId);

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const orderLines = itemList
        .filter((item) => (quantities[item.mapping_id] ?? 0) > 0)
        .map((item) => ({ mapping_id: item.mapping_id, quantity: quantities[item.mapping_id] }));

      const { data, error } = await supabase.rpc("place_order", {
        p_location_id: Number(effectiveLocationId),
        p_order_lines: orderLines,
        p_customer_id: customerId,
      });
      if (error) throw new Error(error.message);
      return data[0] as PlaceOrderResult;
    },
    onSuccess: (data) => {
      setOrderResult(data);
    },
  });

  const handleSetQty = (mappingId: number, value: number) => {
    setQuantities((prev) => ({ ...prev, [mappingId]: Math.max(0, value) }));
  };

  const cartLines = itemList
    .filter((item) => (quantities[item.mapping_id] ?? 0) > 0)
    .map((item) => ({ item, qty: quantities[item.mapping_id] }));

  const totalItems = cartLines.reduce((s, l) => s + l.qty, 0);
  const totalValue = cartLines.reduce((s, l) => s + l.qty * (l.item.price ?? 0), 0);

  const handleSubmit = () => {
    if (!locationSelected || totalItems === 0) return;
    placeOrderMutation.mutate();
  };

  if (orderResult) {
    return (
      <Card className="border-green-200 shadow-lg">
        <CardContent className="pt-12 pb-12 flex flex-col items-center text-center">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h2>
          <p className="text-lg text-muted-foreground mb-2">The order has been placed.</p>
          <p className="text-sm text-muted-foreground mb-8 flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {selectedLoc?.location_name} — {selectedLoc?.address}
          </p>
          <div className="w-full max-w-md bg-muted/30 rounded-lg p-6 mb-8 text-left border">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-semibold">#{orderResult.order_id}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Order Type:</span>
              <span className="font-semibold">{orderResult.order_type}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Order Date:</span>
              <span className="font-semibold">{orderResult.order_date}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Delivery Location:</span>
              <span className="font-semibold">{selectedLoc?.location_name}</span>
            </div>
            <div className="flex justify-between mb-2 border-b pb-2">
              <span className="text-muted-foreground">Total Items:</span>
              <span className="font-semibold">{totalItems} units</span>
            </div>
            <div className="text-xs text-muted-foreground mt-3 text-center">
              This order was placed on behalf of the customer.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-primary" />
            Delivery Location
          </CardTitle>
          <CardDescription>
            {locationsLoading
              ? "Loading delivery locations…"
              : hasMultipleLocations
              ? "This customer has multiple delivery locations. Select one before adding products."
              : locationList.length === 1
              ? "This customer's delivery location is pre-selected."
              : "This customer has no active delivery locations."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {locationsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : locationsError ? (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" />{(locationsErrorObj as Error)?.message}
            </p>
          ) : hasMultipleLocations ? (
            <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
              <SelectTrigger className="w-full sm:w-96" data-testid="select-delivery-location">
                <SelectValue placeholder="Select a delivery location…" />
              </SelectTrigger>
              <SelectContent>
                {locationList.map((loc) => (
                  <SelectItem key={loc.location_id} value={String(loc.location_id)}>
                    <div className="flex flex-col">
                      <span className="font-medium">{loc.location_name}</span>
                      <span className="text-xs text-muted-foreground">{loc.address}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : locationList.length === 1 ? (
            <div className="flex items-start gap-3 bg-muted/40 rounded-lg px-4 py-3 border">
              <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">{selectedLoc?.location_name}</p>
                <p className="text-xs text-muted-foreground">{selectedLoc?.address}</p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">Pre-selected</Badge>
            </div>
          ) : (
            <p className="text-sm text-amber-700 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" />
              This customer has no active delivery locations.
            </p>
          )}

          {hasMultipleLocations && !locationSelected && (
            <p className="mt-2 text-sm text-amber-700 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" />
              Please select a delivery location to proceed.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className={!locationSelected ? "opacity-50 pointer-events-none" : ""}>
            <CardHeader className="pb-4 border-b bg-muted/20">
              <CardTitle>Product Selection</CardTitle>
              <CardDescription>
                {itemsLoading ? "Loading items…" : `Showing ${itemList.length} products assigned to this customer.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {itemsLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading products…</span>
                </div>
              ) : itemsError ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center px-4">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                  <p className="text-sm font-semibold text-destructive">Failed to load products</p>
                  <p className="text-xs text-muted-foreground max-w-sm">{(itemsErrorObj as Error)?.message}</p>
                </div>
              ) : itemList.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No products are assigned to this customer yet.
                </div>
              ) : (
                <div className="divide-y">
                  {itemList.map((item) => {
                    const label = item.display_name ?? item.product_master?.product_name ?? "—";
                    const unit = item.uom_master?.uom_name ?? "—";
                    const qty = quantities[item.mapping_id] ?? 0;
                    const hasPrice = item.price !== null;
                    return (
                      <div key={item.mapping_id} className="p-4 sm:p-5 hover:bg-muted/10 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="font-semibold text-base">{label}</div>
                            <div className="text-sm text-muted-foreground mt-0.5">
                              {unit}
                              {hasPrice ? (
                                <> · ₹{item.price}/{unit}</>
                              ) : (
                                <Badge variant="outline" className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200">No price set</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center border rounded-md shadow-sm bg-background">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-r-none" onClick={() => handleSetQty(item.mapping_id, qty - 1)} disabled={!qty}>
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              className="w-14 h-9 border-0 border-x text-center rounded-none font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                              value={qty}
                              onChange={(e) => handleSetQty(item.mapping_id, parseInt(e.target.value, 10) || 0)}
                              disabled={!hasPrice}
                            />
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-l-none text-primary" onClick={() => handleSetQty(item.mapping_id, qty + 1)} disabled={!hasPrice}>
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="sticky top-24 shadow-md">
            <CardHeader className="bg-primary/5 border-b pb-4">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Order Summary
              </CardTitle>
              {selectedLoc && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />{selectedLoc.location_name}
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {cartLines.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {cartLines.map(({ item, qty }) => {
                      const label = item.display_name ?? item.product_master?.product_name ?? "—";
                      return (
                        <div key={item.mapping_id} className="flex justify-between text-sm">
                          <div className="flex-1 pr-2">
                            <span className="font-medium">{qty}×</span> {label}
                            <span className="text-xs text-muted-foreground"> ({item.uom_master?.uom_name ?? "—"})</span>
                          </div>
                          <div className="font-medium whitespace-nowrap">₹{(qty * (item.price ?? 0)).toLocaleString()}</div>
                        </div>
                      );
                    })}
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Total Items</span><span>{totalItems}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Estimated Total</span>
                      <span className="text-primary">₹{totalValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {placeOrderMutation.isError && (
                <div className="mt-4 rounded-lg border border-destructive/50 bg-red-50 px-3 py-2 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">{(placeOrderMutation.error as Error)?.message}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                className="w-full text-lg h-12 shadow-md" size="lg"
                disabled={totalItems === 0 || !locationSelected || placeOrderMutation.isPending}
                onClick={handleSubmit}
                data-testid="btn-confirm-order"
              >
                {placeOrderMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Confirm Order
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

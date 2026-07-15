import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, ShoppingCart, CheckCircle, Milk } from "lucide-react";

const deliveryLocations = [
  { id: "dl1", name: "Unity Enclave" },
  { id: "dl2", name: "Green Residency" },
  { id: "dl3", name: "Lake View Apartments" },
];

const milkProducts = [
  { id: "p1", sku: "PM-500", name: "Pasteurized Milk 500ml", unit: "Pouch", price: 26, type: "Regular" },
  { id: "p2", sku: "PM-1L", name: "Pasteurized Milk 1L", unit: "Packet", price: 50, type: "Regular" },
  { id: "p3", sku: "TM-500", name: "Toned Milk 500ml", unit: "Pouch", price: 24, type: "Regular" },
  { id: "p4", sku: "TM-1L", name: "Toned Milk 1L", unit: "Packet", price: 48, type: "Regular" },
  { id: "p5", sku: "WPM-500", name: "White Packet Milk 500ml", unit: "Pouch", price: 22, type: "White Packet" },
  { id: "p6", sku: "WPM-1L", name: "White Packet Milk 1L", unit: "Packet", price: 44, type: "White Packet" },
];

export default function PortalMilkOrders() {
  const [location, setLocation] = useState("dl1");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [orderId] = useState(() => `MO-${Math.floor(Math.random() * 90000) + 10000}`);

  const cutoffHour = 20;
  const now = new Date();
  const cutoffPassed = now.getHours() >= cutoffHour;

  const total = milkProducts.reduce((sum, p) => sum + (quantities[p.id] || 0) * p.price, 0);
  const totalItems = milkProducts.reduce((sum, p) => sum + (quantities[p.id] || 0), 0);

  const handleQty = (id: string, val: string) => {
    const n = parseInt(val, 10);
    setQuantities((prev) => ({ ...prev, [id]: isNaN(n) || n < 0 ? 0 : n }));
  };

  const selectedLocation = deliveryLocations.find((l) => l.id === location);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold">Milk Order Placed</h2>
        <p className="text-muted-foreground">Your order for <span className="font-medium text-foreground">{selectedLocation?.name}</span> has been confirmed for tomorrow.</p>
        <p className="text-sm font-mono text-muted-foreground">Order ID: {orderId}</p>
        <div className="flex gap-3 mt-2">
          <Button
            variant="outline"
            onClick={() => { setSubmitted(false); setQuantities({}); }}
            data-testid="btn-place-another"
          >
            Place Another Order
          </Button>
          <Button data-testid="btn-view-orders" onClick={() => window.history.back()}>View Order History</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Milk className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Milk Orders</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Regular, branded &amp; white packet milk products</p>
          </div>
        </div>
        <Badge
          variant={cutoffPassed ? "destructive" : "secondary"}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 w-fit"
        >
          <Clock className="h-4 w-4" />
          {cutoffPassed
            ? "Cutoff passed — placing for day after tomorrow"
            : "Order by 8:00 PM for next-day delivery"}
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Select Delivery Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm">
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger data-testid="select-location">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {deliveryLocations.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {milkProducts.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.sku} · per {p.unit}</p>
                </div>
                <Badge
                  variant={p.type === "White Packet" ? "outline" : "secondary"}
                  className="text-xs shrink-0 ml-2"
                >
                  {p.type}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-lg font-bold text-primary">
                  ₹{p.price}
                  <span className="text-xs font-normal text-muted-foreground">/{p.unit}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleQty(p.id, String(Math.max(0, (quantities[p.id] || 0) - 1)))}
                    data-testid={`btn-dec-${p.id}`}
                  >
                    −
                  </Button>
                  <Input
                    className="w-14 h-8 text-center text-sm px-1"
                    value={quantities[p.id] || 0}
                    onChange={(e) => handleQty(p.id, e.target.value)}
                    type="number"
                    min="0"
                    data-testid={`input-qty-${p.id}`}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleQty(p.id, String((quantities[p.id] || 0) + 1))}
                    data-testid={`btn-inc-${p.id}`}
                  >
                    +
                  </Button>
                </div>
              </div>
              {(quantities[p.id] || 0) > 0 && (
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  Subtotal: ₹{((quantities[p.id] || 0) * p.price).toLocaleString("en-IN")}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="sticky bottom-4 shadow-lg border-primary/20">
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Total Units</p>
              <p className="font-bold text-lg">{totalItems}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Order Value</p>
              <p className="font-bold text-lg text-primary">₹{total.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Delivery To</p>
              <p className="font-bold text-sm">{selectedLocation?.name}</p>
            </div>
          </div>
          <Button
            size="lg"
            className="gap-2 min-w-[180px]"
            disabled={totalItems === 0}
            onClick={() => setSubmitted(true)}
            data-testid="btn-place-order"
          >
            <ShoppingCart className="h-5 w-5" />
            Place Milk Order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

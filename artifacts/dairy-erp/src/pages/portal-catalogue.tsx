import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Info } from "lucide-react";
import { products } from "@/data/mock";

const customerPrices: Record<string, number> = {
  "p1": 26, "p2": 50, "p3": 24, "p4": 48, "p5": 14, "p6": 32,
  "p7": 85, "p8": 210, "p9": 52, "p10": 340, "p11": 660,
};

const catColors: Record<string, string> = {
  Milk: "bg-blue-100 text-blue-800 border-blue-200",
  Curd: "bg-amber-100 text-amber-800 border-amber-200",
  Paneer: "bg-green-100 text-green-800 border-green-200",
  Butter: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Ghee: "bg-orange-100 text-orange-800 border-orange-200",
};

const cats = ["All", "Milk", "Curd", "Paneer", "Butter", "Ghee"];

export default function PortalCatalogue() {
  const [filter, setFilter] = useState("All");
  const [added, setAdded] = useState<string[]>([]);

  const filtered = products.filter((p) => filter === "All" || p.category === filter);

  const handleAdd = (id: string) => setAdded((prev) => prev.includes(id) ? prev : [...prev, id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Product Catalogue <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 align-middle ml-1">Preview</Badge></h1>
        <p className="text-muted-foreground text-sm mt-1">Illustrative catalogue view — not yet wired to the logged-in customer's real contracted pricing</p>
      </div>

      <Card className="border-blue-200 bg-blue-50/60">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-800">Preview only — prices shown are illustrative, not your actual contracted rates.</p>
        </CardContent>
      </Card>

      <div className="flex gap-2 flex-wrap">
        {cats.map((c) => (
          <Button key={c} size="sm" variant={filter === c ? "default" : "outline"} onClick={() => setFilter(c)} data-testid={`filter-${c.toLowerCase()}`}>{c}</Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const yourPrice = customerPrices[p.id] ?? p.price;
          const discount = Math.round(((p.price - yourPrice) / p.price) * 100);
          const isAdded = added.includes(p.id);
          return (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <Badge className={catColors[p.category] || ""}>{p.category}</Badge>
                </div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{p.baseUnit}</p>

                <div className="mt-3 flex items-end gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Your Price</p>
                    <p className="text-xl font-bold text-primary">₹{yourPrice}</p>
                  </div>
                  {discount > 0 && (
                    <div className="mb-0.5">
                      <p className="text-xs text-muted-foreground line-through">₹{p.price}</p>
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">{discount}% off</Badge>
                    </div>
                  )}
                </div>

                <div className="mt-2 mb-4">
                  <p className="text-xs text-muted-foreground">Available in: {p.baseUnit} / Tray (30 units) / Bulk</p>
                </div>

                <Button
                  className="w-full"
                  variant={isAdded ? "secondary" : "default"}
                  onClick={() => handleAdd(p.id)}
                  data-testid={`add-to-order-${p.id}`}
                >
                  {isAdded ? "Added — Go to Place Order" : "Add to Order"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

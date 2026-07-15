import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, Milk, AlertTriangle } from "lucide-react";
import { products } from "@/data/mock";

const planData = [
  { product: "Pasteurized Milk 500ml pouch", orderedTomorrow: 2800, currentStock: 1200, suggestedProd: 2000, inputMilk: 1400, planned: 2000 },
  { product: "Pasteurized Milk 1L", orderedTomorrow: 1800, currentStock: 850, suggestedProd: 1200, inputMilk: 1200, planned: 1200 },
  { product: "Toned Milk 500ml", orderedTomorrow: 3200, currentStock: 1500, suggestedProd: 2200, inputMilk: 1100, planned: 2200 },
  { product: "Toned Milk 1L", orderedTomorrow: 1600, currentStock: 900, suggestedProd: 1000, inputMilk: 1000, planned: 1000 },
  { product: "Curd 200g", orderedTomorrow: 900, currentStock: 400, suggestedProd: 700, inputMilk: 490, planned: 700 },
  { product: "Curd 500g", orderedTomorrow: 400, currentStock: 300, suggestedProd: 250, inputMilk: 250, planned: 250 },
  { product: "Paneer 200g", orderedTomorrow: 180, currentStock: 150, suggestedProd: 100, inputMilk: 140, planned: 100 },
  { product: "Paneer 500g", orderedTomorrow: 60, currentStock: 80, suggestedProd: 0, inputMilk: 0, planned: 0 },
  { product: "Butter 100g", orderedTomorrow: 120, currentStock: 90, suggestedProd: 80, inputMilk: 96, planned: 80 },
  { product: "Ghee 500ml", orderedTomorrow: 50, currentStock: 35, suggestedProd: 30, inputMilk: 75, planned: 30 },
  { product: "Ghee 1L", orderedTomorrow: 20, currentStock: 15, suggestedProd: 15, inputMilk: 60, planned: 15 },
];

export default function ProductionPlanning() {
  const [rows, setRows] = useState(planData);
  const totalInput = rows.reduce((s, r) => s + r.inputMilk, 0);
  const available = 9847;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Production Planning</h1>
          <p className="text-muted-foreground text-sm mt-1">Plan tomorrow's production based on pending orders and current stock</p>
        </div>
        <Button data-testid="btn-save-plan"><Save className="h-4 w-4 mr-2" />Save Plan</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-primary/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Milk Available</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2"><Milk className="h-5 w-5 text-primary" /><p className="text-2xl font-bold text-primary">{available.toLocaleString()} L</p></CardContent>
        </Card>
        <Card className={totalInput > available ? "border-destructive" : ""}>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Planned Input Required</CardTitle></CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalInput > available ? "text-destructive" : "text-green-600"}`}>{totalInput.toLocaleString()} L</p>
          </CardContent>
        </Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Milk Remaining After Plan</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{(available - totalInput).toLocaleString()} L</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Products in Plan</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{rows.filter((r) => r.planned > 0).length}</p></CardContent></Card>
      </div>

      {totalInput > available && (
        <Card className="border-destructive bg-red-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive">Planned input ({totalInput.toLocaleString()} L) exceeds available milk ({available.toLocaleString()} L). Reduce planned quantities to stay within input limits.</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="tomorrow">
        <TabsList data-testid="tabs-planning">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="tomorrow">Tomorrow (July 4)</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
        </TabsList>
        <TabsContent value="tomorrow" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Orders Tomorrow</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Suggested Prod.</TableHead>
                    <TableHead className="text-right">Input Milk (L)</TableHead>
                    <TableHead className="text-right">Planned Qty</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => {
                    const stockAfter = r.currentStock + r.planned - r.orderedTomorrow;
                    return (
                      <TableRow key={i} className={stockAfter < 0 ? "bg-red-50/50" : ""}>
                        <TableCell className="font-medium text-sm">{r.product}</TableCell>
                        <TableCell className="text-right">{r.orderedTomorrow.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{r.currentStock.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-primary font-medium">{r.suggestedProd.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{r.inputMilk.toLocaleString()} L</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={r.planned}
                            onChange={(e) => {
                              const newRows = [...rows];
                              newRows[i] = { ...r, planned: Number(e.target.value) };
                              setRows(newRows);
                            }}
                            className="w-24 text-right h-8"
                            data-testid={`planned-qty-${i}`}
                          />
                        </TableCell>
                        <TableCell>
                          {stockAfter < 0 && <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Short {Math.abs(stockAfter)}</Badge>}
                          {stockAfter > r.orderedTomorrow * 0.5 && r.planned > 0 && <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">Excess stock</Badge>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="today" className="mt-4">
          <div className="flex items-center justify-center h-32 text-muted-foreground">Today's production plan has been submitted.</div>
        </TabsContent>
        <TabsContent value="week" className="mt-4">
          <div className="flex items-center justify-center h-32 text-muted-foreground">Weekly view — select individual days from calendar.</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

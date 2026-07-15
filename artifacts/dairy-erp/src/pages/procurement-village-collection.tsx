import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useVillages } from "@/hooks/useVillages";
import { useFarmersByVillage } from "@/hooks/useFarmersByVillage";
import { useVillageCollectionSummary } from "@/hooks/useVillageCollectionSummary";

// NOTE: AM/PM shift split, Avg FAT, Avg SNF, Rate, and Amount columns are
// intentionally removed — none of this data exists in the real schema yet.
// These will come back once FAT/SNF and rate capture are actually defined.

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function VillageCollection() {
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const { data: summary, isLoading, isError, error } = useVillageCollectionSummary(selectedDate);
  const { data: villages } = useVillages();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formVillageId, setFormVillageId] = useState("");
  const [formFarmerId, setFormFarmerId] = useState("");
  const [formDate, setFormDate] = useState(todayIso());
  const [formQuantity, setFormQuantity] = useState("");

  const { data: farmers } = useFarmersByVillage(formVillageId ? Number(formVillageId) : undefined);

  const addRecordMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("enter_direct_collection", {
        p_farmer_id: Number(formFarmerId),
        p_collection_date: formDate,
        p_quantity: Number(formQuantity),
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["village-collection-summary", selectedDate] });
      toast({ title: "Collection record added" });
      setDialogOpen(false);
      setFormVillageId("");
      setFormFarmerId("");
      setFormQuantity("");
    },
    onError: (err: Error) => {
      toast({ title: "Could not add record", description: err.message, variant: "destructive" });
    },
  });

  const consolidateMutation = useMutation({
    mutationFn: async (villageId: number) => {
      const { error } = await supabase.rpc("consolidate_village_procurement", {
        p_village_id: villageId,
        p_procurement_date: selectedDate,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["village-collection-summary", selectedDate] });
      toast({ title: "Village procurement consolidated" });
    },
    onError: (err: Error) => {
      toast({ title: "Could not consolidate", description: err.message, variant: "destructive" });
    },
  });

  const list = summary ?? [];
  const totalQty = list.reduce((s, v) => s + v.total_qty, 0);
  const totalFarmers = list.reduce((s, v) => s + v.farmer_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Village-wise Collection</h1>
          <p className="text-muted-foreground text-sm mt-1">Raw collection records by village.</p>
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            className="w-40"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            data-testid="filter-date"
          />
          <Button onClick={() => setDialogOpen(true)} data-testid="btn-add-record" className="gap-2">
            <Plus className="h-4 w-4" />Add Collection Record
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Villages</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{list.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Farmers Reporting</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{totalFarmers}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Qty Collected</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-primary">{totalQty.toLocaleString()} L</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading collection summary…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load collection summary</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Village</TableHead>
                  <TableHead className="text-right">Farmer Count</TableHead>
                  <TableHead className="text-right">Total Qty (L)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((v) => (
                  <TableRow key={v.village_id}>
                    <TableCell className="font-medium">{v.village_name}</TableCell>
                    <TableCell className="text-right">{v.farmer_count}</TableCell>
                    <TableCell className="text-right font-bold">{v.total_qty.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={v.consolidated ? "bg-green-100 text-green-800 border-green-200" : "bg-amber-100 text-amber-800 border-amber-200"}>
                        {v.consolidated ? "Consolidated" : "Not Yet"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={v.consolidated || v.total_qty <= 0 || consolidateMutation.isPending}
                        onClick={() => consolidateMutation.mutate(v.village_id)}
                        data-testid={`btn-consolidate-${v.village_id}`}
                      >
                        Consolidate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {list.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No villages found.</TableCell>
                  </TableRow>
                )}
                {list.length > 0 && (
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell>Grand Total</TableCell>
                    <TableCell className="text-right">{totalFarmers}</TableCell>
                    <TableCell className="text-right">{totalQty.toLocaleString()}</TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Collection Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div>
              <Label>Village</Label>
              <Select value={formVillageId} onValueChange={(v) => { setFormVillageId(v); setFormFarmerId(""); }}>
                <SelectTrigger className="mt-1" data-testid="select-village"><SelectValue placeholder="Select village" /></SelectTrigger>
                <SelectContent>
                  {(villages ?? []).map((v) => (
                    <SelectItem key={v.village_id} value={String(v.village_id)}>{v.village_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Farmer</Label>
              <Select value={formFarmerId} onValueChange={setFormFarmerId} disabled={!formVillageId}>
                <SelectTrigger className="mt-1" data-testid="select-farmer"><SelectValue placeholder="Select farmer" /></SelectTrigger>
                <SelectContent>
                  {(farmers ?? []).map((f) => (
                    <SelectItem key={f.farmer_id} value={String(f.farmer_id)}>{f.farmer_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" className="mt-1" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>
            <div>
              <Label>Quantity (L)</Label>
              <Input
                type="number"
                className="mt-1"
                value={formQuantity}
                onChange={(e) => setFormQuantity(e.target.value)}
                placeholder="0"
                data-testid="input-quantity"
              />
            </div>
            {addRecordMutation.isError && (
              <div className="rounded-lg border border-destructive/50 bg-red-50 px-3 py-2 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{(addRecordMutation.error as Error)?.message}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              disabled={!formFarmerId || !formQuantity || addRecordMutation.isPending}
              onClick={() => addRecordMutation.mutate()}
              data-testid="btn-save-record"
            >
              {addRecordMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

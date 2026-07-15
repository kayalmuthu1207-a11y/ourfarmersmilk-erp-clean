import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit2, Truck, AlertTriangle } from "lucide-react";

const vehicles = [
  { id: "v1", num: "V001", reg: "TN 01 AB 1234", type: "Refrigerated Van", capacity: "2000 L", status: "Available", driver: "Suresh K", lastService: "2026-06-10", nextService: "2026-09-10" },
  { id: "v2", num: "V002", reg: "TN 01 CD 5678", type: "Refrigerated Van", capacity: "1500 L", status: "On Route", driver: "Senthil R", lastService: "2026-05-20", nextService: "2026-08-20" },
  { id: "v3", num: "V003", reg: "TN 01 EF 9012", type: "Mini Truck", capacity: "1000 L", status: "Available", driver: "Arjun P", lastService: "2026-06-25", nextService: "2026-09-25" },
  { id: "v4", num: "V004", reg: "TN 01 GH 3456", type: "Two-Wheeler", capacity: "50 L", status: "Available", driver: "Karthik M", lastService: "2026-06-01", nextService: "2026-07-01" },
  { id: "v5", num: "V005", reg: "TN 01 IJ 7890", type: "Two-Wheeler", capacity: "50 L", status: "On Route", driver: "Balu S", lastService: "2026-05-15", nextService: "2026-06-15" },
  { id: "v6", num: "V006", reg: "TN 01 KL 2345", type: "Refrigerated Van", capacity: "2000 L", status: "Maintenance", driver: "—", lastService: "2026-07-01", nextService: "2026-10-01" },
];

const statusBadge: Record<string, string> = {
  Available: "bg-green-100 text-green-800 border-green-200",
  "On Route": "bg-blue-100 text-blue-800 border-blue-200",
  Maintenance: "bg-amber-100 text-amber-800 border-amber-200",
};

export default function Vehicles() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Vehicle Master</h1>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Preview</Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">Fleet management and service tracking</p>
        </div>
        <Button onClick={() => setOpen(true)} data-testid="btn-add-vehicle"><Plus className="h-4 w-4 mr-2" />Add Vehicle</Button>
      </div>

      <Card className="border-blue-200 bg-blue-50/60">
        <CardContent className="p-4 text-sm text-blue-800">
          Illustrative preview only — there's no vehicle table in the schema yet, so nothing here is persisted or
          linked to real dispatch data.
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Available", value: vehicles.filter((v) => v.status === "Available").length, color: "text-green-600" },
          { label: "On Route", value: vehicles.filter((v) => v.status === "On Route").length, color: "text-blue-600" },
          { label: "In Maintenance", value: vehicles.filter((v) => v.status === "Maintenance").length, color: "text-amber-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-3">
              <Truck className={`h-8 w-8 ${s.color}`} />
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle#</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Last Service</TableHead>
                <TableHead>Next Service</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((v) => {
                const serviceOverdue = v.nextService < "2026-07-03";
                return (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono font-medium">{v.num}</TableCell>
                    <TableCell className="font-mono">{v.reg}</TableCell>
                    <TableCell>{v.type}</TableCell>
                    <TableCell>{v.capacity}</TableCell>
                    <TableCell><Badge className={statusBadge[v.status]}>{v.status}</Badge></TableCell>
                    <TableCell>{v.driver}</TableCell>
                    <TableCell className="text-sm">{v.lastService}</TableCell>
                    <TableCell className="text-sm">
                      <span className={serviceOverdue ? "text-destructive font-medium flex items-center gap-1" : ""}>
                        {serviceOverdue && <AlertTriangle className="h-3.5 w-3.5" />}{v.nextService}
                      </span>
                    </TableCell>
                    <TableCell><Button size="icon" variant="ghost" className="h-7 w-7"><Edit2 className="h-3.5 w-3.5" /></Button></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Vehicle</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Registration Number</Label><Input className="mt-1" placeholder="TN 01 XX 0000" data-testid="input-reg" /></div>
            <div><Label>Type</Label>
              <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent><SelectItem value="van">Refrigerated Van</SelectItem><SelectItem value="truck">Mini Truck</SelectItem><SelectItem value="bike">Two-Wheeler</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Capacity</Label><Input className="mt-1" placeholder="e.g. 2000 L" data-testid="input-capacity" /></div>
            <div><Label>Assigned Driver</Label><Input className="mt-1" placeholder="Driver name" data-testid="input-driver" /></div>
            <div><Label>Last Service Date</Label><Input type="date" className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)} data-testid="btn-save-vehicle">Add Vehicle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

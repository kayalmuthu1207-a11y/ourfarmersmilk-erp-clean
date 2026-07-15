import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Plus, Loader2, AlertTriangle, CheckCircle2, XCircle, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useCustomers } from "@/hooks/useCustomers";
import { useAllDeliveryLocations } from "@/hooks/useAllDeliveryLocations";
import { useDeliveryRoutes } from "@/hooks/useDeliveryRoutes";

const statusBadge: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 border-green-200",
  PENDING_APPROVAL: "bg-amber-100 text-amber-800 border-amber-200",
  INACTIVE: "bg-gray-100 text-gray-600 border-gray-300",
};

const emptyForm = {
  customerId: "",
  locationName: "",
  address: "",
  contactPerson: "",
  phoneNumber: "",
  fulfillmentType: "",
  isDefault: false,
  routeId: "",
};

type FormState = typeof emptyForm;

export default function CustomersDeliveryLocations() {
  const { data: locations, isLoading, isError, error } = useAllDeliveryLocations();
  const { data: customers } = useCustomers();
  const { data: routes } = useDeliveryRoutes();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const approveMutation = useMutation({
    mutationFn: async (locationId: number) => {
      const { error } = await supabase.rpc("approve_delivery_location", {
        p_location_id: locationId,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-delivery-locations"] });
      toast({ title: "Location approved", description: "Delivery location is now active." });
    },
    onError: (err: Error) => {
      toast({ title: "Could not approve location", description: err.message, variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (locationId: number) => {
      const { error } = await supabase
        .from("delivery_location")
        .update({ status: "INACTIVE" })
        .eq("location_id", locationId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-delivery-locations"] });
      toast({ title: "Location rejected", description: "Delivery location set to inactive." });
    },
    onError: (err: Error) => {
      toast({ title: "Could not reject location", description: err.message, variant: "destructive" });
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("create_delivery_location", {
        p_customer_id: Number(form.customerId),
        p_location_name: form.locationName.trim(),
        p_address: form.address.trim() || null,
        p_contact_person: form.contactPerson.trim() || null,
        p_phone_number: form.phoneNumber.trim() || null,
        p_fulfillment_type: form.fulfillmentType || null,
        p_is_default_location: form.isDefault,
        p_route_id: form.routeId ? Number(form.routeId) : null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-delivery-locations"] });
      toast({ title: "Location added", description: "New delivery location created." });
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: (err: Error) => {
      toast({ title: "Could not add location", description: err.message, variant: "destructive" });
    },
  });

  const list = locations ?? [];
  const pending = list.filter((l) => l.status === "PENDING_APPROVAL").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Delivery Locations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Each customer can have multiple delivery points — portal shows only their assigned locations.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} data-testid="btn-add-location">
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {!isLoading && !isError && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold mt-1">{list.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-2xl font-bold mt-1">{list.filter((l) => l.status === "ACTIVE").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Pending Approval</p>
              <p className={`text-2xl font-bold mt-1 ${pending > 0 ? "text-amber-600" : ""}`}>{pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Customers Covered</p>
              <p className="text-2xl font-bold mt-1">{new Set(list.map((l) => l.customer_id)).size}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base">All Delivery Locations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading locations…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load locations</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Fulfillment</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                      No delivery locations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((loc) => (
                    <TableRow key={loc.location_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">{loc.location_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[140px] truncate">
                        {loc.customer_master?.customer_name ?? `#${loc.customer_id}`}
                      </TableCell>
                      <TableCell className="text-sm max-w-[160px] truncate">
                        {loc.address ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {loc.contact_person ? (
                          <div>
                            <p>{loc.contact_person}</p>
                            {loc.phone_number && (
                              <p className="text-xs text-muted-foreground">{loc.phone_number}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {loc.delivery_route?.route_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {loc.fulfillment_type ?? "—"}
                      </TableCell>
                      <TableCell>
                        {loc.is_default_location && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
                            <Star className="h-2.5 w-2.5" />Default
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${statusBadge[loc.status]}`}>
                          {loc.status === "ACTIVE" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {loc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {loc.status === "PENDING_APPROVAL" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-700 border-green-300 hover:bg-green-50"
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              onClick={() => approveMutation.mutate(loc.location_id)}
                              data-testid={`btn-approve-loc-${loc.location_id}`}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              onClick={() => rejectMutation.mutate(loc.location_id)}
                              data-testid={`btn-reject-loc-${loc.location_id}`}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Location Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setForm(emptyForm); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Delivery Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Customer <span className="text-destructive">*</span></Label>
              <Select value={form.customerId} onValueChange={(v) => setForm((f) => ({ ...f, customerId: v }))}>
                <SelectTrigger data-testid="select-loc-customer">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {(customers ?? []).map((c) => (
                    <SelectItem key={c.customer_id} value={String(c.customer_id)}>
                      {c.customer_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Location Name <span className="text-destructive">*</span></Label>
              <Input
                value={form.locationName}
                onChange={(e) => setForm((f) => ({ ...f, locationName: e.target.value }))}
                placeholder="e.g. Unity Enclave, Block A"
                data-testid="input-loc-name"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Full Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Full delivery address"
                data-testid="input-loc-address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Contact Person</Label>
                <Input
                  value={form.contactPerson}
                  onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))}
                  placeholder="Name"
                  data-testid="input-loc-contact"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  placeholder="+91 …"
                  data-testid="input-loc-phone"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Fulfillment Type</Label>
                <Input
                  value={form.fulfillmentType}
                  onChange={(e) => setForm((f) => ({ ...f, fulfillmentType: e.target.value }))}
                  placeholder="e.g. HOME_DELIVERY"
                  data-testid="input-loc-fulfillment"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Route</Label>
                <Select
                  value={form.routeId}
                  onValueChange={(v) => setForm((f) => ({ ...f, routeId: v }))}
                >
                  <SelectTrigger data-testid="select-loc-route">
                    <SelectValue placeholder="No route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No route</SelectItem>
                    {(routes ?? []).map((r) => (
                      <SelectItem key={r.route_id} value={String(r.route_id)}>
                        {r.route_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="is-default"
                checked={form.isDefault}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isDefault: !!checked }))}
                data-testid="checkbox-loc-default"
              />
              <Label htmlFor="is-default" className="cursor-pointer">Set as default location for this customer</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              disabled={!form.customerId || !form.locationName.trim() || addMutation.isPending}
              onClick={() => addMutation.mutate()}
              data-testid="btn-save-location"
            >
              {addMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

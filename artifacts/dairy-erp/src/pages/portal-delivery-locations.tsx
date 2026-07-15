import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Plus, CheckCircle, Clock } from "lucide-react";

const locations = [
  { id: "l1", name: "Main Gate / Security", address: "Prestige Towers, OMR Road, Sholinganallur, Chennai – 600119", contact: "Ramu (Security)", mobile: "9841111222", unit: "Gate Security Post", status: "Active", approvedBy: "Owner" },
  { id: "l2", name: "Block A — Lobby", address: "Prestige Towers Block A, Ground Floor, Sholinganallur", contact: "Suresh (Housekeeping)", mobile: "9841333444", unit: "Block A Lobby", status: "Active", approvedBy: "Owner" },
  { id: "l3", name: "Block B — Lobby", address: "Prestige Towers Block B, Ground Floor, Sholinganallur", contact: "Murugan (Housekeeping)", mobile: "9841555666", unit: "Block B Lobby", status: "Active", approvedBy: "Manager" },
  { id: "l4", name: "Club House", address: "Prestige Towers Club House, Basement Level", contact: "Priya (Manager)", mobile: "9841777888", unit: "Club House Reception", status: "Inactive", approvedBy: "Owner" },
];

export default function PortalDeliveryLocations() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Delivery Locations</h1>
          <p className="text-muted-foreground text-sm mt-1">Prestige Towers Apartments — approved delivery points</p>
        </div>
        <Button onClick={() => { setOpen(true); setSubmitted(false); }} data-testid="btn-request-location">
          <Plus className="h-4 w-4 mr-2" />Request New Location
        </Button>
      </div>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4 flex items-start gap-3">
          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-800">New delivery locations require approval from the dairy before they become active. Approved locations appear on your order form automatically.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {locations.map((l) => (
          <Card key={l.id} className={l.status === "Inactive" ? "opacity-60" : ""}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">{l.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{l.unit}</p>
                  </div>
                </div>
                <Badge className={l.status === "Active" ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}>{l.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{l.address}</p>
              <div className="grid grid-cols-2 gap-2 text-sm border-t pt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Contact Person</p>
                  <p className="font-medium">{l.contact}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mobile</p>
                  <p className="font-mono">{l.mobile}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Approved by</p>
                  <p>{l.approvedBy}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request New Delivery Location</DialogTitle></DialogHeader>
          {submitted ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <p className="font-medium">Request Submitted</p>
              <p className="text-sm text-muted-foreground text-center">Your new location request has been sent to the dairy for approval. You'll be notified once it's approved.</p>
              <Button onClick={() => setOpen(false)} className="mt-2">Done</Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <div><Label>Location Name</Label><Input className="mt-1" placeholder="e.g. Block C Lobby" data-testid="input-loc-name" /></div>
                <div><Label>Full Address</Label><Input className="mt-1" placeholder="Building, floor, street" data-testid="input-address" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Contact Person</Label><Input className="mt-1" data-testid="input-contact" /></div>
                  <div><Label>Mobile</Label><Input className="mt-1" data-testid="input-mobile" /></div>
                </div>
                <div><Label>Floor / Unit Details</Label><Input className="mt-1" placeholder="e.g. Ground floor, near lift" data-testid="input-unit" /></div>
                <div><Label>Notes</Label><Input className="mt-1" placeholder="Any special delivery instructions" data-testid="input-notes" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => setSubmitted(true)} data-testid="btn-submit-location">Submit for Approval</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

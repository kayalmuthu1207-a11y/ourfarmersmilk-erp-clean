import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle2, AlertTriangle, Droplets, MapPin, Phone,
  ChevronDown, ChevronUp, Package, Clock, RotateCcw, Settings
} from "lucide-react";
import { BRD_REASON_CODES } from "@/data/mock";

const routeStops = [
  {
    id: "s1", stop: 1,
    locationName: "Unity Enclave",
    customerName: "Prestige Towers Apartments",
    address: "Block A Gate, Unity Enclave, Tambaram",
    contact: "Ravi Kumar", phone: "98765 43210",
    products: [
      { id: "p1", name: "Past. Milk 500ml", qty: 120 },
      { id: "p2", name: "Toned Milk 1L", qty: 45 },
    ]
  },
  {
    id: "s2", stop: 2,
    locationName: "Green Residency",
    customerName: "Prestige Towers Apartments",
    address: "Block C Entry, Green Residency, Perungalathur",
    contact: "Sunita M", phone: "98765 43211",
    products: [
      { id: "p1", name: "Past. Milk 500ml", qty: 80 },
    ]
  },
  {
    id: "s3", stop: 3,
    locationName: "Lake View Apartments",
    customerName: "Prestige Towers Apartments",
    address: "Main Gate, Lake View Apts, Guduvanchery",
    contact: "Praveen S", phone: "98765 43212",
    products: [
      { id: "p1", name: "Past. Milk 500ml", qty: 60 },
      { id: "p3", name: "Past. Milk 1L", qty: 20 },
    ]
  },
  {
    id: "s4", stop: 4,
    locationName: "Brigade Main Gate",
    customerName: "Brigade Residency",
    address: "Main Entrance, Brigade Residency, Tambaram",
    contact: "Gate Security", phone: "98765 43213",
    products: [
      { id: "p3", name: "Past. Milk 1L", qty: 90 },
      { id: "p4", name: "Toned Milk 500ml", qty: 60 },
    ]
  },
  {
    id: "s5", stop: 5,
    locationName: "Mantri Tower 1 Lobby",
    customerName: "Mantri Elegance",
    address: "Tower 1 Ground Floor, Mantri Elegance, Chromepet",
    contact: "Reception", phone: "98765 43215",
    products: [
      { id: "p1", name: "Past. Milk 500ml", qty: 70 },
    ]
  },
];

type StopStatus = "pending" | "delivered" | "issue";

interface StopReport {
  status: StopStatus;
  issueReason?: string;
  issueQty?: number;
}

export default function DeliveryPartner() {
  const [reports, setReports] = useState<Record<string, StopReport>>({});
  const [expanded, setExpanded] = useState<string | null>("s1");
  const [activeAction, setActiveAction] = useState<Record<string, boolean>>({});
  const [issueForm, setIssueForm] = useState<Record<string, { reason: string; qty: number; productId: string }>>({});

  const now = new Date();
  const completedCount = Object.values(reports).filter((r) => r.status !== "pending").length;
  const totalUnits = routeStops.reduce((s, stop) => s + stop.products.reduce((ps, p) => ps + p.qty, 0), 0);

  const markDelivered = (stopId: string) => {
    setReports((prev) => ({ ...prev, [stopId]: { status: "delivered" } }));
    setActiveAction((prev) => ({ ...prev, [stopId]: false }));
    const nextIdx = routeStops.findIndex((s) => s.id === stopId) + 1;
    if (nextIdx < routeStops.length) setExpanded(routeStops[nextIdx].id);
    else setExpanded(null);
  };

  const submitIssue = (stopId: string) => {
    const form = issueForm[stopId];
    setReports((prev) => ({
      ...prev,
      [stopId]: { status: "issue", issueReason: form?.reason, issueQty: form?.qty },
    }));
    setActiveAction((prev) => ({ ...prev, [stopId]: false }));
    const nextIdx = routeStops.findIndex((s) => s.id === stopId) + 1;
    if (nextIdx < routeStops.length) setExpanded(routeStops[nextIdx].id);
  };

  const statusBadge = (status: StopStatus, report?: StopReport) => {
    if (status === "delivered") return <Badge className="bg-green-100 text-green-800 border-green-200 gap-1"><CheckCircle2 className="h-3 w-3" />Delivered</Badge>;
    if (status === "issue") {
      const icons: Record<string, React.ReactElement> = {
        Leakage: <Droplets className="h-3 w-3" />,
        Shortage: <AlertTriangle className="h-3 w-3" />,
        Damage: <AlertTriangle className="h-3 w-3" />,
        Return: <RotateCcw className="h-3 w-3" />,
        "Manual Adjustment": <Settings className="h-3 w-3" />,
      };
      const icon = (report?.issueReason && icons[report.issueReason]) ?? <AlertTriangle className="h-3 w-3" />;
      return <Badge className="bg-red-100 text-red-800 border-red-200 gap-1">{icon}{report?.issueReason ?? "Issue"} Reported</Badge>;
    }
    return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
  };

  return (
    <div className="space-y-3">
      <div className="bg-card rounded-xl border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Today's Route</p>
            <p className="text-lg font-bold mt-0.5">R-01 Tambaram Zone</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Started</p>
            <p className="text-sm font-semibold">06:30 AM</p>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium">{routeStops.length} stops</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Package className="h-4 w-4 text-primary" />
            <span className="font-medium">{totalUnits} units</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedCount} of {routeStops.length} stops completed</span>
            <span>{Math.round((completedCount / routeStops.length) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(completedCount / routeStops.length) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {routeStops.map((stop) => {
          const report = reports[stop.id];
          const status: StopStatus = report?.status ?? "pending";
          const isExpanded = expanded === stop.id;
          const showIssueForm = !!activeAction[stop.id];
          const isDone = status !== "pending";

          return (
            <Card key={stop.id} className={isDone ? "opacity-75" : ""}>
              <CardContent className="p-0">
                <button
                  className="w-full text-left p-4"
                  onClick={() => setExpanded(isExpanded ? null : stop.id)}
                  data-testid={`stop-toggle-${stop.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        status === "delivered" ? "bg-green-100 text-green-700" :
                        status === "issue" ? "bg-red-100 text-red-700" :
                        "bg-primary/10 text-primary"
                      }`}>
                        {status === "delivered" ? <CheckCircle2 className="h-4 w-4" /> :
                         status === "issue" ? <AlertTriangle className="h-4 w-4" /> :
                         stop.stop}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-base leading-tight">{stop.locationName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{stop.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusBadge(status, report)}
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t pt-3">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-start gap-1.5 text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{stop.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{stop.contact} — {stop.phone}</span>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Products to Deliver</p>
                      {stop.products.map((p) => (
                        <div key={p.id} className="flex justify-between text-sm">
                          <span>{p.name}</span>
                          <span className="font-bold">{p.qty} units</span>
                        </div>
                      ))}
                    </div>

                    {!isDone && !showIssueForm && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white h-12 flex-col gap-0.5 text-xs"
                          onClick={() => markDelivered(stop.id)}
                          data-testid={`btn-delivered-${stop.id}`}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                          Delivered
                        </Button>
                        <Button
                          variant="outline"
                          className="border-amber-400 text-amber-700 hover:bg-amber-50 h-12 flex-col gap-0.5 text-xs"
                          onClick={() => {
                            setActiveAction((prev) => ({ ...prev, [stop.id]: true }));
                            setIssueForm((prev) => ({ ...prev, [stop.id]: { reason: "", qty: 0, productId: stop.products[0]?.id ?? "" } }));
                          }}
                          data-testid={`btn-report-issue-${stop.id}`}
                        >
                          <AlertTriangle className="h-5 w-5" />
                          Report Issue
                        </Button>
                      </div>
                    )}

                    {!isDone && showIssueForm && (
                      <div className="border border-amber-200 bg-amber-50/50 rounded-lg p-4 space-y-3">
                        <p className="font-semibold text-amber-800 text-sm">Post-Delivery Issue Report</p>
                        <p className="text-xs text-amber-700">Reason codes per BRD. Use for issues discovered during or after delivery only.</p>
                        <div className="space-y-1">
                          <Label className="text-xs">Product</Label>
                          <Select
                            value={issueForm[stop.id]?.productId}
                            onValueChange={(v) => setIssueForm((prev) => ({ ...prev, [stop.id]: { ...prev[stop.id], productId: v } }))}
                          >
                            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {stop.products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.qty} dispatched)</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Reason</Label>
                          <Select
                            value={issueForm[stop.id]?.reason}
                            onValueChange={(v) => setIssueForm((prev) => ({ ...prev, [stop.id]: { ...prev[stop.id], reason: v } }))}
                          >
                            <SelectTrigger className="h-11" data-testid={`select-reason-${stop.id}`}><SelectValue placeholder="Select reason…" /></SelectTrigger>
                            <SelectContent>
                              {BRD_REASON_CODES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Affected Quantity</Label>
                          <Input
                            type="number" min={0}
                            className="h-11 text-base"
                            value={issueForm[stop.id]?.qty ?? 0}
                            onChange={(e) => setIssueForm((prev) => ({ ...prev, [stop.id]: { ...prev[stop.id], qty: parseInt(e.target.value) || 0 } }))}
                            data-testid={`input-issue-qty-${stop.id}`}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 h-11" onClick={() => setActiveAction((prev) => ({ ...prev, [stop.id]: false }))}>Cancel</Button>
                          <Button className="flex-1 h-11 bg-amber-600 hover:bg-amber-700" onClick={() => submitIssue(stop.id)} data-testid={`btn-submit-issue-${stop.id}`}>Submit Report</Button>
                        </div>
                      </div>
                    )}

                    {isDone && (
                      <p className="text-xs text-center text-muted-foreground italic">
                        {status === "delivered" ? "Delivered successfully" : `${report?.issueReason ?? "Issue"} report submitted`}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {completedCount === routeStops.length && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center space-y-2">
          <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
          <p className="font-bold text-green-800 text-lg">Route Complete!</p>
          <p className="text-sm text-green-700">All {routeStops.length} stops done. Great work!</p>
          <p className="text-xs text-green-600">{now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
      )}
    </div>
  );
}

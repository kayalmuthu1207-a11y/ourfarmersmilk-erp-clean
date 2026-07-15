import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Truck, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const routes = [
  {
    id: "r1", name: "Route A — South West", driver: "Suresh K", vehicle: "TN 01 AB 1234", startTime: "06:30 AM", eta: "10:00 AM",
    stops: [
      { customer: "Prestige Towers Apartments", status: "Delivered", time: "07:15 AM" },
      { customer: "Brigade Residency", status: "Delivered", time: "07:45 AM" },
      { customer: "Mantri Elegance", status: "Pending", time: null },
    ],
    progress: 67,
  },
  {
    id: "r2", name: "Route B — Central South", driver: "Arjun P", vehicle: "TN 01 EF 9012", startTime: "06:45 AM", eta: "10:30 AM",
    stops: [
      { customer: "Hotel Saravana Bhavan", status: "Delivered", time: "07:30 AM" },
      { customer: "Anjappar Restaurant", status: "Delivered", time: "08:00 AM" },
      { customer: "Hotel Palmgrove", status: "Delivered", time: "08:30 AM" },
      { customer: "Quality Dairy Shop", status: "En Route", time: null },
    ],
    progress: 75,
  },
  {
    id: "r3", name: "Route C — South Suburbs", driver: "Senthil R", vehicle: "TN 01 CD 5678", startTime: "07:00 AM", eta: "11:00 AM",
    stops: [
      { customer: "TCS Office Campus", status: "Delivered", time: "08:20 AM" },
      { customer: "Infosys Cafeteria", status: "En Route", time: null },
      { customer: "Fresh Mart", status: "Pending", time: null },
      { customer: "Sri Murugan Stores", status: "Pending", time: null },
    ],
    progress: 25,
  },
  {
    id: "r4", name: "Route D — Hotels", driver: "Manoj G", vehicle: "TN 01 AB 1234", startTime: "07:15 AM", eta: "09:30 AM",
    stops: [
      { customer: "Hotel Saravana Bhavan", status: "Delivered", time: "07:45 AM" },
      { customer: "Hotel Palmgrove", status: "Delivered", time: "08:10 AM" },
      { customer: "Anjappar Restaurant", status: "Delivered", time: "08:35 AM" },
    ],
    progress: 100,
  },
];

const stopStatus: Record<string, { label: string; color: string; icon: React.ReactElement }> = {
  Delivered: { label: "Delivered", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle className="h-3.5 w-3.5 text-green-600" /> },
  "En Route": { label: "En Route", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <Truck className="h-3.5 w-3.5 text-blue-600" /> },
  Pending: { label: "Pending", color: "bg-gray-100 text-gray-600 border-gray-200", icon: <Clock className="h-3.5 w-3.5 text-gray-400" /> },
  Issue: { label: "Issue", color: "bg-red-100 text-red-800 border-red-200", icon: <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> },
};

export default function DispatchTracking() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Dispatch Tracking</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time delivery status — July 3, 2026</p>
        </div>
        <Button variant="outline" data-testid="btn-refresh"><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active Routes", value: routes.filter((r) => r.progress < 100).length, color: "text-blue-600" },
          { label: "Completed Routes", value: routes.filter((r) => r.progress === 100).length, color: "text-green-600" },
          { label: "Deliveries Done", value: routes.reduce((s, r) => s + r.stops.filter((st) => st.status === "Delivered").length, 0), color: "text-green-600" },
          { label: "Pending Deliveries", value: routes.reduce((s, r) => s + r.stops.filter((st) => st.status !== "Delivered").length, 0), color: "text-amber-600" },
        ].map((s) => (
          <Card key={s.label}><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle></CardHeader><CardContent><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {routes.map((route) => (
          <Card key={route.id} className={route.progress === 100 ? "border-green-200" : "border-blue-200"}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-sm">{route.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{route.driver} — {route.vehicle}</p>
                </div>
                <Badge className={route.progress === 100 ? "bg-green-100 text-green-800 border-green-200" : "bg-blue-100 text-blue-800 border-blue-200"}>
                  {route.progress === 100 ? "Complete" : `${route.progress}%`}
                </Badge>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                <span>Started: {route.startTime}</span>
                <span>ETA: {route.eta}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                <div className="h-1.5 rounded-full bg-primary" style={{ width: `${route.progress}%` }}></div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {route.stops.map((stop, i) => {
                const s = stopStatus[stop.status];
                return (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="flex-1">{stop.customer}</span>
                    <div className="flex items-center gap-1.5">
                      {s.icon}<Badge className={`${s.color} text-xs`}>{s.label}</Badge>
                    </div>
                    {stop.time && <span className="text-xs text-muted-foreground">{stop.time}</span>}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

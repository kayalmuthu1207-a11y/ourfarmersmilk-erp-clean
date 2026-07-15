import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Phone, MapPin, Star, Award } from "lucide-react";

const profile = {
  name: "Suresh Kumar",
  partnerId: "DP-001",
  phone: "98765 43200",
  vehicle: "KA 01 AB 1234 — Tempo",
  routes: ["R-01 Tambaram Zone", "R-02 Perungalathur Zone"],
  joinedOn: "2024-03-15",
  rating: 4.8,
  totalDeliveries: 482,
  totalUnits: 58400,
  onTimeRate: "97.5%",
  issueRate: "1.2%",
};

export default function DeliveryProfile() {
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border p-5 flex items-start gap-4">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
          {profile.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xl font-bold">{profile.name}</p>
          <p className="text-sm text-muted-foreground mt-0.5">Partner ID: {profile.partnerId}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />{profile.phone}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Truck className="h-4 w-4" />{profile.vehicle}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-amber-600 shrink-0">
          <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
          <span className="text-lg font-bold">{profile.rating}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card><CardContent className="pt-4 pb-4"><p className="text-xs text-muted-foreground">Total Deliveries</p><p className="text-2xl font-bold mt-1">{profile.totalDeliveries}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><p className="text-xs text-muted-foreground">Total Units</p><p className="text-2xl font-bold mt-1">{profile.totalUnits.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><p className="text-xs text-muted-foreground">On-Time Rate</p><p className="text-2xl font-bold mt-1 text-green-600">{profile.onTimeRate}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><p className="text-xs text-muted-foreground">Issue Rate</p><p className="text-2xl font-bold mt-1 text-amber-600">{profile.issueRate}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b"><CardTitle className="text-base">My Routes</CardTitle></CardHeader>
        <CardContent className="pt-4 space-y-2">
          {profile.routes.map((r) => (
            <div key={r} className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">{r}</span>
              <Badge variant="outline" className="ml-auto text-xs">Active</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 border-b"><CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4 text-amber-500" /> Achievements</CardTitle></CardHeader>
        <CardContent className="pt-4 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏅</span>
            <div>
              <p className="font-medium text-sm">500 Deliveries Milestone</p>
              <p className="text-xs text-muted-foreground">Almost there — {profile.totalDeliveries}/500</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="font-medium text-sm">4.8+ Rating</p>
              <p className="text-xs text-muted-foreground">Consistently high customer satisfaction</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

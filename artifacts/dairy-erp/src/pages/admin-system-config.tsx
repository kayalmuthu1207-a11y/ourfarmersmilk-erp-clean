import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, CheckCircle, Wifi } from "lucide-react";

const notifEvents = [
  { event: "Order Placed", whatsapp: true, email: false, inapp: true },
  { event: "Order Modified", whatsapp: true, email: false, inapp: true },
  { event: "Order Cancelled", whatsapp: true, email: true, inapp: true },
  { event: "Dispatch Confirmed", whatsapp: false, email: false, inapp: true },
  { event: "Variance Alert (>3%)", whatsapp: true, email: true, inapp: true },
  { event: "Stock Adjustment", whatsapp: true, email: false, inapp: true },
  { event: "Settlement Generated", whatsapp: false, email: true, inapp: true },
  { event: "Payment Received", whatsapp: true, email: false, inapp: true },
  { event: "Tally Sync Failed", whatsapp: false, email: true, inapp: true },
  { event: "Credit Limit Exceeded", whatsapp: true, email: true, inapp: true },
];

export default function SystemConfig() {
  const [tallyConnected, setTallyConnected] = useState(true);
  const [notifications, setNotifications] = useState(notifEvents);

  const toggleNotif = (idx: number, channel: "whatsapp" | "email" | "inapp") => {
    setNotifications((prev) => prev.map((n, i) => i === idx ? { ...n, [channel]: !n[channel] } : n));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Configuration</h1>
          <p className="text-muted-foreground text-sm mt-1">Global settings for the Dairy ERP platform</p>
        </div>
        <Button data-testid="btn-save-config"><Save className="h-4 w-4 mr-2" />Save All Changes</Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap h-auto gap-1" data-testid="tabs-config">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="orders">Order Settings</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="audit">System Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">General Settings</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Dairy Name</Label><Input className="mt-1" defaultValue="Shri Ambal Dairy" data-testid="input-dairy-name" /></div>
                <div><Label>GSTIN</Label><Input className="mt-1" defaultValue="33AAAAA0000A1Z5" data-testid="input-gstin" /></div>
                <div><Label>Address Line 1</Label><Input className="mt-1" defaultValue="123 Dairy Road, Tambaram" /></div>
                <div><Label>Address Line 2</Label><Input className="mt-1" defaultValue="Chennai – 600045, Tamil Nadu" /></div>
                <div><Label>Phone</Label><Input className="mt-1" defaultValue="+91 44 2234 5678" /></div>
                <div><Label>Email</Label><Input className="mt-1" defaultValue="operations@shriambaldairy.in" /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Order Cutoff Times</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border bg-amber-50/50 border-amber-200 p-3 text-xs text-amber-800">
                Orders placed after the cutoff time are held for the <span className="font-semibold">following day's</span> delivery. Cutoff times apply in IST.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">Milk Order Cutoff</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Pasteurized, Toned &amp; White Packet milk</p>
                    <p className="text-xs text-muted-foreground">Orders after this time → next day</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Input className="w-24" defaultValue="20:00" type="time" data-testid="input-milk-cutoff" />
                    <span className="text-xs text-muted-foreground">IST</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">VAP Order Cutoff</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Paneer, Ghee, Butter, Curd, Cream</p>
                    <p className="text-xs text-muted-foreground">Earlier cutoff — production lead time</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Input className="w-24" defaultValue="14:00" type="time" data-testid="input-vap-cutoff" />
                    <span className="text-xs text-muted-foreground">IST</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Order Behaviour</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div><p className="font-medium text-sm">Same-Day Orders Allowed</p><p className="text-xs text-muted-foreground">Require owner approval</p></div>
                  <Switch defaultChecked data-testid="toggle-sameday" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div><p className="font-medium text-sm">Max Modifications Per Day</p><p className="text-xs text-muted-foreground">Per customer, per day</p></div>
                  <Input className="w-20" defaultValue="3" type="number" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div><p className="font-medium text-sm">Order Confirmation Email</p><p className="text-xs text-muted-foreground">Auto-send on order placed</p></div>
                  <Switch data-testid="toggle-order-email" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div><p className="font-medium text-sm">Allow Mixed Orders</p><p className="text-xs text-muted-foreground">Milk + VAP in a single order entry</p></div>
                  <Switch data-testid="toggle-mixed-orders" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Billing Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Default Billing Cycle</Label>
                  <Select defaultValue="10">
                    <SelectTrigger className="mt-1" data-testid="select-cycle"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="10">10 Days</SelectItem><SelectItem value="30">30 Days</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Late Payment Rate (%)</Label><Input className="mt-1" defaultValue="0" type="number" disabled data-testid="input-late-rate" /><p className="text-xs text-muted-foreground mt-1">Currently set to 0% — activate when needed</p></div>
                <div><Label>Invoice Number Prefix</Label><Input className="mt-1" defaultValue="INV-" data-testid="input-inv-prefix" /></div>
                <div><Label>Statement Number Prefix</Label><Input className="mt-1" defaultValue="STMT-" data-testid="input-stmt-prefix" /></div>
                <div className="flex items-center justify-between p-3 border rounded-lg col-span-2">
                  <div><p className="font-medium text-sm">Auto-generate Statements at Cycle End</p><p className="text-xs text-muted-foreground">Generates draft statement automatically</p></div>
                  <Switch defaultChecked data-testid="toggle-auto-stmt" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Notification Events</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead className="text-center">WhatsApp</TableHead>
                    <TableHead className="text-center">Email</TableHead>
                    <TableHead className="text-center">In-App</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((n, i) => (
                    <TableRow key={n.event}>
                      <TableCell className="font-medium text-sm">{n.event}</TableCell>
                      <TableCell className="text-center"><Switch checked={n.whatsapp} onCheckedChange={() => toggleNotif(i, "whatsapp")} data-testid={`notif-wa-${i}`} /></TableCell>
                      <TableCell className="text-center"><Switch checked={n.email} onCheckedChange={() => toggleNotif(i, "email")} data-testid={`notif-email-${i}`} /></TableCell>
                      <TableCell className="text-center"><Switch checked={n.inapp} onCheckedChange={() => toggleNotif(i, "inapp")} data-testid={`notif-inapp-${i}`} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Vertex DPU Integration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Watch Folder Path</Label><Input className="mt-1" defaultValue="C:\VertexExports\auto\" data-testid="input-vertex-path" /></div>
                <div><Label>Import Interval (minutes)</Label><Input className="mt-1" defaultValue="15" type="number" data-testid="input-vertex-interval" /></div>
              </div>
              <div className="bg-muted/50 rounded p-3 text-sm flex justify-between">
                <span className="text-muted-foreground">Last Import</span>
                <span className="font-medium">2026-07-03 06:15 AM — 87 records, 4,847 L</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">TallyPrime Integration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><Label>Server IP / Domain</Label><Input className="mt-1" defaultValue="tally.shriambaldairy.in" data-testid="input-tally-host" /></div>
                <div><Label>Port</Label><Input className="mt-1" defaultValue="9000" type="number" data-testid="input-tally-port" /></div>
                <div><Label>Tally Company</Label><Input className="mt-1" defaultValue="Shri Ambal Dairy" data-testid="input-tally-company" /></div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" data-testid="btn-test-connection" onClick={() => setTallyConnected(true)}>
                  <Wifi className="h-4 w-4 mr-2" />Test Connection
                </Button>
                {tallyConnected && (
                  <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />Connected — TallyPrime Silver 7.1
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">System Status</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Last Database Backup", value: "2026-07-03 02:00 AM (Auto)" },
                  { label: "Last Schema Migration", value: "2026-06-15 — v2.4.1" },
                  { label: "Active Users", value: "3 currently logged in" },
                  { label: "Database Size", value: "2.4 GB (of 50 GB limit)" },
                  { label: "ERP Version", value: "v2.4.1 (Build 20260703)" },
                  { label: "Last Config Change", value: "2026-07-02 by Ops Manager" },
                  { label: "Tally Sync Status", value: "Connected — Last sync 09:32 AM" },
                  { label: "Vertex Import Status", value: "Auto-import active — Last 06:15 AM" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between border rounded p-3">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

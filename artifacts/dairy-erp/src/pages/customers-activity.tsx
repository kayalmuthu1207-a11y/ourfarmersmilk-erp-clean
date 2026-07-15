import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { customers } from "@/data/mock";
import { ShoppingCart, FileText, DollarSign, Edit, CheckCircle, Upload } from "lucide-react";

const activities = [
  { id: 1, type: "delivery", title: "Delivery Completed", desc: "Dispatch #DSP-092 delivered 170 units.", time: "Today, 06:45 AM", icon: CheckCircle, color: "text-green-600 bg-green-100" },
  { id: 2, type: "order", title: "Order Placed", desc: "Order #ORD-2605 placed via Portal for tomorrow.", time: "Yesterday, 19:30 PM", icon: ShoppingCart, color: "text-blue-600 bg-blue-100" },
  { id: 3, type: "payment", title: "Payment Received", desc: "₹42,000 received via NEFT (Ref: HDFC0001234).", time: "12 Jun 2026, 11:20 AM", icon: DollarSign, color: "text-emerald-600 bg-emerald-100" },
  { id: 4, type: "invoice", title: "Invoice Generated", desc: "Invoice #INV-101 generated for ₹42,500 gross.", time: "10 Jun 2026, 18:00 PM", icon: FileText, color: "text-purple-600 bg-purple-100" },
  { id: 5, type: "edit", title: "Order Modified", desc: "Suresh V increased Milk qty from 150 to 160 on #ORD-2580.", time: "05 Jun 2026, 16:45 PM", icon: Edit, color: "text-amber-600 bg-amber-100" },
  { id: 6, type: "doc", title: "Document Uploaded", desc: "Contract_2026.pdf uploaded by Admin.", time: "15 Jan 2026, 10:00 AM", icon: Upload, color: "text-slate-600 bg-slate-100" },
];

export default function CustomerActivity() {
  const [selected, setSelected] = useState(customers[0].id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Activity Timeline <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 align-middle ml-1">Preview</Badge></h1>
        <p className="text-muted-foreground">Complete audit trail of customer interactions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-muted ml-4 space-y-8 pb-4">
                {activities.map((item, index) => (
                  <div key={item.id} className="relative pl-8">
                    <div className={`absolute -left-4 top-0 h-8 w-8 rounded-full flex items-center justify-center border-2 border-card ${item.color}`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
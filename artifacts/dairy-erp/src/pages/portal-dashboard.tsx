import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Clock, Package, FileText, AlertCircle, TrendingUp, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function PortalDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back, Prestige Towers</h1>
          <p className="text-muted-foreground">Here's what's happening with your account today.</p>
        </div>
        <Button asChild size="lg" className="shadow-md shrink-0">
          <Link href="/portal/place-order">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Place New Order
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Outstanding Balance */}
        <Card className="border-l-4 border-l-destructive shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight">₹18,450</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-destructive font-medium bg-destructive/10 p-2 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>Payment due in 4 days</span>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/portal/payments">Make Payment</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Today's Order */}
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Today's Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-lg">Order #ORD-1042</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Delivered
              </Badge>
            </div>
            <div className="space-y-1 mt-4 text-sm">
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">Pasteurized Milk 500ml</span>
                <span className="font-medium">120 Pouches</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">Curd 200g</span>
                <span className="font-medium">45 Cups</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-medium">Total Value</span>
                <span className="font-bold text-primary">₹4,035</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Cutoff */}
        <Card className="border-l-4 border-l-sidebar-accent shadow-sm bg-sidebar-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tomorrow's Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 space-y-3">
              <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-2">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg">Cutoff at 08:00 PM</h3>
              <p className="text-sm text-muted-foreground px-4">
                You have 4 hours left to place or modify your order for tomorrow's delivery.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Recent Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Oct {15 - i}, 2023</div>
                      <div className="text-xs text-muted-foreground">{120 - i*5} items delivered</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{(4035 - i*150).toLocaleString()}</div>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">View Invoice</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Monthly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="text-sm text-muted-foreground mb-1">Total Orders (Oct)</div>
                <div className="text-2xl font-bold">14</div>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="text-sm text-muted-foreground mb-1">Total Value</div>
                <div className="text-2xl font-bold text-primary">₹56,420</div>
              </div>
            </div>
            
            <div className="rounded-lg border p-4 flex items-center justify-between bg-card">
              <div>
                <h4 className="font-semibold">September Statement Available</h4>
                <p className="text-sm text-muted-foreground mt-1">Your consolidated billing statement for September is ready.</p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 gap-2">
                <FileText className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Truck } from "lucide-react";
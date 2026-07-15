import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Truck, Package, Users, Settings,
  Bell, Search, UserCircle, LogOut, ChevronDown,
  FileText, Activity, Milk, ShoppingCart, DollarSign, Database, Shield, Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type Role = "Owner" | "Administrator" | "Manager" | "Accountant" | "Delivery Manager" | "Collection Operator";

const ROLE_ACCESS: Record<Role, string[]> = {
  Owner: [],
  Administrator: ["Dashboard", "Customers", "Orders", "Administration"],
  Manager: ["Dashboard", "Procurement", "Production", "Inventory", "Orders", "Dispatch"],
  Accountant: ["Dashboard", "Procurement", "Farmer Settlement", "Billing & Payments"],
  "Delivery Manager": ["Dashboard", "Orders", "Dispatch"],
  "Collection Operator": ["Dashboard", "Procurement"],
};

const ROLE_COLORS: Record<Role, string> = {
  Owner: "bg-primary text-primary-foreground",
  Administrator: "bg-violet-600 text-white",
  Manager: "bg-blue-600 text-white",
  Accountant: "bg-emerald-600 text-white",
  "Delivery Manager": "bg-orange-600 text-white",
  "Collection Operator": "bg-teal-600 text-white",
};

const ROLE_DISPLAY: Record<Role, { initials: string; label: string; description: string }> = {
  Owner: { initials: "OW", label: "Owner", description: "Full access + financial approval" },
  Administrator: { initials: "AD", label: "Administrator", description: "System config, no approvals" },
  Manager: { initials: "MG", label: "Plant Manager", description: "Production & Dispatch" },
  Accountant: { initials: "AC", label: "Accountant", description: "Billing & Settlement" },
  "Delivery Manager": { initials: "DM", label: "Delivery Manager", description: "Dispatch only" },
  "Collection Operator": { initials: "CO", label: "Collection Operator", description: "Procurement & collection" },
};

const allNavGroups = [
  {
    label: "Dashboard",
    items: [
      { title: "Overview", url: "/", icon: LayoutDashboard },
    ]
  },
  {
    label: "Procurement",
    items: [
      { title: "Village Collection", url: "/procurement/village-collection", icon: Milk },
      { title: "Local Purchase", url: "/procurement/local-purchase", icon: ShoppingCart },
      { title: "Collection Reports", url: "/procurement/collection-reports", icon: FileText },
      { title: "Centers", url: "/procurement/centers", icon: LayoutDashboard },
      { title: "FAT/SNF", url: "/procurement/fat-snf", icon: Activity },
      { title: "Vertex History", url: "/procurement/vertex-history", icon: Database },
    ]
  },
  {
    label: "Farmer Settlement",
    items: [
      { title: "10-Day Settlement", url: "/farmer-settlement/10-day", icon: DollarSign },
      { title: "History", url: "/farmer-settlement/history", icon: Activity },
      { title: "Voucher", url: "/farmer-settlement/voucher", icon: FileText },
      { title: "Export", url: "/farmer-settlement/export", icon: FileText },
    ]
  },
  {
    label: "Production",
    items: [
      { title: "Batch Entry", url: "/production/entry", icon: Package },
      { title: "Planning", url: "/production/planning", icon: LayoutDashboard },
      { title: "History", url: "/production/history", icon: Activity },
    ]
  },
  {
    label: "Inventory",
    items: [
      { title: "Stock Dashboard", url: "/inventory/stock-dashboard", icon: LayoutDashboard },
      { title: "Adjustments", url: "/inventory/adjustments", icon: Settings },
    ]
  },
  {
    label: "Customers",
    items: [
      { title: "Customer Master", url: "/customers/master", icon: Users },
      { title: "Portal Users", url: "/customers/users", icon: UserCircle },
      { title: "Delivery Locations", url: "/customers/delivery-locations", icon: Truck },
      { title: "Product Mapping", url: "/customers/product-mapping", icon: Package },
      { title: "Pricing", url: "/customers/pricing", icon: DollarSign },
      { title: "Profile", url: "/customers/profile", icon: UserCircle },
      { title: "Documents", url: "/customers/documents", icon: FileText },
      { title: "Activity", url: "/customers/activity", icon: Activity },
      { title: "Credit", url: "/customers/credit", icon: DollarSign },
    ]
  },
  {
    label: "Orders",
    items: [
      { title: "Order Entry", url: "/portal/place-order", icon: ShoppingCart },
      { title: "VAP Queue", url: "/orders/vap-queue", icon: Activity },
      { title: "Same-Day Orders", url: "/orders/same-day", icon: ShoppingCart },
      { title: "Order History", url: "/orders/history", icon: FileText },
      { title: "Recurring Orders", url: "/orders/recurring", icon: Activity },
    ]
  },
  {
    label: "Dispatch",
    items: [
      { title: "Planning", url: "/dispatch/planning", icon: Truck },
      { title: "Route Planning", url: "/dispatch/route-planning", icon: Truck },
      { title: "Vehicles", url: "/dispatch/vehicles", icon: Truck },
      { title: "Partners", url: "/dispatch/partners", icon: Users },
      { title: "Confirmation", url: "/dispatch/confirmation", icon: Activity },
      { title: "Tracking", url: "/dispatch/tracking", icon: Activity },
      { title: "Shortage & Leakage", url: "/dispatch/adjustments", icon: Settings },
      { title: "Delivery Partner View", url: "/delivery", icon: Truck },
    ]
  },
  {
    label: "Billing & Payments",
    items: [
      { title: "Invoices", url: "/billing/invoices", icon: FileText },
      { title: "Statements", url: "/billing/statements", icon: FileText },
      { title: "Outstanding", url: "/billing/outstanding-dashboard", icon: DollarSign },
      { title: "Aging", url: "/billing/aging", icon: Activity },
      { title: "Credit Notes", url: "/billing/credit-notes", icon: FileText },
      { title: "Shortage Adjustments", url: "/billing/shortage-adjustments", icon: Settings },
      { title: "Payment Entry", url: "/payments/entry", icon: DollarSign },
      { title: "Payment History", url: "/payments/history", icon: Activity },
      { title: "Reconciliation", url: "/payments/reconciliation", icon: Settings },
      { title: "Salary Payments", url: "/payments/salary", icon: Banknote },
    ]
  },
  {
    label: "Tally Integration",
    items: [
      { title: "Sync Dashboard", url: "/tally/sync-dashboard", icon: Database },
      { title: "Voucher Queue", url: "/tally/voucher-queue", icon: Activity },
      { title: "Sync Logs", url: "/tally/sync-logs", icon: FileText },
      { title: "Failed", url: "/tally/failed", icon: Activity },
      { title: "Resync", url: "/tally/resync", icon: Settings },
    ]
  },
  {
    label: "Administration",
    items: [
      { title: "Product Master", url: "/admin/products", icon: Package },
      { title: "Users & Roles", url: "/admin/users", icon: Users },
      { title: "Audit Logs", url: "/admin/audit-logs", icon: Activity },
      { title: "Login Audit", url: "/admin/login-audit", icon: Shield },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ]
  }
];

export function ERPLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [role, setRole] = useState<Role>("Owner");
  const { user, logout } = useAuth();

  const handleLogout = () => {
    void logout();
  };

  const allowedGroups = ROLE_ACCESS[role];
  const navGroups = allowedGroups.length === 0
    ? allNavGroups
    : allNavGroups.filter((g) => allowedGroups.includes(g.label));

  const display = ROLE_DISPLAY[role];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-muted/30">
        <Sidebar className="border-r border-border bg-sidebar">
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2 text-sidebar-primary">
              <Milk className="h-6 w-6" />
              <span className="font-bold text-lg text-sidebar-foreground">DairyERP</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="custom-scrollbar">
            {role !== "Owner" && (
              <div className="mx-3 mt-3 mb-1 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
                <p className="text-xs text-amber-800 font-medium">Demo: Viewing as {role}</p>
                <p className="text-xs text-amber-600 mt-0.5">Nav filtered to role access</p>
              </div>
            )}
            {navGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/60">{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={location === item.url}>
                          <Link href={item.url} className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}

            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary">
                      <Link href="/portal" className="flex items-center gap-3">
                        <UserCircle className="h-4 w-4" />
                        <span>Customer Portal</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b bg-card">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1" />
              <div className="relative w-48 sm:w-64 hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search orders, farmers..."
                  className="w-full bg-muted pl-9 rounded-md h-9 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 h-8 text-xs hidden sm:flex" data-testid="btn-role-switcher">
                    <Shield className="h-3.5 w-3.5" />
                    <span className="font-medium">{role}</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                    Demo Role Switcher — changes nav access
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={role} onValueChange={(v) => setRole(v as Role)}>
                    {(["Owner", "Administrator", "Manager", "Accountant", "Delivery Manager", "Collection Operator"] as Role[]).map((r) => (
                      <DropdownMenuRadioItem key={r} value={r} data-testid={`role-${r}`}>
                        <div className="flex flex-col">
                          <span className="font-medium">{r}</span>
                          <span className="text-xs text-muted-foreground">{ROLE_DISPLAY[r].description}</span>
                        </div>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 h-9">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${ROLE_COLORS[role]}`}>
                      {display.initials}
                    </div>
                    <div className="flex flex-col items-start text-sm text-left hidden sm:flex">
                      <span className="font-medium leading-none">{display.label}</span>
                      <span className="text-xs text-muted-foreground mt-1">{role}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground ml-1 hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {user ? user.name : "My Account"}
                    {user && <p className="text-xs text-muted-foreground font-normal mt-0.5">{user.email}</p>}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserCircle className="mr-2 h-4 w-4" /><span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" /><span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:bg-destructive/10"
                    onClick={handleLogout}
                    data-testid="btn-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" /><span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-muted/30 p-4 sm:p-6 custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

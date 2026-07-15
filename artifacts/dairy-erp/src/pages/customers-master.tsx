import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Plus, Search, Users, MapPin, DollarSign, UserCircle, CheckCircle2, XCircle,
  AlertCircle, Package, CheckSquare, Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCustomers, type Customer } from "@/hooks/useCustomers";
import { useCustomerOutstandingBalances } from "@/hooks/useCustomerOutstandingBalances";
import { useCustomerReadiness, type ReadinessSets } from "@/hooks/useCustomerReadiness";

// Local, UI-only customer "type" categories used for badge coloring. The real `category`
// column is a free-text string, so this is just a display hint — not a source of truth.
const CUSTOMER_TYPES = ["Apartment", "Hotel", "Factory", "Office", "Retail", "Commercial"] as const;

const typeBadge: Record<string, string> = {
  Apartment: "bg-blue-50 text-blue-700 border-blue-200",
  Hotel: "bg-purple-50 text-purple-700 border-purple-200",
  Factory: "bg-slate-50 text-slate-700 border-slate-200",
  Office: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Retail: "bg-green-50 text-green-700 border-green-200",
  Commercial: "bg-orange-50 text-orange-700 border-orange-200",
};

const statusBadge: Record<Customer["status"], string> = {
  ACTIVE: "bg-green-100 text-green-800 border-green-200",
  INACTIVE: "bg-gray-100 text-gray-700 border-gray-200",
  PENDING_APPROVAL: "bg-amber-100 text-amber-800 border-amber-200",
};

const statusLabel: Record<Customer["status"], string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  PENDING_APPROVAL: "Pending Approval",
};

function billingCycleLabel(c: Customer): string {
  switch (c.billing_mode) {
    case "CYCLE":
      return c.billing_cycle_days ? `${c.billing_cycle_days}-Day Cycle` : "Cycle (days not set)";
    case "PAY_ON_DELIVERY":
      return "Pay on Delivery";
    case "DAILY":
      return "Daily";
    default:
      return "—";
  }
}

const emptyForm = {
  name: "", type: "Apartment" as string, address: "", phone: "", email: "", gstin: "",
  billingCycle: "10-day" as "10-day" | "30-day",
};

function readinessChecklist(customerId: number, sets: ReadinessSets) {
  const hasUser = sets.hasUser.has(customerId);
  const hasLocation = sets.hasLocation.has(customerId);
  const hasProduct = sets.hasProduct.has(customerId);
  const hasPrice = sets.hasPrice.has(customerId);
  return { hasUser, hasLocation, hasProduct, hasPrice };
}

function ReadinessIndicator({ customerId, readiness }: { customerId: number; readiness: ReadinessSets }) {
  const c = readinessChecklist(customerId, readiness);
  const checks = [
    { label: "Account Info", done: true },
    { label: "Customer User", done: c.hasUser },
    { label: "Delivery Location", done: c.hasLocation },
    { label: "Assigned Product", done: c.hasProduct },
    { label: "Active Price", done: c.hasPrice },
  ];
  const doneCount = checks.filter((ch) => ch.done).length;
  const allDone = doneCount === checks.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {allDone ? (
          <Badge className="bg-green-100 text-green-800 border-green-200 gap-1"><CheckCircle2 className="h-3 w-3" />Ready to activate</Badge>
        ) : (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1"><AlertCircle className="h-3 w-3" />{doneCount}/5 steps complete</Badge>
        )}
      </div>
      <div className="space-y-1.5">
        {checks.map((ch) => (
          <div key={ch.label} className="flex items-center gap-2 text-sm">
            {ch.done
              ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              : <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />}
            <span className={ch.done ? "text-foreground" : "text-muted-foreground"}>{ch.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CustomersMaster() {
  const { data: customers, isLoading, isError, error } = useCustomers();
  const { data: outstandingBalances } = useCustomerOutstandingBalances();
  const { data: readiness } = useCustomerReadiness();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [readinessId, setReadinessId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const approveMutation = useMutation({
    mutationFn: async (customerId: number) => {
      const { error } = await supabase.rpc("approve_customer", { p_customer_id: customerId });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: typeof form) => {
      const { error } = await supabase.rpc("create_customer", {
        p_customer_name: values.name,
        p_category: values.type.toUpperCase(),
        p_billing_mode: "CYCLE",
        p_billing_cycle_days: values.billingCycle === "10-day" ? 10 : 30,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setDialogOpen(false);
      setForm(emptyForm);
    },
  });

  const list = customers ?? [];
  const readinessSets: ReadinessSets = readiness ?? {
    hasUser: new Set(), hasLocation: new Set(), hasProduct: new Set(), hasPrice: new Set(),
  };

  const filtered = list.filter((c) => {
    const matchSearch = c.customer_name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || c.category === filterType;
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const stats = {
    total: list.length,
    active: list.filter((c) => c.status === "ACTIVE").length,
    pendingApproval: list.filter((c) => c.status === "PENDING_APPROVAL").length,
    withOutstanding: list.filter((c) => (outstandingBalances?.get(c.customer_id) ?? 0) > 0).length,
  };

  const handleAdd = () => {
    if (!form.name.trim()) return;
    createMutation.mutate(form);
  };

  const handleApprove = (customerId: number) => {
    approveMutation.mutate(customerId);
  };

  const readinessCustomer = readinessId ? list.find((c) => String(c.customer_id) === readinessId) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Master</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all customers, their users, locations, and pricing</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} data-testid="btn-add-customer">
          <Plus className="h-4 w-4 mr-2" />Add Customer
        </Button>
      </div>

      {approveMutation.isError && (
        <div className="rounded-lg border border-destructive/50 bg-red-50 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Failed to approve customer</p>
            <p className="text-xs text-red-700 mt-0.5">{(approveMutation.error as Error)?.message}</p>
          </div>
        </div>
      )}

      {stats.pendingApproval > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">{stats.pendingApproval} customer{stats.pendingApproval > 1 ? "s" : ""} awaiting Owner approval</p>
            <p className="text-xs text-amber-700 mt-0.5">Newly added customers are not active until approved by the Owner.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 pb-4"><p className="text-xs text-muted-foreground">Total Customers</p><p className="text-2xl font-bold mt-1">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold mt-1 text-green-600">{stats.active}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><p className="text-xs text-muted-foreground">Pending Approval</p><p className="text-2xl font-bold mt-1 text-amber-600">{stats.pendingApproval}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><p className="text-xs text-muted-foreground">With Outstanding</p><p className="text-2xl font-bold mt-1">{stats.withOutstanding}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by customer name..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-search" />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40" data-testid="select-type-filter"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {CUSTOMER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading customers…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load customers</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Users className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                {list.length === 0 ? "No customers yet." : "No customers match your filters."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Readiness</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  const customerIdStr = String(c.customer_id);
                  const checklist = readinessChecklist(c.customer_id, readinessSets);
                  const ready = Object.values(checklist).every(Boolean);
                  const outstanding = outstandingBalances?.get(c.customer_id) ?? 0;
                  return (
                    <TableRow key={c.customer_id}>
                      <TableCell className="font-medium">{c.customer_name}</TableCell>
                      <TableCell>
                        {c.category ? (
                          <Badge variant="outline" className={`text-xs ${typeBadge[c.category] ?? "bg-muted text-muted-foreground border-muted"}`}>{c.category}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{billingCycleLabel(c)}</TableCell>
                      <TableCell className="text-right">
                        <span className={outstanding > 0 ? "text-sm font-medium" : "text-xs text-muted-foreground"}>
                          ₹{outstanding.toLocaleString("en-IN")}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`text-xs ${statusBadge[c.status] ?? ""}`}>{statusLabel[c.status] ?? c.status}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost" size="sm" className="h-7 text-xs gap-1"
                          onClick={() => setReadinessId(customerIdStr)}
                        >
                          {ready
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            : <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
                          {ready ? "Ready" : "Incomplete"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {c.status === "PENDING_APPROVAL" && (
                            <Button
                              size="sm" variant="outline"
                              className="h-7 text-xs text-green-700 border-green-300 hover:bg-green-50 gap-1"
                              onClick={() => handleApprove(c.customer_id)}
                              disabled={approveMutation.isPending && approveMutation.variables === c.customer_id}
                              data-testid={`btn-approve-${c.customer_id}`}
                            >
                              {approveMutation.isPending && approveMutation.variables === c.customer_id
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <CheckSquare className="h-3 w-3" />}
                              Approve
                            </Button>
                          )}
                          <Link href="/customers/profile">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Profile" data-testid={`btn-profile-${c.customer_id}`}><UserCircle className="h-4 w-4" /></Button>
                          </Link>
                          <Link href="/customers/users">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Users" data-testid={`btn-users-${c.customer_id}`}><Users className="h-4 w-4" /></Button>
                          </Link>
                          <Link href="/customers/delivery-locations">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Delivery Locations" data-testid={`btn-locations-${c.customer_id}`}><MapPin className="h-4 w-4" /></Button>
                          </Link>
                          <Link href="/customers/product-mapping">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Product Mapping" data-testid={`btn-products-${c.customer_id}`}><Package className="h-4 w-4" /></Button>
                          </Link>
                          <Link href="/customers/pricing">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Pricing" data-testid={`btn-pricing-${c.customer_id}`}><DollarSign className="h-4 w-4" /></Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* TODO: this form has no billing mode selector yet — new customers are always
                created with billing_mode = CYCLE. PAY_ON_DELIVERY / DAILY customers cannot be
                created through this UI until a billing mode selector is added. */}
            <div className="space-y-1.5">
              <Label>Customer Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Tilaga Enterprises" data-testid="input-cust-name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Customer Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger data-testid="select-cust-type"><SelectValue /></SelectTrigger>
                  <SelectContent>{CUSTOMER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Billing Cycle</Label>
                <Select value={form.billingCycle} onValueChange={(v) => setForm((f) => ({ ...f, billingCycle: v as "10-day" | "30-day" }))}>
                  <SelectTrigger data-testid="select-billing-cycle"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10-day">10-Day</SelectItem>
                    <SelectItem value="30-day">30-Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Full address" data-testid="input-address" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} data-testid="input-phone" />
              </div>
              <div className="space-y-1.5">
                <Label>GSTIN</Label>
                <Input value={form.gstin} onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))} data-testid="input-gstin" />
              </div>
            </div>

            {createMutation.isError && (
              <div className="rounded-lg border border-destructive/50 bg-red-50 px-3 py-2 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{(createMutation.error as Error)?.message}</p>
              </div>
            )}

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-xs text-amber-800 font-medium flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                New customer will be saved as <strong>Pending Approval</strong>. An Owner must approve before the account becomes active.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={createMutation.isPending} data-testid="btn-save-customer">
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Customer (Pending Approval)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!readinessId} onOpenChange={() => setReadinessId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Setup Checklist — {readinessCustomer?.customer_name}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {readinessCustomer && <ReadinessIndicator customerId={readinessCustomer.customer_id} readiness={readinessSets} />}
          </div>
          <p className="text-xs text-muted-foreground px-0 pb-2">A customer must have all 5 components set up before they can be marked fully Active.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReadinessId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

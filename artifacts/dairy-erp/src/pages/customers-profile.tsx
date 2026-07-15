import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useCustomers } from "@/hooks/useCustomers";
import { useCustomerProfile, type CustomerProfile } from "@/hooks/useCustomerProfile";

const statusBadge: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 border-green-200",
  PENDING_APPROVAL: "bg-amber-100 text-amber-800 border-amber-200",
  INACTIVE: "bg-gray-100 text-gray-600 border-gray-300",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function CustomersProfile() {
  const { data: customers } = useCustomers();
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile, isLoading, isError, error } = useCustomerProfile(selectedId);

  // Form state — synced from profile when it loads
  const [form, setForm] = useState({
    customer_name: "",
    category: "",
    primary_contact_name: "",
    primary_contact_phone: "",
    secondary_contact_name: "",
    secondary_contact_phone: "",
    billing_mode: "CYCLE" as CustomerProfile["billing_mode"],
    billing_cycle_days: "" as string,
    order_cutoff_time: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        customer_name: profile.customer_name ?? "",
        category: profile.category ?? "",
        primary_contact_name: profile.primary_contact_name ?? "",
        primary_contact_phone: profile.primary_contact_phone ?? "",
        secondary_contact_name: profile.secondary_contact_name ?? "",
        secondary_contact_phone: profile.secondary_contact_phone ?? "",
        billing_mode: profile.billing_mode,
        billing_cycle_days: profile.billing_cycle_days != null ? String(profile.billing_cycle_days) : "",
        order_cutoff_time: profile.order_cutoff_time ?? "",
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        customer_name: form.customer_name.trim(),
        category: form.category.trim() || null,
        primary_contact_name: form.primary_contact_name.trim() || null,
        primary_contact_phone: form.primary_contact_phone.trim() || null,
        secondary_contact_name: form.secondary_contact_name.trim() || null,
        secondary_contact_phone: form.secondary_contact_phone.trim() || null,
        billing_mode: form.billing_mode,
        billing_cycle_days: form.billing_cycle_days ? Number(form.billing_cycle_days) : null,
        order_cutoff_time: form.order_cutoff_time.trim() || null,
      };
      const { error } = await supabase
        .from("customer_master")
        .update(payload)
        .eq("customer_id", selectedId!);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-profile", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Profile saved", description: "Customer profile has been updated." });
    },
    onError: (err: Error) => {
      toast({ title: "Could not save profile", description: err.message, variant: "destructive" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("approve_customer", { p_customer_id: selectedId! });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-profile", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Customer approved", description: "The customer account is now active." });
    },
    onError: (err: Error) => {
      toast({ title: "Could not approve customer", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Customer Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">View and edit a customer's account details.</p>
      </div>

      {/* Customer selector */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Label className="shrink-0 text-sm">Select Customer</Label>
            <Select
              value={selectedId !== undefined ? String(selectedId) : ""}
              onValueChange={(v) => setSelectedId(Number(v))}
            >
              <SelectTrigger className="w-full sm:w-80" data-testid="select-customer">
                <SelectValue placeholder="Choose a customer…" />
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
        </CardContent>
      </Card>

      {/* Loading / error / empty states */}
      {selectedId === undefined && (
        <p className="text-sm text-muted-foreground">Select a customer above to view their profile.</p>
      )}

      {selectedId !== undefined && isLoading && (
        <div className="flex items-center gap-2 py-16 text-muted-foreground justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading profile…</span>
        </div>
      )}

      {selectedId !== undefined && isError && (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <p className="text-sm font-semibold text-destructive">Failed to load profile</p>
          <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
        </div>
      )}

      {profile && (
        <>
          {/* Status + approve banner */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Badge
              variant="outline"
              className={`text-xs w-fit ${statusBadge[profile.status]}`}
            >
              {profile.status === "ACTIVE" && <CheckCircle2 className="h-3 w-3 mr-1" />}
              {profile.status}
            </Badge>
            {profile.status === "PENDING_APPROVAL" && (
              <Button
                size="sm"
                variant="outline"
                className="text-green-700 border-green-300 hover:bg-green-50 w-fit"
                disabled={approveMutation.isPending}
                onClick={() => approveMutation.mutate()}
                data-testid="btn-approve-customer"
              >
                {approveMutation.isPending && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
                Approve Customer
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editable fields */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base">Account Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    id="customer_name"
                    value={form.customer_name}
                    onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
                    data-testid="input-customer-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="e.g. Residential, Corporate"
                    data-testid="input-category"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="billing_mode">Billing Mode</Label>
                  <Select
                    value={form.billing_mode}
                    onValueChange={(v) => setForm((f) => ({ ...f, billing_mode: v as CustomerProfile["billing_mode"] }))}
                  >
                    <SelectTrigger id="billing_mode" data-testid="select-billing-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CYCLE">Cycle</SelectItem>
                      <SelectItem value="PAY_ON_DELIVERY">Pay on Delivery</SelectItem>
                      <SelectItem value="DAILY">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.billing_mode === "CYCLE" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="billing_cycle_days">Billing Cycle Days</Label>
                    <Input
                      id="billing_cycle_days"
                      type="number"
                      min={1}
                      value={form.billing_cycle_days}
                      onChange={(e) => setForm((f) => ({ ...f, billing_cycle_days: e.target.value }))}
                      placeholder="e.g. 10"
                      data-testid="input-billing-cycle-days"
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="order_cutoff_time">Order Cutoff Time</Label>
                  <Input
                    id="order_cutoff_time"
                    value={form.order_cutoff_time}
                    onChange={(e) => setForm((f) => ({ ...f, order_cutoff_time: e.target.value }))}
                    placeholder="e.g. 08:00:00"
                    data-testid="input-order-cutoff-time"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base">Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="primary_contact_name">Primary Contact Name</Label>
                    <Input
                      id="primary_contact_name"
                      value={form.primary_contact_name}
                      onChange={(e) => setForm((f) => ({ ...f, primary_contact_name: e.target.value }))}
                      data-testid="input-primary-contact-name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="primary_contact_phone">Primary Phone</Label>
                    <Input
                      id="primary_contact_phone"
                      value={form.primary_contact_phone}
                      onChange={(e) => setForm((f) => ({ ...f, primary_contact_phone: e.target.value }))}
                      data-testid="input-primary-contact-phone"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="secondary_contact_name">Secondary Contact Name</Label>
                    <Input
                      id="secondary_contact_name"
                      value={form.secondary_contact_name}
                      onChange={(e) => setForm((f) => ({ ...f, secondary_contact_name: e.target.value }))}
                      data-testid="input-secondary-contact-name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="secondary_contact_phone">Secondary Phone</Label>
                    <Input
                      id="secondary_contact_phone"
                      value={form.secondary_contact_phone}
                      onChange={(e) => setForm((f) => ({ ...f, secondary_contact_phone: e.target.value }))}
                      data-testid="input-secondary-contact-phone"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <Button
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              data-testid="btn-save-profile"
            >
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>

          {/* Read-only system fields */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base">System Fields</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Approved By</p>
                  <p className="font-medium">{profile.approved_by ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Approved At</p>
                  <p className="font-medium">{formatDate(profile.approved_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Last Cycle End</p>
                  <p className="font-medium">{profile.last_cycle_end_date ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Staff Managed</p>
                  <p className="font-medium">{profile.is_staff_managed ? "Yes" : "No"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

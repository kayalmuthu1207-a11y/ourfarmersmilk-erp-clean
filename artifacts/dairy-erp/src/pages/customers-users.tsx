import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserPlus, Clock, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useCustomers } from "@/hooks/useCustomers";
import { useCustomerUsers } from "@/hooks/useCustomerUsers";

const statusBadge: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 border-green-200",
  INACTIVE: "bg-gray-100 text-gray-600 border-gray-300",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
};

function formatLastLogin(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });
}

const emptyForm = { customerId: "", phoneNumber: "", fullName: "" };

export default function CustomersUsers() {
  const { data: users, isLoading, isError, error } = useCustomerUsers();
  const { data: customers } = useCustomers();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("create_customer_user", {
        p_customer_id: Number(form.customerId),
        p_phone_number: form.phoneNumber.trim(),
        p_full_name: form.fullName.trim() || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-users"] });
      toast({ title: "Portal user created", description: "The customer user record has been added." });
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: (err: Error) => {
      toast({ title: "Could not create user", description: err.message, variant: "destructive" });
    },
  });

  const list = users ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Portal Users</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage portal user records for each customer account.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} data-testid="btn-add-user">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Portal User
        </Button>
      </div>

      {/* Stats */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold mt-1">{list.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold mt-1">{list.filter((u) => u.status === "ACTIVE").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Customers with Users</p>
              <p className="text-2xl font-bold mt-1">{new Set(list.map((u) => u.customer_id)).size}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base">Portal Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading users…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load users</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      No portal users yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((u) => (
                    <TableRow key={u.customer_user_id}>
                      <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                        {u.customer_master?.customer_name ?? `Customer #${u.customer_id}`}
                      </TableCell>
                      <TableCell className="font-medium">{u.full_name ?? "—"}</TableCell>
                      <TableCell className="text-sm">{u.phone_number}</TableCell>
                      <TableCell className="text-sm">{u.role ?? "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusBadge[u.status] ?? ""}`}
                        >
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatLastLogin(u.last_login_at)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Note: these accounts cannot log in yet — phone-OTP authentication is not live. This page manages the user records ahead of that going live.
      </p>

      {/* Add Portal User dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setForm(emptyForm); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Portal User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Customer</Label>
              <Select value={form.customerId} onValueChange={(v) => setForm((f) => ({ ...f, customerId: v }))}>
                <SelectTrigger data-testid="select-user-customer">
                  <SelectValue placeholder="Select a customer" />
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
            <div className="space-y-1.5">
              <Label>Phone Number</Label>
              <Input
                value={form.phoneNumber}
                onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                placeholder="+91 98765 43210"
                data-testid="input-user-phone"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Full Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                placeholder="Customer's full name"
                data-testid="input-user-fullname"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              disabled={!form.customerId || !form.phoneNumber.trim() || addMutation.isPending}
              onClick={() => addMutation.mutate()}
              data-testid="btn-save-user"
            >
              {addMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

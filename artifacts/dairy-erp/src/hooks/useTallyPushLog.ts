import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type TallyPushStatus = "AWAITING_APPROVAL" | "PENDING" | "SUCCESS" | "FAILED";

export interface TallyPushLogRow {
  push_log_id: number;
  entry_type: string;
  tally_voucher_type: string;
  voucher_mode: string;
  approval_required: boolean;
  push_status: TallyPushStatus;
  tally_response: string | null;
  pushed_at: string | null;
  created_at: string;
  updated_at: string;
  original_push_id: number | null;
  order_id: number | null;
  dispatch_id: number | null;
  purchase_id: number | null;
  sale_id: number | null;
  invoice_id: number | null;
  statement_id: number | null;
  payment_id: number | null;
  consolidation_id: number | null;
  village_payment_id: number | null;
  salary_payment_id: number | null;
  local_purchase_entry: {
    purchase_amount: number;
    purchase_date: string;
    vendor_master: { vendor_name: string } | null;
    product_master: { product_name: string } | null;
  } | null;
  counter_sale: {
    sale_amount: number;
    sale_date: string;
    product_master: { product_name: string } | null;
  } | null;
  customer_payment: {
    payment_amount: number;
    payment_date: string;
    payment_method: string | null;
    customer_master: { customer_name: string } | null;
  } | null;
  salary_payment: {
    amount: number;
    pay_period_month: number;
    pay_period_year: number;
    users: { full_name: string } | null;
  } | null;
  billing_cycle_statement: {
    total_amount: number;
    cycle_start_date: string;
    cycle_end_date: string;
    customer_master: { customer_name: string } | null;
  } | null;
  village_procurement_consolidation: {
    total_quantity: number;
    procurement_date: string;
    village_master: { village_name: string } | null;
  } | null;
}

const SELECT_COLUMNS = `
  push_log_id, entry_type, tally_voucher_type, voucher_mode, approval_required, push_status,
  tally_response, pushed_at, created_at, updated_at, original_push_id,
  order_id, dispatch_id, purchase_id, sale_id, invoice_id, statement_id, payment_id,
  consolidation_id, village_payment_id, salary_payment_id,
  local_purchase_entry(purchase_amount, purchase_date, vendor_master(vendor_name), product_master(product_name)),
  counter_sale(sale_amount, sale_date, product_master(product_name)),
  customer_payment(payment_amount, payment_date, payment_method, customer_master(customer_name)),
  salary_payment(amount, pay_period_month, pay_period_year, users(full_name)),
  billing_cycle_statement(total_amount, cycle_start_date, cycle_end_date, customer_master(customer_name)),
  village_procurement_consolidation(total_quantity, procurement_date, village_master(village_name))
`;

/**
 * Fetches tally_push_log rows, optionally restricted to a set of statuses.
 * All Tally pages share this one hook/query-key family so react-query can
 * dedupe/cache instead of every page re-fetching independently.
 */
export function useTallyPushLog(statusFilter?: TallyPushStatus[]) {
  return useQuery({
    queryKey: ["tally-push-log", statusFilter ? [...statusFilter].sort() : "all"],
    queryFn: async (): Promise<TallyPushLogRow[]> => {
      let query = supabase
        .from("tally_push_log")
        .select(SELECT_COLUMNS)
        .order("created_at", { ascending: false });
      if (statusFilter && statusFilter.length > 0) {
        query = query.in("push_status", statusFilter);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as unknown as TallyPushLogRow[];
    },
  });
}

const ENTRY_TYPE_LABELS: Record<string, string> = {
  LOCAL_PURCHASE: "Local Purchase",
  COUNTER_SALE: "Counter Sale",
  CUSTOMER_RECEIPT: "Customer Receipt",
  SALARY_PAYMENT: "Salary Payment",
  CYCLE_BILLING_STATEMENT: "Cycle Billing Statement",
  VILLAGE_PROCUREMENT: "Village Procurement",
};

export interface TallyPushDescription {
  /** Human label for the entry type, e.g. "Local Purchase" */
  label: string;
  /** Party / counterparty name where applicable, e.g. vendor or customer name */
  party: string | null;
  /** Short free-text description of what this row represents */
  detail: string;
  /** Monetary amount in ₹, or null if this entry type has no currency amount (e.g. village procurement is a quantity) */
  amount: number | null;
  /** Non-currency quantity, used when amount is null (e.g. litres collected) */
  quantity: { value: number; unit: string } | null;
}

/**
 * Resolves a tally_push_log row (with its embedded source-table joins) into
 * a human-readable description. Reversal rows reuse the original entry_type
 * but have no embedded source row of their own (they only reference
 * original_push_id) — those are labeled distinctly.
 */
export function describeTallyPush(row: TallyPushLogRow): TallyPushDescription {
  const baseLabel = ENTRY_TYPE_LABELS[row.entry_type] ?? row.entry_type;
  const label = row.voucher_mode === "REVERSAL" ? `${baseLabel} (Reversal)` : baseLabel;

  if (row.voucher_mode === "REVERSAL") {
    return {
      label,
      party: null,
      detail: row.original_push_id ? `Reversal of push #${row.original_push_id}` : "Reversal entry",
      amount: null,
      quantity: null,
    };
  }

  switch (row.entry_type) {
    case "LOCAL_PURCHASE":
      return {
        label,
        party: row.local_purchase_entry?.vendor_master?.vendor_name ?? null,
        detail: row.local_purchase_entry?.product_master?.product_name ?? "—",
        amount: row.local_purchase_entry?.purchase_amount ?? null,
        quantity: null,
      };
    case "COUNTER_SALE":
      return {
        label,
        party: null,
        detail: row.counter_sale?.product_master?.product_name ?? "—",
        amount: row.counter_sale?.sale_amount ?? null,
        quantity: null,
      };
    case "CUSTOMER_RECEIPT":
      return {
        label,
        party: row.customer_payment?.customer_master?.customer_name ?? null,
        detail: row.customer_payment?.payment_method ?? "—",
        amount: row.customer_payment?.payment_amount ?? null,
        quantity: null,
      };
    case "SALARY_PAYMENT":
      return {
        label,
        party: row.salary_payment?.users?.full_name ?? null,
        detail: row.salary_payment
          ? `${row.salary_payment.pay_period_month}/${row.salary_payment.pay_period_year}`
          : "—",
        amount: row.salary_payment?.amount ?? null,
        quantity: null,
      };
    case "CYCLE_BILLING_STATEMENT":
      return {
        label,
        party: row.billing_cycle_statement?.customer_master?.customer_name ?? null,
        detail: row.billing_cycle_statement
          ? `${row.billing_cycle_statement.cycle_start_date} → ${row.billing_cycle_statement.cycle_end_date}`
          : "—",
        amount: row.billing_cycle_statement?.total_amount ?? null,
        quantity: null,
      };
    case "VILLAGE_PROCUREMENT":
      return {
        label,
        party: row.village_procurement_consolidation?.village_master?.village_name ?? null,
        detail: row.village_procurement_consolidation?.procurement_date ?? "—",
        amount: null,
        quantity: row.village_procurement_consolidation
          ? { value: row.village_procurement_consolidation.total_quantity, unit: "L" }
          : null,
      };
    default:
      return { label, party: null, detail: "—", amount: null, quantity: null };
  }
}

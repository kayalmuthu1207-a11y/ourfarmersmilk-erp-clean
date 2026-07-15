import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, HelpCircle, Info } from "lucide-react";

interface NoteItem {
  name: string;
  note: string;
}

function PhaseSection({
  phase,
  title,
  badgeClass,
  icon: Icon,
  items,
}: {
  phase: string;
  title: string;
  badgeClass: string;
  icon: any;
  items: NoteItem[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Badge className={badgeClass}>{phase}</Badge>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {items.map((item) => (
          <div key={item.name} className="flex items-start gap-3 text-sm">
            <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{item.note}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function DemoNotes() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Demo Notes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Honest, phase-by-phase status of every module — what's fully operational on real data today, and what's
          intentionally planned but not yet built.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-900">
          Pages marked "Preview" in the app itself carry the same disclosure inline — this page is a single
          consolidated summary for review purposes.
        </p>
      </div>

      <PhaseSection
        phase="Phase 1 — Delivered"
        title="Core ERP operations (real data, fully wired)"
        badgeClass="bg-green-100 text-green-800 border-green-200"
        icon={CheckCircle2}
        items={[
          { name: "Procurement", note: "Village milk collection, local purchases, collection centers, consolidation — reconciled real data." },
          { name: "Orders & Dispatch", note: "Order entry, dispatch planning, route planning with real customer/location expansion, dispatch tracking derived from actual dispatched-vs-ordered quantities." },
          { name: "Billing & Payments", note: "Cycle/daily/pay-on-delivery billing, statements, invoices, outstanding balances. Outstanding balance is a proper database view: statements + unbilled invoices − payments − unconsumed credits." },
          { name: "Inventory", note: "Stock balances and movement ledger — verified to reconcile to zero discrepancy across all products." },
          { name: "Production", note: "Production entry and batch tracking on real data." },
          { name: "Customer Management", note: "Customer master, delivery locations, product mapping, pricing, portal users." },
          { name: "Payroll", note: "Staff salary payment recording." },
          { name: "Bank Reconciliation", note: "Real upload → propose-matches → confirm/reject RPC workflow. The file-parsing step for new statement uploads isn't built yet (needs a storage bucket decision) — matching against existing transaction data works end-to-end." },
        ]}
      />

      <PhaseSection
        phase="Phase 2 — In Progress"
        title="Tally Integration"
        badgeClass="bg-amber-100 text-amber-800 border-amber-200"
        icon={Clock}
        items={[
          {
            name: "Queue-based architecture",
            note: "A real push queue (tally_push_log) with a 4-state machine — AWAITING_APPROVAL, PENDING, SUCCESS, FAILED — backed by real RPCs for approval, retry, and reversal. Voucher Queue, Sync Dashboard, Sync Logs, Failed, and Resync pages all run on this real data.",
          },
          {
            name: "No live Tally connection yet",
            note: "Nothing currently pushes to an actual Tally instance — that requires a bridge agent (local application polling Supabase and talking to Tally's XML API), which is architecturally planned but not yet built or connected. The Sync Dashboard states this plainly rather than faking a \"Connected\" status.",
          },
        ]}
      />

      <PhaseSection
        phase="Phase 3 — Planned / Pending"
        title="Features blocked on external access or new schema"
        badgeClass="bg-slate-100 text-slate-700 border-slate-200"
        icon={HelpCircle}
        items={[
          { name: "Vertex Integration", note: "Pending external system access from the client. Not implemented — no mock or fake integration exists." },
          { name: "Farmer Settlement Automation", note: "Depends on future FAT/SNF data imports; FAT/SNF calculation currently happens in a separate existing system outside this ERP. Settlement pages are labeled Preview." },
          { name: "Recurring Orders", note: "No recurring-order table in the schema yet — page is a labeled preview of the intended workflow." },
          { name: "Production Planning (persisted)", note: "No production-plan table yet — the page is a working what-if worksheet; only \"Milk Available\" pulls real data." },
          { name: "Delivery Partner / Vehicle Management", note: "No driver, partner, or vehicle tables exist — both pages and the delivery-partner mobile view are labeled previews." },
          { name: "Credit Notes", note: "No dedicated credit-note table — real credit/deduction handling currently goes through the Shortage & Leakage (delivery adjustment) workflow instead." },
          { name: "Audit Trail", note: "The audit_log table and page are real and correctly wired, but no trigger or RPC anywhere writes to it yet, so it's genuinely empty rather than showing fake history." },
          { name: "Customer Self-Service Ordering", note: "The customer portal's own \"Place Order\" link currently opens the internal staff order-entry tool (by design, temporarily) rather than a dedicated self-service flow — noted here as a known gap, not hidden." },
          { name: "Customer Document Storage", note: "No document/file table or storage bucket configured — the Documents page is a labeled preview of the intended workflow." },
        ]}
      />
    </div>
  );
}

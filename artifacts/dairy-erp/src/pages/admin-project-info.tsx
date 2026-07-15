import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, Globe, Tag, Calendar, Layers, CheckCircle2 } from "lucide-react";

const PROJECT_INFO = {
  deploymentUrl: "https://dairy-erp-v-2--tbdbrave.replit.app",
  githubUrl: "https://github.com/kayalmuthu1207-a11y/ourfarmersmilk-erp-clean",
  customDomain: null as string | null, // none configured — using the default Replit subdomain
  version: "v1.0 (Demo Build)",
  lastUpdated: "July 15, 2026",
};

const MODULES_IMPLEMENTED = [
  { name: "Procurement", detail: "Village milk collection, local purchases, collection centers, consolidation" },
  { name: "Orders", detail: "Order entry, order history, VAP confirmation queue" },
  { name: "Dispatch", detail: "Dispatch planning, route planning with customer/location expansion, tracking, shortage & leakage" },
  { name: "Billing & Payments", detail: "Cycle/daily/pay-on-delivery billing, statements, invoices, outstanding & aging, payment recording" },
  { name: "Inventory", detail: "Stock balances, movement ledger, stock adjustments — reconciled against production and dispatch" },
  { name: "Production", detail: "Production entry, batch tracking, wastage" },
  { name: "Customer Management", detail: "Customer master, delivery locations, product mapping, pricing, portal users" },
  { name: "Payroll", detail: "Staff salary payments" },
  { name: "Bank Reconciliation", detail: "Bank statement transactions, proposed/confirmed payment matching" },
  { name: "Tally Integration (Queue)", detail: "Push queue, approval workflow, sync status, retry & failure handling — see Demo Notes for phase details" },
];

function InfoRow({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <div className="text-sm font-medium mt-0.5 break-all">{children}</div>
      </div>
    </div>
  );
}

export default function ProjectInformation() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Project Information</h1>
        <p className="text-muted-foreground text-sm mt-1">Live links, version, and module status for this deployment</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Deployment</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <InfoRow icon={Globe} label="Live Application URL">
            <a href={PROJECT_INFO.deploymentUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
              {PROJECT_INFO.deploymentUrl}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </InfoRow>
          <InfoRow icon={Github} label="GitHub Repository">
            <a href={PROJECT_INFO.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
              {PROJECT_INFO.githubUrl}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </InfoRow>
          <InfoRow icon={Globe} label="Custom Domain">
            {PROJECT_INFO.customDomain ?? (
              <span className="text-muted-foreground font-normal">Not configured — running on the default Replit subdomain above</span>
            )}
          </InfoRow>
          <InfoRow icon={Tag} label="Project Version">
            <Badge variant="secondary">{PROJECT_INFO.version}</Badge>
          </InfoRow>
          <InfoRow icon={Calendar} label="Last Updated">
            {PROJECT_INFO.lastUpdated}
          </InfoRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Modules Implemented
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {MODULES_IMPLEMENTED.map((m) => (
            <div key={m.name} className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/60">
        <CardContent className="p-4 text-sm text-blue-800">
          For a phase-by-phase breakdown of what's fully implemented vs. planned (Tally Phase 2, Vertex, farmer
          settlement, and other preview-only pages), see the <span className="font-medium">Demo Notes</span> page.
        </CardContent>
      </Card>
    </div>
  );
}

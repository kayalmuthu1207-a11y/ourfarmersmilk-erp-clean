import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ERPLayout } from "@/components/layout/ERPLayout";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { DeliveryLayout } from "@/components/layout/DeliveryLayout";

import Dashboard from "@/pages/dashboard";

import ProcurementVillageCollection from "@/pages/procurement-village-collection";
import ProcurementLocalPurchase from "@/pages/procurement-local-purchase";
import ProcurementCollectionReports from "@/pages/procurement-collection-reports";
import ProcurementCenters from "@/pages/procurement-centers";
import ProcurementFatSnf from "@/pages/procurement-fat-snf";
import ProcurementVertexHistory from "@/pages/procurement-vertex-history";

import FarmerSettlement10Day from "@/pages/farmer-settlement-10day";
import FarmerSettlementHistory from "@/pages/farmer-settlement-history";
import FarmerSettlementVoucher from "@/pages/farmer-settlement-voucher";
import FarmerSettlementExport from "@/pages/farmer-settlement-export";

import ProductionEntry from "@/pages/production-entry";
import ProductionHistory from "@/pages/production-history";
import ProductionPlanning from "@/pages/production-planning";
import ProductionBatchTracking from "@/pages/production-batch-tracking";
import ProductionWastage from "@/pages/production-wastage";
import { supabase } from "./lib/supabase";


import InventoryStockDashboard from "@/pages/inventory-stock-dashboard";
import InventoryAdjustments from "@/pages/inventory-adjustments";
import InventoryMovement from "@/pages/inventory-movement";

import CustomersMaster from "@/pages/customers-master";
import CustomersUsers from "@/pages/customers-users";
import CustomersDeliveryLocations from "@/pages/customers-delivery-locations";
import CustomersPricing from "@/pages/customers-pricing";
import CustomersProfile from "@/pages/customers-profile";
import CustomersDocuments from "@/pages/customers-documents";
import CustomersActivity from "@/pages/customers-activity";
import CustomersCredit from "@/pages/customers-credit";

import OrderEntry from "@/pages/order-entry";
import OrdersHistory from "@/pages/orders-history";
import OrdersRecurring from "@/pages/orders-recurring";
import OrdersChangeHistory from "@/pages/orders-change-history";
import OrdersVapQueue from "@/pages/orders-vap-queue";

import DispatchPlanning from "@/pages/dispatch-planning";
import DispatchRoutePlanning from "@/pages/dispatch-route-planning";
import DispatchVehicles from "@/pages/dispatch-vehicles";
import DispatchPartners from "@/pages/dispatch-partners";
import DispatchConfirmation from "@/pages/dispatch-confirmation";
import DispatchTracking from "@/pages/dispatch-tracking";
import DispatchAdjustments from "@/pages/dispatch-adjustments";

import BillingInvoices from "@/pages/billing-invoices";
import CustomerStatements from "@/pages/customer-statements";
import BillingOutstanding from "@/pages/billing-outstanding";
import BillingOutstandingDashboard from "@/pages/billing-outstanding-dashboard";
import BillingAging from "@/pages/billing-aging";
import BillingCreditNotes from "@/pages/billing-credit-notes";
import BillingShortageAdjustments from "@/pages/billing-shortage-adjustments";

import PaymentsEntry from "@/pages/payments-entry";
import PaymentsHistory from "@/pages/payments-history";
import PaymentsReconciliation from "@/pages/payments-reconciliation";
import SalaryPayments from "@/pages/salary-payments";

import TallySyncDashboard from "@/pages/tally-sync-dashboard";
import TallyVoucherQueue from "@/pages/tally-voucher-queue";
import TallySyncLogs from "@/pages/tally-sync-logs";
import TallyFailed from "@/pages/tally-failed";
import TallyResync from "@/pages/tally-resync";

import AdminUsers from "@/pages/admin-users";
import AdminRoles from "@/pages/admin-roles";
import AdminAuditLogs from "@/pages/admin-audit-logs";
import AdminLoginAudit from "@/pages/admin-login-audit";
import AdminSystemConfig from "@/pages/admin-system-config";
import AdminProducts from "@/pages/admin-products";

import PortalDashboard from "@/pages/portal-dashboard";
import PortalMilkOrders from "@/pages/portal-milk-orders";
import PortalVapOrders from "@/pages/portal-vap-orders";
import PortalPlaceOrder from "@/pages/portal-place-order";
import PortalOrders from "@/pages/portal-orders";
import PortalInvoices from "@/pages/portal-invoices";
import PortalPayments from "@/pages/portal-payments";
import PortalOutstanding from "@/pages/portal-outstanding";
import PortalStatements from "@/pages/portal-statements";
import PortalCatalogue from "@/pages/portal-catalogue";
import PortalDeliveryLocations from "@/pages/portal-delivery-locations";

import DeliveryPartner from "@/pages/delivery-partner";
import DeliveryReports from "@/pages/delivery-reports";
import DeliveryProfile from "@/pages/delivery-profile";
import OrdersSameDay from "@/pages/orders-same-day";
import CustomersProductMapping from "@/pages/customers-product-mapping";

const queryClient = new QueryClient();

function ERP({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <ERPLayout>{children}</ERPLayout>
    </ProtectedRoute>
  );
}
function Portal({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <PortalLayout>{children}</PortalLayout>
    </ProtectedRoute>
  );
}
function Delivery({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DeliveryLayout>{children}</DeliveryLayout>
    </ProtectedRoute>
  );
}




function Router() {
  return (
    <Switch>
      <Route path="/login"><Login /></Route>

      <Route path="/"><ERP><Dashboard /></ERP></Route>

      <Route path="/procurement/village-collection"><ERP><ProcurementVillageCollection /></ERP></Route>
      <Route path="/procurement/local-purchase"><ERP><ProcurementLocalPurchase /></ERP></Route>
      <Route path="/procurement/collection-reports"><ERP><ProcurementCollectionReports /></ERP></Route>
      <Route path="/procurement/centers"><ERP><ProcurementCenters /></ERP></Route>
      <Route path="/procurement/fat-snf"><ERP><ProcurementFatSnf /></ERP></Route>
      <Route path="/procurement/vertex-history"><ERP><ProcurementVertexHistory /></ERP></Route>

      <Route path="/farmer-settlement/10-day"><ERP><FarmerSettlement10Day /></ERP></Route>
      <Route path="/farmer-settlement/history"><ERP><FarmerSettlementHistory /></ERP></Route>
      <Route path="/farmer-settlement/voucher"><ERP><FarmerSettlementVoucher /></ERP></Route>
      <Route path="/farmer-settlement/export"><ERP><FarmerSettlementExport /></ERP></Route>

      <Route path="/production/entry"><ERP><ProductionEntry /></ERP></Route>
      <Route path="/production/history"><ERP><ProductionHistory /></ERP></Route>
      <Route path="/production/planning"><ERP><ProductionPlanning /></ERP></Route>
      <Route path="/production/batch-tracking"><ERP><ProductionBatchTracking /></ERP></Route>
      <Route path="/production/wastage"><ERP><ProductionWastage /></ERP></Route>

      <Route path="/inventory/stock-dashboard"><ERP><InventoryStockDashboard /></ERP></Route>
      <Route path="/inventory/adjustments"><ERP><InventoryAdjustments /></ERP></Route>
      <Route path="/inventory/movement"><ERP><InventoryMovement /></ERP></Route>

      <Route path="/customers/master"><ERP><CustomersMaster /></ERP></Route>
      <Route path="/customers/users"><ERP><CustomersUsers /></ERP></Route>
      <Route path="/customers/delivery-locations"><ERP><CustomersDeliveryLocations /></ERP></Route>
      <Route path="/customers/pricing"><ERP><CustomersPricing /></ERP></Route>
      <Route path="/customers/product-mapping"><ERP><CustomersProductMapping /></ERP></Route>
      <Route path="/customers/profile"><ERP><CustomersProfile /></ERP></Route>
      <Route path="/customers/documents"><ERP><CustomersDocuments /></ERP></Route>
      <Route path="/customers/activity"><ERP><CustomersActivity /></ERP></Route>
      <Route path="/customers/credit"><ERP><CustomersCredit /></ERP></Route>

      <Route path="/orders/entry"><ERP><OrderEntry /></ERP></Route>
      <Route path="/orders/vap-queue"><ERP><OrdersVapQueue /></ERP></Route>
      <Route path="/orders/history"><ERP><OrdersHistory /></ERP></Route>
      <Route path="/orders/recurring"><ERP><OrdersRecurring /></ERP></Route>
      <Route path="/orders/change-history"><ERP><OrdersChangeHistory /></ERP></Route>
      <Route path="/orders/same-day"><ERP><OrdersSameDay /></ERP></Route>

      <Route path="/dispatch/planning"><ERP><DispatchPlanning /></ERP></Route>
      <Route path="/dispatch/route-planning"><ERP><DispatchRoutePlanning /></ERP></Route>
      <Route path="/dispatch/vehicles"><ERP><DispatchVehicles /></ERP></Route>
      <Route path="/dispatch/partners"><ERP><DispatchPartners /></ERP></Route>
      <Route path="/dispatch/confirmation"><ERP><DispatchConfirmation /></ERP></Route>
      <Route path="/dispatch/tracking"><ERP><DispatchTracking /></ERP></Route>
      <Route path="/dispatch/adjustments"><ERP><DispatchAdjustments /></ERP></Route>

      <Route path="/billing/invoices"><ERP><BillingInvoices /></ERP></Route>
      <Route path="/billing/statements"><ERP><CustomerStatements /></ERP></Route>
      <Route path="/billing/outstanding"><ERP><BillingOutstanding /></ERP></Route>
      <Route path="/billing/outstanding-dashboard"><ERP><BillingOutstandingDashboard /></ERP></Route>
      <Route path="/billing/aging"><ERP><BillingAging /></ERP></Route>
      <Route path="/billing/credit-notes"><ERP><BillingCreditNotes /></ERP></Route>
      <Route path="/billing/shortage-adjustments"><ERP><BillingShortageAdjustments /></ERP></Route>

      <Route path="/payments/entry"><ERP><PaymentsEntry /></ERP></Route>
      <Route path="/payments/history"><ERP><PaymentsHistory /></ERP></Route>
      <Route path="/payments/reconciliation"><ERP><PaymentsReconciliation /></ERP></Route>
      <Route path="/payments/salary"><ERP><SalaryPayments /></ERP></Route>

      <Route path="/tally/sync-dashboard"><ERP><TallySyncDashboard /></ERP></Route>
      <Route path="/tally/voucher-queue"><ERP><TallyVoucherQueue /></ERP></Route>
      <Route path="/tally/sync-logs"><ERP><TallySyncLogs /></ERP></Route>
      <Route path="/tally/failed"><ERP><TallyFailed /></ERP></Route>
      <Route path="/tally/resync"><ERP><TallyResync /></ERP></Route>

      <Route path="/admin/products"><ERP><AdminProducts /></ERP></Route>
      <Route path="/admin/users"><ERP><AdminUsers /></ERP></Route>
      <Route path="/admin/roles"><ERP><AdminRoles /></ERP></Route>
      <Route path="/admin/audit-logs"><ERP><AdminAuditLogs /></ERP></Route>
      <Route path="/admin/login-audit"><ERP><AdminLoginAudit /></ERP></Route>
      <Route path="/admin/settings"><ERP><AdminSystemConfig /></ERP></Route>

      <Route path="/portal"><Portal><PortalDashboard /></Portal></Route>
      <Route path="/portal/milk-orders"><Portal><PortalMilkOrders /></Portal></Route>
      <Route path="/portal/vap-orders"><Portal><PortalVapOrders /></Portal></Route>
      <Route path="/portal/place-order"><Portal><PortalPlaceOrder /></Portal></Route>
      <Route path="/portal/orders"><Portal><PortalOrders /></Portal></Route>
      <Route path="/portal/invoices"><Portal><PortalInvoices /></Portal></Route>
      <Route path="/portal/payments"><Portal><PortalPayments /></Portal></Route>
      <Route path="/portal/outstanding"><Portal><PortalOutstanding /></Portal></Route>
      <Route path="/portal/statements"><Portal><PortalStatements /></Portal></Route>
      <Route path="/portal/catalogue"><Portal><PortalCatalogue /></Portal></Route>
      <Route path="/portal/delivery-locations"><Portal><PortalDeliveryLocations /></Portal></Route>

      <Route path="/delivery"><Delivery><DeliveryPartner /></Delivery></Route>
      <Route path="/delivery/reports"><Delivery><DeliveryReports /></Delivery></Route>
      <Route path="/delivery/profile"><Delivery><DeliveryProfile /></Delivery></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}


export default App;

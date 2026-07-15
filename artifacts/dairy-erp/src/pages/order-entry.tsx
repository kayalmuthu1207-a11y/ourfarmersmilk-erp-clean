import PortalPlaceOrder from "@/pages/portal-place-order";

// Staff "Order Entry" now renders the same order-placing form directly inside
// the staff ERP layout, instead of redirecting into /portal/place-order (which
// is wrapped in the customer-branded Portal layout with no way back to the
// ERP). The underlying form itself is unchanged — only where it's rendered.
export default function OrderEntry() {
  return <PortalPlaceOrder />;
}

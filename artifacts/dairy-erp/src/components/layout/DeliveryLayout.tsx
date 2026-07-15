import { Link, useLocation } from "wouter";
import { MapPin, ClipboardList, User, Milk, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const bottomNav = [
  { title: "My Route", url: "/delivery", icon: MapPin },
  { title: "Reports", url: "/delivery/reports", icon: ClipboardList },
  { title: "Profile", url: "/delivery/profile", icon: User },
];

export function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col" style={{ maxWidth: 480, margin: "0 auto" }}>
      <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Milk className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none text-foreground">Shri Ambal Dairy</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Delivery Partner App</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5" data-testid="link-back-to-erp">
              <ArrowLeft className="h-4 w-4" />
              Back to ERP
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t" style={{ maxWidth: 480, margin: "0 auto" }}>
        <div className="flex">
          {bottomNav.map((item) => {
            const active = location === item.url;
            return (
              <Link key={item.title} href={item.url} className="flex-1">
                <div className={`flex flex-col items-center gap-0.5 py-2.5 ${active ? "text-primary" : "text-muted-foreground"}`}>
                  <item.icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
                  <span className="text-[11px] font-medium">{item.title}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

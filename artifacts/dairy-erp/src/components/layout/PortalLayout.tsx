import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, ShoppingCart, FileText, DollarSign, Activity,
  Milk, LogOut, ChevronDown, UserCircle, Layers, MapPin, MoreHorizontal, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const primaryNav = [
  { title: "Home", url: "/portal", icon: LayoutDashboard },
  { title: "Place Order", url: "/portal/place-order", icon: ShoppingCart },
  { title: "History", url: "/portal/orders", icon: Activity },
  { title: "Invoices", url: "/portal/invoices", icon: FileText },
];

const secondaryNav = [
  { title: "Milk Orders", url: "/portal/milk-orders", icon: Milk },
  { title: "VAP Orders", url: "/portal/vap-orders", icon: Layers },
  { title: "Catalogue", url: "/portal/catalogue", icon: BookOpen },
  { title: "Payments", url: "/portal/payments", icon: DollarSign },
  { title: "Outstanding", url: "/portal/outstanding", icon: DollarSign },
  { title: "My Locations", url: "/portal/delivery-locations", icon: MapPin },
  { title: "Statements", url: "/portal/statements", icon: FileText },
];

const allNav = [...primaryNav, ...secondaryNav];

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <header className="sticky top-0 z-50 bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-8">
              <div className="flex items-center gap-2 text-primary">
                <Milk className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="font-bold text-base sm:text-lg text-foreground leading-tight">Dairy Partner Portal</span>
              </div>

              <nav className="hidden lg:flex gap-1">
                {allNav.map((item) => (
                  <Link key={item.title} href={item.url}>
                    <Button
                      variant={location === item.url ? "secondary" : "ghost"}
                      className="gap-2 text-sm font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="outline" asChild className="hidden sm:flex h-8 text-xs px-3">
                <Link href="/">Back to ERP</Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 h-9">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs sm:text-sm">
                      PT
                    </div>
                    <div className="flex flex-col items-start text-sm text-left hidden sm:flex">
                      <span className="font-medium leading-none text-xs sm:text-sm">Prestige Towers</span>
                      <span className="text-[11px] text-muted-foreground mt-0.5">C-1042 · 3 locations</span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-semibold">Prestige Towers Apartments</p>
                      <p className="text-xs text-muted-foreground font-normal mt-0.5">Customer ID: C-1042 · 3 delivery locations</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserCircle className="mr-2 h-4 w-4" /><span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/portal/delivery-locations">
                      <MapPin className="mr-2 h-4 w-4" /><span>My Locations</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <span className="text-xs text-muted-foreground">Back to ERP</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" /><span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 lg:pb-8">
        {children}
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg">
        <div className="flex items-stretch">
          {primaryNav.map((item) => {
            const active = location === item.url;
            return (
              <Link key={item.title} href={item.url} className="flex-1">
                <div className={`flex flex-col items-center justify-center gap-0.5 py-2.5 ${active ? "text-primary" : "text-muted-foreground"}`}>
                  <item.icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
                  <span className="text-[10px] font-medium leading-none">{item.title}</span>
                </div>
              </Link>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex-1">
              <div className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-muted-foreground w-full">
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-none">More</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mb-2">
              {secondaryNav.map((item) => (
                <DropdownMenuItem key={item.title} asChild>
                  <Link href={item.url} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/">
                  <span className="text-xs text-muted-foreground">Back to ERP</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </div>
  );
}

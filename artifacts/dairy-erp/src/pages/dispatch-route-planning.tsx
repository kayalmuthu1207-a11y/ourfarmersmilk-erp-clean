import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Loader2, AlertTriangle, Info, Route, MapPin } from "lucide-react";
import { useRouteDetails } from "@/hooks/useRouteDetails";

export default function DispatchRoutePlanning() {
  const { data: routes, isLoading, isError, error } = useRouteDetails();

  const list = routes ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Route Planning</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Delivery routes, their assigned customers, and today's order quantity.
        </p>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          Detailed stop sequencing and drive-time planning aren't in the schema yet — this is a route roster view for now.
        </span>
      </div>

      {!isLoading && !isError && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Total Routes</p>
              <p className="text-2xl font-bold mt-1">{list.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Total Locations Assigned</p>
              <p className="text-2xl font-bold mt-1">{list.reduce((s, r) => s + r.locations.length, 0)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base">Route Roster</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading routes…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-semibold text-destructive">Failed to load routes</p>
              <p className="text-xs text-muted-foreground max-w-sm">{(error as Error)?.message}</p>
            </div>
          ) : list.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 text-sm">
              No routes defined yet.
            </div>
          ) : (
            <Accordion type="multiple" className="px-4">
              {list.map((r) => (
                <AccordionItem key={r.route_id} value={String(r.route_id)}>
                  <AccordionTrigger data-testid={`trigger-route-${r.route_id}`}>
                    <div className="flex items-center gap-3 flex-1 pr-4">
                      <Route className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{r.route_name}</span>
                      <span className="text-xs text-muted-foreground ml-auto sm:ml-0">
                        {r.locations.length} location{r.locations.length === 1 ? "" : "s"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.todays_order_quantity} today
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                        <span className="text-muted-foreground">Today's total order quantity: </span>
                        <span className="font-semibold">{r.todays_order_quantity}</span>
                      </div>

                      {r.locations.length === 0 ? (
                        <p className="text-sm text-muted-foreground px-1">No delivery locations assigned to this route.</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Customer</TableHead>
                              <TableHead>Delivery Location</TableHead>
                              <TableHead>Address</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {r.locations.map((l) => (
                              <TableRow key={l.location_id}>
                                <TableCell className="font-medium">{l.customer_name}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    {l.location_name}
                                  </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{l.address ?? "—"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}

                      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>
                          Delivery partner assignment isn't tracked yet — there's no driver/partner entity in the schema. This will show once that's built.
                        </span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

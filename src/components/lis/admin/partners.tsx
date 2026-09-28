"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ledgerEntries, partners, subAgencies } from "@/lib/lis/data";
import type { Partner, SubAgency } from "@/lib/lis/data";
import { fmtDate, inr } from "@/lib/lis/format";
import {
  DataTable, EmptyState, Field, FormGrid, KeyValue, Money, PageHeader, Panel, StatCard, StatusPill,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { Building2, Eye, Handshake, Lock, Plus, Users } from "lucide-react";

const LEDGER_TONE: Record<string, string> = {
  Invoice: "border-violet-200 bg-violet-50 text-violet-700",
  Payment: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Credit Note": "border-amber-200 bg-amber-50 text-amber-700",
  "Debit Note": "border-rose-200 bg-rose-50 text-rose-700",
  Opening: "border-slate-200 bg-slate-100 text-slate-600",
};

export function AdminPartnersView() {
  const [tierF, setTierF] = React.useState("All");
  const [statusF, setStatusF] = React.useState("All");
  const [selected, setSelected] = React.useState<Partner | null>(null);

  // Add partner dialog
  const [ptOpen, setPtOpen] = React.useState(false);
  const [ptForm, setPtForm] = React.useState({ code: "SHD", name: "Sigma Health Diagnostics", city: "Kolhapur", contactPerson: "Girish Ottur", mobile: "+91 98220 31415", email: "girish@sigmahealth.in", creditLimit: 150000, discountPct: 30, pricingTier: "Tier 2 — Standard" });

  // Create sub-agency dialog
  const [subOpen, setSubOpen] = React.useState(false);
  const [subForm, setSubForm] = React.useState({ name: "Khar Collection Point", parentId: "B2B-001", city: "Mumbai", contactPerson: "Aftab Shaikh", mobile: "+91 90040 45678", email: "aftab@kharcollection.in" });

  const outTotal = partners.reduce((a, p) => a + p.outstanding, 0);
  const subTotal = subAgencies.reduce((a, s) => a + s.monthlyBusiness, 0);

  const partnerRows = partners.filter(
    (p) => (tierF === "All" || p.pricingTier.startsWith(tierF)) && (statusF === "All" || p.status === statusF),
  );

  const openSubDialog = (parentId?: string) => {
    const parent = partners.find((p) => p.id === parentId);
    setSubForm({
      name: parent ? `${parent.city === "Mumbai" ? "Marol" : parent.city} Collection Point` : "Khar Collection Point",
      parentId: parentId ?? "B2B-001",
      city: parent?.city ?? "Mumbai",
      contactPerson: "Aftab Shaikh",
      mobile: "+91 90040 45678",
      email: "aftab@kharcollection.in",
    });
    setSubOpen(true);
  };

  const partnerColumns: Column<Partner>[] = [
    { key: "code", header: "Code", value: (r) => r.code, render: (r) => <Badge variant="outline" className="font-mono text-[10px]">{r.code}</Badge> },
    { key: "name", header: "Partner", value: (r) => r.name, render: (r) => (
      <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{r.name}</p><p className="truncate text-[11px] text-muted-foreground">{r.contactPerson} · since {fmtDate(r.joinedOn)}</p></div>
    ) },
    { key: "city", header: "City", value: (r) => r.city, render: (r) => <span className="text-xs">{r.city}</span> },
    { key: "mobile", header: "Mobile", value: (r) => r.mobile, render: (r) => <span className="hidden font-mono text-xs text-muted-foreground lg:table-cell">{r.mobile}</span> },
    { key: "limit", header: "Credit Limit", headClassName: "text-right", className: "text-right", value: (r) => r.creditLimit, render: (r) => <Money value={r.creditLimit} className="text-xs" /> },
    { key: "out", header: "Outstanding", headClassName: "text-right", className: "text-right", value: (r) => r.outstanding, render: (r) => (
      <span className={`text-xs font-semibold tabular-nums ${r.outstanding > r.creditLimit * 0.6 ? "text-rose-600" : "text-slate-800"}`}>{inr(r.outstanding)}</span>
    ) },
    { key: "disc", header: "Disc %", headClassName: "text-right", className: "text-right", value: (r) => r.discountPct, render: (r) => <span className="text-xs tabular-nums">{r.discountPct}%</span> },
    { key: "tier", header: "Tier", value: (r) => r.pricingTier, render: (r) => <span className="hidden whitespace-nowrap text-[11px] text-muted-foreground md:table-cell">{r.pricingTier}</span> },
    { key: "subs", header: "Subs", headClassName: "text-right", className: "text-right", value: (r) => r.subAgencies, render: (r) => <span className="text-xs tabular-nums">{r.subAgencies}</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "act", header: "", render: (r) => (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(r)} aria-label={`View ${r.name}`}><Eye className="h-3.5 w-3.5" /></Button>
    ) },
  ];

  const subColumns: Column<SubAgency>[] = [
    { key: "name", header: "Sub-Agency", value: (r) => r.name, render: (r) => (
      <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{r.name}</p><p className="font-mono text-[10px] text-muted-foreground">{r.id}</p></div>
    ) },
    { key: "parent", header: "Parent Partner", value: (r) => r.parentName, render: (r) => <span className="text-xs text-violet-700">{r.parentName}</span> },
    { key: "city", header: "City", value: (r) => r.city, render: (r) => <span className="text-xs">{r.city}</span> },
    { key: "contact", header: "Contact", value: (r) => r.contactPerson, render: (r) => (
      <div><p className="text-xs">{r.contactPerson}</p><p className="hidden font-mono text-[10px] text-muted-foreground md:table-cell">{r.mobile}</p></div>
    ) },
    { key: "biz", header: "Monthly Business", headClassName: "text-right", className: "text-right", value: (r) => r.monthlyBusiness, render: (r) => <Money value={r.monthlyBusiness} className="text-xs" /> },
    { key: "out", header: "Outstanding", headClassName: "text-right", className: "text-right", value: (r) => r.outstanding, render: (r) => <span className="text-xs font-semibold tabular-nums">{inr(r.outstanding)}</span> },
    { key: "joined", header: "Joined", value: (r) => r.joinedOn, render: (r) => <span className="hidden whitespace-nowrap text-[11px] text-muted-foreground md:table-cell">{fmtDate(r.joinedOn)}</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
  ];

  const selSubs = selected ? subAgencies.filter((s) => s.parentId === selected.id) : [];
  const selLedger = selected ? ledgerEntries.filter((l) => l.partnerId === selected.id) : [];
  const selUtil = selected && selected.creditLimit > 0 ? Math.round((selected.outstanding / selected.creditLimit) * 100) : 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="B2B Network"
        subtitle="Referral partners and their sub-agencies — credit terms, contracted discounts and scoped pricing"
        icon={<Handshake className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" onClick={() => openSubDialog()}><Plus className="mr-1.5 h-4 w-4" /> Create Sub-Agency</Button>
            <Button onClick={() => setPtOpen(true)}><Building2 className="mr-1.5 h-4 w-4" /> Add B2B Partner</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active Partners" value={partners.filter((p) => p.status === "Active").length} icon={<Building2 className="h-4 w-4" />} sublabel={`${partners.length} on the network`} />
        <StatCard label="Sub-Agencies" value={subAgencies.length} accent="amber" icon={<Users className="h-4 w-4" />} sublabel="under 3 parents" />
        <StatCard label="Partner Outstanding" value={inr(outTotal, { compact: true })} accent="violet" icon={<Handshake className="h-4 w-4" />} sublabel="credit exposure" />
        <StatCard label="Sub-Agency Monthly Biz" value={inr(subTotal, { compact: true })} accent="emerald" sublabel="September run-rate" />
      </div>

      <Tabs defaultValue="partners">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="partners">B2B Partners</TabsTrigger>
          <TabsTrigger value="subs">Sub-Agencies</TabsTrigger>
        </TabsList>

        {/* ------------------------------ B2B PARTNERS ------------------------------ */}
        <TabsContent value="partners">
          <Panel title="Referral Partners" description="Click a row for the full profile, credit position and ledger movement">
            <DataTable
              columns={partnerColumns}
              rows={partnerRows}
              pageSize={8}
              searchOf={(r) => `${r.code} ${r.name} ${r.city} ${r.contactPerson}`}
              searchPlaceholder="Search partner / contact…"
              onRowClick={(r) => setSelected(r)}
              filters={
                <>
                  <Select value={tierF} onValueChange={setTierF}>
                    <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All tiers</SelectItem>
                      <SelectItem value="Tier 1">Tier 1 — Volume</SelectItem>
                      <SelectItem value="Tier 2">Tier 2 — Standard</SelectItem>
                      <SelectItem value="Tier 3">Tier 3 — New</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusF} onValueChange={setStatusF}>
                    <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              }
            />
          </Panel>
        </TabsContent>

        {/* ------------------------------ SUB-AGENCIES ------------------------------ */}
        <TabsContent value="subs" className="space-y-4">
          <Alert className="border-teal-200 bg-teal-50/70 text-teal-900">
            <Lock className="h-4 w-4 text-teal-700" />
            <AlertTitle>Scoped pricing — by design</AlertTitle>
            <AlertDescription>
              Sub-agencies see only their own price list — central pricing is never exposed. Their billing flows to the parent
              partner account, and settlement margins are visible to Apex and the parent alone.
            </AlertDescription>
          </Alert>
          <Panel
            title="Sub-Agencies"
            description="Collection points operating under a B2B parent — billed via the parent account"
            actions={<Button size="sm" onClick={() => openSubDialog()}><Plus className="mr-1.5 h-3.5 w-3.5" /> Create Sub-Agency</Button>}
          >
            <DataTable
              columns={subColumns}
              rows={subAgencies}
              pageSize={6}
              searchOf={(r) => `${r.name} ${r.parentName} ${r.city} ${r.contactPerson}`}
              searchPlaceholder="Search agency / parent…"
              filters={
                <>
                  <Select defaultValue="All">
                    <SelectTrigger className="h-9 w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All parents</SelectItem>
                      {partners.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select defaultValue="All">
                    <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              }
            />
          </Panel>
        </TabsContent>
      </Tabs>

      {/* ------------------------------ PARTNER DETAIL SHEET ------------------------------ */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
          {selected ? (
            <>
              <SheetHeader className="border-b px-5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <SheetTitle className="truncate">{selected.name}</SheetTitle>
                    <p className="font-mono text-xs text-muted-foreground">{selected.code} · {selected.city} · {selected.pricingTier}</p>
                  </div>
                  <StatusPill status={selected.status} />
                </div>
              </SheetHeader>
              <div className="space-y-5 p-5">
                <KeyValue
                  items={[
                    { label: "Contact Person", value: selected.contactPerson },
                    { label: "Mobile", value: <span className="font-mono text-xs">{selected.mobile}</span> },
                    { label: "Email", value: <span className="truncate text-xs">{selected.email}</span> },
                    { label: "Joined On", value: fmtDate(selected.joinedOn) },
                    { label: "Contracted Discount", value: `${selected.discountPct}% off list` },
                    { label: "Last Settlement", value: fmtDate(selected.lastSettlement) },
                    { label: "Opening Balance", value: inr(selected.openingBalance) },
                    { label: "Sub-Agencies", value: `${selected.subAgencies} active` },
                  ]}
                />

                <Panel title="Credit Position" description={`Terms: 15-day credit · limit ${inr(selected.creditLimit, { compact: true })}`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Outstanding</span>
                      <span className={`font-bold tabular-nums ${selUtil > 60 ? "text-rose-600" : "text-slate-900"}`}>{inr(selected.outstanding)} <span className="text-xs font-normal text-muted-foreground">/ {inr(selected.creditLimit)}</span></span>
                    </div>
                    <Progress value={Math.min(100, selUtil)} className="h-2.5" />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{selUtil}% of credit limit utilised</span>
                      {selUtil > 60 ? <span className="font-medium text-rose-600">High utilisation — review before further credit bills</span> : <span>Healthy</span>}
                    </div>
                  </div>
                </Panel>

                <Panel
                  title="Sub-Agencies"
                  description="Collection points operating under this partner"
                  actions={(
                    <Button size="sm" variant="outline" className="h-7" onClick={() => { setSelected(null); openSubDialog(selected.id); }}>
                      <Plus className="mr-1 h-3 w-3" /> Create Sub-Agency
                    </Button>
                  )}
                >
                  {selSubs.length === 0 ? (
                    <EmptyState title="No sub-agencies yet" hint="Create one to extend partner-priced services to satellite collection points." />
                  ) : (
                    <ul className="space-y-2">
                      {selSubs.map((s) => (
                        <li key={s.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-2.5">
                          <div className="min-w-0 text-xs">
                            <p className="truncate font-medium text-slate-800">{s.name}</p>
                            <p className="text-muted-foreground">{s.city} · {s.contactPerson}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-xs font-semibold tabular-nums">{inr(s.monthlyBusiness, { compact: true })}<span className="font-normal text-muted-foreground">/mo</span></p>
                            <p className="text-[10px] text-muted-foreground">outstanding {inr(s.outstanding)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>

                <Panel title="Recent Ledger Movement" description="Latest entries on the partner account">
                  {selLedger.length === 0 ? (
                    <EmptyState title="No ledger entries" hint="Invoices and payments appear here once billing starts." />
                  ) : (
                    <ul className="space-y-2">
                      {selLedger.slice(-4).reverse().map((l) => (
                        <li key={l.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-2.5">
                          <div className="min-w-0 text-xs">
                            <p className="flex items-center gap-1.5">
                              <span className="font-mono font-medium text-slate-700">{l.ref}</span>
                              <Badge variant="outline" className={`text-[9px] ${LEDGER_TONE[l.type] ?? LEDGER_TONE.Opening}`}>{l.type}</Badge>
                            </p>
                            <p className="truncate text-muted-foreground">{fmtDate(l.date)} · {l.description}</p>
                          </div>
                          <div className="shrink-0 text-right text-xs">
                            {l.debit > 0 ? <p className="font-medium text-rose-600">Dr {inr(l.debit)}</p> : null}
                            {l.credit > 0 ? <p className="font-medium text-emerald-600">Cr {inr(l.credit)}</p> : null}
                            <p className="text-[10px] text-muted-foreground">bal {inr(l.balance)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* ------------------------------ ADD PARTNER DIALOG ------------------------------ */}
      <Dialog open={ptOpen} onOpenChange={setPtOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add B2B Partner</DialogTitle>
            <DialogDescription>Onboarding provisions a portal login and generates the partner rate card from the tier template.</DialogDescription>
          </DialogHeader>
          <FormGrid cols={2}>
            <Field label="Partner Name" required><Input value={ptForm.name} onChange={(e) => setPtForm({ ...ptForm, name: e.target.value })} /></Field>
            <Field label="Partner Code" required><Input value={ptForm.code} onChange={(e) => setPtForm({ ...ptForm, code: e.target.value.toUpperCase() })} /></Field>
            <Field label="City" required><Input value={ptForm.city} onChange={(e) => setPtForm({ ...ptForm, city: e.target.value })} /></Field>
            <Field label="Contact Person" required><Input value={ptForm.contactPerson} onChange={(e) => setPtForm({ ...ptForm, contactPerson: e.target.value })} /></Field>
            <Field label="Mobile" required><Input value={ptForm.mobile} onChange={(e) => setPtForm({ ...ptForm, mobile: e.target.value })} /></Field>
            <Field label="Email" required><Input value={ptForm.email} onChange={(e) => setPtForm({ ...ptForm, email: e.target.value })} /></Field>
            <Field label="Credit Limit (₹)" required><Input type="number" min={0} value={ptForm.creditLimit} onChange={(e) => setPtForm({ ...ptForm, creditLimit: Number(e.target.value) })} /></Field>
            <Field label="Discount %" required><Input type="number" min={0} max={60} value={ptForm.discountPct} onChange={(e) => setPtForm({ ...ptForm, discountPct: Number(e.target.value) })} /></Field>
            <Field label="Pricing Tier" required>
              <Select value={ptForm.pricingTier} onValueChange={(v) => setPtForm({ ...ptForm, pricingTier: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tier 1 — Volume">Tier 1 — Volume</SelectItem>
                  <SelectItem value="Tier 2 — Standard">Tier 2 — Standard</SelectItem>
                  <SelectItem value="Tier 3 — New">Tier 3 — New</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FormGrid>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPtOpen(false)}>Cancel</Button>
            <Button onClick={() => setPtOpen(false)}>Create Partner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------ CREATE SUB-AGENCY DIALOG ------------------------------ */}
      <Dialog open={subOpen} onOpenChange={setSubOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Sub-Agency</DialogTitle>
            <DialogDescription>Priced from the parent partner rate card plus the sub-agency margin defined in the Pricing Engine.</DialogDescription>
          </DialogHeader>
          <FormGrid cols={2}>
            <Field label="Agency Name" required><Input value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} /></Field>
            <Field label="Parent Partner" required>
              <Select value={subForm.parentId} onValueChange={(v) => setSubForm({ ...subForm, parentId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{partners.filter((p) => p.status === "Active").map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="City" required><Input value={subForm.city} onChange={(e) => setSubForm({ ...subForm, city: e.target.value })} /></Field>
            <Field label="Contact Person" required><Input value={subForm.contactPerson} onChange={(e) => setSubForm({ ...subForm, contactPerson: e.target.value })} /></Field>
            <Field label="Mobile" required><Input value={subForm.mobile} onChange={(e) => setSubForm({ ...subForm, mobile: e.target.value })} /></Field>
            <Field label="Email" required><Input value={subForm.email} onChange={(e) => setSubForm({ ...subForm, email: e.target.value })} /></Field>
          </FormGrid>
          <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-3 text-[11px] leading-relaxed text-teal-900">
            The new agency receives a scoped login, its own price list derived from <b>{partners.find((p) => p.id === subForm.parentId)?.name}</b>,
            and a pickup address book. Central pricing stays hidden from their portal.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubOpen(false)}>Cancel</Button>
            <Button onClick={() => setSubOpen(false)}>Create Sub-Agency</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

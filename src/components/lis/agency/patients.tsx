"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLisNav } from "@/components/lis/nav";
import { patientsForSubAgency, ordersForSubAgency } from "@/lib/lis/data";
import { fmtDate } from "@/lib/lis/format";
import {
  DataTable, EmptyState, Field, FormGrid, KeyValue, Money, PageHeader, Panel, StatusPill,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { Eye, Plus, UserPlus, Users } from "lucide-react";
import type { Patient } from "@/lib/lis/types";

const AGENCY_ID = "SUB-001";
const AGENCY_NAME = "XYZ Collection Centre";

export function AgencyPatientsView() {
  const { go } = useLisNav();
  const [selected, setSelected] = React.useState<Patient | null>(null);
  const [regOpen, setRegOpen] = React.useState(false);
  const [registered, setRegistered] = React.useState(false);

  const rows = patientsForSubAgency(AGENCY_ID);
  const agencyOrders = ordersForSubAgency(AGENCY_ID);
  const ordersOf = (patientId: string) => agencyOrders.filter((o) => o.patientId === patientId);

  const columns: Column<Patient>[] = [
    { key: "name", header: "Patient", value: (r) => r.name, render: (r) => (
      <div>
        <p className="text-sm font-medium text-slate-800">{r.name}</p>
        <p className="font-mono text-[11px] text-muted-foreground">{r.id}</p>
      </div>
    ) },
    { key: "demog", header: "Age / Gender", value: (r) => `${r.age}y ${r.gender}`, render: (r) => <span className="text-sm">{r.age}y · {r.gender}</span> },
    { key: "contact", header: "Contact", value: (r) => r.mobile, render: (r) => (
      <div className="text-xs"><p className="font-medium text-slate-700">{r.mobile}</p><p className="truncate text-muted-foreground">{r.email}</p></div>
    ) },
    { key: "addr", header: "Locality", value: (r) => r.address, render: (r) => <span className="max-w-52 truncate text-xs text-muted-foreground">{r.address}, {r.city}</span> },
    { key: "reg", header: "Registered", value: (r) => r.registeredOn, render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDate(r.registeredOn)}</span> },
    { key: "orders", header: "Orders", headClassName: "text-right", className: "text-right", value: (r) => ordersOf(r.id).length, render: (r) => <span className="text-sm font-semibold">{ordersOf(r.id).length}</span> },
    { key: "act", header: "", render: (r) => (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelected(r); }}><Eye className="h-3.5 w-3.5" /></Button>
    ) },
  ];

  const selectedOrders = selected ? ordersOf(selected.id) : [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Patients"
        subtitle={`Patients registered by ${AGENCY_NAME} — your records only`}
        icon={<Users className="h-5 w-5" />}
        actions={<Button onClick={() => { setRegistered(false); setRegOpen(true); }}><Plus className="mr-1.5 h-4 w-4" /> Register Patient</Button>}
      />

      <Panel>
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={10}
          searchOf={(r) => `${r.id} ${r.name} ${r.mobile} ${r.email} ${r.address}`}
          searchPlaceholder="Search patient / mobile…"
          onRowClick={(r) => setSelected(r)}
        />
      </Panel>

      {/* Patient detail sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
          {selected ? (
            <>
              <SheetHeader className="border-b px-5 py-3">
                <SheetTitle className="text-sm">{selected.name} <span className="font-mono text-xs text-muted-foreground">· {selected.id}</span></SheetTitle>
                <p className="text-xs text-muted-foreground">{selected.age}y {selected.gender} · {selected.mobile} · registered {fmtDate(selected.registeredOn)}</p>
              </SheetHeader>
              <div className="space-y-5 p-5">
                <KeyValue
                  cols={2}
                  items={[
                    { label: "Email", value: selected.email },
                    { label: "ID Proof", value: selected.idProof },
                    { label: "Address", value: `${selected.address}, ${selected.city}` },
                    { label: "Channel", value: "Sub-Agency (SUB)" },
                  ]}
                />

                <Panel title={`Orders (${selectedOrders.length})`} contentClassName="p-0">
                  {selectedOrders.length === 0 ? (
                    <div className="p-4"><EmptyState title="No orders yet" hint="Book the first test from the New Test Order page." /></div>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {selectedOrders.map((o) => (
                        <li key={o.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                          <div className="min-w-0">
                            <p className="truncate font-mono text-xs font-medium text-slate-800">{o.id}</p>
                            <p className="truncate text-[11px] text-muted-foreground">{o.items.map((i) => i.code).join(", ")} · {fmtDate(o.createdAt)}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Money value={o.net} className="text-xs" />
                            <StatusPill status={o.status} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>

                <Panel title="Reports & Pipeline" description="Released reports appear here once the pathologist approves them">
                  <ul className="space-y-2">
                    {selectedOrders.map((o) => (
                      <li key={o.id} className="flex items-center justify-between gap-2 rounded-lg border p-2.5 text-xs">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800">{o.items.map((i) => i.code).join(", ")}</p>
                          <p className="text-muted-foreground">
                            {["Report Delivered", "Report Generated", "Pathologist Approved"].includes(o.status)
                              ? "Report released — visible in Reports page"
                              : o.status === "In Transit"
                                ? "Sample in transit — testing not started"
                                : "Report in preparation at Apex central lab"}
                          </p>
                        </div>
                        <StatusPill status={o.status} />
                      </li>
                    ))}
                  </ul>
                </Panel>

                <Button variant="outline" className="w-full" onClick={() => go("agency/order-new")}>
                  <UserPlus className="mr-1.5 h-4 w-4" /> Book Test for {selected.name.split(" ")[0]}
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Register dialog */}
      <Dialog open={regOpen} onOpenChange={setRegOpen}>
        <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Register New Patient — {AGENCY_NAME}</DialogTitle>
            <DialogDescription className="text-xs">The record is created under your agency scope (channel SUB · sourceId {AGENCY_ID}).</DialogDescription>
          </DialogHeader>
          {registered ? (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <UserPlus className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">Patient registered</p>
                <p className="text-xs text-emerald-800">Nikhat Ansari (PAT-00144) added under {AGENCY_NAME}. You can now book tests at your SUB-001 rates.</p>
              </div>
            </div>
          ) : (
            <>
              <FormGrid cols={2}>
                <Field label="Full Name" required><Input defaultValue="Nikhat Ansari" /></Field>
                <Field label="Date of Birth" required><Input type="date" defaultValue="1993-06-24" /></Field>
                <Field label="Gender" required>
                  <Select defaultValue="Female">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                  </Select>
                </Field>
                <Field label="Mobile" required><Input defaultValue="+91 98331 22112" /></Field>
                <Field label="Email"><Input defaultValue="nikhat.a@gmail.com" /></Field>
                <Field label="ID Proof"><Input defaultValue="Aadhaar XXXX 5124" /></Field>
                <Field label="Address" className="sm:col-span-2"><Input defaultValue="504, Hiranandani Gardens, Powai, Mumbai" /></Field>
              </FormGrid>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setRegOpen(false)}>Cancel</Button>
                <Button onClick={() => setRegistered(true)}>Register Patient</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

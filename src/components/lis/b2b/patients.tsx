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
import {
  orders, partners, patients, reports, subAgencies,
} from "@/lib/lis/data";
import { fmtDate, fmtDateTime } from "@/lib/lis/format";
import {
  ChannelPill, DataTable, EmptyState, Field, FormGrid, KeyValue, Money, PageHeader,
  Panel, StatusPill,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import type { Patient } from "@/lib/lis/types";
import { Eye, Plus, Users } from "lucide-react";

// ============================================================
// B2B My Patients — patients registered by ABC Diagnostics + its sub-agencies
// ============================================================

const PARTNER_ID = "B2B-001";
const partner = partners.find((p) => p.id === PARTNER_ID) ?? partners[0];
const mySubs = subAgencies.filter((s) => s.parentId === PARTNER_ID);
const SUB_IDS = mySubs.map((s) => s.id);
const basePatients = patients.filter(
  (p) =>
    (p.channel === "B2B" && p.sourceId === PARTNER_ID) ||
    (p.channel === "SUB" && p.sourceId !== undefined && SUB_IDS.includes(p.sourceId)),
);

interface Row {
  patient: Patient;
  ordersCount: number;
  lastOrder: string;
}

const buildRow = (p: Patient): Row => {
  const mine = orders.filter((o) => o.patientId === p.id && o.partnerId === PARTNER_ID);
  const last = mine.reduce<string>((acc, o) => (o.createdAt > acc ? o.createdAt : acc), "");
  return {
    patient: p,
    ordersCount: mine.length,
    lastOrder: last,
  };
};

const initialRows: Row[] = basePatients.map(buildRow);

export function B2bPatientsView() {
  const { go } = useLisNav();
  const [rows, setRows] = React.useState<Row[]>(initialRows);
  const [selected, setSelected] = React.useState<Patient | null>(null);
  const [openNew, setOpenNew] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "Sunita Verma", age: "38", gender: "Female", mobile: "+91 98331 22120",
    email: "sunita.v@gmail.com", address: "7, Powai Vihar Complex, Powai", city: "Mumbai",
    source: partner.name,
  });

  const register = () => {
    const id = `PAT-001${44 + rows.length - initialRows.length}`;
    const p: Patient = {
      id, name: form.name, dob: "1988-01-01", age: Number(form.age) || 30, gender: form.gender === "Male" ? "Male" : "Female",
      mobile: form.mobile, email: form.email, address: form.address, city: form.city,
      idProof: "Aadhaar XXXX 0000", source: form.source,
      channel: form.source === partner.name ? "B2B" : "SUB",
      sourceId: form.source === partner.name ? PARTNER_ID : mySubs.find((s) => s.name === form.source)?.id,
      registeredOn: "2026-09-28",
    };
    setRows((cur) => [buildRow(p), ...cur]);
    setOpenNew(false);
  };

  const columns: Column<Row>[] = [
    {
      key: "id", header: "Patient ID", value: (r) => r.patient.id,
      render: (r) => <span className="font-mono text-xs font-medium text-violet-800">{r.patient.id}</span>,
    },
    {
      key: "name", header: "Patient", value: (r) => r.patient.name,
      render: (r) => (
        <div>
          <p className="text-sm font-medium">{r.patient.name}</p>
          <p className="text-[11px] text-muted-foreground">{r.patient.email}</p>
        </div>
      ),
    },
    {
      key: "ageSex", header: "Age / Sex", value: (r) => `${r.patient.age}y ${r.patient.gender}`,
      render: (r) => <span className="text-sm">{r.patient.age}y / {r.patient.gender === "Male" ? "M" : "F"}</span>,
    },
    { key: "mobile", header: "Mobile", value: (r) => r.patient.mobile, render: (r) => <span className="text-xs">{r.patient.mobile}</span> },
    {
      key: "source", header: "Source", value: (r) => r.patient.source,
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <ChannelPill channel={r.patient.channel} />
          <span className="text-xs text-muted-foreground">{r.patient.source}</span>
        </div>
      ),
    },
    { key: "orders", header: "Orders", headClassName: "text-right", className: "text-right", value: (r) => r.ordersCount, render: (r) => <span className="text-sm font-semibold tabular-nums">{r.ordersCount}</span> },
    {
      key: "last", header: "Last Order", value: (r) => r.lastOrder,
      render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{r.lastOrder ? fmtDateTime(r.lastOrder) : "—"}</span>,
    },
    {
      key: "act", header: "",
      render: (r) => (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelected(r.patient); }}>
          <Eye className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  const theirOrders = selected ? orders.filter((o) => o.patientId === selected.id && o.partnerId === PARTNER_ID) : [];
  const theirReports = selected
    ? reports.filter((r) => r.patientId === selected.id && theirOrders.some((o) => o.id === r.orderId))
    : [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Patients"
        subtitle={`${partner.name} + ${mySubs.length} sub-agencies · ${rows.length} registered patients`}
        actions={
          <Button className="bg-violet-600 text-white hover:bg-violet-700" onClick={() => setOpenNew(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Register Patient
          </Button>
        }
      />

      <Panel>
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={10}
          searchOf={(r) => `${r.patient.id} ${r.patient.name} ${r.patient.mobile} ${r.patient.source}`}
          searchPlaceholder="Search patient / mobile / source…"
          onRowClick={(r) => setSelected(r.patient)}
        />
      </Panel>

      {/* Detail sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
          {selected ? (
            <>
              <SheetHeader className="border-b px-5 py-3">
                <SheetTitle className="text-sm">{selected.name} <span className="ml-1 font-mono text-xs text-muted-foreground">{selected.id}</span></SheetTitle>
                <p className="text-xs text-muted-foreground">{selected.age}y {selected.gender} · {selected.mobile} · {selected.source}</p>
              </SheetHeader>
              <div className="space-y-5 p-5">
                <Panel title="Patient Information" contentClassName="p-4">
                  <KeyValue
                    cols={2}
                    items={[
                      { label: "Patient ID", value: selected.id },
                      { label: "Date of Birth", value: fmtDate(selected.dob) },
                      { label: "Mobile", value: selected.mobile },
                      { label: "Email", value: selected.email },
                      { label: "City", value: selected.city },
                      { label: "ID Proof", value: selected.idProof },
                      { label: "Address", value: selected.address },
                      { label: "Registered On", value: fmtDate(selected.registeredOn) },
                    ]}
                  />
                </Panel>

                <Panel title={`Orders (${theirOrders.length})`} contentClassName="p-0">
                  {theirOrders.length === 0 ? (
                    <div className="p-4"><EmptyState title="No orders yet" hint="Bookings appear here once created for this patient." /></div>
                  ) : (
                    <ul className="max-h-64 divide-y overflow-y-auto">
                      {theirOrders.map((o) => (
                        <li key={o.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-xs">
                          <div className="min-w-0">
                            <p className="truncate font-mono font-medium text-violet-800">{o.id}</p>
                            <p className="truncate text-muted-foreground">{o.items.map((i) => i.code).join(", ")} · {fmtDateTime(o.createdAt)}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Money value={o.gross} />
                            <StatusPill status={o.status} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>

                <Panel title="Reports">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Reports published for this patient</span>
                    <span className="text-lg font-bold text-violet-700">{theirReports.length}</span>
                  </div>
                  {theirReports.length > 0 ? (
                    <ul className="mt-2 space-y-1.5">
                      {theirReports.map((r) => (
                        <li key={r.id} className="flex items-center justify-between gap-2 rounded border px-2.5 py-1.5 text-xs">
                          <span className="font-mono">{r.id}</span>
                          <span className="truncate text-muted-foreground">{r.tests.join(", ")}</span>
                          <StatusPill status={r.status} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </Panel>

                <Button className="w-full bg-violet-600 text-white hover:bg-violet-700" onClick={() => go("b2b/order-new")}>
                  <Plus className="mr-1.5 h-4 w-4" /> Book Order for {selected.name.split(" ")[0]}
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Register patient dialog */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Register New Patient</DialogTitle>
            <DialogDescription className="text-xs">Registered under {partner.name} or one of your sub-agencies</DialogDescription>
          </DialogHeader>
          <FormGrid cols={2}>
            <Field label="Full Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Age" required><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></Field>
            <Field label="Gender" required>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label="Mobile" required><Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></Field>
            <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="City"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            <Field label="Address" className="sm:col-span-2"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
            <Field label="Source" hint="Collection point registering this patient" className="sm:col-span-2">
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={partner.name}>{partner.name} (direct)</SelectItem>
                  {mySubs.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </FormGrid>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNew(false)}>Cancel</Button>
            <Button className="bg-violet-600 text-white hover:bg-violet-700" onClick={register}>
              <Users className="mr-1.5 h-4 w-4" /> Register Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

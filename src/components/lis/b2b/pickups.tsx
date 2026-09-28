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
import { partners, pickups, subAgencies, today } from "@/lib/lis/data";
import { fmtDateTime } from "@/lib/lis/format";
import {
  DataTable, KeyValue, PageHeader, Panel, StatCard, StatusPill, Timeline,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { ManifestSheet } from "@/components/lis/report-sheet";
import type { Pickup } from "@/lib/lis/types";
import { Bike, CheckCircle2, PackageCheck, Plus, Truck } from "lucide-react";

// ============================================================
// B2B Pickup Requests — ABC Diagnostics + its 3 sub-agencies
// ============================================================

const PARTNER_ID = "B2B-001";
const partner = partners.find((p) => p.id === PARTNER_ID) ?? partners[0];
const mySubs = subAgencies.filter((s) => s.parentId === PARTNER_ID);
const SUB_NAMES = mySubs.map((s) => s.name);
const basePickups = pickups.filter((p) => p.requestedBy === partner.name || SUB_NAMES.includes(p.requestedBy));

const PICKUP_ADDRESS = "Shop 4, Laxmi Ind. Estate, Andheri West";
const WINDOWS = ["Today, 12:00–13:00", "Today, 15:00–16:00", "Today, 17:00–18:00", "Tomorrow, 07:00–08:00"];

const buildTimeline = (p: Pickup) => {
  const flow: { label: string; time?: string; note?: string }[] = [
    { label: "Pickup Requested", time: fmtDateTime(p.requestedAt), note: `${p.sampleCount} samples · manifest ${p.manifestNo}` },
    {
      label: "Courier Assigned",
      time: p.courier !== "— Unassigned —" ? p.courier : undefined,
      note: p.riderName !== "—" ? `${p.riderName} · ${p.riderMobile}` : "Apex assigns courier after approval",
    },
    { label: "Picked Up", time: ["Picked Up", "In Transit", "Received at Lab"].includes(p.status) ? p.pickupWindow : undefined },
    { label: "In Transit to Apex", time: ["In Transit", "Received at Lab"].includes(p.status) ? p.pickupWindow : undefined },
    { label: "Received at Lab", time: p.receivedAt ? fmtDateTime(p.receivedAt) : undefined, note: p.exceptions },
  ];
  return flow;
};

export function B2bPickupsView() {
  const [rows, setRows] = React.useState<Pickup[]>(basePickups);
  const [selected, setSelected] = React.useState<Pickup | null>(null);
  const [manifest, setManifest] = React.useState<Pickup | null>(null);
  const [openNew, setOpenNew] = React.useState(false);
  const [form, setForm] = React.useState({
    centre: partner.name, count: "6", address: PICKUP_ADDRESS, window: WINDOWS[0],
  });

  const openCount = rows.filter((p) => p.status === "Requested" || p.status === "Assigned").length;
  const transitSamples = rows.filter((p) => p.status === "In Transit").reduce((a, p) => a + p.sampleCount, 0);
  const receivedToday = rows.filter((p) => p.status === "Received at Lab" && (p.receivedAt ?? "").startsWith(today)).length;

  const submit = () => {
    const np: Pickup = {
      id: `PKP-2026-0${188 + rows.length - basePickups.length}`,
      requestedBy: form.centre,
      requesterType: form.centre === partner.name ? "B2B" : "SUB",
      parentId: PARTNER_ID,
      sampleCount: Number(form.count) || 1,
      samples: ["To be labelled at pickup"],
      address: form.address,
      city: "Mumbai",
      requestedAt: `${today}T12:35:00`,
      pickupWindow: form.window,
      courier: "— Unassigned —",
      riderName: "—",
      riderMobile: "—",
      status: "Requested",
      manifestNo: `MAN-2026-0${344 + rows.length - basePickups.length}`,
    };
    setRows((cur) => [np, ...cur]);
    setOpenNew(false);
  };

  const columns: Column<Pickup>[] = [
    {
      key: "id", header: "Pickup ID", value: (r) => r.id,
      render: (r) => <span className="font-mono text-xs font-medium text-violet-800">{r.id}</span>,
    },
    {
      key: "req", header: "Requested By", value: (r) => r.requestedBy,
      render: (r) => (
        <div>
          <p className="text-sm font-medium">{r.requestedBy}</p>
          <p className="text-[11px] text-muted-foreground">{r.requesterType === "B2B" ? "Partner direct" : "Sub-agency"} · {r.city}</p>
        </div>
      ),
    },
    { key: "count", header: "Samples", headClassName: "text-right", className: "text-right", value: (r) => r.sampleCount, render: (r) => <span className="text-sm font-semibold tabular-nums">{r.sampleCount}</span> },
    { key: "win", header: "Pickup Window", value: (r) => r.pickupWindow, render: (r) => <span className="whitespace-nowrap text-xs">{r.pickupWindow}</span> },
    {
      key: "courier", header: "Courier / Rider", value: (r) => r.courier,
      render: (r) => (
        <div className="text-xs">
          <p className="font-medium">{r.courier}</p>
          <p className="text-muted-foreground">{r.riderName !== "—" ? `${r.riderName} · ${r.riderMobile}` : "Awaiting assignment"}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    {
      key: "act", header: "",
      render: (r) => (
        <Button variant="outline" size="sm" className="h-7" onClick={(e) => { e.stopPropagation(); setManifest(r); }}>
          <Truck className="mr-1 h-3 w-3" /> Manifest
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pickup Requests"
        subtitle="Sample logistics between your centres and Apex central lab, Mumbai"
        actions={
          <Button className="bg-violet-600 text-white hover:bg-violet-700" onClick={() => setOpenNew(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> New Pickup Request
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Open Requests" value={openCount} icon={<PackageCheck className="h-4 w-4" />} accent="amber" sublabel="awaiting courier" />
        <StatCard label="In Transit" value={transitSamples} icon={<Truck className="h-4 w-4" />} accent="violet" sublabel="samples on road" />
        <StatCard label="Received Today" value={receivedToday} icon={<CheckCircle2 className="h-4 w-4" />} accent="emerald" sublabel="at Apex central lab" />
        <StatCard label="Total Requests (Sep)" value={rows.length} icon={<Bike className="h-4 w-4" />} accent="teal" sublabel="all centres" />
      </div>

      <Panel>
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={10}
          searchOf={(r) => `${r.id} ${r.requestedBy} ${r.manifestNo} ${r.courier} ${r.status}`}
          searchPlaceholder="Search pickup / manifest / courier…"
          onRowClick={(r) => setSelected(r)}
        />
      </Panel>

      {/* Detail sheet with manifest timeline */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
          {selected ? (
            <>
              <SheetHeader className="border-b px-5 py-3">
                <SheetTitle className="font-mono text-sm">{selected.id}</SheetTitle>
                <p className="text-xs text-muted-foreground">{selected.requestedBy} · {selected.sampleCount} samples · {selected.manifestNo}</p>
              </SheetHeader>
              <div className="space-y-5 p-5">
                <KeyValue
                  cols={2}
                  items={[
                    { label: "Status", value: <StatusPill status={selected.status} /> },
                    { label: "Pickup Window", value: selected.pickupWindow },
                    { label: "Requested At", value: fmtDateTime(selected.requestedAt) },
                    { label: "City", value: selected.city },
                    { label: "Address", value: selected.address },
                    { label: "Courier", value: `${selected.courier}${selected.riderName !== "—" ? ` · ${selected.riderName}` : ""}` },
                  ]}
                />
                <Panel title="Manifest Timeline">
                  <Timeline items={buildTimeline(selected)} />
                </Panel>
                <Panel title="Samples in Manifest" contentClassName="p-0">
                  <ul className="divide-y">
                    {selected.samples.map((s) => (
                      <li key={s} className="flex items-center justify-between px-4 py-2 text-xs">
                        <span className="font-mono">{s}</span>
                        <span className="text-muted-foreground">labelled & sealed</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
                <Button variant="outline" className="w-full" onClick={() => setManifest(selected)}>
                  <Truck className="mr-1.5 h-4 w-4" /> Print Manifest {selected.manifestNo}
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* New pickup request dialog */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">New Pickup Request</DialogTitle>
            <DialogDescription className="text-xs">Apex assigns a courier partner after approval — you will be notified with rider details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Collection Centre <span className="text-rose-500">*</span></label>
                <Select value={form.centre} onValueChange={(v) => setForm({ ...form, centre: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={partner.name}>{partner.name} (direct)</SelectItem>
                    {mySubs.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Sample Count <span className="text-rose-500">*</span></label>
                <Input type="number" min={1} value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Pickup Address</label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Pickup Window</label>
              <Select value={form.window} onValueChange={(v) => setForm({ ...form, window: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{WINDOWS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs text-violet-900">
              Courier info: Apex assigns a courier partner (BlueDart Med Express / LabRunners / in-house van) after approval.
              Samples must be barcoded and sealed before handover; the rider signs your manifest copy.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNew(false)}>Cancel</Button>
            <Button className="bg-violet-600 text-white hover:bg-violet-700" onClick={submit}>
              <Plus className="mr-1.5 h-4 w-4" /> Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ManifestSheet
        open={!!manifest}
        onOpenChange={(o) => !o && setManifest(null)}
        data={manifest ? {
          manifestNo: manifest.manifestNo,
          pickupId: manifest.id,
          requestedBy: manifest.requestedBy,
          courier: manifest.courier,
          rider: manifest.riderName,
          count: manifest.sampleCount,
          samples: manifest.samples,
        } : null}
      />
    </div>
  );
}

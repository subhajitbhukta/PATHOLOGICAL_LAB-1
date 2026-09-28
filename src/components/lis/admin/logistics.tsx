"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChannelPill, DataTable, KeyValue, PageHeader, Panel, StatCard, StatusPill, Timeline } from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { ManifestSheet } from "@/components/lis/report-sheet";
import { couriers, partners, pickups, subAgencies, today } from "@/lib/lis/data";
import { fmtDateTime, maskMobile } from "@/lib/lis/format";
import { Plus, Printer, Truck } from "lucide-react";
import type { Pickup } from "@/lib/lis/types";

const PICKUP_FLOW: Pickup["status"][] = ["Requested", "Assigned", "Picked Up", "In Transit", "Received at Lab"];

export function AdminLogisticsView() {
  const [selected, setSelected] = React.useState<Pickup | null>(null);
  const [manifest, setManifest] = React.useState<Pickup | null>(null);

  // New pickup request dialog state
  const [npOpen, setNpOpen] = React.useState(false);
  const [npCentre, setNpCentre] = React.useState("SUB-001");
  const [npCount, setNpCount] = React.useState("7");
  const [npAddress, setNpAddress] = React.useState("Unit 12, Omkar Complex, Ghatkopar East");
  const [npWindow, setNpWindow] = React.useState("28 Sep, 16:00–17:00");
  const [npCourier, setNpCourier] = React.useState("LabRunners");
  const [npDone, setNpDone] = React.useState(false);

  const requested = pickups.filter((p) => p.status === "Requested").length;
  const assigned = pickups.filter((p) => p.status === "Assigned").length;
  const inTransit = pickups.filter((p) => p.status === "In Transit" || p.status === "Picked Up").length;
  const receivedToday = pickups.filter((p) => p.receivedAt?.startsWith(today)).length;

  const centres = [
    ...partners.map((p) => ({ id: p.id, name: p.name, kind: "B2B Partner" })),
    ...subAgencies.map((s) => ({ id: s.id, name: s.name, kind: `Sub-Agency · ${s.parentName}` })),
  ];
  const npCentreName = centres.find((c) => c.id === npCentre)?.name ?? "—";

  const columns: Column<Pickup>[] = [
    { key: "id", header: "Pickup ID", value: (r) => r.id, render: (r) => <span className="font-mono text-xs font-medium text-teal-800">{r.id}</span> },
    { key: "req", header: "Requested By", value: (r) => r.requestedBy, render: (r) => (
      <div className="flex items-center gap-1.5"><span className="text-sm font-medium">{r.requestedBy}</span><ChannelPill channel={r.requesterType} /></div>
    ) },
    { key: "cnt", header: "Samples", headClassName: "text-right", className: "text-right", value: (r) => r.sampleCount, render: (r) => <span className="font-semibold tabular-nums">{r.sampleCount}</span> },
    { key: "city", header: "City", value: (r) => r.city, render: (r) => <span className="text-xs">{r.city}</span> },
    { key: "win", header: "Pickup Window", value: (r) => r.pickupWindow, render: (r) => <span className="whitespace-nowrap text-xs">{r.pickupWindow}</span> },
    { key: "courier", header: "Courier", value: (r) => r.courier, render: (r) => <span className="text-xs">{r.courier}</span> },
    { key: "rider", header: "Rider", value: (r) => `${r.riderName} ${r.riderMobile}`, render: (r) => (
      <div className="text-xs"><p className="font-medium text-slate-700">{r.riderName}</p><p className="text-muted-foreground">{r.riderMobile === "—" ? "—" : maskMobile(r.riderMobile)}</p></div>
    ) },
    { key: "man", header: "Manifest", value: (r) => r.manifestNo, render: (r) => <span className="font-mono text-xs">{r.manifestNo}</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
  ];

  const timelineFor = (p: Pickup) =>
    PICKUP_FLOW.map((step, i) => ({
      label: step,
      time:
        i === 0
          ? fmtDateTime(p.requestedAt)
          : i === PICKUP_FLOW.length - 1 && p.receivedAt
            ? fmtDateTime(p.receivedAt)
            : undefined,
      note:
        i === 1 && p.courier !== "— Unassigned —"
          ? `Courier assigned: ${p.courier}`
          : i === 2 && p.riderName !== "—"
            ? `Rider: ${p.riderName}`
            : undefined,
    }));

  const openNew = () => {
    setNpDone(false);
    setNpOpen(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Logistics & Pickups"
        subtitle="Doorstep sample movement from partner centres to the central lab, manifest-wise"
        icon={<Truck className="h-5 w-5" />}
        actions={<Button onClick={openNew}><Plus className="mr-1.5 h-4 w-4" /> New Pickup Request</Button>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Requested" value={requested} accent="amber" sublabel="awaiting courier" />
        <StatCard label="Assigned" value={assigned} accent="violet" sublabel="rider allotted" />
        <StatCard label="In Transit" value={inTransit} icon={<Truck className="h-4 w-4" />} sublabel="picked up / moving" />
        <StatCard label="Received Today" value={receivedToday} accent="emerald" sublabel="checked in at lab" />
      </div>

      <Panel>
        <DataTable
          columns={columns}
          rows={pickups}
          pageSize={8}
          searchOf={(r) => `${r.id} ${r.requestedBy} ${r.city} ${r.courier} ${r.riderName} ${r.manifestNo}`}
          searchPlaceholder="Search pickup / partner / manifest…"
          onRowClick={(r) => setSelected(r)}
        />
      </Panel>

      {/* Pickup detail sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
          {selected ? (
            <>
              <SheetHeader className="border-b px-5 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle className="font-mono text-sm">{selected.id}</SheetTitle>
                    <p className="text-xs text-muted-foreground">
                      {selected.requestedBy} · {selected.city} · {selected.sampleCount} samples
                    </p>
                  </div>
                  <StatusPill status={selected.status} />
                </div>
              </SheetHeader>
              <div className="space-y-5 p-5">
                <KeyValue
                  cols={2}
                  items={[
                    { label: "Manifest No", value: <span className="font-mono text-xs">{selected.manifestNo}</span> },
                    { label: "Requested At", value: fmtDateTime(selected.requestedAt) },
                    { label: "Pickup Window", value: selected.pickupWindow },
                    { label: "City", value: selected.city },
                    { label: "Address", value: selected.address },
                    { label: "Courier", value: selected.courier },
                    { label: "Rider", value: `${selected.riderName} · ${selected.riderMobile === "—" ? "—" : maskMobile(selected.riderMobile)}` },
                    { label: "Received At Lab", value: selected.receivedAt ? fmtDateTime(selected.receivedAt) : "—" },
                  ]}
                />

                <Panel title="Samples in Manifest" description={`${selected.sampleCount} tubes carried against ${selected.manifestNo}`}>
                  <div className="grid max-h-48 grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2">
                    {selected.samples.map((s, i) => (
                      <div key={`${s}-${i}`} className="rounded border border-slate-200 px-2 py-1 font-mono text-[11px] text-slate-700">
                        {s}
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Pickup Journey">
                  <Timeline items={timelineFor(selected)} />
                </Panel>

                {selected.exceptions ? (
                  <Alert className="border-rose-200 bg-rose-50 text-rose-800">
                    <AlertTitle>Exception reported</AlertTitle>
                    <AlertDescription>{selected.exceptions}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setManifest(selected)}>
                    <Printer className="mr-1.5 h-4 w-4" /> Print Manifest
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* New pickup request */}
      <Dialog open={npOpen} onOpenChange={setNpOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Pickup Request</DialogTitle>
            <DialogDescription>Raise a sample collection run for a B2B partner or sub-agency centre.</DialogDescription>
          </DialogHeader>
          {npDone ? (
            <div className="space-y-4">
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
                <AlertTitle>Pickup request created</AlertTitle>
                <AlertDescription>
                  PKP-2026-0188 · {npCentreName} · {npCount} samples · window {npWindow} · {npCourier}. Manifest MAN-2026-0344 will be generated on pickup.
                </AlertDescription>
              </Alert>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNpOpen(false)}>Close</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="np-centre">Centre <span className="text-rose-500">*</span></Label>
                <Select value={npCentre} onValueChange={setNpCentre}>
                  <SelectTrigger id="np-centre"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {centres.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} — {c.kind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="np-count">Sample count <span className="text-rose-500">*</span></Label>
                  <Input id="np-count" type="number" min={1} value={npCount} onChange={(e) => setNpCount(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="np-window">Pickup window <span className="text-rose-500">*</span></Label>
                  <Input id="np-window" value={npWindow} onChange={(e) => setNpWindow(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="np-address">Pickup address <span className="text-rose-500">*</span></Label>
                <Input id="np-address" value={npAddress} onChange={(e) => setNpAddress(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="np-courier">Courier</Label>
                <Select value={npCourier} onValueChange={setNpCourier}>
                  <SelectTrigger id="np-courier"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {couriers.filter((c) => c.status === "Active").map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name} · {c.type} · {c.cities}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNpOpen(false)}>Cancel</Button>
                <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => setNpDone(true)}>
                  Create Request
                </Button>
              </DialogFooter>
            </div>
          )}
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
          rider: `${manifest.riderName} · ${manifest.riderMobile}`,
          count: manifest.sampleCount,
          samples: manifest.samples,
        } : null}
      />
    </div>
  );
}

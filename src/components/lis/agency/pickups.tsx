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
import { pickups } from "@/lib/lis/data";
import { fmtDateTime } from "@/lib/lis/format";
import {
  DataTable, Field, FormGrid, KeyValue, PageHeader, Panel, PrintButton, StatusPill, Timeline,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { ManifestDocument } from "@/components/lis/report-sheet";
import { CheckCircle2, Plus, Truck } from "lucide-react";
import type { Pickup } from "@/lib/lis/types";

const AGENCY_NAME = "XYZ Collection Centre";
const AGENCY_ADDRESS = "Unit 12, Omkar Complex, Ghatkopar East, Mumbai";

const WINDOWS = ["07:00 – 08:00", "10:00 – 11:00", "12:00 – 13:00", "15:00 – 16:00", "17:00 – 18:00"];

export function AgencyPickupsView() {
  const [selected, setSelected] = React.useState<Pickup | null>(null);
  const [reqOpen, setReqOpen] = React.useState(false);
  const [reqDone, setReqDone] = React.useState(false);

  const rows = pickups.filter((p) => p.requestedBy === AGENCY_NAME);

  const sel = selected;

  const columns: Column<Pickup>[] = [
    { key: "id", header: "Pickup ID", value: (r) => r.id, render: (r) => (
      <div>
        <p className="font-mono text-xs font-medium text-amber-800">{r.id}</p>
        <p className="text-[11px] text-muted-foreground">{r.manifestNo}</p>
      </div>
    ) },
    { key: "win", header: "Pickup Window", value: (r) => r.pickupWindow, render: (r) => (
      <div className="text-xs"><p className="font-medium text-slate-700">{r.pickupWindow}</p><p className="text-muted-foreground">requested {fmtDateTime(r.requestedAt)}</p></div>
    ) },
    { key: "count", header: "Samples", headClassName: "text-right", className: "text-right", value: (r) => r.sampleCount, render: (r) => <span className="text-sm font-semibold">{r.sampleCount}</span> },
    { key: "courier", header: "Courier / Rider", value: (r) => `${r.courier} ${r.riderName}`, render: (r) => (
      <div className="text-xs"><p className="font-medium text-slate-700">{r.courier}</p><p className="text-muted-foreground">{r.riderName} · {r.riderMobile}</p></div>
    ) },
    { key: "recv", header: "Received At Lab", value: (r) => r.receivedAt ?? "", render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{r.receivedAt ? fmtDateTime(r.receivedAt) : "—"}</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pickup Requests"
        subtitle="Sample logistics from your centre to Apex central lab"
        icon={<Truck className="h-5 w-5" />}
        actions={<Button onClick={() => { setReqDone(false); setReqOpen(true); }}><Plus className="mr-1.5 h-4 w-4" /> Request Pickup</Button>}
      />

      <Panel>
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={10}
          searchOf={(r) => `${r.id} ${r.manifestNo} ${r.courier} ${r.riderName} ${r.status}`}
          searchPlaceholder="Search pickup / rider…"
          onRowClick={(r) => setSelected(r)}
        />
      </Panel>

      {/* Manifest & timeline sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
          {sel ? (
            <>
              <SheetHeader className="border-b px-5 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle className="font-mono text-sm">{sel.id}</SheetTitle>
                    <p className="text-xs text-muted-foreground">Manifest {sel.manifestNo} · {sel.sampleCount} samples · window {sel.pickupWindow}</p>
                  </div>
                  <StatusPill status={sel.status} />
                </div>
              </SheetHeader>
              <div className="space-y-5 p-5">
                <KeyValue
                  cols={2}
                  items={[
                    { label: "Requested By", value: `${sel.requestedBy} (SUB-001)` },
                    { label: "Requested At", value: fmtDateTime(sel.requestedAt) },
                    { label: "Courier", value: sel.courier },
                    { label: "Rider", value: `${sel.riderName} · ${sel.riderMobile}` },
                    { label: "Collection Address", value: sel.address },
                    { label: "Received At Lab", value: sel.receivedAt ? fmtDateTime(sel.receivedAt) : "Pending" },
                  ]}
                />

                <Panel title="Pickup Timeline">
                  <Timeline
                    items={[
                      { label: "Pickup requested", time: fmtDateTime(sel.requestedAt), note: `${sel.sampleCount} samples packed at centre` },
                      { label: `Rider assigned — ${sel.riderName} (${sel.courier})`, time: "28 Sep 2026, 09:05 am" },
                      { label: "Samples picked up", time: "28 Sep 2026, 09:25 am", note: "Manifest signature captured" },
                      { label: "In transit to Andheri hub", time: "28 Sep 2026, 09:30 am" },
                      { label: "Received at Apex central lab", time: sel.receivedAt ? fmtDateTime(sel.receivedAt) : "Pending", note: sel.exceptions },
                    ]}
                  />
                </Panel>

                <Panel title="Manifest Document" description="Signed during handover — retained for 3 years">
                  <ManifestDocument
                    manifestNo={sel.manifestNo} pickupId={sel.id} requestedBy={sel.requestedBy}
                    courier={sel.courier} rider={`${sel.riderName} (${sel.riderMobile})`}
                    count={sel.sampleCount} samples={sel.samples}
                  />
                  <div className="mt-3 flex justify-end"><PrintButton label="Print Manifest" /></div>
                </Panel>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Request pickup dialog */}
      <Dialog open={reqOpen} onOpenChange={setReqOpen}>
        <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Request Sample Pickup</DialogTitle>
            <DialogDescription className="text-xs">LabRunners rider is auto-assigned within 30 minutes; a manifest number is generated on confirmation.</DialogDescription>
          </DialogHeader>
          {reqDone ? (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">Pickup requested</p>
                <p className="text-xs text-emerald-800">
                  PKP-2026-0188 · 4 samples · window 29 Sep, 10:00 – 11:00 am. Rider details will appear on this page once assigned.
                </p>
              </div>
            </div>
          ) : (
            <>
              <FormGrid cols={2}>
                <Field label="Pickup Date" required><Input type="date" defaultValue="2026-09-29" /></Field>
                <Field label="Pickup Window" required>
                  <Select defaultValue={WINDOWS[1]}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{WINDOWS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Sample Count" required hint="Match the tube count on your bench"><Input type="number" defaultValue={4} min={1} /></Field>
                <Field label="Temp Maintenance" hint="2–8°C boxes are provided by Apex">
                  <Select defaultValue="ambient">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="ambient">Ambient</SelectItem><SelectItem value="cold">Cold chain (2–8°C)</SelectItem></SelectContent>
                  </Select>
                </Field>
                <Field label="Collection Address" className="sm:col-span-2"><Input defaultValue={AGENCY_ADDRESS} /></Field>
                <Field label="Remarks" className="sm:col-span-2"><Input defaultValue="Include 2 cold-chain boxes — fever panel samples" /></Field>
              </FormGrid>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setReqOpen(false)}>Cancel</Button>
                <Button onClick={() => setReqDone(true)}><Truck className="mr-1.5 h-4 w-4" /> Request Pickup</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

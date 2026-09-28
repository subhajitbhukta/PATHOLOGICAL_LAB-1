"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { INTERNAL_FLOW, orderAgeSex, samples, today, workflowIndex } from "@/lib/lis/data";
import { fmtDateTime } from "@/lib/lis/format";
import {
  DataTable, KeyValue, PageHeader, Panel, SampleLabelCard, StatCard, StatusPill, WorkflowChain,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { AlertTriangle, RefreshCcw, TestTubes } from "lucide-react";
import type { OrderStatus, Sample } from "@/lib/lis/types";

const STAGE_GROUPS: { label: string; stages: OrderStatus[] }[] = [
  { label: "Collection stage", stages: ["Booking Confirmed", "Sample Collected"] },
  { label: "Transit", stages: ["Pickup Requested", "Picked Up", "In Transit"] },
  { label: "Received", stages: ["Received at Lab", "Sample Accepted", "Assigned to Department", "Test in Progress"] },
  { label: "Processing", stages: ["Result Entered", "Verification Pending", "Pathologist Approved", "Report Generated", "Report Delivered"] },
  { label: "Rejected", stages: ["Sample Rejected", "Recollection Requested"] },
];

const REJECT_REASONS = ["Haemolysed", "Insufficient", "Wrong tube", "Clotted"];
const CONDITIONS: Sample["condition"][] = ["Good", "Damaged", "Leaking", "Insufficient"];

export function AdminSamplesView() {
  const [stage, setStage] = React.useState("All");
  const [selected, setSelected] = React.useState<Sample | null>(null);

  // Rejection / recollection dialog state
  const [rejOpen, setRejOpen] = React.useState(false);
  const [rejSample, setRejSample] = React.useState("SMP-20260925-00870");
  const [rejReason, setRejReason] = React.useState(REJECT_REASONS[0]);
  const [rejRemarks, setRejRemarks] = React.useState("Serum haemolysed on arrival — fresh 3 mL serum required.");
  const [rejRecollect, setRejRecollect] = React.useState(true);
  const [rejDone, setRejDone] = React.useState(false);

  const collectedToday = samples.filter((s) => s.collectedAt?.startsWith(today)).length;
  const inTransit = samples.filter((s) => ["Pickup Requested", "Picked Up", "In Transit"].includes(s.stage)).length;
  const received = samples.filter((s) => Boolean(s.receivedAt)).length;
  const rejected = samples.filter((s) => s.stage === "Sample Rejected").length;
  const recollections = samples.filter((s) => (s.remarks ?? "").toLowerCase().includes("recollection")).length;

  const rows = React.useMemo(
    () => (stage === "All" ? samples : samples.filter((s) => s.stage === stage)),
    [stage],
  );

  const columns: Column<Sample>[] = [
    { key: "bc", header: "Vial Barcode", value: (r) => r.barcode, render: (r) => <span className="font-mono text-xs font-medium text-teal-800">{r.barcode}</span> },
    { key: "id", header: "Sample ID", value: (r) => r.id, render: (r) => <span className="font-mono text-[10px] text-slate-500">{r.id}</span> },
    { key: "order", header: "Order ID", value: (r) => r.orderId, render: (r) => <span className="font-mono text-xs text-slate-600">{r.orderId}</span> },
    { key: "patient", header: "Patient", value: (r) => r.patientName, render: (r) => <span className="text-sm font-medium">{r.patientName}</span> },
    { key: "type", header: "Type / Container", value: (r) => `${r.type} ${r.container}`, render: (r) => (
      <div className="text-xs"><p className="font-medium text-slate-700">{r.type}</p><p className="text-muted-foreground">{r.container}</p></div>
    ) },
    { key: "by", header: "Collected By", value: (r) => r.collectedBy, render: (r) => <span className="text-xs">{r.collectedBy}</span> },
    { key: "source", header: "Source", value: (r) => r.source, render: (r) => <span className="text-xs text-muted-foreground">{r.source || "—"}</span> },
    { key: "stage", header: "Stage", value: (r) => r.stage, render: (r) => <StatusPill status={r.stage} /> },
    { key: "cond", header: "Condition", value: (r) => r.condition, render: (r) => <StatusPill status={r.condition} /> },
  ];

  const openReject = () => {
    setRejDone(false);
    setRejOpen(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sample Management"
        subtitle="Chain-of-custody for every tube — collection, transit, receiving and rejection"
        icon={<TestTubes className="h-5 w-5" />}
        actions={
          <Button variant="outline" onClick={openReject}>
            <RefreshCcw className="mr-1.5 h-4 w-4 text-rose-600" /> Sample Rejection / Recollection
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Collected Today" value={collectedToday} icon={<TestTubes className="h-4 w-4" />} sublabel="all channels" />
        <StatCard label="In Transit" value={inTransit} accent="amber" sublabel="on road to lab" />
        <StatCard label="Received" value={received} accent="violet" sublabel="logged at receiving" />
        <StatCard label="Rejected" value={rejected} accent="rose" sublabel="unfit for testing" />
        <StatCard label="Recollections" value={recollections} accent="emerald" sublabel="fresh draws requested" />
      </div>

      <Panel>
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={10}
          searchOf={(r) => `${r.barcode} ${r.id} ${r.orderId} ${r.patientName} ${r.type} ${r.container} ${r.collectedBy} ${r.source}`}
          searchPlaceholder="Scan / search vial barcode, patient, order…"
          onRowClick={(r) => setSelected(r)}
          filters={
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="h-9 w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All stages</SelectItem>
                {STAGE_GROUPS.map((g) => (
                  <SelectGroup key={g.label}>
                    <SelectLabel>{g.label}</SelectLabel>
                    {g.stages.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          }
        />
      </Panel>

      {/* Chain-of-custody detail sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-2xl">
          {selected ? (
            <>
              <SheetHeader className="border-b px-5 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle className="font-mono text-sm">{selected.barcode}</SheetTitle>
                    <p className="text-xs text-muted-foreground">
                      {selected.id} · {selected.patientName} · {orderAgeSex(selected.orderId)} · {selected.type}
                    </p>
                  </div>
                  <StatusPill status={selected.stage} />
                </div>
              </SheetHeader>
              <div className="space-y-5 p-5">
                <WorkflowChain flow={INTERNAL_FLOW} current={workflowIndex(selected.stage)} />

                {selected.condition === "Damaged" ? (
                  <Alert className="border-rose-200 bg-rose-50 text-rose-800">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Sample damaged — rejected at receiving</AlertTitle>
                    <AlertDescription>{selected.remarks ?? "Recollection requested from source."}</AlertDescription>
                  </Alert>
                ) : null}

                <KeyValue
                  cols={3}
                  items={[
                    { label: "Vial Barcode", value: <span className="font-mono text-xs font-semibold text-teal-800">{selected.barcode}</span> },
                    { label: "Barcode Recorded", value: selected.barcodeBy ?? "Scanned at entry" },
                    { label: "Volume", value: selected.volume },
                    { label: "Collected At", value: fmtDateTime(selected.collectedAt) },
                    { label: "Collected By", value: selected.collectedBy },
                    { label: "Condition", value: <StatusPill status={selected.condition} /> },
                    { label: "Received At", value: selected.receivedAt ? fmtDateTime(selected.receivedAt) : "—" },
                    { label: "Received By", value: selected.receivedBy ?? "—" },
                    { label: "Department", value: selected.department === "—" ? "Not assigned" : selected.department },
                    { label: "Source", value: selected.source || "—" },
                    { label: "Order", value: <span className="font-mono text-xs">{selected.orderId}</span> },
                  ]}
                />

                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tests on this tube</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tests.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                  </div>
                </div>

                <Panel title="Barcode Label Slip" description="Pre-printed vial barcode recorded at entry — reprint as info slip">
                  <SampleLabelCard
                    sampleId={selected.id}
                    barcode={selected.barcode}
                    patientName={selected.patientName}
                    ageSex={orderAgeSex(selected.orderId)}
                    type={selected.type}
                    container={selected.container}
                    tests={selected.tests.join(", ")}
                    collectedAt={fmtDateTime(selected.collectedAt)}
                    source={selected.source}
                  />
                </Panel>

                {selected.remarks ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    <span className="font-semibold">Custody remarks: </span>{selected.remarks}
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Rejection / recollection dialog */}
      <Dialog open={rejOpen} onOpenChange={setRejOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Sample Rejection / Recollection</DialogTitle>
            <DialogDescription>Log an unfit tube and optionally raise a fresh collection request.</DialogDescription>
          </DialogHeader>
          {rejDone ? (
            <div className="space-y-4">
              <Alert className="border-rose-200 bg-rose-50 text-rose-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Rejection logged</AlertTitle>
                <AlertDescription>
                  {rejSample} marked rejected — reason: {rejReason.toLowerCase()}.
                  {rejRecollect ? " Recollection request sent to the source centre." : " No recollection raised."}
                </AlertDescription>
              </Alert>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRejOpen(false)}>Close</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-700">Sample <span className="text-rose-500">*</span></p>
                <Select value={rejSample} onValueChange={setRejSample}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {samples.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.id} — {s.patientName} ({s.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-700">Rejection reason <span className="text-rose-500">*</span></p>
                <Select value={rejReason} onValueChange={setRejReason}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REJECT_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-700">Remarks</p>
                <Textarea value={rejRemarks} onChange={(e) => setRejRemarks(e.target.value)} rows={3} />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50/60 p-3">
                <Checkbox id="recollect" checked={rejRecollect} onCheckedChange={(v) => setRejRecollect(Boolean(v))} />
                <Label htmlFor="recollect" className="text-xs font-medium text-teal-900">
                  Raise recollection request &amp; notify source centre
                </Label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRejOpen(false)}>Cancel</Button>
                <Button className="bg-rose-600 text-white hover:bg-rose-700" onClick={() => setRejDone(true)}>
                  Reject &amp; Log
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

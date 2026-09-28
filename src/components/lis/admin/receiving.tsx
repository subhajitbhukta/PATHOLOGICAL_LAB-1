"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DataTable, PageHeader, Panel, StatCard, StatusPill } from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { fmtTime } from "@/lib/lis/format";
import { patientById, pickups, sampleByBarcode, sampleById, samples, today } from "@/lib/lis/data";
import { CheckCircle2, PackageCheck, ScanLine, XCircle } from "lucide-react";
import type { Sample } from "@/lib/lis/types";

const DEFAULT_SCAN = "8210034585"; // pre-printed vial barcode of the next expected tube
const CONDITIONS: Sample["condition"][] = ["Good", "Damaged", "Leaking", "Insufficient"];

export function AdminReceivingView() {
  const [scanInput, setScanInput] = React.useState("");
  const [scanned, setScanned] = React.useState<string | null>(null);
  const [condition, setCondition] = React.useState<Sample["condition"]>("Good");
  const [remarks, setRemarks] = React.useState("");
  const [banner, setBanner] = React.useState<"ok" | "reject" | null>(null);

  const queue = samples.filter((s) => ["Pickup Requested", "Picked Up", "In Transit"].includes(s.stage));
  const receivedToday = samples.filter((s) => s.receivedAt?.startsWith(today));

  const smp = scanned ? sampleById(scanned) : undefined;
  const patient = smp ? patientById(smp.patientId) : undefined;

  const checks = smp
    ? [
        { label: "Sample exists in manifest", ok: true },
        { label: "Patient record found", ok: Boolean(patient) },
        { label: "Ordered tests available", ok: smp.tests.length > 0 },
        { label: "Correct sample type & container", ok: smp.condition !== "Damaged" },
        { label: "Quantity adequate", ok: smp.condition !== "Insufficient" },
        { label: "Collection time recorded", ok: Boolean(smp.collectedAt) },
        { label: "TAT eligible for today", ok: true },
      ]
    : [];

  const loadId = (id: string) => {
    const s = sampleById(id);
    setScanned(id);
    setCondition(s?.condition ?? "Good");
    setRemarks(s?.remarks ?? "");
    setBanner(null);
  };

  const handleScan = () => {
    const raw = scanInput.trim();
    let id = DEFAULT_SCAN;
    if (raw) {
      // 1) by pre-printed vial barcode (primary — full process is barcode enabled)
      const byBarcode = sampleByBarcode(raw);
      if (byBarcode) {
        id = byBarcode.id;
      } else {
        // 2) fallback: sample ID, or a manifest number that pulls its first tube
        const pk = pickups.find((p) => p.manifestNo.toLowerCase() === raw.toLowerCase());
        const cand = pk ? pk.samples.find((sid) => sampleById(sid)) : raw;
        if (cand && sampleById(cand)) id = cand;
      }
    }
    loadId(id);
  };

  const queueColumns: Column<Sample>[] = [
    { key: "bc", header: "Vial Barcode", value: (r) => r.barcode, render: (r) => <span className="font-mono text-xs font-medium text-teal-800">{r.barcode}</span> },
    { key: "id", header: "Sample ID", value: (r) => r.id, render: (r) => <span className="font-mono text-[10px] text-slate-500">{r.id}</span> },
    { key: "patient", header: "Patient", value: (r) => r.patientName, render: (r) => <span className="text-sm">{r.patientName}</span> },
    { key: "type", header: "Type", value: (r) => r.type, render: (r) => <span className="text-xs text-muted-foreground">{r.type}</span> },
    { key: "src", header: "Source", value: (r) => r.source, render: (r) => <span className="text-xs text-muted-foreground">{r.source || "—"}</span> },
    { key: "stage", header: "Stage", value: (r) => r.stage, render: (r) => <StatusPill status={r.stage} /> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Lab Receiving"
        subtitle="Scan the pre-printed vial barcode, verify against the order, accept or reject"
        icon={<ScanLine className="h-5 w-5" />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="In Receiving Queue" value={queue.length} accent="amber" sublabel="on the way to lab" />
        <StatCard label="Received Today" value={receivedToday.length} accent="emerald" icon={<PackageCheck className="h-4 w-4" />} />
        <StatCard label="Damaged on Arrival" value={samples.filter((s) => s.condition === "Damaged").length} accent="rose" />
        <StatCard label="Recollections Raised" value={samples.filter((s) => (s.remarks ?? "").toLowerCase().includes("recollection")).length} accent="violet" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left — Scan & Verify */}
        <Panel title="Scan & Verify" description="Barcode scan or manual entry — verify checklist before accepting">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              placeholder="Scan vial barcode (e.g. 8210034585) / sample ID / manifest no."
              className="h-11 font-mono text-sm"
            />
            <Button className="h-11 bg-teal-600 px-6 text-white hover:bg-teal-700" onClick={handleScan}>
              <ScanLine className="mr-1.5 h-4 w-4" /> Scan
            </Button>
          </div>

          {banner === "ok" && smp ? (
            <Alert className="mt-4 border-emerald-200 bg-emerald-50 text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Sample accepted</AlertTitle>
              <AlertDescription>
                Vial barcode {smp.barcode} ({smp.id}) logged as received · {smp.tests.length} test(s) pushed to department worklists · Received by Vijay Thorat (Receiving).
              </AlertDescription>
            </Alert>
          ) : null}
          {banner === "reject" && smp ? (
            <Alert className="mt-4 border-rose-200 bg-rose-50 text-rose-800">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Sample rejected</AlertTitle>
              <AlertDescription>
                Vial barcode {smp.barcode} ({smp.id}) marked rejected ({condition.toLowerCase()}) · recollection request raised and source centre notified.
              </AlertDescription>
            </Alert>
          ) : null}

          {smp ? (
            <div className="mt-4 space-y-4 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-sm font-semibold text-teal-800">Vial barcode {smp.barcode}</p>
                  <p className="text-xs text-muted-foreground">
                    {smp.id} · {smp.patientName} · {patient ? `${patient.age}y / ${patient.gender === "Male" ? "M" : "F"}` : "—"} · {smp.type} · {smp.container}
                  </p>
                </div>
                <StatusPill status={smp.stage} />
              </div>

              <ul className="space-y-1.5">
                {checks.map((c) => (
                  <li key={c.label} className="flex items-center gap-2 text-xs">
                    {c.ok ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    )}
                    <span className={c.ok ? "text-slate-700" : "font-medium text-rose-700"}>{c.label}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-1.5">
                <Label>Condition on arrival</Label>
                <RadioGroup value={condition} onValueChange={(v) => setCondition(v as Sample["condition"])} className="flex flex-wrap gap-4">
                  {CONDITIONS.map((c) => (
                    <div key={c} className="flex items-center gap-1.5">
                      <RadioGroupItem value={c} id={`cond-${c.toLowerCase()}`} />
                      <Label htmlFor={`cond-${c.toLowerCase()}`} className="font-normal">{c}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="recv-remarks">Receiving remarks</Label>
                <Input id="recv-remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Any observation at the receiving desk…" />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => setBanner("ok")}
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Accept Sample
                </Button>
                <Button
                  variant="outline"
                  className="border-rose-300 text-rose-700 hover:bg-rose-50"
                  onClick={() => setBanner("reject")}
                >
                  <XCircle className="mr-1.5 h-4 w-4" /> Reject Sample
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-muted-foreground">
              Scan a barcode or click Scan to load the next expected sample for verification.
            </p>
          )}
        </Panel>

        {/* Right — queues */}
        <div className="space-y-4">
          <Panel title="Today&apos;s Receiving Queue" description="Samples in transit or awaiting pickup — click a row to load in scanner">
            <DataTable
              columns={queueColumns}
              rows={queue}
              pageSize={5}
              dense
              searchOf={(r) => `${r.barcode} ${r.id} ${r.patientName} ${r.source}`}
              searchPlaceholder="Search barcode / patient…"
              onRowClick={(r) => {
                setScanInput(r.barcode);
                loadId(r.id);
              }}
            />
          </Panel>

          <Panel title="Received Today" description={`${receivedToday.length} samples checked in by receiving desk`}>
            <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {receivedToday.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-2.5 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-medium text-slate-800">{s.barcode}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {s.patientName} · {s.tests.join(", ")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusPill status={s.condition} />
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{fmtTime(s.receivedAt)} · {s.receivedBy?.split(" (")[0]}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}


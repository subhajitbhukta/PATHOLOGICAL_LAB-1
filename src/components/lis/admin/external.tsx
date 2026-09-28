"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { couriers, externalJobs, orderPatientName, tests } from "@/lib/lis/data";
import { fmtDateTime, inr } from "@/lib/lis/format";
import {
  DataTable, Field, FormGrid, KeyValue, Money, PageHeader, Panel, StatCard, StatusPill, Timeline,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import type { ExternalJob } from "@/lib/lis/types";
import {
  ArrowRight, CircleCheck, FlaskConical, ListChecks, Plus, Send, TrendingUp, Truck,
} from "lucide-react";

const STAGES: ExternalJob["status"][] = [
  "Pending Dispatch", "Dispatched", "In Progress at External Lab", "Result Received", "Report Verified",
];

// Outsourcing menu: prefer test-master data, fall back to names seen on existing jobs
const OUTSOURCE_CODES = ["BRCA", "KARYO", "HLA-B27", "ALLERGY", "PROCALC", "FREE-T3"];
const outsourceOptions = OUTSOURCE_CODES.map((code) => {
  const t = tests.find((x) => x.code === code);
  const j = externalJobs.find((x) => x.testCode === code);
  return {
    code,
    name: t?.name ?? j?.testName ?? code,
    price: t?.b2cPrice ?? j?.billedPrice ?? 0,
    refCost: j?.cost ?? Math.round((t?.b2cPrice ?? 0) * 0.58),
  };
});

const EXTERNAL_LABS = [...new Set(externalJobs.map((j) => j.externalLab))].filter((l) => l !== "—");

function tatDays(s: string): number {
  const m = /(\d+)\s*(days?|hrs?)/i.exec(s);
  if (!m) return 0;
  return m[2].toLowerCase().startsWith("hr") ? Number(m[1]) / 24 : Number(m[1]);
}

function flowBanner() {
  const steps = ["Patient Sample", "Apex Central Lab", "External Reference Lab", "Result Received", "Verified Report"];
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50/60 px-3.5 py-2.5">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-teal-800">Route:</span>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <span className="whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-teal-800 ring-1 ring-teal-200">{s}</span>
          {i < steps.length - 1 ? <ArrowRight className="h-3 w-3 text-teal-500" /> : null}
        </React.Fragment>
      ))}
    </div>
  );
}

export function AdminExternalView() {
  const [jobs, setJobs] = React.useState<ExternalJob[]>(externalJobs);
  const [selected, setSelected] = React.useState<ExternalJob | null>(null);
  const [flash, setFlash] = React.useState<string | null>(null);
  const [newOpen, setNewOpen] = React.useState(false);
  const [njTest, setNjTest] = React.useState("BRCA");
  const [njLab, setNjLab] = React.useState(EXTERNAL_LABS[0] ?? "");
  const [njSample, setNjSample] = React.useState("SMP-20260928-00912");
  const [njCost, setNjCost] = React.useState(String(outsourceOptions[0]?.refCost ?? ""));
  const [njBilled, setNjBilled] = React.useState(String(outsourceOptions[0]?.price ?? ""));
  const [njCourier, setNjCourier] = React.useState(couriers[0]?.name ?? "BlueDart Med Express");
  const [njSeq, setNjSeq] = React.useState(16);

  // KPIs
  const inFlight = jobs.filter((j) => ["Pending Dispatch", "Dispatched", "In Progress at External Lab"].includes(j.status)).length;
  const resultsIn = jobs.filter((j) => ["Result Received", "Report Verified"].includes(j.status)).length;
  const marginTotal = jobs.reduce((a, j) => a + j.margin, 0);
  const avgTat = jobs.reduce((a, j) => a + tatDays(j.expectedTat), 0) / Math.max(1, jobs.length);

  const columns: Column<ExternalJob>[] = [
    { key: "id", header: "Job", value: (r) => r.id, render: (r) => <span className="font-mono text-xs font-medium text-teal-800">{r.id}</span> },
    { key: "lab", header: "External Lab", value: (r) => r.externalLab, render: (r) => <span className="text-xs font-medium text-slate-700">{r.externalLab}</span> },
    { key: "test", header: "Test", value: (r) => r.testName, render: (r) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-800">{r.testName}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{r.testCode}</p>
      </div>
    ) },
    { key: "patient", header: "Patient", value: (r) => r.patientName, render: (r) => <span className="text-sm">{r.patientName}</span> },
    { key: "sample", header: "Sample", value: (r) => r.sampleId, render: (r) => <span className="font-mono text-[11px] text-slate-600">{r.sampleId}</span> },
    { key: "disp", header: "Dispatched", value: (r) => r.dispatchedAt, render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{r.dispatchedAt === "—" ? "—" : fmtDateTime(r.dispatchedAt.replace(" ", "T"))}</span> },
    { key: "tat", header: "Expected TAT", value: (r) => r.expectedTat, render: (r) => <span className="whitespace-nowrap text-xs">{r.expectedTat}</span> },
    { key: "cost", header: "Cost", headClassName: "text-right", className: "text-right", value: (r) => r.cost, render: (r) => <Money value={r.cost} /> },
    { key: "billed", header: "Billed", headClassName: "text-right", className: "text-right", value: (r) => r.billedPrice, render: (r) => <Money value={r.billedPrice} /> },
    { key: "margin", header: "Margin", headClassName: "text-right", className: "text-right", value: (r) => r.margin, render: (r) => <Money value={r.margin} className="font-semibold text-emerald-700" /> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "courier", header: "Courier", value: (r) => r.courier, render: (r) => <span className="text-xs text-muted-foreground">{r.courier}</span> },
  ];

  const openSheet = (j: ExternalJob) => {
    setSelected(j);
    setFlash(null);
  };

  const patchJob = (id: string, patch: Partial<ExternalJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
  };

  const dispatchSample = (j: ExternalJob) => {
    const courier = j.courier === "—" ? njCourier : j.courier;
    patchJob(j.id, { status: "Dispatched", dispatchedAt: "2026-09-28 16:10", courier });
    setFlash(`Sample ${j.sampleId} dispatched to ${j.externalLab} via ${courier}. Tracking has been updated.`);
  };

  const recordResult = (j: ExternalJob) => {
    patchJob(j.id, { status: "Result Received", receivedAt: "2026-09-28 16:12" });
    setFlash(`Result received from ${j.externalLab} for ${j.sampleId}. Routed to pathologist verification.`);
  };

  const createJob = () => {
    const opt = outsourceOptions.find((o) => o.code === njTest);
    const t = tests.find((x) => x.code === njTest);
    const tat = t ? (t.tatHours >= 24 ? `${Math.round(t.tatHours / 24)} days` : `${t.tatHours} hrs`) : "48 hrs";
    const job: ExternalJob = {
      id: `EXT-2026-0${njSeq}`,
      externalLab: njLab,
      testCode: njTest,
      testName: opt?.name ?? njTest,
      sampleId: njSample,
      orderId: "ORD-20260928-00126",
      patientName: orderPatientName("ORD-20260928-00125"),
      dispatchedAt: "—",
      expectedTat: tat,
      cost: Number(njCost) || 0,
      billedPrice: Number(njBilled) || 0,
      margin: (Number(njBilled) || 0) - (Number(njCost) || 0),
      status: "Pending Dispatch",
      courier: "—",
    };
    setJobs([job, ...jobs]);
    setNjSeq(njSeq + 1);
    setNewOpen(false);
  };

  const onTestChange = (code: string) => {
    setNjTest(code);
    const opt = outsourceOptions.find((o) => o.code === code);
    if (opt) {
      setNjCost(String(opt.refCost));
      setNjBilled(String(opt.price));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="External Reference Lab"
        subtitle="Outsourced specialised tests — dispatch, track and verify results from partner labs"
        icon={<FlaskConical className="h-5 w-5" />}
        actions={<Button onClick={() => setNewOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> New Outsourcing Job</Button>}
      />

      {flowBanner()}

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Jobs In Progress" value={inFlight} accent="violet" sublabel="dispatched / at external lab" icon={<Truck className="h-4 w-4" />} />
        <StatCard label="Results Received" value={resultsIn} accent="emerald" sublabel="awaiting or done verification" icon={<ListChecks className="h-4 w-4" />} />
        <StatCard label="Margin Earned" value={inr(marginTotal, { compact: true })} sublabel={`on ${jobs.length} jobs this cycle`} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Avg Turnaround" value={`${avgTat.toFixed(1)} days`} accent="amber" sublabel="external lab TAT (per job)" icon={<CircleCheck className="h-4 w-4" />} />
      </div>

      <Panel description="Click a job for tracking timeline, cost breakdown and dispatch / receipt actions">
        <DataTable
          columns={columns}
          rows={jobs}
          pageSize={8}
          dense
          searchOf={(r) => `${r.id} ${r.externalLab} ${r.testName} ${r.patientName} ${r.sampleId} ${r.status}`}
          searchPlaceholder="Search job / patient / sample…"
          onRowClick={openSheet}
        />
      </Panel>

      {/* Job detail sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-2xl">
          {selected ? (
            <>
              <SheetHeader className="border-b px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <SheetTitle className="font-mono text-sm">{selected.id}</SheetTitle>
                    <p className="truncate text-xs text-muted-foreground">
                      {selected.testName} · {selected.patientName} · {selected.externalLab}
                    </p>
                  </div>
                  <StatusPill status={selected.status} />
                </div>
              </SheetHeader>
              <div className="space-y-5 p-5">
                <Panel title="Tracking" description="Pending Dispatch → Dispatched → In Progress → Result Received → Report Verified">
                  <Timeline
                    items={STAGES.map((s, i) => {
                      const cur = STAGES.indexOf(selected.status);
                      return {
                        label: s,
                        time:
                          i === 0
                            ? "Registered at Apex"
                            : i === 1 && selected.dispatchedAt !== "—"
                              ? fmtDateTime(selected.dispatchedAt.replace(" ", "T"))
                              : i === 3 && selected.receivedAt
                                ? fmtDateTime(selected.receivedAt.replace(" ", "T"))
                                : i <= cur
                                  ? "Completed"
                                  : undefined,
                        note: i === 1 ? (selected.courier !== "—" ? `Courier: ${selected.courier}` : "Awaiting courier assignment") : i === 2 ? selected.externalLab : undefined,
                      };
                    })}
                  />
                </Panel>

                {flash ? (
                  <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
                    <CircleCheck className="h-4 w-4" />
                    <AlertDescription className="text-xs font-medium">{flash}</AlertDescription>
                  </Alert>
                ) : null}

                <Panel title="Cost & Commercial Summary">
                  <KeyValue
                    cols={3}
                    items={[
                      { label: "External Cost", value: <Money value={selected.cost} /> },
                      { label: "Billed to Patient", value: <Money value={selected.billedPrice} /> },
                      { label: "Margin", value: <Money value={selected.margin} className="font-semibold text-emerald-700" /> },
                      { label: "Margin %", value: `${Math.round((selected.margin / Math.max(1, selected.billedPrice)) * 100)}%` },
                      { label: "Expected TAT", value: selected.expectedTat },
                      { label: "Courier", value: selected.courier },
                      { label: "Order Ref", value: selected.orderId },
                      { label: "Sample ID", value: <span className="font-mono text-xs">{selected.sampleId}</span> },
                      { label: "Patient", value: selected.patientName },
                    ]}
                  />
                </Panel>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    disabled={selected.status !== "Pending Dispatch"}
                    onClick={() => dispatchSample(selected)}
                  >
                    <Send className="mr-1.5 h-3.5 w-3.5" /> Dispatch Sample
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!["Dispatched", "In Progress at External Lab"].includes(selected.status)}
                    onClick={() => recordResult(selected)}
                  >
                    <ListChecks className="mr-1.5 h-3.5 w-3.5" /> Record Result Receipt
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* New outsourcing job dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">New Outsourcing Job</DialogTitle>
            <DialogDescription className="text-xs">Route a specialised test to an external reference lab — cost and margin are tracked per job.</DialogDescription>
          </DialogHeader>
          <FormGrid cols={2}>
            <Field label="Test" required className="sm:col-span-2">
              <Select value={njTest} onValueChange={onTestChange}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {outsourceOptions.map((o) => (
                    <SelectItem key={o.code} value={o.code}>{o.name} ({o.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="External Lab" required className="sm:col-span-2">
              <Select value={njLab} onValueChange={setNjLab}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{EXTERNAL_LABS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Sample ID" required className="sm:col-span-2">
              <Input className="h-9 font-mono" value={njSample} onChange={(e) => setNjSample(e.target.value)} />
            </Field>
            <Field label="External Cost (₹)" required>
              <Input className="h-9" value={njCost} onChange={(e) => setNjCost(e.target.value)} inputMode="decimal" />
            </Field>
            <Field label="Billed Price (₹)" required hint="Patient / partner price for this test">
              <Input className="h-9" value={njBilled} onChange={(e) => setNjBilled(e.target.value)} inputMode="decimal" />
            </Field>
            <Field label="Courier" required className="sm:col-span-2">
              <Select value={njCourier} onValueChange={setNjCourier}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{couriers.map((c) => <SelectItem key={c.id} value={c.name}>{c.name} · {c.type}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </FormGrid>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            Expected margin: <span className="font-semibold tabular-nums text-emerald-700">{inr((Number(njBilled) || 0) - (Number(njCost) || 0))}</span> ·
            {" "}({Math.round(((Number(njBilled) || 0) - (Number(njCost) || 0)) / Math.max(1, Number(njBilled) || 1) * 100)}% of billed price)
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={createJob}><Plus className="mr-1.5 h-3.5 w-3.5" /> Create Job</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

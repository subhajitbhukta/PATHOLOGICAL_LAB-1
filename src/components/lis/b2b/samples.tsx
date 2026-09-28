"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  orderAgeSex, orders, partners, samples,
} from "@/lib/lis/data";
import { fmtDateTime } from "@/lib/lis/format";
import {
  DataTable, PageHeader, Panel, PrintButton, SampleLabelCard, StatCard, StatusPill,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import type { Sample } from "@/lib/lis/types";
import { FlaskConical, TestTubes, Truck } from "lucide-react";

// ============================================================
// B2B Samples & Barcodes — labels for all samples of ABC Diagnostics
// ============================================================

const PARTNER_ID = "B2B-001";
const partner = partners.find((p) => p.id === PARTNER_ID) ?? partners[0];
const partnerOrderIds = orders.filter((o) => o.partnerId === PARTNER_ID).map((o) => o.id);
const mySamples = samples.filter((s) => partnerOrderIds.includes(s.orderId));
const STAGES = ["All", "In Transit", "Sample Accepted", "Test in Progress", "Result Entered", "Verification Pending", "Report Generated", "Report Delivered"];

export function B2bSamplesView() {
  const [stage, setStage] = React.useState("All");

  const rows = mySamples.filter((s) => stage === "All" || s.stage === stage);
  const atLab = mySamples.filter((s) => Boolean(s.receivedAt)).length;
  const onRoad = mySamples.filter((s) => ["Pickup Requested", "Picked Up", "In Transit"].includes(s.stage)).length;

  const columns: Column<Sample>[] = [
    {
      key: "id", header: "Sample ID", value: (r) => r.id,
      render: (r) => <span className="font-mono text-xs font-medium text-violet-800">{r.id}</span>,
    },
    {
      key: "order", header: "Order", value: (r) => r.orderId,
      render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.orderId}</span>,
    },
    {
      key: "patient", header: "Patient", value: (r) => r.patientName,
      render: (r) => (
        <div>
          <p className="text-sm font-medium">{r.patientName}</p>
          <p className="text-[11px] text-muted-foreground">{orderAgeSex(r.orderId)}</p>
        </div>
      ),
    },
    {
      key: "type", header: "Type / Container", value: (r) => r.type,
      render: (r) => (
        <div className="text-xs">
          <p className="font-medium">{r.type}</p>
          <p className="text-muted-foreground">{r.container} · {r.volume}</p>
        </div>
      ),
    },
    { key: "tests", header: "Tests", value: (r) => r.tests.join(", "), render: (r) => <span className="text-xs">{r.tests.join(", ")}</span> },
    {
      key: "collected", header: "Collected", value: (r) => r.collectedAt,
      render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDateTime(r.collectedAt)}</span>,
    },
    { key: "stage", header: "Stage", value: (r) => r.stage, render: (r) => <StatusPill status={r.stage} /> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Samples & Barcodes"
        subtitle={`Vial barcodes recorded for samples booked under ${partner.name} — reprint label slips anytime`}
        actions={<PrintButton label="Print All Slips" />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Samples" value={mySamples.length} icon={<TestTubes className="h-4 w-4" />} accent="violet" sublabel="all time (30 days)" />
        <StatCard label="Collected Today" value={mySamples.filter((s) => s.collectedAt.startsWith("2026-09-28")).length} icon={<FlaskConical className="h-4 w-4" />} accent="teal" />
        <StatCard label="At Apex Lab" value={atLab} icon={<FlaskConical className="h-4 w-4" />} accent="emerald" sublabel="received & in process" />
        <StatCard label="On Road" value={onRoad} icon={<Truck className="h-4 w-4" />} accent="amber" sublabel="pickup / in transit" />
      </div>

      <Panel title="Recorded Vial Barcode Slips" description={`${mySamples.length} slips · pre-printed barcode scanned at entry · 50×25 mm label stock`}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {mySamples.map((s) => (
            <SampleLabelCard
              key={s.id} sampleId={s.id} barcode={s.barcode} patientName={s.patientName}
              ageSex={orderAgeSex(s.orderId)} type={s.type} container={s.container}
              tests={s.tests.join(", ")} collectedAt={fmtDateTime(s.collectedAt)} source={s.source}
            />
          ))}
        </div>
      </Panel>

      <Panel title="Sample Register" description="Every sample booked under your account with live stage">
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={10}
          searchOf={(r) => `${r.barcode} ${r.id} ${r.orderId} ${r.patientName} ${r.type} ${r.tests.join(" ")}`}
          searchPlaceholder="Search vial barcode / patient / order…"
          filters={
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="h-9 w-52"><SelectValue /></SelectTrigger>
              <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s}>{s === "All" ? "All stages" : s}</SelectItem>)}</SelectContent>
            </Select>
          }
        />
      </Panel>
    </div>
  );
}

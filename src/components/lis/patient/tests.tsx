"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLisNav } from "@/components/lis/nav";
import {
  orders, patientById, patientStageIndex, reportsForOrder, samplesForOrder,
  workflowIndex, INTERNAL_FLOW,
} from "@/lib/lis/data";
import { fmtDateTime } from "@/lib/lis/format";
import {
  EmptyState, KeyValue, Money, PageHeader, Panel, PatientSteps, SampleLabelCard, StatusPill,
  WorkflowChain,
} from "@/components/lis/widgets";
import { ReportDialog, toReportView } from "@/components/lis/report-sheet";
import type { ReportViewData } from "@/components/lis/report-sheet";
import { Eye, FileText, FlaskConical, Home, Info } from "lucide-react";
import type { Order } from "@/lib/lis/types";

const PATIENT_ID = "PAT-00124";
const me = patientById(PATIENT_ID);

const myOrders = orders
  .filter((o) => o.patientId === PATIENT_ID)
  .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

const sampleIdOf = (o: Order): string => {
  const s = samplesForOrder(o.id)[0];
  return s ? s.id : reportsForOrder(o.id)[0]?.sampleId ?? "—";
};

export function PatientTestsView() {
  const { go } = useLisNav();
  const [selected, setSelected] = React.useState<Order | null>(null);
  const [report, setReport] = React.useState<ReportViewData | null>(null);

  const selReports = selected ? reportsForOrder(selected.id) : [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Tests"
        subtitle="Every test you have booked with Apex — tracked in simple steps"
        icon={<FlaskConical className="h-5 w-5" />}
        actions={<Button onClick={() => go("patient/book")}>Book a New Test</Button>}
      />

      <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p>We keep it simple — you see 5 friendly steps. The lab works through 14 detailed stages behind the scenes.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {myOrders.map((o) => (
          <Panel key={o.id} className="p-1">
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{o.id}</p>
                  <p className="mt-0.5 text-base font-semibold text-slate-900">{o.items.map((i) => i.name).join(", ")}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Booked {fmtDateTime(o.createdAt)} · TAT by {fmtDateTime(o.tatDue)}</p>
                </div>
                <StatusPill status={o.status} />
              </div>

              <PatientSteps current={patientStageIndex(o.status)} />

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline" className="font-mono text-[10px]">Sample {sampleIdOf(o)}</Badge>
                {o.homeCollection ? (
                  <Badge variant="outline" className="gap-1 text-[10px]"><Home className="h-3 w-3 text-emerald-600" /> Home collection</Badge>
                ) : null}
                <Money value={o.net} className="text-xs" />
                <span className="text-muted-foreground">· {o.payStatus}</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelected(o)}>
                  <Eye className="mr-1 h-3.5 w-3.5" /> Details
                </Button>
                {o.status === "Report Delivered" ? (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const r = reportsForOrder(o.id)[0];
                      if (r) setReport(toReportView(r, me?.name ?? "", me ? `${me.age}y / ${me.gender === "Male" ? "M" : "F"}` : ""));
                    }}
                  >
                    <FileText className="mr-1 h-3.5 w-3.5" /> View Report
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className="flex-1" disabled>
                    Report in progress
                  </Button>
                )}
              </div>
            </div>
          </Panel>
        ))}
      </div>

      {/* Details sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
          {selected ? (
            <>
              <SheetHeader className="border-b px-5 py-3">
                <SheetTitle className="font-mono text-sm">{selected.id}</SheetTitle>
                <p className="text-xs text-muted-foreground">
                  {selected.items.map((i) => i.name).join(", ")} · booked {fmtDateTime(selected.createdAt)}
                </p>
              </SheetHeader>
              <div className="space-y-5 p-5">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Where your sample is</p>
                  <WorkflowChain flow={INTERNAL_FLOW} current={workflowIndex(selected.status)} />
                  <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-muted-foreground">
                    Internal lab stages are simplified for you — the 14 stages above are how the lab tracks your sample.
                  </p>
                </div>

                <KeyValue
                  cols={2}
                  items={[
                    { label: "Status", value: <StatusPill status={selected.status} /> },
                    { label: "Report Expected By", value: fmtDateTime(selected.tatDue) },
                    { label: "Sample ID", value: sampleIdOf(selected) },
                    { label: "Collected At", value: selected.collectedAt ? fmtDateTime(selected.collectedAt) : "—" },
                    { label: "Amount", value: <Money value={selected.net} /> },
                    { label: "Payment", value: `${selected.paymentMode} · ${selected.payStatus}` },
                  ]}
                />

                <Panel title="Sample Labels">
                  {samplesForOrder(selected.id).length === 0 ? (
                    <EmptyState title="Sample label appears after collection" />
                  ) : (
                    <div className="grid gap-3">
                      {samplesForOrder(selected.id).map((s) => (
                        <SampleLabelCard
                          key={s.id} sampleId={s.id} barcode={s.barcode} patientName={s.patientName}
                          ageSex={me ? `${me.age}y / ${me.gender === "Male" ? "M" : "F"}` : ""}
                          type={s.type} container={s.container}
                          tests={s.tests.join(", ")} collectedAt={fmtDateTime(s.collectedAt)} source="B2C Direct"
                        />
                      ))}
                    </div>
                  )}
                </Panel>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <ReportDialog open={!!report} onOpenChange={(o) => !o && setReport(null)} data={report} />
    </div>
  );
}

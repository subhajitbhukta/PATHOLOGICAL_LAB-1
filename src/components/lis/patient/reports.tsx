"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useLisNav } from "@/components/lis/nav";
import {
  orders, reports, patientById, patientStageIndex,
} from "@/lib/lis/data";
import { fmtDate, fmtDateTime } from "@/lib/lis/format";
import {
  DataTable, PageHeader, Panel, PatientSteps, StatusPill,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { ReportDialog, toReportView } from "@/components/lis/report-sheet";
import type { ReportViewData } from "@/components/lis/report-sheet";
import { FileDown, QrCode, ShieldCheck, Timer } from "lucide-react";

const PATIENT_ID = "PAT-00124";
const me = patientById(PATIENT_ID);

const myReports = reports.filter((r) => r.patientId === PATIENT_ID);
const activeOrder = orders.find((o) => o.patientId === PATIENT_ID && o.status !== "Report Delivered");

export function PatientReportsView() {
  const { go } = useLisNav();
  const [report, setReport] = React.useState<ReportViewData | null>(null);

  const openReport = (r: (typeof reports)[number]) => {
    setReport(toReportView(r, me?.name ?? "", me ? `${me.age}y / ${me.gender === "Male" ? "M" : "F"}` : ""));
  };

  const columns: Column<(typeof reports)[number]>[] = [
    { key: "id", header: "Report", value: (r) => r.id, render: (r) => (
      <div>
        <p className="font-mono text-xs font-medium text-emerald-800">{r.id}</p>
        <p className="text-[11px] text-muted-foreground">{r.department}</p>
      </div>
    ) },
    { key: "tests", header: "Tests", value: (r) => r.tests.join(", "), render: (r) => (
      <div>
        <p className="text-sm font-medium text-slate-800">{r.tests.join(", ")}</p>
        <p className="text-[11px] text-muted-foreground">Dr. {r.pathologist.replace("Dr. ", "")}</p>
      </div>
    ) },
    { key: "date", header: "Reported On", value: (r) => r.reportedAt, render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDateTime(r.reportedAt)}</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "act", header: "", render: (r) => (
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="sm" className="h-8" onClick={(e) => { e.stopPropagation(); openReport(r); }}>
          View
        </Button>
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={(e) => e.stopPropagation()}>
          <FileDown className="h-3.5 w-3.5" /> Download PDF
        </Button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Reports"
        subtitle="Verified reports — view online or download the PDF"
        icon={<ShieldCheck className="h-5 w-5" />}
        actions={<Button variant="outline" onClick={() => go("patient/tests")}>Track Tests</Button>}
      />

      {/* In-progress strip */}
      {activeOrder ? (
        <Panel title="Coming Up" description="Your sample is being tested right now">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">{activeOrder.items.map((i) => i.name).join(" · ")}</p>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Timer className="h-3.5 w-3.5 text-emerald-600" /> expected by {fmtDateTime(activeOrder.tatDue)}
              </span>
            </div>
            <PatientSteps current={patientStageIndex(activeOrder.status)} />
          </div>
        </Panel>
      ) : null}

      <Panel description="Reports released by the pathologist are listed here">
        <DataTable
          columns={columns}
          rows={myReports}
          pageSize={10}
          searchOf={(r) => `${r.id} ${r.tests.join(" ")} ${r.status}`}
          searchPlaceholder="Search report…"
          onRowClick={openReport}
        />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Verify Any Report — QR Explainer">
          <div className="flex items-start gap-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2">
              <QrCode className="h-12 w-12 text-emerald-700" />
            </div>
            <div className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              <p className="text-sm font-medium text-slate-800">How QR verification works</p>
              <p>Every Apex report footer carries a unique QR code tied to a verification token (e.g. APX-VER-06BV3L5M).</p>
              <p>Anyone — you or your doctor — can scan it to confirm the report is genuine and unaltered, straight from the Apex registry.</p>
              <p className="text-emerald-700">No app needed · works with any phone camera.</p>
            </div>
          </div>
        </Panel>

        <Panel title="Sharing & Downloads">
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><FileDown className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Downloaded PDFs stay valid — they embed the QR and pathologist signature.</li>
            <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Reports are digitally signed by a consultant pathologist before release.</li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-4 w-4 shrink-0" />
              Last released: {fmtDate(myReports[0]?.reportedAt)} · delivered via {myReports[0]?.deliveredVia}.
            </li>
          </ul>
        </Panel>
      </div>

      <ReportDialog open={!!report} onOpenChange={(o) => !o && setReport(null)} data={report} />
    </div>
  );
}

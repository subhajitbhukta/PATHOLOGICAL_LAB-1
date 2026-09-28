"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useLisNav } from "@/components/lis/nav";
import {
  ordersForSubAgency, verificationTasks, externalJobs, patientById,
} from "@/lib/lis/data";
import { fmtDate } from "@/lib/lis/format";
import {
  DataTable, PageHeader, Panel, StatusPill,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { ReportDialog, toReportView } from "@/components/lis/report-sheet";
import type { ReportViewData } from "@/components/lis/report-sheet";
import type { ReportBackground } from "@/lib/lis/types";
import { Eye, FileDown, FileText, Info, QrCode } from "lucide-react";

const AGENCY_ID = "SUB-001";
const AGENCY_NAME = "XYZ Collection Centre";

interface AgencyReportRow {
  key: string;
  reportId: string;
  orderId: string;
  sampleId: string;
  patientId: string;
  patient: string;
  tests: string;
  department: string;
  status: string;
  updatedAt: string;
  viewable: boolean;
}

const agencyOrders = ordersForSubAgency(AGENCY_ID);
const agencyOrderIds = new Set(agencyOrders.map((o) => o.id));
const patientOfOrder = (orderId: string): string =>
  agencyOrders.find((o) => o.id === orderId)?.patientId ?? "";

const rows: AgencyReportRow[] = [
  ...verificationTasks
    .filter((v) => agencyOrderIds.has(v.orderId))
    .map((v) => ({
      key: v.reportId,
      reportId: v.reportId,
      orderId: v.orderId,
      sampleId: v.sampleId,
      patientId: patientOfOrder(v.orderId),
      patient: v.patientName,
      tests: v.tests,
      department: v.department,
      status: v.status,
      updatedAt: v.enteredAt,
      viewable: true,
    })),
  ...externalJobs
    .filter((e) => agencyOrderIds.has(e.orderId))
    .map((e) => ({
      key: e.id,
      reportId: "— (at external lab)",
      orderId: e.orderId,
      sampleId: e.sampleId,
      patientId: patientOfOrder(e.orderId),
      patient: e.patientName,
      tests: e.testName,
      department: "Molecular Biology",
      status: e.status,
      updatedAt: e.dispatchedAt,
      viewable: false,
    })),
];

export function AgencyReportsView() {
  const { go } = useLisNav();
  const [report, setReport] = React.useState<ReportViewData | null>(null);

  const openReport = (r: AgencyReportRow, background: ReportBackground = "With Background") => {
    const p = patientById(r.patientId);
    setReport(
      toReportView(
        {
          id: r.reportId, orderId: r.orderId, sampleId: r.sampleId, patientId: r.patientId,
          status: "Draft",
          pathologist: r.department === "Molecular Biology" ? "Dr. Sanjay Mukherjee" : "Dr. Vikram Rao",
          pathologistQual: r.department === "Molecular Biology" ? "MD (Microbiology)" : "MD (Biochemistry), DNB",
          collectedAt: "2026-09-28 08:30", receivedAt: "2026-09-28 09:50", reportedAt: "2026-09-28 20:00",
          releasedAt: "2026-09-28 20:00",
          comments: `Draft preview for ${AGENCY_NAME} — final release pending pathologist approval at Apex central lab.`,
          qrToken: `APX-VER-${r.reportId.slice(-8)}`,
          source: `${AGENCY_NAME} (via ABC Diagnostics)`,
          background,
        },
        p?.name ?? r.patient,
        p ? `${p.age}y / ${p.gender === "Male" ? "M" : "F"}` : "31y / F",
      ),
    );
  };

  const changeFormat = (v: ReportBackground) =>
    setReport((cur) => (cur ? { ...cur, background: v } : cur));

  const columns: Column<AgencyReportRow>[] = [
    { key: "id", header: "Report ID", value: (r) => r.reportId, render: (r) => <span className="font-mono text-xs font-medium text-amber-800">{r.reportId}</span> },
    { key: "patient", header: "Patient", value: (r) => r.patient, render: (r) => (
      <div>
        <p className="text-sm font-medium">{r.patient}</p>
        <p className="font-mono text-[11px] text-muted-foreground">{r.orderId}</p>
      </div>
    ) },
    { key: "tests", header: "Tests", value: (r) => r.tests, render: (r) => <span className="text-xs">{r.tests}</span> },
    { key: "dept", header: "Department", value: (r) => r.department, render: (r) => <span className="text-xs text-muted-foreground">{r.department}</span> },
    { key: "upd", header: "Last Update", value: (r) => r.updatedAt, render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{r.updatedAt === "—" ? "—" : fmtDate(r.updatedAt)}</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "act", header: "", render: (r) => (
      <div className="flex items-center gap-1">
        {r.viewable ? (
          <Button variant="outline" size="sm" className="h-7" onClick={(e) => { e.stopPropagation(); openReport(r); }}>
            <Eye className="mr-1 h-3 w-3" /> View
          </Button>
        ) : null}
        <Button variant="ghost" size="icon" className="h-7 w-7" title="Download PDF" disabled={!r.viewable} onClick={(e) => e.stopPropagation()}>
          <FileDown className="h-3.5 w-3.5" />
        </Button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        subtitle={`Reports for orders routed through ${AGENCY_NAME}`}
        icon={<FileText className="h-5 w-5" />}
        actions={<Button variant="outline" onClick={() => go("agency/orders")}>View Orders</Button>}
      />

      <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p>
          Only reports of patients registered by your agency are visible. Reports remain in this list after delivery.
          As a Sub-Agency you can preview every report <span className="font-semibold">With Background</span> (ranges +
          interpretation) or <span className="font-semibold">Without Background</span> (compact) — switch inside the preview.
        </p>
      </div>

      <Panel>
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={10}
          searchOf={(r) => `${r.reportId} ${r.patient} ${r.tests} ${r.orderId} ${r.status}`}
          searchPlaceholder="Search report / patient / test…"
        />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="QR-Verified Reports" description="Every Apex report carries a scan-able authenticity QR" className="lg:col-span-1">
          <div className="flex items-start gap-4">
            <QrCode className="mt-1 h-10 w-10 text-amber-600" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Patients or referring doctors can scan the QR on any report to verify it against the Apex registry.
              Share PDFs over WhatsApp or email directly from this page once released.
            </p>
          </div>
        </Panel>
        <Panel title="How Delivery Works" className="lg:col-span-2">
          <ol className="list-inside list-decimal space-y-1.5 text-xs text-muted-foreground">
            <li>Apex central lab enters results and the pathologist approves the report.</li>
            <li>Draft previews appear here with status <span className="font-semibold text-amber-700">Pending Verification</span>.</li>
            <li>Once approved, the released PDF is available for download and auto-shared with the patient.</li>
            <li>External-lab jobs (e.g. BRCA NGS at Metropolis) appear here with their outsourced status.</li>
          </ol>
        </Panel>
      </div>

      <ReportDialog open={!!report} onOpenChange={(o) => !o && setReport(null)} data={report} onFormatChange={changeFormat} />
    </div>
  );
}

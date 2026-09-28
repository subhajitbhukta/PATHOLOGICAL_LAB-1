"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useLisNav } from "@/components/lis/nav";
import { orderAgeSex, orderPatientName, partners, reportsForPartner } from "@/lib/lis/data";
import { fmtDateTime } from "@/lib/lis/format";
import {
  DataTable, PageHeader, Panel, StatCard, StatusPill,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { ReportDialog, ReportShareActions, toReportView } from "@/components/lis/report-sheet";
import type { ReportViewData } from "@/components/lis/report-sheet";
import type { LabReport } from "@/lib/lis/types";
import { Eye, FileText, Send, ShieldCheck } from "lucide-react";

// ============================================================
// B2B Report Download — auto-published approved reports
// ============================================================

const PARTNER_ID = "B2B-001";
const partner = partners.find((p) => p.id === PARTNER_ID) ?? partners[0];
const myReports = reportsForPartner(PARTNER_ID);
const delivered = myReports.filter((r) => r.status === "Delivered").length;
const approved = myReports.filter((r) => r.status === "Approved").length;

export function B2bReportsView() {
  const { go } = useLisNav();
  const [report, setReport] = React.useState<ReportViewData | null>(null);

  const open = (r: LabReport) => {
    setReport(toReportView(r, orderPatientName(r.orderId), orderAgeSex(r.orderId)));
  };

  const columns: Column<LabReport>[] = [
    {
      key: "id", header: "Report ID", value: (r) => r.id,
      render: (r) => <span className="font-mono text-xs font-medium text-violet-800">{r.id}</span>,
    },
    {
      key: "patient", header: "Patient", value: (r) => orderPatientName(r.orderId),
      render: (r) => (
        <div>
          <p className="text-sm font-medium">{orderPatientName(r.orderId)}</p>
          <p className="text-[11px] text-muted-foreground">{orderAgeSex(r.orderId)} · {r.source}</p>
        </div>
      ),
    },
    { key: "tests", header: "Tests", value: (r) => r.tests.join(", "), render: (r) => <span className="text-xs">{r.tests.join(", ")}</span> },
    {
      key: "released", header: "Released At", value: (r) => r.releasedAt,
      render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDateTime(r.releasedAt)}</span>,
    },
    { key: "via", header: "Delivered Via", value: (r) => r.deliveredVia, render: (r) => <span className="text-xs">{r.deliveredVia}</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    {
      key: "act", header: "Actions",
      render: (r) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" className="h-7" onClick={() => open(r)}>
            <Eye className="mr-1 h-3 w-3" /> View
          </Button>
          <ReportShareActions compact />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Report Download"
        subtitle={`Lab reports for ${partner.name} orders — QR-verified, pathologist signed`}
      />

      <div className="flex items-start gap-2.5 rounded-lg border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
        <div>
          <p className="font-semibold">Auto-publication is ON</p>
          <p className="text-xs leading-relaxed">
            Reports approved by Apex pathologists are auto-published to this portal the moment they are signed —
            no manual follow-up needed. Every PDF carries a QR code your patients can verify at verify.apexlabs.in.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Reports Available" value={myReports.length} icon={<FileText className="h-4 w-4" />} accent="violet" sublabel="last 30 days" />
        <StatCard label="Delivered" value={delivered} icon={<Send className="h-4 w-4" />} accent="emerald" sublabel="downloaded / shared" />
        <StatCard label="Approved — Awaiting Pickup" value={approved} icon={<FileText className="h-4 w-4" />} accent="amber" sublabel="ready to download" />
        <StatCard label="Avg TAT" value="18.4 hrs" icon={<ShieldCheck className="h-4 w-4" />} accent="teal" sublabel="collection → release" />
      </div>

      <Panel title="Report Registry" description="Open, print or share — WhatsApp / email delivery uses patient mobile on file">
        <DataTable
          columns={columns}
          rows={myReports}
          pageSize={10}
          searchOf={(r) => `${r.id} ${orderPatientName(r.orderId)} ${r.tests.join(" ")} ${r.status}`}
          searchPlaceholder="Search report / patient / test…"
          onRowClick={(r) => open(r)}
        />
      </Panel>

      <ReportDialog open={!!report} onOpenChange={(o) => !o && setReport(null)} data={report} />

      <p className="text-center text-xs text-muted-foreground">
        Need older reports? Contact your Apex account manager or view the full history in{" "}
        <button className="font-medium text-violet-700 underline" onClick={() => go("b2b/orders")}>Orders</button>.
      </p>
    </div>
  );
}

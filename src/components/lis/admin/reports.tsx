"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DataTable, PageHeader, Panel, QR, StatCard, StatusPill } from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { ReportDialog, ReportShareActions, toReportView } from "@/components/lis/report-sheet";
import type { ReportViewData } from "@/components/lis/report-sheet";
import { fmtDateTime } from "@/lib/lis/format";
import { departments, orderAgeSex, orderPatientName, reports } from "@/lib/lis/data";
import { FileText, QrCode, Share2 } from "lucide-react";
import type { LabReport } from "@/lib/lis/types";

const VIA_LABELS: Record<string, string> = {
  "Portal": "Patient Portal",
  "Email": "Email",
  "WhatsApp": "WhatsApp",
  "B2B Portal": "B2B Partner Portal",
  "—": "Not yet delivered",
};

export function AdminReportsView() {
  const [status, setStatus] = React.useState("All");
  const [dept, setDept] = React.useState("All");
  const [via, setVia] = React.useState("All");
  const [report, setReport] = React.useState<ReportViewData | null>(null);

  const viaOptions = React.useMemo(
    () => Array.from(new Set(reports.map((r) => r.deliveredVia))),
    [],
  );
  const deptOptions = React.useMemo(
    () => Array.from(new Set(reports.map((r) => r.department))),
    [],
  );

  const rows = reports.filter(
    (r) =>
      (status === "All" || r.status === status) &&
      (dept === "All" || r.department === dept) &&
      (via === "All" || r.deliveredVia === via),
  );

  const openView = (r: LabReport) =>
    setReport(toReportView(r, orderPatientName(r.orderId), orderAgeSex(r.orderId)));

  const columns: Column<LabReport>[] = [
    { key: "id", header: "Report ID", value: (r) => r.id, render: (r) => <span className="font-mono text-xs font-medium text-teal-800">{r.id}</span> },
    { key: "order", header: "Order ID", value: (r) => r.orderId, render: (r) => <span className="font-mono text-xs text-slate-600">{r.orderId}</span> },
    { key: "patient", header: "Patient", value: (r) => orderPatientName(r.orderId), render: (r) => (
      <div className="text-xs"><p className="text-sm font-medium">{orderPatientName(r.orderId)}</p><p className="text-muted-foreground">{orderAgeSex(r.orderId)} · {r.source}</p></div>
    ) },
    { key: "tests", header: "Tests", value: (r) => r.tests.join(", "), render: (r) => <span className="text-xs font-medium text-slate-700">{r.tests.join(", ")}</span> },
    { key: "dept", header: "Department", value: (r) => r.department, render: (r) => <span className="text-xs text-muted-foreground">{r.department}</span> },
    { key: "path", header: "Pathologist", value: (r) => r.pathologist, render: (r) => <span className="text-xs">{r.pathologist}</span> },
    { key: "rel", header: "Released", value: (r) => r.releasedAt, render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDateTime(r.releasedAt)}</span> },
    { key: "via", header: "Delivered Via", value: (r) => r.deliveredVia, render: (r) => (
      <Badge variant="outline" className="text-[10px]">{VIA_LABELS[r.deliveredVia] ?? r.deliveredVia}</Badge>
    ) },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "act", header: "", render: (r) => (
      <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
        <Button variant="outline" size="sm" className="h-7" onClick={() => openView(r)}>View</Button>
        <ReportShareActions compact />
      </div>
    ) },
  ];

  const deliveredCount = reports.filter((r) => r.status === "Delivered").length;
  const approvedCount = reports.filter((r) => r.status === "Approved").length;
  const pendingCount = reports.filter((r) => r.status === "Pending Verification" || r.status === "Draft").length;
  const b2bCount = reports.filter((r) => r.deliveredVia === "B2B Portal").length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Report Registry"
        subtitle="Every released report with delivery trail, pathologist signature and QR verification"
        icon={<FileText className="h-5 w-5" />}
        actions={
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Share2 className="h-4 w-4 text-teal-700" /> Shares via Mail / WhatsApp / PDF
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Reports" value={reports.length} icon={<FileText className="h-4 w-4" />} sublabel="last 7 days" />
        <StatCard label="Delivered" value={deliveredCount} accent="emerald" sublabel="reached the requester" />
        <StatCard label="Approved / Ready" value={approvedCount} accent="violet" sublabel="awaiting delivery" />
        <StatCard label="Pending Verification" value={pendingCount} accent="amber" sublabel="with pathologist" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <DataTable
            columns={columns}
            rows={rows}
            pageSize={8}
            searchOf={(r) => `${r.id} ${r.orderId} ${orderPatientName(r.orderId)} ${r.tests.join(" ")} ${r.pathologist}`}
            searchPlaceholder="Search report / patient / test…"
            onRowClick={openView}
            filters={
              <>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All statuses</SelectItem>
                    {["Pending Verification", "Approved", "Delivered", "Draft"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={dept} onValueChange={setDept}>
                  <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All departments</SelectItem>
                    {deptOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={via} onValueChange={setVia}>
                  <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All delivery modes</SelectItem>
                    {viaOptions.map((v) => (
                      <SelectItem key={v} value={v}>{VIA_LABELS[v] ?? v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            }
          />
        </Panel>

        <div className="space-y-4">
          <Panel title="Report Delivery" description="Delivery channel split for this registry">
            <ul className="space-y-2.5">
              {Object.keys(VIA_LABELS).map((v) => {
                const n = reports.filter((r) => r.deliveredVia === v).length;
                const pct = Math.round((n / reports.length) * 100);
                return (
                  <li key={v} className="flex items-center gap-3">
                    <span className="w-36 shrink-0 text-xs font-medium text-slate-700">{VIA_LABELS[v]}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-teal-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right text-xs font-semibold tabular-nums text-slate-800">{n}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-muted-foreground">
              {b2bCount} of {reports.length} reports flow to partners through the B2B portal; patients receive Portal / WhatsApp copies with QR tokens.
            </p>
          </Panel>

          <Panel title="QR Report Verification" description="How recipients authenticate a released report">
            <div className="flex items-start gap-4">
              <QR value="https://verify.apexlabs.in/r/APX-VER-77QK4M2Z" size={96} />
              <div className="space-y-2 text-xs text-slate-600">
                <p className="flex items-center gap-1.5 font-semibold text-slate-800"><QrCode className="h-4 w-4 text-teal-700" /> Verify before you trust</p>
                <p>
                  Every released report carries a signed QR token. Scanning it opens{" "}
                  <span className="font-medium text-teal-800">verify.apexlabs.in/r/&lt;token&gt;</span> which confirms the report number,
                  approving pathologist and release timestamp.
                </p>
                <p>
                  Sample token: <span className="font-mono text-[11px] font-semibold text-slate-800">APX-VER-77QK4M2Z</span>
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <ReportDialog open={!!report} onOpenChange={(o) => !o && setReport(null)} data={report} />
    </div>
  );
}

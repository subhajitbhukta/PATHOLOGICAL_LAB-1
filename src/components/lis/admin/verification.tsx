"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, FlagPill, PageHeader, Panel, StatCard, StatusPill } from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { LabReportDocument, toReportView } from "@/components/lis/report-sheet";
import type { ReportViewData } from "@/components/lis/report-sheet";
import { previewFlag } from "@/components/lis/admin/worklists";
import { pathologists, reports, resultLines, sampleById, verificationTasks } from "@/lib/lis/data";
import { BadgeCheck, FileCheck2, ShieldCheck } from "lucide-react";
import type { VerificationTask } from "@/lib/lis/types";

// Build a preview payload for the review dialog — matching report when available,
// otherwise a minimal construct from the task + sample records.
const previewFor = (t: VerificationTask): ReportViewData => {
  const rep = reports.find((r) => r.id === t.reportId && r.sampleId === t.sampleId);
  if (rep) return toReportView(rep, t.patientName, t.ageSex);
  const smp = sampleById(t.sampleId);
  // Extra fields beyond ReportViewData (patientId) are consumed by LabReportDocument
  const base = {
    reportId: t.reportId,
    orderId: t.orderId,
    sampleId: t.sampleId,
    patientId: smp?.patientId ?? "",
    patientName: t.patientName,
    ageSex: t.ageSex,
    source: smp?.source || "—",
    collectedAt: smp?.collectedAt ?? t.enteredAt,
    receivedAt: smp?.receivedAt ?? t.enteredAt,
    reportedAt: t.enteredAt,
    pathologist: t.pathologist ?? "—",
    pathologistQual: "",
    interpretation: undefined,
    comments: undefined,
    qrToken: `APX-VER-${t.reportId.slice(-8)}`,
    status: "Pending Verification",
    department: t.department,
  };
  return base;
};

export function AdminVerificationView() {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [released, setReleased] = React.useState<Record<string, boolean>>({});
  const [sentBack, setSentBack] = React.useState<Record<string, boolean>>({});
  const [lineVals, setLineVals] = React.useState<Record<string, string>>({});
  const [interp, setInterp] = React.useState("");
  const [pathologist, setPathologist] = React.useState("Dr. Anjali Deshpande");
  const [signed, setSigned] = React.useState(false);

  const openTask = verificationTasks.find((t) => t.reportId === openId) ?? null;
  const preview = openTask ? previewFor(openTask) : null;
  const openLines = openTask ? resultLines.filter((l) => l.sampleId === openTask.sampleId) : [];

  const pendingPath = verificationTasks.filter((t) => t.status === "Pending Pathologist Approval").length;
  const pendingTech = verificationTasks.filter((t) => t.status === "Pending Technical Review").length;
  const sentBackCount = verificationTasks.filter((t) => t.status === "Sent Back" || sentBack[t.reportId]).length;
  const approvedToday = verificationTasks.filter((t) => t.status === "Approved" || released[t.reportId]).length;

  const openReview = (t: VerificationTask) => {
    const rep = reports.find((r) => r.id === t.reportId && r.sampleId === t.sampleId);
    setOpenId(t.reportId);
    setSigned(false);
    setInterp(rep?.interpretation ?? `Review of ${t.tests} — findings are consistent with the clinical history provided. Recommended correlation with follow-up testing.`);
    setPathologist(t.pathologist ?? "Dr. Anjali Deshpande");
    const init: Record<string, string> = {};
    resultLines.filter((l) => l.sampleId === t.sampleId).forEach((l) => {
      init[`${l.testCode}|${l.parameter}`] = l.value;
    });
    setLineVals(init);
  };

  const approve = () => {
    if (!openTask) return;
    setReleased((prev) => ({ ...prev, [openTask.reportId]: true }));
  };

  const reject = () => {
    if (!openTask) return;
    setSentBack((prev) => ({ ...prev, [openTask.reportId]: true }));
  };

  const rowStatus = (t: VerificationTask): string => {
    if (released[t.reportId]) return "Report Delivered";
    if (sentBack[t.reportId]) return "Sent Back";
    return t.status;
  };

  const columns: Column<VerificationTask>[] = [
    { key: "rid", header: "Report ID", value: (r) => r.reportId, render: (r) => <span className="font-mono text-xs font-medium text-teal-800">{r.reportId}</span> },
    { key: "patient", header: "Patient", value: (r) => r.patientName, render: (r) => (
      <div className="text-xs"><p className="text-sm font-medium">{r.patientName}</p><p className="text-muted-foreground">{r.ageSex}</p></div>
    ) },
    { key: "tests", header: "Tests", value: (r) => r.tests, render: (r) => <span className="text-xs font-medium text-slate-700">{r.tests}</span> },
    { key: "dept", header: "Department", value: (r) => r.department, render: (r) => <span className="text-xs text-muted-foreground">{r.department}</span> },
    { key: "by", header: "Entered By", value: (r) => r.enteredBy, render: (r) => <span className="text-xs">{r.enteredBy === "—" ? "Pending entry" : r.enteredBy}</span> },
    { key: "pri", header: "Priority", value: (r) => r.priority, render: (r) => <StatusPill status={r.priority} /> },
    { key: "status", header: "Status", value: (r) => rowStatus(r), render: (r) => (
      <span className="flex items-center gap-1.5">
        <StatusPill status={rowStatus(r)} />
        {released[r.reportId] ? <BadgeCheck className="h-4 w-4 text-emerald-600" /> : null}
      </span>
    ) },
    { key: "act", header: "", render: (r) => (
      <Button variant="outline" size="sm" className="h-7" onClick={() => openReview(r)}>View</Button>
    ) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pathologist Verification"
        subtitle="Technical review, pathologist approval and digital release of reports"
        icon={<FileCheck2 className="h-5 w-5" />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Pending Pathologist Approval" value={pendingPath} accent="amber" icon={<FileCheck2 className="h-4 w-4" />} sublabel="tech verified" />
        <StatCard label="Pending Tech Review" value={pendingTech} accent="violet" sublabel="awaiting tech sign-off" />
        <StatCard label="Sent Back" value={sentBackCount} accent="rose" sublabel="returned to technician" />
        <StatCard label="Approved Today" value={approvedToday} accent="emerald" sublabel="released reports" />
      </div>

      <Panel>
        <DataTable
          columns={columns}
          rows={verificationTasks}
          pageSize={8}
          searchOf={(r) => `${r.reportId} ${r.patientName} ${r.tests} ${r.department} ${r.enteredBy}`}
          searchPlaceholder="Search queue / patient / report…"
          onRowClick={openReview}
        />
      </Panel>

      {/* Pathologist review dialog */}
      <Dialog open={!!openTask} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-4xl">
          {openTask && preview ? (
            <>
              <DialogHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <DialogTitle className="text-sm">Pathologist Review — {openTask.reportId}</DialogTitle>
                  <DialogDescription>
                    {openTask.patientName} ({openTask.ageSex}) · {openTask.tests} · entered by {openTask.enteredBy}
                  </DialogDescription>
                </div>
                <StatusPill status={rowStatus(openTask)} />
              </DialogHeader>

              <div className="space-y-4">
                {/* Report preview */}
                <div className="rounded-lg border border-slate-200 p-3">
                  <LabReportDocument data={preview} />
                </div>

                {released[openTask.reportId] ? (
                  <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
                    <BadgeCheck className="h-4 w-4" />
                    <AlertTitle>Report approved &amp; released</AlertTitle>
                    <AlertDescription>
                      Digitally signed by {pathologist} · pushed to {openTask.department} delivery queue · QR verification token active.
                    </AlertDescription>
                  </Alert>
                ) : sentBack[openTask.reportId] ? (
                  <Alert className="border-rose-200 bg-rose-50 text-rose-800">
                    <AlertTitle>Sent back to technician</AlertTitle>
                    <AlertDescription>{openTask.reportId} returned for re-check with remarks — patient results now locked for editing.</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {/* Editable result lines */}
                    {openLines.length > 0 ? (
                      <Panel title="Result Lines" description="Verify or amend analyser values before release" contentClassName="p-0">
                        <div className="divide-y divide-slate-100">
                          {openLines.map((l) => {
                            const key = `${l.testCode}|${l.parameter}`;
                            const val = lineVals[key] ?? l.value;
                            const flag = previewFlag(val, l.refRange);
                            return (
                              <div key={key} className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-2 sm:grid-cols-[minmax(0,1fr)_130px_auto_auto]">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">{l.parameter}</p>
                                  <p className="truncate text-[11px] text-muted-foreground">{l.testName} · Ref: {l.refRange} · {l.unit}</p>
                                </div>
                                <Input
                                  value={val}
                                  onChange={(e) => setLineVals((prev) => ({ ...prev, [key]: e.target.value }))}
                                  className="h-8 text-right font-mono text-sm"
                                />
                                <FlagPill flag={flag} />
                                <span className="hidden text-[10px] text-muted-foreground sm:block">{l.method}</span>
                              </div>
                            );
                          })}
                        </div>
                      </Panel>
                    ) : null}

                    {/* Interpretation */}
                    <div className="space-y-1.5">
                      <Label htmlFor="verif-interp">Interpretation / comments</Label>
                      <Textarea id="verif-interp" rows={3} value={interp} onChange={(e) => setInterp(e.target.value)} />
                    </div>

                    {/* Pathologist + digital signature */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Approving pathologist</Label>
                        <Select value={pathologist} onValueChange={setPathologist}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {pathologists.filter((p) => p.status === "Active").map((p) => (
                              <SelectItem key={p.id} value={p.name}>{p.name} · {p.qualification}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <div className="flex w-full items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <Checkbox id="digital-sign" checked={signed} onCheckedChange={(v) => setSigned(Boolean(v))} />
                          <Label htmlFor="digital-sign" className="text-xs font-medium leading-snug text-slate-700">
                            Apply digital signature on file &amp; release report <ShieldCheck className="inline h-3.5 w-3.5 text-emerald-600" />
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 pt-3">
                      <Button variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-50" onClick={reject}>
                        Reject — Send Back
                      </Button>
                      <Button
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                        disabled={!signed}
                        onClick={approve}
                      >
                        <BadgeCheck className="mr-1.5 h-4 w-4" /> Approve &amp; Release
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

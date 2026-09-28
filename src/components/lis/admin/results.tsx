"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, EmptyState, FlagPill, PageHeader, Panel, StatusPill } from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { previewFlag } from "@/components/lis/admin/worklists";
import { fmtDateTime } from "@/lib/lis/format";
import { resultLines, resultTasks, sampleById, staff, tests } from "@/lib/lis/data";
import { CheckCircle2, FlaskConical, Info } from "lucide-react";
import type { Flag, ResultEntryTask, ResultLine } from "@/lib/lis/types";

const DEMO_NOW = "2026-09-28 12:00";

const statusPillFor = (s: string): string =>
  s === "Processing" ? "Test in Progress" : s === "Entered" ? "Result Entered" : s;

const technicians = staff.filter((s) => s.role.toLowerCase().includes("technician") && s.status === "Active");

const lineKey = (l: ResultLine) => `${l.testCode}|${l.parameter}`;

const initialValues = (task: ResultEntryTask | null): Record<string, string> => {
  if (!task) return {};
  const out: Record<string, string> = {};
  resultLines.filter((l) => l.sampleId === task.sampleId).forEach((l) => {
    out[lineKey(l)] = l.value;
  });
  return out;
};

interface LineGroup {
  code: string;
  testName: string;
  lines: ResultLine[];
}

const groupsFor = (task: ResultEntryTask | null): LineGroup[] => {
  if (!task) return [];
  const real = resultLines.filter((l) => l.sampleId === task.sampleId);
  if (real.length > 0) {
    const order: string[] = [];
    const map: Record<string, ResultLine[]> = {};
    real.forEach((l) => {
      if (!map[l.testCode]) {
        map[l.testCode] = [];
        order.push(l.testCode);
      }
      map[l.testCode].push(l);
    });
    return order.map((code) => ({
      code,
      testName: map[code][0].testName,
      lines: map[code],
    }));
  }
  // No analyser lines yet — synthesize a single parameter row from the test master
  const t = tests.find((x) => x.code === task.testCode);
  const synthetic: ResultLine = {
    sampleId: task.sampleId,
    testCode: task.testCode,
    testName: task.testName,
    department: task.department,
    parameter: t?.name ?? task.testName,
    value: "",
    unit: t?.unit ?? "—",
    refRange: t?.refRanges[0]?.range ?? "—",
    flag: "N",
    method: t?.methodology ?? "—",
    state: "Pending",
    enteredBy: "",
    enteredAt: "",
  };
  return [{ code: task.testCode, testName: task.testName, lines: [synthetic] }];
};

export function AdminResultsView() {
  const [selectedId, setSelectedId] = React.useState<string>(resultTasks[0]?.sampleId ?? "");
  const [values, setValues] = React.useState<Record<string, string>>(() => initialValues(resultTasks[0] ?? null));
  const [tech, setTech] = React.useState(technicians[0]?.name ?? "Kiran Wagh");
  const [remarks, setRemarks] = React.useState("");
  const [saveState, setSaveState] = React.useState<"idle" | "draft" | "submitted">("idle");
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const selected = resultTasks.find((t) => t.sampleId === selectedId) ?? null;
  const groups = groupsFor(selected);
  const selectedSample = selected ? sampleById(selected.sampleId) : undefined;

  const selectTask = (t: ResultEntryTask) => {
    setSelectedId(t.sampleId);
    setValues(initialValues(t));
    setRemarks("");
    setSaveState("idle");
    if (typeof window !== "undefined" && window.innerWidth < 1024) setSheetOpen(true);
  };

  const setValue = (key: string, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  };

  const columns: Column<ResultEntryTask>[] = [
    { key: "sid", header: "Sample ID", value: (r) => r.sampleId, render: (r) => (
      <span className={`font-mono text-xs font-medium ${r.sampleId === selectedId ? "text-teal-700" : "text-slate-700"}`}>{r.sampleId}</span>
    ) },
    { key: "patient", header: "Patient", value: (r) => r.patientName, render: (r) => (
      <div className="text-xs"><p className="text-sm font-medium">{r.patientName}</p><p className="text-muted-foreground">{r.ageSex}</p></div>
    ) },
    { key: "test", header: "Test", value: (r) => r.testName, render: (r) => <span className="text-xs font-medium text-slate-700">{r.testName}</span> },
    { key: "dept", header: "Dept", value: (r) => r.department, render: (r) => <span className="text-xs text-muted-foreground">{r.department}</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={statusPillFor(r.status)} /> },
    { key: "tat", header: "TAT Due", value: (r) => r.tatDue, render: (r) => {
      const overdue = r.tatDue < DEMO_NOW && r.status !== "Tech Verified";
      return overdue
        ? <span className="text-xs font-medium text-rose-600">{r.tatDue}</span>
        : <span className="whitespace-nowrap text-xs text-muted-foreground">{r.tatDue}</span>;
    } },
  ];

  const pendingCount = resultTasks.filter((t) => t.status === "Pending").length;
  const wipCount = resultTasks.filter((t) => (t.status as string) === "Processing").length;
  const enteredCount = resultTasks.filter((t) => t.status === "Entered" || t.status === "Tech Verified").length;

  const form = selected ? (
    <EntryForm
      task={selected}
      sampleCollected={selectedSample?.collectedAt ?? ""}
      groups={groups}
      values={values}
      tech={tech}
      remarks={remarks}
      saveState={saveState}
      onValue={setValue}
      onTech={setTech}
      onRemarks={setRemarks}
      onSaveDraft={() => setSaveState("draft")}
      onSubmit={() => setSaveState("submitted")}
    />
  ) : null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Result Entry Workstation"
        subtitle="Analyser values, auto-flagging against reference ranges and pathologist routing"
        icon={<FlaskConical className="h-5 w-5" />}
        actions={
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Pending {pendingCount}</Badge>
            <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700">In progress {wipCount}</Badge>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Entered {enteredCount}</Badge>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Left — worklist */}
        <Panel title="Entry Worklist" description="Click a row to open the result entry form">
          <DataTable
            columns={columns}
            rows={resultTasks}
            pageSize={9}
            dense
            searchOf={(r) => `${r.sampleId} ${r.patientName} ${r.testName} ${r.testCode} ${r.department}`}
            searchPlaceholder="Search worklist…"
            onRowClick={selectTask}
          />
        </Panel>

        {/* Right — entry form (desktop) */}
        <div className="hidden lg:block">
          {form ?? (
            <Panel>
              <EmptyState title="Select a sample from the worklist" hint="The entry form shows one parameter row per analyser parameter." />
            </Panel>
          )}
        </div>
      </div>

      {/* Entry form (mobile / tablet sheet) */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="text-sm">Result Entry — {selected?.testName}</SheetTitle>
          </SheetHeader>
          <div className="p-4">{form}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ============================================================
// Entry form — shared between desktop panel and mobile sheet
// ============================================================
interface EntryFormProps {
  task: ResultEntryTask;
  sampleCollected: string;
  groups: LineGroup[];
  values: Record<string, string>;
  tech: string;
  remarks: string;
  saveState: "idle" | "draft" | "submitted";
  onValue: (key: string, v: string) => void;
  onTech: (v: string) => void;
  onRemarks: (v: string) => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

function EntryForm(p: EntryFormProps) {
  const master = tests.find((t) => t.code === p.task.testCode);

  return (
    <div className="space-y-4">
      {/* Sample header */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-mono text-sm font-semibold text-teal-800">{p.task.sampleId}</p>
            <p className="text-xs text-muted-foreground">
              Order <span className="font-mono">{p.task.orderId}</span> · {p.task.patientName} ({p.task.ageSex})
            </p>
          </div>
          <StatusPill status={statusPillFor(p.task.status)} />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
          <span>Dept: <span className="font-medium text-slate-700">{p.task.department}</span></span>
          <span>Collected: <span className="font-medium text-slate-700">{p.sampleCollected ? fmtDateTime(p.sampleCollected) : p.task.collectedAt}</span></span>
          <span>TAT due: <span className={`font-medium ${p.task.tatDue < DEMO_NOW && p.task.status !== "Tech Verified" ? "text-rose-600" : "text-slate-700"}`}>{p.task.tatDue}</span></span>
        </div>
      </div>

      {p.saveState === "draft" ? (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800">
          <AlertTitle>Draft saved</AlertTitle>
          <AlertDescription>Values stored against the worklist — not yet visible to the pathologist.</AlertDescription>
        </Alert>
      ) : null}
      {p.saveState === "submitted" ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Submitted for verification</AlertTitle>
          <AlertDescription>
            {p.task.testName} results sent to the pathologist queue with flags auto-applied.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Parameter rows per test */}
      {p.groups.map((g) => (
        <div key={g.code} className="overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between border-b bg-teal-50/70 px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wide text-teal-800">{g.testName}</p>
            <Badge variant="outline" className="text-[10px]">{g.code}</Badge>
          </div>
          <div className="divide-y divide-slate-100">
            {g.lines.map((l) => {
              const key = lineKey(l);
              const val = p.values[key] ?? "";
              const flag: Flag = previewFlag(val, l.refRange);
              return (
                <div key={key} className="grid grid-cols-[1fr_auto] items-start gap-3 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_150px_auto]">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{l.parameter}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Unit: {l.unit} · Ref: {l.refRange} · {l.method}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    {p.task.resultType === "Numeric" ? (
                      <div className="w-full sm:w-28">
                        <Input
                          value={val}
                          onChange={(e) => p.onValue(key, e.target.value)}
                          inputMode="decimal"
                          className="h-8 text-right font-mono text-sm"
                          placeholder="value"
                        />
                      </div>
                    ) : p.task.resultType === "Pos/Neg" ? (
                      <Select value={val || undefined} onValueChange={(v) => p.onValue(key, v)}>
                        <SelectTrigger className="h-8 w-36"><SelectValue placeholder="Select…" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Non-Reactive">Non-Reactive</SelectItem>
                          <SelectItem value="Reactive">Reactive</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Textarea
                        value={val}
                        onChange={(e) => p.onValue(key, e.target.value)}
                        rows={2}
                        className="min-h-0 w-full text-sm"
                        placeholder="Enter finding…"
                      />
                    )}
                    <FlagPill flag={flag} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Reference range info box */}
      {master ? (
        <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-3 text-xs text-teal-900">
          <p className="flex items-center gap-1.5 font-semibold"><Info className="h-3.5 w-3.5" /> Reference ranges — {master.name}</p>
          <ul className="mt-1.5 space-y-0.5">
            {master.refRanges.slice(0, 3).map((r) => (
              <li key={`${r.sex}-${r.ageGroup}`} className="text-teal-800">
                <span className="font-medium">{r.ageGroup} ({r.sex}):</span> {r.range}
              </li>
            ))}
          </ul>
          {master.interpretation ? (
            <p className="mt-1.5 border-t border-teal-200 pt-1.5 text-teal-800"><span className="font-semibold">Interpretation guide:</span> {master.interpretation}</p>
          ) : null}
        </div>
      ) : null}

      {/* Technician + remarks */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Entered by (technician)</Label>
          <Select value={p.tech} onValueChange={p.onTech}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {technicians.map((t) => <SelectItem key={t.id} value={t.name}>{t.name} · {t.department}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="entry-remarks">Technician remarks</Label>
          <Input id="entry-remarks" value={p.remarks} onChange={(e) => p.onRemarks(e.target.value)} placeholder="Haemolysis, delay, dilution note…" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 pt-3">
        <Button variant="outline" onClick={p.onSaveDraft}>Save Draft</Button>
        <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={p.onSubmit}>
          Submit for Verification
        </Button>
      </div>
    </div>
  );
}


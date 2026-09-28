"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, EmptyState, PageHeader, Panel, StatusPill } from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { FlagPill } from "@/components/lis/widgets";
import { departments, resultLines, resultTasks, tests } from "@/lib/lis/data";
import { ClipboardList } from "lucide-react";
import type { ResultEntryTask, ResultLine } from "@/lib/lis/types";

// Demo clock — snapshot date for the prototype
const DEMO_NOW = "2026-09-28 12:00";

const statusPillFor = (s: string): string =>
  s === "Processing" ? "Test in Progress" : s === "Entered" ? "Result Entered" : s;

export function AdminWorklistsView() {
  const [entryTask, setEntryTask] = React.useState<ResultEntryTask | null>(null);
  const [entryDone, setEntryDone] = React.useState(false);

  const withTasks = departments.map((d) => ({
    dept: d,
    tasks: resultTasks.filter((t) => t.department === d.name),
  }));
  const defaultTab = withTasks.find((x) => x.tasks.length > 0)?.dept.id ?? departments[0].id;

  const openEntry = (t: ResultEntryTask) => {
    setEntryDone(false);
    setEntryTask(t);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Department Worklists"
        subtitle="Analyser-side queues per department — pending, in-progress and entered results"
        icon={<ClipboardList className="h-5 w-5" />}
      />

      <Tabs defaultValue={defaultTab}>
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 overflow-x-auto bg-slate-100 p-1">
          {withTasks.map(({ dept, tasks }) => (
            <TabsTrigger key={dept.id} value={dept.id} className="whitespace-nowrap data-[state=active]:bg-teal-600 data-[state=active]:text-white">
              {dept.name}
              <Badge variant="outline" className="ml-1.5 h-4 px-1 text-[10px]">{tasks.length}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {withTasks.map(({ dept, tasks }) => {
          const pending = tasks.filter((t) => t.status === "Pending").length;
          const processing = tasks.filter((t) => (t.status as string) === "Processing").length;
          const entered = tasks.filter((t) => t.status === "Entered" || t.status === "Tech Verified").length;
          const overdueCount = tasks.filter((t) => t.tatDue < DEMO_NOW && (t.status as string) !== "Processing" && t.status !== "Tech Verified").length;
          return (
            <TabsContent key={dept.id} value={dept.id} className="mt-4">
              {tasks.length === 0 ? (
                <Panel title={dept.name} description={`Head: ${dept.head} · TAT ${dept.tatHours} hrs · ${dept.tests} tests`}>
                  <EmptyState
                    title="No samples in this department worklist today"
                    hint="Samples appear here once receiving assigns them to the department."
                  />
                </Panel>
              ) : (
                <Panel
                  title={`${dept.name} — ${tasks.length} sample job(s)`}
                  description={`Head: ${dept.head} · TAT ${dept.tatHours} hrs · Ref range policy: ${dept.tatHours} hr turnaround`}
                  actions={
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50" variant="outline">Pending {pending}</Badge>
                      <Badge className="border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-50" variant="outline">Processing {processing}</Badge>
                      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50" variant="outline">Entered {entered}</Badge>
                      {overdueCount > 0 ? (
                        <Badge className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50" variant="outline">TAT breach {overdueCount}</Badge>
                      ) : null}
                    </div>
                  }
                >
                  <WorklistTable tasks={tasks} onEnter={openEntry} />
                </Panel>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Quick result entry dialog */}
      <Dialog open={!!entryTask} onOpenChange={(o) => !o && setEntryTask(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
          {entryTask ? (
            <>
              <DialogHeader>
                <DialogTitle>Quick Result Entry — {entryTask.testName}</DialogTitle>
                <DialogDescription>
                  <span className="font-mono">{entryTask.sampleId}</span> · {entryTask.patientName} ({entryTask.ageSex}) · {entryTask.department}
                </DialogDescription>
              </DialogHeader>
              {entryDone ? (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
                  <AlertTitle>Result saved</AlertTitle>
                  <AlertDescription>
                    {entryTask.testName} for {entryTask.sampleId} saved and queued for verification.
                  </AlertDescription>
                </Alert>
              ) : (
                <EntryFields task={entryTask} />
              )}
              <DialogFooter>
                {entryDone ? (
                  <Button variant="outline" onClick={() => setEntryTask(null)}>Close</Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setEntryTask(null)}>Cancel</Button>
                    <Button className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => setEntryDone(true)}>Save Result</Button>
                  </>
                )}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WorklistTable({ tasks, onEnter }: { tasks: ResultEntryTask[]; onEnter: (t: ResultEntryTask) => void }) {
  const columns: Column<ResultEntryTask>[] = [
    { key: "sid", header: "Sample ID", value: (r) => r.sampleId, render: (r) => <span className="font-mono text-xs font-medium text-teal-800">{r.sampleId}</span> },
    { key: "patient", header: "Patient", value: (r) => r.patientName, render: (r) => (
      <div className="text-xs"><p className="text-sm font-medium">{r.patientName}</p><p className="text-muted-foreground">{r.ageSex}</p></div>
    ) },
    { key: "test", header: "Test", value: (r) => r.testName, render: (r) => <span className="text-xs font-medium text-slate-700">{r.testName}</span> },
    { key: "col", header: "Collected", value: (r) => r.collectedAt, render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{r.collectedAt}</span> },
    { key: "tat", header: "TAT Due", value: (r) => r.tatDue, render: (r) => {
      const overdue = r.tatDue < DEMO_NOW && (r.status as string) !== "Processing" && r.status !== "Tech Verified";
      return overdue ? (
        <span className="font-medium text-rose-600">{r.tatDue} · Overdue</span>
      ) : (
        <span className="whitespace-nowrap text-xs text-muted-foreground">{r.tatDue}</span>
      );
    } },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={statusPillFor(r.status)} /> },
    { key: "act", header: "", render: (r) => (
      <Button variant="outline" size="sm" className="h-7" onClick={() => onEnter(r)}>Enter</Button>
    ) },
  ];
  return (
    <DataTable
      columns={columns}
      rows={tasks}
      pageSize={8}
      dense
      searchOf={(r) => `${r.sampleId} ${r.patientName} ${r.testName} ${r.testCode}`}
      searchPlaceholder="Search worklist…"
    />
  );
}

// Parameter rows for the quick entry dialog (prefilled from result lines where available)
function EntryFields({ task }: { task: ResultEntryTask }) {
  const lines = resultLines.filter((l) => l.sampleId === task.sampleId && l.testCode === task.testCode);
  const test = tests.find((t) => t.code === task.testCode);
  const range = test?.refRanges[0]?.range ?? "—";

  if (lines.length === 0) {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="q-result">Result / finding</Label>
          <Textarea id="q-result" rows={4} placeholder={task.resultType === "Numeric" ? "Enter observed value…" : "Enter descriptive finding…"} />
          <p className="text-[11px] text-muted-foreground">Reference: {range} · Unit: {test?.unit ?? "—"} · Method: {test?.methodology ?? "—"}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="q-remarks">Remarks</Label>
          <Input id="q-remarks" placeholder="Optional technician remark…" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="divide-y divide-slate-100 rounded-lg border">
        {lines.map((l) => (
          <LineRow key={`${l.testCode}-${l.parameter}`} line={l} />
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">Reference ranges: {range} · Values are auto-flagged against the age/sex reference table on save.</p>
    </div>
  );
}

function LineRow({ line }: { line: ResultLine }) {
  const [val, setVal] = React.useState(line.value);
  const flag = previewFlag(val, line.refRange);
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{line.parameter}</p>
        <p className="truncate text-[11px] text-muted-foreground">Ref: {line.refRange} · {line.unit}</p>
      </div>
      <Input value={val} onChange={(e) => setVal(e.target.value)} className="h-8 w-28 text-right font-mono text-sm" />
      <FlagPill flag={flag} />
    </div>
  );
}

// Shared flag logic — compare an entered value against the reference range text
export function previewFlag(value: string, refRange: string): "H" | "L" | "N" | "A" {
  if (!value.trim()) return "N";
  const nums = refRange.replace(/,/g, "").match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  const v = Number(value.replace(/,/g, ""));
  if (Number.isNaN(v)) {
    return value.trim().toLowerCase() === refRange.trim().toLowerCase() ? "N" : "A";
  }
  if (refRange.includes("<")) return v <= nums[0] ? "N" : "H";
  if (refRange.includes(">")) return v >= nums[0] ? "N" : "L";
  if (nums.length >= 2) {
    if (v < nums[0]) return "L";
    if (v > nums[1]) return "H";
    return "N";
  }
  return "N";
}

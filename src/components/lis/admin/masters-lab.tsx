"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { containers, departments, misTat, pathologists, sampleTypes, tests } from "@/lib/lis/data";
import type { ContainerType, Department, SampleType, TestMaster } from "@/lib/lis/data";
import {
  DataTable, Field, FormGrid, PageHeader, Panel, StatusPill,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { Beaker, Droplets, Pencil, Plus, Save, Thermometer, Trash2 } from "lucide-react";

const HEAD_OPTIONS = Array.from(new Set([...departments.map((d) => d.head), ...pathologists.map((p) => p.name)]));

export function AdminMastersLabView() {
  const [deptOpen, setDeptOpen] = React.useState(false);
  const [deptForm, setDeptForm] = React.useState({ name: "Coagulation", head: "Dr. Anjali Deshpande", tatHours: 6, status: "Active" });

  const [stOpen, setStOpen] = React.useState(false);
  const [stForm, setStForm] = React.useState({ name: "Whole Blood Heparin", abbreviation: "WB-LH", container: "Lithium Heparin (Green)", fasting: "Not required", notes: "For STAT biochemistry panels; invert 8–10 times" });

  const [ctOpen, setCtOpen] = React.useState(false);
  const [ctForm, setCtForm] = React.useState({ name: "Lithium Heparin", color: "Green", additive: "Li Heparin (gel free)", volume: "4 mL", stock: 480 });

  const [rangeOpen, setRangeOpen] = React.useState(false);
  const [rangeForm, setRangeForm] = React.useState({ testCode: "CBC", sex: "Any", ageGroup: "Paediatric (2–12 yr)", range: "Age chart — see department SOP" });

  const [unitOpen, setUnitOpen] = React.useState(false);
  const [unitForm, setUnitForm] = React.useState<{ code: string; name: string; unit: string; methodology: string } | null>(null);

  const [tatSaved, setTatSaved] = React.useState(false);

  // ---- Departments ----
  const deptColumns: Column<Department>[] = [
    { key: "id", header: "ID", value: (r) => r.id, render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.id}</span> },
    { key: "name", header: "Department", value: (r) => r.name, render: (r) => <span className="text-sm font-medium">{r.name}</span> },
    { key: "head", header: "Department Head", value: (r) => r.head, render: (r) => <span className="text-xs">{r.head}</span> },
    { key: "tests", header: "Assays", headClassName: "text-right", className: "text-right", value: (r) => r.tests, render: (r) => <span className="text-xs tabular-nums">{r.tests}</span> },
    { key: "tat", header: "TAT", headClassName: "text-right", className: "text-right", value: (r) => r.tatHours, render: (r) => <span className="text-xs tabular-nums">{r.tatHours} h</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "act", header: "", render: (r) => (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setDeptForm({ name: r.name, head: r.head, tatHours: r.tatHours, status: r.status }); setDeptOpen(true); }} aria-label={`Edit ${r.name}`}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    ) },
  ];

  // ---- Sample types ----
  const stColumns: Column<SampleType>[] = [
    { key: "name", header: "Sample Type", value: (r) => r.name, render: (r) => (
      <div><p className="text-sm font-medium">{r.name}</p><p className="font-mono text-[10px] text-muted-foreground">{r.abbreviation}</p></div>
    ) },
    { key: "container", header: "Container", value: (r) => r.container, render: (r) => <span className="text-xs">{r.container}</span> },
    { key: "fasting", header: "Fasting", value: (r) => r.fasting ?? "—", render: (r) => (
      r.fasting && r.fasting !== "Not required"
        ? <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] text-amber-700">{r.fasting}</Badge>
        : <span className="text-xs text-muted-foreground">{r.fasting ?? "—"}</span>
    ) },
    { key: "notes", header: "Handling Notes", value: (r) => r.notes ?? "—", render: (r) => <span className="max-w-72 truncate text-xs text-muted-foreground">{r.notes ?? "—"}</span> },
    { key: "act", header: "", render: (r) => (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setStForm({ name: r.name, abbreviation: r.abbreviation, container: r.container, fasting: r.fasting ?? "Not required", notes: r.notes ?? "" }); setStOpen(true); }} aria-label={`Edit ${r.name}`}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    ) },
  ];

  // ---- Containers ----
  const ctColumns: Column<ContainerType>[] = [
    { key: "name", header: "Container", value: (r) => r.name, render: (r) => (
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 shrink-0 rounded-full border border-slate-300 bg-slate-100" title={r.color} />
        <span className="text-sm font-medium">{r.name}</span>
      </div>
    ) },
    { key: "color", header: "Colour", value: (r) => r.color, render: (r) => <span className="text-xs">{r.color}</span> },
    { key: "additive", header: "Additive", value: (r) => r.additive, render: (r) => <span className="max-w-56 truncate text-xs text-muted-foreground">{r.additive}</span> },
    { key: "volume", header: "Draw Volume", value: (r) => r.volume, render: (r) => <span className="text-xs tabular-nums">{r.volume}</span> },
    { key: "stock", header: "Stock", headClassName: "text-right", className: "text-right", value: (r) => r.stock, render: (r) => (
      <div className="flex items-center justify-end gap-2">
        <span className={`text-xs font-semibold tabular-nums ${r.stock < 100 ? "text-rose-600" : "text-slate-700"}`}>{r.stock}</span>
        {r.stock < 100 ? <Badge variant="outline" className="border-rose-200 bg-rose-50 text-[10px] text-rose-700">Low — reorder</Badge> : null}
      </div>
    ) },
    { key: "act", header: "", render: (r) => (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setCtForm({ name: r.name, color: r.color, additive: r.additive, volume: r.volume, stock: r.stock }); setCtOpen(true); }} aria-label={`Edit ${r.name}`}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    ) },
  ];

  // ---- Reference ranges (flattened from multi-demographic tests) ----
  const rangeRows = tests
    .filter((t) => t.refRanges.length > 1)
    .flatMap((t) => t.refRanges.map((r) => ({ ...r, test: t.name, code: t.code, department: t.department })));

  const rangeColumns: Column<(typeof rangeRows)[number]>[] = [
    { key: "test", header: "Test", value: (r) => r.test, render: (r) => (
      <div><p className="text-sm font-medium">{r.test}</p><p className="font-mono text-[10px] text-muted-foreground">{r.code}</p></div>
    ) },
    { key: "dept", header: "Department", value: (r) => r.department, render: (r) => <span className="text-xs text-muted-foreground">{r.department}</span> },
    { key: "sex", header: "Sex", value: (r) => r.sex, render: (r) => <Badge variant="outline" className="text-[10px]">{r.sex}</Badge> },
    { key: "age", header: "Age Group", value: (r) => r.ageGroup, render: (r) => <span className="text-xs font-medium text-slate-700">{r.ageGroup}</span> },
    { key: "range", header: "Reference Range", value: (r) => r.range, render: (r) => <span className="text-xs text-slate-700">{r.range}</span> },
  ];

  // ---- Units & methodology ----
  const unitColumns: Column<TestMaster>[] = [
    { key: "code", header: "Code", value: (r) => r.code, render: (r) => <Badge variant="outline" className="font-mono text-[10px]">{r.code}</Badge> },
    { key: "name", header: "Test", value: (r) => r.name, render: (r) => <span className="max-w-64 truncate text-sm font-medium">{r.name}</span> },
    { key: "unit", header: "Unit", value: (r) => r.unit, render: (r) => <span className="font-mono text-xs">{r.unit}</span> },
    { key: "method", header: "Methodology", value: (r) => r.methodology, render: (r) => <span className="text-xs text-muted-foreground">{r.methodology}</span> },
    { key: "dept", header: "Department", value: (r) => r.department, render: (r) => <span className="text-xs text-muted-foreground">{r.department}</span> },
    { key: "rtype", header: "Result Type", value: (r) => r.resultType, render: (r) => <Badge variant="outline" className="text-[10px]">{r.resultType}</Badge> },
    { key: "act", header: "", render: (r) => (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setUnitForm({ code: r.code, name: r.name, unit: r.unit, methodology: r.methodology }); setUnitOpen(true); }} aria-label={`Edit ${r.code}`}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    ) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Lab Setup Masters"
        subtitle="Departments, sample types, containers, reference ranges, units and TAT promises"
        icon={<Beaker className="h-5 w-5" />}
      />

      <Tabs defaultValue="departments">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="samples">Sample Types</TabsTrigger>
          <TabsTrigger value="containers">Containers</TabsTrigger>
          <TabsTrigger value="ranges">Reference Ranges</TabsTrigger>
          <TabsTrigger value="units">Units &amp; Methodology</TabsTrigger>
          <TabsTrigger value="tat">TAT</TabsTrigger>
        </TabsList>

        {/* ------------------------------ DEPARTMENTS ------------------------------ */}
        <TabsContent value="departments">
          <Panel title="Departments" description="Work areas with an accountable HOD and a promised turnaround time">
            <DataTable
              columns={deptColumns}
              rows={departments}
              pageSize={9}
              searchOf={(r) => `${r.name} ${r.head}`}
              searchPlaceholder="Search department / head…"
              onRowClick={(r) => { setDeptForm({ name: r.name, head: r.head, tatHours: r.tatHours, status: r.status }); setDeptOpen(true); }}
              filters={
                <Select defaultValue="All">
                  <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              }
              toolbar={<Button size="sm" onClick={() => { setDeptForm({ name: "Coagulation", head: "Dr. Anjali Deshpande", tatHours: 6, status: "Active" }); setDeptOpen(true); }}><Plus className="mr-1.5 h-3.5 w-3.5" /> Add Department</Button>}
            />
          </Panel>
        </TabsContent>

        {/* ------------------------------ SAMPLE TYPES ------------------------------ */}
        <TabsContent value="samples">
          <Panel title="Sample Types" description="Specimen vocabulary used on barcodes, manifests and receiving screens">
            <DataTable
              columns={stColumns}
              rows={sampleTypes}
              pageSize={8}
              searchOf={(r) => `${r.name} ${r.abbreviation} ${r.container}`}
              searchPlaceholder="Search sample / container…"
              onRowClick={(r) => { setStForm({ name: r.name, abbreviation: r.abbreviation, container: r.container, fasting: r.fasting ?? "Not required", notes: r.notes ?? "" }); setStOpen(true); }}
              filters={
                <Select defaultValue="All">
                  <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All fasting rules</SelectItem>
                    <SelectItem value="Fasting">Fasting required</SelectItem>
                    <SelectItem value="Not required">Not required</SelectItem>
                  </SelectContent>
                </Select>
              }
              toolbar={<Button size="sm" onClick={() => { setStForm({ name: "Whole Blood Heparin", abbreviation: "WB-LH", container: "Lithium Heparin (Green)", fasting: "Not required", notes: "For STAT biochemistry panels; invert 8–10 times" }); setStOpen(true); }}><Plus className="mr-1.5 h-3.5 w-3.5" /> Add Sample Type</Button>}
            />
          </Panel>
        </TabsContent>

        {/* ------------------------------ CONTAINERS ------------------------------ */}
        <TabsContent value="containers">
          <Panel
            title="Containers & Consumables"
            description="Vacutainers, swabs and pots with live stock at the central store — below 100 units flags reorder"
          >
            <DataTable
              columns={ctColumns}
              rows={containers}
              pageSize={8}
              searchOf={(r) => `${r.name} ${r.color} ${r.additive}`}
              searchPlaceholder="Search container / additive…"
              onRowClick={(r) => { setCtForm({ name: r.name, color: r.color, additive: r.additive, volume: r.volume, stock: r.stock }); setCtOpen(true); }}
              filters={
                <Select defaultValue="All">
                  <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All stock levels</SelectItem>
                    <SelectItem value="Low">Low stock (&lt; 100)</SelectItem>
                    <SelectItem value="OK">In stock</SelectItem>
                  </SelectContent>
                </Select>
              }
              toolbar={<Button size="sm" onClick={() => { setCtForm({ name: "Lithium Heparin", color: "Green", additive: "Li Heparin (gel free)", volume: "4 mL", stock: 480 }); setCtOpen(true); }}><Plus className="mr-1.5 h-3.5 w-3.5" /> Add Container</Button>}
            />
          </Panel>
        </TabsContent>

        {/* ------------------------------ REFERENCE RANGES ------------------------------ */}
        <TabsContent value="ranges">
          <Panel
            title="Reference Ranges — Multi-Demographic"
            description="Tests carrying sex / age-specific ranges; each row is one demographic band"
            actions={
              <Button size="sm" onClick={() => { setRangeForm({ testCode: "CBC", sex: "Any", ageGroup: "Paediatric (2–12 yr)", range: "Age chart — see department SOP" }); setRangeOpen(true); }}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Range
              </Button>
            }
          >
            <DataTable
              columns={rangeColumns}
              rows={rangeRows}
              pageSize={9}
              searchOf={(r) => `${r.test} ${r.code} ${r.sex} ${r.ageGroup} ${r.range}`}
              searchPlaceholder="Search test / range…"
              filters={
                <>
                  <Select defaultValue="All">
                    <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All sexes</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Any">Any</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="All">
                    <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All departments</SelectItem>
                      {departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </>
              }
            />
          </Panel>
        </TabsContent>

        {/* ------------------------------ UNITS & METHODOLOGY ------------------------------ */}
        <TabsContent value="units">
          <Panel title="Units & Methodology" description="Result units and analytical methods per test — row click to edit">
            <DataTable
              columns={unitColumns}
              rows={tests}
              dense
              pageSize={10}
              searchOf={(r) => `${r.code} ${r.name} ${r.unit} ${r.methodology}`}
              searchPlaceholder="Search test / unit / method…"
              onRowClick={(r) => { setUnitForm({ code: r.code, name: r.name, unit: r.unit, methodology: r.methodology }); setUnitOpen(true); }}
              filters={
                <>
                  <Select defaultValue="All">
                    <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All departments</SelectItem>
                      {departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select defaultValue="All">
                    <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All result types</SelectItem>
                      <SelectItem value="Numeric">Numeric</SelectItem>
                      <SelectItem value="Text">Text</SelectItem>
                      <SelectItem value="Pos/Neg">Pos/Neg</SelectItem>
                      <SelectItem value="Descriptive">Descriptive</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              }
            />
          </Panel>
        </TabsContent>

        {/* ------------------------------ TAT ------------------------------ */}
        <TabsContent value="tat">
          <Panel
            title="Turnaround Time — Department Promises"
            description="Hours promised per department; changes apply to new orders immediately"
            actions={
              <div className="flex items-center gap-2">
                {tatSaved ? <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Saved ✓</Badge> : null}
                <Button size="sm" onClick={() => setTatSaved(true)}><Save className="mr-1.5 h-3.5 w-3.5" /> Save TAT</Button>
              </div>
            }
          >
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-2 font-semibold">Department</th>
                    <th className="px-4 py-2 font-semibold">Head</th>
                    <th className="px-4 py-2 font-semibold">Promised TAT (hrs)</th>
                    <th className="px-4 py-2 font-semibold">Recent Compliance</th>
                    <th className="px-4 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((d) => {
                    const tat = misTat.find((m) => m.department === d.name);
                    const compliance = tat ? Math.round((tat.withinTat / (tat.withinTat + tat.delayed)) * 100) : null;
                    return (
                      <tr key={d.id} className="border-b border-slate-100">
                        <td className="px-4 py-2.5 font-medium text-slate-800">{d.name}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{d.head}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <Input
                              key={`${d.id}-${d.tatHours}`}
                              type="number"
                              min={1}
                              defaultValue={d.tatHours}
                              className="h-8 w-24"
                              onChange={() => setTatSaved(false)}
                              aria-label={`${d.name} TAT hours`}
                            />
                            <Thermometer className="h-3.5 w-3.5 text-slate-300" />
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          {compliance === null ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                                <div className={`h-full rounded-full ${compliance >= 90 ? "bg-emerald-500" : compliance >= 80 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${compliance}%` }} />
                              </div>
                              <span className="text-xs font-semibold tabular-nums">{compliance}%</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2.5"><StatusPill status={d.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Compliance is computed from reports released in the last 30 days vs the promised TAT at booking time.
            </p>
          </Panel>
        </TabsContent>
      </Tabs>

      {/* ------------------------------ DEPARTMENT DIALOG ------------------------------ */}
      <Dialog open={deptOpen} onOpenChange={setDeptOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{deptForm.name === "Coagulation" ? "Add Department" : `Edit Department — ${deptForm.name}`}</DialogTitle>
            <DialogDescription>Department determines sample routing and TAT SLA on bookings.</DialogDescription>
          </DialogHeader>
          <FormGrid cols={2}>
            <Field label="Department Name" required><Input value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} /></Field>
            <Field label="Department Head" required>
              <Select value={deptForm.head} onValueChange={(v) => setDeptForm({ ...deptForm, head: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{HEAD_OPTIONS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="TAT (hours)" required><Input type="number" min={1} value={deptForm.tatHours} onChange={(e) => setDeptForm({ ...deptForm, tatHours: Number(e.target.value) })} /></Field>
            <Field label="Status">
              <Select value={deptForm.status} onValueChange={(v) => setDeptForm({ ...deptForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </Field>
          </FormGrid>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeptOpen(false)}>Cancel</Button>
            <Button onClick={() => setDeptOpen(false)}>Save Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------ SAMPLE TYPE DIALOG ------------------------------ */}
      <Dialog open={stOpen} onOpenChange={setStOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Droplets className="h-4 w-4 text-teal-700" /> {stForm.abbreviation} — Sample Type</DialogTitle>
            <DialogDescription>Fasting and handling notes print on requisition slips and phlebo app tasks.</DialogDescription>
          </DialogHeader>
          <FormGrid cols={2}>
            <Field label="Sample Type" required><Input value={stForm.name} onChange={(e) => setStForm({ ...stForm, name: e.target.value })} /></Field>
            <Field label="Abbreviation" required><Input value={stForm.abbreviation} onChange={(e) => setStForm({ ...stForm, abbreviation: e.target.value.toUpperCase() })} /></Field>
            <Field label="Default Container" required><Input value={stForm.container} onChange={(e) => setStForm({ ...stForm, container: e.target.value })} /></Field>
            <Field label="Fasting Requirement"><Input value={stForm.fasting} onChange={(e) => setStForm({ ...stForm, fasting: e.target.value })} placeholder="e.g. 10–12 hrs fasting" /></Field>
          </FormGrid>
          <Field label="Handling Notes"><Textarea rows={3} value={stForm.notes} onChange={(e) => setStForm({ ...stForm, notes: e.target.value })} /></Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStOpen(false)}>Cancel</Button>
            <Button onClick={() => setStOpen(false)}>Save Sample Type</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------ CONTAINER DIALOG ------------------------------ */}
      <Dialog open={ctOpen} onOpenChange={setCtOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{ctForm.name} — Container</DialogTitle>
            <DialogDescription>Stock counts sync from the central store; reordering triggers at 100 units.</DialogDescription>
          </DialogHeader>
          <FormGrid cols={2}>
            <Field label="Container Name" required><Input value={ctForm.name} onChange={(e) => setCtForm({ ...ctForm, name: e.target.value })} /></Field>
            <Field label="Colour / Cap" required><Input value={ctForm.color} onChange={(e) => setCtForm({ ...ctForm, color: e.target.value })} /></Field>
            <Field label="Additive" required><Input value={ctForm.additive} onChange={(e) => setCtForm({ ...ctForm, additive: e.target.value })} /></Field>
            <Field label="Draw Volume" required><Input value={ctForm.volume} onChange={(e) => setCtForm({ ...ctForm, volume: e.target.value })} /></Field>
            <Field label="Current Stock" required><Input type="number" min={0} value={ctForm.stock} onChange={(e) => setCtForm({ ...ctForm, stock: Number(e.target.value) })} /></Field>
          </FormGrid>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCtOpen(false)}>Cancel</Button>
            <Button onClick={() => setCtOpen(false)}>Save Container</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------ ADD RANGE DIALOG ------------------------------ */}
      <Dialog open={rangeOpen} onOpenChange={setRangeOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Reference Range</DialogTitle>
            <DialogDescription>Attach a demographic band to a test — used by auto-verification and flagging.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Test" required>
              <Select value={rangeForm.testCode} onValueChange={(v) => setRangeForm({ ...rangeForm, testCode: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{tests.map((t) => <SelectItem key={t.code} value={t.code}>{t.code} — {t.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <FormGrid cols={2}>
              <Field label="Sex" required>
                <Select value={rangeForm.sex} onValueChange={(v) => setRangeForm({ ...rangeForm, sex: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Any">Any</SelectItem><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="Age Group" required><Input value={rangeForm.ageGroup} onChange={(e) => setRangeForm({ ...rangeForm, ageGroup: e.target.value })} /></Field>
            </FormGrid>
            <Field label="Reference Range" required><Input value={rangeForm.range} onChange={(e) => setRangeForm({ ...rangeForm, range: e.target.value })} placeholder="e.g. 70 – 100 mg/dL" /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRangeOpen(false)}>Cancel</Button>
            <Button onClick={() => setRangeOpen(false)}>Add Range</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------ UNIT / METHODOLOGY DIALOG ------------------------------ */}
      <Dialog open={!!unitForm} onOpenChange={(o) => !o && setUnitForm(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{unitForm ? `${unitForm.code} — Unit & Methodology` : ""}</DialogTitle>
            <DialogDescription>Units appear on result entry screens and printed reports.</DialogDescription>
          </DialogHeader>
          {unitForm ? (
            <FormGrid cols={2}>
              <Field label="Test"><Input readOnly value={`${unitForm.code} — ${unitForm.name}`} /></Field>
              <Field label="Unit"><Input value={unitForm.unit} onChange={(e) => setUnitForm({ ...unitForm, unit: e.target.value })} /></Field>
              <Field label="Methodology" className="sm:col-span-2"><Input value={unitForm.methodology} onChange={(e) => setUnitForm({ ...unitForm, methodology: e.target.value })} /></Field>
            </FormGrid>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnitForm(null)}>Cancel</Button>
            <Button onClick={() => setUnitForm(null)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

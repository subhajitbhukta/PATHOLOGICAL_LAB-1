"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { containers, departments, packages, sampleTypes, testGroups, tests } from "@/lib/lis/data";
import type { PackageItem, TestGroup, TestMaster, TestRefRange } from "@/lib/lis/data";
import { inr } from "@/lib/lis/format";
import {
  DataTable, Field, FormGrid, Money, PageHeader, Panel, StatusPill,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import {
  FlaskConical, Layers, PackageOpen, Pencil, Plus, SquareStack, Trash2,
} from "lucide-react";

interface TestForm {
  code: string; name: string; shortName: string; department: string; sampleType: string;
  container: string; methodology: string; unit: string; tatHours: number;
  resultType: TestMaster["resultType"]; b2cPrice: number; interpretation: string; status: string;
}

const RESULT_TYPES: TestMaster["resultType"][] = ["Numeric", "Text", "Pos/Neg", "Descriptive"];

export function AdminMastersTestsView() {
  const [deptF, setDeptF] = React.useState("All");
  const [statusF, setStatusF] = React.useState("All");

  // Test edit dialog
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isNew, setIsNew] = React.useState(false);
  const [form, setForm] = React.useState<TestForm | null>(null);
  const [ranges, setRanges] = React.useState<TestRefRange[]>([]);

  // Group dialog
  const [groupOpen, setGroupOpen] = React.useState(false);
  const [groupForm, setGroupForm] = React.useState({ name: "Coagulation", description: "PT, APTT, INR and fibrinogen assays", status: "Active" });
  const [groupTests, setGroupTests] = React.useState<string[]>(["CBC"]);

  // Package dialog
  const [pkgOpen, setPkgOpen] = React.useState(false);
  const [pkgForm, setPkgForm] = React.useState({ code: "PKG-CARDIAC", name: "Cardiac Risk Package", b2cPrice: 1599, tatHours: 24, includes: "Cardiac markers + lipid + HbA1c · Fasting 10 hrs", status: "Active" });
  const [pkgTests, setPkgTests] = React.useState<string[]>(["LIPID", "HBA1C", "CRP", "CBC"]);

  const rows = tests.filter(
    (t) => (deptF === "All" || t.department === deptF) && (statusF === "All" || t.status === statusF),
  );

  const openEdit = (t: TestMaster) => {
    setIsNew(false);
    setForm({
      code: t.code, name: t.name, shortName: t.shortName, department: t.department,
      sampleType: t.sampleType, container: t.container, methodology: t.methodology,
      unit: t.unit, tatHours: t.tatHours, resultType: t.resultType, b2cPrice: t.b2cPrice,
      interpretation: t.interpretation ?? "", status: t.status,
    });
    setRanges(t.refRanges.map((r) => ({ ...r })));
    setDialogOpen(true);
  };

  const openNew = () => {
    setIsNew(true);
    setForm({
      code: "HS-CRP", name: "High Sensitivity CRP", shortName: "hs-CRP", department: "Immunology",
      sampleType: "Serum", container: "Plain Vacutainer (Red)", methodology: "Immunoturbidimetry",
      unit: "mg/L", tatHours: 6, resultType: "Numeric", b2cPrice: 600, interpretation: "", status: "Active",
    });
    setRanges([{ sex: "Any", ageGroup: "Adult", range: "< 3.0 ( Low cardiovascular risk < 1.0 )" }]);
    setDialogOpen(true);
  };

  const setF = (patch: Partial<TestForm>) => setForm((f) => (f ? { ...f, ...patch } : f));
  const setRange = (i: number, patch: Partial<TestRefRange>) =>
    setRanges((rs) => rs.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  const openEditGroup = (g: TestGroup) => {
    setGroupForm({ name: g.name, description: g.description, status: g.status });
    setGroupTests([...g.tests]);
    setGroupOpen(true);
  };

  const openEditPackage = (p: PackageItem) => {
    setPkgForm({ code: p.code, name: p.name, b2cPrice: p.b2cPrice, tatHours: p.tatHours, includes: p.includes ?? "", status: p.status });
    setPkgTests([...p.tests]);
    setPkgOpen(true);
  };

  const columns: Column<TestMaster>[] = [
    { key: "code", header: "Code", value: (r) => r.code, render: (r) => <Badge variant="outline" className="font-mono text-[10px]">{r.code}</Badge> },
    { key: "name", header: "Test", value: (r) => r.name, render: (r) => (
      <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{r.name}</p><p className="text-[11px] text-muted-foreground">{r.shortName}{r.group ? ` · ${r.group}` : ""}</p></div>
    ) },
    { key: "dept", header: "Department", value: (r) => r.department, render: (r) => <span className="text-xs">{r.department}</span> },
    { key: "sample", header: "Sample", value: (r) => r.sampleType, render: (r) => <span className="hidden text-xs text-muted-foreground md:table-cell">{r.sampleType}</span> },
    { key: "container", header: "Container", value: (r) => r.container, render: (r) => <span className="hidden text-xs text-muted-foreground lg:table-cell">{r.container}</span> },
    { key: "method", header: "Methodology", value: (r) => r.methodology, render: (r) => <span className="hidden max-w-44 truncate text-xs text-muted-foreground xl:table-cell">{r.methodology}</span> },
    { key: "tat", header: "TAT", headClassName: "text-right", className: "text-right", value: (r) => r.tatHours, render: (r) => <span className="whitespace-nowrap text-xs tabular-nums">{r.tatHours} h</span> },
    { key: "rtype", header: "Result", value: (r) => r.resultType, render: (r) => <Badge variant="outline" className="text-[10px]">{r.resultType}</Badge> },
    { key: "price", header: "B2C Price", headClassName: "text-right", className: "text-right", value: (r) => r.b2cPrice, render: (r) => <Money value={r.b2cPrice} /> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "act", header: "", render: (r) => (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)} aria-label={`Edit ${r.name}`}><Pencil className="h-3.5 w-3.5" /></Button>
    ) },
  ];

  const groupColumns: Column<TestGroup>[] = [
    { key: "id", header: "ID", value: (r) => r.id, render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.id}</span> },
    { key: "name", header: "Group", value: (r) => r.name, render: (r) => <span className="text-sm font-medium">{r.name}</span> },
    { key: "desc", header: "Description", value: (r) => r.description, render: (r) => <span className="text-xs text-muted-foreground">{r.description}</span> },
    { key: "tests", header: "Member Tests", value: (r) => r.tests.length, render: (r) => (
      <div className="flex flex-wrap gap-1">{r.tests.map((c) => <Badge key={c} variant="outline" className="font-mono text-[10px]">{c}</Badge>)}</div>
    ) },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "act", header: "", render: (r) => <Button variant="outline" size="sm" className="h-7" onClick={() => openEditGroup(r)}><Pencil className="mr-1 h-3 w-3" /> Edit</Button> },
  ];

  const profileNames = Array.from(new Set(tests.map((t) => t.profile).filter(Boolean))) as string[];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Test & Package Masters"
        subtitle="28 investigations · 9 groups · 6 packages — methodology, TAT, reference ranges and list pricing"
        icon={<FlaskConical className="h-5 w-5" />}
      />

      <Tabs defaultValue="master">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="master">Test Master</TabsTrigger>
          <TabsTrigger value="groups">Test Groups</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="profiles">Profiles / Panels</TabsTrigger>
        </TabsList>

        {/* ------------------------------ TEST MASTER ------------------------------ */}
        <TabsContent value="master" className="space-y-4">
          <Panel title="All Tests" description="Click a row to edit methodology, TAT, reference ranges and B2C price">
            <DataTable
              columns={columns}
              rows={rows}
              dense
              pageSize={10}
              searchOf={(r) => `${r.code} ${r.name} ${r.department} ${r.methodology}`}
              searchPlaceholder="Search code / name / method…"
              onRowClick={(r) => openEdit(r)}
              filters={
                <>
                  <Select value={deptF} onValueChange={setDeptF}>
                    <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All departments</SelectItem>
                      {departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={statusF} onValueChange={setStatusF}>
                    <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              }
              toolbar={<Button size="sm" onClick={openNew}><Plus className="mr-1.5 h-3.5 w-3.5" /> New Test</Button>}
            />
          </Panel>
        </TabsContent>

        {/* ------------------------------ TEST GROUPS ------------------------------ */}
        <TabsContent value="groups" className="space-y-4">
          <Panel
            title="Test Groups"
            description="Group related assays for ordering shortcuts and reporting"
            actions={
              <Button size="sm" onClick={() => { setGroupForm({ name: "Coagulation", description: "PT, APTT, INR and fibrinogen assays", status: "Active" }); setGroupTests(["CBC"]); setGroupOpen(true); }}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> New Group
              </Button>
            }
          >
            <DataTable
              columns={groupColumns}
              rows={testGroups}
              pageSize={8}
              searchOf={(r) => `${r.name} ${r.description} ${r.tests.join(" ")}`}
              searchPlaceholder="Search group / test code…"
              onRowClick={(r) => openEditGroup(r)}
            />
          </Panel>
        </TabsContent>

        {/* ------------------------------ PACKAGES ------------------------------ */}
        <TabsContent value="packages" className="space-y-4">
          <Panel
            title="Health Checkup Packages"
            description="Bundled panels sold at a packaged B2C price — components reported together"
            actions={
              <Button size="sm" onClick={() => { setPkgForm({ code: "PKG-CARDIAC", name: "Cardiac Risk Package", b2cPrice: 1599, tatHours: 24, includes: "Cardiac markers + lipid + HbA1c · Fasting 10 hrs", status: "Active" }); setPkgTests(["LIPID", "HBA1C", "CRP", "CBC"]); setPkgOpen(true); }}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> New Package
              </Button>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {packages.map((p) => (
                <div key={p.code} className="flex flex-col rounded-lg border border-slate-200 p-4 transition-colors hover:border-teal-300">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{p.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{p.code}</p>
                    </div>
                    <StatusPill status={p.status} />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-teal-700">{inr(p.b2cPrice)}</span>
                    <span className="text-[11px] text-muted-foreground">B2C · TAT {p.tatHours} h</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.includes ?? `${p.tests.length} investigations`}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.tests.slice(0, 6).map((c) => <Badge key={c} variant="outline" className="font-mono text-[10px]">{c}</Badge>)}
                    {p.tests.length > 6 ? <Badge variant="outline" className="text-[10px]">+{p.tests.length - 6} more</Badge> : null}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-dashed pt-2.5">
                    <span className="text-xs font-medium text-slate-600">{p.tests.length} tests included</span>
                    <Button variant="outline" size="sm" className="h-7" onClick={() => openEditPackage(p)}><Pencil className="mr-1 h-3 w-3" /> Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>

        {/* ------------------------------ PROFILES / PANELS ------------------------------ */}
        <TabsContent value="profiles" className="space-y-4">
          <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-4 text-xs leading-relaxed text-teal-900">
            <span className="font-semibold">Note:</span> Profiles (panels) are billed as a single code — the component tests below are
            reported together on one report under the profile heading. Profile pricing flows through the Pricing Engine like any other test;
            B2B partners receive profile-specific contracted rates. Add new profiles here first, then map member tests.
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {profileNames.map((pf) => {
              const members = tests.filter((t) => t.profile === pf);
              const total = members.reduce((a, t) => a + t.b2cPrice, 0);
              return (
                <div key={pf} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center gap-2">
                    <SquareStack className="h-4 w-4 text-teal-700" />
                    <p className="text-sm font-semibold text-slate-800">{pf}</p>
                    <Badge variant="outline" className="ml-auto text-[10px]">{members.length} tests</Badge>
                  </div>
                  <ul className="mt-2.5 space-y-1.5">
                    {members.map((m) => (
                      <li key={m.code} className="flex items-center justify-between gap-2 text-xs">
                        <span className="min-w-0 truncate">{m.name} <span className="font-mono text-[10px] text-slate-400">{m.code}</span></span>
                        <Money value={m.b2cPrice} className="shrink-0 text-xs" />
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center justify-between border-t border-dashed pt-2 text-xs">
                    <span className="text-muted-foreground">Sum of components</span>
                    <span className="font-semibold tabular-nums">{inr(total)}</span>
                  </div>
                </div>
              );
            })}
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 p-4 text-center">
              <Layers className="h-6 w-6 text-slate-300" />
              <p className="text-xs font-medium text-slate-600">New profile</p>
              <p className="text-[11px] text-muted-foreground">Define Liver, Renal, Cardiac-style panels — member tests stay individually orderable.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ------------------------------ TEST DIALOG ------------------------------ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isNew ? "New Test" : `Edit Test — ${form?.code}`}</DialogTitle>
            <DialogDescription>Master data feeds ordering, barcodes, result entry templates and the pricing engine.</DialogDescription>
          </DialogHeader>
          {form ? (
            <div className="space-y-4">
              <FormGrid cols={3}>
                <Field label="Test Name" required className="sm:col-span-2"><Input value={form.name} onChange={(e) => setF({ name: e.target.value })} /></Field>
                <Field label="Short Name" required><Input value={form.shortName} onChange={(e) => setF({ shortName: e.target.value })} /></Field>
                <Field label="Test Code" required><Input value={form.code} onChange={(e) => setF({ code: e.target.value.toUpperCase() })} /></Field>
                <Field label="Department" required>
                  <Select value={form.department} onValueChange={(v) => setF({ department: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Status">
                  <Select value={form.status} onValueChange={(v) => setF({ status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                  </Select>
                </Field>
                <Field label="Sample Type" required>
                  <Select value={form.sampleType} onValueChange={(v) => setF({ sampleType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{sampleTypes.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Container" required>
                  <Select value={form.container} onValueChange={(v) => setF({ container: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{containers.map((c) => <SelectItem key={c.id} value={c.name}>{c.name} ({c.color})</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Methodology" required><Input value={form.methodology} onChange={(e) => setF({ methodology: e.target.value })} /></Field>
                <Field label="Unit"><Input value={form.unit} onChange={(e) => setF({ unit: e.target.value })} placeholder="e.g. mg/dL or —" /></Field>
                <Field label="TAT (hours)" required><Input type="number" min={1} value={form.tatHours} onChange={(e) => setF({ tatHours: Number(e.target.value) })} /></Field>
                <Field label="Result Type" required>
                  <Select value={form.resultType} onValueChange={(v) => setF({ resultType: v as TestMaster["resultType"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{RESULT_TYPES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="B2C List Price (₹)" required><Input type="number" min={0} value={form.b2cPrice} onChange={(e) => setF({ b2cPrice: Number(e.target.value) })} /></Field>
              </FormGrid>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-700">Reference Ranges</p>
                  <Button variant="outline" size="sm" className="h-7" onClick={() => setRanges((rs) => [...rs, { sex: "Any", ageGroup: "Adult", range: "" }])}>
                    <Plus className="mr-1 h-3 w-3" /> Add range
                  </Button>
                </div>
                <div className="space-y-2">
                  {ranges.map((r, i) => (
                    <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 p-2 sm:grid-cols-[110px_150px_1fr_auto]">
                      <Select value={r.sex} onValueChange={(v) => setRange(i, { sex: v as TestRefRange["sex"] })}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Any">Any</SelectItem><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                      </Select>
                      <Input className="h-9" value={r.ageGroup} onChange={(e) => setRange(i, { ageGroup: e.target.value })} placeholder="Age group" />
                      <Input className="h-9" value={r.range} onChange={(e) => setRange(i, { range: e.target.value })} placeholder="e.g. 70 – 100 mg/dL" />
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-600" onClick={() => setRanges((rs) => rs.filter((_, j) => j !== i))} aria-label="Remove range">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  {ranges.length === 0 ? <p className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">No reference ranges yet — add at least one for the adult population.</p> : null}
                </div>
              </div>

              <Field label="Clinical Interpretation" hint="Printed under the interpretation block on the report">
                <Textarea rows={3} value={form.interpretation} onChange={(e) => setF({ interpretation: e.target.value })} placeholder="Guidance for referring doctors…" />
              </Field>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => setDialogOpen(false)}>{isNew ? "Create Test" : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------ GROUP DIALOG ------------------------------ */}
      <Dialog open={groupOpen} onOpenChange={setGroupOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{groupForm.name ? `Test Group — ${groupForm.name}` : "New Test Group"}</DialogTitle>
            <DialogDescription>Groups appear as quick-pick sections in Central Patient Entry.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <FormGrid cols={2}>
              <Field label="Group Name" required><Input value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} /></Field>
              <Field label="Status">
                <Select value={groupForm.status} onValueChange={(v) => setGroupForm({ ...groupForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </Field>
            </FormGrid>
            <Field label="Description"><Input value={groupForm.description} onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })} /></Field>
            <Field label={`Member Tests (${groupTests.length} selected)`}>
              <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border p-2">
                {tests.map((t) => {
                  const checked = groupTests.includes(t.code);
                  return (
                    <label key={t.code} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-slate-50">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => setGroupTests((cur) => (cur.includes(t.code) ? cur.filter((c) => c !== t.code) : [...cur, t.code]))}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm">{t.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{t.code}</span>
                    </label>
                  );
                })}
              </div>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupOpen(false)}>Cancel</Button>
            <Button onClick={() => setGroupOpen(false)}>Save Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------ PACKAGE DIALOG ------------------------------ */}
      <Dialog open={pkgOpen} onOpenChange={setPkgOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><PackageOpen className="h-4 w-4 text-teal-700" /> {pkgForm.code} — Package Setup</DialogTitle>
            <DialogDescription>Pick component tests; the package price overrides their individual list prices.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <FormGrid cols={2}>
              <Field label="Package Name" required><Input value={pkgForm.name} onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })} /></Field>
              <Field label="Package Code" required><Input value={pkgForm.code} onChange={(e) => setPkgForm({ ...pkgForm, code: e.target.value.toUpperCase() })} /></Field>
              <Field label="B2C Package Price (₹)" required><Input type="number" min={0} value={pkgForm.b2cPrice} onChange={(e) => setPkgForm({ ...pkgForm, b2cPrice: Number(e.target.value) })} /></Field>
              <Field label="TAT (hours)" required><Input type="number" min={1} value={pkgForm.tatHours} onChange={(e) => setPkgForm({ ...pkgForm, tatHours: Number(e.target.value) })} /></Field>
            </FormGrid>
            <Field label="Inclusions / Marketing Note"><Input value={pkgForm.includes} onChange={(e) => setPkgForm({ ...pkgForm, includes: e.target.value })} /></Field>
            <Field label="Status">
              <Select value={pkgForm.status} onValueChange={(v) => setPkgForm({ ...pkgForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label={`Component Tests (${pkgTests.length} selected)`}>
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border p-2">
                {tests.map((t) => {
                  const checked = pkgTests.includes(t.code);
                  return (
                    <label key={t.code} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-slate-50">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => setPkgTests((cur) => (cur.includes(t.code) ? cur.filter((c) => c !== t.code) : [...cur, t.code]))}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm">{t.name}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">{inr(t.b2cPrice)}</span>
                    </label>
                  );
                })}
              </div>
            </Field>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
              <span className="text-muted-foreground">Sum of component list prices</span>
              <span className="font-semibold tabular-nums">{inr(tests.filter((t) => pkgTests.includes(t.code)).reduce((a, t) => a + t.b2cPrice, 0))}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPkgOpen(false)}>Cancel</Button>
            <Button onClick={() => setPkgOpen(false)}>Save Package</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

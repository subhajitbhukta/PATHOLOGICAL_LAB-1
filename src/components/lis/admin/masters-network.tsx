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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { branches, couriers, pathologists, reportTemplates } from "@/lib/lis/data";
import type { Branch, Courier, Pathologist, ReportTemplate } from "@/lib/lis/data";
import { DataTable, Field, FormGrid, PageHeader, Panel, StatusPill } from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { Building2, FileText, Pencil, Plus, Stethoscope, Truck } from "lucide-react";

const BRANCH_TYPES: Branch["type"][] = ["Central Lab", "Collection Centre", "Processing Unit"];

export function AdminMastersNetworkView() {
  // Branch dialog
  const [brOpen, setBrOpen] = React.useState(false);
  const [brForm, setBrForm] = React.useState({ name: "Apex Collection Point — Borivali", type: "Collection Centre", city: "Mumbai", address: "Shop 4, Rail Vihar, Borivali West", incharge: "Nikhil Rane", mobile: "+91 98200 71205", status: "Active" });

  // Courier dialog
  const [coOpen, setCoOpen] = React.useState(false);
  const [coForm, setCoForm] = React.useState({ name: "V-Express Cold Chain", type: "Agency", contactPerson: "Mahesh Salvi", mobile: "+91 98330 51005", cities: "Pune · Mumbai", dailyTrips: 2, status: "Active" });

  // Pathologist dialog
  const [paOpen, setPaOpen] = React.useState(false);
  const [paForm, setPaForm] = React.useState({ name: "Dr. Rahul Joshi", qualification: "MD (Pathology)", regNo: "MMC/2016/40221", speciality: "Clinical Pathology", mobile: "+91 98200 71005", email: "rahul.j@apexlabs.in", signatureOnFile: true, status: "Active" });

  // Template dialog + switch state
  const [tpOpen, setTpOpen] = React.useState(false);
  const [tpForm, setTpForm] = React.useState<{ id: string; name: string; appliesTo: string; format: string; header: string; footer: string; hasQr: boolean; hasSignature: boolean; status: string } | null>(null);
  const [tplSwitch, setTplSwitch] = React.useState<Record<string, { qr: boolean; sig: boolean }>>(() =>
    Object.fromEntries(reportTemplates.map((t) => [t.id, { qr: t.hasQr, sig: t.hasSignature }])),
  );

  const openEditBranch = (b: Branch) => {
    setBrForm({ name: b.name, type: b.type, city: b.city, address: b.address, incharge: b.incharge, mobile: b.mobile, status: b.status });
    setBrOpen(true);
  };

  const openEditCourier = (c: Courier) => {
    setCoForm({ name: c.name, type: c.type, contactPerson: c.contactPerson, mobile: c.mobile, cities: c.cities, dailyTrips: c.dailyTrips, status: c.status });
    setCoOpen(true);
  };

  const openEditPathologist = (p: Pathologist) => {
    setPaForm({ name: p.name, qualification: p.qualification, regNo: p.regNo, speciality: p.speciality, mobile: p.mobile, email: p.email, signatureOnFile: p.signatureOnFile, status: p.status });
    setPaOpen(true);
  };

  const openEditTemplate = (t: ReportTemplate) => {
    setTpForm({ id: t.id, name: t.name, appliesTo: t.appliesTo, format: t.format, header: t.header, footer: t.footer, hasQr: t.hasQr, hasSignature: t.hasSignature, status: t.status });
    setTpOpen(true);
  };

  // ---- Branches ----
  const brColumns: Column<Branch>[] = [
    { key: "name", header: "Branch", value: (r) => r.name, render: (r) => (
      <div className="min-w-0"><p className="truncate text-sm font-medium">{r.name}</p><p className="font-mono text-[10px] text-muted-foreground">{r.id}</p></div>
    ) },
    { key: "type", header: "Type", value: (r) => r.type, render: (r) => (
      <Badge variant="outline" className={`text-[10px] ${r.type === "Central Lab" ? "border-teal-200 bg-teal-50 text-teal-700" : r.type === "Processing Unit" ? "border-violet-200 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600"}`}>{r.type}</Badge>
    ) },
    { key: "city", header: "City", value: (r) => r.city, render: (r) => <span className="text-xs">{r.city}</span> },
    { key: "address", header: "Address", value: (r) => r.address, render: (r) => <span className="hidden max-w-56 truncate text-xs text-muted-foreground md:table-cell">{r.address}</span> },
    { key: "incharge", header: "In-charge", value: (r) => r.incharge, render: (r) => <span className="text-xs">{r.incharge}</span> },
    { key: "mobile", header: "Mobile", value: (r) => r.mobile, render: (r) => <span className="hidden font-mono text-xs text-muted-foreground lg:table-cell">{r.mobile}</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "act", header: "", render: (r) => (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditBranch(r)} aria-label={`Edit ${r.name}`}><Pencil className="h-3.5 w-3.5" /></Button>
    ) },
  ];

  // ---- Couriers ----
  const coColumns: Column<Courier>[] = [
    { key: "name", header: "Courier", value: (r) => r.name, render: (r) => (
      <div><p className="text-sm font-medium">{r.name}</p><p className="font-mono text-[10px] text-muted-foreground">{r.id}</p></div>
    ) },
    { key: "type", header: "Type", value: (r) => r.type, render: (r) => (
      <Badge variant="outline" className={`text-[10px] ${r.type === "In-house" ? "border-teal-200 bg-teal-50 text-teal-700" : "border-violet-200 bg-violet-50 text-violet-700"}`}>{r.type}</Badge>
    ) },
    { key: "contact", header: "Contact Person", value: (r) => r.contactPerson, render: (r) => <span className="text-xs">{r.contactPerson}</span> },
    { key: "mobile", header: "Mobile", value: (r) => r.mobile, render: (r) => <span className="hidden font-mono text-xs text-muted-foreground md:table-cell">{r.mobile}</span> },
    { key: "cities", header: "Routes / Cities", value: (r) => r.cities, render: (r) => <span className="max-w-60 truncate text-xs text-muted-foreground">{r.cities}</span> },
    { key: "trips", header: "Daily Trips", headClassName: "text-right", className: "text-right", value: (r) => r.dailyTrips, render: (r) => <span className="text-xs font-semibold tabular-nums">{r.dailyTrips}</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "act", header: "", render: (r) => (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditCourier(r)} aria-label={`Edit ${r.name}`}><Pencil className="h-3.5 w-3.5" /></Button>
    ) },
  ];

  // ---- Pathologists ----
  const paColumns: Column<Pathologist>[] = [
    { key: "name", header: "Pathologist", value: (r) => r.name, render: (r) => (
      <div><p className="text-sm font-medium">{r.name}</p><p className="font-mono text-[10px] text-muted-foreground">{r.id}</p></div>
    ) },
    { key: "qual", header: "Qualification", value: (r) => r.qualification, render: (r) => <span className="text-xs">{r.qualification}</span> },
    { key: "reg", header: "Reg. No.", value: (r) => r.regNo, render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.regNo}</span> },
    { key: "spec", header: "Speciality", value: (r) => r.speciality, render: (r) => <span className="max-w-52 truncate text-xs text-muted-foreground">{r.speciality}</span> },
    { key: "mobile", header: "Mobile", value: (r) => r.mobile, render: (r) => <span className="hidden font-mono text-xs text-muted-foreground lg:table-cell">{r.mobile}</span> },
    { key: "sig", header: "Signature", value: (r) => (r.signatureOnFile ? "On file" : "Pending"), render: (r) => (
      r.signatureOnFile
        ? <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700">On file</Badge>
        : <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] text-amber-700">Pending</Badge>
    ) },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "act", header: "", render: (r) => (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditPathologist(r)} aria-label={`Edit ${r.name}`}><Pencil className="h-3.5 w-3.5" /></Button>
    ) },
  ];

  // ---- Report templates ----
  const tpColumns: Column<ReportTemplate>[] = [
    { key: "name", header: "Template", value: (r) => r.name, render: (r) => (
      <div><p className="text-sm font-medium">{r.name}</p><p className="font-mono text-[10px] text-muted-foreground">{r.id}</p></div>
    ) },
    { key: "applies", header: "Applies To", value: (r) => r.appliesTo, render: (r) => <span className="max-w-48 truncate text-xs text-muted-foreground">{r.appliesTo}</span> },
    { key: "format", header: "Format", value: (r) => r.format, render: (r) => <Badge variant="outline" className="text-[10px]">{r.format}</Badge> },
    { key: "header", header: "Header Note", value: (r) => r.header, render: (r) => <span className="hidden max-w-56 truncate text-xs text-muted-foreground lg:table-cell">{r.header}</span> },
    { key: "qr", header: "QR Verify", value: (r) => (tplSwitch[r.id]?.qr ? "On" : "Off"), render: (r) => (
      <Switch
        checked={tplSwitch[r.id]?.qr ?? false}
        onCheckedChange={(v) => setTplSwitch((sw) => ({ ...sw, [r.id]: { ...sw[r.id], qr: v } }))}
        aria-label={`Toggle QR on ${r.name}`}
      />
    ) },
    { key: "sig", header: "Signature", value: (r) => (tplSwitch[r.id]?.sig ? "On" : "Off"), render: (r) => (
      <Switch
        checked={tplSwitch[r.id]?.sig ?? false}
        onCheckedChange={(v) => setTplSwitch((sw) => ({ ...sw, [r.id]: { ...sw[r.id], sig: v } }))}
        aria-label={`Toggle signature on ${r.name}`}
      />
    ) },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "act", header: "", render: (r) => (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditTemplate(r)} aria-label={`Edit ${r.name}`}><Pencil className="h-3.5 w-3.5" /></Button>
    ) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Network & Template Masters"
        subtitle="Branches, logistics partners, signing pathologists and printable report formats"
        icon={<Building2 className="h-5 w-5" />}
      />

      <Tabs defaultValue="branches">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="branches">Branches &amp; Centres</TabsTrigger>
          <TabsTrigger value="couriers">Couriers / Logistics</TabsTrigger>
          <TabsTrigger value="pathologists">Pathologist Master</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
        </TabsList>

        {/* ------------------------------ BRANCHES ------------------------------ */}
        <TabsContent value="branches">
          <Panel title="Branches & Collection Centres" description="Central lab, processing hubs and patient-facing collection points">
            <DataTable
              columns={brColumns}
              rows={branches}
              pageSize={6}
              searchOf={(r) => `${r.name} ${r.city} ${r.incharge} ${r.address}`}
              searchPlaceholder="Search branch / city / in-charge…"
              onRowClick={(r) => openEditBranch(r)}
              filters={
                <>
                  <Select defaultValue="All">
                    <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All types</SelectItem>
                      {BRANCH_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select defaultValue="All">
                    <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              }
              toolbar={<Button size="sm" onClick={() => { setBrForm({ name: "Apex Collection Point — Borivali", type: "Collection Centre", city: "Mumbai", address: "Shop 4, Rail Vihar, Borivali West", incharge: "Nikhil Rane", mobile: "+91 98200 71205", status: "Active" }); setBrOpen(true); }}><Plus className="mr-1.5 h-3.5 w-3.5" /> Add Branch</Button>}
            />
          </Panel>
        </TabsContent>

        {/* ------------------------------ COURIERS ------------------------------ */}
        <TabsContent value="couriers">
          <Panel title="Couriers & Logistics" description="Sample movement partners with route coverage and daily trip capacity">
            <DataTable
              columns={coColumns}
              rows={couriers}
              pageSize={6}
              searchOf={(r) => `${r.name} ${r.contactPerson} ${r.cities}`}
              searchPlaceholder="Search courier / city…"
              onRowClick={(r) => openEditCourier(r)}
              filters={
                <>
                  <Select defaultValue="All">
                    <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All types</SelectItem>
                      <SelectItem value="Agency">Agency</SelectItem>
                      <SelectItem value="In-house">In-house</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="All">
                    <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              }
              toolbar={<Button size="sm" onClick={() => { setCoForm({ name: "V-Express Cold Chain", type: "Agency", contactPerson: "Mahesh Salvi", mobile: "+91 98330 51005", cities: "Pune · Mumbai", dailyTrips: 2, status: "Active" }); setCoOpen(true); }}><Plus className="mr-1.5 h-3.5 w-3.5" /> Add Courier</Button>}
            />
          </Panel>
        </TabsContent>

        {/* ------------------------------ PATHOLOGISTS ------------------------------ */}
        <TabsContent value="pathologists">
          <Panel
            title="Pathologist Master"
            description="Registered signatories — reports can only be approved by pathologists with registration on file"
          >
            <DataTable
              columns={paColumns}
              rows={pathologists}
              pageSize={6}
              searchOf={(r) => `${r.name} ${r.qualification} ${r.regNo} ${r.speciality}`}
              searchPlaceholder="Search name / reg no / speciality…"
              onRowClick={(r) => openEditPathologist(r)}
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
              toolbar={<Button size="sm" onClick={() => { setPaForm({ name: "Dr. Rahul Joshi", qualification: "MD (Pathology)", regNo: "MMC/2016/40221", speciality: "Clinical Pathology", mobile: "+91 98200 71005", email: "rahul.j@apexlabs.in", signatureOnFile: true, status: "Active" }); setPaOpen(true); }}><Plus className="mr-1.5 h-3.5 w-3.5" /> Add Pathologist</Button>}
            />
          </Panel>
        </TabsContent>

        {/* ------------------------------ REPORT TEMPLATES ------------------------------ */}
        <TabsContent value="templates">
          <Panel
            title="Report Templates"
            description="Print formats with QR verification and digital signature switches — toggles apply instantly"
          >
            <DataTable
              columns={tpColumns}
              rows={reportTemplates}
              pageSize={5}
              searchOf={(r) => `${r.name} ${r.appliesTo} ${r.format}`}
              searchPlaceholder="Search template / format…"
              onRowClick={(r) => openEditTemplate(r)}
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
              toolbar={
                <Button size="sm" onClick={() => { setTpForm({ id: "RT-NEW", name: "Oncology Marker Report", appliesTo: "Tumour marker panels", format: "A4 Portrait", header: "Oncology header with reference lab note", footer: "Standard footer with QR", hasQr: true, hasSignature: true, status: "Active" }); setTpOpen(true); }}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> New Template
                </Button>
              }
            />
          </Panel>
        </TabsContent>
      </Tabs>

      {/* ------------------------------ BRANCH DIALOG ------------------------------ */}
      <Dialog open={brOpen} onOpenChange={setBrOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Building2 className="h-4 w-4 text-teal-700" /> {brForm.name}</DialogTitle>
            <DialogDescription>Collection centres route pickups to their assigned processing hub.</DialogDescription>
          </DialogHeader>
          <FormGrid cols={2}>
            <Field label="Branch Name" required className="sm:col-span-2"><Input value={brForm.name} onChange={(e) => setBrForm({ ...brForm, name: e.target.value })} /></Field>
            <Field label="Type" required>
              <Select value={brForm.type} onValueChange={(v) => setBrForm({ ...brForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BRANCH_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="City" required><Input value={brForm.city} onChange={(e) => setBrForm({ ...brForm, city: e.target.value })} /></Field>
            <Field label="Address" className="sm:col-span-2"><Input value={brForm.address} onChange={(e) => setBrForm({ ...brForm, address: e.target.value })} /></Field>
            <Field label="In-charge" required><Input value={brForm.incharge} onChange={(e) => setBrForm({ ...brForm, incharge: e.target.value })} /></Field>
            <Field label="Mobile" required><Input value={brForm.mobile} onChange={(e) => setBrForm({ ...brForm, mobile: e.target.value })} /></Field>
            <Field label="Status">
              <Select value={brForm.status} onValueChange={(v) => setBrForm({ ...brForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </Field>
          </FormGrid>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBrOpen(false)}>Cancel</Button>
            <Button onClick={() => setBrOpen(false)}>Save Branch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------ COURIER DIALOG ------------------------------ */}
      <Dialog open={coOpen} onOpenChange={setCoOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Truck className="h-4 w-4 text-teal-700" /> {coForm.name}</DialogTitle>
            <DialogDescription>Couriers are assignable on pickup manifests and inter-city sample transfers.</DialogDescription>
          </DialogHeader>
          <FormGrid cols={2}>
            <Field label="Courier Name" required><Input value={coForm.name} onChange={(e) => setCoForm({ ...coForm, name: e.target.value })} /></Field>
            <Field label="Type" required>
              <Select value={coForm.type} onValueChange={(v) => setCoForm({ ...coForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Agency">Agency</SelectItem><SelectItem value="In-house">In-house</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label="Contact Person" required><Input value={coForm.contactPerson} onChange={(e) => setCoForm({ ...coForm, contactPerson: e.target.value })} /></Field>
            <Field label="Mobile" required><Input value={coForm.mobile} onChange={(e) => setCoForm({ ...coForm, mobile: e.target.value })} /></Field>
            <Field label="Routes / Cities" className="sm:col-span-2"><Input value={coForm.cities} onChange={(e) => setCoForm({ ...coForm, cities: e.target.value })} /></Field>
            <Field label="Daily Trips" required><Input type="number" min={1} value={coForm.dailyTrips} onChange={(e) => setCoForm({ ...coForm, dailyTrips: Number(e.target.value) })} /></Field>
            <Field label="Status">
              <Select value={coForm.status} onValueChange={(v) => setCoForm({ ...coForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </Field>
          </FormGrid>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCoOpen(false)}>Cancel</Button>
            <Button onClick={() => setCoOpen(false)}>Save Courier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------ PATHOLOGIST DIALOG ------------------------------ */}
      <Dialog open={paOpen} onOpenChange={setPaOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-teal-700" /> {paForm.name}</DialogTitle>
            <DialogDescription>Council registration and digital signature are mandatory for report approval.</DialogDescription>
          </DialogHeader>
          <FormGrid cols={2}>
            <Field label="Full Name" required><Input value={paForm.name} onChange={(e) => setPaForm({ ...paForm, name: e.target.value })} /></Field>
            <Field label="Qualification" required><Input value={paForm.qualification} onChange={(e) => setPaForm({ ...paForm, qualification: e.target.value })} /></Field>
            <Field label="Registration No." required><Input value={paForm.regNo} onChange={(e) => setPaForm({ ...paForm, regNo: e.target.value })} /></Field>
            <Field label="Speciality" required><Input value={paForm.speciality} onChange={(e) => setPaForm({ ...paForm, speciality: e.target.value })} /></Field>
            <Field label="Mobile" required><Input value={paForm.mobile} onChange={(e) => setPaForm({ ...paForm, mobile: e.target.value })} /></Field>
            <Field label="Email" required><Input value={paForm.email} onChange={(e) => setPaForm({ ...paForm, email: e.target.value })} /></Field>
            <Field label="Signature on File">
              <div className="flex items-center gap-2 pt-1.5">
                <Switch checked={paForm.signatureOnFile} onCheckedChange={(v) => setPaForm({ ...paForm, signatureOnFile: v })} aria-label="Signature on file" />
                <span className="text-xs text-muted-foreground">{paForm.signatureOnFile ? "Scanned signature uploaded" : "Upload pending"}</span>
              </div>
            </Field>
            <Field label="Status">
              <Select value={paForm.status} onValueChange={(v) => setPaForm({ ...paForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </Field>
          </FormGrid>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaOpen(false)}>Cancel</Button>
            <Button onClick={() => setPaOpen(false)}>Save Pathologist</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------ TEMPLATE DIALOG ------------------------------ */}
      <Dialog open={tpOpen} onOpenChange={(o) => { if (!o) setTpForm(null); }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="h-4 w-4 text-teal-700" /> {tpForm?.name ?? "Report Template"}</DialogTitle>
            <DialogDescription>Header and footer render on every printed page of the PDF.</DialogDescription>
          </DialogHeader>
          {tpForm ? (
            <div className="space-y-4">
              <FormGrid cols={2}>
                <Field label="Template Name" required><Input value={tpForm.name} onChange={(e) => setTpForm({ ...tpForm, name: e.target.value })} /></Field>
                <Field label="Applies To" required><Input value={tpForm.appliesTo} onChange={(e) => setTpForm({ ...tpForm, appliesTo: e.target.value })} /></Field>
                <Field label="Format" required>
                  <Select value={tpForm.format} onValueChange={(v) => setTpForm({ ...tpForm, format: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4 Portrait">A4 Portrait</SelectItem>
                      <SelectItem value="A4 Portrait (2 page)">A4 Portrait (2 page)</SelectItem>
                      <SelectItem value="A4 Portrait (4 page)">A4 Portrait (4 page)</SelectItem>
                      <SelectItem value="A4 Landscape batch">A4 Landscape batch</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Status">
                  <Select value={tpForm.status} onValueChange={(v) => setTpForm({ ...tpForm, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                  </Select>
                </Field>
              </FormGrid>
              <Field label="Header"><Textarea rows={2} value={tpForm.header} onChange={(e) => setTpForm({ ...tpForm, header: e.target.value })} /></Field>
              <Field label="Footer"><Textarea rows={2} value={tpForm.footer} onChange={(e) => setTpForm({ ...tpForm, footer: e.target.value })} /></Field>
              <div className="flex flex-wrap gap-6 rounded-lg border border-slate-200 p-3">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={tpForm.hasQr} onCheckedChange={(v) => setTpForm({ ...tpForm, hasQr: v })} aria-label="QR verification" />
                  QR verification block
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={tpForm.hasSignature} onCheckedChange={(v) => setTpForm({ ...tpForm, hasSignature: v })} aria-label="Digital signature" />
                  Pathologist digital signature
                </label>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTpForm(null)}>Cancel</Button>
            <Button onClick={() => setTpOpen(false)}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

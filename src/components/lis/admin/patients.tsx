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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { doctors, orders, partners, patients, reports } from "@/lib/lis/data";
import type { Patient } from "@/lib/lis/data";
import { fmtDate, fmtDateTime } from "@/lib/lis/format";
import {
  ChannelPill, DataTable, EmptyState, Field, KeyValue, Money, PageHeader, Panel, StatCard, StatusPill,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { ReportDialog, toReportView } from "@/components/lis/report-sheet";
import type { ReportViewData } from "@/components/lis/report-sheet";
import { CalendarPlus, FileText, ReceiptText, UserPlus, Users } from "lucide-react";

const CITIES = Array.from(new Set(patients.map((p) => p.city)));

export function AdminPatientsView() {
  const [channelF, setChannelF] = React.useState("All");
  const [cityF, setCityF] = React.useState("All");
  const [selected, setSelected] = React.useState<Patient | null>(null);
  const [regOpen, setRegOpen] = React.useState(false);
  const [report, setReport] = React.useState<ReportViewData | null>(null);

  const [regForm, setRegForm] = React.useState({
    name: "Naveen Kulkarni", dob: "1987-07-19", gender: "Male", mobile: "+91 98331 22101",
    email: "naveen.k@gmail.com", address: "12, Shivneri Apts, Kothrud", city: "Pune",
    idProof: "Aadhaar XXXX 7712", source: "B2C Walk-in",
  });

  const rows = patients.filter(
    (p) => (channelF === "All" || p.channel === channelF) && (cityF === "All" || p.city === cityF),
  );

  const b2cCount = patients.filter((p) => p.channel === "B2C").length;
  const b2bCount = patients.filter((p) => p.channel === "B2B").length;
  const subCount = patients.filter((p) => p.channel === "SUB").length;

  const selOrders = selected ? orders.filter((o) => o.patientId === selected.id) : [];
  const selReports = selected ? reports.filter((r) => r.patientId === selected.id) : [];

  const columns: Column<Patient>[] = [
    { key: "id", header: "UHID", value: (r) => r.id, render: (r) => <span className="font-mono text-xs font-medium text-teal-800">{r.id}</span> },
    { key: "name", header: "Patient", value: (r) => r.name, render: (r) => (
      <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{r.name}</p><p className="text-[11px] text-muted-foreground">{r.age}y / {r.gender === "Male" ? "M" : "F"}</p></div>
    ) },
    { key: "mobile", header: "Mobile", value: (r) => r.mobile, render: (r) => <span className="font-mono text-xs">{r.mobile}</span> },
    { key: "city", header: "City", value: (r) => r.city, render: (r) => <span className="text-xs">{r.city}</span> },
    { key: "source", header: "Source", value: (r) => r.source, render: (r) => <span className="max-w-44 truncate text-xs text-muted-foreground">{r.source}</span> },
    { key: "channel", header: "Channel", value: (r) => r.channel, render: (r) => <ChannelPill channel={r.channel} /> },
    { key: "reg", header: "Registered", value: (r) => r.registeredOn, render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDate(r.registeredOn)}</span> },
    { key: "act", header: "", render: (r) => (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(r)} aria-label={`View ${r.name}`}><FileText className="h-3.5 w-3.5" /></Button>
    ) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Patient Directory"
        subtitle="Central UHID registry across all channels — walk-in, B2B partners and sub-agencies"
        icon={<Users className="h-5 w-5" />}
        actions={<Button onClick={() => setRegOpen(true)}><UserPlus className="mr-1.5 h-4 w-4" /> Register Patient</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Patients" value={patients.length} icon={<Users className="h-4 w-4" />} delta="+12 this week" deltaTone="up" />
        <StatCard label="B2C Walk-in" value={b2cCount} accent="teal" sublabel="self-registered" />
        <StatCard label="Via B2B Partners" value={b2bCount} accent="violet" sublabel="partner portal bookings" />
        <StatCard label="Via Sub-Agencies" value={subCount} accent="amber" sublabel="collection points" />
      </div>

      <Panel title="All Patients" description="Click a row for demographics, recent orders and released reports">
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={10}
          searchOf={(r) => `${r.id} ${r.name} ${r.mobile} ${r.source} ${r.city}`}
          searchPlaceholder="Search name / UHID / mobile…"
          onRowClick={(r) => setSelected(r)}
          filters={
            <>
              <Select value={channelF} onValueChange={setChannelF}>
                <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All channels</SelectItem>
                  <SelectItem value="B2C">B2C</SelectItem>
                  <SelectItem value="B2B">B2B</SelectItem>
                  <SelectItem value="SUB">SUB</SelectItem>
                </SelectContent>
              </Select>
              <Select value={cityF} onValueChange={setCityF}>
                <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All cities</SelectItem>
                  {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </>
          }
        />
      </Panel>

      {/* ------------------------------ PATIENT DETAIL SHEET ------------------------------ */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
          {selected ? (
            <>
              <SheetHeader className="border-b px-5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <SheetTitle className="truncate">{selected.name}</SheetTitle>
                    <p className="font-mono text-xs text-muted-foreground">{selected.id} · {selected.age}y / {selected.gender === "Male" ? "M" : "F"} · with Apex since {fmtDate(selected.registeredOn)}</p>
                  </div>
                  <ChannelPill channel={selected.channel} />
                </div>
              </SheetHeader>
              <div className="space-y-5 p-5">
                <KeyValue
                  items={[
                    { label: "Date of Birth", value: fmtDate(selected.dob) },
                    { label: "Mobile", value: <span className="font-mono text-xs">{selected.mobile}</span> },
                    { label: "Email", value: <span className="truncate text-xs">{selected.email}</span> },
                    { label: "City", value: selected.city },
                    { label: "Address", value: <span className="text-xs">{selected.address}</span> },
                    { label: "ID Proof", value: <span className="font-mono text-xs">{selected.idProof}</span> },
                    { label: "Referral Source", value: selected.source },
                    { label: "Acquisition Channel", value: <ChannelPill channel={selected.channel} /> },
                  ]}
                />

                <Panel title="Recent Orders" description={`${selOrders.length} booking(s) on record`}>
                  {selOrders.length === 0 ? (
                    <EmptyState title="No orders yet" hint="Bookings appear here after the first test order." />
                  ) : (
                    <ul className="space-y-2">
                      {selOrders.map((o) => (
                        <li key={o.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-2.5">
                          <div className="min-w-0 text-xs">
                            <p className="font-mono font-medium text-slate-800">{o.id}</p>
                            <p className="truncate text-muted-foreground">{fmtDateTime(o.createdAt)} · {o.items.length} item(s) · {o.paymentMode}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Money value={o.net} className="text-xs" />
                            <StatusPill status={o.status} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>

                <Panel title="Reports" description="Released lab reports for this patient">
                  {selReports.length === 0 ? (
                    <EmptyState title="No reports released yet" hint="Reports appear after pathologist approval." />
                  ) : (
                    <ul className="space-y-2">
                      {selReports.map((r) => (
                        <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-2.5">
                          <div className="min-w-0 text-xs">
                            <p className="font-mono font-medium text-slate-800">{r.id}</p>
                            <p className="truncate text-muted-foreground">{r.tests.join(", ")} · {r.pathologist} · {fmtDate(r.releasedAt)}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <StatusPill status={r.status} />
                            <Button
                              variant="outline" size="sm" className="h-7"
                              onClick={() => setReport(toReportView(r, selected.name, `${selected.age}y / ${selected.gender === "Male" ? "M" : "F"}`))}
                            >
                              <ReceiptText className="mr-1 h-3 w-3" /> View
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* ------------------------------ REGISTER PATIENT DIALOG ------------------------------ */}
      <Dialog open={regOpen} onOpenChange={setRegOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Register Patient</DialogTitle>
            <DialogDescription>A new UHID is allotted instantly; ID proof is masked in all downstream views.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50/60 px-3 py-2 text-xs text-teal-900">
              <CalendarPlus className="h-3.5 w-3.5 shrink-0" />
              Next UHID: <Badge variant="outline" className="font-mono">PAT-00144</Badge> · Home collection &amp; portal login can be set up after registration.
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" required><Input value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} /></Field>
              <Field label="Date of Birth" required><Input type="date" value={regForm.dob} onChange={(e) => setRegForm({ ...regForm, dob: e.target.value })} /></Field>
              <Field label="Gender" required>
                <Select value={regForm.gender} onValueChange={(v) => setRegForm({ ...regForm, gender: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="Mobile" required><Input value={regForm.mobile} onChange={(e) => setRegForm({ ...regForm, mobile: e.target.value })} /></Field>
              <Field label="Email"><Input value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} /></Field>
              <Field label="City" required><Input value={regForm.city} onChange={(e) => setRegForm({ ...regForm, city: e.target.value })} /></Field>
              <Field label="Address" className="sm:col-span-2"><Input value={regForm.address} onChange={(e) => setRegForm({ ...regForm, address: e.target.value })} /></Field>
              <Field label="ID Proof" hint="Stored masked (Aadhaar / PAN / DL)"><Input value={regForm.idProof} onChange={(e) => setRegForm({ ...regForm, idProof: e.target.value })} /></Field>
              <Field label="Referral Source" required>
                <Select value={regForm.source} onValueChange={(v) => setRegForm({ ...regForm, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B2C Walk-in">B2C Walk-in</SelectItem>
                    {doctors.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                    {partners.filter((p) => p.status === "Active").map((p) => <SelectItem key={p.id} value={p.name}>{p.name} (B2B)</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegOpen(false)}>Cancel</Button>
            <Button onClick={() => setRegOpen(false)}>Register &amp; Allot UHID</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReportDialog open={!!report} onOpenChange={(o) => !o && setReport(null)} data={report} />
    </div>
  );
}

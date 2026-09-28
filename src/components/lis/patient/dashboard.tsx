"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useLisNav } from "@/components/lis/nav";
import {
  orders, reports, invoices, patientById, patientStageIndex,
} from "@/lib/lis/data";
import { fmtDate, fmtDateTime } from "@/lib/lis/format";
import {
  Money, PageHeader, Panel, PatientSteps, StatCard, StatusPill,
} from "@/components/lis/widgets";
import { ReportDialog, toReportView } from "@/components/lis/report-sheet";
import type { ReportViewData } from "@/components/lis/report-sheet";
import {
  CalendarClock, ClipboardList, Eye, FileText, MapPin, ReceiptText, ShoppingCart, Wallet,
} from "lucide-react";

const PATIENT_ID = "PAT-00124";

const me = patientById(PATIENT_ID);
const myOrders = orders.filter((o) => o.patientId === PATIENT_ID);
const myReports = reports.filter((r) => r.patientId === PATIENT_ID);
const myInvoices = invoices.filter((i) => i.billToId === PATIENT_ID);
const activeOrder = myOrders.find((o) => o.status !== "Report Delivered") ?? myOrders[0];
const upcomingApt = { id: "APT-2026-0812", date: "2026-09-29", slot: "07:00 – 07:30", tests: "FBS + Lipid Profile (fasting)", phlebotomist: "Sarita Kadam" };

export function PatientDashboardView() {
  const { go } = useLisNav();
  const [report, setReport] = React.useState<ReportViewData | null>(null);

  const openReport = (r: (typeof reports)[number]) => {
    setReport(toReportView(r, me?.name ?? "", me ? `${me.age}y / ${me.gender === "Male" ? "M" : "F"}` : ""));
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Health"
        subtitle="Welcome back — track tests, reports and bills in one place"
        actions={<Button onClick={() => go("patient/book")}><ShoppingCart className="mr-1.5 h-4 w-4" /> Book a Test</Button>}
      />

      {/* Greeting card */}
      <div className="flex flex-col gap-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
          RS
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-slate-900">Good morning, {me?.name}</p>
          <p className="text-xs text-muted-foreground">
            {PATIENT_ID} · {me?.mobile} · member since {fmtDate(me?.registeredOn)} · NABL-accredited Apex network
          </p>
        </div>
      </div>

      {/* Upcoming appointment banner */}
      <div className="flex flex-col gap-3 rounded-xl border border-emerald-300 bg-white p-4 sm:flex-row sm:items-center">
        <div className="rounded-lg bg-emerald-600/10 p-2.5 text-emerald-700"><CalendarClock className="h-6 w-6" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">
            Home sample collection — {fmtDate(upcomingApt.date)} at {upcomingApt.slot}
          </p>
          <p className="text-xs text-muted-foreground">
            {upcomingApt.tests} · Phlebotomist {upcomingApt.phlebotomist} · {me?.address}, {me?.city}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => go("patient/appointments")}>View Appointments</Button>
      </div>

      {/* KPI chips */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Active Bookings" value={1} icon={<ClipboardList className="h-4 w-4" />} sublabel="CBC · TSH · Lipid Profile" onClick={() => go("patient/tests")} />
        <StatCard label="Reports" value={3} accent="emerald" icon={<FileText className="h-4 w-4" />} sublabel="since Aug 2026" onClick={() => go("patient/reports")} />
        <StatCard label="Amount Due" value="₹0" accent="emerald" icon={<Wallet className="h-4 w-4" />} sublabel="all bills settled" onClick={() => go("patient/bills")} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Active order tracker */}
        <Panel
          title="Your Test Today"
          description={activeOrder ? `${activeOrder.items.map((i) => i.name).join(" · ")} — booked ${fmtDateTime(activeOrder.createdAt)}` : ""}
          className="lg:col-span-2"
          actions={activeOrder ? <Button variant="outline" size="sm" onClick={() => go("patient/tests")}>Details</Button> : undefined}
        >
          {activeOrder ? (
            <div className="space-y-4">
              <PatientSteps current={patientStageIndex(activeOrder.status)} />
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <StatusPill status={activeOrder.status} />
                <span>Sample collected at 08:05 am · report expected by <b className="text-slate-700">06:00 pm today</b></span>
              </div>
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-muted-foreground">
                You will get an SMS and WhatsApp alert the moment your report is ready.
              </p>
            </div>
          ) : null}
        </Panel>

        {/* Recent reports */}
        <Panel
          title="Recent Reports"
          actions={<Button variant="outline" size="sm" onClick={() => go("patient/reports")}>See all</Button>}
        >
          <ul className="space-y-2.5">
            {myReports.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg border p-2.5">
                <div className="min-w-0 text-xs">
                  <p className="truncate font-semibold text-slate-800">{r.tests.join(", ")}</p>
                  <p className="text-muted-foreground">{fmtDate(r.reportedAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <StatusPill status={r.status} />
                  <Button variant="outline" size="sm" className="h-7" onClick={() => openReport(r)}>
                    <Eye className="mr-1 h-3 w-3" /> View
                  </Button>
                </div>
              </li>
            ))}
            <li className="rounded-lg border border-dashed p-2.5 text-[11px] text-muted-foreground">
              1 more report in progress — CBC · TSH · Lipid Profile expected today.
            </li>
          </ul>
        </Panel>
      </div>

      {/* Recent bills */}
      <Panel
        title="Recent Bills"
        description="All payments are GST-inclusive tax invoices"
        actions={<Button variant="outline" size="sm" onClick={() => go("patient/bills")}>See all</Button>}
      >
        <ul className="divide-y divide-slate-100">
          {myInvoices.map((inv) => (
            <li key={inv.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="flex min-w-0 items-center gap-3">
                <ReceiptText className="h-4 w-4 shrink-0 text-emerald-600" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{inv.id}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {fmtDate(inv.date)} · {inv.mode}{inv.orderId ? ` · ${inv.orderId}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Money value={inv.total} className="text-sm" />
                <StatusPill status={inv.due > 0 ? inv.status : "Paid"} />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3" /> Home visits cover all of Powai — book from the Appointments page.
        </p>
      </Panel>

      <ReportDialog open={!!report} onOpenChange={(o) => !o && setReport(null)} data={report} />
    </div>
  );
}

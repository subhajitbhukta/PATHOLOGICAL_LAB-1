"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useLisNav } from "@/components/lis/nav";
import {
  orders, patients, samples, kpi, misDailyRevenue, misChannelSplit, misTat, reports,
  patientById, orderPatientName, orderAgeSex, workflowIndex, INTERNAL_FLOW,
} from "@/lib/lis/data";
import { inr, fmtTime } from "@/lib/lis/format";
import {
  ChannelPill, DataTable, Donut, HBars, Money, PageHeader, Panel, StatCard, StatusPill,
  TrendArea, WorkflowChain,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import type { Order } from "@/lib/lis/data";
import {
  Activity, ClipboardList, FileCheck2, FileText, FlipHorizontal2, HandCoins, Plus,
  TestTubes, TrendingUp, UserPlus, Users, Wallet,
} from "lucide-react";

export function AdminDashboardView() {
  const { go } = useLisNav();

  const recentColumns: Column<Order>[] = [
    { key: "id", header: "Order ID", value: (r) => r.id, render: (r) => <span className="font-mono text-xs font-medium">{r.id}</span> },
    { key: "patient", header: "Patient", value: (r) => orderPatientName(r.id), render: (r) => <span className="text-sm">{orderPatientName(r.id)}</span> },
    { key: "ch", header: "Channel", value: (r) => r.channel, render: (r) => <ChannelPill channel={r.channel} /> },
    { key: "src", header: "Source", value: (r) => r.partnerName ?? "B2C Direct", render: (r) => <span className="text-xs text-muted-foreground">{r.channel === "B2C" ? "B2C Direct" : r.subAgencyName ?? r.partnerName}</span> },
    { key: "net", header: "Amount", headClassName: "text-right", className: "text-right", value: (r) => r.net, render: (r) => <Money value={r.net} /> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
  ];

  const readyReports = reports.filter((r) => r.status === "Delivered").slice(0, 5);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Central Lab Dashboard"
        subtitle="Snapshot for Saturday, 28 Sep 2026 · Central Reference Laboratory, Andheri"
        icon={<Activity className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" onClick={() => go("admin/receiving")}><FileCheck2 className="mr-1.5 h-4 w-4" /> Receive Samples</Button>
            <Button onClick={() => go("admin/order-new")}><Plus className="mr-1.5 h-4 w-4" /> New Patient Entry</Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <StatCard label="Today's Registrations" value={kpi.todayRegistrations} icon={<Users className="h-4 w-4" />} delta="+12%" deltaTone="up" sublabel="vs yday" />
        <StatCard label="Today's Orders" value={kpi.todayOrders} icon={<ClipboardList className="h-4 w-4" />} accent="violet" delta="+8%" deltaTone="up" />
        <StatCard label="In Transit" value={kpi.inTransit} icon={<TestTubes className="h-4 w-4" />} accent="amber" sublabel="samples on road" />
        <StatCard label="Tests In Progress" value={kpi.testsInProgress} icon={<Activity className="h-4 w-4" />} accent="violet" />
        <StatCard label="Pending Verification" value={kpi.pendingVerification} icon={<FileCheck2 className="h-4 w-4" />} accent="rose" onClick={() => go("admin/verification")} />
        <StatCard label="Reports Ready" value={kpi.reportsReady} icon={<FileText className="h-4 w-4" />} accent="emerald" onClick={() => go("admin/reports")} />
        <StatCard label="Revenue Today" value={inr(kpi.revenueToday, { compact: true })} icon={<TrendingUp className="h-4 w-4" />} accent="emerald" delta="+11%" deltaTone="up" />
        <StatCard label="Outstanding" value={inr(kpi.outstandingTotal, { compact: true })} icon={<Wallet className="h-4 w-4" />} accent="amber" onClick={() => go("admin/ledger")} />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Revenue — last 7 days" description="All channels incl. GST bills" className="lg:col-span-2">
          <TrendArea data={misDailyRevenue} />
        </Panel>
        <Panel title="Business Mix" description="September revenue share by channel">
          <Donut data={misChannelSplit} centerLabel="Sep*" centerValue="₹23.9L" />
        </Panel>
      </div>

      {/* Worklists + TAT */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Department Workload" description="Samples assigned per department (today)" className="lg:col-span-2">
          <HBars
            data={[
              { label: "Biochemistry", value: 38 }, { label: "Haematology", value: 31 },
              { label: "Hormones", value: 22 }, { label: "Serology", value: 17 },
              { label: "Microbiology", value: 11 }, { label: "Molecular Biology", value: 7 },
              { label: "Histopathology", value: 4 },
            ]}
            format={(v) => `${v} samples`}
          />
        </Panel>
        <Panel title="TAT Compliance" description="% reports within promised TAT (Sep)">
          <HBars
            data={misTat.map((t) => ({ label: t.department, value: t.withinTat, sub: `/ ${t.withinTat + t.delayed}` }))}
            format={(v) => `${v}%`}
            colorMap={() => "#0d9488"}
          />
        </Panel>
      </div>

      {/* Recent orders + pending samples */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Recent Orders" className="lg:col-span-2"
          actions={<Button variant="outline" size="sm" onClick={() => go("admin/orders")}>View all</Button>}
        >
          <DataTable columns={recentColumns} rows={orders.slice(0, 8)} pageSize={8} onRowClick={() => go("admin/orders")} />
        </Panel>

        <div className="space-y-4">
          <Panel
            title="Awaiting Lab Receiving"
            description="Scanned & verified at front desk"
            actions={<Button variant="outline" size="sm" onClick={() => go("admin/receiving")}>Open</Button>}
          >
            <ul className="space-y-2.5">
              {samples.filter((s) => ["Sample Collected", "Pickup Requested", "Picked Up", "In Transit"].includes(s.stage)).slice(0, 5).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-mono font-medium text-slate-800">{s.id}</p>
                    <p className="truncate text-muted-foreground">{s.patientName} · {s.type}</p>
                  </div>
                  <StatusPill status={s.stage} />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="Reports Released Today"
            actions={<Button variant="outline" size="sm" onClick={() => go("admin/reports")}>Registry</Button>}
          >
            <ul className="space-y-2.5">
              {readyReports.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-mono font-medium text-slate-800">{r.id}</p>
                    <p className="truncate text-muted-foreground">{patientById(r.patientId)?.name} · {r.tests.join(", ")}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{fmtTime(r.releasedAt)}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {/* Quick links */}
      <Panel title="Operations Shortcuts">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Central Patient Entry", icon: UserPlus, view: "admin/order-new" },
            { label: "Sample Management", icon: TestTubes, view: "admin/samples" },
            { label: "Logistics & Pickups", icon: FlipHorizontal2, view: "admin/logistics" },
            { label: "Pricing Engine", icon: HandCoins, view: "admin/pricing" },
            { label: "Pathologist Verification", icon: FileCheck2, view: "admin/verification" },
            { label: "Reports & MIS", icon: FileText, view: "admin/mis" },
          ].map((q) => (
            <button
              key={q.view}
              onClick={() => go(q.view)}
              className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-center transition-colors hover:border-teal-300 hover:bg-teal-50/50"
            >
              <q.icon className="h-5 w-5 text-teal-700" />
              <span className="text-xs font-medium text-slate-700">{q.label}</span>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}

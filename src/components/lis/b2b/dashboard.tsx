"use client";

import { Button } from "@/components/ui/button";
import { useLisNav } from "@/components/lis/nav";
import {
  misPartnerBusiness, orderPatientName, orders, partners, patientById, pickups, reportsForPartner,
  settlements, subAgencies, today,
} from "@/lib/lis/data";
import { fmtDateTime, inr } from "@/lib/lis/format";
import {
  DataTable, Donut, HBars, Money, PageHeader, Panel, StatCard, StatusPill,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import type { Order } from "@/lib/lis/types";
import {
  AlertTriangle, ArrowRight, ClipboardList, FileText, IndianRupee, Percent,
  Plus, TestTubes, Truck, Wallet,
} from "lucide-react";

// ============================================================
// B2B Partner Portal — ABC Diagnostics (B2B-001) dashboard
// ============================================================

const PARTNER_ID = "B2B-001";
const partner = partners.find((p) => p.id === PARTNER_ID) ?? partners[0];
const mySubs = subAgencies.filter((s) => s.parentId === PARTNER_ID);
const SUB_NAMES = mySubs.map((s) => s.name);
const myOrders = orders.filter((o) => o.partnerId === PARTNER_ID);
const myPickups = pickups.filter((p) => p.requestedBy === partner.name || SUB_NAMES.includes(p.requestedBy));
const myReports = reportsForPartner(PARTNER_ID);

const monthBusiness = misPartnerBusiness.find((m) => m.name === partner.name)?.revenue ?? 898400;
const subMargin = settlements
  .filter((s) => s.parentId === PARTNER_ID && s.period.startsWith("Sep"))
  .reduce((a, s) => a + s.margin, 0);

const samplesToday = myPickups
  .filter((p) => p.requestedAt.startsWith(today))
  .reduce((a, p) => a + p.sampleCount, 0);
const inTransit = myPickups
  .filter((p) => p.status === "In Transit")
  .reduce((a, p) => a + p.sampleCount, 0);
const pendingPickups = myPickups.filter((p) => p.status === "Requested" || p.status === "Assigned");

const OWN_DIRECT = 486000;
const revenueBySource = [
  { label: "ABC Direct (own)", value: OWN_DIRECT },
  ...mySubs.map((s) => ({ label: s.name, value: s.monthlyBusiness })),
];
const mixData = [
  { label: "ABC Direct", value: OWN_DIRECT },
  { label: "Sub-Agencies", value: mySubs.reduce((a, s) => a + s.monthlyBusiness, 0) },
];

export function B2bDashboardView() {
  const { go } = useLisNav();

  const recentColumns: Column<Order>[] = [
    {
      key: "id", header: "Order ID", value: (r) => r.id,
      render: (r) => <span className="font-mono text-xs font-medium text-violet-800">{r.id}</span>,
    },
    {
      key: "patient", header: "Patient", value: (r) => orderPatientName(r.id),
      render: (r) => <span className="text-sm">{orderPatientName(r.id)}</span>,
    },
    {
      key: "src", header: "Booked Via", value: (r) => r.subAgencyName ?? "ABC Direct",
      render: (r) => <span className="text-xs text-muted-foreground">{r.subAgencyName ?? "ABC Direct"}</span>,
    },
    {
      key: "tests", header: "Tests", value: (r) => r.items.length,
      render: (r) => <span className="text-xs">{r.items.map((i) => i.code).join(", ")}</span>,
    },
    {
      key: "amt", header: "B2B Amount", headClassName: "text-right", className: "text-right",
      value: (r) => r.gross, render: (r) => <Money value={r.gross} />,
    },
    {
      key: "status", header: "Status", value: (r) => r.status,
      render: (r) => <StatusPill status={r.status} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Partner Dashboard — ${partner.name}`}
        subtitle={`${partner.id} · ${partner.city} · ${partner.pricingTier} · Snapshot: Saturday, 28 Sep 2026`}
        actions={
          <>
            <Button variant="outline" onClick={() => go("b2b/pickups")}>
              <Truck className="mr-1.5 h-4 w-4" /> Request Pickup
            </Button>
            <Button className="bg-violet-600 text-white hover:bg-violet-700" onClick={() => go("b2b/order-new")}>
              <Plus className="mr-1.5 h-4 w-4" /> New Test Order
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Today&apos;s Orders" value={5} icon={<ClipboardList className="h-4 w-4" />} accent="violet" delta="+2" deltaTone="up" sublabel="incl. sub-agencies" />
        <StatCard label="Samples Collected" value={samplesToday} icon={<TestTubes className="h-4 w-4" />} accent="teal" sublabel="today · 3 pickup runs" />
        <StatCard label="In Transit" value={inTransit} icon={<Truck className="h-4 w-4" />} accent="amber" sublabel="samples on road" />
        <StatCard label="Reports Ready" value={myReports.length} icon={<FileText className="h-4 w-4" />} accent="emerald" onClick={() => go("b2b/reports")} />
        <StatCard label="Outstanding" value={inr(partner.outstanding, { compact: true })} icon={<Wallet className="h-4 w-4" />} accent="rose" sublabel="credit limit ₹3.0L" onClick={() => go("b2b/billing")} />
        <StatCard label="This-Month Business" value={inr(monthBusiness, { compact: true })} icon={<IndianRupee className="h-4 w-4" />} accent="violet" delta="+9%" deltaTone="up" sublabel="Sep 2026" />
        <StatCard label="Sub-Agency Margin" value={inr(subMargin, { compact: true })} icon={<Percent className="h-4 w-4" />} accent="emerald" sublabel="earned from 3 agencies" />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Business by Source — September" description="Net billing at your contracted B2B rate card" className="lg:col-span-2">
          <HBars data={revenueBySource} />
        </Panel>
        <Panel title="Business Mix" description="Own direct vs sub-agency routed volume">
          <Donut data={mixData} centerLabel="Sep 2026" centerValue={inr(OWN_DIRECT + mySubs.reduce((a, s) => a + s.monthlyBusiness, 0), { compact: true })} />
        </Panel>
      </div>

      {/* Recent orders + side lists */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Recent Orders"
          description="All bookings under ABC Diagnostics, incl. sub-agency routed"
          className="lg:col-span-2"
          actions={<Button variant="outline" size="sm" onClick={() => go("b2b/orders")}>View all <ArrowRight className="ml-1 h-3 w-3" /></Button>}
        >
          <DataTable columns={recentColumns} rows={myOrders.slice(0, 6)} pageSize={6} />
        </Panel>

        <div className="space-y-4">
          <Panel
            title="Reports Ready for Download"
            description="Approved & published by Apex pathologists"
            actions={<Button variant="outline" size="sm" onClick={() => go("b2b/reports")}>Open</Button>}
          >
            <ul className="space-y-2.5">
              {myReports.slice(0, 4).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-mono font-medium text-slate-800">{r.id}</p>
                    <p className="truncate text-muted-foreground">{patientById(r.patientId)?.name} · {r.tests.join(", ")}</p>
                  </div>
                  <StatusPill status={r.status} />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="Pending Pickup Alert"
            description="Awaiting courier assignment by Apex"
            className={pendingPickups.length > 0 ? "border-amber-200 bg-amber-50/60" : undefined}
            actions={<Button variant="outline" size="sm" onClick={() => go("b2b/pickups")}>Request</Button>}
          >
            {pendingPickups.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">No pickups pending — all manifests received at lab.</p>
            ) : (
              <ul className="space-y-2.5">
                {pendingPickups.map((p) => (
                  <li key={p.id} className="flex items-start justify-between gap-2 text-xs">
                    <div className="flex min-w-0 items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">{p.requestedBy}</p>
                        <p className="truncate text-muted-foreground">{p.sampleCount} samples · {fmtDateTime(p.requestedAt)}</p>
                      </div>
                    </div>
                    <StatusPill status={p.status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      {/* Quick links */}
      <Panel title="Portal Shortcuts">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "New Test Order", icon: Plus, view: "b2b/order-new" },
            { label: "My Patients", icon: ClipboardList, view: "b2b/patients" },
            { label: "Samples & Barcodes", icon: TestTubes, view: "b2b/samples" },
            { label: "Pickup Requests", icon: Truck, view: "b2b/pickups" },
            { label: "My Pricing", icon: Percent, view: "b2b/pricing" },
            { label: "Billing & Ledger", icon: IndianRupee, view: "b2b/billing" },
          ].map((q) => (
            <button
              key={q.view}
              onClick={() => go(q.view)}
              className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-center transition-colors hover:border-violet-300 hover:bg-violet-50/50"
            >
              <q.icon className="h-5 w-5 text-violet-700" />
              <span className="text-xs font-medium text-slate-700">{q.label}</span>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}

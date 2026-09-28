"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useLisNav } from "@/components/lis/nav";
import {
  ordersForSubAgency, patientsForSubAgency, samples, verificationTasks, externalJobs,
  pickups, orderPatientName,
} from "@/lib/lis/data";
import { inr, fmtDateTime } from "@/lib/lis/format";
import {
  MiniBars, Money, PageHeader, Panel, StatCard, StatusPill,
} from "@/components/lis/widgets";
import {
  ClipboardList, Eye, FileText, HandCoins, Info, Truck, Users, Wallet,
} from "lucide-react";

// ---------- Agency scope (demo: XYZ Collection Centre) ----------
const AGENCY_ID = "SUB-001";
const AGENCY_NAME = "XYZ Collection Centre";

const agencyOrders = ordersForSubAgency(AGENCY_ID);
const agencyPatients = patientsForSubAgency(AGENCY_ID);
const agencyOrderIds = new Set(agencyOrders.map((o) => o.id));

const monthNet = agencyOrders.reduce((a, o) => a + o.net, 0);
const transitCount = samples.filter(
  (s) => agencyOrderIds.has(s.orderId) && ["Pickup Requested", "Picked Up", "In Transit"].includes(s.stage),
).length;

const dailyCollections = [
  { label: "22 Sep", value: 6100 }, { label: "23 Sep", value: 5400 }, { label: "24 Sep", value: 7200 },
  { label: "25 Sep", value: 4800 }, { label: "26 Sep", value: 6600 }, { label: "27 Sep", value: 7900 },
  { label: "28 Sep", value: 3350 },
];

const pipelineReports = verificationTasks.filter((v) => agencyOrderIds.has(v.orderId));
const externalForAgency = externalJobs.filter((e) => agencyOrderIds.has(e.orderId));
const agencyPickup = pickups.find((p) => p.requestedBy === AGENCY_NAME);

export function AgencyDashboardView() {
  const { go } = useLisNav();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Agency Dashboard"
        subtitle="XYZ Collection Centre · Ghatkopar East, Mumbai · Partner code SUB-001"
        actions={
          <>
            <Button variant="outline" onClick={() => go("agency/pickups")}><Truck className="mr-1.5 h-4 w-4" /> Request Pickup</Button>
            <Button onClick={() => go("agency/order-new")}><Users className="mr-1.5 h-4 w-4" /> New Test Order</Button>
          </>
        }
      />

      {/* Scope banner */}
      <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p>
          You are viewing <span className="font-semibold">XYZ Collection Centre</span> — pricing and ledger are
          restricted to your agency scope. Central lab and parent B2B rates are never shown here.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Patients" value={12} icon={<Users className="h-4 w-4" />} sublabel="+2 registered in Sep" />
        <StatCard label="Orders This Month" value={agencyOrders.length} accent="violet" icon={<ClipboardList className="h-4 w-4" />} sublabel={`${inr(monthNet, { compact: true })} billed value`} />
        <StatCard label="Samples In Transit" value={transitCount} accent="amber" icon={<Truck className="h-4 w-4" />} sublabel="on the road to Apex" />
        <StatCard label="Reports Ready" value={3} accent="emerald" icon={<FileText className="h-4 w-4" />} sublabel="2 verifying · 1 external" onClick={() => go("agency/reports")} />
        <StatCard label="Bills / Outstanding" value={inr(22300, { compact: true })} accent="amber" icon={<Wallet className="h-4 w-4" />} sublabel="Sep cycle · due 12 Oct" onClick={() => go("agency/billing")} />
        <StatCard label="Payable to Parent" value={inr(22300, { compact: true })} accent="rose" icon={<HandCoins className="h-4 w-4" />} sublabel="to ABC Diagnostics" onClick={() => go("agency/billing")} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Collections + recent orders */}
        <div className="space-y-4 lg:col-span-2">
          <Panel title="Daily Patient Collections" description="Cash + UPI collected at your centre — last 7 days">
            <MiniBars data={dailyCollections} color="#d97706" />
          </Panel>

          <Panel
            title="Recent Orders"
            description="All orders booked under SUB-001"
            actions={<Button variant="outline" size="sm" onClick={() => go("agency/orders")}>View all</Button>}
          >
            <ul className="divide-y divide-slate-100">
              {agencyOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-medium text-slate-800">{o.id}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {orderPatientName(o.id)} · {o.items.map((i) => i.code).join(", ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Money value={o.net} className="hidden text-sm sm:inline" />
                    <StatusPill status={o.status} />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => go("agency/orders")}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <Panel
            title="Reports Ready"
            description="For patients registered by your agency"
            actions={<Button variant="outline" size="sm" onClick={() => go("agency/reports")}>Open</Button>}
          >
            <ul className="space-y-2.5">
              {pipelineReports.map((v) => (
                <li key={v.reportId} className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-mono font-medium text-slate-800">{v.reportId}</p>
                    <p className="truncate text-muted-foreground">{v.patientName} · {v.tests}</p>
                  </div>
                  <StatusPill status={v.status} />
                </li>
              ))}
              {externalForAgency.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-mono font-medium text-slate-800">{e.testCode}</p>
                    <p className="truncate text-muted-foreground">{e.patientName} · {e.externalLab.split("—")[0]}</p>
                  </div>
                  <StatusPill status={e.status} />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="Pickup Status"
            description="Today's sample logistics"
            actions={<Button variant="outline" size="sm" onClick={() => go("agency/pickups")}>Track</Button>}
          >
            {agencyPickup ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-medium text-slate-800">{agencyPickup.id}</span>
                  <StatusPill status={agencyPickup.status} />
                </div>
                <p className="text-muted-foreground">
                  Manifest {agencyPickup.manifestNo} · {agencyPickup.sampleCount} samples · {agencyPickup.courier}
                </p>
                <p className="text-muted-foreground">
                  Rider {agencyPickup.riderName} ({agencyPickup.riderMobile}) · window {agencyPickup.pickupWindow}
                </p>
                {agencyPickup.receivedAt ? (
                  <p className="rounded-md bg-emerald-50 px-2 py-1.5 font-medium text-emerald-800">
                    Received at Apex central lab · {fmtDateTime(agencyPickup.receivedAt)}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="py-4 text-center text-xs text-muted-foreground">No pickup requested today yet.</p>
            )}
          </Panel>

          <Panel title="Agency Snapshot">
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex justify-between"><span>Registered patients</span><span className="font-semibold text-slate-800">{agencyPatients.length} on file · 12 total</span></li>
              <li className="flex justify-between"><span>Parent partner</span><span className="font-semibold text-slate-800">ABC Diagnostics (B2B-001)</span></li>
              <li className="flex justify-between"><span>Joined network</span><span className="font-semibold text-slate-800">10 Feb 2024</span></li>
              <li className="flex justify-between"><span>Monthly business</span><span className="font-semibold text-slate-800">{inr(184000, { compact: true })}</span></li>
              <li className="flex justify-between"><span>Settlement margin</span><span className="font-semibold text-slate-800">18% on Apex billing</span></li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

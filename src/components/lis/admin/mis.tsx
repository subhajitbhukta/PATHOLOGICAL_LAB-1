"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  invoices, misAgeing, misDailyRevenue, misMonthlyRevenue, misPartnerBusiness,
  misReferral, misTat,
} from "@/lib/lis/data";
import { fmtDate, inr } from "@/lib/lis/format";
import {
  DataTable, HBars, MiniBars, Money, PageHeader, Panel, TrendArea,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import type { MisPartnerBusiness } from "@/lib/lis/types";
import { BarChart3 } from "lucide-react";

type MisReferralRow = (typeof misReferral)[number];

// ---------- KPI chip ----------
function Chip({ label, value, tone = "teal" }: { label: string; value: React.ReactNode; tone?: "teal" | "emerald" | "rose" | "amber" | "violet" }) {
  const tones: Record<string, string> = {
    teal: "bg-teal-600/10 text-teal-700", emerald: "bg-emerald-600/10 text-emerald-700",
    rose: "bg-rose-500/10 text-rose-700", amber: "bg-amber-500/10 text-amber-700",
    violet: "bg-violet-600/10 text-violet-700",
  };
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 shadow-sm">
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tones[tone]}`}>{label}</span>
      <span className="text-sm font-semibold tabular-nums text-slate-900">{value}</span>
    </div>
  );
}

const PERIODS = ["This month", "Last month", "Quarter"];

// Department workload (same seed as dashboard — reused KPI view)
const DEPT_WORKLOAD = [
  { label: "Biochemistry", value: 38 }, { label: "Haematology", value: 31 },
  { label: "Hormones", value: 22 }, { label: "Serology", value: 17 },
  { label: "Microbiology", value: 11 }, { label: "Molecular Biology", value: 7 },
  { label: "Histopathology", value: 4 },
];

export function AdminMisView() {
  const [period, setPeriod] = React.useState(PERIODS[0]);

  // ---------- Derived aggregates (pure) ----------
  const weekRevenue = misDailyRevenue.reduce((a, d) => a + d.value, 0);
  const tatWithinAvg = Math.round(misTat.reduce((a, t) => a + t.withinTat, 0) / misTat.length);
  const workloadTotal = DEPT_WORKLOAD.reduce((a, d) => a + d.value, 0);

  const bizRevenue = misPartnerBusiness.reduce((a, p) => a + p.revenue, 0);
  const bizOutstanding = misPartnerBusiness.reduce((a, p) => a + p.outstanding, 0);
  const bizB2bCount = misPartnerBusiness.filter((p) => p.type === "B2B").length;
  const bizSubCount = misPartnerBusiness.filter((p) => p.type === "Sub-Agency").length;
  const bizByRevenue = [...misPartnerBusiness].sort((a, b) => b.revenue - a.revenue);

  const ytdRevenue = misMonthlyRevenue.reduce((a, m) => a + m.value, 0);
  const sepRevenue = misMonthlyRevenue[misMonthlyRevenue.length - 1]?.value ?? 0;
  const gstCgst = invoices.reduce((a, i) => a + i.cgst, 0);
  const gstSgst = invoices.reduce((a, i) => a + i.sgst, 0);
  const gstTaxable = invoices.reduce((a, i) => a + i.taxable, 0);
  const collected = invoices.reduce((a, i) => a + i.paid, 0);
  const ageingTotal = misAgeing.reduce((a, b) => a + b.amount, 0);
  const collectionDays = [...new Set(invoices.filter((i) => i.paid > 0).map((i) => i.date))]
    .sort()
    .map((d) => ({
      label: fmtDate(d).slice(0, 6),
      value: invoices.filter((i) => i.date === d).reduce((a, i) => a + i.paid, 0),
    }));

  const refRevenue = misReferral.reduce((a, r) => a + r.revenue, 0);
  const refTop = misReferral.reduce((best, r) => (r.revenue > best.revenue ? r : best), misReferral[0]);
  const refDoctors = misReferral.filter((r) => r.source.startsWith("Dr.")).length;
  const refByRevenue = [...misReferral].sort((a, b) => b.revenue - a.revenue);

  const bizColumns: Column<MisPartnerBusiness>[] = [
    { key: "name", header: "Channel Partner", value: (r) => r.name, render: (r) => <span className="text-sm font-medium text-slate-800">{r.name}</span> },
    { key: "type", header: "Type", value: (r) => r.type, render: (r) => (
      <Badge variant="outline" className={`text-[10px] font-semibold ${r.type === "B2B" ? "bg-violet-600/10 text-violet-700 border-violet-200" : "bg-amber-500/10 text-amber-700 border-amber-200"}`}>{r.type}</Badge>
    ) },
    { key: "patients", header: "Patients", headClassName: "text-right", className: "text-right", value: (r) => r.patients },
    { key: "tests", header: "Tests", headClassName: "text-right", className: "text-right", value: (r) => r.tests },
    { key: "revenue", header: "Revenue", headClassName: "text-right", className: "text-right", value: (r) => r.revenue, render: (r) => <Money value={r.revenue} /> },
    { key: "outstanding", header: "Outstanding", headClassName: "text-right", className: "text-right", value: (r) => r.outstanding, render: (r) => r.outstanding > 0 ? <Money value={r.outstanding} className="font-semibold text-rose-600" /> : <span className="text-xs font-medium text-emerald-600">Nil</span> },
  ];

  const refColumns: Column<MisReferralRow>[] = [
    { key: "source", header: "Referral Source", value: (r) => r.source, render: (r) => <span className="text-sm font-medium text-slate-800">{r.source}</span> },
    { key: "patients", header: "Patients", headClassName: "text-right", className: "text-right", value: (r) => r.patients },
    { key: "tests", header: "Tests", headClassName: "text-right", className: "text-right", value: (r) => r.tests },
    { key: "revenue", header: "Revenue", headClassName: "text-right", className: "text-right", value: (r) => r.revenue, render: (r) => <Money value={r.revenue} /> },
    { key: "share", header: "Share", headClassName: "text-right", className: "text-right", value: (r) => r.revenue, render: (r) => (
      <Badge variant="outline" className="bg-teal-50 text-[10px] font-semibold text-teal-700 border-teal-200">{((r.revenue / refRevenue) * 100).toFixed(1)}%</Badge>
    ) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports & MIS"
        subtitle="Operational, business, financial and referral intelligence across the referral network"
        icon={<BarChart3 className="h-5 w-5" />}
        actions={
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{PERIODS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        }
      />

      <Tabs defaultValue="operational" className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="operational" className="text-xs">Operational</TabsTrigger>
          <TabsTrigger value="business" className="text-xs">Business</TabsTrigger>
          <TabsTrigger value="financial" className="text-xs">Financial</TabsTrigger>
          <TabsTrigger value="referral" className="text-xs">Referral</TabsTrigger>
        </TabsList>

        {/* ---------------- Operational ---------------- */}
        <TabsContent value="operational" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Chip label="Revenue · 7 days" value={inr(weekRevenue, { compact: true })} />
            <Chip label="TAT Compliance" value={`${tatWithinAvg}%`} tone="emerald" />
            <Chip label="Samples in Depts" value={workloadTotal} tone="violet" />
            <Chip label="Delayed Share" value={`${100 - tatWithinAvg}%`} tone="rose" />
            <Chip label="Period" value={period} tone="amber" />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Daily Revenue" description="All channels · last 7 days (28 Sep partial)" className="lg:col-span-2">
              <MiniBars data={misDailyRevenue} height={180} />
            </Panel>
            <Panel title="Department Workload" description="Samples assigned per department (today)">
              <HBars data={DEPT_WORKLOAD} format={(v) => `${v} samples`} />
            </Panel>
          </div>
          <Panel title="Turnaround by Department" description="% of reports within promised TAT vs delayed (September)">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-[11px] uppercase text-slate-500">
                  <th className="px-3 py-2 font-semibold">Department</th>
                  <th className="px-3 py-2 font-semibold">Within TAT</th>
                  <th className="px-3 py-2 font-semibold">Delayed</th>
                  <th className="px-3 py-2 text-right font-semibold">Compliance</th>
                </tr>
              </thead>
              <tbody>
                {misTat.map((t) => (
                  <tr key={t.department} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-800">{t.department}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full max-w-[180px] overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${t.withinTat}%` }} />
                        </div>
                        <span className="text-xs font-semibold tabular-nums text-emerald-700">{t.withinTat}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full max-w-[120px] overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-rose-500" style={{ width: `${t.delayed * 4}%` }} />
                        </div>
                        <span className="text-xs font-semibold tabular-nums text-rose-600">{t.delayed}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-bold tabular-nums text-slate-900">{t.withinTat + t.delayed} reports graded</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </TabsContent>

        {/* ---------------- Business ---------------- */}
        <TabsContent value="business" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Chip label="Partner Revenue" value={inr(bizRevenue, { compact: true })} />
            <Chip label="Outstanding" value={inr(bizOutstanding, { compact: true })} tone="rose" />
            <Chip label="B2B Partners" value={bizB2bCount} tone="violet" />
            <Chip label="Sub-Agencies" value={bizSubCount} tone="amber" />
            <Chip label="Tests Referred" value={misPartnerBusiness.reduce((a, p) => a + p.tests, 0)} />
          </div>
          <Panel title="Channel Partner Business" description="September volumes and receivables per partner / sub-agency">
            <DataTable
              columns={bizColumns}
              rows={misPartnerBusiness}
              pageSize={10}
              searchOf={(r) => `${r.name} ${r.type}`}
              searchPlaceholder="Search partner…"
            />
          </Panel>
          <Panel title="Revenue Ranking" description="Top channels by September revenue">
            <HBars data={bizByRevenue.map((p) => ({ label: p.name, value: p.revenue, sub: p.type === "B2B" ? "B2B" : "SUB" }))} />
          </Panel>
        </TabsContent>

        {/* ---------------- Financial ---------------- */}
        <TabsContent value="financial" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Chip label="FY Revenue (Apr–Sep)" value={inr(ytdRevenue, { compact: true })} />
            <Chip label="September" value={inr(sepRevenue, { compact: true })} tone="emerald" />
            <Chip label="Collected (invoices)" value={inr(collected, { compact: true })} tone="violet" />
            <Chip label="GST Payable" value={inr(gstCgst + gstSgst, { compact: true })} tone="amber" />
            <Chip label="Receivables" value={inr(ageingTotal, { compact: true })} tone="rose" />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Monthly Revenue Trend" description="FY 2026-27 · September partial" className="lg:col-span-2">
              <TrendArea data={misMonthlyRevenue} height={190} />
            </Panel>
            <Panel title="GST Summary" description="From Sep 2026 tax invoices">
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <dt className="text-muted-foreground">Taxable Value</dt>
                  <dd className="font-semibold tabular-nums text-slate-900">{inr(gstTaxable)}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <dt className="text-muted-foreground">CGST @ 9%</dt>
                  <dd className="font-semibold tabular-nums text-slate-900">{inr(gstCgst)}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <dt className="text-muted-foreground">SGST @ 9%</dt>
                  <dd className="font-semibold tabular-nums text-slate-900">{inr(gstSgst)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-semibold text-slate-800">Total GST Payable</dt>
                  <dd className="text-base font-bold tabular-nums text-teal-700">{inr(gstCgst + gstSgst)}</dd>
                </div>
                <p className="pt-1 text-[11px] text-muted-foreground">GSTR-1 filing due 11 Oct 2026 · {invoices.length} invoices in period</p>
              </dl>
            </Panel>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Daily Collections" description="Payments received against invoices">
              <MiniBars data={collectionDays} height={150} color="#10b981" />
            </Panel>
            <Panel title="Receivables Ageing" description="Outstanding by pending bucket">
              <HBars data={misAgeing.map((b) => ({ label: b.bucket, value: b.amount, sub: `${b.partners} partners` }))} />
            </Panel>
          </div>
        </TabsContent>

        {/* ---------------- Referral ---------------- */}
        <TabsContent value="referral" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Chip label="Referral Revenue" value={inr(refRevenue, { compact: true })} />
            <Chip label="Top Source" value={refTop?.source ?? "—"} tone="violet" />
            <Chip label="Referring Doctors" value={refDoctors} tone="emerald" />
            <Chip label="Patients Referred" value={misReferral.reduce((a, r) => a + r.patients, 0)} tone="amber" />
          </div>
          <Panel title="Referral Sources" description="Business generated by each referral source (September)">
            <DataTable
              columns={refColumns}
              rows={misReferral}
              pageSize={8}
              searchOf={(r) => r.source}
              searchPlaceholder="Search source…"
            />
          </Panel>
          <Panel title="Revenue by Source" description="Ranked contribution of every referral channel">
            <HBars data={refByRevenue.map((r) => ({ label: r.source, value: r.revenue, sub: `${r.patients} pts` }))} />
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}

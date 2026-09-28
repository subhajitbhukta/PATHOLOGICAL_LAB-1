"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { settlements } from "@/lib/lis/data";
import { fmtDate, inr } from "@/lib/lis/format";
import {
  DataTable, KeyValue, Money, PageHeader, Panel, StatCard, StatusPill, Timeline,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import type { Settlement } from "@/lib/lis/types";
import {
  ArrowRight, Building2, CircleCheck, FileDown, HandCoins, Network, Store, Wallet,
} from "lucide-react";

const STATUSES = ["All", "Open", "Partially Settled", "Settled"];
const CHILD_TYPES = ["All", "B2B", "Sub-Agency"];
const PAY_MODES = ["NEFT", "RTGS", "UPI", "NetBanking", "Cheque"];

// Explainer chain — who settles with whom and how margin flows
function ChainExplainer() {
  const hops = [
    { icon: Building2, label: "Central Lab (Apex)", note: "Bills B2B partner at contracted tariff · collects payments" },
    { icon: Store, label: "B2B Partner", note: "Bills its sub-agencies · retains agreed margin %" },
    { icon: Network, label: "Sub-Agency", note: "Collects from patients · remits to parent partner" },
  ];
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      {hops.map((h, i) => (
        <React.Fragment key={h.label}>
          <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-teal-200 bg-teal-50/60 px-3 py-2">
            <div className="rounded-md bg-teal-600/10 p-1.5 text-teal-700"><h.icon className="h-4 w-4" /></div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">{h.label}</p>
              <p className="truncate text-[11px] text-muted-foreground">{h.note}</p>
            </div>
          </div>
          {i < hops.length - 1 ? <ArrowRight className="hidden h-4 w-4 shrink-0 text-slate-400 lg:block" /> : null}
        </React.Fragment>
      ))}
    </div>
  );
}

export function AdminSettlementsView() {
  const [status, setStatus] = React.useState("All");
  const [childType, setChildType] = React.useState("All");
  const [selected, setSelected] = React.useState<Settlement | null>(null);
  const [payOpen, setPayOpen] = React.useState(false);
  const [payAmount, setPayAmount] = React.useState("");
  const [payMode, setPayMode] = React.useState("NEFT");
  const [payRef, setPayRef] = React.useState("UTR-20260928-5512");
  const [payDone, setPayDone] = React.useState<string | null>(null);

  const rows = settlements.filter(
    (s) => (status === "All" || s.status === status) && (childType === "All" || s.childType === childType),
  );

  // KPIs — receivables by hop, margin earned on open cycles, closures
  const payableFromSubs = settlements.filter((s) => s.childType === "Sub-Agency").reduce((a, s) => a + s.payable, 0);
  const payableFromPartners = settlements.filter((s) => s.childType === "B2B").reduce((a, s) => a + s.payable, 0);
  const marginOpen = settlements.filter((s) => s.status !== "Settled").reduce((a, s) => a + s.margin, 0);
  const closedCount = settlements.filter((s) => s.status === "Settled").length;

  const columns: Column<Settlement>[] = [
    { key: "period", header: "Period", value: (r) => r.period, render: (r) => <span className="whitespace-nowrap text-xs font-medium text-slate-700">{r.period}</span> },
    { key: "chain", header: "Settlement Chain", value: (r) => `${r.parentName} → ${r.childName}`, render: (r) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-800">
          {r.parentName} <ArrowRight className="inline h-3 w-3 text-slate-400" /> {r.childName}
        </p>
        <p className="text-[11px] text-muted-foreground">{r.id}</p>
      </div>
    ) },
    { key: "billed", header: "Billed", headClassName: "text-right", className: "text-right", value: (r) => r.billed, render: (r) => <Money value={r.billed} /> },
    { key: "collected", header: "Collected", headClassName: "text-right", className: "text-right", value: (r) => r.collected, render: (r) => <Money value={r.collected} className="text-emerald-700" /> },
    { key: "marginPct", header: "Margin %", value: (r) => r.marginPct, render: (r) => (
      <Badge variant="outline" className="bg-emerald-50 text-[10px] font-semibold text-emerald-700 border-emerald-200">{r.marginPct}%</Badge>
    ) },
    { key: "margin", header: "Margin", headClassName: "text-right", className: "text-right", value: (r) => r.margin, render: (r) => <Money value={r.margin} /> },
    { key: "payable", header: "Payable", headClassName: "text-right", className: "text-right", value: (r) => r.payable, render: (r) => r.payable > 0 ? <Money value={r.payable} className="font-semibold text-rose-600" /> : <span className="text-xs font-medium text-emerald-600">Nil</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "last", header: "Last Payment", value: (r) => r.lastPayment, render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDate(r.lastPayment)}</span> },
  ];

  const openPay = (s: Settlement) => {
    setPayAmount(String(s.payable > 0 ? s.payable : 0));
    setPayDone(null);
    setPayOpen(true);
  };

  const recordPayment = () => {
    if (!selected) return;
    setPayDone(`Settlement payment of ${inr(Number(payAmount) || 0)} (${payMode}, ref ${payRef}) recorded for ${selected.childName} against ${selected.id}.`);
    setPayOpen(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sub-Agency & Partner Settlements"
        subtitle="Period-wise reconciliation of billed vs collected at every hop of the referral chain"
        icon={<Network className="h-5 w-5" />}
      />

      {/* Explainer */}
      <Panel title="How Settlements Flow" description="Collections cascade up the chain; margin is retained by the parent at each hop">
        <ChainExplainer />
      </Panel>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Payable from Sub-Agencies" value={inr(payableFromSubs, { compact: true })} accent="amber" sublabel="remitted to B2B parents" icon={<Store className="h-4 w-4" />} />
        <StatCard label="Payable from B2B Partners" value={inr(payableFromPartners, { compact: true })} accent="rose" sublabel="remitted to central lab" icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Margin Earned (Sep cycles)" value={inr(marginOpen, { compact: true })} accent="emerald" sublabel="open + partially settled" icon={<Wallet className="h-4 w-4" />} />
        <StatCard label="Settlements Closed" value={closedCount} sublabel={`${settlements.length} cycles tracked`} icon={<CircleCheck className="h-4 w-4" />} />
      </div>

      <Panel description="Click a row for the settlement sheet — activity timeline, statement download and payment recording">
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={8}
          searchOf={(r) => `${r.id} ${r.parentName} ${r.childName} ${r.period} ${r.status}`}
          searchPlaceholder="Search settlement / partner…"
          onRowClick={(r) => { setSelected(r); setPayDone(null); }}
          filters={
            <>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s === "All" ? "All statuses" : s}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={childType} onValueChange={setChildType}>
                <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                <SelectContent>{CHILD_TYPES.map((t) => <SelectItem key={t} value={t}>{t === "All" ? "All child types" : t}</SelectItem>)}</SelectContent>
              </Select>
            </>
          }
        />
      </Panel>

      {/* Settlement detail sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-2xl">
          {selected ? (
            <>
              <SheetHeader className="border-b px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <SheetTitle className="font-mono text-sm">{selected.id}</SheetTitle>
                    <p className="truncate text-xs text-muted-foreground">
                      {selected.parentName} → {selected.childName} · {selected.period}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusPill status={selected.status} />
                  </div>
                </div>
              </SheetHeader>
              <div className="space-y-5 p-5">
                <KeyValue
                  cols={3}
                  items={[
                    { label: "Parent", value: selected.parentName },
                    { label: "Child", value: `${selected.childName} (${selected.childType})` },
                    { label: "Last Payment", value: fmtDate(selected.lastPayment) },
                    { label: "Billed", value: <Money value={selected.billed} /> },
                    { label: "Collected", value: <Money value={selected.collected} className="text-emerald-700" /> },
                    { label: "Collection Rate", value: `${Math.round((selected.collected / selected.billed) * 100)}%` },
                    { label: "Margin %", value: <Badge variant="outline" className="bg-emerald-50 text-[10px] font-semibold text-emerald-700 border-emerald-200">{selected.marginPct}%</Badge> },
                    { label: "Margin", value: <Money value={selected.margin} /> },
                    { label: "Payable Now", value: selected.payable > 0 ? <Money value={selected.payable} className="font-semibold text-rose-600" /> : <span className="font-medium text-emerald-600">Nil</span> },
                  ]}
                />

                {payDone ? (
                  <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
                    <CircleCheck className="h-4 w-4" />
                    <AlertDescription className="text-xs font-medium">{payDone}</AlertDescription>
                  </Alert>
                ) : null}

                <Panel title="Settlement Activity">
                  <Timeline
                    items={[
                      { label: "Billing cycle opened", time: selected.period, note: `Parent: ${selected.parentName}` },
                      { label: "Business billed", time: selected.period, note: `${inr(selected.billed)} billed to downstream channel` },
                      { label: "Collections recorded", time: fmtDate(selected.lastPayment), note: `${inr(selected.collected)} collected (${Math.round((selected.collected / selected.billed) * 100)}%)` },
                      { label: selected.status === "Settled" ? "Cycle settled" : "Balance pending", time: selected.status === "Settled" ? fmtDate(selected.lastPayment) : undefined, note: selected.status === "Settled" ? "Full payable cleared" : `${inr(selected.payable)} outstanding — status: ${selected.status}` },
                    ]}
                  />
                </Panel>

                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" disabled={selected.payable === 0} onClick={() => openPay(selected)}>
                    <HandCoins className="mr-1.5 h-3.5 w-3.5" /> Record Settlement Payment
                  </Button>
                  <Button size="sm" variant="outline"><FileDown className="mr-1.5 h-3.5 w-3.5" /> Download Statement</Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Record settlement payment dialog */}
      <Dialog open={payOpen} onOpenChange={(o) => { setPayOpen(o); if (o) setPayDone(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Record Settlement Payment</DialogTitle>
            <DialogDescription className="text-xs">
              {selected ? `${selected.childName} → ${selected.parentName} · ${selected.id}` : "—"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <p className="text-xs font-medium text-slate-700">Amount (₹) <span className="text-rose-500">*</span></p>
              <Input className="h-9" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} inputMode="decimal" />
              {selected ? <p className="text-[11px] text-muted-foreground">Current payable: {inr(selected.payable)}</p> : null}
            </div>
            <div className="grid gap-1.5">
              <p className="text-xs font-medium text-slate-700">Mode <span className="text-rose-500">*</span></p>
              <Select value={payMode} onValueChange={setPayMode}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{PAY_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <p className="text-xs font-medium text-slate-700">Reference No.</p>
              <Input className="h-9 font-mono" value={payRef} onChange={(e) => setPayRef(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={!payAmount || Number(payAmount) <= 0} onClick={recordPayment}>
              <HandCoins className="mr-1.5 h-3.5 w-3.5" /> Save Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

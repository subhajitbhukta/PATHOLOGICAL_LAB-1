"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useLisNav } from "@/components/lis/nav";
import { invoices } from "@/lib/lis/data";
import { fmtDate, inr } from "@/lib/lis/format";
import {
  DataTable, PageHeader, Panel, StatCard, StatusPill,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { InvoiceDialog } from "@/components/lis/report-sheet";
import type { InvoiceViewData } from "@/components/lis/report-sheet";
import { BadgeIndianRupee, CheckCircle2, CreditCard, ReceiptText, Smartphone, Wallet } from "lucide-react";
import type { Invoice } from "@/lib/lis/types";

const PATIENT_ID = "PAT-00124";

const myInvoices = invoices.filter((i) => i.billToId === PATIENT_ID);
const paidTotal = myInvoices.reduce((a, i) => a + i.paid, 0);
const dueTotal = myInvoices.reduce((a, i) => a + Math.max(0, i.due), 0);

export function PatientBillsView() {
  const { go } = useLisNav();
  const [invoice, setInvoice] = React.useState<InvoiceViewData | null>(null);
  const [payOpen, setPayOpen] = React.useState(false);

  const columns: Column<Invoice>[] = [
    { key: "id", header: "Bill", value: (r) => r.id, render: (r) => (
      <div>
        <p className="font-mono text-xs font-medium text-emerald-800">{r.id}</p>
        <p className="text-[11px] text-muted-foreground">{fmtDate(r.date)}{r.orderId ? ` · ${r.orderId}` : ""}</p>
      </div>
    ) },
    { key: "for", header: "For", value: (r) => r.lines.map((l) => l.description).join(", "), render: (r) => (
      <span className="block max-w-64 truncate text-xs text-slate-700">{r.lines.map((l) => l.description).join(", ")}</span>
    ) },
    { key: "total", header: "Total", headClassName: "text-right", className: "text-right", value: (r) => r.total, render: (r) => <span className="text-sm font-semibold tabular-nums">{inr(r.total)}</span> },
    { key: "via", header: "Paid Via", value: (r) => r.mode, render: (r) => (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Smartphone className="h-3.5 w-3.5 text-emerald-600" /> {r.mode}</span>
    ) },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.due > 0 ? r.status : "Paid"} /> },
    { key: "act", header: "", render: (r) => (
      <Button variant="outline" size="sm" className="h-8" onClick={(e) => { e.stopPropagation(); setInvoice(r); }}>
        <ReceiptText className="mr-1 h-3 w-3" /> View
      </Button>
    ) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bills & Payments"
        subtitle="Transparent GST invoices for every test — nothing hidden"
        icon={<ReceiptText className="h-5 w-5" />}
        actions={
          <Button variant={dueTotal > 0 ? "default" : "outline"} disabled={dueTotal === 0} onClick={() => setPayOpen(true)}>
            <Wallet className="mr-1.5 h-4 w-4" /> Pay Now
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total Paid" value={inr(paidTotal)} accent="emerald" icon={<BadgeIndianRupee className="h-4 w-4" />} sublabel="across 2 bills this month" />
        <StatCard label="Outstanding" value={inr(dueTotal)} accent="emerald" icon={<Wallet className="h-4 w-4" />} sublabel="you are all settled" />
        <StatCard label="Bills" value={myInvoices.length} icon={<ReceiptText className="h-4 w-4" />} sublabel="GST tax invoices" />
      </div>

      <Panel>
        <DataTable
          columns={columns}
          rows={myInvoices}
          pageSize={10}
          searchOf={(r) => `${r.id} ${r.orderId ?? ""} ${r.mode} ${r.status}`}
          searchPlaceholder="Search bill…"
          onRowClick={(r) => setInvoice(r)}
        />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Payment Summary">
          <ul className="space-y-2.5">
            {myInvoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-slate-800">{inv.id}</p>
                  <p className="text-[11px] text-muted-foreground">{fmtDate(inv.date)} · {inv.mode}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums">{inr(inv.paid)}</span>
                  <StatusPill status="Paid" />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Accepted Payment Methods">
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            {["UPI — GPay / PhonePe / Paytm", "Credit / Debit Card", "NetBanking", "Cash at centre", "Pay after home visit"].map((m) => (
              <div key={m} className="flex items-center gap-2 rounded-lg border p-2.5 text-xs text-slate-700">
                <CreditCard className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> {m}
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
            <CheckCircle2 className="h-3.5 w-3.5" /> No card details stored — payments are processed by the bank.
          </p>
        </Panel>
      </div>

      <InvoiceDialog open={!!invoice} onOpenChange={(o) => !o && setInvoice(null)} data={invoice} />

      {/* Pay Now mock dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Pay Now</DialogTitle>
            <DialogDescription className="text-xs">Secure checkout — UPI, card or NetBanking</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 text-center">
            <p className="text-xs text-muted-foreground">Amount due</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{inr(0)}</p>
            <p className="mt-1 text-xs text-emerald-800">You have no pending bills — you are all settled.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>Close</Button>
            <Button disabled><Wallet className="mr-1.5 h-4 w-4" /> Pay {inr(0)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

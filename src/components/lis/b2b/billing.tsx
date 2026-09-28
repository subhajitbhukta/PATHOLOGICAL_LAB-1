"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { invoices, ledgerEntries, partners } from "@/lib/lis/data";
import { fmtDate, inr } from "@/lib/lis/format";
import {
  DataTable, PageHeader, Panel, PrintButton, StatCard, StatusPill,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { InvoiceDialog } from "@/components/lis/report-sheet";
import type { Invoice, LedgerEntry } from "@/lib/lis/types";
import { CheckCircle2, CreditCard, ReceiptText, Wallet } from "lucide-react";

// ============================================================
// B2B Billing & Ledger — ABC Diagnostics account statement
// ============================================================

const PARTNER_ID = "B2B-001";
const partner = partners.find((p) => p.id === PARTNER_ID) ?? partners[0];
const myLedger = ledgerEntries.filter((l) => l.partnerId === PARTNER_ID);
const monthBilled = myLedger.filter((l) => l.type === "Invoice").reduce((a, l) => a + l.debit, 0);
const monthPaid = myLedger.filter((l) => l.type === "Payment").reduce((a, l) => a + l.credit, 0);
const myInvoices = invoices.filter((i) => i.billToId === PARTNER_ID);
const creditPct = Math.round((partner.outstanding / partner.creditLimit) * 100);

export function B2bBillingView() {
  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [payOpen, setPayOpen] = React.useState(false);
  const [payAmount, setPayAmount] = React.useState(String(partner.outstanding));
  const [payMode, setPayMode] = React.useState("NEFT");
  const [payRef, setPayRef] = React.useState("UTIB0000123 / 8834521");
  const [paidDone, setPaidDone] = React.useState(false);

  const columns: Column<LedgerEntry>[] = [
    { key: "date", header: "Date", value: (r) => r.date, render: (r) => <span className="whitespace-nowrap text-xs">{fmtDate(r.date)}</span> },
    { key: "ref", header: "Ref", value: (r) => r.ref, render: (r) => <span className="font-mono text-xs font-medium text-violet-800">{r.ref}</span> },
    {
      key: "type", header: "Type", value: (r) => r.type,
      render: (r) => (
        <Badge variant="outline" className={r.type === "Payment" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : r.type === "Invoice" ? "border-violet-200 bg-violet-50 text-violet-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
          {r.type}
        </Badge>
      ),
    },
    { key: "desc", header: "Description", value: (r) => r.description, render: (r) => <span className="text-xs">{r.description}</span> },
    {
      key: "debit", header: "Debit", headClassName: "text-right", className: "text-right",
      value: (r) => r.debit, render: (r) => <span className="tabular-nums">{r.debit ? inr(r.debit) : "—"}</span>,
    },
    {
      key: "credit", header: "Credit", headClassName: "text-right", className: "text-right",
      value: (r) => r.credit, render: (r) => <span className="tabular-nums text-emerald-700">{r.credit ? inr(r.credit) : "—"}</span>,
    },
    {
      key: "balance", header: "Balance", headClassName: "text-right", className: "text-right",
      value: (r) => r.balance, render: (r) => <span className="font-semibold tabular-nums">{inr(r.balance)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Billing & Ledger"
        subtitle={`Account statement for ${partner.name} · credit terms: 14 days · last settlement ${fmtDate(partner.lastSettlement)}`}
        actions={
          <>
            <PrintButton label="Download Statement" />
            <Button className="bg-violet-600 text-white hover:bg-violet-700" onClick={() => { setPayOpen(true); setPaidDone(false); }}>
              <CreditCard className="mr-1.5 h-4 w-4" /> Pay Now
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="This-Month Billed" value={inr(monthBilled, { compact: true })} icon={<ReceiptText className="h-4 w-4" />} accent="violet" sublabel="Sep 2026 invoices" />
        <StatCard label="Payments Received" value={inr(monthPaid, { compact: true })} icon={<CheckCircle2 className="h-4 w-4" />} accent="emerald" sublabel="3 NEFT credits" />
        <StatCard label="Outstanding" value={inr(partner.outstanding)} icon={<Wallet className="h-4 w-4" />} accent="rose" sublabel="due 12 Oct 2026" />
        <Panel contentClassName="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Credit Limit Used</p>
            <span className="text-xs font-semibold tabular-nums text-violet-700">{creditPct}%</span>
          </div>
          <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{inr(partner.outstanding)} <span className="text-xs font-normal text-muted-foreground">of {inr(partner.creditLimit)}</span></p>
          <Progress value={creditPct} className="mt-2 h-2" />
          <p className="mt-1.5 text-[11px] text-muted-foreground">Headroom {inr(partner.creditLimit - partner.outstanding)}</p>
        </Panel>
      </div>

      {/* Statement */}
      <Panel title="Account Statement — September 2026" description="Weekly invoices, payments and notes posted to your account">
        <DataTable
          columns={columns}
          rows={myLedger}
          pageSize={10}
          searchOf={(r) => `${r.date} ${r.ref} ${r.type} ${r.description}`}
          searchPlaceholder="Search statement…"
        />
      </Panel>

      {/* Weekly invoices */}
      <Panel title="Weekly Invoices — Apex → ABC" description="GST invoices raised on your account · open to print or download">
        <ul className="divide-y rounded-lg border">
          {myInvoices.map((inv) => (
            <li key={inv.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="font-mono text-xs font-medium text-violet-800">{inv.id}</p>
                <p className="text-xs text-muted-foreground">
                  {fmtDate(inv.date)} · {inv.lines.length} line(s) · {inv.orderId ?? "consolidated weekly billing"} · due {fmtDate(inv.dueDate)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">{inr(inv.total)}</p>
                  <p className={`text-[11px] tabular-nums ${inv.due > 0 ? "text-rose-600" : "text-emerald-600"}`}>{inv.due > 0 ? `due ${inr(inv.due)}` : "fully paid"}</p>
                </div>
                <StatusPill status={inv.status} />
                <Button variant="outline" size="sm" className="h-8" onClick={() => setInvoice(inv)}>
                  <ReceiptText className="mr-1 h-3.5 w-3.5" /> View
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <InvoiceDialog open={!!invoice} onOpenChange={(o) => !o && setInvoice(null)} data={invoice} />

      {/* Pay now dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Pay Outstanding Amount</DialogTitle>
            <DialogDescription className="text-xs">Payments reflect in your ledger within 24 working hours</DialogDescription>
          </DialogHeader>
          {paidDone ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold">Payment recorded</p>
                  <p className="text-xs leading-relaxed">
                    {inr(Number(payAmount) || 0)} via {payMode} · ref {payRef}. Apex accounts has been notified —
                    the credit note appears in your statement shortly.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPayOpen(false)}>Close</Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Amount (₹) <span className="text-rose-500">*</span></label>
                  <Input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
                  <p className="text-[11px] text-muted-foreground">Total outstanding: {inr(partner.outstanding)} · credit limit {inr(partner.creditLimit)}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Payment Mode</label>
                  <Select value={payMode} onValueChange={setPayMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEFT">NEFT / RTGS</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="NetBanking">NetBanking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Reference / UTR</label>
                  <Input value={payRef} onChange={(e) => setPayRef(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
                <Button className="bg-violet-600 text-white hover:bg-violet-700" onClick={() => setPaidDone(true)}>
                  <CreditCard className="mr-1.5 h-4 w-4" /> Record Payment
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { invoices, ledgerEntries } from "@/lib/lis/data";
import { fmtDate, inr } from "@/lib/lis/format";
import {
  DataTable, Field, FormGrid, Money, PageHeader, Panel, StatCard, StatusPill,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { InvoiceDialog } from "@/components/lis/report-sheet";
import type { InvoiceViewData } from "@/components/lis/report-sheet";
import type { Invoice } from "@/lib/lis/types";
import {
  BadgeIndianRupee, CircleCheck, Eye, FilePlus2, HandCoins, Landmark, ReceiptText, Wallet,
} from "lucide-react";

// ---------- Local helpers ----------
const SCOPE_TONE: Record<Invoice["scope"], string> = {
  Patient: "bg-teal-600/10 text-teal-700 border-teal-200",
  B2B: "bg-violet-600/10 text-violet-700 border-violet-200",
  "Sub-Agency": "bg-amber-500/10 text-amber-700 border-amber-200",
};

const PAY_MODES = ["UPI", "Cash", "Card", "NetBanking", "NEFT", "RTGS", "Credit"];

interface PaymentRow {
  date: string; invoice: string; from: string; sub?: string; amount: number; mode: string;
}

interface CreditNoteRow {
  id: string; date: string; invoice: string; party: string; reason: string; amount: number; status: "Approved" | "Pending";
}

// Seed derived from data: the booked credit note lives in the partner ledger
const cnFromLedger = ledgerEntries.find((l) => l.type === "Credit Note");
const firstAbcInvoice = invoices.find((i) => i.billToId === "B2B-001");
const firstSubInvoice = invoices.find((i) => i.scope === "Sub-Agency");

const CREDIT_NOTES_SEED: CreditNoteRow[] = [
  ...(cnFromLedger
    ? [{
        id: cnFromLedger.ref,
        date: cnFromLedger.date,
        invoice: firstAbcInvoice?.id ?? "—",
        party: cnFromLedger.partnerName,
        reason: cnFromLedger.description,
        amount: cnFromLedger.credit,
        status: "Approved" as const,
      }]
    : []),
  {
    id: "CN-2026-01177",
    date: "2026-09-27",
    invoice: firstSubInvoice?.id ?? "—",
    party: firstSubInvoice?.billTo ?? "—",
    reason: "Vitamin D (25-OH) billed at B2C rate — sub-agency tariff difference (incl. GST)",
    amount: 317,
    status: "Pending",
  },
];

export function AdminBillingView() {
  const [invoiceView, setInvoiceView] = React.useState<InvoiceViewData | null>(null);
  const [payOpen, setPayOpen] = React.useState(false);
  const [payInvoiceId, setPayInvoiceId] = React.useState("");
  const [payAmount, setPayAmount] = React.useState("");
  const [payMode, setPayMode] = React.useState("NEFT");
  const [payRef, setPayRef] = React.useState("UTR-20260928-4471");
  const [payDone, setPayDone] = React.useState<string | null>(null);
  const [cnOpen, setCnOpen] = React.useState(false);
  const [cnInvoiceId, setCnInvoiceId] = React.useState("");
  const [cnAmount, setCnAmount] = React.useState("");
  const [cnReason, setCnReason] = React.useState("Rate correction — tariff difference");
  const [cnSeq, setCnSeq] = React.useState(1185);
  const [notes, setNotes] = React.useState<CreditNoteRow[]>(CREDIT_NOTES_SEED);

  // KPIs — billed, collected, outstanding, GST payable (all Sep 2026 invoices)
  const billedMonth = invoices.reduce((a, i) => a + i.total, 0);
  const collected = invoices.reduce((a, i) => a + i.paid, 0);
  const outstanding = invoices.reduce((a, i) => a + i.due, 0);
  const gstPayable = invoices.reduce((a, i) => a + i.cgst + i.sgst, 0);

  const invoiceRows = [...invoices].sort((a, b) => b.id.localeCompare(a.id));

  // Payments derived from invoices where a collection was recorded
  const paymentRows: PaymentRow[] = invoices
    .filter((i) => i.paid > 0)
    .map((i) => ({ date: i.date, invoice: i.id, from: i.billTo, sub: i.billToSub, amount: i.paid, mode: i.mode }))
    .sort((a, b) => (a.date === b.date ? b.invoice.localeCompare(a.invoice) : b.date.localeCompare(a.date)));

  const openInvoices = invoices.filter((i) => i.due > 0);
  const payTarget = invoices.find((i) => i.id === payInvoiceId);

  const invoiceColumns: Column<Invoice>[] = [
    { key: "id", header: "Invoice No", value: (r) => r.id, render: (r) => <span className="font-mono text-xs font-medium text-teal-800">{r.id}</span> },
    { key: "date", header: "Date", value: (r) => r.date, render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDate(r.date)}</span> },
    { key: "scope", header: "Scope", value: (r) => r.scope, render: (r) => (
      <Badge variant="outline" className={`text-[10px] font-semibold ${SCOPE_TONE[r.scope]}`}>{r.scope}</Badge>
    ) },
    { key: "billTo", header: "Billed To", value: (r) => r.billTo, render: (r) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-800">{r.billTo}</p>
        {r.billToSub ? <p className="truncate text-[11px] text-muted-foreground">{r.billToSub}</p> : null}
      </div>
    ) },
    { key: "total", header: "Total", headClassName: "text-right", className: "text-right", value: (r) => r.total, render: (r) => <Money value={r.total} /> },
    { key: "paid", header: "Paid", headClassName: "text-right", className: "text-right", value: (r) => r.paid, render: (r) => <Money value={r.paid} className="text-emerald-700" /> },
    { key: "due", header: "Due", headClassName: "text-right", className: "text-right", value: (r) => r.due, render: (r) => <Money value={r.due} className={r.due > 0 ? "font-semibold text-rose-600" : "text-emerald-600"} /> },
    { key: "mode", header: "Mode", value: (r) => r.mode, render: (r) => <span className="text-xs text-muted-foreground">{r.mode}</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "act", header: "", render: (r) => (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setInvoiceView(r); }} title="View invoice">
        <Eye className="h-3.5 w-3.5" />
      </Button>
    ) },
  ];

  const paymentColumns: Column<PaymentRow>[] = [
    { key: "date", header: "Date", value: (r) => r.date, render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDate(r.date)}</span> },
    { key: "invoice", header: "Invoice", value: (r) => r.invoice, render: (r) => <span className="font-mono text-xs font-medium text-teal-800">{r.invoice}</span> },
    { key: "from", header: "From", value: (r) => r.from, render: (r) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-800">{r.from}</p>
        {r.sub ? <p className="truncate text-[11px] text-muted-foreground">{r.sub}</p> : null}
      </div>
    ) },
    { key: "amount", header: "Amount", headClassName: "text-right", className: "text-right", value: (r) => r.amount, render: (r) => <Money value={r.amount} className="text-emerald-700" /> },
    { key: "mode", header: "Mode", value: (r) => r.mode, render: (r) => <Badge variant="outline" className="text-[10px]">{r.mode}</Badge> },
  ];

  const cnColumns: Column<CreditNoteRow>[] = [
    { key: "id", header: "Credit Note", value: (r) => r.id, render: (r) => <span className="font-mono text-xs font-medium text-teal-800">{r.id}</span> },
    { key: "date", header: "Date", value: (r) => r.date, render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDate(r.date)}</span> },
    { key: "invoice", header: "Against Invoice", value: (r) => r.invoice, render: (r) => <span className="font-mono text-xs">{r.invoice}</span> },
    { key: "party", header: "Party", value: (r) => r.party, render: (r) => <span className="text-sm font-medium text-slate-800">{r.party}</span> },
    { key: "reason", header: "Reason", render: (r) => <span className="text-xs text-muted-foreground">{r.reason}</span> },
    { key: "amount", header: "Amount", headClassName: "text-right", className: "text-right", value: (r) => r.amount, render: (r) => <span className="font-semibold tabular-nums text-amber-700">− {inr(r.amount)}</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
  ];

  const recordPayment = () => {
    const inv = invoices.find((i) => i.id === payInvoiceId);
    if (!inv) return;
    setPayDone(`Payment of ${inr(Number(payAmount) || 0)} recorded against ${inv.id} (${payMode}). Ledger updated for ${inv.billTo}.`);
    setPayOpen(false);
  };

  const issueCreditNote = () => {
    const inv = invoices.find((i) => i.id === cnInvoiceId);
    if (!inv) return;
    const note: CreditNoteRow = {
      id: `CN-2026-0${cnSeq}`,
      date: "2026-09-28",
      invoice: inv.id,
      party: inv.billTo,
      reason: cnReason,
      amount: Number(cnAmount) || 0,
      status: "Pending",
    };
    setNotes([note, ...notes]);
    setCnSeq(cnSeq + 1);
    setCnOpen(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Billing & Invoicing"
        subtitle="GST tax invoices, collections and credit notes across Patient, B2B and Sub-Agency scopes"
        icon={<ReceiptText className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" onClick={() => setCnOpen(true)}><FilePlus2 className="mr-1.5 h-4 w-4" /> Issue Credit Note</Button>
            <Button onClick={() => setPayOpen(true)}><HandCoins className="mr-1.5 h-4 w-4" /> Record Payment</Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Billed This Month" value={inr(billedMonth, { compact: true })} sublabel={`${invoices.length} invoices · Sep 2026`} icon={<ReceiptText className="h-4 w-4" />} />
        <StatCard label="Collected" value={inr(collected, { compact: true })} accent="emerald" sublabel={`${Math.round((collected / billedMonth) * 100)}% of billed`} icon={<BadgeIndianRupee className="h-4 w-4" />} />
        <StatCard label="Outstanding" value={inr(outstanding, { compact: true })} accent="rose" sublabel={`${openInvoices.length} invoices open`} icon={<Wallet className="h-4 w-4" />} />
        <StatCard label="GST Payable" value={inr(gstPayable, { compact: true })} accent="amber" sublabel="CGST + SGST @ 9% each" icon={<Landmark className="h-4 w-4" />} />
      </div>

      {payDone ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
          <CircleCheck className="h-4 w-4" />
          <AlertDescription className="text-xs font-medium">{payDone}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="invoices" className="text-xs">Invoices</TabsTrigger>
          <TabsTrigger value="payments" className="text-xs">Payments</TabsTrigger>
          <TabsTrigger value="creditnotes" className="text-xs">Credit Notes</TabsTrigger>
        </TabsList>

        {/* Invoices */}
        <TabsContent value="invoices" className="space-y-4">
          <Panel description="Every invoice raised by the central lab — click View for the GST tax invoice preview">
            <DataTable
              columns={invoiceColumns}
              rows={invoiceRows}
              pageSize={8}
              searchOf={(r) => `${r.id} ${r.billTo} ${r.billToSub ?? ""} ${r.scope} ${r.status}`}
              searchPlaceholder="Search invoice / party…"
              onRowClick={(r) => setInvoiceView(r)}
            />
          </Panel>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments" className="space-y-4">
          <Panel
            title="Collections Register"
            description="Derived from invoices with recorded payments — matches the partner ledgers"
            actions={<Button size="sm" onClick={() => setPayOpen(true)}><HandCoins className="mr-1.5 h-3.5 w-3.5" /> Record Payment</Button>}
          >
            <DataTable
              columns={paymentColumns}
              rows={paymentRows}
              pageSize={8}
              searchOf={(r) => `${r.invoice} ${r.from} ${r.mode}`}
              searchPlaceholder="Search payment…"
            />
          </Panel>
        </TabsContent>

        {/* Credit Notes */}
        <TabsContent value="creditnotes" className="space-y-4">
          <Panel
            title="Credit Notes Issued"
            description="Rate corrections and billing adjustments — pending notes adjust in the next billing cycle"
            actions={<Button size="sm" variant="outline" onClick={() => setCnOpen(true)}><FilePlus2 className="mr-1.5 h-3.5 w-3.5" /> Issue Credit Note</Button>}
          >
            <DataTable
              columns={cnColumns}
              rows={notes}
              pageSize={6}
              searchOf={(r) => `${r.id} ${r.invoice} ${r.party} ${r.reason}`}
              searchPlaceholder="Search credit note…"
            />
          </Panel>
        </TabsContent>
      </Tabs>

      {/* Tax invoice preview */}
      <InvoiceDialog open={!!invoiceView} onOpenChange={(o) => !o && setInvoiceView(null)} data={invoiceView} />

      {/* Record Payment dialog */}
      <Dialog open={payOpen} onOpenChange={(o) => { setPayOpen(o); if (o) { setPayDone(null); if (!payInvoiceId && openInvoices[0]) setPayInvoiceId(openInvoices[0].id); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Record Payment</DialogTitle>
            <DialogDescription className="text-xs">Post a collection against an open invoice — ledger and ageing update instantly.</DialogDescription>
          </DialogHeader>
          <FormGrid cols={2}>
            <Field label="Invoice" required className="sm:col-span-2">
              <Select
                value={payInvoiceId}
                onValueChange={(v) => {
                  setPayInvoiceId(v);
                  const inv = invoices.find((i) => i.id === v);
                  if (inv) setPayAmount(String(inv.due));
                }}
              >
                <SelectTrigger className="h-9"><SelectValue placeholder="Select invoice" /></SelectTrigger>
                <SelectContent>
                  {openInvoices.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.id} — {i.billTo} · due {inr(i.due)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Amount (₹)" required>
              <Input className="h-9" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0" inputMode="decimal" />
            </Field>
            <Field label="Mode" required>
              <Select value={payMode} onValueChange={setPayMode}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{PAY_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Reference No." hint="UTR / transaction reference" className="sm:col-span-2">
              <Input className="h-9 font-mono" value={payRef} onChange={(e) => setPayRef(e.target.value)} />
            </Field>
          </FormGrid>
          {payTarget ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              {payTarget.billTo} · invoice total <span className="font-semibold tabular-nums">{inr(payTarget.total)}</span>, balance due <span className="font-semibold tabular-nums text-rose-600">{inr(payTarget.due)}</span>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={!payInvoiceId || !payAmount} onClick={recordPayment}><HandCoins className="mr-1.5 h-3.5 w-3.5" /> Save Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Credit Note dialog */}
      <Dialog open={cnOpen} onOpenChange={(o) => { setCnOpen(o); if (o) { if (!cnInvoiceId && invoices[0]) setCnInvoiceId(invoices[0].id); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Issue Credit Note</DialogTitle>
            <DialogDescription className="text-xs">Raise a CN against an existing tax invoice — reason is mandatory for GST filings.</DialogDescription>
          </DialogHeader>
          <FormGrid cols={2}>
            <Field label="Against Invoice" required className="sm:col-span-2">
              <Select
                value={cnInvoiceId}
                onValueChange={(v) => {
                  setCnInvoiceId(v);
                  const inv = invoices.find((i) => i.id === v);
                  if (inv) setCnAmount(String(Math.round(inv.total * 0.06)));
                }}
              >
                <SelectTrigger className="h-9"><SelectValue placeholder="Select invoice" /></SelectTrigger>
                <SelectContent>
                  {invoiceRows.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.id} — {i.billTo} · {inr(i.total)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Amount (₹)" required>
              <Input className="h-9" value={cnAmount} onChange={(e) => setCnAmount(e.target.value)} placeholder="0" inputMode="decimal" />
            </Field>
            <Field label="Reason" required>
              <Input className="h-9" value={cnReason} onChange={(e) => setCnReason(e.target.value)} />
            </Field>
          </FormGrid>
          <p className="text-[11px] text-muted-foreground">
            Approved notes post to the partner ledger automatically; pending notes are reviewed by Accounts.
          </p>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setCnOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={!cnInvoiceId || !cnAmount} onClick={issueCreditNote}><FilePlus2 className="mr-1.5 h-3.5 w-3.5" /> Issue CN</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

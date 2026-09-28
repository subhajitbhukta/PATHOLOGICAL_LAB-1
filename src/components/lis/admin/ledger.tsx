"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ledgerEntries, misAgeing, partners } from "@/lib/lis/data";
import { fmtDate, inr } from "@/lib/lis/format";
import {
  DataTable, KeyValue, Money, PageHeader, Panel, PrintButton, StatCard,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import type { LedgerEntry } from "@/lib/lis/types";
import { BellRing, BookOpenCheck, Landmark, ReceiptText, Wallet } from "lucide-react";

// ---------- Local helpers ----------
const TYPE_TONE: Record<LedgerEntry["type"], string> = {
  Invoice: "bg-violet-600/10 text-violet-700 border-violet-200",
  Payment: "bg-emerald-600/10 text-emerald-700 border-emerald-200",
  "Credit Note": "bg-amber-500/10 text-amber-700 border-amber-200",
  "Debit Note": "bg-rose-500/10 text-rose-700 border-rose-200",
  Opening: "bg-slate-100 text-slate-600 border-slate-200",
};

const REMINDER_CHANNELS = ["Email", "SMS", "WhatsApp"];

export function AdminLedgerView() {
  const [partnerId, setPartnerId] = React.useState("B2B-001");
  const [reminderOpen, setReminderOpen] = React.useState(false);
  const [reminderChannel, setReminderChannel] = React.useState("Email");
  const [reminderBody, setReminderBody] = React.useState("");
  const [reminderSent, setReminderSent] = React.useState(false);

  const ledgerPartnerIds = [...new Set(ledgerEntries.map((l) => l.partnerId))];
  const partner = partners.find((p) => p.id === partnerId);
  const entries = ledgerEntries.filter((l) => l.partnerId === partnerId);

  const openingEntry = entries.find((l) => l.type === "Opening");
  const openingBalance = openingEntry ? openingEntry.debit : 0;
  const closingBalance = entries.length > 0 ? entries[entries.length - 1].balance : 0;
  const totalBilled = entries.filter((l) => l.type === "Invoice").reduce((a, l) => a + l.debit, 0);
  const totalCollected = entries.filter((l) => l.type === "Payment").reduce((a, l) => a + l.credit, 0);
  const creditLimit = partner?.creditLimit ?? 1;
  const creditUsedPct = Math.min(100, Math.round((closingBalance / creditLimit) * 100));

  const openReminder = () => {
    if (!partner) return;
    setReminderBody(
      `Dear ${partner.contactPerson}, outstanding of ${inr(closingBalance)} is pending on your Apex account (${partner.id}) as on 28 Sep 2026. ` +
      `Credit utilisation is at ${creditUsedPct}% of the sanctioned limit of ${inr(creditLimit)}. Kindly arrange settlement to avoid hold on report release. — Apex Reference Laboratories, Accounts`,
    );
    setReminderSent(false);
    setReminderOpen(true);
  };

  const sendReminder = () => {
    setReminderSent(true);
  };

  const statementColumns: Column<LedgerEntry>[] = [
    { key: "date", header: "Date", value: (r) => r.date, render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDate(r.date)}</span> },
    { key: "ref", header: "Ref", value: (r) => r.ref, render: (r) => <span className="font-mono text-xs font-medium text-teal-800">{r.ref}</span> },
    { key: "type", header: "Type", value: (r) => r.type, render: (r) => (
      <Badge variant="outline" className={`text-[10px] font-semibold ${TYPE_TONE[r.type]}`}>{r.type}</Badge>
    ) },
    { key: "desc", header: "Description", value: (r) => r.description, render: (r) => <span className="text-xs text-slate-700">{r.description}</span> },
    { key: "debit", header: "Debit", headClassName: "text-right", className: "text-right", value: (r) => r.debit, render: (r) => r.debit > 0 ? <Money value={r.debit} /> : <span className="text-xs text-slate-300">—</span> },
    { key: "credit", header: "Credit", headClassName: "text-right", className: "text-right", value: (r) => r.credit, render: (r) => r.credit > 0 ? <Money value={r.credit} className="text-emerald-700" /> : <span className="text-xs text-slate-300">—</span> },
    { key: "bal", header: "Balance", headClassName: "text-right", className: "text-right", value: (r) => r.balance, render: (r) => <span className="text-sm font-bold tabular-nums text-slate-900">{inr(r.balance)}</span> },
  ];

  const ageingTotal = misAgeing.reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ledgers & Outstanding"
        subtitle="Partner-wise running statement — billing, collections, credit notes and ageing"
        icon={<BookOpenCheck className="h-5 w-5" />}
        actions={
          <>
            <PrintButton label="Statement PDF" />
            <Button variant="outline" onClick={openReminder}><BellRing className="mr-1.5 h-4 w-4" /> Send Reminder</Button>
            <Select value={partnerId} onValueChange={setPartnerId}>
              <SelectTrigger className="h-9 w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ledgerPartnerIds.map((id) => {
                  const p = partners.find((x) => x.id === id);
                  return <SelectItem key={id} value={id}>{id} — {p?.name ?? id}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Opening Balance" value={inr(openingBalance, { compact: true })} sublabel="as on 01 Sep 2026" icon={<BookOpenCheck className="h-4 w-4" />} />
        <StatCard label="Total Billed (Sep)" value={inr(totalBilled, { compact: true })} accent="violet" sublabel="invoices posted to ledger" icon={<ReceiptText className="h-4 w-4" />} />
        <StatCard label="Collected (Sep)" value={inr(totalCollected, { compact: true })} accent="emerald" sublabel="NEFT / RTGS receipts" icon={<Landmark className="h-4 w-4" />} />
        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-muted-foreground">Outstanding vs Credit Limit</p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  {inr(closingBalance, { compact: true })} <span className="text-xs font-normal text-muted-foreground">/ {inr(creditLimit, { compact: true })}</span>
                </p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-2 text-amber-700"><Wallet className="h-4 w-4" /></div>
            </div>
            <Progress value={creditUsedPct} className="mt-3 h-2" />
            <p className="mt-1.5 text-xs text-muted-foreground">{creditUsedPct}% of sanctioned limit utilised</p>
          </CardContent>
        </Card>
      </div>

      {/* Partner card + statement */}
      <Panel
        title={`${partnerId} — ${partner?.name ?? "Partner"} · Account Statement`}
        description={`Statement of account for September 2026 · closing balance ${inr(closingBalance)}`}
      >
        {partner ? (
          <div className="mb-4">
            <KeyValue
              cols={4}
              items={[
              { label: "Contact", value: partner.contactPerson },
              { label: "City", value: partner.city },
              { label: "Pricing Tier", value: partner.pricingTier },
              { label: "Discount", value: `${partner.discountPct}%` },
              { label: "Email", value: partner.email },
              { label: "Mobile", value: partner.mobile },
              { label: "Last Settlement", value: fmtDate(partner.lastSettlement) },
              { label: "Sub-Agencies", value: String(partner.subAgencies) },
            ]}
          />
        </div>
        ) : null}
        <DataTable
          columns={statementColumns}
          rows={entries}
          pageSize={10}
          dense
          searchOf={(r) => `${r.ref} ${r.type} ${r.description}`}
          searchPlaceholder="Search ref / description…"
        />
        <div className="mt-3 flex flex-wrap items-center justify-end gap-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">Opening: <span className="font-semibold tabular-nums text-slate-800">{inr(openingBalance)}</span></span>
          <span className="text-muted-foreground">Total Debit: <span className="font-semibold tabular-nums text-slate-800">{inr(entries.reduce((a, l) => a + l.debit, 0))}</span></span>
          <span className="text-muted-foreground">Total Credit: <span className="font-semibold tabular-nums text-emerald-700">{inr(entries.reduce((a, l) => a + l.credit, 0))}</span></span>
          <span className="text-muted-foreground">Closing: <span className="text-base font-bold tabular-nums text-slate-900">{inr(closingBalance)}</span></span>
        </div>
      </Panel>

      {/* Ageing analysis */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Ageing Analysis" description="Receivables across all partners by pending bucket">
          <div className="space-y-3">
            {misAgeing.map((b) => (
              <div key={b.bucket} className="grid grid-cols-[minmax(90px,140px)_1fr_auto] items-center gap-2">
                <span className="truncate text-xs font-medium text-slate-700">{b.bucket}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-600"
                    style={{ width: `${Math.round((b.amount / ageingTotal) * 100)}%`, opacity: 0.85 }}
                  />
                </div>
                <span className="text-xs font-semibold tabular-nums text-slate-800">
                  {inr(b.amount)}<span className="ml-1 font-normal text-muted-foreground">· {b.partners} partners</span>
                </span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Ageing Buckets" description="Amount and partner exposure per bucket">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-[11px] uppercase text-slate-500">
                <th className="px-3 py-2 font-semibold">Bucket</th>
                <th className="px-3 py-2 text-right font-semibold">Amount</th>
                <th className="px-3 py-2 text-right font-semibold">Partners</th>
                <th className="px-3 py-2 text-right font-semibold">Share</th>
              </tr>
            </thead>
            <tbody>
              {misAgeing.map((b) => (
                <tr key={b.bucket} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-medium text-slate-800">{b.bucket}</td>
                  <td className="px-3 py-2 text-right tabular-nums"><Money value={b.amount} /></td>
                  <td className="px-3 py-2 text-right tabular-nums">{b.partners}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{Math.round((b.amount / ageingTotal) * 100)}%</td>
                </tr>
              ))}
              <tr className="text-sm font-bold">
                <td className="px-3 py-2">Total Outstanding</td>
                <td className="px-3 py-2 text-right tabular-nums">{inr(ageingTotal)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{misAgeing.reduce((a, b) => a + b.partners, 0)}</td>
                <td className="px-3 py-2 text-right tabular-nums">100%</td>
              </tr>
            </tbody>
          </table>
        </Panel>
      </div>

      {/* Send reminder dialog */}
      <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Send Payment Reminder — {partner?.name}</DialogTitle>
            <DialogDescription className="text-xs">Outstanding {inr(closingBalance)} · credit utilisation {creditUsedPct}%</DialogDescription>
          </DialogHeader>
          {reminderSent ? (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
              <BellRing className="h-4 w-4" />
              <AlertDescription className="text-xs font-medium">
                Reminder sent to {partner?.contactPerson} via {reminderChannel}. A follow-up is scheduled in 3 days if the balance remains unpaid.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <KeyValue
                items={[
                  { label: "To", value: partner?.email ?? "—" },
                  { label: "Channel", value: (
                    <Select value={reminderChannel} onValueChange={setReminderChannel}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>{REMINDER_CHANNELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  ) },
                ]}
              />
              <Textarea rows={5} value={reminderBody} onChange={(e) => setReminderBody(e.target.value)} className="text-xs" />
            </>
          )}
          <DialogFooter>
            {reminderSent ? (
              <Button size="sm" onClick={() => setReminderOpen(false)}>Done</Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setReminderOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={sendReminder}><BellRing className="mr-1.5 h-3.5 w-3.5" /> Send Reminder</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

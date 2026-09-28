"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { invoices, settlements, priceRules, priceFor, tests } from "@/lib/lis/data";
import { fmtDate, inr } from "@/lib/lis/format";
import {
  DataTable, Field, FormGrid, Money, PageHeader, Panel, StatCard, StatusPill,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { InvoiceDialog } from "@/components/lis/report-sheet";
import type { InvoiceViewData } from "@/components/lis/report-sheet";
import { BadgeCheck, CheckCircle2, FileText, HandCoins, PiggyBank, Wallet } from "lucide-react";
import type { Invoice } from "@/lib/lis/types";

const AGENCY_ID = "SUB-001";
const PARENT_NAME = "ABC Diagnostics";

const agencyInvoices = invoices.filter((i) => i.billToId === AGENCY_ID);
const agencySettlements = settlements.filter((s) => s.childId === AGENCY_ID);
const rateRules = priceRules.filter((r) => r.scope === "SUB" && r.scopeId === AGENCY_ID);

const sepSettlement = agencySettlements.find((s) => s.period.startsWith("Sep")) ?? agencySettlements[0];
const dueTotal = agencyInvoices.reduce((a, i) => a + Math.max(0, i.due), 0);

export function AgencyBillingView() {
  const [invoice, setInvoice] = React.useState<InvoiceViewData | null>(null);
  const [payOpen, setPayOpen] = React.useState(false);
  const [payDone, setPayDone] = React.useState(false);

  const invoiceColumns: Column<Invoice>[] = [
    { key: "id", header: "Invoice", value: (r) => r.id, render: (r) => (
      <div>
        <p className="font-mono text-xs font-medium text-amber-800">{r.id}</p>
        <p className="text-[11px] text-muted-foreground">{fmtDate(r.date)}{r.dueDate ? ` · due ${fmtDate(r.dueDate)}` : ""}</p>
      </div>
    ) },
    { key: "ref", header: "Order Ref", value: (r) => r.orderId ?? "Multiple", render: (r) => <span className="font-mono text-[11px] text-muted-foreground">{r.orderId ?? "Multiple"}</span> },
    { key: "total", header: "Total", headClassName: "text-right", className: "text-right", value: (r) => r.total, render: (r) => <Money value={r.total} /> },
    { key: "paid", header: "Paid", headClassName: "text-right", className: "text-right", value: (r) => r.paid, render: (r) => <Money value={r.paid} className="text-emerald-700" /> },
    { key: "due", header: "Balance Due", headClassName: "text-right", className: "text-right", value: (r) => r.due, render: (r) => <Money value={Math.max(0, r.due)} className={r.due > 0 ? "text-rose-600" : ""} /> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "act", header: "", render: (r) => (
      <Button variant="outline" size="sm" className="h-7" onClick={(e) => { e.stopPropagation(); setInvoice(r); }}>
        <FileText className="mr-1 h-3 w-3" /> View
      </Button>
    ) },
  ];

  const settlementRows = agencySettlements;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Billing & Payable"
        subtitle="Your agency ledger — collections, invoices from Apex and settlement with your parent"
        icon={<Wallet className="h-5 w-5" />}
        actions={<Button onClick={() => { setPayDone(false); setPayOpen(true); }}><HandCoins className="mr-1.5 h-4 w-4" /> Record Payment</Button>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Collections (Sep MTD)" value={inr(sepSettlement?.collected ?? 0, { compact: true })} icon={<PiggyBank className="h-4 w-4" />} sublabel="patient-side collections" />
        <StatCard label="Payable to Parent" value={inr(sepSettlement?.payable ?? 0, { compact: true })} accent="rose" icon={<HandCoins className="h-4 w-4" />} sublabel={`to ${PARENT_NAME}`} />
        <StatCard label="Margin (Sep MTD)" value={inr(sepSettlement?.margin ?? 0, { compact: true })} accent="emerald" icon={<BadgeCheck className="h-4 w-4" />} sublabel={`${sepSettlement?.marginPct ?? 0}% on Apex billing`} />
        <StatCard label="Invoices Balance Due" value={inr(dueTotal, { compact: true })} accent="amber" icon={<Wallet className="h-4 w-4" />} sublabel={`${agencyInvoices.length} invoices this month`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Invoices */}
        <Panel title="Invoices from Apex" description="Raised on your agency at SUB-001 cost rates" className="lg:col-span-2">
          <DataTable
            columns={invoiceColumns}
            rows={agencyInvoices}
            pageSize={6}
            searchOf={(r) => `${r.id} ${r.orderId ?? ""} ${r.status}`}
            searchPlaceholder="Search invoice / order…"
            onRowClick={(r) => setInvoice(r)}
          />
        </Panel>

        {/* Payable to parent */}
        <Panel title={`Payable to ${PARENT_NAME}`} description="Monthly settlement of Apex billing minus your collections">
          <ul className="space-y-3">
            {settlementRows.map((s) => (
              <li key={s.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-800">{s.period}</p>
                  <StatusPill status={s.status} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  <p>Billed: <span className="font-semibold text-slate-800">{inr(s.billed)}</span></p>
                  <p>Collected: <span className="font-semibold text-slate-800">{inr(s.collected)}</span></p>
                  <p>Margin: <span className="font-semibold text-emerald-700">{inr(s.margin)} ({s.marginPct}%)</span></p>
                  <p>Last payment: <span className="font-semibold text-slate-800">{fmtDate(s.lastPayment)}</span></p>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-dashed pt-2">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Net payable</span>
                  <Money value={s.payable} className={s.payable > 0 ? "text-base text-rose-600" : "text-base text-emerald-700"} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Rate card */}
      <Panel
        title="Your Rate Card — SUB-001"
        description="Contracted agency prices effective 01 Apr 2026 · your margin = patient list price − your rate"
      >
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-[11px] uppercase text-slate-500">
                <th className="px-4 py-2 font-semibold">Test</th>
                <th className="px-4 py-2 font-semibold">Code</th>
                <th className="px-4 py-2 text-right font-semibold">Your Cost</th>
                <th className="px-4 py-2 text-right font-semibold">Patient Pays (list)</th>
                <th className="px-4 py-2 text-right font-semibold">Your Margin</th>
              </tr>
            </thead>
            <tbody>
              {rateRules.map((r) => {
                const list = priceFor(r.testCode, "B2C");
                return (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="px-4 py-2">{r.testName}</td>
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{r.testCode}</td>
                    <td className="px-4 py-2 text-right tabular-nums font-medium text-amber-700">{inr(r.price)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{inr(list)}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-emerald-700">{inr(list - r.price)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          All {tests.length} tests are orderable; tests without a contracted SUB-001 rate bill at standard list price.
          {PARENT_NAME} B2B and central lab rates are not visible in your portal.
        </p>
      </Panel>

      <InvoiceDialog open={!!invoice} onOpenChange={(o) => !o && setInvoice(null)} data={invoice} />

      {/* Record payment dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Record Payment to {PARENT_NAME}</DialogTitle>
            <DialogDescription className="text-xs">Adjusted against settlement {sepSettlement?.id ?? "—"} ({sepSettlement?.period ?? "—"}).</DialogDescription>
          </DialogHeader>
          {payDone ? (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">Payment recorded</p>
                <p className="text-xs text-emerald-800">PMT-2026-0412 · ₹22,300 via NEFT. Settlement will show as Settled once Apex reconciles.</p>
              </div>
            </div>
          ) : (
            <>
              <FormGrid cols={2}>
                <Field label="Amount (₹)" required><Input type="number" defaultValue={22300} /></Field>
                <Field label="Payment Date" required><Input type="date" defaultValue="2026-09-29" /></Field>
                <Field label="Mode" required>
                  <Select defaultValue="NEFT">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEFT">NEFT / RTGS</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Reference / UTR No." required><Input defaultValue="UTIB N0092504123" /></Field>
                <Field label="Remarks" className="sm:col-span-2"><Input defaultValue="Full settlement of September payable" /></Field>
              </FormGrid>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
                <Button onClick={() => setPayDone(true)}><HandCoins className="mr-1.5 h-4 w-4" /> Record Payment</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

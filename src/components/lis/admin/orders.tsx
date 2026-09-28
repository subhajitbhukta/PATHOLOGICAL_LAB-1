"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLisNav } from "@/components/lis/nav";
import {
  orders, patientById, samplesForOrder, reportsForOrder, orderAgeSex, orderPatientName,
  INTERNAL_FLOW, workflowIndex,
} from "@/lib/lis/data";
import { fmtDateTime, inr } from "@/lib/lis/format";
import {
  ChannelPill, DataTable, KeyValue, Money, PageHeader, Panel, PrintButton, SampleLabelCard,
  StatusPill, Timeline, WorkflowChain, EmptyState,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { InvoiceDialog, ReportDialog, toReportView } from "@/components/lis/report-sheet";
import { ClipboardList, Eye, Plus, ReceiptText } from "lucide-react";
import type { InvoiceViewData, ReportViewData } from "@/components/lis/report-sheet";
import type { Order } from "@/lib/lis/types";

const CHANNELS = ["All", "B2C", "B2B", "SUB"];
const STATUSES = ["All", "Sample Collected", "In Transit", "Received at Lab", "Test in Progress", "Verification Pending", "Report Delivered", "Sample Rejected"];

export function AdminOrdersView() {
  const { go } = useLisNav();
  const [channel, setChannel] = React.useState("All");
  const [status, setStatus] = React.useState("All");
  const [selected, setSelected] = React.useState<Order | null>(null);
  const [invoice, setInvoice] = React.useState<InvoiceViewData | null>(null);
  const [report, setReport] = React.useState<ReportViewData | null>(null);

  const rows = orders.filter(
    (o) => (channel === "All" || o.channel === channel) && (status === "All" || o.status === status),
  );

  const columns: Column<Order>[] = [
    { key: "id", header: "Order ID", value: (r) => r.id, render: (r) => <span className="font-mono text-xs font-medium text-teal-800">{r.id}</span> },
    { key: "patient", header: "Patient", value: (r) => orderPatientName(r.id), render: (r) => (
      <div><p className="text-sm font-medium">{orderPatientName(r.id)}</p><p className="text-[11px] text-muted-foreground">{orderAgeSex(r.id)} · {patientById(r.patientId)?.mobile}</p></div>
    ) },
    { key: "ch", header: "Channel", value: (r) => r.channel, render: (r) => <ChannelPill channel={r.channel} /> },
    { key: "source", header: "Source", value: (r) => r.partnerName ?? "B2C", render: (r) => (
      <div className="text-xs"><p className="font-medium text-slate-700">{r.channel === "B2C" ? "B2C Direct" : r.subAgencyName ?? r.partnerName}</p>{r.subAgencyName ? <p className="text-muted-foreground">via {r.partnerName}</p> : null}</div>
    ) },
    { key: "tests", header: "Tests", value: (r) => r.items.length, render: (r) => <span className="text-xs">{r.items.map((i) => i.code).join(", ")}</span> },
    { key: "net", header: "Amount", headClassName: "text-right", className: "text-right", value: (r) => r.net, render: (r) => <Money value={r.net} /> },
    { key: "pay", header: "Payment", value: (r) => r.payStatus, render: (r) => <div className="space-y-1"><StatusPill status={r.payStatus} /><p className="text-[10px] text-muted-foreground">{r.paymentMode}</p></div> },
    { key: "status", header: "Workflow Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "created", header: "Booked", value: (r) => r.createdAt, render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDateTime(r.createdAt)}</span> },
    { key: "act", header: "", render: (r) => (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelected(r); }}><Eye className="h-3.5 w-3.5" /></Button>
    ) },
  ];

  const openInvoice = (o: Order) => {
    setInvoice({
      id: `INV-2026-${o.id.slice(-5)}`, date: o.createdAt.slice(0, 10), scope: o.channel === "B2C" ? "Patient" : o.channel === "B2B" ? "B2B" : "Sub-Agency",
      billTo: orderPatientName(o.id), billToSub: o.partnerName ? `Parent: ${o.partnerName}` : undefined,
      gstin: o.channel === "B2C" ? "—" : "27AAACA1234B1Z2",
      lines: o.items.map((i) => ({ description: i.name, hsn: "999311", qty: i.qty, rate: i.rate })),
      subtotal: o.gross, discount: o.discount, taxable: o.gross - o.discount, cgst: Math.round(o.gst / 2), sgst: Math.round(o.gst / 2),
      total: o.net, paid: o.payStatus === "Paid" ? o.net : o.payStatus === "Partial" ? Math.round(o.net / 2) : 0,
      due: o.payStatus === "Paid" ? 0 : o.payStatus === "Partial" ? o.net - Math.round(o.net / 2) : o.net,
      mode: o.paymentMode, status: o.payStatus, orderId: o.id,
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bookings & Orders"
        subtitle="Every referral order — B2C, B2B and sub-agency — with full traceability"
        icon={<ClipboardList className="h-5 w-5" />}
        actions={<Button onClick={() => go("admin/order-new")}><Plus className="mr-1.5 h-4 w-4" /> Central Patient Entry</Button>}
      />

      <Panel>
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={10}
          searchOf={(r) => `${r.id} ${orderPatientName(r.id)} ${r.partnerName ?? ""} ${r.subAgencyName ?? ""} ${r.items.map((i) => i.code).join(" ")}`}
          searchPlaceholder="Search order / patient / test…"
          onRowClick={(r) => setSelected(r)}
          filters={
            <>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                <SelectContent>{CHANNELS.map((c) => <SelectItem key={c} value={c}>{c === "All" ? "All channels" : c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 w-52"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s === "All" ? "All statuses" : s}</SelectItem>)}</SelectContent>
              </Select>
            </>
          }
        />
      </Panel>

      {/* Order detail sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-2xl">
          {selected ? (
            <>
              <SheetHeader className="border-b px-5 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle className="font-mono text-sm">{selected.id}</SheetTitle>
                    <p className="text-xs text-muted-foreground">{orderPatientName(selected.id)} · {orderAgeSex(selected.id)} · {fmtDateTime(selected.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => openInvoice(selected)}><ReceiptText className="mr-1 h-3.5 w-3.5" /> Invoice</Button>
                    <PrintButton label="Print" />
                  </div>
                </div>
              </SheetHeader>
              <div className="space-y-5 p-5">
                <WorkflowChain flow={INTERNAL_FLOW} current={workflowIndex(selected.status)} />

                <KeyValue
                  cols={3}
                  items={[
                    { label: "Channel", value: <ChannelPill channel={selected.channel} /> },
                    { label: "Source", value: selected.channel === "B2C" ? "B2C Direct" : selected.subAgencyName ?? selected.partnerName ?? "—" },
                    { label: "Home Collection", value: selected.homeCollection ? "Yes" : "Walk-in" },
                    { label: "Referring Doctor", value: selected.referrerDoctor ?? "—" },
                    { label: "TAT Due", value: selected.tatDue },
                    { label: "Payment", value: `${selected.paymentMode} · ` },
                  ]}
                />

                <Panel title="Tests Ordered" contentClassName="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50 text-left text-[11px] uppercase text-slate-500">
                        <th className="px-4 py-2 font-semibold">Code</th>
                        <th className="px-4 py-2 font-semibold">Investigation</th>
                        <th className="px-4 py-2 font-semibold">Type</th>
                        <th className="px-4 py-2 text-right font-semibold">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.items.map((it) => (
                        <tr key={it.code} className="border-b border-slate-100">
                          <td className="px-4 py-2 font-mono text-xs">{it.code}</td>
                          <td className="px-4 py-2">{it.name}</td>
                          <td className="px-4 py-2"><Badge variant="outline" className="text-[10px]">{it.type}</Badge></td>
                          <td className="px-4 py-2 text-right tabular-nums">{inr(it.rate)}</td>
                        </tr>
                      ))}
                      <tr className="text-xs">
                        <td colSpan={3} className="px-4 py-1.5 text-right text-muted-foreground">Gross</td>
                        <td className="px-4 py-1.5 text-right tabular-nums">{inr(selected.gross)}</td>
                      </tr>
                      <tr className="text-xs">
                        <td colSpan={3} className="px-4 py-1.5 text-right text-muted-foreground">Discount ({selected.discountPct}%)</td>
                        <td className="px-4 py-1.5 text-right tabular-nums text-rose-600">− {inr(selected.discount)}</td>
                      </tr>
                      <tr className="text-xs">
                        <td colSpan={3} className="px-4 py-1.5 text-right text-muted-foreground">GST @ {selected.gstPct}%</td>
                        <td className="px-4 py-1.5 text-right tabular-nums">{inr(selected.gst)}</td>
                      </tr>
                      <tr className="border-t border-slate-200 text-sm font-bold">
                        <td colSpan={3} className="px-4 py-2 text-right">Net Payable</td>
                        <td className="px-4 py-2 text-right tabular-nums">{inr(selected.net)}</td>
                      </tr>
                    </tbody>
                  </table>
                </Panel>

                <Panel title="Samples & Barcodes">
                  {samplesForOrder(selected.id).length === 0 ? (
                    <EmptyState title="No samples generated yet" hint="Samples appear here once phlebotomy is marked done." />
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {samplesForOrder(selected.id).map((s) => (
                        <SampleLabelCard
                          key={s.id} sampleId={s.id} patientName={s.patientName}
                          ageSex={orderAgeSex(selected.id)} type={s.type} container={s.container}
                          tests={s.tests.join(", ")} collectedAt={fmtDateTime(s.collectedAt)} source={s.source}
                        />
                      ))}
                    </div>
                  )}
                </Panel>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Panel title="Sample Tracking">
                    <Timeline
                      items={INTERNAL_FLOW.slice(0, workflowIndex(selected.status) + 1).map((st, i) => ({
                        label: st,
                        time: i === 0 ? fmtDateTime(selected.createdAt) : i === 1 ? fmtDateTime(selected.collectedAt ?? selected.createdAt) : "Updated",
                      }))}
                    />
                  </Panel>
                  <Panel title="Linked Reports">
                    {reportsForOrder(selected.id).length === 0 ? (
                      <EmptyState title="Reports not generated yet" hint="Reports appear after pathologist approval." />
                    ) : (
                      <ul className="space-y-2">
                        {reportsForOrder(selected.id).map((r) => (
                          <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg border p-2.5">
                            <div className="min-w-0 text-xs">
                              <p className="font-mono font-medium">{r.id}</p>
                              <p className="truncate text-muted-foreground">{r.tests.join(", ")} · {r.pathologist}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <StatusPill status={r.status} />
                              <Button
                                variant="outline" size="sm" className="h-7"
                                onClick={() => setReport(toReportView(r, orderPatientName(selected.id), orderAgeSex(selected.id)))}
                              >
                                <Eye className="mr-1 h-3 w-3" /> View
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Panel>
                </div>

                {selected.remarks ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    <span className="font-semibold">Remarks: </span>{selected.remarks}
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <ReportDialog open={!!report} onOpenChange={(o) => !o && setReport(null)} data={report} />
      <InvoiceDialog open={!!invoice} onOpenChange={(o) => !o && setInvoice(null)} data={invoice} />
    </div>
  );
}

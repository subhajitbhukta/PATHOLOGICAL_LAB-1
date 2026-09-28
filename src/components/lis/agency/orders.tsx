"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLisNav } from "@/components/lis/nav";
import {
  ordersForSubAgency, orderPatientName, orderAgeSex, samplesForOrder, invoices,
  verificationTasks, INTERNAL_FLOW, workflowIndex,
} from "@/lib/lis/data";
import { fmtDateTime, inr } from "@/lib/lis/format";
import {
  ChannelPill, DataTable, EmptyState, KeyValue, Money, PageHeader, Panel, PrintButton,
  SampleLabelCard, StatusPill, WorkflowChain,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { InvoiceDialog, ReportDialog, toReportView } from "@/components/lis/report-sheet";
import type { InvoiceViewData, ReportViewData } from "@/components/lis/report-sheet";
import { ClipboardList, Eye, Plus, ReceiptText } from "lucide-react";
import type { Order } from "@/lib/lis/types";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const AGENCY_ID = "SUB-001";
const AGENCY_NAME = "XYZ Collection Centre";

const STATUSES = ["All", "In Transit", "Test in Progress", "Result Entered", "Report Delivered"];

export function AgencyOrdersView() {
  const { go } = useLisNav();
  const [status, setStatus] = React.useState("All");
  const [selected, setSelected] = React.useState<Order | null>(null);
  const [report, setReport] = React.useState<ReportViewData | null>(null);
  const [invoice, setInvoice] = React.useState<InvoiceViewData | null>(null);

  const rows = ordersForSubAgency(AGENCY_ID).filter((o) => status === "All" || o.status === status);

  const columns: Column<Order>[] = [
    { key: "id", header: "Order ID", value: (r) => r.id, render: (r) => <span className="font-mono text-xs font-medium text-amber-800">{r.id}</span> },
    { key: "patient", header: "Patient", value: (r) => orderPatientName(r.id), render: (r) => (
      <div>
        <p className="text-sm font-medium">{orderPatientName(r.id)}</p>
        <p className="text-[11px] text-muted-foreground">{orderAgeSex(r.id)}</p>
      </div>
    ) },
    { key: "tests", header: "Tests", value: (r) => r.items.map((i) => i.code).join(", "), render: (r) => <span className="text-xs">{r.items.map((i) => i.code).join(", ")}</span> },
    { key: "amt", header: "Bill Amount", headClassName: "text-right", className: "text-right", value: (r) => r.net, render: (r) => (
      <div><Money value={r.net} /><p className="text-[10px] text-muted-foreground">incl. GST</p></div>
    ) },
    { key: "pay", header: "Payment", value: (r) => r.payStatus, render: (r) => (
      <div className="space-y-1"><StatusPill status={r.payStatus} /><p className="text-[10px] text-muted-foreground">{r.paymentMode}</p></div>
    ) },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "at", header: "Booked At", value: (r) => r.createdAt, render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDateTime(r.createdAt)}</span> },
    { key: "act", header: "", render: (r) => (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelected(r); }}><Eye className="h-3.5 w-3.5" /></Button>
    ) },
  ];

  const selInvoices = selected ? invoices.filter((i) => i.orderId === selected.id && i.billToId === AGENCY_ID) : [];
  const selSamples = selected ? samplesForOrder(selected.id) : [];
  const selVt = selected ? verificationTasks.find((v) => v.orderId === selected.id) : undefined;
  const draftReport: ReportViewData | null = (() => {
    if (!selected || !selVt) return null;
    const s = selSamples[0];
    if (!s) return null;
    return toReportView(
      {
        id: selVt.reportId, orderId: selected.id, sampleId: s.id, patientId: selected.patientId,
        status: "Draft", pathologist: "Dr. Vikram Rao", pathologistQual: "MD (Biochemistry), DNB",
        collectedAt: s.collectedAt, receivedAt: s.receivedAt ?? s.collectedAt, reportedAt: selected.tatDue,
        releasedAt: selected.tatDue, comments: "Draft preview — pending pathologist approval at Apex central lab.",
        qrToken: `APX-VER-${selected.id.slice(-8)}`, source: `${AGENCY_NAME} (via ABC Diagnostics)`,
      },
      orderPatientName(selected.id),
      orderAgeSex(selected.id),
    );
  })();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Orders"
        subtitle={`All test orders booked under ${AGENCY_NAME}`}
        icon={<ClipboardList className="h-5 w-5" />}
        actions={<Button variant="outline" onClick={() => go("agency/order-new")}><Plus className="mr-1.5 h-4 w-4" /> New Test Order</Button>}
      />

      <Panel>
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={10}
          searchOf={(r) => `${r.id} ${orderPatientName(r.id)} ${r.items.map((i) => i.code).join(" ")}`}
          searchPlaceholder="Search order / patient / test…"
          onRowClick={(r) => setSelected(r)}
          filters={
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s === "All" ? "All statuses" : s}</SelectItem>)}</SelectContent>
            </Select>
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
                    {selInvoices[0] ? (
                      <Button variant="outline" size="sm" onClick={() => setInvoice(selInvoices[0])}><ReceiptText className="mr-1 h-3.5 w-3.5" /> Invoice</Button>
                    ) : null}
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
                    { label: "Routed Via", value: `${AGENCY_NAME} (SUB-001)` },
                    { label: "Home Collection", value: selected.homeCollection ? "Yes" : "Walk-in" },
                    { label: "Referring Doctor", value: selected.referrerDoctor ?? "—" },
                    { label: "TAT Due", value: selected.tatDue },
                    { label: "Payment", value: `${selected.paymentMode} · ${selected.payStatus}` },
                  ]}
                />

                <Panel title="Tests & Billing" contentClassName="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50 text-left text-[11px] uppercase text-slate-500">
                        <th className="px-4 py-2 font-semibold">Code</th>
                        <th className="px-4 py-2 font-semibold">Investigation</th>
                        <th className="px-4 py-2 text-right font-semibold">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.items.map((it) => (
                        <tr key={it.code} className="border-b border-slate-100">
                          <td className="px-4 py-2 font-mono text-xs">{it.code}</td>
                          <td className="px-4 py-2">{it.name}</td>
                          <td className="px-4 py-2 text-right tabular-nums">{inr(it.rate)}</td>
                        </tr>
                      ))}
                      <tr className="text-xs">
                        <td colSpan={2} className="px-4 py-1.5 text-right text-muted-foreground">GST @ {selected.gstPct}%</td>
                        <td className="px-4 py-1.5 text-right tabular-nums">{inr(selected.gst)}</td>
                      </tr>
                      <tr className="border-t border-slate-200 text-sm font-bold">
                        <td colSpan={2} className="px-4 py-2 text-right">Net Payable</td>
                        <td className="px-4 py-2 text-right tabular-nums">{inr(selected.net)}</td>
                      </tr>
                    </tbody>
                  </table>
                </Panel>

                <Panel title="Samples & Barcodes">
                  {selSamples.length === 0 ? (
                    <EmptyState title="No samples generated yet" hint="Samples appear once phlebotomy is marked done at your centre." />
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selSamples.map((s) => (
                        <SampleLabelCard
                          key={s.id} sampleId={s.id} barcode={s.barcode} patientName={s.patientName}
                          ageSex={orderAgeSex(selected.id)} type={s.type} container={s.container}
                          tests={s.tests.join(", ")} collectedAt={fmtDateTime(s.collectedAt)} source={s.source}
                        />
                      ))}
                    </div>
                  )}
                </Panel>

                <Panel title="Reports" description="Released automatically after pathologist approval at Apex central lab">
                  {selected.status === "Report Delivered" || selected.status === "Report Generated" || selected.status === "Pathologist Approved" ? (
                    <p className="text-xs text-muted-foreground">Report released — see the Reports page.</p>
                  ) : draftReport ? (
                    <div className="flex items-center justify-between gap-2 rounded-lg border p-2.5 text-xs">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">{draftReport.reportId} · draft preview</p>
                        <p className="text-muted-foreground">Results entered — awaiting pathologist approval</p>
                      </div>
                      <Button variant="outline" size="sm" className="h-7" onClick={() => setReport(draftReport)}>
                        <Eye className="mr-1 h-3 w-3" /> Preview
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 rounded-lg border p-2.5 text-xs">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">{selected.items.map((i) => i.code).join(", ")}</p>
                        <p className="text-muted-foreground">Testing under way at Apex central lab</p>
                      </div>
                      <StatusPill status={selected.status} />
                    </div>
                  )}
                </Panel>

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

"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { patientById, priceFor, resultLines, systemConfig as cfg } from "@/lib/lis/data";
import { fmtDate, fmtDateTime, inr } from "@/lib/lis/format";
import { Barcode, FlagPill, Money, PrintButton, QR, StatusPill } from "@/components/lis/widgets";
import { FileDown, Mail, MessageSquare, Printer, ShieldCheck, X } from "lucide-react";

// ============================================================
// Full lab report — printable, template-based, with QR verify
// ============================================================
export interface ReportViewData {
  reportId: string;
  orderId: string;
  sampleId: string;
  patientId?: string;
  patientName: string;
  ageSex: string;
  referredBy?: string;
  source?: string;
  collectedAt: string;
  receivedAt: string;
  reportedAt: string;
  pathologist: string;
  pathologistQual: string;
  interpretation?: string;
  comments?: string;
  qrToken: string;
  status: string;
  department?: string;
  kind?: string;
}

export function LabReportDocument({ data }: { data: ReportViewData }) {
  const p = patientById(data.patientId ?? "");
  const lines = resultLines.filter((l) => l.sampleId === data.sampleId);
  const deptLines = lines.length > 0
    ? lines
    : // fallback: show representative lines for delivered reports
      resultLines.filter((l) => l.state === "Approved").slice(0, 5);

  const grouped = deptLines.reduce<Record<string, typeof deptLines>>((acc, l) => {
    (acc[l.department] ??= []).push(l);
    return acc;
  }, {});

  return (
    <div className="print-area bg-white text-slate-900" id="lab-report">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b-2 border-teal-700 pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-700 font-bold text-white">A</div>
          <div>
            <p className="text-lg font-bold tracking-tight">{cfg.labName}</p>
            <p className="text-xs text-slate-600">{cfg.address}, {cfg.city}</p>
            <p className="text-xs text-slate-600">Phone: {cfg.phone} · {cfg.email} · GSTIN: {cfg.gstin}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-700">{cfg.nablCert}</p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-700">
          <p className="font-semibold">Report No: {data.reportId}</p>
          <p>Collected: {fmtDateTime(data.collectedAt)}</p>
          <p>Received: {fmtDateTime(data.receivedAt)}</p>
          <p>Reported: {fmtDateTime(data.reportedAt)}</p>
        </div>
      </div>

      {/* Patient block */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 border-b border-slate-200 py-3 text-xs sm:grid-cols-4">
        <p><span className="text-slate-500">Patient Name:</span> <span className="font-semibold">{data.patientName}</span></p>
        <p><span className="text-slate-500">Age / Sex:</span> <span className="font-semibold">{data.ageSex}</span></p>
        <p><span className="text-slate-500">Patient ID:</span> <span className="font-semibold">{data.patientId}</span></p>
        <p><span className="text-slate-500">Referring:</span> <span className="font-semibold">{data.referredBy ?? "—"}</span></p>
        <p><span className="text-slate-500">Sample ID:</span> <span className="font-semibold">{data.sampleId}</span></p>
        <p><span className="text-slate-500">Order ID:</span> <span className="font-semibold">{data.orderId}</span></p>
        <p className="col-span-2"><span className="text-slate-500">Source:</span> <span className="font-semibold">{data.source ?? "B2C Direct"}</span>{p ? <span className="text-slate-400"> · {p.mobile}</span> : null}</p>
      </div>

      {/* Results */}
      {Object.entries(grouped).map(([dept, lines]) => (
        <div key={dept} className="mt-4">
          <p className="mb-1 bg-teal-50 px-2 py-1 text-xs font-bold uppercase tracking-wide text-teal-800">{dept}</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-300 text-left text-[11px] uppercase text-slate-500">
                <th className="py-1.5 font-semibold">Investigation</th>
                <th className="py-1.5 text-right font-semibold">Result</th>
                <th className="py-1.5 text-center font-semibold">Flag</th>
                <th className="py-1.5 pl-4 font-semibold">Unit</th>
                <th className="py-1.5 text-right font-semibold">Reference Range</th>
                <th className="hidden py-1.5 pl-4 font-semibold sm:table-cell">Method</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-1.5 font-medium">{l.parameter}</td>
                  <td className={`py-1.5 text-right font-bold ${l.flag === "H" || l.flag === "A" ? "text-rose-600" : l.flag === "L" ? "text-amber-600" : ""}`}>{l.value || "—"}</td>
                  <td className="py-1.5 text-center"><FlagPill flag={l.flag} /></td>
                  <td className="py-1.5 pl-4 text-slate-600">{l.unit}</td>
                  <td className="py-1.5 text-right text-slate-600">{l.refRange}</td>
                  <td className="hidden py-1.5 pl-4 text-slate-500 sm:table-cell">{l.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Interpretation */}
      {(data.interpretation || data.comments) && (
        <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
          {data.interpretation ? (
            <p><span className="font-bold uppercase text-teal-700">Interpretation: </span>{data.interpretation}</p>
          ) : null}
          {data.comments ? (
            <p><span className="font-bold uppercase text-teal-700">Comments: </span>{data.comments}</p>
          ) : null}
        </div>
      )}

      {/* Footer — signature + QR */}
      <div className="mt-6 flex items-end justify-between gap-4 border-t border-slate-200 pt-4">
        <div className="text-xs">
          <p className="font-semibold text-slate-900">{data.pathologist}</p>
          <p className="text-slate-600">{data.pathologistQual}</p>
          <p className="text-slate-600">Consultant Pathologist</p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Digitally signed & verified electronically
          </div>
          <p className="mt-2 max-w-md text-[9px] leading-relaxed text-slate-400">{cfg.reportFooter}</p>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <QR value={`https://verify.apexlabs.in/r/${data.qrToken}`} size={84} />
          <p className="font-mono text-[9px] text-slate-500">{data.qrToken}</p>
          <p className="text-[9px] font-medium text-slate-600">Scan to verify report authenticity</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Tax invoice document
// ============================================================
export interface InvoiceViewData {
  id: string; date: string; dueDate?: string;
  scope: string; billTo: string; billToSub?: string; gstin: string;
  lines: { description: string; hsn: string; qty: number; rate: number }[];
  subtotal: number; discount: number; taxable: number; cgst: number; sgst: number;
  total: number; paid: number; due: number; mode: string; status: string; orderId?: string;
}

export function InvoiceDocument({ data }: { data: InvoiceViewData }) {
  return (
    <div className="print-area bg-white text-slate-900" id="tax-invoice">
      <div className="flex items-start justify-between gap-4 border-b-2 border-teal-700 pb-3">
        <div>
          <p className="text-lg font-bold tracking-tight">{cfg.labName}</p>
          <p className="text-xs text-slate-600">{cfg.address}, {cfg.city}</p>
          <p className="text-xs text-slate-600">GSTIN: {cfg.gstin} · CIN: {cfg.cin}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Tax Invoice</p>
          <p className="text-xs font-semibold">No: {data.id}</p>
          <p className="text-xs">Date: {fmtDate(data.date)}</p>
          {data.dueDate ? <p className="text-xs">Due: {fmtDate(data.dueDate)}</p> : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 border-b border-slate-200 py-3 text-xs">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">Billed To ({data.scope})</p>
          <p className="font-semibold">{data.billTo}</p>
          {data.billToSub ? <p className="text-slate-600">{data.billToSub}</p> : null}
          <p className="text-slate-600">GSTIN: {data.gstin}</p>
        </div>
        <div className="text-right">
          <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">Details</p>
          <p>Order Ref: {data.orderId ?? "Multiple"}</p>
          <p>Payment: {data.mode}</p>
          <p className="mt-1"><StatusPill status={data.status} /></p>
        </div>
      </div>

      <table className="mt-3 w-full text-xs">
        <thead>
          <tr className="border-b border-slate-300 text-left text-[11px] uppercase text-slate-500">
            <th className="py-1.5">#</th>
            <th className="py-1.5 font-semibold">Description</th>
            <th className="py-1.5 font-semibold">HSN</th>
            <th className="py-1.5 text-right font-semibold">Qty</th>
            <th className="py-1.5 text-right font-semibold">Rate</th>
            <th className="py-1.5 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.lines.map((l, i) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="py-1.5">{i + 1}</td>
              <td className="py-1.5 font-medium">{l.description}</td>
              <td className="py-1.5 text-slate-500">{l.hsn}</td>
              <td className="py-1.5 text-right">{l.qty}</td>
              <td className="py-1.5 text-right tabular-nums">{inr(l.rate)}</td>
              <td className="py-1.5 text-right font-semibold tabular-nums">{inr(l.qty * l.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex justify-end">
        <div className="w-full max-w-xs space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="tabular-nums">{inr(data.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-slate-600">Discount</span><span className="tabular-nums">− {inr(data.discount)}</span></div>
          <div className="flex justify-between"><span className="text-slate-600">Taxable Value</span><span className="tabular-nums">{inr(data.taxable)}</span></div>
          <div className="flex justify-between"><span className="text-slate-600">CGST @ 9%</span><span className="tabular-nums">{inr(data.cgst)}</span></div>
          <div className="flex justify-between"><span className="text-slate-600">SGST @ 9%</span><span className="tabular-nums">{inr(data.sgst)}</span></div>
          <div className="flex justify-between border-t border-slate-300 pt-1 text-sm font-bold"><span>Total</span><span className="tabular-nums">{inr(data.total)}</span></div>
          <div className="flex justify-between text-emerald-700"><span>Paid</span><span className="tabular-nums">{inr(data.paid)}</span></div>
          <div className="flex justify-between font-bold text-rose-600"><span>Balance Due</span><span className="tabular-nums">{inr(data.due)}</span></div>
        </div>
      </div>

      <p className="mt-4 border-t border-slate-200 pt-2 text-[9px] text-slate-400">
        All disputes subject to Mumbai jurisdiction. Interest @18% p.a. on delayed B2B payments. This is a computer generated invoice.
      </p>
    </div>
  );
}

// ============================================================
// Dialog / Sheet wrappers used by all portals
// ============================================================
export function ReportDialog({
  open, onOpenChange, data,
}: { open: boolean; onOpenChange: (o: boolean) => void; data: ReportViewData | null }) {
  if (!data) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto p-0">
        <DialogHeader className="no-print sticky top-0 z-10 flex-row items-center justify-between space-y-0 border-b bg-white/95 px-4 py-3 backdrop-blur">
          <div>
            <DialogTitle className="text-sm">Lab Report Preview — {data.reportId}</DialogTitle>
            <DialogDescription className="text-xs">Template-based PDF preview · QR verified · print ready</DialogDescription>
          </div>
          <div className="flex items-center gap-1.5">
            <PrintButton />
            <Button variant="outline" size="sm"><FileDown className="mr-1 h-4 w-4" /> PDF</Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}><X className="h-4 w-4" /></Button>
          </div>
        </DialogHeader>
        <div className="p-4">
          <LabReportDocument data={data} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function InvoiceDialog({
  open, onOpenChange, data,
}: { open: boolean; onOpenChange: (o: boolean) => void; data: InvoiceViewData | null }) {
  if (!data) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto p-0">
        <DialogHeader className="no-print sticky top-0 z-10 flex-row items-center justify-between space-y-0 border-b bg-white/95 px-4 py-3 backdrop-blur">
          <div>
            <DialogTitle className="text-sm">Tax Invoice — {data.id}</DialogTitle>
            <DialogDescription className="text-xs">GST compliant invoice preview</DialogDescription>
          </div>
          <div className="flex items-center gap-1.5">
            <PrintButton />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}><X className="h-4 w-4" /></Button>
          </div>
        </DialogHeader>
        <div className="p-4">
          <InvoiceDocument data={data} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Manifest (pickup) document used in logistics / B2B pickups
export function ManifestDocument({
  manifestNo, pickupId, requestedBy, courier, rider, count, samples,
}: {
  manifestNo: string; pickupId: string; requestedBy: string; courier: string;
  rider: string; count: number; samples: string[];
}) {
  return (
    <div className="print-area bg-white text-slate-900" id="manifest">
      <div className="flex items-start justify-between border-b-2 border-teal-700 pb-3">
        <div>
          <p className="text-base font-bold">{cfg.labName} — Pickup Manifest</p>
          <p className="text-xs text-slate-600">Manifest: {manifestNo} · Pickup: {pickupId}</p>
        </div>
        <div className="text-right text-xs">
          <p className="font-semibold">{requestedBy}</p>
          <p>Courier: {courier}</p>
          <p>Rider: {rider}</p>
        </div>
      </div>
      <p className="mt-3 text-xs font-semibold">Samples in this manifest ({count}):</p>
      <ol className="mt-1 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
        {samples.map((s, i) => (
          <li key={i} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1">
            <span className="font-mono">{s}</span>
            <span className="text-[10px] text-slate-400">☐ verified</span>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex justify-between text-[10px] text-slate-500">
        <div>
          <p className="mb-6 font-semibold">Picked up by (signature):</p>
          <p className="border-t border-slate-300 pt-1">{rider} · {courier}</p>
        </div>
        <div className="text-right">
          <p className="mb-6 font-semibold">Handed over by (signature):</p>
          <p className="border-t border-slate-300 pt-1">{requestedBy}</p>
        </div>
      </div>
    </div>
  );
}

export function ManifestSheet({
  open, onOpenChange, data,
}: {
  open: boolean; onOpenChange: (o: boolean) => void;
  data: { manifestNo: string; pickupId: string; requestedBy: string; courier: string; rider: string; count: number; samples: string[] } | null;
}) {
  if (!data) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="px-0">
          <SheetTitle className="text-sm">Pickup Manifest — {data.manifestNo}</SheetTitle>
        </SheetHeader>
        <div className="px-0 pb-6">
          <ManifestDocument {...data} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Small helper: delivered report actions (used in several lists)
export function ReportShareActions({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-7 w-7" title="Email"><Mail className="h-3.5 w-3.5" /></Button>
      {!compact ? (
        <Button variant="ghost" size="icon" className="h-7 w-7" title="WhatsApp"><MessageSquare className="h-3.5 w-3.5" /></Button>
      ) : null}
      <Button variant="ghost" size="icon" className="h-7 w-7" title="Download PDF"><FileDown className="h-3.5 w-3.5" /></Button>
    </div>
  );
}

// Build ReportViewData from a LabReport record
export function toReportView(r: {
  id: string; orderId: string; sampleId: string; patientId: string; status: string;
  pathologist: string; pathologistQual: string; collectedAt: string; receivedAt: string;
  reportedAt: string; releasedAt: string; interpretation?: string; comments?: string;
  qrToken: string; source: string;
}, patientName: string, ageSex: string): ReportViewData {
  return {
    reportId: r.id, orderId: r.orderId, sampleId: r.sampleId, patientId: r.patientId,
    patientName, ageSex, referredBy: undefined, source: r.source,
    collectedAt: r.collectedAt, receivedAt: r.receivedAt, reportedAt: r.reportedAt,
    pathologist: r.pathologist, pathologistQual: r.pathologistQual,
    interpretation: r.interpretation, comments: r.comments, qrToken: r.qrToken, status: r.status,
  };
}

export { Money, Badge };

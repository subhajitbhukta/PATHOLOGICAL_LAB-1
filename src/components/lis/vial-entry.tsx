"use client";

// ============================================================
// Shared "Sample Tubes & Vial Barcode" building blocks.
//
// BARCODE POLICY: the LIS never generates barcodes. Vials carry
// PRE-PRINTED barcode labels (rolls issued to centres/phlebotomists).
// During entry the operator scans or types the number off the vial;
// the system records it against the order and guides the operator
// with the sample type / vial / volume defined in the test master.
// ============================================================

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { requiredVials, nextPreprintedLabel } from "@/lib/lis/data";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, FlaskConical, Info, ScanLine, TestTubes } from "lucide-react";
// ---------- Vial colour strip helper ----------
const VIAL_COLOR: Record<string, string> = {
  Lavender: "bg-purple-300", Grey: "bg-slate-400", Red: "bg-rose-400",
  Blue: "bg-sky-300", Green: "bg-emerald-400", Yellow: "bg-amber-300",
  White: "bg-slate-100 border border-slate-300",
};

function VialDot({ container }: { container: string }) {
  const key = Object.keys(VIAL_COLOR).find((k) => container.toLowerCase().includes(k.toLowerCase()));
  return <span className={cn("inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-slate-300", key ? VIAL_COLOR[key] : "bg-slate-200")} />;
}

// ---------- Read-only guidance list (masters preview, hints) ----------
export function VialGuidanceList({ codes, dense }: { codes: string[]; dense?: boolean }) {
  const vials = requiredVials(codes);
  if (vials.length === 0) return null;
  return (
    <ul className="space-y-1.5">
      {vials.map((v) => (
        <li key={v.key} className={cn("flex items-start gap-2 rounded-md border border-slate-200 bg-white px-2.5", dense ? "py-1.5" : "py-2")}>
          <VialDot container={v.container} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-800">
              {v.sampleType} in {v.container} · {v.volume}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">For: {v.tests.join(", ")}</p>
          </div>
          <TestTubes className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
        </li>
      ))}
    </ul>
  );
}

// ---------- Interactive barcode entry step (order flows) ----------
export interface VialBarcodeEntry {
  container: string;
  barcode: string;
}

export function VialBarcodeStep({
  codes, entries, onEntriesChange,
}: {
  codes: string[];
  entries: VialBarcodeEntry[];
  onEntriesChange: (next: VialBarcodeEntry[]) => void;
}) {
  const vials = React.useMemo(() => requiredVials(codes), [codes]);
  const [scanError, setScanError] = React.useState<string | null>(null);

  const setBarcode = (container: string, barcode: string) => {
    setScanError(null);
    const next = vials.map((v) => {
      const cur = entries.find((e) => e.container === v.container) ?? { container: v.container, barcode: "" };
      return v.container === container ? { ...cur, barcode } : cur;
    });
    onEntriesChange(next);
  };

  const simulateScan = (container: string) => {
    const used = entries.map((e) => e.barcode).filter(Boolean);
    setBarcode(container, nextPreprintedLabel(used));
  };

  const duplicate = entries.some((e, i) => e.barcode && entries.findIndex((o) => o.barcode === e.barcode) !== i);
  const filled = vials.filter((v) => (entries.find((e) => e.container === v.container)?.barcode ?? "").trim().length > 0).length;
  const complete = vials.length > 0 && filled === vials.length && !duplicate;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
        <span className="flex items-center gap-1.5 font-semibold"><ScanLine className="h-3.5 w-3.5" /> Barcode policy — the system does NOT generate barcodes.</span>
        Every tube carries a pre-printed barcode label. Scan it with a scanner or type the number —
        the LIS records it against this order and tracks the tube by it through logistics, receiving and testing.
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">Tubes required for the selected tests</span>
        <Badge variant="outline" className={complete ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-amber-300 bg-amber-50 text-amber-700"}>
          {filled} / {vials.length} barcodes recorded
        </Badge>
      </div>

      {vials.map((v) => {
        const entry = entries.find((e) => e.container === v.container) ?? { container: v.container, barcode: "" };
        const dupe = entry.barcode && entries.filter((e) => e.barcode === entry.barcode).length > 1;
        const ok = entry.barcode.trim().length > 0 && !dupe;
        return (
          <div key={v.key} className={cn("rounded-lg border p-3", ok ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-white")}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <VialDot container={v.container} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {v.sampleType} · {v.container}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Required volume <span className="font-semibold text-slate-700">{v.volume}</span> · For {v.tests.join(", ")}
                    {v.packageCodes?.length ? ` · via ${v.packageCodes.join(", ")}` : ""}
                  </p>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => simulateScan(v.container)}>
                <ScanLine className="mr-1 h-3 w-3" /> Simulate scanner
              </Button>
            </div>
            <div className="mt-2.5 space-y-1">
              <Label className="text-[11px] text-slate-600">Vial barcode — scan or enter the pre-printed number</Label>
              <div className="relative">
                <ScanLine className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={entry.barcode}
                  onChange={(e) => setBarcode(v.container, e.target.value)}
                  placeholder="e.g. 8210034601"
                  className="h-10 pl-8 font-mono text-sm"
                />
              </div>
              {dupe ? (
                <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600">
                  <AlertTriangle className="h-3 w-3" /> This barcode is already recorded on another tube in this order.
                </p>
              ) : ok ? (
                <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> Barcode recorded — tube will be tracked by this number.
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Report format selector (With / Without background) ----------
export function ReportFormatField({
  channel, value, onChange,
}: {
  channel: "B2C" | "B2B" | "SUB";
  value: "With Background" | "Without Background";
  onChange: (v: "With Background" | "Without Background") => void;
}) {
  const locked = channel === "B2C";
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-slate-700">
        Report format <span className="text-rose-500">*</span>
      </Label>
      <RadioGroup value={value} onValueChange={(v) => !locked && onChange(v as typeof value)} className="flex flex-col gap-2 sm:flex-row">
        <label className={cn(
          "flex flex-1 cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm",
          value === "With Background" ? "border-teal-400 bg-teal-50/50" : "border-slate-200",
          locked && "cursor-default opacity-90",
        )}>
          <RadioGroupItem value="With Background" className="mt-0.5" disabled={locked} />
          <span>
            <span className="block font-medium">With Background</span>
            <span className="block text-[11px] text-muted-foreground">Reference ranges, methodology &amp; interpretation</span>
          </span>
        </label>
        <label className={cn(
          "flex flex-1 items-start gap-2 rounded-lg border p-3 text-sm",
          value === "Without Background" ? "border-teal-400 bg-teal-50/50" : "border-slate-200",
          locked && "pointer-events-none opacity-50",
        )}>
          <RadioGroupItem value="Without Background" className="mt-0.5" disabled={locked} />
          <span>
            <span className="block font-medium">Without Background</span>
            <span className="block text-[11px] text-muted-foreground">Compact results table — B2B / Sub-Agency only</span>
          </span>
        </label>
      </RadioGroup>
      {locked ? (
        <p className="flex items-center gap-1.5 text-[11px] text-teal-800">
          <Info className="h-3.5 w-3.5" /> B2C (direct patient) reports are always issued With Background — as per lab policy.
        </p>
      ) : (
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Info className="h-3.5 w-3.5" /> B2B &amp; Sub-Agency accounts may choose either format per order; the patient-facing copy always keeps the background.
        </p>
      )}
    </div>
  );
}

// ---------- Small helper used by order summary rails ----------
export function VialSummaryChip({ codes }: { codes: string[] }) {
  const vials = requiredVials(codes);
  if (vials.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 text-teal-700">
      <FlaskConical className="h-3 w-3" /> {vials.length} tube{vials.length > 1 ? "s" : ""} required · barcode scan at entry
    </div>
  );
}

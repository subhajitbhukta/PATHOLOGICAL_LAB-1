"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { barcodeBars, inr, qrMatrix } from "@/lib/lis/format";
import { Check, ChevronLeft, ChevronRight, ChevronsUpDown, CircleDot, Search, Printer } from "lucide-react";

// ============================================================
// Status tone system (no blue/indigo in palette)
// ============================================================
type Tone = "teal" | "violet" | "amber" | "emerald" | "rose" | "slate";

const TONE_CLASSES: Record<Tone, string> = {
  teal: "bg-teal-50 text-teal-700 border-teal-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_TONES: Record<string, Tone> = {
  // order workflow
  "Booking Confirmed": "teal", "Sample Collected": "teal", "Pickup Requested": "amber",
  "Picked Up": "violet", "In Transit": "violet", "Received at Lab": "teal",
  "Sample Accepted": "emerald", "Assigned to Department": "violet", "Test in Progress": "violet",
  "Result Entered": "amber", "Verification Pending": "amber", "Pathologist Approved": "emerald",
  "Report Generated": "emerald", "Report Delivered": "emerald",
  "Sample Rejected": "rose", "Recollection Requested": "rose",
  // payments
  Paid: "emerald", Unpaid: "rose", Partial: "amber", Credit: "violet", Refunded: "slate",
  // generic
  Active: "emerald", Inactive: "slate", Suspended: "rose", Pending: "amber", Approved: "emerald",
  Rejected: "rose", "Sent Back": "amber", Queued: "amber", Sent: "emerald", Failed: "rose",
  Draft: "slate", Scheduled: "violet", Completed: "emerald", Cancelled: "rose",
  Requested: "amber", Assigned: "violet", Settled: "emerald", "Partially Settled": "amber", Open: "amber",
  "Pending Dispatch": "amber", Dispatched: "violet", "In Progress at External Lab": "violet",
  "Result Received": "teal", "Report Verified": "emerald",
  "Pending Technical Review": "amber", "Pending Pathologist Approval": "amber",
  "On Leave": "amber", Good: "emerald", Damaged: "rose", Leaking: "rose", Insufficient: "amber",
  Urgent: "rose", STAT: "rose", Routine: "slate",
};

export function toneOf(status: string): Tone {
  return STATUS_TONES[status] ?? "slate";
}

export function StatusPill({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium whitespace-nowrap", TONE_CLASSES[toneOf(status)], className)}>
      {status}
    </Badge>
  );
}

export function FlagPill({ flag }: { flag: string }) {
  const map: Record<string, { label: string; tone: Tone }> = {
    H: { label: "H", tone: "rose" }, L: { label: "L", tone: "amber" },
    N: { label: "N", tone: "emerald" }, A: { label: "A", tone: "rose" },
  };
  const f = map[flag] ?? { label: flag, tone: "slate" as Tone };
  return (
    <Badge variant="outline" className={cn("h-5 w-6 justify-center p-0 font-bold", TONE_CLASSES[f.tone])}>
      {f.label}
    </Badge>
  );
}

export function ChannelPill({ channel }: { channel: string }) {
  const map: Record<string, string> = {
    B2C: "bg-teal-600/10 text-teal-700 border-teal-200",
    B2B: "bg-violet-600/10 text-violet-700 border-violet-200",
    SUB: "bg-amber-500/10 text-amber-700 border-amber-200",
  };
  return (
    <Badge variant="outline" className={cn("font-semibold whitespace-nowrap", map[channel] ?? TONE_CLASSES.slate)}>
      {channel}
    </Badge>
  );
}

export function Money({ value, className, compact }: { value?: number; className?: string; compact?: boolean }) {
  return <span className={cn("tabular-nums font-medium", className)}>{inr(value, { compact })}</span>;
}

// ============================================================
// Layout primitives
// ============================================================
export function PageHeader({
  title, subtitle, actions, icon,
}: { title: string; subtitle?: string; actions?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {icon ? <div className="mt-0.5 rounded-lg bg-teal-600/10 p-2 text-teal-700">{icon}</div> : null}
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
          {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  title, description, actions, children, className, contentClassName, id,
}: {
  title?: string; description?: string; actions?: React.ReactNode;
  children: React.ReactNode; className?: string; contentClassName?: string; id?: string;
}) {
  return (
    <Card id={id} className={cn("border-slate-200/80 shadow-sm", className)}>
      {title || actions ? (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-0.5">
            {title ? <CardTitle className="text-base font-semibold">{title}</CardTitle> : null}
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </CardHeader>
      ) : null}
      <CardContent className={cn("p-4 pt-0", !title && "pt-4", contentClassName)}>{children}</CardContent>
    </Card>
  );
}

export function StatCard({
  label, value, sublabel, delta, deltaTone, icon, accent = "teal", onClick,
}: {
  label: string; value: React.ReactNode; sublabel?: string; delta?: string;
  deltaTone?: "up" | "down" | "flat"; icon?: React.ReactNode;
  accent?: "teal" | "violet" | "amber" | "emerald" | "rose"; onClick?: () => void;
}) {
  const accents: Record<string, string> = {
    teal: "bg-teal-600/10 text-teal-700", violet: "bg-violet-600/10 text-violet-700",
    amber: "bg-amber-500/10 text-amber-700", emerald: "bg-emerald-600/10 text-emerald-700",
    rose: "bg-rose-500/10 text-rose-700",
  };
  return (
    <Card
      className={cn("border-slate-200/80 shadow-sm", onClick && "cursor-pointer transition-shadow hover:shadow-md")}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <CardContent className="flex items-start justify-between p-4">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{value}</p>
          <div className="mt-1 flex items-center gap-1.5">
            {delta ? (
              <span
                className={cn(
                  "text-xs font-medium",
                  deltaTone === "up" && "text-emerald-600", deltaTone === "down" && "text-rose-600",
                  deltaTone === "flat" && "text-slate-500",
                )}
              >
                {delta}
              </span>
            ) : null}
            {sublabel ? <span className="truncate text-xs text-muted-foreground">{sublabel}</span> : null}
          </div>
        </div>
        {icon ? <div className={cn("rounded-lg p-2", accents[accent])}>{icon}</div> : null}
      </CardContent>
    </Card>
  );
}

export function EmptyState({ title, hint, icon }: { title: string; hint?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-12 text-center">
      <div className="text-slate-300">{icon ?? <CircleDot className="h-8 w-8" />}</div>
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {hint ? <p className="max-w-sm text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function KeyValue({ items, cols = 2 }: { items: { label: string; value: React.ReactNode }[]; cols?: number }) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-3", cols === 3 ? "sm:grid-cols-3" : cols === 4 ? "grid-cols-2 sm:grid-cols-4" : "sm:grid-cols-2")}>
      {items.map((it) => (
        <div key={it.label} className="min-w-0">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{it.label}</dt>
          <dd className="mt-0.5 truncate text-sm font-medium text-slate-800">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// ============================================================
// Forms
// ============================================================
export function Field({
  label, required, hint, children, className,
}: { label: string; required?: boolean; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-slate-700">
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function FormGrid({ cols = 2, children, className }: { cols?: 2 | 3 | 4; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 2 && "sm:grid-cols-2",
        cols === 3 && "sm:grid-cols-3",
        cols === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SearchInput({
  value, onChange, placeholder = "Search…", className,
}: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-8" />
    </div>
  );
}

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()} className="no-print">
      <Printer className="mr-1.5 h-4 w-4" /> {label}
    </Button>
  );
}

// ============================================================
// DataTable — generic list with search + pagination
// ============================================================
export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  headClassName?: string;
  render?: (row: T) => React.ReactNode;
  value?: (row: T) => string | number;
}

export function DataTable<T extends object>({
  columns, rows, searchOf, searchPlaceholder = "Search…", pageSize = 10, onRowClick,
  toolbar, filters, dense,
}: {
  columns: Column<T>[]; rows: T[]; searchOf?: (row: T) => string;
  searchPlaceholder?: string; pageSize?: number; onRowClick?: (row: T) => void;
  toolbar?: React.ReactNode; filters?: React.ReactNode; dense?: boolean;
}) {
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(0);

  React.useEffect(() => setPage(0), [q, rows.length]);

  const filtered = React.useMemo(() => {
    if (!q.trim()) return rows;
    const needle = q.toLowerCase();
    return rows.filter((r) =>
      searchOf ? searchOf(r).toLowerCase().includes(needle) : JSON.stringify(r).toLowerCase().includes(needle),
    );
  }, [rows, q, searchOf]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="space-y-3">
      {(toolbar || filters || searchOf) && (
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">{filters}</div>
          <div className="flex flex-wrap items-center gap-2">
            {searchOf ? <SearchInput value={q} onChange={setQ} placeholder={searchPlaceholder} className="w-full sm:w-64" /> : null}
            {toolbar}
          </div>
        </div>
      )}
      <div className="overflow-hidden rounded-lg border">
        <div className="max-h-[640px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-slate-50">
              <TableRow className="hover:bg-transparent">
                {columns.map((c) => (
                  <TableHead key={c.key} className={cn("h-9 text-xs font-semibold text-slate-600", c.headClassName)}>
                    <span className="inline-flex items-center gap-1">
                      {c.header}
                      {c.value ? <ChevronsUpDown className="h-3 w-3 text-slate-300" /> : null}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-sm text-muted-foreground">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((row, i) => (
                  <TableRow
                    key={i}
                    className={cn(onRowClick && "cursor-pointer")}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((c) => (
                      <TableCell key={c.key} className={cn(!dense && "py-2.5", c.className)}>
                        {c.render ? c.render(row) : c.value ? String(c.value(row)) : null}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {filtered.length === 0 ? 0 : page * pageSize + 1}–{Math.min(filtered.length, (page + 1) * pageSize)} of {filtered.length}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-7 px-2" disabled={page === 0} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="px-1 tabular-nums">Page {page + 1} / {totalPages}</span>
          <Button variant="outline" size="sm" className="h-7 px-2" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Timelines & steppers
// ============================================================
export function Timeline({ items }: { items: { label: string; time?: string; note?: string }[] }) {
  return (
    <ol className="relative space-y-0">
      {items.map((it, i) => {
        const done = Boolean(it.time);
        const last = i === items.length - 1;
        return (
          <li key={it.label} className="relative flex gap-3 pb-4 last:pb-0">
            {!last ? (
              <span className={cn("absolute left-[9px] top-5 h-full w-px", done && it.time ? "bg-teal-300" : "bg-slate-200")} />
            ) : null}
            <span
              className={cn(
                "z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-white",
                done ? "border-teal-500 bg-teal-500 text-white" : "border-slate-300 text-slate-300",
              )}
            >
              {done ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <div className="min-w-0">
              <p className={cn("text-sm font-medium leading-5", done ? "text-slate-900" : "text-slate-500")}>{it.label}</p>
              {it.time ? <p className="text-xs text-muted-foreground">{it.time}</p> : null}
              {it.note ? <p className="text-xs text-muted-foreground">{it.note}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function PatientSteps({ current }: { current: number }) {
  const steps = ["Sample Collected", "Sample Received", "Test in Progress", "Report Verification", "Report Ready"];
  return (
    <ol className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex items-center gap-2 sm:flex-1">
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold",
                done && "border-emerald-500 bg-emerald-500 text-white",
                active && "border-teal-500 text-teal-600",
                !done && !active && "border-slate-300 text-slate-400",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={cn("text-xs font-medium", done || active ? "text-slate-900" : "text-slate-400")}>{s}</span>
            {i < steps.length - 1 ? <span className="mx-1 hidden h-px flex-1 bg-slate-200 sm:block" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

export function WorkflowChain({ flow, current }: { flow: string[]; current: number }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {flow.map((s, i) => (
        <React.Fragment key={s}>
          <span
            className={cn(
              "whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium",
              i < current && "bg-teal-600 text-white",
              i === current && "bg-teal-100 text-teal-800 ring-1 ring-teal-400",
              i > current && "bg-slate-100 text-slate-500",
            )}
          >
            {s}
          </span>
          {i < flow.length - 1 ? <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" /> : null}
        </React.Fragment>
      ))}
    </div>
  );
}

// ============================================================
// QR / Barcode / cards
// ============================================================
export function QR({ value, size = 84, className }: { value: string; size?: number; className?: string }) {
  const m = qrMatrix(value);
  const cell = size / m.length;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn("shrink-0", className)} role="img" aria-label="QR code">
      <rect width={size} height={size} fill="white" />
      {m.map((row, y) => row.map((on, x) => on ? (
        <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell + 0.15} height={cell + 0.15} fill="#0f172a" />
      ) : null))}
    </svg>
  );
}

export function Barcode({ value, height = 40, className }: { value: string; height?: number; className?: string }) {
  const bars = barcodeBars(value);
  const { widths, total } = React.useMemo(() => {
    const arr: { x: number; w: number }[] = [];
    let cursor = 0;
    for (const w of bars) {
      arr.push({ x: cursor, w });
      cursor += w + 1.6;
    }
    return { widths: arr, total: cursor };
  }, [value]);
  return (
    <div className={cn("select-none", className)}>
      <svg viewBox={`0 0 ${total} ${height}`} height={height} className="w-full" role="img" aria-label={`Barcode ${value}`}>
        <rect width={total} height={height} fill="white" />
        {widths.map((b, i) => (
          <rect key={i} x={b.x} y={0} width={b.w} height={height} fill="#0f172a" />
        ))}
      </svg>
      <p className="mt-0.5 text-center font-mono text-[10px] tracking-[0.18em] text-slate-800">{value}</p>
    </div>
  );
}

export function SampleLabelCard({
  sampleId, barcode, patientName, ageSex, type, container, tests, collectedAt, source,
}: {
  sampleId: string; barcode: string; patientName: string; ageSex: string; type: string;
  container: string; tests: string; collectedAt: string; source?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-300 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2 border-b border-dashed border-slate-300 pb-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-900">Apex Reference Laboratories</p>
          <p className="truncate text-[10px] text-muted-foreground">{source ?? "B2C Direct"} · {collectedAt}</p>
        </div>
        <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Sample</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        <p><span className="text-muted-foreground">Patient:</span> <span className="font-semibold">{patientName}</span></p>
        <p><span className="text-muted-foreground">Age/Sex:</span> <span className="font-semibold">{ageSex}</span></p>
        <p className="col-span-2"><span className="text-muted-foreground">Type:</span> <span className="font-semibold">{type} · {container}</span></p>
        <p className="col-span-2 truncate"><span className="text-muted-foreground">Tests:</span> <span className="font-semibold">{tests}</span></p>
        <p className="col-span-2"><span className="text-muted-foreground">Vial barcode:</span> <span className="font-mono font-semibold">{barcode}</span><span className="text-muted-foreground"> · internal ref {sampleId}</span></p>
      </div>
      <Barcode value={barcode} height={34} className="mt-2" />
      <p className="mt-1 text-center text-[9px] text-muted-foreground">Pre-printed label — number recorded by scan/entry at collection</p>
    </div>
  );
}

// ============================================================
// Charts (dependency-free SVG)
// ============================================================
const CHART_COLORS = ["#0d9488", "#7c3aed", "#f59e0b", "#10b981", "#f43f5e", "#a3a3a3", "#84cc16", "#ea580c"];

export function MiniBars({
  data, height = 170, color = "#0d9488", format = (v: number) => inr(v, { compact: true }),
}: { data: { label: string; value: number }[]; height?: number; color?: string; format?: (v: number) => string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2" style={{ height: height + 34 }}>
      {data.map((d) => (
        <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <span className="text-[10px] font-medium text-slate-500">{format(d.value)}</span>
          <div
            className="w-full max-w-[38px] rounded-t transition-all"
            style={{ height: Math.max(4, (d.value / max) * height), backgroundColor: color, opacity: 0.85 }}
            title={`${d.label}: ${format(d.value)}`}
          />
          <span className="w-full truncate text-center text-[10px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function HBars({
  data, format = (v: number) => inr(v, { compact: true }), colorMap,
}: {
  data: { label: string; value: number; sub?: string }[];
  format?: (v: number) => string; colorMap?: (i: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={d.label} className="grid grid-cols-[minmax(90px,180px)_1fr_auto] items-center gap-2 sm:grid-cols-[minmax(120px,220px)_1fr_auto]">
          <span className="truncate text-xs font-medium text-slate-700" title={d.label}>{d.label}</span>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: colorMap ? colorMap(i) : CHART_COLORS[i % CHART_COLORS.length] }}
            />
          </div>
          <span className="text-xs font-semibold tabular-nums text-slate-800">
            {format(d.value)}
            {d.sub ? <span className="ml-1 font-normal text-muted-foreground">{d.sub}</span> : null}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Donut({
  data, size = 150, thickness = 22, centerLabel, centerValue,
}: {
  data: { label: string; value: number }[]; size?: number; thickness?: number;
  centerLabel?: string; centerValue?: string;
}) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const segments = React.useMemo(
    () =>
      data.map((d, i) => ({
        label: d.label,
        len: (d.value / total) * c,
        offset: data.slice(0, i).reduce((a, prev) => a + (prev.value / total) * c, 0),
        color: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [data, total, c],
  );
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {segments.map((s) => (
            <circle
              key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={s.color} strokeWidth={thickness}
              strokeDasharray={`${s.len} ${c - s.len}`} strokeDashoffset={-s.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold text-slate-900">{centerValue}</span>
          <span className="text-[10px] text-muted-foreground">{centerLabel}</span>
        </div>
      </div>
      <ul className="space-y-1.5">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="text-slate-600">{d.label}</span>
            <span className="font-semibold text-slate-900">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TrendArea({
  data, height = 170, color = "#0d9488", format = (v: number) => inr(v, { compact: true }),
}: { data: { label: string; value: number }[]; height?: number; color?: string; format?: (v: number) => string }) {
  const w = 560; const h = height; const pad = 26;
  const max = Math.max(...data.map((d) => d.value)) * 1.1;
  const min = 0;
  const xs = data.map((_, i) => pad + (i * (w - pad * 2)) / (data.length - 1));
  const ys = data.map((d) => h - pad - ((d.value - min) / (max - min)) * (h - pad * 2));
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const area = `${line} L${xs[xs.length - 1]},${h - pad} L${xs[0]},${h - pad} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={pad} x2={w - pad} y1={h - pad - f * (h - pad * 2)} y2={h - pad - f * (h - pad * 2)} stroke="#e2e8f0" strokeDasharray="3 4" />
        ))}
        <path d={area} fill={color} opacity="0.12" />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r="3.5" fill="white" stroke={color} strokeWidth="2" />)}
      </svg>
      <div className="mt-1 flex justify-between px-2">
        {data.map((d) => (
          <span key={d.label} className="text-[10px] text-muted-foreground">
            {d.label} · {format(d.value)}
          </span>
        ))}
      </div>
    </div>
  );
}

// Price hierarchy tree (pricing engine)
export function PriceNode({
  label, sub, price, tone = "teal", children, badge,
}: {
  label: string; sub?: string; price: string | number; tone?: "teal" | "violet" | "amber" | "emerald" | "slate";
  children?: React.ReactNode; badge?: string;
}) {
  const border: Record<string, string> = {
    teal: "border-teal-300", violet: "border-violet-300", amber: "border-amber-300",
    emerald: "border-emerald-300", slate: "border-slate-300",
  };
  return (
    <div className="space-y-2">
      <div className={cn("flex items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2 shadow-sm", border[tone])}>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{label}</p>
          {sub ? <p className="truncate text-xs text-muted-foreground">{sub}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {badge ? <Badge variant="outline" className="text-[10px]">{badge}</Badge> : null}
          <span className="whitespace-nowrap text-sm font-bold tabular-nums text-slate-900">{typeof price === "number" ? inr(price) : price}</span>
        </div>
      </div>
      {children ? <div className="ml-4 space-y-2 border-l-2 border-dashed border-slate-200 pl-4 sm:ml-6">{children}</div> : null}
    </div>
  );
}

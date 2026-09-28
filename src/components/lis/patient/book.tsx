"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLisNav } from "@/components/lis/nav";
import { tests, packages, patientById } from "@/lib/lis/data";
import { inr } from "@/lib/lis/format";
import {
  EmptyState, Money, PageHeader, Panel, SearchInput,
} from "@/components/lis/widgets";
import {
  CalendarDays, CheckCircle2, Clock, FileUp, FlaskConical, Home, MapPin, MessageCircle,
  ShieldCheck, Store, Timer,
} from "lucide-react";

const PATIENT_ID = "PAT-00124";

const me = patientById(PATIENT_ID);

const DATES = [
  { value: "2026-09-29", label: "Tue, 29 Sep" },
  { value: "2026-09-30", label: "Wed, 30 Sep" },
  { value: "2026-10-01", label: "Thu, 01 Oct" },
  { value: "2026-10-02", label: "Fri, 02 Oct" },
];

const SLOTS = [
  "06:00 – 06:30", "06:30 – 07:00", "07:00 – 07:30", "07:30 – 08:00",
  "08:00 – 08:30", "09:00 – 09:30", "17:00 – 17:30",
];

interface Sel { code: string; name: string; price: number; tatHours: number }

export function PatientBookTestView() {
  const { go } = useLisNav();
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState<Sel[]>([
    { code: "FBS", name: "Fasting Blood Sugar (Glucose Fasting)", price: 120, tatHours: 4 },
    { code: "LIPID", name: "Lipid Profile", price: 500, tatHours: 8 },
  ]);
  const [date, setDate] = React.useState("2026-09-29");
  const [slot, setSlot] = React.useState("07:00 – 07:30");
  const [mode, setMode] = React.useState<"home" | "centre">("home");
  const [done, setDone] = React.useState(false);

  const filteredTests = tests.filter(
    (t) => t.status === "Active" && (q === "" || `${t.code} ${t.name} ${t.department}`.toLowerCase().includes(q.toLowerCase())),
  );

  const toggleTest = (t: { code: string; name: string; b2cPrice: number; tatHours: number }) => {
    setSel((cur) => {
      if (cur.some((s) => s.code === t.code)) return cur.filter((s) => s.code !== t.code);
      return [...cur, { code: t.code, name: t.name, price: t.b2cPrice, tatHours: t.tatHours }];
    });
  };

  const togglePackage = (p: { code: string; name: string; b2cPrice: number; tatHours: number }) => {
    setSel((cur) => {
      if (cur.some((s) => s.code === p.code)) return cur.filter((s) => s.code !== p.code);
      return [...cur, { code: p.code, name: p.name, price: p.b2cPrice, tatHours: p.tatHours }];
    });
  };

  const subtotal = sel.reduce((a, s) => a + s.price, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;
  const needsFasting = sel.some((s) => ["FBS", "LIPID", "INSULIN-F", "PKG-DIABETES", "PKG-FULL-ADV", "PKG-SENIOR"].includes(s.code));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Book a Test"
        subtitle="Pick your tests, choose a slot — a certified phlebotomist comes home"
        icon={<FlaskConical className="h-5 w-5" />}
      />

      {done ? (
        <div className="space-y-5">
          <Panel className="border-emerald-300 bg-emerald-50/60">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              <div className="flex-1">
                <p className="text-lg font-semibold text-emerald-900">Booking confirmed</p>
                <p className="text-sm text-emerald-800">
                  Booking ID <b>ORD-20260929-00127</b> · {mode === "home" ? "home collection" : "centre visit"} on{" "}
                  {DATES.find((d) => d.value === date)?.label} at {slot}. {needsFasting ? "Fasting needed — only water after 10 pm." : ""}
                </p>
              </div>
              <Button onClick={() => go("patient/tests")}>Track My Tests</Button>
            </div>
          </Panel>
          <div className="grid gap-4 sm:grid-cols-2">
            <Panel title="Confirmation Sent">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-emerald-600" /> SMS from APEXLB to {me?.mobile}</p>
                <p className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp confirmation with booking summary</p>
                <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-emerald-600" /> Reminder 2 hours before the {mode === "home" ? "visit" : "slot"}</p>
              </div>
            </Panel>
            <Panel title="Your Phlebotomist">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600/10 text-sm font-bold text-emerald-700">SK</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Sarita Kadam</p>
                  <p className="text-xs text-muted-foreground">Certified · 2,400+ collections · 4.9★ rating</p>
                </div>
              </div>
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-muted-foreground">
                Single-use sterile kit · id card shown at the door · reports on WhatsApp the same day.
              </p>
            </Panel>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left — choose tests */}
          <div className="space-y-4 lg:col-span-2">
            <Panel title="1 · Choose Tests" description={`Popular singles and packages — all at patient-friendly prices for ${me?.name.split(" ")[0]}`}>
              <SearchInput value={q} onChange={setQ} placeholder="Search tests… e.g. Thyroid, Vitamin, CBC" className="mb-3" />
              <div className="grid max-h-96 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {filteredTests.map((t) => {
                  const checked = sel.some((s) => s.code === t.code);
                  return (
                    <button
                      key={t.code}
                      onClick={() => toggleTest(t)}
                      className={`rounded-xl border p-3 text-left transition-colors ${
                        checked ? "border-emerald-400 bg-emerald-50/60" : "border-slate-200 hover:border-emerald-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-5 text-slate-800">{t.name}</p>
                        {checked ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : null}
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">{t.department} · report in {t.tatHours}h</p>
                      <Money value={t.b2cPrice} className="mt-1.5 inline-block text-sm text-emerald-700" />
                    </button>
                  );
                })}
                {filteredTests.length === 0 ? <div className="sm:col-span-2"><EmptyState title="No tests match your search" /></div> : null}
              </div>

              <p className="mb-2 mt-4 text-sm font-semibold text-slate-700">Health packages — better value</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {packages.map((p) => {
                  const checked = sel.some((s) => s.code === p.code);
                  return (
                    <button
                      key={p.code}
                      onClick={() => togglePackage(p)}
                      className={`rounded-xl border p-3 text-left transition-colors ${
                        checked ? "border-emerald-400 bg-emerald-50/60" : "border-slate-200 hover:border-emerald-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-5 text-slate-800">{p.name}</p>
                        {checked ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : null}
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">{p.includes}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Money value={p.b2cPrice} className="text-sm text-emerald-700" />
                        <span className="text-[11px] text-muted-foreground">· {p.tests.length} tests</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Panel>

            <Panel title="2 · When & Where">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-slate-700">Date</p>
                  <Select value={date} onValueChange={setDate}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DATES.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-slate-700">Slot</p>
                  <Select value={slot} onValueChange={setSlot}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SLOTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <RadioGroup value={mode} onValueChange={(v) => setMode(v as "home" | "centre")} className="grid gap-2 sm:grid-cols-2">
                  <label className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 ${mode === "home" ? "border-emerald-400 bg-emerald-50/60" : "border-slate-200"}`}>
                    <RadioGroupItem value="home" className="mt-0.5" />
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-medium text-slate-800"><Home className="h-3.5 w-3.5 text-emerald-600" /> Home collection</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{me?.address}, {me?.city}</p>
                    </div>
                  </label>
                  <label className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 ${mode === "centre" ? "border-emerald-400 bg-emerald-50/60" : "border-slate-200"}`}>
                    <RadioGroupItem value="centre" className="mt-0.5" />
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-medium text-slate-800"><Store className="h-3.5 w-3.5 text-emerald-600" /> Visit a centre</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">Apex Collection Point — Galleria Mall, Powai</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4">
                <FileUp className="h-6 w-6 shrink-0 text-emerald-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-700">Upload prescription <span className="font-normal text-muted-foreground">(optional)</span></p>
                  <p className="text-[11px] text-muted-foreground">JPG, PNG or PDF · doctor&apos;s prescription helps us suggest the right tests</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px]">Choose file</Badge>
              </div>
            </Panel>
          </div>

          {/* Right — summary */}
          <div className="space-y-4">
            <Panel title="Booking Summary" description={`${sel.length} item(s)`}>
              {sel.length === 0 ? (
                <EmptyState title="No tests selected" hint="Tap any test or package to add it." />
              ) : (
                <ul className="space-y-2">
                  {sel.map((s) => (
                    <li key={s.code} className="flex items-start justify-between gap-2 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground">report in ~{s.tatHours}h</p>
                      </div>
                      <Money value={s.price} className="shrink-0" />
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 space-y-1 border-t border-dashed pt-3 text-sm">
                <div className="flex justify-between text-xs text-muted-foreground"><span>Subtotal</span><span className="tabular-nums">{inr(subtotal)}</span></div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>GST @ 18%</span><span className="tabular-nums">{inr(gst)}</span></div>
                <div className="flex justify-between pt-1 text-base font-bold"><span>Total payable</span><Money value={total} /></div>
              </div>
              <Button className="mt-4 w-full" disabled={sel.length === 0} onClick={() => setDone(true)}>
                Confirm Booking · {inr(total)}
              </Button>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">Pay after sample collection — UPI, cash or card.</p>
            </Panel>

            <Panel title="Good to Know">
              <div className="space-y-2.5 text-xs text-muted-foreground">
                {needsFasting ? (
                  <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-2.5 py-2 text-amber-900">
                    <Timer className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                    Fasting needed: no food for 10 hours (water is fine). Morning slot is ideal.
                  </p>
                ) : null}
                <p className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> NABL-accredited labs · barcoded samples · QR-verified reports.</p>
                <p className="flex items-start gap-2"><Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> Most reports the same day; packages within 24 hours.</p>
                <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> Free home collection above ₹500 · ₹100 fee below that.</p>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}

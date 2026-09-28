"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLisNav } from "@/components/lis/nav";
import { partners, patients, priceFor, subAgencies, tests } from "@/lib/lis/data";
import { inr } from "@/lib/lis/format";
import {
  Field, FormGrid, Money, PageHeader, Panel, PrintButton, SampleLabelCard, SearchInput,
} from "@/components/lis/widgets";
import {
  BadgeCheck, CheckCircle2, ChevronLeft, ChevronRight, CreditCard, Lock,
  ShieldCheck, UserPlus, Users,
} from "lucide-react";

// ============================================================
// B2B New Test Order — 3-step wizard (Patient → Tests → Confirm)
// Prices resolve from the partner rate card: priceFor(code,"B2B","B2B-001")
// ============================================================

const PARTNER_ID = "B2B-001";
const partner = partners.find((p) => p.id === PARTNER_ID) ?? partners[0];
const SUB_IDS = subAgencies.filter((s) => s.parentId === PARTNER_ID).map((s) => s.id);
const myPatients = patients.filter(
  (p) =>
    (p.channel === "B2B" && p.sourceId === PARTNER_ID) ||
    (p.channel === "SUB" && p.sourceId !== undefined && SUB_IDS.includes(p.sourceId)),
);
const activeTests = tests.filter((t) => t.status === "Active");
const STEPS = ["Patient", "Select Tests", "Confirm & Generate"];

interface Sel { code: string; name: string; rate: number; list: number }

export function B2bOrderNewView() {
  const { go } = useLisNav();
  const [step, setStep] = React.useState(0);
  const [done, setDone] = React.useState(false);

  // Step 1 — patient
  const [mode, setMode] = React.useState<"existing" | "new">("existing");
  const [selectedId, setSelectedId] = React.useState("PAT-00125");
  const [pq, setPq] = React.useState("");
  const [form, setForm] = React.useState({
    name: "Sunita Verma", age: "38", gender: "Female", mobile: "+91 98331 22120",
    email: "sunita.v@gmail.com", address: "7, Powai Vihar Complex, Powai", source: partner.name,
  });

  // Step 2 — tests (B2B rate card prices)
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState<Sel[]>([
    { code: "CBC", name: "Complete Blood Count (CBC)", rate: priceFor("CBC", "B2B", PARTNER_ID), list: priceFor("CBC", "B2C") },
    { code: "HBA1C", name: "Glycosylated Haemoglobin (HbA1c)", rate: priceFor("HBA1C", "B2B", PARTNER_ID), list: priceFor("HBA1C", "B2C") },
  ]);

  // Step 3 — payment
  const [payMode, setPayMode] = React.useState("Credit");

  const patientDisplay = myPatients.find((p) => p.id === selectedId);
  const patientName = mode === "existing" ? patientDisplay?.name ?? "—" : form.name;
  const patientAgeSex = mode === "existing"
    ? patientDisplay ? `${patientDisplay.age}y / ${patientDisplay.gender === "Male" ? "M" : "F"}` : "—"
    : `${form.age || "0"}y / ${form.gender === "Male" ? "M" : "F"}`;

  const filteredPatients = myPatients.filter(
    (p) => pq === "" || `${p.id} ${p.name} ${p.mobile}`.toLowerCase().includes(pq.toLowerCase()),
  );
  const filteredTests = activeTests.filter(
    (t) => q === "" || `${t.code} ${t.name} ${t.department}`.toLowerCase().includes(q.toLowerCase()),
  );

  const toggleTest = (code: string) => {
    const t = activeTests.find((x) => x.code === code);
    if (!t) return;
    setSel((cur) => {
      if (cur.some((s) => s.code === code)) return cur.filter((s) => s.code !== code);
      return [...cur, { code, name: t.name, rate: priceFor(code, "B2B", PARTNER_ID), list: priceFor(code, "B2C") }];
    });
  };

  const b2bGross = sel.reduce((a, s) => a + s.rate, 0);
  const listGross = sel.reduce((a, s) => a + s.list, 0);
  const savings = listGross - b2bGross;
  const gst = Math.round(b2bGross * 0.18);
  const net = b2bGross + gst;

  const orderId = "ORD-20260928-00127";
  const sampleId = "SMP-20260928-00913";

  const reset = () => {
    setDone(false);
    setStep(0);
    setSel([]);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="New Test Order — ABC Diagnostics"
        subtitle="Patient → Tests (partner rate card) → Confirm · billed to your B2B account"
        actions={<Button variant="outline" onClick={() => go("b2b/orders")}><ChevronLeft className="mr-1 h-4 w-4" /> Back to Orders</Button>}
      />

      {/* Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-3">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => !done && setStep(i)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                i === step && !done ? "bg-violet-600 text-white" : done || i < step ? "bg-violet-50 text-violet-800" : "text-slate-500"
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i === step ? "bg-white/20" : done || i < step ? "bg-violet-600 text-white" : "bg-slate-200"}`}>
                {i < step ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
              </span>
              {s}
            </button>
            {i < STEPS.length - 1 ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" /> : null}
          </React.Fragment>
        ))}
      </div>

      {done ? (
        <div className="space-y-5">
          <Panel className="border-emerald-200 bg-emerald-50/50">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <div className="flex-1">
                <p className="text-base font-semibold text-emerald-900">Order booked on your B2B account</p>
                <p className="text-sm text-emerald-800">
                  {orderId} · {sel.length} test(s) · Net {inr(net)} · Payment {payMode}.
                  Sample label generated below — barcode label queued to your centre printer.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={reset}>Book Another</Button>
                <Button className="bg-violet-600 text-white hover:bg-violet-700" onClick={() => go("b2b/orders")}>Go to Orders</Button>
              </div>
            </div>
          </Panel>
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Order Confirmation" className="lg:col-span-2">
              <div className="space-y-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-violet-600 font-mono">{orderId}</Badge>
                  <Badge variant="outline" className="font-mono">{sampleId}</Badge>
                  <BadgeCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-muted-foreground">Billed to {partner.name} ({partner.id}) · {payMode === "Credit" ? "Credit — due 12 Oct 2026" : payMode}</span>
                </div>
                <FormGrid cols={2}>
                  <Field label="Patient"><Input readOnly value={`${patientName} · ${patientAgeSex}`} /></Field>
                  <Field label="Booked By">
                    <Input readOnly value={mode === "existing" ? `Existing patient — ${patientDisplay?.source}` : `New registration — ${form.source}`} />
                  </Field>
                  <Field label="Tests"><Input readOnly value={sel.map((s) => s.code).join(", ")} /></Field>
                  <Field label="Net Payable"><Input readOnly value={inr(net)} className="font-semibold" /></Field>
                </FormGrid>
              </div>
            </Panel>
            <Panel title="Print Barcode Label" description="Affix on every tube of this sample">
              <SampleLabelCard
                sampleId={sampleId} patientName={patientName} ageSex={patientAgeSex}
                type="Whole Blood EDTA" container="EDTA Vacutainer (Lavender)"
                tests={sel.map((s) => s.code).join(", ")} collectedAt="28 Sep 2026, 12:40 pm"
                source={partner.name}
              />
              <div className="mt-3">
                <PrintButton label="Print Barcode" />
              </div>
            </Panel>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {step === 0 ? (
              <Panel title="1 · Patient" description="Pick an existing patient of ABC Diagnostics or register a new one">
                <div className="mb-4 flex gap-2">
                  <Button size="sm" variant={mode === "existing" ? "default" : "outline"} className={mode === "existing" ? "bg-violet-600 text-white hover:bg-violet-700" : undefined} onClick={() => setMode("existing")}>
                    <Users className="mr-1.5 h-3.5 w-3.5" /> Existing Patient
                  </Button>
                  <Button size="sm" variant={mode === "new" ? "default" : "outline"} className={mode === "new" ? "bg-violet-600 text-white hover:bg-violet-700" : undefined} onClick={() => setMode("new")}>
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Register New
                  </Button>
                </div>
                {mode === "existing" ? (
                  <div className="space-y-2">
                    <SearchInput value={pq} onChange={setPq} placeholder="Search your patients by name / mobile / ID…" />
                    <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border p-2">
                      {filteredPatients.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedId(p.id)}
                          className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                            selectedId === p.id ? "bg-violet-50 ring-1 ring-violet-300" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">{p.name} <span className="ml-1 font-mono text-[10px] text-slate-400">{p.id}</span></p>
                            <p className="truncate text-[11px] text-muted-foreground">{p.age}y {p.gender} · {p.mobile} · {p.source}</p>
                          </div>
                          {selectedId === p.id ? <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-600" /> : null}
                        </button>
                      ))}
                    </div>
                    {patientDisplay ? (
                      <div className="rounded-lg border border-violet-200 bg-violet-50/60 p-3 text-xs text-violet-900">
                        Selected: <b>{patientDisplay.name}</b> · {patientDisplay.age}y {patientDisplay.gender} · {patientDisplay.source} · registered {patientDisplay.registeredOn}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <FormGrid cols={2}>
                    <Field label="Full Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                    <Field label="Age" required><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></Field>
                    <Field label="Gender" required>
                      <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                      </Select>
                    </Field>
                    <Field label="Mobile" required><Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></Field>
                    <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                    <Field label="Collection Source" hint="Where the patient walks in">
                      <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={partner.name}>{partner.name} (direct)</SelectItem>
                          {subAgencies.filter((s) => s.parentId === PARTNER_ID).map((s) => (
                            <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Address" className="sm:col-span-2"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
                  </FormGrid>
                )}
              </Panel>
            ) : null}

            {step === 1 ? (
              <Panel title="2 · Select Tests" description="Your contracted B2B prices with the B2C list price for reference">
                <div className="mb-3 flex items-center gap-2">
                  <SearchInput value={q} onChange={setQ} placeholder="Search tests… e.g. CBC, Thyroid, Vitamin" className="flex-1" />
                  <Badge variant="outline" className="whitespace-nowrap">{sel.length} selected</Badge>
                </div>
                <div className="max-h-80 space-y-1 overflow-y-auto rounded-lg border p-2">
                  {filteredTests.map((t) => {
                    const checked = sel.some((s) => s.code === t.code);
                    const b2b = priceFor(t.code, "B2B", PARTNER_ID);
                    return (
                      <label key={t.code} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-slate-50">
                        <Checkbox checked={checked} onCheckedChange={() => toggleTest(t.code)} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{t.name} <span className="ml-1 font-mono text-[10px] text-slate-400">{t.code}</span></p>
                          <p className="truncate text-[11px] text-muted-foreground">{t.department} · {t.sampleType} · TAT {t.tatHours}h</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="block text-xs text-slate-400 line-through">{inr(t.b2cPrice)}</span>
                          <Money value={b2b} className="text-sm text-violet-700" />
                        </div>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs text-violet-900">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Prices shown are from your contracted rate card ({partner.pricingTier}). Apex central-lab cost prices are never displayed on this portal.
                </div>
              </Panel>
            ) : null}

            {step === 2 ? (
              <Panel title="3 · Confirm & Generate" description="Summary, B2B billing and barcode generation">
                <div className="space-y-1 rounded-lg border p-3 text-sm">
                  <p className="font-medium">{patientName} <span className="text-xs text-muted-foreground">· {patientAgeSex} · {mode === "existing" ? patientDisplay?.source : form.source}</span></p>
                  <table className="mt-2 w-full text-xs">
                    <thead>
                      <tr className="border-b bg-slate-50 text-left uppercase text-slate-500">
                        <th className="px-2 py-1.5 font-semibold">Test</th>
                        <th className="px-2 py-1.5 text-right font-semibold">B2C List</th>
                        <th className="px-2 py-1.5 text-right font-semibold">My B2B Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sel.map((s) => (
                        <tr key={s.code} className="border-b border-slate-100">
                          <td className="px-2 py-1.5">{s.name}</td>
                          <td className="px-2 py-1.5 text-right text-slate-400 line-through">{inr(s.list)}</td>
                          <td className="px-2 py-1.5 text-right font-semibold tabular-nums">{inr(s.rate)}</td>
                        </tr>
                      ))}
                      {sel.length === 0 ? (
                        <tr><td colSpan={3} className="px-2 py-3 text-center text-muted-foreground">No tests selected — go back to step 2.</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                  <div className="mt-2 space-y-1 border-t border-dashed pt-2 text-xs">
                    <div className="flex justify-between text-muted-foreground"><span>Gross (B2C list value)</span><span className="tabular-nums">{inr(listGross)}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Partner rate-card saving</span><span className="tabular-nums text-emerald-600">− {inr(savings)}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Net B2B subtotal</span><span className="tabular-nums">{inr(b2bGross)}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>GST @ 18%</span><span className="tabular-nums">{inr(gst)}</span></div>
                    <div className="flex justify-between pt-1 text-sm font-bold"><span>Net Payable</span><Money value={net} /></div>
                  </div>
                </div>
                <FormGrid cols={2} className="mt-4">
                  <Field label="Payment Mode" required hint="Credit is billed to your weekly account statement">
                    <Select value={payMode} onValueChange={setPayMode}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Credit">Credit — B2B account (default)</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                        <SelectItem value="NetBanking">NetBanking / NEFT</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Amount Billed"><Input readOnly value={inr(net)} className="font-semibold" /></Field>
                </FormGrid>
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs leading-relaxed text-violet-900">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  On confirm: order <b>{orderId}</b> is created for {partner.name}, sample <b>{sampleId}</b> is allocated with barcode labels, and the amount is posted to your ledger {payMode === "Credit" ? "on credit (due 12 Oct 2026)" : `against ${payMode} collection`}.
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
                  <Button disabled={sel.length === 0} className="bg-violet-600 text-white hover:bg-violet-700" onClick={() => setDone(true)}>
                    <CreditCard className="mr-1.5 h-4 w-4" /> Confirm Booking
                  </Button>
                </div>
              </Panel>
            ) : null}

            <div className="flex justify-between">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}><ChevronLeft className="mr-1 h-4 w-4" /> Previous</Button>
              {step < 2 ? <Button className="bg-violet-600 text-white hover:bg-violet-700" onClick={() => setStep(step + 1)}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button> : null}
            </div>
          </div>

          {/* Summary rail */}
          <div className="space-y-4">
            <Panel title="Order Summary" description={`${sel.length} test(s) at partner rates`}>
              {sel.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No tests selected yet.<br />Go to &quot;Select Tests&quot;.</p>
              ) : (
                <ul className="space-y-2">
                  {sel.map((s) => (
                    <li key={s.code} className="flex items-start justify-between gap-2 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground">List {inr(s.list)} · you save {inr(s.list - s.rate)}</p>
                      </div>
                      <Money value={s.rate} className="shrink-0 text-violet-700" />
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 space-y-1 border-t border-dashed pt-3 text-sm">
                <div className="flex justify-between text-xs text-muted-foreground"><span>Net B2B subtotal</span><span className="tabular-nums">{inr(b2bGross)}</span></div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>GST @ 18%</span><span className="tabular-nums">{inr(gst)}</span></div>
                <div className="flex justify-between pt-1 text-base font-bold"><span>Net Payable</span><Money value={net} /></div>
              </div>
            </Panel>
            <Panel title="Billing Account">
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between"><span>Partner</span><span className="font-medium text-slate-700">{partner.name} ({partner.id})</span></div>
                <div className="flex items-center justify-between"><span>Pricing tier</span><span className="font-medium text-slate-700">{partner.pricingTier}</span></div>
                <div className="flex items-center justify-between"><span>Credit used</span><span className="font-medium text-slate-700">{inr(partner.outstanding)} / {inr(partner.creditLimit)}</span></div>
                <div className="flex items-center gap-1.5 pt-1 text-violet-700"><Lock className="h-3 w-3" /> Rate card managed by Apex Labs</div>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}

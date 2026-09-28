"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLisNav } from "@/components/lis/nav";
import { tests, priceFor, patientsForSubAgency, patientById } from "@/lib/lis/data";
import { inr } from "@/lib/lis/format";
import {
  Field, FormGrid, Money, PageHeader, Panel,
  PrintButton, SampleLabelCard, SearchInput,
} from "@/components/lis/widgets";
import { CheckCircle2, ChevronLeft, ChevronRight, FlaskConical, Home, IndianRupee, Info, UserPlus, Users } from "lucide-react";

// ---------- Agency scope (demo: XYZ Collection Centre) ----------
const AGENCY_ID = "SUB-001";
const AGENCY_NAME = "XYZ Collection Centre";

const agencyPatients = patientsForSubAgency(AGENCY_ID);

interface Sel { code: string; name: string; cost: number; patientPay: number }

const STEPS = ["Patient", "Tests & Confirm"];

export function AgencyOrderNewView() {
  const { go } = useLisNav();
  const [step, setStep] = React.useState(0);
  const [done, setDone] = React.useState(false);

  // Step 1 — patient
  const [mode, setMode] = React.useState<"existing" | "new">("existing");
  const [existingId, setExistingId] = React.useState("PAT-00127");
  const [form, setForm] = React.useState({
    name: "Farida Ansari", dob: "1990-02-11", gender: "Female",
    mobile: "+91 98331 22110", email: "farida.a@gmail.com",
    address: "702, Raheja Vihar, Powai, Mumbai", idProof: "Aadhaar XXXX 9031",
  });

  // Step 2 — tests at SUB-001 prices
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState<Sel[]>([
    { code: "HBA1C", name: "Glycosylated Haemoglobin (HbA1c)", cost: 295, patientPay: 450 },
    { code: "FBS", name: "Fasting Blood Sugar (Glucose Fasting)", cost: 95, patientPay: 120 },
    { code: "VITD", name: "Vitamin D (25-OH)", cost: 730, patientPay: 1300 },
  ]);

  const activeTests = tests.filter(
    (t) => t.status === "Active" && (q === "" || `${t.code} ${t.name} ${t.department}`.toLowerCase().includes(q.toLowerCase())),
  );

  const toggleTest = (code: string, name: string) => {
    setSel((cur) => {
      if (cur.some((s) => s.code === code)) return cur.filter((s) => s.code !== code);
      return [...cur, { code, name, cost: priceFor(code, "SUB", AGENCY_ID), patientPay: priceFor(code, "B2C") }];
    });
  };

  const costSubtotal = sel.reduce((a, s) => a + s.cost, 0);
  const costGst = Math.round(costSubtotal * 0.18);
  const patientSubtotal = sel.reduce((a, s) => a + s.patientPay, 0);
  const patientGst = Math.round(patientSubtotal * 0.18);
  const margin = patientSubtotal - costSubtotal;

  const patientDisplay = mode === "existing" ? patientById(existingId) : null;
  const patientName = mode === "existing" ? patientDisplay?.name ?? "" : form.name;
  const patientAgeSex = mode === "existing"
    ? `${patientDisplay?.age}y / ${patientDisplay?.gender === "Male" ? "M" : "F"}`
    : "35y / F";

  const orderId = "ORD-20260928-00126";
  const sampleId = "SMP-20260928-00912";

  return (
    <div className="space-y-5">
      <PageHeader
        title="New Test Order"
        subtitle={`Book a walk-in at ${AGENCY_NAME} — your own SUB-001 rate card applies`}
        icon={<UserPlus className="h-5 w-5" />}
        actions={<Button variant="outline" onClick={() => go("agency/orders")}><ChevronLeft className="mr-1 h-4 w-4" /> Back to Orders</Button>}
      />

      {/* Stepper */}
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-3">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => !done && setStep(i)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                i === step && !done ? "bg-amber-600 text-white" : done || i < step ? "bg-amber-50 text-amber-800" : "text-slate-500"
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i === step ? "bg-white/20" : done || i < step ? "bg-amber-600 text-white" : "bg-slate-200"}`}>
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
                <p className="text-base font-semibold text-emerald-900">Order booked for your centre</p>
                <p className="text-sm text-emerald-800">
                  Order <b>{orderId}</b> created · Sample <b>{sampleId}</b> allocated. Hand the barcode-labelled tubes to the
                  LabRunners rider at today&apos;s 5:00 pm pickup. SMS + WhatsApp confirmation sent to the patient.
                </p>
              </div>
              <Button onClick={() => go("agency/orders")}>Go to Orders</Button>
            </div>
          </Panel>
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Order Summary" className="lg:col-span-2">
              <FormGrid cols={2}>
                <Field label="Patient"><Input readOnly value={`${patientName} (${mode === "existing" ? patientDisplay?.id : "new registration"})`} /></Field>
                <Field label="Channel"><Input readOnly value={`Sub-Agency — ${AGENCY_NAME} (SUB-001)`} /></Field>
                <Field label="Billed to your Apex account"><Input readOnly value={inr(costSubtotal + costGst)} className="font-semibold" /></Field>
                <Field label="Collected from patient"><Input readOnly value={inr(patientSubtotal + patientGst)} className="font-semibold" /></Field>
              </FormGrid>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline" className="font-mono">{orderId}</Badge>
                <Badge variant="outline" className="font-mono">{sampleId}</Badge>
              </div>
            </Panel>
            <Panel title="Print Barcode Label" description="Affix on every tube of this sample">
              <SampleLabelCard
                sampleId={sampleId} patientName={patientName} ageSex={patientAgeSex}
                type="Whole Blood EDTA" container="EDTA Vacutainer (Lavender)"
                tests={sel.map((s) => s.code).join(", ")} collectedAt="28 Sep 2026, 12:10 pm"
                source={`${AGENCY_NAME} (via ABC Diagnostics)`}
              />
              <div className="mt-3 flex justify-end"><PrintButton label="Print Label" /></div>
            </Panel>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {step === 0 ? (
              <Panel title="1 · Patient" description="Pick a patient registered by your agency, or register a new walk-in">
                <div className="mb-4 flex gap-2">
                  <Button size="sm" variant={mode === "existing" ? "default" : "outline"} onClick={() => setMode("existing")}><Users className="mr-1.5 h-3.5 w-3.5" /> My Patients</Button>
                  <Button size="sm" variant={mode === "new" ? "default" : "outline"} onClick={() => setMode("new")}><UserPlus className="mr-1.5 h-3.5 w-3.5" /> Register New</Button>
                </div>
                {mode === "existing" ? (
                  <FormGrid cols={2}>
                    <Field label="Select Patient" required>
                      <Select value={existingId} onValueChange={setExistingId}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {agencyPatients.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.id} — {p.name} ({p.mobile})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Record" hint="Auto-filled from your agency patient list">
                      <Input readOnly value={`${patientDisplay?.name} · ${patientDisplay?.age}y ${patientDisplay?.gender} · ${patientDisplay?.mobile}`} />
                    </Field>
                  </FormGrid>
                ) : (
                  <FormGrid cols={2}>
                    <Field label="Full Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                    <Field label="Date of Birth" required><Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></Field>
                    <Field label="Gender" required>
                      <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                      </Select>
                    </Field>
                    <Field label="Mobile" required><Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></Field>
                    <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                    <Field label="ID Proof"><Input value={form.idProof} onChange={(e) => setForm({ ...form, idProof: e.target.value })} /></Field>
                    <Field label="Address" className="sm:col-span-2"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
                  </FormGrid>
                )}
              </Panel>
            ) : null}

            {step === 1 ? (
              <Panel title="2 · Select Tests & Confirm" description="Priced from your SUB-001 rate card — the patient-pay list price is shown for your margin">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <SearchInput value={q} onChange={setQ} placeholder="Search tests… e.g. CBC, Thyroid, Vitamin" className="sm:flex-1" />
                  <Badge variant="outline" className="whitespace-nowrap">{sel.length} selected</Badge>
                </div>
                <div className="max-h-80 space-y-1 overflow-y-auto rounded-lg border p-2">
                  {activeTests.map((t) => {
                    const checked = sel.some((s) => s.code === t.code);
                    const hasRate = priceFor(t.code, "SUB", AGENCY_ID) !== t.b2cPrice;
                    return (
                      <label key={t.code} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-slate-50">
                        <Checkbox checked={checked} onCheckedChange={() => toggleTest(t.code, t.name)} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{t.name} <span className="ml-1 font-mono text-[10px] text-slate-400">{t.code}</span></p>
                          <p className="truncate text-[11px] text-muted-foreground">{t.department} · TAT {t.tatHours}h{hasRate ? " · contracted rate" : " · no agency rate — list applies"}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold tabular-nums text-amber-700">{inr(priceFor(t.code, "SUB", AGENCY_ID))}</p>
                          <p className="text-[10px] text-muted-foreground">patient pays {inr(priceFor(t.code, "B2C"))}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <p>
                    Tests with a contracted SUB-001 rate show your cost price. All other tests bill at the standard list price —
                    ABC Diagnostics B2B and central lab rates are not visible to your agency.
                  </p>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setStep(0)}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
                  <Button disabled={sel.length === 0} onClick={() => setDone(true)}>
                    <FlaskConical className="mr-1.5 h-4 w-4" /> Confirm Booking
                  </Button>
                </div>
              </Panel>
            ) : null}
          </div>

          {/* Summary rail */}
          <div className="space-y-4">
            <Panel title="Billing Summary" description={`${sel.length} item(s) · SUB-001 rate card`}>
              {sel.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No tests selected yet.</p>
              ) : (
                <ul className="space-y-2">
                  {sel.map((s) => (
                    <li key={s.code} className="flex items-start justify-between gap-2 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          cost {inr(s.cost)} · patient pays {inr(s.patientPay)}
                        </p>
                      </div>
                      <Money value={s.cost} className="shrink-0 text-amber-700" />
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 space-y-1 border-t border-dashed pt-3 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Your cost (agency rate)</span><span className="tabular-nums font-medium">{inr(costSubtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">GST @ 18% on cost</span><span className="tabular-nums">{inr(costGst)}</span></div>
                <div className="flex justify-between border-b border-dashed pb-2"><span className="text-muted-foreground">Billed to Apex account</span><span className="tabular-nums font-bold text-amber-700">{inr(costSubtotal + costGst)}</span></div>
                <div className="flex justify-between pt-1"><span className="text-muted-foreground">Patient pays (list + GST)</span><span className="tabular-nums font-bold text-emerald-700">{inr(patientSubtotal + patientGst)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Your margin (excl. GST)</span><span className="tabular-nums font-semibold text-emerald-700">{inr(margin)}</span></div>
              </div>
            </Panel>
            <Panel title="Good to Know">
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><Home className="h-3.5 w-3.5 text-amber-600" /> Home collection available via your centre (+₹100 visit fee)</div>
                <div className="flex items-center gap-1.5"><FlaskConical className="h-3.5 w-3.5 text-amber-600" /> Sample ID + barcode allocated on confirm</div>
                <div className="flex items-center gap-1.5"><IndianRupee className="h-3.5 w-3.5 text-amber-600" /> Monthly credit settlement with ABC Diagnostics</div>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}

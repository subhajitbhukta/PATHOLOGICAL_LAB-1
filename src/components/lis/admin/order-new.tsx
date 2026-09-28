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
import { doctors, patients, tests, packages, partners, priceFor, patientById } from "@/lib/lis/data";
import { inr } from "@/lib/lis/format";
import {
  Barcode, ChannelPill, FormGrid, Field, Money, PageHeader, Panel, SampleLabelCard, StatusPill,
} from "@/components/lis/widgets";
import { InvoiceDialog } from "@/components/lis/report-sheet";
import type { InvoiceViewData } from "@/components/lis/report-sheet";
import {
  CheckCircle2, ChevronLeft, ChevronRight, CreditCard, FlaskConical, Home, IndianRupee,
  ReceiptText, UserPlus, Users,
} from "lucide-react";

const STEPS = ["Patient Information", "Select Tests", "Pricing & Discount", "Payment & Confirm"];

interface Sel { code: string; name: string; type: "Test" | "Package"; rate: number }

export function AdminOrderNewView() {
  const { go } = useLisNav();
  const [step, setStep] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [invoice, setInvoice] = React.useState<InvoiceViewData | null>(null);

  // Step 1 — patient
  const [mode, setMode] = React.useState<"new" | "existing">("new");
  const [existingId, setExistingId] = React.useState("PAT-00124");
  const [form, setForm] = React.useState({ name: "Aarti Rane", dob: "1994-05-18", gender: "Female", mobile: "+91 98331 22100", email: "aarti.rane@gmail.com", address: "602, Sai Darshan, Marol, Andheri East", idProof: "Aadhaar XXXX 9031", source: "B2C Walk-in" });
  const [channel, setChannel] = React.useState<"B2C" | "B2B">("B2C");
  const [partnerId, setPartnerId] = React.useState("B2B-001");

  // Step 2 — tests
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState<Sel[]>([
    { code: "CBC", name: "Complete Blood Count", type: "Test", rate: 350 },
    { code: "TSH", name: "TSH (Ultrasensitive)", type: "Test", rate: 400 },
    { code: "HBA1C", name: "HbA1c", type: "Test", rate: 450 },
  ]);

  // Step 3 — pricing
  const [discountPct, setDiscountPct] = React.useState(5);

  // Step 4 — payment
  const [payMode, setPayMode] = React.useState("UPI");
  const [homeCollection, setHomeCollection] = React.useState(true);

  const scopePrice = (code: string) => {
    if (channel === "B2C") return priceFor(code, "B2C");
    return priceFor(code, "B2B", partnerId);
  };

  const filteredTests = tests.filter((t) => t.status === "Active" && (q === "" || `${t.code} ${t.name} ${t.department}`.toLowerCase().includes(q.toLowerCase())));

  const toggleTest = (code: string, name: string) => {
    setSel((cur) => {
      if (cur.some((s) => s.code === code)) return cur.filter((s) => s.code !== code);
      return [...cur, { code, name, type: "Test" as const, rate: scopePrice(code) }];
    });
  };

  const togglePackage = (code: string, name: string, price: number) => {
    setSel((cur) => {
      if (cur.some((s) => s.code === code)) return cur.filter((s) => s.code !== code);
      return [...cur, { code, name, type: "Package" as const, rate: price }];
    });
  };

  const gross = sel.reduce((a, s) => a + s.rate, 0);
  const discount = Math.round((gross * discountPct) / 100);
  const taxable = gross - discount;
  const gst = Math.round(taxable * 0.18);
  const net = taxable + gst;

  const patientDisplay = mode === "existing" ? patientById(existingId) : null;

  const orderId = `ORD-20260928-00126`;
  const sampleId = `SMP-20260928-00912`;

  const generate = () => {
    setDone(true);
    setInvoice({
      id: "INV-2026-01185", date: "2026-09-28", scope: channel === "B2C" ? "Patient" : "B2B",
      billTo: mode === "existing" ? patientDisplay?.name ?? "" : form.name,
      billToSub: channel === "B2B" ? partners.find((p) => p.id === partnerId)?.name : undefined,
      gstin: channel === "B2C" ? "—" : "27AAACA1234B1Z2",
      lines: sel.map((s) => ({ description: s.name, hsn: "999311", qty: 1, rate: s.rate })),
      subtotal: gross, discount, taxable, cgst: Math.round(gst / 2), sgst: Math.round(gst / 2),
      total: net, paid: payMode === "Credit" ? 0 : net, due: payMode === "Credit" ? net : 0,
      mode: payMode, status: payMode === "Credit" ? "Credit" : "Paid", orderId,
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Central Patient Entry"
        subtitle="Registration → Test selection → Pricing → Payment → Invoice + Sample ID + Barcode"
        icon={<UserPlus className="h-5 w-5" />}
        actions={<Button variant="outline" onClick={() => go("admin/orders")}><ChevronLeft className="mr-1 h-4 w-4" /> Back to Orders</Button>}
      />

      {/* Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-3">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => !done && setStep(i)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                i === step && !done ? "bg-teal-600 text-white" : done || i < step ? "bg-teal-50 text-teal-800" : "text-slate-500"
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i === step ? "bg-white/20" : done || i < step ? "bg-teal-600 text-white" : "bg-slate-200"}`}>
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
                <p className="text-base font-semibold text-emerald-900">Order booked successfully</p>
                <p className="text-sm text-emerald-800">Invoice generated, Sample ID assigned and barcode printed. Workflow: Booking Confirmed → Sample Collection.</p>
              </div>
              <Button onClick={() => go("admin/orders")}>Go to Orders</Button>
            </div>
          </Panel>
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Order & Invoice" className="lg:col-span-2">
              <div className="space-y-3 text-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="font-mono">{orderId}</Badge>
                  <Badge variant="outline" className="font-mono">{sampleId}</Badge>
                  <InvoiceViewButton onClick={() => setInvoice(invoice)} />
                </div>
                <FormGrid cols={2}>
                  <Field label="Patient"><Input readOnly value={mode === "existing" ? `${patientDisplay?.name} (${patientDisplay?.id})` : form.name} /></Field>
                  <Field label="Channel"><Input readOnly value={channel === "B2C" ? "B2C — Direct Patient" : `B2B — ${partners.find((p) => p.id === partnerId)?.name}`} /></Field>
                  <Field label="Net Amount"><Input readOnly value={inr(net)} className="font-semibold" /></Field>
                  <Field label="Payment"><Input readOnly value={`${payMode} · ${payMode === "Credit" ? "Billed to partner" : "Paid"}`} /></Field>
                </FormGrid>
              </div>
            </Panel>
            <Panel title="Print Barcode Label" description="Affix on every tube of this sample">
              <SampleLabelCard
                sampleId={sampleId} patientName={mode === "existing" ? patientDisplay?.name ?? "" : form.name}
                ageSex={mode === "existing" ? `${patientDisplay?.age}y / ${patientDisplay?.gender === "Male" ? "M" : "F"}` : "31y / F"}
                type="Whole Blood EDTA" container="EDTA Vacutainer (Lavender)"
                tests={sel.map((s) => s.code).join(", ")} collectedAt="28 Sep 2026, 11:30 am"
                source={channel === "B2C" ? "B2C Walk-in" : partners.find((p) => p.id === partnerId)?.name}
              />
            </Panel>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Main form column */}
          <div className="space-y-4 lg:col-span-2">
            {step === 0 ? (
              <Panel title="1 · Patient Information" description="Register a new patient or attach to an existing record">
                <div className="mb-4 flex gap-2">
                  <Button size="sm" variant={mode === "new" ? "default" : "outline"} onClick={() => setMode("new")}><UserPlus className="mr-1.5 h-3.5 w-3.5" /> New Patient</Button>
                  <Button size="sm" variant={mode === "existing" ? "default" : "outline"} onClick={() => setMode("existing")}><Users className="mr-1.5 h-3.5 w-3.5" /> Existing Patient</Button>
                </div>
                {mode === "existing" ? (
                  <FormGrid cols={2}>
                    <Field label="Select Patient" required>
                      <Select value={existingId} onValueChange={setExistingId}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {patients.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.id} — {p.name} ({p.mobile})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Record" hint="Auto-filled from patient master">
                      <Input readOnly value={`${patientDisplay?.name} · ${patientDisplay?.age}y ${patientDisplay?.gender} · ${patientDisplay?.source}`} />
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
                    <Field label="Referring Source" hint="Doctor / B2B / walk-in">
                      <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B2C Walk-in">B2C Walk-in</SelectItem>
                          {doctors.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                          {partners.filter((p) => p.status === "Active").map((p) => <SelectItem key={p.id} value={p.name}>{p.name} (B2B)</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                  </FormGrid>
                )}
              </Panel>
            ) : null}

            {step === 1 ? (
              <Panel title="2 · Select Tests" description="Search the test master, packages or profiles — prices auto-resolve by channel">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row">
                  <Input placeholder="Search tests / packages… e.g. CBC, Thyroid, Full Body" value={q} onChange={(e) => setQ(e.target.value)} />
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="whitespace-nowrap">{sel.length} selected</Badge>
                  </div>
                </div>
                <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border p-2">
                  {filteredTests.map((t) => {
                    const checked = sel.some((s) => s.code === t.code);
                    return (
                      <label key={t.code} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-slate-50">
                        <Checkbox checked={checked} onCheckedChange={() => toggleTest(t.code, t.name)} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{t.name} <span className="ml-1 font-mono text-[10px] text-slate-400">{t.code}</span></p>
                          <p className="truncate text-[11px] text-muted-foreground">{t.department} · {t.sampleType} · TAT {t.tatHours}h</p>
                        </div>
                        <Money value={scopePrice(t.code)} className="text-sm" />
                      </label>
                    );
                  })}
                </div>
                <p className="mb-1.5 mt-4 text-xs font-semibold text-slate-700">Popular packages</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {packages.map((p) => {
                    const checked = sel.some((s) => s.code === p.code);
                    return (
                      <label key={p.code} className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 ${checked ? "border-teal-400 bg-teal-50/50" : "border-slate-200"}`}>
                        <Checkbox className="mt-0.5" checked={checked} onCheckedChange={() => togglePackage(p.code, p.name, p.b2cPrice)} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.tests.length} tests · {p.includes}</p>
                        </div>
                        <Money value={p.b2cPrice} className="text-sm" />
                      </label>
                    );
                  })}
                </div>
              </Panel>
            ) : null}

            {step === 2 ? (
              <Panel title="3 · Pricing & Discount" description="Rates resolved from the pricing engine by channel & partner">
                <FormGrid cols={2}>
                  <Field label="Billing Channel" required>
                    <RadioGroup value={channel} onValueChange={(v) => setChannel(v as "B2C" | "B2B")} className="flex gap-4 pt-1">
                      <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="B2C" /> B2C — Direct Patient</label>
                      <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="B2B" /> B2B — Partner Price</label>
                    </RadioGroup>
                  </Field>
                  {channel === "B2B" ? (
                    <Field label="B2B Partner" required hint="Partner-specific price list applies">
                      <Select value={partnerId} onValueChange={setPartnerId}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{partners.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                  ) : (
                    <Field label="B2C List Price" hint="Patient pays published MRP list">
                      <Input readOnly value="Standard B2C price list" />
                    </Field>
                  )}
                  <Field label="Discount %" hint="Staff discount within approved limit (max 20%)">
                    <Input type="number" min={0} max={20} value={discountPct} onChange={(e) => setDiscountPct(Number(e.target.value))} />
                  </Field>
                  <Field label="Home Collection">
                    <RadioGroup value={homeCollection ? "yes" : "no"} onValueChange={(v) => setHomeCollection(v === "yes")} className="flex gap-4 pt-1">
                      <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="yes" /> Yes (+₹100 visit fee)</label>
                      <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="no" /> No</label>
                    </RadioGroup>
                  </Field>
                </FormGrid>
                {channel === "B2B" ? (
                  <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs text-violet-800">
                    B2B billing uses the partner&apos;s contracted rate card (credit settlement as per terms). Patient invoice is raised to the partner.
                  </div>
                ) : null}
              </Panel>
            ) : null}

            {step === 3 ? (
              <Panel title="4 · Payment & Confirm" description="Collect payment, generate invoice, sample ID and barcode">
                <FormGrid cols={2}>
                  <Field label="Payment Mode" required>
                    <Select value={payMode} onValueChange={setPayMode}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UPI">UPI (GPay / PhonePe / Paytm)</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Card">Card (Swipe)</SelectItem>
                        <SelectItem value="NetBanking">NetBanking / NEFT</SelectItem>
                        <SelectItem value="Credit">Credit — B2B account</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Amount Collected"><Input readOnly value={inr(net)} className="font-semibold" /></Field>
                </FormGrid>
                <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50/60 p-3 text-xs leading-relaxed text-teal-900">
                  On confirm: Tax invoice <b>INV-2026-01185</b> is generated (GST 18% split CGST+SGST), Sample ID <b>{sampleId}</b> allocated,
                  barcode label queued to printer, booking SMS + WhatsApp sent to the patient.
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setStep(2)}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
                  <Button onClick={generate}><CreditCard className="mr-1.5 h-4 w-4" /> Confirm Booking & Generate Invoice</Button>
                </div>
              </Panel>
            ) : null}

            <div className="flex justify-between">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}><ChevronLeft className="mr-1 h-4 w-4" /> Previous</Button>
              {step < 3 ? <Button onClick={() => setStep(step + 1)}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button> : null}
            </div>
          </div>

          {/* Summary rail */}
          <div className="space-y-4">
            <Panel title="Order Summary" description={`${sel.length} item(s)`}>
              {sel.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No tests selected yet.<br />Go to “Select Tests”.</p>
              ) : (
                <ul className="space-y-2">
                  {sel.map((s) => (
                    <li key={s.code} className="flex items-start justify-between gap-2 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground">{s.type} · {s.code}</p>
                      </div>
                      <Money value={s.rate} className="shrink-0" />
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 space-y-1 border-t border-dashed pt-3 text-sm">
                <div className="flex justify-between text-xs text-muted-foreground"><span>Gross</span><span className="tabular-nums">{inr(gross)}</span></div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>Discount ({discountPct}%)</span><span className="tabular-nums text-rose-600">− {inr(discount)}</span></div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>GST @ 18%</span><span className="tabular-nums">{inr(gst)}</span></div>
                <div className="flex justify-between pt-1 text-base font-bold"><span>Net Payable</span><Money value={net} /></div>
              </div>
            </Panel>
            <Panel title="Channel Preview">
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between"><span>Channel</span><ChannelPill channel={channel === "B2C" ? "B2C" : "B2B"} /></div>
                <div className="flex items-center justify-between"><span>Patient sees</span><Money value={sel.reduce((a, s) => a + priceFor(s.code, "B2C"), 0) || undefined} /></div>
                <div className="flex items-center justify-between"><span>Partner billed</span><Money value={sel.reduce((a, s) => a + (channel === "B2B" ? priceFor(s.code, "B2B", partnerId) : s.rate), 0) || undefined} /></div>
                {homeCollection ? <div className="flex items-center gap-1.5 text-teal-700"><Home className="h-3 w-3" /> Home collection visit scheduled</div> : null}
                <div className="flex items-center gap-1.5 text-teal-700"><FlaskConical className="h-3 w-3" /> Sample ID allocated on confirm</div>
                <div className="flex items-center gap-1.5 text-teal-700"><IndianRupee className="h-3 w-3" /> GST invoice auto-generated</div>
              </div>
            </Panel>
          </div>
        </div>
      )}

      <InvoiceDialog open={!!invoice} onOpenChange={(o) => !o && setInvoice(null)} data={invoice} />
    </div>
  );
}

function InvoiceViewButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}><ReceiptText className="mr-1 h-3.5 w-3.5" /> View Invoice</Button>
  );
}

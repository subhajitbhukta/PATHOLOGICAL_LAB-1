"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLisNav } from "@/components/lis/nav";
import { appointments, patientById } from "@/lib/lis/data";
import { fmtDate } from "@/lib/lis/format";
import { Field, PageHeader, Panel, StatusPill, Timeline } from "@/components/lis/widgets";
import { CalendarDays, CalendarPlus, CheckCircle2, Clock, Home, MapPin, User } from "lucide-react";

const PATIENT_ID = "PAT-00124";
const me = patientById(PATIENT_ID);

const myAppointments = appointments
  .filter((a) => a.patientId === PATIENT_ID)
  .sort((a, b) => (a.date < b.date ? 1 : -1));

const SLOTS = ["06:00 – 06:30", "06:30 – 07:00", "07:00 – 07:30", "07:30 – 08:00", "08:00 – 08:30"];

export function PatientAppointmentsView() {
  const { go } = useLisNav();
  const [bookOpen, setBookOpen] = React.useState(false);
  const [bookDone, setBookDone] = React.useState(false);

  const upcoming = myAppointments.filter((a) => a.status === "Scheduled");
  const past = myAppointments.filter((a) => a.status !== "Scheduled");

  return (
    <div className="space-y-5">
      <PageHeader
        title="Appointments"
        subtitle="Home visits and centre slots — reschedule anytime up to 2 hours before"
        icon={<CalendarDays className="h-5 w-5" />}
        actions={<Button onClick={() => { setBookDone(false); setBookOpen(true); }}><CalendarPlus className="mr-1.5 h-4 w-4" /> Book Home Visit</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Upcoming */}
        <div className="space-y-4 lg:col-span-2">
          {upcoming.map((a) => (
            <Panel key={a.id} className="border-emerald-300 bg-emerald-50/40">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="rounded-xl bg-emerald-600 p-3 text-center text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-wide">Home Visit</p>
                  <p className="text-xl font-bold leading-tight">{fmtDate(a.date).slice(0, 6)}</p>
                  <p className="text-[10px]">{a.slot}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{a.tests}</p>
                    <StatusPill status={a.status} />
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" /> {a.address}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="h-3.5 w-3.5 text-emerald-600" /> Phlebotomist {a.phlebotomist} · arrives within your slot
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-emerald-600" /> Fasting? Only water after 10 pm the night before
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <Button size="sm" variant="outline">Reschedule</Button>
                  <Button size="sm" variant="ghost" className="text-rose-600 hover:text-rose-700">Cancel</Button>
                </div>
              </div>
            </Panel>
          ))}

          <Panel title="Past Appointments" description="Your visit history">
            <ul className="space-y-2.5">
              {past.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{a.tests}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {fmtDate(a.date)} · {a.slot} · {a.phlebotomist !== "—" ? `Phlebotomist ${a.phlebotomist}` : "Centre visit"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {a.status === "Completed" && a.id === "APT-2026-0809" ? (
                      <Button variant="outline" size="sm" className="h-7" onClick={() => go("patient/reports")}>View Report</Button>
                    ) : null}
                    <StatusPill status={a.status} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <Panel title="Your Visit Journey">
            <Timeline
              items={[
                { label: "You book a slot", time: "Instant confirmation", note: "SMS + WhatsApp" },
                { label: "Phlebotomist assigned", time: "2 hrs before", note: "Name & photo shared" },
                { label: "Sample collected at home", time: "Within your slot", note: "Single-use sterile kit" },
                { label: "Report delivered", time: "Same day / 24 hrs", note: "WhatsApp + portal" },
              ]}
            />
          </Panel>

          <Panel title="Home Visit Coverage">
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="flex items-start gap-2"><Home className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> Free above ₹500 · ₹100 fee for smaller bookings.</p>
              <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> Powai, Chandivali, Hiranandani, Marol — 6 am to 8 pm daily.</p>
              <p className="flex items-start gap-2"><Badge className="hidden" /> All phlebotomists are certified and background-verified.</p>
            </div>
          </Panel>
        </div>
      </div>

      {/* Book home visit dialog */}
      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Book Home Visit</DialogTitle>
            <DialogDescription className="text-xs">A certified phlebotomist will visit your address in the chosen slot.</DialogDescription>
          </DialogHeader>
          {bookDone ? (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">Home visit requested</p>
                <p className="text-xs text-emerald-800">APT-2026-0821 · Wed, 30 Sep · 07:00 – 07:30. Confirmation SMS sent to {me?.mobile}.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date" required><Input type="date" defaultValue="2026-09-30" /></Field>
                <Field label="Slot" required>
                  <Select defaultValue={SLOTS[2]}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SLOTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Tests" required className="sm:col-span-2" hint="Comma separated — e.g. Vitamin D, Vitamin B12">
                  <Input defaultValue="Vitamin D + Vitamin B12" />
                </Field>
                <Field label="Address" required className="sm:col-span-2"><Input defaultValue={`${me?.address}, ${me?.city}`} /></Field>
                <Field label="Note for phlebotomist" className="sm:col-span-2"><Input defaultValue="Call on arrival, third floor, lift available" /></Field>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setBookOpen(false)}>Cancel</Button>
                <Button onClick={() => setBookDone(true)}><Home className="mr-1.5 h-4 w-4" /> Confirm Home Visit</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

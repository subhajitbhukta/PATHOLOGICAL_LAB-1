"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { patientById } from "@/lib/lis/data";
import { Field, FormGrid, KeyValue, PageHeader, Panel, StatusPill } from "@/components/lis/widgets";
import { BadgeCheck, Bell, Check, Home, Lock, MapPin, Phone, ShieldCheck, UserCircle2 } from "lucide-react";

const PATIENT_ID = "PAT-00124";

export function PatientProfileView() {
  const me = patientById(PATIENT_ID);
  const [edit, setEdit] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [form, setForm] = React.useState({
    name: me?.name ?? "",
    mobile: me?.mobile ?? "",
    email: me?.email ?? "",
    address: me?.address ?? "",
    city: me?.city ?? "",
    idProof: me?.idProof ?? "",
  });
  const [prefs, setPrefs] = React.useState({ sms: true, whatsapp: true, emailReports: true, promo: false });
  const [passwordOpen, setPasswordOpen] = React.useState(false);
  const [pwSaved, setPwSaved] = React.useState(false);

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Profile"
        subtitle="Personal details, ID proof, notification preferences and account security"
        icon={<UserCircle2 className="h-5 w-5" />}
        actions={
          !edit ? (
            <Button onClick={() => { setEdit(true); setSaved(false); }}>Edit Profile</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEdit(false)}>Cancel</Button>
              <Button onClick={() => { setEdit(false); setSaved(true); }}><Check className="mr-1.5 h-4 w-4" /> Save Changes</Button>
            </div>
          )
        }
      />

      {/* Identity card */}
      <div className="flex flex-col gap-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
          {me?.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-bold text-slate-900">{me?.name}</p>
            <Badge variant="outline" className="border-emerald-300 bg-white text-[10px] text-emerald-700"><BadgeCheck className="mr-1 h-3 w-3" /> Verified</Badge>
            <StatusPill status="Active" />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Patient ID <span className="font-mono font-semibold text-slate-700">{me?.id}</span> · {me?.age} yrs · {me?.gender} · Registered {me?.registeredOn} via {me?.source}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPasswordOpen(true)}><Lock className="mr-1 h-3.5 w-3.5" /> Change Password</Button>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          <Check className="h-3.5 w-3.5" /> Profile updated — reports will carry the new contact details.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Personal details */}
        <div className="lg:col-span-2">
          <Panel title="Personal Details" description="Used on bookings, invoices and released lab reports">
            <FormGrid cols={2}>
              <Field label="Full Name" required>
                <Input value={form.name} disabled={!edit} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Date of Birth">
                <Input value={me?.dob ?? ""} disabled />
              </Field>
              <Field label="Gender">
                <Input value={me?.gender ?? ""} disabled />
              </Field>
              <Field label="Mobile" required hint="OTP-verified for report delivery">
                <Input value={form.mobile} disabled={!edit} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="font-mono" />
              </Field>
              <Field label="Email">
                <Input value={form.email} disabled={!edit} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="ID Proof" hint="Aadhaar / DL masked on reports">
                <Input value={form.idProof} disabled={!edit} onChange={(e) => setForm({ ...form, idProof: e.target.value })} className="font-mono" />
              </Field>
              <Field label="Address" required>
                <Input value={form.address} disabled={!edit} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </Field>
              <Field label="City" required>
                <Input value={form.city} disabled={!edit} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </Field>
            </FormGrid>
            {!edit && (
              <p className="mt-3 text-[11px] text-muted-foreground">Click <span className="font-semibold text-slate-700">Edit Profile</span> to update contact details. DOB, gender and patient ID are fixed and can be corrected only by lab staff.</p>
            )}
          </Panel>
        </div>

        {/* Side cards */}
        <div className="space-y-4">
          <Panel title="Home Collection Address" description="Default for appointment bookings">
            <div className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-700">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
              <div>
                <p className="font-semibold">{form.address}</p>
                <p className="text-muted-foreground">{form.city} — 400601</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><Home className="h-3 w-3" /> Landmark: opposite Lotus Park gate 2</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-dashed pt-2.5 text-[11px]">
              <span className="text-muted-foreground">Preferred slot</span>
              <Badge variant="outline" className="text-[10px]">Morning · 6:30 – 8:00 AM</Badge>
            </div>
          </Panel>

          <Panel title="Notification Preferences" description="How you receive status alerts and reports">
            <div className="space-y-2.5">
              {([
                ["sms", "SMS alerts", "Booking, collection & report SMS"],
                ["whatsapp", "WhatsApp", "Report PDF + status on WhatsApp"],
                ["emailReports", "Email reports", "PDF copy to registered email"],
                ["promo", "Offers & health packages", "Occasional promotional messages"],
              ] as const).map(([key, label, hint]) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-slate-700">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{hint}</p>
                  </div>
                  <Switch checked={prefs[key]} onCheckedChange={(v) => setPrefs({ ...prefs, [key]: v })} />
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-start gap-1.5 border-t border-dashed pt-2.5 text-[10px] text-muted-foreground">
              <Bell className="mt-0.5 h-3 w-3 shrink-0" /> Report-ready alerts are always sent on at least one active channel.
            </div>
          </Panel>
        </div>
      </div>

      {/* Security & sessions */}
      <Panel title="Security & Sessions" description="Account activity and linked logins">
        <div className="grid gap-4 lg:grid-cols-2">
          <KeyValue
            cols={2}
            items={[
              { label: "Last login", value: "2026-09-28 07:42 · Mobile app" },
              { label: "Registered mobile", value: <span className="font-mono">{me?.mobile}</span> },
              { label: "Two-factor auth", value: <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700">Enabled · SMS OTP</Badge> },
              { label: "Active sessions", value: "2 (this device, WhatsApp)" },
            ]}
          />
          <div className="space-y-2 rounded-lg border border-slate-200 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"><ShieldCheck className="h-3.5 w-3.5 text-teal-700" /> Privacy</p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Your reports are accessible only through this login and your QR-secured report link. Lab staff access is audit-logged, and ID-proof numbers are always masked on printed reports.
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Phone className="h-3 w-3" /> Data correction requests: privacy@apexlabs.in</p>
          </div>
        </div>
      </Panel>

      {/* Change password dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Passwords expire every 180 days as per policy.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Current Password" required><Input type="password" defaultValue="········" /></Field>
            <Field label="New Password" required hint="Min 8 chars, 1 capital, 1 number, 1 symbol"><Input type="password" placeholder="New password" /></Field>
            <Field label="Confirm New Password" required><Input type="password" placeholder="Repeat password" /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordOpen(false)}>Cancel</Button>
            <Button onClick={() => { setPasswordOpen(false); setPwSaved(true); }}><Check className="mr-1.5 h-4 w-4" /> Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {pwSaved && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          <Lock className="h-3.5 w-3.5" /> Password updated — all other sessions were signed out.
        </div>
      )}
    </div>
  );
}

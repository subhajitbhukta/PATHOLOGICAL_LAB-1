"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLisNav } from "@/components/lis/nav";
import { patients } from "@/lib/lis/data";
import {
  ArrowRight, Building2, FlaskConical, HeartPulse, Network, ScanLine, ShieldCheck, Store,
} from "lucide-react";

const PORTALS = [
  {
    id: "admin" as const,
    title: "Super Admin — Central Lab",
    desc: "Full LIS control: masters, pricing engine, sample chain, result entry, verification, billing, MIS.",
    user: "superadmin", pass: "apex@2026",
    icon: ShieldCheck, accent: "teal",
    bullets: ["Test & pricing masters", "Sample → Report workflow", "B2B + Sub-agency control"],
    cta: "Enter Admin Console",
  },
  {
    id: "b2b" as const,
    title: "B2B Partner Portal",
    desc: "Collection centres & diagnostic partners. Register patients, book tests at B2B prices, manage sub-agencies.",
    user: "abc.admin", pass: "abc@2026",
    icon: Building2, accent: "violet",
    bullets: ["ABC Diagnostics demo login", "Own price list only", "Ledger & pickups"],
    cta: "Enter B2B Portal",
  },
  {
    id: "agency" as const,
    title: "Sub-Agency Portal",
    desc: "Agencies under a B2B partner. Sees only its own applicable prices — never central or parent pricing.",
    user: "xyz.admin", pass: "xyz@2026",
    icon: Store, accent: "amber",
    bullets: ["XYZ Collection Centre demo", "Parent-restricted pricing", "Own patients & settlements"],
    cta: "Enter Sub-Agency Portal",
  },
  {
    id: "patient" as const,
    title: "Patient Portal (B2C)",
    desc: "Direct patients: book tests, home collection, track sample status, download QR-verified reports.",
    user: patientEmail(), pass: "patient@2026",
    icon: HeartPulse, accent: "emerald",
    bullets: [`${patients[0].name} demo login`, "Simple 5-step status", "Bills & history"],
    cta: "Enter Patient Portal",
  },
];

function patientEmail() {
  const p = patients[0];
  return p ? p.email.split("@")[0] : "rahul.sharma";
}

const ACCENT_CLASSES: Record<string, { ring: string; bg: string; text: string; btn: string; border: string }> = {
  teal: { ring: "hover:ring-teal-300", bg: "bg-teal-600", text: "text-teal-700", btn: "bg-teal-700 hover:bg-teal-800", border: "hover:border-teal-300" },
  violet: { ring: "hover:ring-violet-300", bg: "bg-violet-600", text: "text-violet-700", btn: "bg-violet-700 hover:bg-violet-800", border: "hover:border-violet-300" },
  amber: { ring: "hover:ring-amber-300", bg: "bg-amber-600", text: "text-amber-700", btn: "bg-amber-600 hover:bg-amber-700", border: "hover:border-amber-300" },
  emerald: { ring: "hover:ring-emerald-300", bg: "bg-emerald-600", text: "text-emerald-700", btn: "bg-emerald-700 hover:bg-emerald-800", border: "hover:border-emerald-300" },
};

export function LandingHub() {
  const { openPortal } = useLisNav();
  const [creds, setCreds] = React.useState<Record<string, { u: string; p: string }>>(
    Object.fromEntries(PORTALS.map((p) => [p.id, { u: p.user, p: p.pass }])),
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-lg font-bold text-white">A</div>
            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">ApexLIS</p>
              <p className="text-[11px] text-muted-foreground">Referral Lab Network Platform · Apex Reference Laboratories</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-[11px] text-muted-foreground sm:flex">
            <Network className="h-3.5 w-3.5" />
            Central Lab → B2B → Sub-Agency → Patient
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16 pt-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            One platform for your entire <span className="text-teal-700">referral lab network</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Barcode-scan driven test entry, vial &amp; volume guidance, hierarchical pricing, sample tracking, result
            entry, pathologist verification, QR-verified reports and multi-level billing — one continuous,
            traceable workflow.
            <span className="mt-1 block text-xs">UI prototype · choose a portal below to explore (demo credentials pre-filled)</span>
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {PORTALS.map((p) => {
            const a = ACCENT_CLASSES[p.accent];
            return (
              <div
                key={p.id}
                className={cn(
                  "flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-4 hover:ring-opacity-30",
                  a.border, a.ring,
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("rounded-xl p-2.5 text-white", a.bg)}><p.icon className="h-6 w-6" /></div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">{p.title}</h2>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{p.desc}</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-1">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className={cn("h-1.5 w-1.5 rounded-full", a.bg)} /> {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Login ID</Label>
                    <Input
                      value={creds[p.id].u}
                      onChange={(e) => setCreds({ ...creds, [p.id]: { ...creds[p.id], u: e.target.value } })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Password</Label>
                    <Input
                      type="password" value={creds[p.id].p}
                      onChange={(e) => setCreds({ ...creds, [p.id]: { ...creds[p.id], p: e.target.value } })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <Button className={cn("mt-4 w-full", a.btn)} onClick={() => openPortal(p.id)}>
                  {p.cta} <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-teal-200 bg-teal-50/50 p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <ScanLine className="h-4 w-4 text-teal-700" /> Barcode-first · vial-guided · the LIS never generates barcodes
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            Every tube carries a <b>pre-printed barcode label</b>. At entry the operator is guided by the test master —
            e.g. <b>Sugar → Plasma in Sodium Fluoride (Grey) vial · 3 mL</b>, <b>CBC → Whole Blood in EDTA (Lavender) vial · 5 mL</b> —
            then scans or types the vial’s barcode. The rider <b>scans each tube at pickup</b>, receiving verifies it against
            the order, and departments track it to the result. B2B &amp; Sub-Agency orders can be reported
            <b> with or without technical background</b>; B2C reports always carry the full background.
          </p>
        </div>

        <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-slate-200 bg-white p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <FlaskConical className="h-4 w-4 text-teal-700" /> The key differentiator — one continuous transaction
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
            {["Central Lab", "B2B Partner", "Sub-Agency", "Patient", "Sample & Barcode", "Logistics", "Laboratory", "Result Entry", "Pathologist", "QR Report", "Billing"].map((s, i) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className={cn("rounded-full px-2.5 py-1", i % 2 === 0 ? "bg-teal-50 text-teal-800" : "bg-violet-50 text-violet-800")}>{s}</span>
                {i < 10 ? <ArrowRight className="h-3 w-3 text-slate-300" /> : null}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Every order is traceable end-to-end across channels — with hierarchical pricing (Central → B2B → Sub-Agency → Patient),
            maker-checker result release, outsourced reference-lab jobs and multi-level settlement.
          </p>
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-4">
        <p className="text-center text-[11px] text-muted-foreground">
          ApexLIS UI Prototype — all names, patients and prices are sample data · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

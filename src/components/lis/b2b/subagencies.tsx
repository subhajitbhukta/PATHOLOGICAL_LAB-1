"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLisNav } from "@/components/lis/nav";
import { partners, settlements, subAgencies, users } from "@/lib/lis/data";
import { fmtDate, inr } from "@/lib/lis/format";
import {
  KeyValue, PageHeader, Panel, StatusPill,
} from "@/components/lis/widgets";
import type { SubAgency } from "@/lib/lis/types";
import { Building2, HandCoins, Plus, ShieldCheck, UserCheck } from "lucide-react";

// ============================================================
// B2B Sub-Agencies — ABC Diagnostics network (SUB-001/2/3)
// ============================================================

const PARTNER_ID = "B2B-001";
const partner = partners.find((p) => p.id === PARTNER_ID) ?? partners[0];
const baseSubs = subAgencies.filter((s) => s.parentId === PARTNER_ID);

export function B2bSubAgenciesView() {
  const { go } = useLisNav();
  const [subs, setSubs] = React.useState<SubAgency[]>(baseSubs);
  const [selected, setSelected] = React.useState<SubAgency | null>(null);
  const [openNew, setOpenNew] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "Goregaon Diagnostics", contact: "Prakash Nair", mobile: "+91 90040 45678",
    email: "prakash@goregaondx.in", city: "Mumbai",
  });

  const create = () => {
    const s: SubAgency = {
      id: `SUB-1${String(subs.length).padStart(2, "0")}`,
      parentId: PARTNER_ID, parentName: partner.name,
      name: form.name, city: form.city, contactPerson: form.contact,
      mobile: form.mobile, email: form.email, joinedOn: "2026-09-28",
      status: "Active", monthlyBusiness: 0, outstanding: 0,
    };
    setSubs((cur) => [s, ...cur]);
    setOpenNew(false);
  };

  const totalBusiness = subs.reduce((a, s) => a + s.monthlyBusiness, 0);
  const totalOutstanding = subs.reduce((a, s) => a + s.outstanding, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sub-Agencies"
        subtitle={`Collection centres operating under ${partner.name} · pricing, users and settlements`}
        actions={
          <Button className="bg-violet-600 text-white hover:bg-violet-700" onClick={() => setOpenNew(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Create Sub-Agency
          </Button>
        }
      />

      <div className="flex items-start gap-2.5 rounded-lg border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
        <div>
          <p className="font-semibold">Pricing visibility restriction</p>
          <p className="text-xs leading-relaxed">
            Sub-agencies only ever see the price list you assign them under My Pricing. Your Apex cost price,
            margins and the central-lab rate card stay confidential — enforced by role permissions (Sub Agency Admin).
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {subs.map((s) => (
          <Panel
            key={s.id}
            title={s.name}
            description={`${s.id} · joined ${fmtDate(s.joinedOn)}`}
            actions={<StatusPill status={s.status} />}
          >
            <div className="space-y-3 text-sm">
              <KeyValue
                cols={2}
                items={[
                  { label: "Contact Person", value: s.contactPerson },
                  { label: "Mobile", value: s.mobile },
                  { label: "City", value: s.city },
                  { label: "Email", value: s.email },
                ]}
              />
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Monthly Business</p>
                  <p className="text-base font-bold tabular-nums text-slate-900">{inr(s.monthlyBusiness)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Outstanding</p>
                  <p className={`text-base font-bold tabular-nums ${s.outstanding > 0 ? "text-rose-600" : "text-emerald-600"}`}>{inr(s.outstanding)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelected(s)}>
                  <Building2 className="mr-1 h-3.5 w-3.5" /> Manage
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => go("b2b/pricing")}>
                  <HandCoins className="mr-1 h-3.5 w-3.5" /> Pricing
                </Button>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <Panel title="Network Summary">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div><p className="text-xs text-muted-foreground">Sub-Agencies</p><p className="text-lg font-bold">{subs.length}</p></div>
          <div><p className="text-xs text-muted-foreground">Monthly Business</p><p className="text-lg font-bold tabular-nums">{inr(totalBusiness)}</p></div>
          <div><p className="text-xs text-muted-foreground">Total Outstanding</p><p className="text-lg font-bold tabular-nums text-rose-600">{inr(totalOutstanding)}</p></div>
          <div><p className="text-xs text-muted-foreground">Blended Margin (Sep)</p><p className="text-lg font-bold tabular-nums text-emerald-600">16.3%</p></div>
        </div>
      </Panel>

      {/* Detail sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
          {selected ? (
            <>
              <SheetHeader className="border-b px-5 py-3">
                <SheetTitle className="text-sm">{selected.name} <span className="ml-1 font-mono text-xs text-muted-foreground">{selected.id}</span></SheetTitle>
                <p className="text-xs text-muted-foreground">{selected.contactPerson} · {selected.mobile} · {selected.city}</p>
              </SheetHeader>
              <div className="space-y-5 p-5">
                <Panel title="Agency Details" contentClassName="p-4">
                  <KeyValue
                    cols={2}
                    items={[
                      { label: "Sub-Agency ID", value: selected.id },
                      { label: "Parent", value: selected.parentName },
                      { label: "Email", value: selected.email },
                      { label: "Joined On", value: fmtDate(selected.joinedOn) },
                      { label: "Monthly Business", value: inr(selected.monthlyBusiness) },
                      { label: "Outstanding", value: inr(selected.outstanding) },
                    ]}
                  />
                </Panel>

                <Panel title="Portal Users" contentClassName="p-0">
                  {users.filter((u) => u.linkedTo === selected.name).length === 0 ? (
                    <p className="px-4 py-4 text-xs text-muted-foreground">No portal logins issued yet — invite the centre admin to get started.</p>
                  ) : (
                    <ul className="divide-y">
                      {users.filter((u) => u.linkedTo === selected.name).map((u) => (
                        <li key={u.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-xs">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-3.5 w-3.5 text-violet-600" />
                            <div>
                              <p className="font-medium">{u.name}</p>
                              <p className="text-muted-foreground">{u.username} · {u.role}</p>
                            </div>
                          </div>
                          <StatusPill status={u.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>

                <Panel title="Settlement Summary (Sep 2026)" contentClassName="p-0">
                  {settlements.filter((st) => st.parentId === PARTNER_ID && st.childId === selected.id).length === 0 ? (
                    <p className="px-4 py-4 text-xs text-muted-foreground">No settlement raised yet for this agency.</p>
                  ) : (
                    <ul className="divide-y">
                      {settlements.filter((st) => st.parentId === PARTNER_ID && st.childId === selected.id).map((st) => (
                        <li key={st.id} className="space-y-1.5 px-4 py-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{st.period}</span>
                            <StatusPill status={st.status} />
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <div><p className="text-muted-foreground">Billed</p><p className="font-semibold tabular-nums">{inr(st.billed)}</p></div>
                            <div><p className="text-muted-foreground">Collected</p><p className="font-semibold tabular-nums">{inr(st.collected)}</p></div>
                            <div><p className="text-muted-foreground">Your Margin ({st.marginPct}%)</p><p className="font-semibold tabular-nums text-emerald-600">{inr(st.margin)}</p></div>
                            <div><p className="text-muted-foreground">Payable</p><p className="font-semibold tabular-nums text-rose-600">{inr(st.payable)}</p></div>
                          </div>
                          <p className="text-muted-foreground">Last payment: {fmtDate(st.lastPayment)}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>

                <Button variant="outline" className="w-full" onClick={() => go("b2b/pricing")}>
                  <HandCoins className="mr-1.5 h-4 w-4" /> Edit {selected.name} Price List
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Create sub-agency dialog */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Create Sub-Agency</DialogTitle>
            <DialogDescription className="text-xs">A new collection centre under {partner.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-slate-700">Agency Name <span className="text-rose-500">*</span></label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Contact Person <span className="text-rose-500">*</span></label>
              <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Mobile <span className="text-rose-500">*</span></label>
              <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Email</label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">City</label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs leading-relaxed text-violet-900 sm:col-span-2">
              Initial price list: the agency starts on your current rate card + a 12% default margin. Adjust per-test rates
              anytime in My Pricing — the agency never sees your Apex cost price.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNew(false)}>Cancel</Button>
            <Button className="bg-violet-600 text-white hover:bg-violet-700" onClick={create}>
              <Plus className="mr-1.5 h-4 w-4" /> Create Sub-Agency
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

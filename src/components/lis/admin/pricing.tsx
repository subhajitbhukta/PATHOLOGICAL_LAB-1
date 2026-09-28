"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DataTable, Field, FormGrid, PageHeader, Panel, PriceNode, StatCard, StatusPill, ChannelPill,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { packages, partners, priceRules, priceFor, subAgencies, tests } from "@/lib/lis/data";
import type { PriceRule } from "@/lib/lis/data";
import { fmtDate, inr } from "@/lib/lis/format";
import { HandCoins, Layers3, Network, Sparkles, Tag, Users } from "lucide-react";

const PRICED_ITEMS = [...tests.map((t) => ({ code: t.code, name: t.name })), ...packages.map((p) => ({ code: p.code, name: p.name }))];

export function AdminPricingView() {
  const [scopeF, setScopeF] = React.useState("All");
  const [partnerF, setPartnerF] = React.useState("All");

  // Edit rule dialog
  const [editOpen, setEditOpen] = React.useState(false);
  const [editForm, setEditForm] = React.useState<{ id: string; scopeName: string; price: number; effectiveFrom: string; effectiveTo: string; minQty: number; status: string } | null>(null);

  // New rule dialog
  const [newOpen, setNewOpen] = React.useState(false);
  const [nrForm, setNrForm] = React.useState({ testCode: "CBC", scope: "B2B", partnerId: "B2B-001", price: 150, effectiveFrom: "2026-10-01", effectiveTo: "", minQty: 10 });

  // Hierarchy explorer
  const [exTest, setExTest] = React.useState("CBC");

  const b2cCount = priceRules.filter((r) => r.scope === "B2C").length;
  const b2bCount = priceRules.filter((r) => r.scope === "B2B").length;
  const subCount = priceRules.filter((r) => r.scope === "SUB").length;
  const specialRows = priceRules.filter((r) => r.effectiveTo || /promo|deal/i.test(r.scopeName));

  const rows = priceRules.filter(
    (r) => (scopeF === "All" || r.scope === scopeF) && (partnerF === "All" || r.scopeId === partnerF),
  );

  const openEdit = (r: PriceRule) => {
    setEditForm({
      id: r.id, scopeName: r.scopeName, price: r.price, effectiveFrom: r.effectiveFrom,
      effectiveTo: r.effectiveTo ?? "", minQty: r.minQty ?? 0, status: r.status,
    });
    setEditOpen(true);
  };

  // Hierarchy data for selected test
  const exT = tests.find((t) => t.code === exTest);
  const exListPrice = exT ? priceFor(exT.code, "B2C") : 0;
  const exB2B = priceRules.filter((r) => r.testCode === exTest && r.scope === "B2B");
  const exSubFor = (parentId: string) =>
    priceRules.filter((r) => r.testCode === exTest && r.scope === "SUB" && subAgencies.find((s) => s.id === r.scopeId)?.parentId === parentId);
  const exPromo = priceRules.filter((r) => r.testCode === exTest && r.scope === "B2C" && r.scopeName !== "Patient (B2C List)");

  const columns: Column<PriceRule>[] = [
    { key: "test", header: "Test", value: (r) => r.testName, render: (r) => (
      <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{r.testName}</p><p className="font-mono text-[10px] text-muted-foreground">{r.testCode}</p></div>
    ) },
    { key: "scope", header: "Scope", value: (r) => r.scope, render: (r) => <ChannelPill channel={r.scope} /> },
    { key: "scopeName", header: "Applies To", value: (r) => r.scopeName, render: (r) => <span className="max-w-48 truncate text-xs text-muted-foreground">{r.scopeName}</span> },
    { key: "price", header: "Price", headClassName: "text-right", className: "text-right", value: (r) => r.price, render: (r) => <span className="font-semibold tabular-nums">{inr(r.price)}</span> },
    { key: "validity", header: "Effective", value: (r) => r.effectiveFrom, render: (r) => (
      <div className="whitespace-nowrap text-[11px] leading-4"><p>{fmtDate(r.effectiveFrom)}</p><p className="text-muted-foreground">{r.effectiveTo ? `→ ${fmtDate(r.effectiveTo)}` : "→ open ended"}</p></div>
    ) },
    { key: "minQty", header: "Min Qty", headClassName: "text-right", className: "text-right", value: (r) => r.minQty ?? 0, render: (r) => <span className="text-xs tabular-nums">{r.minQty ?? "—"}</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "act", header: "", render: (r) => (
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)} aria-label={`Edit ${r.testName} rule`}><Tag className="h-3.5 w-3.5" /></Button>
    ) },
  ];

  const spColumns: Column<PriceRule>[] = [
    { key: "test", header: "Test / Package", value: (r) => r.testName, render: (r) => (
      <div className="min-w-0"><p className="truncate text-sm font-medium">{r.testName}</p><p className="font-mono text-[10px] text-muted-foreground">{r.testCode}</p></div>
    ) },
    { key: "scope", header: "Scope", value: (r) => r.scope, render: (r) => <ChannelPill channel={r.scope} /> },
    { key: "scopeName", header: "Campaign", value: (r) => r.scopeName, render: (r) => (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700"><Sparkles className="h-3 w-3" /> {r.scopeName}</span>
    ) },
    { key: "price", header: "Price", headClassName: "text-right", className: "text-right", value: (r) => r.price, render: (r) => <span className="font-semibold tabular-nums">{inr(r.price)}</span> },
    { key: "window", header: "Validity Window", value: (r) => r.effectiveFrom, render: (r) => (
      <span className="whitespace-nowrap text-[11px] text-muted-foreground">{fmtDate(r.effectiveFrom)} → {r.effectiveTo ? fmtDate(r.effectiveTo) : "open"}</span>
    ) },
    { key: "minQty", header: "Min Qty", headClassName: "text-right", className: "text-right", value: (r) => r.minQty ?? 0, render: (r) => <span className="text-xs tabular-nums">{r.minQty ?? "—"}</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pricing Engine"
        subtitle="Master B2C list → partner contracted rates → sub-agency rates, with promo windows and min-qty deals"
        icon={<HandCoins className="h-5 w-5" />}
        actions={<Button onClick={() => setNewOpen(true)}><Sparkles className="mr-1.5 h-4 w-4" /> New Price Rule</Button>}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="B2C List Rules" value={b2cCount} icon={<Users className="h-4 w-4" />} sublabel="published patient MRP" />
        <StatCard label="B2B Partner Rules" value={b2bCount} accent="violet" icon={<Network className="h-4 w-4" />} sublabel={`${partners.length} partner rate cards`} />
        <StatCard label="Sub-Agency Rules" value={subCount} accent="amber" icon={<Layers3 className="h-4 w-4" />} sublabel="parent-billed margins" />
        <StatCard label="Special / Promo Rules" value={specialRows.length} accent="emerald" icon={<Sparkles className="h-4 w-4" />} sublabel="campaign & volume deals" />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {/* Rule table */}
        <Panel
          title="All Price Rules"
          description={`${rows.length} of ${priceRules.length} rules shown`}
          className="xl:col-span-3"
        >
          <DataTable
            columns={columns}
            rows={rows}
            dense
            pageSize={10}
            searchOf={(r) => `${r.testCode} ${r.testName} ${r.scopeName}`}
            searchPlaceholder="Search test / partner…"
            onRowClick={(r) => openEdit(r)}
            filters={
              <>
                <Select value={scopeF} onValueChange={setScopeF}>
                  <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All scopes</SelectItem>
                    <SelectItem value="B2C">B2C</SelectItem>
                    <SelectItem value="B2B">B2B</SelectItem>
                    <SelectItem value="SUB">SUB</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={partnerF} onValueChange={setPartnerF}>
                  <SelectTrigger className="h-9 w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All partners &amp; agencies</SelectItem>
                    {partners.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} (B2B)</SelectItem>)}
                    {subAgencies.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} (SUB)</SelectItem>)}
                  </SelectContent>
                </Select>
              </>
            }
          />
        </Panel>

        {/* Hierarchy explorer */}
        <Panel
          title="Hierarchy Explorer"
          description="How one test resolves across the referral network"
          className="xl:col-span-2"
        >
          <div className="space-y-4">
            <Field label="Select Test">
              <Select value={exTest} onValueChange={setExTest}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{tests.map((t) => <SelectItem key={t.code} value={t.code}>{t.code} — {t.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>

            <PriceNode
              label="B2C — Patient List (MRP)"
              sub={`Master price · walk-in & patient portal${exT?.unit && exT.unit !== "—" ? ` · reported in ${exT.unit}` : ""}`}
              price={exListPrice}
              tone="teal"
              badge="Master"
            >
              {exPromo.map((pr) => (
                <PriceNode
                  key={pr.id}
                  label={pr.scopeName}
                  sub={`${fmtDate(pr.effectiveFrom)} → ${pr.effectiveTo ? fmtDate(pr.effectiveTo) : "open"} · −${Math.round((1 - pr.price / (exListPrice || 1)) * 100)}% vs list`}
                  price={pr.price}
                  tone="teal"
                  badge="Promo"
                />
              ))}
              {exB2B.map((br) => (
                <PriceNode
                  key={br.id}
                  label={br.scopeName}
                  sub={`Partner rate · −${Math.round((1 - br.price / (exListPrice || 1)) * 100)}% off list${br.minQty ? ` · min ${br.minQty} qty` : ""}`}
                  price={br.price}
                  tone="violet"
                  badge="B2B"
                >
                  {exSubFor(br.scopeId).map((sr) => (
                    <PriceNode
                      key={sr.id}
                      label={sr.scopeName}
                      sub={`Sub-agency rate · +${Math.round(((sr.price - br.price) / (br.price || 1)) * 100)}% over parent`}
                      price={sr.price}
                      tone="amber"
                      badge="SUB"
                    />
                  ))}
                  {exSubFor(br.scopeId).length === 0 ? (
                    <p className="rounded-md border border-dashed border-slate-200 px-3 py-1.5 text-[11px] text-muted-foreground">No sub-agencies under this partner yet.</p>
                  ) : null}
                </PriceNode>
              ))}
              {exB2B.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-200 px-3 py-2 text-[11px] text-muted-foreground">
                  No partner-specific rates for this test — bookings fall back to the B2C list price.
                </p>
              ) : null}
            </PriceNode>

            <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-3 text-[11px] leading-relaxed text-teal-900">
              Resolution order at booking: SUB rate (if sub-agency channel) → B2B contracted rate (if partner channel) →
              active promo → B2C list. Effective-date windows are honoured automatically.
            </div>
          </div>
        </Panel>
      </div>

      {/* Special prices */}
      <Panel
        title="Special Prices — Campaigns & Volume Deals"
        description="Time-bound promos and negotiated deals; expired windows stay editable for audit"
      >
        <DataTable
          columns={spColumns}
          rows={specialRows}
          pageSize={5}
          searchOf={(r) => `${r.testName} ${r.scopeName}`}
          searchPlaceholder="Search campaign…"
        />
      </Panel>

      {/* ------------------------------ EDIT RULE DIALOG ------------------------------ */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Price Rule {editForm ? <span className="font-mono text-sm text-muted-foreground">{editForm.id}</span> : null}</DialogTitle>
            <DialogDescription>{editForm?.scopeName} — changes apply from the next effective date.</DialogDescription>
          </DialogHeader>
          {editForm ? (
            <FormGrid cols={2}>
              <Field label="Price (₹)" required><Input type="number" min={0} value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })} /></Field>
              <Field label="Min Qty" hint="0 = no minimum"><Input type="number" min={0} value={editForm.minQty} onChange={(e) => setEditForm({ ...editForm, minQty: Number(e.target.value) })} /></Field>
              <Field label="Effective From" required><Input type="date" value={editForm.effectiveFrom} onChange={(e) => setEditForm({ ...editForm, effectiveFrom: e.target.value })} /></Field>
              <Field label="Effective To" hint="Leave blank for open-ended"><Input type="date" value={editForm.effectiveTo} onChange={(e) => setEditForm({ ...editForm, effectiveTo: e.target.value })} /></Field>
              <Field label="Status">
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </Field>
            </FormGrid>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => setEditOpen(false)}>Save Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------ NEW RULE DIALOG ------------------------------ */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Price Rule</DialogTitle>
            <DialogDescription>Scoped rules win over the B2C list — sub-agency rules must sit under a partner rate.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Test / Package" required>
              <Select value={nrForm.testCode} onValueChange={(v) => setNrForm({ ...nrForm, testCode: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRICED_ITEMS.map((t) => <SelectItem key={t.code} value={t.code}>{t.code} — {t.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Scope" required>
              <RadioGroup value={nrForm.scope} onValueChange={(v) => setNrForm({ ...nrForm, scope: v })} className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="B2C" /> B2C</label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="B2B" /> B2B</label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="SUB" /> Sub-Agency</label>
              </RadioGroup>
            </Field>
            {nrForm.scope === "B2B" ? (
              <Field label="B2B Partner" required>
                <Select value={nrForm.partnerId} onValueChange={(v) => setNrForm({ ...nrForm, partnerId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{partners.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            ) : null}
            {nrForm.scope === "SUB" ? (
              <Field label="Sub-Agency" required hint="Inherits the parent partner rate card">
                <Select value={nrForm.partnerId} onValueChange={(v) => setNrForm({ ...nrForm, partnerId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{subAgencies.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} (via {s.parentName})</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            ) : null}
            {nrForm.scope === "B2C" ? (
              <Field label="Applies To"><Input readOnly value="All patients (B2C list override — e.g. campaign promo)" /></Field>
            ) : null}
            <FormGrid cols={2}>
              <Field label="Price (₹)" required><Input type="number" min={0} value={nrForm.price} onChange={(e) => setNrForm({ ...nrForm, price: Number(e.target.value) })} /></Field>
              <Field label="Min Qty" hint="0 = no minimum"><Input type="number" min={0} value={nrForm.minQty} onChange={(e) => setNrForm({ ...nrForm, minQty: Number(e.target.value) })} /></Field>
              <Field label="Effective From" required><Input type="date" value={nrForm.effectiveFrom} onChange={(e) => setNrForm({ ...nrForm, effectiveFrom: e.target.value })} /></Field>
              <Field label="Effective To"><Input type="date" value={nrForm.effectiveTo} onChange={(e) => setNrForm({ ...nrForm, effectiveTo: e.target.value })} /></Field>
            </FormGrid>
            <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <Label className="sr-only">Preview</Label>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Preview: <Badge variant="outline" className="mx-1 font-mono text-[10px]">{nrForm.testCode}</Badge>
                at <b className="tabular-nums">{inr(nrForm.price)}</b> for {nrForm.scope === "B2C" ? "all patients" : nrForm.scope === "B2B" ? partners.find((p) => p.id === nrForm.partnerId)?.name : subAgencies.find((s) => s.id === nrForm.partnerId)?.name}, effective {fmtDate(nrForm.effectiveFrom)}.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={() => setNewOpen(false)}>Create Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

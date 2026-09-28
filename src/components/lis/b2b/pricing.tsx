"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { partners, priceRules, priceFor, subAgencies, tests } from "@/lib/lis/data";
import { fmtDate, inr } from "@/lib/lis/format";
import {
  DataTable, PageHeader, Panel, PriceNode,
} from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import type { PriceRule } from "@/lib/lis/types";
import { Check, Lock, PencilLine, ShieldCheck } from "lucide-react";

// ============================================================
// B2B My Pricing — (a) Apex→ABC rate card (read-only) + (b) ABC→Sub-Agency editor
// ============================================================

const PARTNER_ID = "B2B-001";
const partner = partners.find((p) => p.id === PARTNER_ID) ?? partners[0];
const mySubs = subAgencies.filter((s) => s.parentId === PARTNER_ID);

const b2bRules = priceRules.filter((r) => r.scope === "B2B" && r.scopeId === PARTNER_ID);
const b2cList = (code: string): number =>
  tests.find((t) => t.code === code)?.b2cPrice ?? priceFor(code, "B2C");

interface SubRow {
  rule: PriceRule;
  myCost: number;
  price: number;
  list: number;
}

export function B2bPricingView() {
  const [subId, setSubId] = React.useState("SUB-001");
  const [edits, setEdits] = React.useState<Record<string, string>>({});
  const [saved, setSaved] = React.useState<Record<string, number>>({});

  const selectedSub = mySubs.find((s) => s.id === subId) ?? mySubs[0];
  const subRules = priceRules.filter((r) => r.scope === "SUB" && r.scopeId === subId);

  const subRows: SubRow[] = subRules.map((rule) => {
    const myCost = priceFor(rule.testCode, "B2B", PARTNER_ID);
    const price = Number(edits[rule.id] ?? saved[rule.id] ?? rule.price);
    return { rule, myCost, price, list: b2cList(rule.testCode) };
  });
  const avgMargin = subRows.length > 0
    ? Math.round(subRows.reduce((a, r) => a + (r.price - r.myCost), 0) / subRows.length)
    : 0;

  const saveRow = (id: string) => {
    const v = Number(edits[id]);
    if (!Number.isFinite(v) || v <= 0) return;
    setSaved((cur) => ({ ...cur, [id]: v }));
    setEdits((cur) => {
      const next = { ...cur };
      delete next[id];
      return next;
    });
  };

  const rateCardColumns: Column<PriceRule>[] = [
    {
      key: "test", header: "Test / Profile", value: (r) => r.testName,
      render: (r) => (
        <div>
          <p className="text-sm font-medium">{r.testName}</p>
          <p className="font-mono text-[10px] text-slate-400">{r.testCode}</p>
        </div>
      ),
    },
    {
      key: "b2b", header: "My B2B Price", headClassName: "text-right", className: "text-right",
      value: (r) => r.price,
      render: (r) => <span className="text-sm font-bold tabular-nums text-violet-700">{inr(r.price)}</span>,
    },
    {
      key: "list", header: "B2C List", headClassName: "text-right", className: "text-right",
      value: (r) => b2cList(r.testCode),
      render: (r) => <span className="text-xs text-slate-400 line-through">{inr(b2cList(r.testCode))}</span>,
    },
    { key: "eff", header: "Effective From", value: (r) => r.effectiveFrom, render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDate(r.effectiveFrom)}</span> },
    { key: "min", header: "Min Qty", headClassName: "text-right", className: "text-right", value: (r) => r.minQty ?? 1, render: (r) => <span className="text-xs tabular-nums">{r.minQty ?? "—"}</span> },
  ];

  const subColumns: Column<SubRow>[] = [
    {
      key: "test", header: "Test / Profile", value: (r) => r.rule.testName,
      render: (r) => (
        <div>
          <p className="text-sm font-medium">{r.rule.testName}</p>
          <p className="font-mono text-[10px] text-slate-400">{r.rule.testCode}</p>
        </div>
      ),
    },
    {
      key: "cost", header: "My Apex Cost", headClassName: "text-right", className: "text-right",
      value: (r) => r.myCost,
      render: (r) => <span className="text-xs tabular-nums text-slate-500">{inr(r.myCost)}</span>,
    },
    {
      key: "price", header: "Sub-Agency Price", headClassName: "text-right", className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Input
            className="h-8 w-24 text-right tabular-nums"
            value={edits[r.rule.id] ?? String(saved[r.rule.id] ?? r.rule.price)}
            onChange={(e) => setEdits((cur) => ({ ...cur, [r.rule.id]: e.target.value }))}
          />
          <Button
            variant="outline" size="sm" className="h-8 px-2"
            disabled={edits[r.rule.id] === undefined}
            onClick={() => saveRow(r.rule.id)}
          >
            {saved[r.rule.id] !== undefined && edits[r.rule.id] === undefined ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : "Save"}
          </Button>
        </div>
      ),
    },
    {
      key: "margin", header: "Margin / Test", headClassName: "text-right", className: "text-right",
      value: (r) => r.price - r.myCost,
      render: (r) => (
        <span className={`text-xs font-semibold tabular-nums ${r.price - r.myCost > 0 ? "text-emerald-600" : "text-rose-600"}`}>
          {inr(r.price - r.myCost)}
        </span>
      ),
    },
    {
      key: "cap", header: "Patient Max (B2C)", headClassName: "text-right", className: "text-right",
      value: (r) => r.list,
      render: (r) => <span className="text-xs text-slate-400 line-through">{inr(r.list)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Pricing"
        subtitle="Your Apex rate card (read-only) and the price lists you publish to your sub-agencies"
      />

      {/* (a) Apex → ABC rate card */}
      <Panel
        title="My Rate Card — Apex → ABC Diagnostics"
        description="Contracted B2B prices · effective 01 Apr 2026 · Tier 1 — Volume"
        actions={<Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700"><Lock className="mr-1 h-3 w-3" /> Read-only · Managed by Apex Labs</Badge>}
      >
        <DataTable
          columns={rateCardColumns}
          rows={b2bRules}
          pageSize={8}
          searchOf={(r) => `${r.testName} ${r.testCode}`}
          searchPlaceholder="Search rate card…"
        />
        <p className="mt-3 text-xs text-muted-foreground">
          Rate revisions are handled by your Apex account manager. The B2C list column is shown only for your margin reference and is never visible to sub-agencies.
        </p>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* (b) ABC → Sub-Agency pricing */}
        <Panel
          title="My Sub-Agency Pricing (ABC → Sub-Agencies)"
          description="Set the rates your sub-agencies bill at — margins update live"
          className="lg:col-span-2"
          actions={
            <Select value={subId} onValueChange={setSubId}>
              <SelectTrigger className="h-9 w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {mySubs.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          }
        >
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs text-violet-900">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Editing <b>{selectedSub.name}</b>&apos;s price list ({subRules.length} tests · avg margin {inr(avgMargin)}/test).
              Sub-agencies never see your Apex cost price — they only see the rates you set here.
            </span>
          </div>
          <DataTable
            columns={subColumns}
            rows={subRows}
            pageSize={8}
            searchOf={(r) => `${r.rule.testName} ${r.rule.testCode}`}
            searchPlaceholder="Search test…"
            dense
          />
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <PencilLine className="h-3.5 w-3.5" /> Enter a new rate and press Save on the row — changes apply to new bookings immediately.
          </p>
        </Panel>

        {/* Price cascade example */}
        <Panel title="How Pricing Cascades" description="Example — Complete Blood Count (CBC)">
          <PriceNode
            label="Apex Labs → ABC Diagnostics"
            sub="Your contracted rate (confidential)"
            price={priceFor("CBC", "B2B", PARTNER_ID)}
            tone="violet"
            badge="My cost"
          >
            <PriceNode
              label="ABC → XYZ Collection Centre"
              sub="Your sub-agency rate · margin ₹30/test"
              price={priceFor("CBC", "SUB", "SUB-001")}
              tone="amber"
            >
              <PriceNode
                label="XYZ → Patient (retail)"
                sub="Centre's own retail price, capped by B2C list"
                price={300}
                tone="emerald"
              />
            </PriceNode>
          </PriceNode>
          <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
            <li>• Apex never exposes central-lab cost prices to you or your network.</li>
            <li>• You keep the spread between your cost and the sub-agency rate.</li>
            <li>• Sub-agency retail must stay at or below the Apex B2C list price.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

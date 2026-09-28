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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auditLogs, roles, staff, systemConfig, users } from "@/lib/lis/data";
import { DataTable, Field, FormGrid, PageHeader, Panel, StatusPill } from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { Check, KeyRound, Lock, Settings2, ShieldCheck, UserCog, UserPlus, Users } from "lucide-react";

const MODULES = ["Masters", "Orders", "Samples", "Results", "Reports", "Billing", "Pricing", "B2B", "Admin"] as const;

export function AdminAdministrationView() {
  const [userOpen, setUserOpen] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [cfg, setCfg] = React.useState(systemConfig);
  const [cfgSaved, setCfgSaved] = React.useState(false);

  // Role permission editor (local state copy)
  const [perm, setPerm] = React.useState(() => roles.map((r) => ({ ...r, permissions: { ...r.permissions } })));
  const togglePerm = (roleId: string, mod: string, action: string) =>
    setPerm((rs) =>
      rs.map((r) => {
        if (r.id !== roleId) return r;
        const cur = r.permissions[mod] ?? [];
        const next = cur.includes(action) ? cur.filter((a) => a !== action) : [...cur, action];
        return { ...r, permissions: { ...r.permissions, [mod]: next } };
      }),
    );

  const userColumns: Column<(typeof users)[number]>[] = [
    { key: "id", header: "ID", value: (r) => r.id, render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.id}</span> },
    { key: "user", header: "User", value: (r) => r.name, render: (r) => (
      <div>
        <p className="text-sm font-medium text-slate-800">{r.name}</p>
        <p className="font-mono text-[11px] text-muted-foreground">@{r.username}</p>
      </div>
    ) },
    { key: "role", header: "Role", value: (r) => r.role, render: (r) => <Badge variant="outline" className="text-[10px]">{r.role}</Badge> },
    { key: "link", header: "Scope", value: (r) => r.linkedTo ?? "Central Lab", render: (r) => <span className="text-xs text-muted-foreground">{r.linkedTo ?? "Central Lab"}</span> },
    { key: "login", header: "Last Login", value: (r) => r.lastLogin, render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{r.lastLogin}</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
  ];

  const staffColumns: Column<(typeof staff)[number]>[] = [
    { key: "id", header: "ID", value: (r) => r.id, render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.id}</span> },
    { key: "name", header: "Name", value: (r) => r.name, render: (r) => <span className="text-sm font-medium text-slate-800">{r.name}</span> },
    { key: "role", header: "Designation", value: (r) => r.role, render: (r) => <span className="text-xs">{r.role}</span> },
    { key: "dept", header: "Department", value: (r) => r.department, render: (r) => <span className="text-xs text-muted-foreground">{r.department}</span> },
    { key: "mob", header: "Mobile", value: (r) => r.mobile, render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.mobile}</span> },
    { key: "shift", header: "Shift", value: (r) => r.shift, render: (r) => <Badge variant="outline" className="text-[10px]">{r.shift}</Badge> },
    { key: "joined", header: "Joined", value: (r) => r.joinedOn, render: (r) => <span className="text-xs text-muted-foreground">{r.joinedOn}</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
  ];

  const auditColumns: Column<(typeof auditLogs)[number]>[] = [
    { key: "at", header: "Timestamp", value: (r) => r.at, render: (r) => <span className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">{r.at}</span> },
    { key: "user", header: "User", value: (r) => r.user, render: (r) => (
      <div>
        <p className="text-xs font-medium text-slate-800">{r.user}</p>
        <p className="text-[10px] text-muted-foreground">{r.role}</p>
      </div>
    ) },
    { key: "action", header: "Action", value: (r) => r.action, render: (r) => <Badge variant="outline" className="text-[10px]">{r.action}</Badge> },
    { key: "module", header: "Module", value: (r) => r.module, render: (r) => <span className="text-xs">{r.module}</span> },
    { key: "entity", header: "Entity", value: (r) => r.entity, render: (r) => <span className="font-mono text-[11px] text-muted-foreground">{r.entity}</span> },
    { key: "ip", header: "IP", value: (r) => r.ip, render: (r) => <span className="font-mono text-[11px] text-muted-foreground">{r.ip}</span> },
    { key: "details", header: "Details", value: (r) => r.details, render: (r) => <span className="block max-w-64 truncate text-xs text-muted-foreground">{r.details}</span> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users, Roles & Configuration"
        subtitle="Accounts, role permissions, staff directory, audit trail and system settings"
        icon={<Settings2 className="h-5 w-5" />}
        actions={<Button onClick={() => { setUserOpen(true); setSaved(false); }}><UserPlus className="mr-1.5 h-4 w-4" /> Add User</Button>}
      />

      <Tabs defaultValue="users">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="users">User Accounts ({users.length})</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="staff">Staff Directory</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="config">System Config</TabsTrigger>
        </TabsList>

        {/* ------------------------------ USERS ------------------------------ */}
        <TabsContent value="users">
          <Panel title="User Accounts" description="Every login is bound to a role; partner and agency users are scoped to their own data only">
            <DataTable columns={userColumns} rows={users} pageSize={8} searchOf={(r) => `${r.name} ${r.username} ${r.role} ${r.linkedTo ?? ""}`} searchPlaceholder="Search user / role…" />
          </Panel>
        </TabsContent>

        {/* ------------------------------ ROLES ------------------------------ */}
        <TabsContent value="roles" className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-teal-200 bg-teal-50/60 p-3 text-[11px] leading-relaxed text-teal-900">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Maker-checker enforced: Technicians can enter results but can never release reports; only Pathologist roles hold approve/release. Sub-agency roles cannot see central pricing.
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {perm.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-teal-700" />
                      <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                      <Badge variant="outline" className="text-[10px]">{r.users} users</Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{r.description}</p>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px]">{r.id}</Badge>
                </div>
                <div className="mt-3 space-y-1.5 border-t border-dashed pt-3">
                  {MODULES.filter((m) => r.permissions[m] !== undefined).map((m) => (
                    <div key={m} className="flex flex-wrap items-center gap-1.5">
                      <span className="w-20 shrink-0 text-[11px] font-semibold text-slate-600">{m}</span>
                      {(["view", "create", "edit", "delete", "approve", "release", "reject"] as const).map((a) => {
                        const on = (r.permissions[m] ?? []).includes(a);
                        return (
                          <button
                            key={a}
                            onClick={() => togglePerm(r.id, m, a)}
                            className={`rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                              on ? "border-teal-200 bg-teal-50 text-teal-700" : "border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300"
                            }`}
                          >
                            {a}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                  {MODULES.filter((m) => r.permissions[m] === undefined).length > 0 && (
                    <p className="pt-1 text-[10px] text-muted-foreground">
                      No access: {MODULES.filter((m) => r.permissions[m] === undefined).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ------------------------------ STAFF ------------------------------ */}
        <TabsContent value="staff">
          <Panel title="Staff Directory" description="Phlebotomists, technicians, pathologists, logistics and front-office teams">
            <DataTable columns={staffColumns} rows={staff} pageSize={8} searchOf={(r) => `${r.name} ${r.role} ${r.department}`} searchPlaceholder="Search staff…" />
          </Panel>
        </TabsContent>

        {/* ------------------------------ AUDIT ------------------------------ */}
        <TabsContent value="audit">
          <Panel title="Audit Trail" description="Immutable log of every privileged action — user, module, entity, IP">
            <DataTable columns={auditColumns} rows={auditLogs} pageSize={10} searchOf={(r) => `${r.user} ${r.action} ${r.module} ${r.entity} ${r.details}`} searchPlaceholder="Search audit trail…" />
          </Panel>
        </TabsContent>

        {/* ------------------------------ CONFIG ------------------------------ */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Lab Identity" description="Printed on every report, invoice and manifest">
              <FormGrid cols={2}>
                <Field label="Lab Name"><Input value={cfg.labName} onChange={(e) => setCfg({ ...cfg, labName: e.target.value })} /></Field>
                <Field label="Tagline"><Input value={cfg.tagline} onChange={(e) => setCfg({ ...cfg, tagline: e.target.value })} /></Field>
                <Field label="Phone"><Input value={cfg.phone} onChange={(e) => setCfg({ ...cfg, phone: e.target.value })} /></Field>
                <Field label="Email"><Input value={cfg.email} onChange={(e) => setCfg({ ...cfg, email: e.target.value })} /></Field>
                <Field label="GSTIN"><Input value={cfg.gstin} onChange={(e) => setCfg({ ...cfg, gstin: e.target.value })} className="font-mono" /></Field>
                <Field label="CIN"><Input value={cfg.cin} onChange={(e) => setCfg({ ...cfg, cin: e.target.value })} className="font-mono" /></Field>
                <Field label="NABL Certificate"><Input value={cfg.nablCert} onChange={(e) => setCfg({ ...cfg, nablCert: e.target.value })} /></Field>
                <Field label="Address"><Input value={cfg.address} onChange={(e) => setCfg({ ...cfg, address: e.target.value })} /></Field>
              </FormGrid>
            </Panel>
            <div className="space-y-4">
              <Panel title="Billing & Numbering" description="GST, prefixes and defaults used across the platform">
                <FormGrid cols={2}>
                  <Field label="Default GST %" hint="Intra-state split CGST + SGST"><Input type="number" value={cfg.defaultGstPct} onChange={(e) => setCfg({ ...cfg, defaultGstPct: Number(e.target.value) })} /></Field>
                  <Field label="Invoice Prefix"><Input value={cfg.invoicePrefix} onChange={(e) => setCfg({ ...cfg, invoicePrefix: e.target.value })} className="font-mono" /></Field>
                  <Field label="Report Prefix"><Input value={cfg.reportPrefix} onChange={(e) => setCfg({ ...cfg, reportPrefix: e.target.value })} className="font-mono" /></Field>
                  <Field label="SMS Sender ID"><Input value={cfg.smsSender} onChange={(e) => setCfg({ ...cfg, smsSender: e.target.value })} className="font-mono" /></Field>
                </FormGrid>
                <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
                  <div>
                    <p className="text-xs font-medium text-slate-700">WhatsApp delivery</p>
                    <p className="text-[10px] text-muted-foreground">Reports & status alerts over WhatsApp Cloud API</p>
                  </div>
                  <Switch checked={cfg.whatsappEnabled} onCheckedChange={(v) => setCfg({ ...cfg, whatsappEnabled: v })} />
                </div>
              </Panel>
              <Panel title="Report Footer">
                <Field label="Footer text" hint="Shown on every released report">
                  <Input value={cfg.reportFooter} onChange={(e) => setCfg({ ...cfg, reportFooter: e.target.value })} />
                </Field>
              </Panel>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setCfgSaved(true)}><Check className="mr-1.5 h-4 w-4" /> Save Configuration</Button>
            <Button variant="outline"><Lock className="mr-1.5 h-4 w-4" /> Change Password Policy</Button>
            {cfgSaved && <span className="text-xs font-medium text-emerald-600">Configuration saved ✓</span>}
          </div>
        </TabsContent>
      </Tabs>

      {/* ------------------------------ ADD USER DIALOG ------------------------------ */}
      <Dialog open={userOpen} onOpenChange={setUserOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add User Account</DialogTitle>
            <DialogDescription>The role decides module access and data scope. Partner/agency logins see only their own data.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <FormGrid cols={2}>
              <Field label="Full Name" required><Input placeholder="e.g. Meera Joshi" /></Field>
              <Field label="Username" required><Input placeholder="e.g. meera.j" className="font-mono" /></Field>
              <Field label="Role" required>
                <Select defaultValue="Lab Technician">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{roles.map((r) => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Linked Scope" hint="Partner / agency / department">
                <Select defaultValue="Central Lab">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Central Lab">Central Lab</SelectItem>
                    <SelectItem value="B2B-001">ABC Diagnostics (B2B-001)</SelectItem>
                    <SelectItem value="SUB-001-A">XYZ Collection Centre</SelectItem>
                    <SelectItem value="Haematology">Haematology</SelectItem>
                    <SelectItem value="Biochemistry">Biochemistry</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Mobile" required><Input placeholder="+91" /></Field>
              <Field label="Temp Password" required hint="Force change at first login"><Input defaultValue="Apex@2026" className="font-mono" /></Field>
            </FormGrid>
            <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-[11px] text-muted-foreground">
              <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              2FA is mandatory for Super Admin and Pathologist roles; login events are written to the audit trail.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserOpen(false)}>Cancel</Button>
            <Button onClick={() => { setUserOpen(false); setSaved(true); }}><Check className="mr-1.5 h-4 w-4" /> Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          <Users className="h-3.5 w-3.5" /> User account created — invite sent. Action recorded in the audit trail.
        </div>
      )}
    </div>
  );
}

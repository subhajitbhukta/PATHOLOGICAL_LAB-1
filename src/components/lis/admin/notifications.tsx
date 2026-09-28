"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { notificationLog, notificationTemplates } from "@/lib/lis/data";
import type { NotifChannel, NotificationTemplate } from "@/lib/lis/data";
import { DataTable, Field, PageHeader, Panel, StatusPill } from "@/components/lis/widgets";
import type { Column } from "@/components/lis/widgets";
import { Bell, Mail, MessageSquare, MessageSquareText, Search, SendHorizontal, Smartphone } from "lucide-react";

const CHANNEL_TONE: Record<NotifChannel, string> = {
  SMS: "border-teal-200 bg-teal-50 text-teal-700",
  WhatsApp: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Email: "border-amber-200 bg-amber-50 text-amber-700",
  Portal: "border-violet-200 bg-violet-50 text-violet-700",
};

function ChannelBadge({ ch }: { ch: NotifChannel }) {
  return <Badge variant="outline" className={`text-[10px] font-semibold ${CHANNEL_TONE[ch]}`}>{ch}</Badge>;
}

const CHANNEL_CONFIGS: { id: string; name: string; icon: typeof Mail; provider: string; detail: string; status: string; tone: string }[] = [
  { id: "sms", name: "SMS", icon: MessageSquare, provider: "MSG91 · DLT registered", detail: "Sender ID: APEXLB · 8 DLT template IDs mapped", status: "Active", tone: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { id: "wa", name: "WhatsApp", icon: MessageSquareText, provider: "Meta WhatsApp Cloud API", detail: "Business number +91 22 4890 1234 · 8 approved templates", status: "Enabled", tone: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { id: "email", name: "Email", icon: Mail, provider: "SMTP · smtp.apexlabs.in", detail: "TLS :587 · from reports@apexlabs.in · DKIM signed", status: "Active", tone: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { id: "portal", name: "In-App Portal", icon: Bell, provider: "ApexLIS push service", detail: "Always on · bell tray + status badge per role", status: "Active", tone: "border-emerald-200 bg-emerald-50 text-emerald-700" },
];

export function AdminNotificationsView() {
  // Template switches + filters
  const [tplEnabled, setTplEnabled] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(notificationTemplates.map((t) => [t.id, t.enabled])),
  );
  const [audF, setAudF] = React.useState("All");
  const [chF, setChF] = React.useState("All");
  const [q, setQ] = React.useState("");

  // Channel test-send feedback
  const [tested, setTested] = React.useState<Record<string, boolean>>({});

  // Send notification dialog
  const [sendOpen, setSendOpen] = React.useState(false);
  const [sendAudience, setSendAudience] = React.useState("Patient");
  const [sendTpl, setSendTpl] = React.useState("NT-01");
  const [sendChannels, setSendChannels] = React.useState<string[]>(["SMS", "WhatsApp"]);
  const [sendBody, setSendBody] = React.useState(notificationTemplates[0]?.body ?? "");

  const tplRows = notificationTemplates.filter(
    (t) =>
      (audF === "All" || t.audience === audF || (audF === "EVERYONE" && t.audience === "All")) &&
      (chF === "All" || t.channel.includes(chF as NotifChannel)) &&
      (q.trim() === "" || `${t.name} ${t.trigger} ${t.body}`.toLowerCase().includes(q.toLowerCase())),
  );

  const logColumns: Column<(typeof notificationLog)[number]>[] = [
    { key: "id", header: "ID", value: (r) => r.id, render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.id}</span> },
    { key: "ch", header: "Channel", value: (r) => r.channel, render: (r) => <ChannelBadge ch={r.channel} /> },
    { key: "tpl", header: "Template", value: (r) => r.template, render: (r) => <span className="text-sm font-medium">{r.template}</span> },
    { key: "rcpt", header: "Recipient", value: (r) => r.recipient, render: (r) => <span className="max-w-56 truncate text-xs text-muted-foreground">{r.recipient}</span> },
    { key: "aud", header: "Audience", value: (r) => r.audience, render: (r) => <Badge variant="outline" className="text-[10px]">{r.audience}</Badge> },
    { key: "order", header: "Reference", value: (r) => r.orderId ?? "—", render: (r) => <span className="font-mono text-[11px] text-muted-foreground">{r.orderId ?? "—"}</span> },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusPill status={r.status} /> },
    { key: "at", header: "Sent At", value: (r) => r.sentAt, render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{r.sentAt}</span> },
  ];

  const toggleSendChannel = (c: string) =>
    setSendChannels((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        subtitle="Template studio, delivery log and channel health — SMS, WhatsApp, Email and in-app"
        icon={<Bell className="h-5 w-5" />}
        actions={<Button onClick={() => setSendOpen(true)}><SendHorizontal className="mr-1.5 h-4 w-4" /> Send Notification</Button>}
      />

      <Tabs defaultValue="templates">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="log">Send Log</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
        </TabsList>

        {/* ------------------------------ TEMPLATES ------------------------------ */}
        <TabsContent value="templates" className="space-y-3">
          <Panel title="Template Studio" description="Merge fields resolve at send time — {{patient_name}}, {{order_id}}, {{portal_link}}">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Select value={audF} onValueChange={setAudF}>
                  <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All audiences</SelectItem>
                    <SelectItem value="Patient">Patient</SelectItem>
                    <SelectItem value="B2B">B2B</SelectItem>
                    <SelectItem value="Sub-Agency">Sub-Agency</SelectItem>
                    <SelectItem value="EVERYONE">Everyone</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={chF} onValueChange={setChF}>
                  <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All channels</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Portal">Portal</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline">{tplRows.filter((t) => tplEnabled[t.id]).length} enabled</Badge>
              </div>
              <div className="relative w-full lg:w-72">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search template / trigger…" className="pl-8" />
              </div>
            </div>

            <div className="mt-3 max-h-[560px] space-y-2.5 overflow-y-auto pr-1">
              {tplRows.map((t) => (
                <div key={t.id} className={`rounded-lg border p-3.5 transition-colors ${tplEnabled[t.id] ? "border-slate-200" : "border-dashed border-slate-300 bg-slate-50/60"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                        <Badge variant="outline" className="text-[10px]">{t.audience}</Badge>
                        <span className="text-[11px] text-muted-foreground">trigger: {t.trigger}</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {t.channel.map((c) => <ChannelBadge key={c} ch={c} />)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">{tplEnabled[t.id] ? "Enabled" : "Disabled"}</span>
                      <Switch
                        checked={tplEnabled[t.id] ?? false}
                        onCheckedChange={(v) => setTplEnabled((sw) => ({ ...sw, [t.id]: v }))}
                        aria-label={`Toggle ${t.name}`}
                      />
                    </div>
                  </div>
                  <pre className="mt-2.5 whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-2.5 font-mono text-[11px] leading-relaxed text-slate-700">{t.body}</pre>
                </div>
              ))}
              {tplRows.length === 0 ? (
                <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No templates match the current filters.</p>
              ) : null}
            </div>
          </Panel>
        </TabsContent>

        {/* ------------------------------ SEND LOG ------------------------------ */}
        <TabsContent value="log">
          <Panel title="Delivery Log" description="Every outbound message with channel, recipient and delivery outcome">
            <DataTable
              columns={logColumns}
              rows={notificationLog}
              pageSize={8}
              searchOf={(r) => `${r.template} ${r.recipient} ${r.orderId ?? ""}`}
              searchPlaceholder="Search recipient / template…"
              filters={
                <>
                  <Select defaultValue="All">
                    <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All channels</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Portal">Portal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="All">
                    <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All statuses</SelectItem>
                      <SelectItem value="Sent">Sent</SelectItem>
                      <SelectItem value="Queued">Queued</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              }
            />
          </Panel>
        </TabsContent>

        {/* ------------------------------ CHANNELS ------------------------------ */}
        <TabsContent value="channels">
          <div className="grid gap-3 sm:grid-cols-2">
            {CHANNEL_CONFIGS.map((c) => (
              <div key={c.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-teal-600/10 p-2 text-teal-700"><c.icon className="h-4 w-4" /></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground">{c.provider}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${c.tone}`}>{c.status}</Badge>
                </div>
                <p className="mt-2.5 text-xs text-muted-foreground">{c.detail}</p>
                <div className="mt-3 flex items-center justify-between border-t border-dashed pt-2.5">
                  <span className={`text-[11px] font-medium ${tested[c.id] ? "text-emerald-600" : "text-transparent select-none"}`}>{tested[c.id] ? "Test message queued ✓" : "."}</span>
                  <Button
                    variant="outline" size="sm" className="h-7"
                    onClick={() => setTested((t) => ({ ...t, [c.id]: true }))}
                  >
                    <SendHorizontal className="mr-1 h-3 w-3" /> Test Send
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-teal-200 bg-teal-50/60 p-3 text-[11px] leading-relaxed text-teal-900">
            <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Channel outage policy: if WhatsApp delivery fails twice, the gateway auto-falls back to SMS; portal notifications are never suppressed.
          </div>
        </TabsContent>
      </Tabs>

      {/* ------------------------------ SEND NOTIFICATION DIALOG ------------------------------ */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>Manual broadcast — audit-logged against your account with the template snapshot.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Audience" required>
                <Select value={sendAudience} onValueChange={setSendAudience}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Patient">Patient</SelectItem>
                    <SelectItem value="B2B">B2B Partners</SelectItem>
                    <SelectItem value="Sub-Agency">Sub-Agencies</SelectItem>
                    <SelectItem value="All">Everyone</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Template" required>
                <Select
                  value={sendTpl}
                  onValueChange={(v) => {
                    setSendTpl(v);
                    const t = notificationTemplates.find((x) => x.id === v);
                    setSendBody(t?.body ?? "");
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{notificationTemplates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Channels" required hint="Delivery falls back to SMS when WhatsApp fails">
              <div className="flex flex-wrap gap-4 pt-1">
                {(["SMS", "WhatsApp", "Email", "Portal"] as NotifChannel[]).map((c) => (
                  <label key={c} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox checked={sendChannels.includes(c)} onCheckedChange={() => toggleSendChannel(c)} />
                    {c}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Message" hint="Merge fields resolve per recipient at send time">
              <Textarea rows={4} value={sendBody} onChange={(e) => setSendBody(e.target.value)} />
            </Field>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-muted-foreground">
              <span>Estimated reach</span>
              <span className="font-semibold text-slate-800">
                {sendAudience === "Patient" ? "5,241 patients" : sendAudience === "B2B" ? "6 partner accounts" : sendAudience === "Sub-Agency" ? "6 agency accounts" : "all audiences"} · {sendChannels.length} channel(s)
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendOpen(false)}>Cancel</Button>
            <Button onClick={() => setSendOpen(false)}><SendHorizontal className="mr-1.5 h-3.5 w-3.5" /> Queue Notification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

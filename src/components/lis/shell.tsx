"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLisNav } from "@/components/lis/nav";
import type { Portal } from "@/lib/lis/types";
import {
  Activity, Banknote, Bell, BarChart3, Building2, CalendarDays, ClipboardList, Container,
  FileBarChart2, FileCheck2, FileText, FlaskConical, FlipHorizontal2, HandCoins, Home,
  LayoutDashboard, LogOut, Menu, PackageCheck, ReceiptText, Search, Settings2, ShieldCheck,
  ShoppingCart, Syringe, TestTubes, Truck, UserCircle2, UserPlus, Users, Wallet, X,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const PORTAL_META: Record<
  Exclude<Portal, "landing">,
  { title: string; user: string; role: string; accent: "teal" | "violet" | "amber" | "emerald" }
> = {
  admin: { title: "Central Lab — Super Admin", user: "Ashwin Khorana", role: "Super Admin", accent: "teal" },
  b2b: { title: "B2B Partner Portal", user: "Rajesh Malhotra", role: "B2B Manager · ABC Diagnostics", accent: "violet" },
  agency: { title: "Sub-Agency Portal", user: "Imran Qureshi", role: "Sub-Agency Admin · XYZ Collection Centre", accent: "amber" },
  patient: { title: "Patient Portal", user: "Rahul Sharma", role: "B2C Patient · PAT-00124", accent: "emerald" },
};

export const NAV: Record<Exclude<Portal, "landing">, NavGroup[]> = {
  admin: [
    { group: "Overview", items: [{ id: "admin/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
    {
      group: "Front Office", items: [
        { id: "admin/order-new", label: "Central Patient Entry", icon: UserPlus },
        { id: "admin/orders", label: "Bookings & Orders", icon: ClipboardList, badge: "8" },
        { id: "admin/patients", label: "Patient Directory", icon: Users },
      ],
    },
    {
      group: "Logistics & Lab", items: [
        { id: "admin/samples", label: "Sample Management", icon: TestTubes },
        { id: "admin/logistics", label: "Logistics & Pickups", icon: Truck, badge: "4" },
        { id: "admin/receiving", label: "Lab Receiving", icon: PackageCheck },
        { id: "admin/worklists", label: "Department Worklists", icon: FlaskConical },
        { id: "admin/results", label: "Result Entry", icon: Activity },
        { id: "admin/verification", label: "Pathologist Verification", icon: FileCheck2, badge: "2" },
        { id: "admin/reports", label: "Report Registry", icon: FileText },
      ],
    },
    {
      group: "Masters & Pricing", items: [
        { id: "admin/masters-tests", label: "Test & Package Masters", icon: TestTubes },
        { id: "admin/masters-lab", label: "Lab Setup Masters", icon: Container },
        { id: "admin/masters-network", label: "Network & Templates", icon: Building2 },
        { id: "admin/pricing", label: "Pricing Engine", icon: HandCoins },
      ],
    },
    {
      group: "Partner Network", items: [
        { id: "admin/partners", label: "B2B & Sub-Agencies", icon: Building2 },
      ],
    },
    {
      group: "Finance", items: [
        { id: "admin/billing", label: "Billing & Invoicing", icon: ReceiptText },
        { id: "admin/ledger", label: "Ledgers & Outstanding", icon: Wallet },
        { id: "admin/settlements", label: "Sub-Agency Settlement", icon: Banknote },
        { id: "admin/external", label: "External Reference Lab", icon: FlipHorizontal2 },
      ],
    },
    {
      group: "Insights & System", items: [
        { id: "admin/mis", label: "Reports & MIS", icon: BarChart3 },
        { id: "admin/notifications", label: "Notifications", icon: Bell },
        { id: "admin/administration", label: "Users, Roles & Config", icon: Settings2 },
      ],
    },
  ],
  b2b: [
    { group: "Overview", items: [{ id: "b2b/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
    {
      group: "Operations", items: [
        { id: "b2b/order-new", label: "New Test Order", icon: UserPlus },
        { id: "b2b/patients", label: "My Patients", icon: Users },
        { id: "b2b/orders", label: "Orders", icon: ClipboardList, badge: "5" },
        { id: "b2b/samples", label: "Samples & Barcodes", icon: TestTubes },
        { id: "b2b/pickups", label: "Pickup Requests", icon: Truck, badge: "2" },
      ],
    },
    { group: "Reports", items: [{ id: "b2b/reports", label: "Report Download", icon: FileText, badge: "3" }] },
    {
      group: "Business", items: [
        { id: "b2b/pricing", label: "My Pricing", icon: HandCoins },
        { id: "b2b/subagencies", label: "Sub-Agencies", icon: Building2 },
        { id: "b2b/billing", label: "Billing & Ledger", icon: ReceiptText },
      ],
    },
  ],
  agency: [
    { group: "Overview", items: [{ id: "agency/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
    {
      group: "Operations", items: [
        { id: "agency/order-new", label: "New Test Order", icon: UserPlus },
        { id: "agency/patients", label: "My Patients", icon: Users },
        { id: "agency/orders", label: "Orders", icon: ClipboardList },
        { id: "agency/pickups", label: "Pickup Requests", icon: Truck },
        { id: "agency/reports", label: "Reports", icon: FileText },
      ],
    },
    { group: "Accounts", items: [{ id: "agency/billing", label: "Billing & Payable", icon: ReceiptText }] },
  ],
  patient: [
    { group: "My Health", items: [
      { id: "patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "patient/book", label: "Book a Test", icon: ShoppingCart },
      { id: "patient/tests", label: "My Tests", icon: FlaskConical },
      { id: "patient/appointments", label: "Appointments", icon: CalendarDays },
    ] },
    { group: "Records", items: [
      { id: "patient/reports", label: "My Reports", icon: FileText },
      { id: "patient/bills", label: "Bills & Payments", icon: ReceiptText },
      { id: "patient/profile", label: "Profile", icon: UserCircle2 },
    ] },
  ],
};

const ACCENT = {
  teal: { active: "bg-teal-500/15 text-teal-200", dot: "bg-teal-400", chip: "bg-teal-500/20 text-teal-200 border-teal-400/30", ring: "ring-teal-400/40", logo: "bg-teal-600" },
  violet: { active: "bg-violet-500/15 text-violet-200", dot: "bg-violet-400", chip: "bg-violet-500/20 text-violet-200 border-violet-400/30", ring: "ring-violet-400/40", logo: "bg-violet-600" },
  amber: { active: "bg-amber-500/15 text-amber-200", dot: "bg-amber-400", chip: "bg-amber-500/20 text-amber-200 border-amber-400/30", ring: "ring-amber-400/40", logo: "bg-amber-600" },
  emerald: { active: "bg-emerald-500/15 text-emerald-200", dot: "bg-emerald-400", chip: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30", ring: "ring-emerald-400/40", logo: "bg-emerald-600" },
};

function SidebarBody({ portal, view, onNavigate }: { portal: Exclude<Portal, "landing">; view: string; onNavigate: (id: string) => void }) {
  const meta = PORTAL_META[portal];
  const a = ACCENT[meta.accent];
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg font-bold text-white", a.logo)}>A</div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">ApexLIS</p>
          <p className="truncate text-[11px] text-slate-400">{meta.title}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-6 [scrollbar-width:thin]">
        {NAV[portal].map((g) => (
          <div key={g.group}>
            <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">{g.group}</p>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = view === it.id;
                return (
                  <li key={it.id}>
                    <button
                      onClick={() => onNavigate(it.id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium transition-colors",
                        active ? a.active : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <it.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{it.label}</span>
                      {it.badge ? (
                        <span className={cn("rounded-full border px-1.5 text-[10px] font-bold", a.chip)}>{it.badge}</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 px-4 py-3">
        <p className="text-[10px] leading-relaxed text-slate-500">
          UI Prototype — all data is sample data.<br />Referral Lab Network Platform v2.6
        </p>
      </div>
    </div>
  );
}

export function PortalShell({
  portal, view, children,
}: { portal: Exclude<Portal, "landing">; view: string; children: React.ReactNode }) {
  const { go, exit } = useLisNav();
  const meta = PORTAL_META[portal];
  const a = ACCENT[meta.accent];
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const allItems = NAV[portal].flatMap((g) => g.items);
  const current = allItems.find((i) => i.id === view);

  const navigate = (id: string) => {
    go(id);
    setMobileOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-white/10 bg-slate-950 lg:block">
        <SidebarBody portal={portal} view={view} onNavigate={navigate} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-0 bg-slate-950 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBody portal={portal} view={view} onNavigate={navigate} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-3 sm:px-5">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{current?.label ?? "Dashboard"}</p>
              <p className="hidden truncate text-[11px] text-muted-foreground sm:block">{meta.title}</p>
            </div>
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search orders, samples, patients…" className="w-64 bg-slate-50 pl-8" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">3</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="text-xs">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex-col items-start gap-0.5">
                  <span className="text-xs font-medium">Report ready — REP-2026-001237</span>
                  <span className="text-[11px] text-muted-foreground">Vikas Verma · CBC · CityCare Path Labs</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex-col items-start gap-0.5">
                  <span className="text-xs font-medium">Pickup received — MAN-2026-0340</span>
                  <span className="text-[11px] text-muted-foreground">9 samples from XYZ Collection Centre</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex-col items-start gap-0.5">
                  <span className="text-xs font-medium">Payment due — ABC Diagnostics</span>
                  <span className="text-[11px] text-muted-foreground">₹1,18,400 outstanding · credit terms</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn("flex items-center gap-2 rounded-full p-0.5 pr-2 ring-2 ring-offset-1", a.ring)} aria-label="Account menu">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={cn("text-xs font-bold text-white", a.logo)}>
                      {meta.user.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-xs font-medium text-slate-700 sm:block">{meta.user.split(" ")[0]}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{meta.user}</p>
                  <p className="text-xs font-normal text-muted-foreground">{meta.role}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exit}><FlipHorizontal2 className="mr-2 h-4 w-4" /> Switch portal</DropdownMenuItem>
                <DropdownMenuItem onClick={exit}><LogOut className="mr-2 h-4 w-4" /> Sign out (to hub)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-5 p-4 sm:p-6">{children}</main>

        <footer className="border-t border-slate-200 bg-white py-3">
          <p className="px-6 text-center text-[11px] text-muted-foreground">
            ApexLIS — Referral Lab Network Platform · Central Lab → B2B → Sub-Agency → Patient → Sample → Lab → Report → Billing
          </p>
        </footer>
      </div>
    </div>
  );
}

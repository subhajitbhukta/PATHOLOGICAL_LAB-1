import type { Order, OrderStatus, Patient, Sample } from "./types";
import { INTERNAL_FLOW } from "./types";
import { patients, tests, priceRules } from "./data-core";
import { orders, samples, reports, patientStageIndex } from "./data-ops";

// Fill patient names into samples
const pmap = new Map<string, Patient>(patients.map((p) => [p.id, p]));
samples.forEach((s: Sample) => {
  const p = pmap.get(s.patientId);
  if (p) s.patientName = p.name;
});

// ============================================================
// AGGREGATE BARREL + HELPERS
// ============================================================
export * from "./types";
export * from "./data-core";
export * from "./data-ops";
export * from "./data-fin";

export const patientById = (id: string): Patient | undefined => pmap.get(id);
export const orderById = (id: string): Order | undefined => orders.find((o) => o.id === id);
export const sampleById = (id: string): Sample | undefined => samples.find((s) => s.id === id);

export const orderAgeSex = (orderId: string): string => {
  const o = orders.find((x) => x.id === orderId);
  if (!o) return "—";
  const p = pmap.get(o.patientId);
  return p ? `${p.age}y / ${p.gender === "Male" ? "M" : "F"}` : "—";
};

export const orderPatientName = (orderId: string): string => {
  const o = orders.find((x) => x.id === orderId);
  return o ? pmap.get(o.patientId)?.name ?? "—" : "—";
};

// Demo day snapshot (2026-09-28)
export const today = "2026-09-28";

// ---- Dashboard KPIs (derived from sample data where possible) ----
export const kpi = {
  todayRegistrations: patients.filter((p) => p.registeredOn >= "2026-09-22").length,
  todayOrders: orders.filter((o) => o.id.startsWith("ORD-20260928")).length,
  samplesCollected: samples.filter((s) => s.collectedAt?.startsWith(today)).length,
  inTransit: samples.filter((s) => ["Pickup Requested", "Picked Up", "In Transit"].includes(s.stage)).length,
  receivedToday: samples.filter((s) => ["Sample Accepted", "Assigned to Department", "Test in Progress", "Result Entered", "Verification Pending"].includes(s.stage)).length,
  testsInProgress: samples.filter((s) => ["Assigned to Department", "Test in Progress"].includes(s.stage)).length,
  pendingVerification: 2,
  reportsReady: 5,
  revenueToday: 118540,
  revenueMonth: 2398000,
  b2bRevenue: 58,
  b2cRevenue: 20,
  subRevenue: 22,
  outstandingTotal: 290900,
  tatCompliance: 89,
};

export const samplesForOrder = (orderId: string): Sample[] => samples.filter((s) => s.orderId === orderId);
export const reportsForOrder = (orderId: string) => reports.filter((r) => r.orderId === orderId);

// Reports visible to a B2B partner (their own patients only)
export const reportsForPartner = (partnerId: string): LabReportT[] =>
  reports.filter((r) => {
    const o = orders.find((x) => x.id === r.orderId);
    return o && (o.partnerId === partnerId || o.subAgencyId && o.channel === "SUB" && o.partnerId === partnerId);
  });

// Sub-agency scope: orders routed through that sub agency
export const ordersForSubAgency = (subId: string): Order[] => orders.filter((o) => o.subAgencyId === subId);
export const patientsForSubAgency = (subId: string): Patient[] => patients.filter((p) => p.sourceId === subId);

type LabReportT = (typeof reports)[number];

// Demo price resolution: return the applicable price for a scope
export const priceFor = (testCode: string, scope: "B2C" | "B2B" | "SUB", scopeId = "ALL"): number => {
  const t = tests.find((x) => x.code === testCode);
  if (!t) return 0;
  const rule = priceRules.find(
    (r) => r.testCode === testCode && r.scope === scope && (scope === "B2C" || r.scopeId === scopeId) && r.scopeName !== "Monsoon Promo — B2C",
  );
  return rule?.price ?? t.b2cPrice;
};

// Internal workflow progress (0–13)
export const workflowIndex = (status: OrderStatus): number =>
  INTERNAL_FLOW.indexOf(status) >= 0 ? INTERNAL_FLOW.indexOf(status) : status === "Sample Rejected" || status === "Recollection Requested" ? 5 : 0;

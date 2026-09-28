import type {
  Appointment, AuditLog, Invoice, LedgerEntry, MisAgeing, MisDayPoint, MisPartnerBusiness,
  MisTat, MisTestRevenue, NotificationLog, NotificationTemplate, RoleDef, Settlement,
  Staff, SystemConfig, UserAccount, PayStatus,
} from "./types";
import { LAB } from "./data-core";

// ============================================================
// FINANCE + ADMIN DATA (sample)
// ============================================================

// ---------- Invoices ----------
const inv = (
  id: string, date: string, scope: Invoice["scope"], billToId: string, billTo: string,
  billToSub: string | undefined, gstin: string, lines: [string, number, number][],
  discount: number, paid: number, mode: string, status: PayStatus, dueDate?: string, orderId?: string,
): Invoice => {
  const subtotal = lines.reduce((a, [, q, r]) => a + q * r, 0);
  const taxable = subtotal - discount;
  const cgst = Math.round(taxable * 0.09);
  return {
    id, date, dueDate, scope, billToId, billTo, billToSub, gstin,
    lines: lines.map(([d, q, r]) => ({ description: d, hsn: "999311", qty: q, rate: r })),
    subtotal, discount, taxable, cgst, sgst: cgst, total: taxable + cgst * 2,
    paid, due: taxable + cgst * 2 - paid, mode, status, orderId,
  };
};

export const invoices: Invoice[] = [
  inv("INV-2026-01184", "2026-09-28", "Patient", "PAT-00124", "Rahul Sharma", undefined, "—",
    [["Complete Blood Count (CBC)", 1, 350], ["TSH (Ultrasensitive)", 1, 400], ["Lipid Profile", 1, 500]], 63, 1402, "UPI (HDFC)", "Paid", undefined, "ORD-20260928-00125"),
  inv("INV-2026-01183", "2026-09-28", "Sub-Agency", "SUB-001", "XYZ Collection Centre", "Parent: ABC Diagnostics", "27AAECX0000A1Z9",
    [["HbA1c", 1, 295], ["Fasting Blood Sugar", 1, 95], ["Vitamin D (25-OH)", 1, 730]], 0, 336, "Credit", "Partial", "2026-10-12", "ORD-20260928-00124"),
  inv("INV-2026-01182", "2026-09-28", "B2B", "B2B-001", "ABC Diagnostics", undefined, "27AAACA1234B1Z2",
    [["Complete Blood Count (CBC)", 3, 150], ["ESR", 2, 90], ["hs-CRP", 2, 280], ["TSH", 2, 220], ["Free T4", 1, 190]], 0, 0, "Credit", "Credit", "2026-10-12"),
  inv("INV-2026-01181", "2026-09-28", "Patient", "PAT-00139", "Lakshmi Raman", undefined, "—",
    [["Senior Citizen Package (60+)", 1, 2499]], 250, 2249, "Card (Swipe)", "Paid", undefined, "ORD-20260928-00122"),
  inv("INV-2026-01179", "2026-09-28", "Sub-Agency", "SUB-004", "Sunrise Collection Point", "Parent: HealthPoint Collection Centre", "27AAHCS0000C1Z3",
    [["CBC", 2, 205], ["Urine Routine & Microscopy", 2, 140]], 0, 0, "Credit", "Credit", "2026-10-12", "ORD-20260928-00117"),
  inv("INV-2026-01176", "2026-09-27", "B2B", "B2B-001", "ABC Diagnostics", undefined, "27AAACA1234B1Z2",
    [["PSA (Total)", 1, 380], ["Urine Routine & Microscopy", 1, 110]], 0, 490, "NEFT", "Paid", "2026-10-11", "ORD-20260927-00115"),
  inv("INV-2026-01175", "2026-09-27", "B2B", "B2B-004", "CityCare Path Labs", undefined, "27AAGCC5678D1Z7",
    [["CBC", 2, 160], ["Liver Function Profile", 2, 310], ["HbA1c", 1, 260], ["Lipid Profile", 1, 295], ["ESR", 1, 95], ["hs-CRP", 1, 290], ["HLA B27", 1, 850]], 0, 1500, "NEFT", "Partial", "2026-10-11"),
  inv("INV-2026-01174", "2026-09-27", "Patient", "PAT-00142", "Nikhil Agarwal", undefined, "—",
    [["Vitamin D (25-OH)", 1, 999]], 0, 1179, "UPI (GPay)", "Paid", undefined, "ORD-20260927-00111"),
  inv("INV-2026-01171", "2026-09-27", "Sub-Agency", "SUB-005", "Kothrud Collection Centre", "Parent: CityCare Path Labs", "27AAICK9012E1Z4",
    [["HbA1c", 1, 320], ["Lipid Profile", 1, 355]], 0, 0, "Credit", "Credit", "2026-10-11", "ORD-20260927-00113"),
  inv("INV-2026-01168", "2026-09-26", "B2B", "B2B-003", "Medipoint Diagnostics", undefined, "27AAFMD3456F1Z8",
    [["Full Body Checkup — Advanced", 1, 1050]], 0, 0, "Credit", "Credit", "2026-10-10", "ORD-20260926-00108"),
  inv("INV-2026-01165", "2026-09-26", "Patient", "PAT-00132", "Suresh Menon", undefined, "—",
    [["Histopathology Examination (Biopsy)", 1, 2500]], 0, 2950, "NetBanking", "Paid", undefined, "ORD-20260926-00110"),
  inv("INV-2026-01160", "2026-09-25", "B2B", "B2B-005", "Zenith Hospital Collection", undefined, "27AAJZV7890G1Z1",
    [["CBC", 1, 210], ["HBsAg", 1, 250], ["HIV 1&2 (4th Gen)", 1, 290]], 0, 884, "Credit", "Paid", "2026-10-09", "ORD-20260925-00106"),
  inv("INV-2026-01157", "2026-09-24", "Patient", "PAT-00124", "Rahul Sharma", undefined, "—",
    [["Fasting Blood Sugar", 1, 120], ["HbA1c", 1, 450]], 0, 672, "UPI (PhonePe)", "Paid", undefined, "ORD-20260924-00105"),
  inv("INV-2026-01155", "2026-09-23", "B2B", "B2B-001", "ABC Diagnostics", undefined, "27AAACA1234B1Z2",
    [["Pap Smear (LBC)", 1, 700]], 0, 0, "Credit", "Credit", "2026-10-07", "ORD-20260923-00104"),
  inv("INV-2026-01154", "2026-09-23", "Sub-Agency", "SUB-001", "XYZ Collection Centre", "Parent: ABC Diagnostics", "27AAECX0000A1Z9",
    [["BRCA 1&2 Mutation Analysis", 1, 9500]], 0, 0, "Credit", "Credit", "2026-10-07", "ORD-20260923-00103"),
];

// ---------- Ledger (per partner, running balance) ----------
const mkLedger = (partnerId: string, partnerName: string, rows: [string, string, LedgerEntry["type"], string, number, number][]): LedgerEntry[] => {
  let bal = 0;
  return rows.map(([id, date, type, description, debit, credit], i) => {
    bal += debit - credit;
    return { id, partnerId, partnerName, date, ref: `${type === "Invoice" ? "INV" : type === "Payment" ? "PMT" : type === "Credit Note" ? "CN" : "DN"}-2026-0${1180 - i}`, type, description, debit, credit, balance: bal };
  });
};

export const ledgerEntries: LedgerEntry[] = [
  ...mkLedger("B2B-001", "ABC Diagnostics", [
    ["L-1", "2026-09-01", "Opening", "Opening balance as on 01 Sep 2026", 62400, 0],
    ["L-2", "2026-09-05", "Invoice", "Weekly billing 01–05 Sep — 68 patients", 48230, 0],
    ["L-3", "2026-09-08", "Payment", "NEFT received (UTIB0000123)", 0, 50000],
    ["L-4", "2026-09-12", "Invoice", "Weekly billing 06–12 Sep — 74 patients", 51940, 0],
    ["L-5", "2026-09-15", "Payment", "NEFT received (UTIB0000123)", 0, 45000],
    ["L-6", "2026-09-19", "Invoice", "Weekly billing 13–19 Sep — 81 patients", 56890, 0],
    ["L-7", "2026-09-22", "Credit Note", "Rate correction — CBC 3 nos", 0, 90],
    ["L-8", "2026-09-26", "Payment", "NEFT received (UTIB0000123)", 0, 48000],
    ["L-9", "2026-09-28", "Invoice", "Billing 20–28 Sep — 46 patients (part)", 22830, 0],
  ]),
  ...mkLedger("B2B-003", "Medipoint Diagnostics", [
    ["L-10", "2026-09-01", "Opening", "Opening balance as on 01 Sep 2026", 14500, 0],
    ["L-11", "2026-09-09", "Invoice", "Fortnightly billing 01–09 Sep", 32800, 0],
    ["L-12", "2026-09-18", "Payment", "RTGS received (HDFC0000245)", 0, 20000],
    ["L-13", "2026-09-26", "Invoice", "Billing 10–26 Sep incl Full Body pkg", 61900, 0],
  ]),
  ...mkLedger("B2B-004", "CityCare Path Labs", [
    ["L-14", "2026-09-01", "Opening", "Opening balance as on 01 Sep 2026", 0, 0],
    ["L-15", "2026-09-08", "Invoice", "Weekly billing 01–08 Sep", 41250, 0],
    ["L-16", "2026-09-11", "Payment", "NEFT received (ICIC0000412)", 0, 40000],
    ["L-17", "2026-09-18", "Invoice", "Weekly billing 09–18 Sep", 44980, 0],
    ["L-18", "2026-09-22", "Payment", "NEFT received (ICIC0000412)", 0, 25000],
    ["L-19", "2026-09-27", "Invoice", "Billing 19–27 Sep incl HLA-B27", 20980, 0],
  ]),
];

// ---------- Settlements (parent ↔ child) ----------
export const settlements: Settlement[] = [
  { id: "STL-2026-09-014", period: "Sep 2026 (till 28th)", parentId: "LAB", parentName: "Apex Reference Laboratories", childId: "B2B-001", childName: "ABC Diagnostics", childType: "B2B", billed: 214890, collected: 191200, marginPct: 52, margin: 111743, payable: 22370, status: "Open", lastPayment: "2026-09-26" },
  { id: "STL-2026-09-013", period: "Sep 2026 (till 28th)", parentId: "B2B-001", parentName: "ABC Diagnostics", childId: "SUB-001", childName: "XYZ Collection Centre", childType: "Sub-Agency", billed: 184000, collected: 161700, marginPct: 18, margin: 33120, payable: 22300, status: "Partially Settled", lastPayment: "2026-09-24" },
  { id: "STL-2026-09-012", period: "Sep 2026 (till 28th)", parentId: "B2B-001", parentName: "ABC Diagnostics", childId: "SUB-002", childName: "Health Point", childType: "Sub-Agency", billed: 121500, collected: 112800, marginPct: 16, margin: 19440, payable: 8700, status: "Open", lastPayment: "2026-09-20" },
  { id: "STL-2026-09-011", period: "Sep 2026 (till 28th)", parentId: "B2B-001", parentName: "ABC Diagnostics", childId: "SUB-003", childName: "Maa Diagnostics", childType: "Sub-Agency", billed: 96800, collected: 82700, marginPct: 15, margin: 14520, payable: 14100, status: "Open", lastPayment: "2026-09-15" },
  { id: "STL-2026-09-010", period: "Sep 2026 (till 28th)", parentId: "LAB", parentName: "Apex Reference Laboratories", childId: "B2B-003", childName: "Medipoint Diagnostics", childType: "B2B", billed: 94700, collected: 61900, marginPct: 46, margin: 43562, payable: 89200, status: "Partially Settled", lastPayment: "2026-09-18" },
  { id: "STL-2026-08-044", period: "Aug 2026", parentId: "LAB", parentName: "Apex Reference Laboratories", childId: "B2B-001", childName: "ABC Diagnostics", childType: "B2B", billed: 262400, collected: 262400, marginPct: 52, margin: 136448, payable: 0, status: "Settled", lastPayment: "2026-09-05" },
  { id: "STL-2026-08-040", period: "Aug 2026", parentId: "B2B-001", parentName: "ABC Diagnostics", childId: "SUB-001", childName: "XYZ Collection Centre", childType: "Sub-Agency", billed: 176900, collected: 176900, marginPct: 18, margin: 31842, payable: 0, status: "Settled", lastPayment: "2026-09-03" },
  { id: "STL-2026-09-009", period: "Sep 2026 (till 28th)", parentId: "LAB", parentName: "Apex Reference Laboratories", childId: "B2B-002", childName: "HealthPoint Collection Centre", childType: "B2B", billed: 88400, collected: 62050, marginPct: 47, margin: 41548, payable: 46750, status: "Open", lastPayment: "2026-09-18" },
  { id: "STL-2026-09-008", period: "Sep 2026 (till 28th)", parentId: "LAB", parentName: "Apex Reference Laboratories", childId: "B2B-004", childName: "CityCare Path Labs", childType: "B2B", billed: 107210, collected: 65000, marginPct: 49, margin: 52533, payable: 20400, status: "Partially Settled", lastPayment: "2026-09-22" },
  { id: "STL-2026-08-038", period: "Aug 2026", parentId: "B2B-004", parentName: "CityCare Path Labs", childId: "SUB-005", childName: "Kothrud Collection Centre", childType: "Sub-Agency", billed: 84100, collected: 84100, marginPct: 14, margin: 11774, payable: 0, status: "Settled", lastPayment: "2026-09-02" },
];

// ---------- Notifications ----------
export const notificationTemplates: NotificationTemplate[] = [
  { id: "NT-01", name: "Booking Confirmed", audience: "Patient", trigger: "Order created", channel: ["SMS", "WhatsApp"], body: "Dear {{patient_name}}, your booking {{order_id}} for {{test_count}} test(s) is confirmed. TAT: {{tat}}. — ApexLIS", enabled: true },
  { id: "NT-02", name: "Sample Collected", audience: "Patient", trigger: "Phlebotomy done", channel: ["SMS", "WhatsApp"], body: "Sample {{sample_id}} collected on {{collected_at}}. Track status: {{portal_link}} — ApexLIS", enabled: true },
  { id: "NT-03", name: "Sample Received at Lab", audience: "All", trigger: "Receiving scan", channel: ["SMS", "Portal"], body: "Sample(s) {{count}} received at Apex central lab. — ApexLIS", enabled: true },
  { id: "NT-04", name: "Report Ready", audience: "Patient", trigger: "Pathologist approved", channel: ["SMS", "Email", "WhatsApp", "Portal"], body: "Your report {{report_id}} is ready. Download: {{portal_link}} (QR verified). — ApexLIS", enabled: true },
  { id: "NT-05", name: "Sample Rejected", audience: "B2B", trigger: "Receiving rejection", channel: ["SMS", "Portal"], body: "Sample {{sample_id}} rejected: {{reason}}. Recollection requested. — ApexLIS", enabled: true },
  { id: "NT-06", name: "Payment Due Reminder", audience: "B2B", trigger: "Credit term -3 days", channel: ["Email", "SMS"], body: "Outstanding ₹{{amount}} due on {{due_date}} for account {{account}}. — ApexLIS", enabled: true },
  { id: "NT-07", name: "Pickup Assigned", audience: "B2B", trigger: "Courier assigned", channel: ["Portal"], body: "Pickup {{pickup_id}} assigned to {{rider_name}} ({{rider_mobile}}). — ApexLIS", enabled: true },
  { id: "NT-08", name: "Report Ready (Sub-Agency)", audience: "Sub-Agency", trigger: "Pathologist approved", channel: ["Portal", "WhatsApp"], body: "{{count}} reports ready for {{agency_name}}. — ApexLIS", enabled: false },
];

export const notificationLog: NotificationLog[] = [
  { id: "N-9001", channel: "WhatsApp", template: "Report Ready", recipient: "+91 98331 22018 (Geeta Bhandari)", audience: "Patient", orderId: "ORD-20260928-00121", status: "Sent", sentAt: "2026-09-28 11:42" },
  { id: "N-9002", channel: "SMS", template: "Sample Received at Lab", recipient: "ABC Diagnostics (partner)", audience: "B2B", status: "Sent", sentAt: "2026-09-28 09:52" },
  { id: "N-9003", channel: "Portal", template: "Pickup Assigned", recipient: "HealthPoint Collection Centre", audience: "B2B", orderId: "PKP-2026-0185", status: "Sent", sentAt: "2026-09-28 10:58" },
  { id: "N-9004", channel: "SMS", template: "Booking Confirmed", recipient: "+91 98331 22001 (Rahul Sharma)", audience: "Patient", orderId: "ORD-20260928-00125", status: "Sent", sentAt: "2026-09-28 07:46" },
  { id: "N-9005", channel: "Email", template: "Payment Due Reminder", recipient: "accounts@medipoint.in", audience: "B2B", status: "Sent", sentAt: "2026-09-28 08:00" },
  { id: "N-9006", channel: "SMS", template: "Sample Rejected", recipient: "+91 98920 66778 (Zenith)", audience: "B2B", orderId: "ORD-20260925-00106", status: "Sent", sentAt: "2026-09-25 12:10" },
  { id: "N-9007", channel: "WhatsApp", template: "Report Ready", recipient: "+91 90040 34567 (Maa Diagnostics)", audience: "Sub-Agency", orderId: "ORD-20260927-00116", status: "Sent", sentAt: "2026-09-27 18:45" },
  { id: "N-9008", channel: "SMS", template: "Report Ready", recipient: "+91 98331 22019 (Nikhil Agarwal)", audience: "Patient", orderId: "ORD-20260927-00111", status: "Sent", sentAt: "2026-09-27 20:20" },
  { id: "N-9009", channel: "WhatsApp", template: "Booking Confirmed", recipient: "+91 98331 22020 (Shalini Verma)", audience: "Patient", orderId: "ORD-20260928-00120", status: "Queued", sentAt: "2026-09-28 10:06" },
  { id: "N-9010", channel: "SMS", template: "Sample Collected", recipient: "+91 98331 22007 (Rajesh Kumar)", audience: "Patient", orderId: "ORD-20260927-00115", status: "Failed", sentAt: "2026-09-27 10:16" },
];

// ---------- Staff / Users / Roles ----------
export const staff: Staff[] = [
  { id: "STF-01", name: "Anjali Deshpande", role: "Pathologist (HOD)", department: "Haematology", mobile: "+91 98200 71001", shift: "General", status: "Active", joinedOn: "2018-06-01" },
  { id: "STF-02", name: "Vikram Rao", role: "Pathologist (HOD)", department: "Biochemistry", mobile: "+91 98200 71002", shift: "General", status: "Active", joinedOn: "2017-03-15" },
  { id: "STF-03", name: "Farida Contractor", role: "Pathologist (HOD)", department: "Histopathology", mobile: "+91 98200 71003", shift: "General", status: "Active", joinedOn: "2016-11-10" },
  { id: "STF-04", name: "Kiran Wagh", role: "Senior Technician", department: "Biochemistry", mobile: "+91 98200 72001", shift: "Morning", status: "Active", joinedOn: "2019-08-20" },
  { id: "STF-05", name: "Preeti Dalvi", role: "Technician", department: "Hormones", mobile: "+91 98200 72002", shift: "Morning", status: "Active", joinedOn: "2021-02-01" },
  { id: "STF-06", name: "Nilesh Andhare", role: "Technician", department: "Molecular Biology", mobile: "+91 98200 72003", shift: "Evening", status: "Active", joinedOn: "2020-07-13" },
  { id: "STF-07", name: "Sarita Kadam", role: "Phlebotomist", department: "Collection", mobile: "+91 98200 72004", shift: "Morning", status: "Active", joinedOn: "2022-01-05" },
  { id: "STF-08", name: "Mohan Pillai", role: "Phlebotomist", department: "Collection", mobile: "+91 98200 72005", shift: "Evening", status: "Active", joinedOn: "2021-09-19" },
  { id: "STF-09", name: "Vijay Thorat", role: "Sample Receiving", department: "Receiving", mobile: "+91 98200 72006", shift: "Morning", status: "Active", joinedOn: "2020-04-27" },
  { id: "STF-10", name: "Rekha Sawant", role: "Branch Manager", department: "Thane Hub", mobile: "+91 98200 71203", shift: "General", status: "Active", joinedOn: "2019-05-30" },
  { id: "STF-11", name: "Shabana Ansari", role: "Reception", department: "Front Office", mobile: "+91 98200 72007", shift: "Morning", status: "Active", joinedOn: "2023-03-08" },
  { id: "STF-12", name: "Pravin More", role: "Accounts Executive", department: "Finance", mobile: "+91 98200 72008", shift: "General", status: "Active", joinedOn: "2022-08-11" },
  { id: "STF-13", name: "Deepak Yadav", role: "Logistics", department: "Courier Ops", mobile: "+91 98200 72009", shift: "Evening", status: "Active", joinedOn: "2023-06-21" },
  { id: "STF-14", name: "Rohit Kamble", role: "Lab Technician", department: "Microbiology", mobile: "+91 98200 72010", shift: "Night", status: "Active", joinedOn: "2024-01-15" },
];

export const users: UserAccount[] = [
  { id: "USR-01", username: "superadmin", name: "Ashwin Khorana", role: "Super Admin", lastLogin: "2026-09-28 08:02", status: "Active" },
  { id: "USR-02", username: "anjali.d", name: "Dr. Anjali Deshpande", role: "Pathologist", lastLogin: "2026-09-28 09:15", status: "Active" },
  { id: "USR-03", username: "labadmin", name: "Manisha Palekar", role: "Lab Admin", lastLogin: "2026-09-28 07:45", status: "Active" },
  { id: "USR-04", username: "abc.admin", name: "Rajesh Malhotra", role: "B2B Manager", linkedTo: "ABC Diagnostics", lastLogin: "2026-09-28 08:30", status: "Active" },
  { id: "USR-05", username: "abc.raj", name: "Raj Nair", role: "B2B User", linkedTo: "ABC Diagnostics", lastLogin: "2026-09-27 18:22", status: "Active" },
  { id: "USR-06", username: "xyz.imran", name: "Imran Qureshi", role: "Sub Agency Admin", linkedTo: "XYZ Collection Centre", lastLogin: "2026-09-28 07:10", status: "Active" },
  { id: "USR-07", username: "kiran.w", name: "Kiran Wagh", role: "Department Technician", linkedTo: "Biochemistry", lastLogin: "2026-09-28 09:40", status: "Active" },
  { id: "USR-08", username: "vijay.t", name: "Vijay Thorat", role: "Sample Receiving", lastLogin: "2026-09-28 09:55", status: "Active" },
  { id: "USR-09", username: "pravin.m", name: "Pravin More", role: "Accounts", lastLogin: "2026-09-27 17:05", status: "Active" },
  { id: "USR-10", username: "patient.rahul", name: "Rahul Sharma", role: "Patient", linkedTo: "PAT-00124", lastLogin: "2026-09-28 07:30", status: "Active" },
  { id: "USR-11", username: "zenith.farida", name: "Farida Shaikh", role: "B2B Manager", linkedTo: "Zenith Hospital Collection", lastLogin: "2026-09-26 16:40", status: "Suspended" },
  { id: "USR-12", username: "rohit.k", name: "Rohit Kamble", role: "Department Technician", linkedTo: "Microbiology", lastLogin: "2026-09-20 22:10", status: "Inactive" },
];

export const roles: RoleDef[] = [
  {
    id: "RL-01", name: "Super Admin", description: "Full system access including configuration and masters", users: 2,
    permissions: { Masters: ["view", "create", "edit", "delete"], Orders: ["view", "create", "edit", "delete"], Samples: ["view", "create", "edit", "delete"], Results: ["view", "create", "edit", "delete"], Reports: ["view", "approve", "release"], Billing: ["view", "create", "edit", "delete"], Pricing: ["view", "create", "edit", "delete"], B2B: ["view", "create", "edit", "delete"], Admin: ["view", "edit"] },
  },
  {
    id: "RL-02", name: "Lab Technician", description: "Result entry in assigned departments only", users: 14,
    permissions: { Samples: ["view"], Results: ["view", "create", "edit"], Reports: ["view"], Admin: [] },
  },
  {
    id: "RL-03", name: "Pathologist", description: "Verify, modify, approve and release reports", users: 4,
    permissions: { Samples: ["view"], Results: ["view", "edit"], Reports: ["view", "approve", "release", "reject"], Admin: ["view"] },
  },
  {
    id: "RL-04", name: "B2B Manager", description: "Own-partner scope: patients, orders, pricing, billing", users: 9,
    permissions: { Orders: ["view", "create", "edit"], Samples: ["view", "create"], Reports: ["view"], Billing: ["view"], Pricing: ["view"], Admin: [] },
  },
  {
    id: "RL-05", name: "Sub Agency Admin", description: "Own-agency scope only; cannot see parent or central pricing", users: 11,
    permissions: { Orders: ["view", "create"], Samples: ["view", "create"], Reports: ["view"], Billing: ["view"] },
  },
  {
    id: "RL-06", name: "Sample Receiving", description: "Scan manifests, verify and accept/reject samples", users: 3,
    permissions: { Samples: ["view", "edit"], Orders: ["view"], Results: [], Reports: [] },
  },
  {
    id: "RL-07", name: "Accounts", description: "Invoices, payments, ledgers, settlements", users: 4,
    permissions: { Billing: ["view", "create", "edit"], Pricing: ["view"], Orders: ["view"], Admin: ["view"] },
  },
  {
    id: "RL-08", name: "Patient", description: "Own data only: bookings, bills, reports", users: 5241,
    permissions: { Orders: ["view", "create"], Reports: ["view"], Billing: ["view"] },
  },
];

export const auditLogs: AuditLog[] = [
  { id: "AUD-8841", at: "2026-09-28 09:58", user: "vijay.t", role: "Sample Receiving", action: "RECEIVE", module: "Sample Receiving", entity: "MAN-2026-0340 (9 samples)", ip: "10.10.2.31", details: "Manifest received, 9/9 accepted, condition good" },
  { id: "AUD-8840", at: "2026-09-28 09:41", user: "abc.admin", role: "B2B Manager", action: "CREATE", module: "Orders", entity: "ORD-20260928-00123", ip: "103.21.58.14", details: "Order created via B2B portal — 3 tests, credit" },
  { id: "AUD-8839", at: "2026-09-28 09:16", user: "anjali.d", role: "Pathologist", action: "APPROVE", module: "Verification", entity: "REP-2026-001236", ip: "10.10.2.11", details: "PSA report approved with interpretation" },
  { id: "AUD-8838", at: "2026-09-28 09:02", user: "labadmin", role: "Lab Admin", action: "EDIT", module: "Pricing", entity: "PR-SUB-003-004", ip: "10.10.2.7", details: "LFT sub-agency price changed ₹360 → ₹370" },
  { id: "AUD-8837", at: "2026-09-28 08:47", user: "kiran.w", role: "Department Technician", action: "ENTER", module: "Result Entry", entity: "SMP-20260928-00893 (HBA1C)", ip: "10.10.2.44", details: "Results entered — 2 parameters, 2 flags" },
  { id: "AUD-8836", at: "2026-09-28 08:12", user: "pravin.m", role: "Accounts", action: "PAYMENT", module: "Billing", entity: "INV-2026-01176", ip: "10.10.2.9", details: "NEFT ₹490 recorded against ABC Diagnostics" },
  { id: "AUD-8835", at: "2026-09-28 07:55", user: "superadmin", role: "Super Admin", action: "EDIT", module: "Administration", entity: "RL-05 (Sub Agency Admin)", ip: "10.10.2.2", details: "Removed Reports:release permission" },
  { id: "AUD-8834", at: "2026-09-27 20:22", user: "anjali.d", role: "Pathologist", action: "APPROVE", module: "Verification", entity: "REP-2026-001235", ip: "10.10.2.11", details: "TSH/VitB12 report approved & released to B2B portal" },
  { id: "AUD-8833", at: "2026-09-27 16:40", user: "superadmin", role: "Super Admin", action: "SUSPEND", module: "Administration", entity: "B2B-006 (GreenLeaf)", ip: "10.10.2.2", details: "Account suspended — credit breach beyond 30 days" },
  { id: "AUD-8832", at: "2026-09-27 12:05", user: "vijay.t", role: "Sample Receiving", action: "REJECT", module: "Sample Receiving", entity: "SMP-20260925-00870", ip: "10.10.2.31", details: "Rejected — haemolysed serum, recollection requested" },
  { id: "AUD-8831", at: "2026-09-27 10:44", user: "xyz.imran", role: "Sub Agency Admin", action: "CREATE", module: "Pickups", entity: "PKP-2026-0186", ip: "49.36.12.201", details: "Pickup requested — 9 samples" },
];

// ---------- System config ----------
export const systemConfig: SystemConfig = {
  labName: LAB.name, tagline: LAB.tagline, address: LAB.address, city: LAB.city,
  phone: LAB.phone, email: LAB.email, gstin: LAB.gstin, cin: LAB.cin, nablCert: LAB.nabl,
  defaultGstPct: 18, invoicePrefix: "INV-2026-", reportPrefix: "REP-2026-", smsSender: LAB.smsSender,
  whatsappEnabled: true,
  reportFooter: "This is a computer generated report verified electronically. Results relate only to the specimen tested. Not valid for medico-legal purposes.",
  currency: "INR (₹)",
};

// ---------- Appointments (B2C home collection) ----------
export const appointments: Appointment[] = [
  { id: "APT-2026-0812", patientId: "PAT-00124", date: "2026-09-29", slot: "07:00 – 07:30", address: "B-702, Orchid Towers, Powai", tests: "FBS + Lipid Profile (fasting)", phlebotomist: "Sarita Kadam", status: "Scheduled" },
  { id: "APT-2026-0809", patientId: "PAT-00124", date: "2026-09-28", slot: "07:30 – 08:00", address: "B-702, Orchid Towers, Powai", tests: "CBC, TSH, Lipid", phlebotomist: "Sarita Kadam", status: "Completed" },
  { id: "APT-2026-0798", patientId: "PAT-00124", date: "2026-09-24", slot: "07:00 – 07:30", address: "B-702, Orchid Towers, Powai", tests: "FBS + HbA1c", phlebotomist: "Sarita Kadam", status: "Completed" },
  { id: "APT-2026-0771", patientId: "PAT-00124", date: "2026-09-15", slot: "08:00 – 08:30", address: "B-702, Orchid Towers, Powai", tests: "Follow-up review consult", phlebotomist: "—", status: "Cancelled" },
];

// ---------- MIS aggregates ----------
export const misDailyRevenue: MisDayPoint[] = [
  { label: "22 Sep", value: 128400 }, { label: "23 Sep", value: 141200 }, { label: "24 Sep", value: 118900 },
  { label: "25 Sep", value: 156300 }, { label: "26 Sep", value: 174800 }, { label: "27 Sep", value: 191400 },
  { label: "28 Sep", value: 87300 },
];

export const misMonthlyRevenue: MisDayPoint[] = [
  { label: "Apr", value: 2840000 }, { label: "May", value: 2975000 }, { label: "Jun", value: 2760000 },
  { label: "Jul", value: 3120000 }, { label: "Aug", value: 3384000 }, { label: "Sep*", value: 2398000 },
];

export const misChannelSplit: { label: string; value: number }[] = [
  { label: "B2B Partners", value: 58 },
  { label: "Sub-Agencies", value: 22 },
  { label: "B2C Direct", value: 20 },
];

export const misTestRevenue: MisTestRevenue[] = [
  { test: "CBC", count: 412, revenue: 844600 }, { test: "Full Body Checkup — Advanced", count: 86, revenue: 678700 },
  { test: "HbA1c", count: 268, revenue: 522600 }, { test: "Lipid Profile", count: 224, revenue: 448000 },
  { test: "TSH", count: 311, revenue: 404300 }, { test: "LFT", count: 178, revenue: 391600 },
  { test: "Vitamin D", count: 142, revenue: 369200 }, { test: "KFT", count: 164, revenue: 360800 },
  { test: "Dengue NS1", count: 121, revenue: 242000 }, { test: "Urine R/M", count: 236, revenue: 70800 },
];

export const misPartnerBusiness: MisPartnerBusiness[] = [
  { name: "ABC Diagnostics", type: "B2B", patients: 486, tests: 1298, revenue: 898400, outstanding: 118400 },
  { name: "CityCare Path Labs", type: "B2B", patients: 214, tests: 562, revenue: 341200, outstanding: 20400 },
  { name: "HealthPoint Collection Centre", type: "B2B", patients: 186, tests: 431, revenue: 228600, outstanding: 46750 },
  { name: "Medipoint Diagnostics", type: "B2B", patients: 158, tests: 388, revenue: 214300, outstanding: 89200 },
  { name: "Zenith Hospital Collection", type: "B2B", patients: 96, tests: 214, revenue: 98700, outstanding: 0 },
  { name: "XYZ Collection Centre", type: "Sub-Agency", patients: 142, tests: 356, revenue: 184000, outstanding: 22300 },
  { name: "Health Point", type: "Sub-Agency", patients: 98, tests: 244, revenue: 121500, outstanding: 8700 },
  { name: "Maa Diagnostics", type: "Sub-Agency", patients: 81, tests: 198, revenue: 96800, outstanding: 14100 },
  { name: "Kothrud Collection Centre", type: "Sub-Agency", patients: 64, tests: 171, revenue: 78050, outstanding: 6900 },
  { name: "Sunrise Collection Point", type: "Sub-Agency", patients: 42, tests: 118, revenue: 64300, outstanding: 5200 },
];

export const misAgeing: MisAgeing[] = [
  { bucket: "0 – 15 days", amount: 168400, partners: 4 },
  { bucket: "16 – 30 days", amount: 91200, partners: 3 },
  { bucket: "31 – 60 days", amount: 42600, partners: 2 },
  { bucket: "60+ days", amount: 15800, partners: 1 },
];

export const misTat: MisTat[] = [
  { department: "Haematology", withinTat: 94, delayed: 6 },
  { department: "Biochemistry", withinTat: 91, delayed: 9 },
  { department: "Hormones", withinTat: 88, delayed: 12 },
  { department: "Serology", withinTat: 90, delayed: 10 },
  { department: "Microbiology", withinTat: 84, delayed: 16 },
  { department: "Histopathology", withinTat: 78, delayed: 22 },
  { department: "Molecular Biology", withinTat: 86, delayed: 14 },
];

export const misReferral: { source: string; patients: number; tests: number; revenue: number }[] = [
  { source: "ABC Diagnostics", patients: 486, tests: 1298, revenue: 898400 },
  { source: "Dr. Suresh Mehta (Physician)", patients: 121, tests: 288, revenue: 168200 },
  { source: "CityCare Path Labs", patients: 214, tests: 562, revenue: 341200 },
  { source: "Dr. Rekha Iyer (Endo)", patients: 98, tests: 241, revenue: 152600 },
  { source: "HealthPoint Collection Centre", patients: 186, tests: 431, revenue: 228600 },
  { source: "Dr. Meenakshi Rao (Gynae)", patients: 74, tests: 165, revenue: 121400 },
  { source: "B2C Portal (Self)", patients: 264, tests: 512, revenue: 386800 },
];

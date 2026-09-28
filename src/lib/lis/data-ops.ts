import type {
  ExternalJob, LabReport, Order, OrderItem, Pickup, ResultEntryTask, ResultLine,
  Sample, VerificationTask, Flag,
} from "./types";

// ============================================================
// OPERATIONS DATA — orders, samples, logistics, results, reports
// All dates fall around the current demo date 2026-09-28
// ============================================================

const rate = (code: string): number => {
  const map: Record<string, number> = {
    CBC: 150, TSH: 220, HBA1C: 250, LFT: 300, KFT: 300, LIPID: 280, FBS: 80, VITD: 650,
    VITB12: 550, ESR: 90, "URINE-R": 110, "DENGUE-NS1": 320, WIDAL: 140, HBSAG: 170, HIV: 190,
    CRP: 280, FERR: 420, PSA: 380, PROCALC: 950, "CULTURE-UR": 360, AFB: 170, TRUGENE: 1050,
    "HLA-B27": 850, FT4: 190, "INSULIN-F": 350, BIOPSY: 1400, PAP: 700, BRCA: 9500,
    "PKG-FULL-ADV": 950, "PKG-DIABETES": 590, "PKG-FEVER": 480, "PKG-THYROID": 380,
    "PKG-SENIOR": 1250, "PKG-WOMEN": 1150,
  };
  return map[code] ?? 300;
};

export const testDisplay = (code: string): { name: string; type: "Test" | "Package" | "Profile" } => {
  const packages = ["PKG-FULL-ADV", "PKG-DIABETES", "PKG-FEVER", "PKG-THYROID", "PKG-SENIOR", "PKG-WOMEN"];
  const profiles = ["LFT", "KFT", "LIPID"];
  const names: Record<string, string> = {
    CBC: "Complete Blood Count", TSH: "TSH (Ultrasensitive)", HBA1C: "HbA1c", LFT: "Liver Function Profile",
    KFT: "Kidney Function Profile", LIPID: "Lipid Profile", FBS: "Fasting Blood Sugar", VITD: "Vitamin D (25-OH)",
    VITB12: "Vitamin B12", ESR: "ESR", "URINE-R": "Urine Routine & Microscopy", "DENGUE-NS1": "Dengue NS1 Antigen",
    WIDAL: "Widal Test", HBSAG: "HBsAg", HIV: "HIV 1&2 (4th Gen)", CRP: "hs-CRP", FERR: "Ferritin",
    PSA: "PSA (Total)", PROCALC: "Procalcitonin", "CULTURE-UR": "Urine Culture & Sensitivity", AFB: "AFB Smear",
    TRUGENE: "CBNAAT (MTB)", "HLA-B27": "HLA B27", FT4: "Free T4", "INSULIN-F": "Fasting Insulin",
    BIOPSY: "Histopathology (Biopsy)", PAP: "Pap Smear (LBC)", BRCA: "BRCA 1&2 Analysis",
    "PKG-FULL-ADV": "Full Body Checkup — Advanced", "PKG-DIABETES": "Diabetes Care Package",
    "PKG-FEVER": "Fever Panel — Basic", "PKG-THYROID": "Thyroid Care Package",
    "PKG-SENIOR": "Senior Citizen Package", "PKG-WOMEN": "Women's Wellness Package",
  };
  return { name: names[code] ?? code, type: packages.includes(code) ? "Package" : profiles.includes(code) ? "Profile" : "Test" };
};

const mkItems = (codes: string[], factor = 1, qty = 1): OrderItem[] =>
  codes.map((c) => {
    const d = testDisplay(c);
    return { code: c, name: d.name, type: d.type, qty, rate: Math.round(rate(c) * factor) };
  });

const sum = (items: OrderItem[]) => items.reduce((a, b) => a + b.rate * b.qty, 0);

interface OrderSeed {
  id: string; patientId: string; channel: "B2C" | "B2B" | "SUB"; partner?: [string, string];
  sub?: [string, string]; codes: string[]; factor?: number; disc?: number;
  payMode: Order["paymentMode"]; pay: Order["payStatus"]; status: Order["status"];
  at: string; tatDue: string; doctor?: string; home?: boolean; remarks?: string;
}

const seeds: OrderSeed[] = [
  { id: "ORD-20260928-00125", patientId: "PAT-00124", channel: "B2C", codes: ["CBC", "TSH", "LIPID"], disc: 5, payMode: "UPI", pay: "Paid", status: "Test in Progress", at: "2026-09-28T07:45:00", tatDue: "2026-09-28 18:00", doctor: "Dr. Suresh Mehta", home: true },
  { id: "ORD-20260928-00124", patientId: "PAT-00127", channel: "SUB", partner: ["B2B-001", "ABC Diagnostics"], sub: ["SUB-001", "XYZ Collection Centre"], codes: ["HBA1C", "FBS", "VITD"], disc: 0, payMode: "Credit", pay: "Credit", status: "Result Entered", at: "2026-09-28T08:10:00", tatDue: "2026-09-28 20:00", doctor: "Dr. Rekha Iyer" },
  { id: "ORD-20260928-00123", patientId: "PAT-00125", channel: "B2B", partner: ["B2B-001", "ABC Diagnostics"], codes: ["CBC", "ESR", "CRP"], disc: 0, payMode: "Credit", pay: "Credit", status: "Received at Lab", at: "2026-09-28T09:02:00", tatDue: "2026-09-28 18:00" },
  { id: "ORD-20260928-00122", patientId: "PAT-00139", channel: "B2C", codes: ["PKG-SENIOR"], disc: 10, payMode: "Card", pay: "Paid", status: "Sample Collected", at: "2026-09-28T09:25:00", tatDue: "2026-09-29 14:00", doctor: "Dr. Suresh Mehta", home: true },
  { id: "ORD-20260928-00121", patientId: "PAT-00141", channel: "B2B", partner: ["B2B-001", "ABC Diagnostics"], codes: ["TSH", "FT4"], disc: 0, payMode: "Credit", pay: "Credit", status: "Verification Pending", at: "2026-09-28T09:40:00", tatDue: "2026-09-28 21:00", doctor: "Dr. Rekha Iyer" },
  { id: "ORD-20260928-00120", patientId: "PAT-00143", channel: "B2B", partner: ["B2B-005", "Zenith Hospital Collection"], codes: ["LIPID", "FBS", "KFT"], disc: 0, payMode: "Credit", pay: "Partial", status: "Assigned to Department", at: "2026-09-28T10:05:00", tatDue: "2026-09-28 20:00" },
  { id: "ORD-20260928-00119", patientId: "PAT-00126", channel: "B2B", partner: ["B2B-002", "HealthPoint Collection Centre"], codes: ["PKG-DIABETES"], disc: 0, payMode: "Credit", pay: "Credit", status: "In Transit", at: "2026-09-28T10:30:00", tatDue: "2026-09-29 12:00" },
  { id: "ORD-20260928-00118", patientId: "PAT-00128", channel: "B2C", codes: ["DENGUE-NS1", "CBC", "WIDAL"], disc: 0, payMode: "Cash", pay: "Paid", status: "Pickup Requested", at: "2026-09-28T11:00:00", tatDue: "2026-09-28 20:00", remarks: "Fever since 3 days, urgent" },
  { id: "ORD-20260928-00117", patientId: "PAT-00131", channel: "SUB", partner: ["B2B-002", "HealthPoint Collection Centre"], sub: ["SUB-004", "Sunrise Collection Point"], codes: ["CBC", "URINE-R"], disc: 0, payMode: "Credit", pay: "Credit", status: "Picked Up", at: "2026-09-28T11:20:00", tatDue: "2026-09-28 19:00" },
  { id: "ORD-20260928-00116", patientId: "PAT-00133", channel: "SUB", partner: ["B2B-001", "ABC Diagnostics"], sub: ["SUB-003", "Maa Diagnostics"], codes: ["TSH", "VITB12"], disc: 0, payMode: "Credit", pay: "Credit", status: "Report Delivered", at: "2026-09-27T09:15:00", tatDue: "2026-09-27 22:00" },
  { id: "ORD-20260927-00115", patientId: "PAT-00130", channel: "B2B", partner: ["B2B-001", "ABC Diagnostics"], codes: ["PSA", "URINE-R"], disc: 0, payMode: "Credit", pay: "Credit", status: "Report Generated", at: "2026-09-27T10:00:00", tatDue: "2026-09-27 22:00" },
  { id: "ORD-20260927-00114", patientId: "PAT-00136", channel: "B2B", partner: ["B2B-004", "CityCare Path Labs"], codes: ["CBC", "LFT"], disc: 0, payMode: "Credit", pay: "Credit", status: "Report Delivered", at: "2026-09-27T10:40:00", tatDue: "2026-09-27 22:00" },
  { id: "ORD-20260927-00113", patientId: "PAT-00137", channel: "SUB", partner: ["B2B-004", "CityCare Path Labs"], sub: ["SUB-005", "Kothrud Collection Centre"], codes: ["HBA1C", "LIPID"], disc: 0, payMode: "Credit", pay: "Credit", status: "Pathologist Approved", at: "2026-09-27T11:25:00", tatDue: "2026-09-27 23:00" },
  { id: "ORD-20260927-00112", patientId: "PAT-00140", channel: "SUB", partner: ["B2B-001", "ABC Diagnostics"], sub: ["SUB-002", "Health Point"], codes: ["CBC", "FBS"], disc: 0, payMode: "Credit", pay: "Credit", status: "Report Delivered", at: "2026-09-27T08:30:00", tatDue: "2026-09-27 20:00" },
  { id: "ORD-20260927-00111", patientId: "PAT-00142", channel: "B2C", codes: ["VITD"], disc: 15, payMode: "UPI", pay: "Paid", status: "Report Delivered", at: "2026-09-27T12:10:00", tatDue: "2026-09-28 12:00", remarks: "Promo price ₹999 applied" },
  { id: "ORD-20260927-00110", patientId: "PAT-00132", channel: "B2C", codes: ["BIOPSY"], disc: 0, payMode: "NetBanking", pay: "Paid", status: "In Transit", at: "2026-09-26T15:00:00", tatDue: "2026-09-29 15:00", doctor: "Dr. Sameer Bhagwat", remarks: "Skin biopsy from left forearm" },
  { id: "ORD-20260926-00109", patientId: "PAT-00134", channel: "SUB", partner: ["B2B-001", "ABC Diagnostics"], sub: ["SUB-001", "XYZ Collection Centre"], codes: ["TRUGENE"], disc: 0, payMode: "Credit", pay: "Credit", status: "Test in Progress", at: "2026-09-26T11:45:00", tatDue: "2026-09-28 11:45", remarks: "Sputum — suspected MDR screening" },
  { id: "ORD-20260926-00108", patientId: "PAT-00129", channel: "B2B", partner: ["B2B-003", "Medipoint Diagnostics"], codes: ["PKG-FULL-ADV"], disc: 0, payMode: "Credit", pay: "Credit", status: "Report Delivered", at: "2026-09-26T09:20:00", tatDue: "2026-09-27 18:00" },
  { id: "ORD-20260926-00107", patientId: "PAT-00135", channel: "SUB", partner: ["B2B-001", "ABC Diagnostics"], sub: ["SUB-003", "Maa Diagnostics"], codes: ["CULTURE-UR"], disc: 0, payMode: "Credit", pay: "Credit", status: "Report Delivered", at: "2026-09-25T14:30:00", tatDue: "2026-09-27 14:30" },
  { id: "ORD-20260925-00106", patientId: "PAT-00138", channel: "B2B", partner: ["B2B-005", "Zenith Hospital Collection"], codes: ["CBC", "HBSAG", "HIV"], disc: 0, payMode: "Credit", pay: "Paid", status: "Sample Rejected", at: "2026-09-25T10:15:00", tatDue: "2026-09-25 22:00", remarks: "HBsAg sample haemolysed — recollection requested" },
  { id: "ORD-20260925-00105", patientId: "PAT-00124", channel: "B2C", codes: ["FBS", "HBA1C"], disc: 0, payMode: "UPI", pay: "Paid", status: "Report Delivered", at: "2026-09-24T08:50:00", tatDue: "2026-09-24 20:00" },
  { id: "ORD-20260924-00104", patientId: "PAT-00125", channel: "B2B", partner: ["B2B-001", "ABC Diagnostics"], codes: ["PAP"], disc: 0, payMode: "Credit", pay: "Credit", status: "Report Delivered", at: "2026-09-23T13:20:00", tatDue: "2026-09-25 13:20", doctor: "Dr. Meenakshi Rao" },
  { id: "ORD-20260923-00103", patientId: "PAT-00127", channel: "SUB", partner: ["B2B-001", "ABC Diagnostics"], sub: ["SUB-001", "XYZ Collection Centre"], codes: ["BRCA"], disc: 0, payMode: "Credit", pay: "Credit", status: "In Transit", at: "2026-09-22T12:00:00", tatDue: "2026-10-06 12:00", doctor: "Dr. Sameer Bhagwat", remarks: "Outsourced to Metropolis — NGS" },
  { id: "ORD-20260922-00102", patientId: "PAT-00131", channel: "SUB", partner: ["B2B-002", "HealthPoint Collection Centre"], sub: ["SUB-004", "Sunrise Collection Point"], codes: ["FERR", "CBC"], disc: 0, payMode: "Credit", pay: "Credit", status: "Report Delivered", at: "2026-09-22T09:40:00", tatDue: "2026-09-23 12:00" },
  { id: "ORD-20260921-00101", patientId: "PAT-00136", channel: "B2B", partner: ["B2B-004", "CityCare Path Labs"], codes: ["HLA-B27", "CRP", "ESR"], disc: 0, payMode: "Credit", pay: "Credit", status: "Report Delivered", at: "2026-09-21T10:30:00", tatDue: "2026-09-22 18:00" },
];

export const orders: Order[] = seeds.map((s) => {
  const items = mkItems(s.codes, s.factor ?? 1);
  const gross = sum(items);
  const discount = Math.round((gross * (s.disc ?? 0)) / 100);
  const taxable = gross - discount;
  const gst = Math.round(taxable * 0.18);
  return {
    id: s.id, patientId: s.patientId, channel: s.channel,
    partnerId: s.partner?.[0], partnerName: s.partner?.[1],
    subAgencyId: s.sub?.[0], subAgencyName: s.sub?.[1],
    items, gross, discountPct: s.disc ?? 0, discount, gstPct: 18, gst, net: taxable + gst,
    paymentMode: s.payMode, payStatus: s.pay, status: s.status, createdAt: s.at,
    collectedAt: s.status !== "Booking Confirmed" ? s.at : undefined,
    referrerDoctor: s.doctor, homeCollection: s.home ?? false, remarks: s.remarks, tatDue: s.tatDue,
  };
});

// ---------- Samples ----------
interface SampleSeed {
  id: string; orderId: string; type: string; container: string; volume: string;
  collectedBy: string; stage: Sample["stage"]; department: string;
  condition?: Sample["condition"]; tests: string[]; remarks?: string; collectedAt?: string;
}

export const sampleSeeds: SampleSeed[] = [
  { id: "SMP-20260928-00891", orderId: "ORD-20260928-00125", type: "Whole Blood EDTA", container: "EDTA Vacutainer (Lavender)", volume: "3 mL", collectedBy: "Sarita Kadam", stage: "Test in Progress", department: "Haematology", tests: ["CBC", "TSH", "LIPID"], collectedAt: "2026-09-28T08:05:00" },
  { id: "SMP-20260928-00892", orderId: "ORD-20260928-00125", type: "Serum", container: "Plain Vacutainer (Red)", volume: "5 mL", collectedBy: "Sarita Kadam", stage: "Test in Progress", department: "Biochemistry", tests: ["TSH", "LIPID"], collectedAt: "2026-09-28T08:05:00" },
  { id: "SMP-20260928-00893", orderId: "ORD-20260928-00124", type: "Whole Blood EDTA", container: "EDTA Vacutainer (Lavender)", volume: "3 mL", collectedBy: "Imran Qureshi", stage: "Result Entered", department: "Biochemistry", tests: ["HBA1C", "VITD"], collectedAt: "2026-09-28T08:30:00" },
  { id: "SMP-20260928-00894", orderId: "ORD-20260928-00124", type: "Whole Blood Fluoride", container: "Fluoride Oxalate (Grey)", volume: "2 mL", collectedBy: "Imran Qureshi", stage: "Result Entered", department: "Biochemistry", tests: ["FBS"], collectedAt: "2026-09-28T08:30:00" },
  { id: "SMP-20260928-00895", orderId: "ORD-20260928-00123", type: "Whole Blood EDTA", container: "EDTA Vacutainer (Lavender)", volume: "3 mL", collectedBy: "Rajesh Malhotra", stage: "Sample Accepted", department: "—", tests: ["CBC", "ESR", "CRP"], collectedAt: "2026-09-28T08:45:00" },
  { id: "SMP-20260928-00896", orderId: "ORD-20260928-00122", type: "Whole Blood EDTA", container: "EDTA Vacutainer (Lavender)", volume: "3 mL", collectedBy: "Mohan Pillai", stage: "Sample Collected", department: "—", tests: ["PKG-SENIOR"], collectedAt: "2026-09-28T09:40:00", remarks: "Home collection — Matunga" },
  { id: "SMP-20260928-00897", orderId: "ORD-20260928-00122", type: "Serum", container: "Plain Vacutainer (Red)", volume: "8 mL", collectedBy: "Mohan Pillai", stage: "Sample Collected", department: "—", tests: ["PKG-SENIOR"], collectedAt: "2026-09-28T09:40:00" },
  { id: "SMP-20260928-00898", orderId: "ORD-20260928-00121", type: "Serum", container: "Plain Vacutainer (Red)", volume: "4 mL", collectedBy: "Rajesh Malhotra", stage: "Verification Pending", department: "Hormones", tests: ["TSH", "FT4"], collectedAt: "2026-09-28T09:55:00" },
  { id: "SMP-20260928-00899", orderId: "ORD-20260928-00120", type: "Serum", container: "Plain Vacutainer (Red)", volume: "6 mL", collectedBy: "Farida Shaikh", stage: "Assigned to Department", department: "Biochemistry", tests: ["LIPID", "FBS", "KFT"], collectedAt: "2026-09-28T10:20:00" },
  { id: "SMP-20260928-00900", orderId: "ORD-20260928-00119", type: "Whole Blood EDTA", container: "EDTA Vacutainer (Lavender)", volume: "3 mL", collectedBy: "Sunita Rane", stage: "In Transit", department: "—", tests: ["PKG-DIABETES"], collectedAt: "2026-09-28T10:45:00" },
  { id: "SMP-20260928-00901", orderId: "ORD-20260928-00119", type: "Whole Blood Fluoride", container: "Fluoride Oxalate (Grey)", volume: "2 mL", collectedBy: "Sunita Rane", stage: "In Transit", department: "—", tests: ["PKG-DIABETES"], collectedAt: "2026-09-28T10:45:00" },
  { id: "SMP-20260928-00902", orderId: "ORD-20260928-00118", type: "Serum", container: "Plain Vacutainer (Red)", volume: "4 mL", collectedBy: "Sarita Kadam", stage: "Pickup Requested", department: "—", tests: ["DENGUE-NS1", "WIDAL"], collectedAt: "2026-09-28T11:15:00", remarks: "Fever case — keep 2–8°C" },
  { id: "SMP-20260928-00903", orderId: "ORD-20260928-00117", type: "Whole Blood EDTA", container: "EDTA Vacutainer (Lavender)", volume: "3 mL", collectedBy: "Nitin Wagh", stage: "Picked Up", department: "—", tests: ["CBC", "URINE-R"], collectedAt: "2026-09-28T11:35:00" },
  { id: "SMP-20260927-00885", orderId: "ORD-20260927-00116", type: "Serum", container: "Plain Vacutainer (Red)", volume: "4 mL", collectedBy: "Shyam Sunder Gupta", stage: "Report Delivered", department: "Hormones", tests: ["TSH", "VITB12"], collectedAt: "2026-09-27T09:35:00" },
  { id: "SMP-20260927-00884", orderId: "ORD-20260927-00115", type: "Serum", container: "Plain Vacutainer (Red)", volume: "3 mL", collectedBy: "Rajesh Malhotra", stage: "Report Generated", department: "Hormones", tests: ["PSA"], collectedAt: "2026-09-27T10:15:00" },
  { id: "SMP-20260927-00883", orderId: "ORD-20260927-00114", type: "Whole Blood EDTA", container: "EDTA Vacutainer (Lavender)", volume: "4 mL", collectedBy: "Vivek Joshi", stage: "Report Delivered", department: "Haematology", tests: ["CBC"], collectedAt: "2026-09-27T11:00:00" },
  { id: "SMP-20260927-00882", orderId: "ORD-20260927-00114", type: "Serum", container: "Plain Vacutainer (Red)", volume: "5 mL", collectedBy: "Vivek Joshi", stage: "Report Delivered", department: "Biochemistry", tests: ["LFT"], collectedAt: "2026-09-27T11:00:00" },
  { id: "SMP-20260926-00878", orderId: "ORD-20260926-00110", type: "Tissue / Block", container: "Formalin Pot (10%)", volume: "1.2 cm specimen", collectedBy: "Dr. Bhagwat OPD", stage: "Test in Progress", department: "Histopathology", tests: ["BIOPSY"], collectedAt: "2026-09-26T15:20:00", remarks: "Grossing done 27-Sep, blocks R1–R3" },
  { id: "SMP-20260926-00877", orderId: "ORD-20260926-00109", type: "Sputum", container: "Sterile Container", volume: "4 mL", collectedBy: "Imran Qureshi", stage: "Test in Progress", department: "Molecular Biology", tests: ["TRUGENE"], collectedAt: "2026-09-26T12:05:00" },
  { id: "SMP-20260925-00870", orderId: "ORD-20260925-00106", type: "Serum", container: "Plain Vacutainer (Red)", volume: "3 mL", collectedBy: "Farida Shaikh", stage: "Sample Rejected", department: "Serology", condition: "Damaged", tests: ["HBSAG", "HIV"], remarks: "Haemolysed — recollection requested from Zenith" },
  { id: "SMP-20260922-00844", orderId: "ORD-20260923-00103", type: "Whole Blood EDTA", container: "EDTA Vacutainer (Lavender)", volume: "6 mL", collectedBy: "Imran Qureshi", stage: "In Transit", department: "Molecular Biology", tests: ["BRCA"], collectedAt: "2026-09-23T12:20:00", remarks: "For Metropolis dispatch — NGS" },
];

export const samples: Sample[] = sampleSeeds.map((s) => {
  const o = orders.find((x) => x.id === s.orderId);
  const p = o ? o.patientId : "PAT-00124";
  return {
    id: s.id, orderId: s.orderId, patientId: p,
    patientName: "", // filled in data.ts to avoid circular import at module level
    type: s.type, container: s.container, volume: s.volume,
    collectedAt: s.collectedAt ?? "", collectedBy: s.collectedBy,
    source: o ? (o.channel === "B2C" ? "B2C Direct" : o.partnerName ?? "") : "",
    stage: s.stage, department: s.department, condition: s.condition ?? "Good",
    receivedAt: ["Sample Accepted", "Assigned to Department", "Test in Progress", "Result Entered", "Verification Pending", "Pathologist Approved", "Report Generated", "Report Delivered", "Sample Rejected"].includes(s.stage)
      ? s.collectedAt ?? "" : undefined,
    receivedBy: ["Sample Accepted", "Assigned to Department", "Test in Progress", "Result Entered", "Verification Pending", "Pathologist Approved", "Report Generated", "Report Delivered", "Sample Rejected"].includes(s.stage)
      ? "Vijay Thorat (Receiving)" : undefined,
    tests: s.tests, remarks: s.remarks,
  };
});

// ---------- Pickup / logistics ----------
export const pickups: Pickup[] = [
  {
    id: "PKP-2026-0187", requestedBy: "ABC Diagnostics", requesterType: "B2B", parentId: "B2B-001",
    sampleCount: 18, samples: ["SMP-20260928-00904", "SMP-20260928-00905", "SMP-20260928-00906", "+15 more"],
    address: "Shop 4, Laxmi Ind. Estate, Andheri West", city: "Mumbai", requestedAt: "2026-09-28T09:30:00",
    pickupWindow: "28 Sep, 12:00–13:00", courier: "BlueDart Med Express", riderName: "Deepak Yadav",
    riderMobile: "+91 98330 51001", status: "In Transit", manifestNo: "MAN-2026-0341",
  },
  {
    id: "PKP-2026-0186", requestedBy: "XYZ Collection Centre", requesterType: "SUB", parentId: "B2B-001",
    sampleCount: 9, samples: ["SMP-20260928-00893", "SMP-20260928-00894", "SMP-20260928-00907", "+6 more"],
    address: "Unit 12, Omkar Complex, Ghatkopar East", city: "Mumbai", requestedAt: "2026-09-28T08:20:00",
    pickupWindow: "28 Sep, 10:00–11:00", courier: "LabRunners", riderName: "Salim Khan",
    riderMobile: "+91 98330 51003", status: "Received at Lab", manifestNo: "MAN-2026-0340",
    receivedAt: "2026-09-28T09:50:00",
  },
  {
    id: "PKP-2026-0185", requestedBy: "HealthPoint Collection Centre", requesterType: "B2B", parentId: "B2B-002",
    sampleCount: 12, samples: ["SMP-20260928-00900", "SMP-20260928-00901", "SMP-20260928-00908", "+9 more"],
    address: "1st Floor, Gain Insights Bldg, Thane West", city: "Thane", requestedAt: "2026-09-28T10:45:00",
    pickupWindow: "28 Sep, 13:00–14:00", courier: "Apex In-house Van", riderName: "Ramesh Bhosale",
    riderMobile: "+91 98330 51004", status: "Assigned", manifestNo: "MAN-2026-0342",
  },
  {
    id: "PKP-2026-0184", requestedBy: "Maa Diagnostics", requesterType: "SUB", parentId: "B2B-001",
    sampleCount: 6, samples: ["SMP-20260928-00909", "SMP-20260928-00910", "+4 more"],
    address: "Plot 22, SVP Nagar, Nagpada", city: "Mumbai", requestedAt: "2026-09-28T11:10:00",
    pickupWindow: "28 Sep, 15:00–16:00", courier: "— Unassigned —", riderName: "—", riderMobile: "—",
    status: "Requested", manifestNo: "MAN-2026-0343",
  },
  {
    id: "PKP-2026-0183", requestedBy: "CityCare Path Labs", requesterType: "B2B", parentId: "B2B-004",
    sampleCount: 22, samples: ["SMP-20260927-00883", "SMP-20260927-00882", "+20 more"],
    address: "118, Bhandarkar Rd, Deccan Gymkhana", city: "Pune", requestedAt: "2026-09-27T17:30:00",
    pickupWindow: "28 Sep, 07:00–08:00", courier: "Delhivery Health", riderName: "Ravi Nair",
    riderMobile: "+91 98330 51002", status: "Received at Lab", manifestNo: "MAN-2026-0338",
    receivedAt: "2026-09-28T09:10:00", exceptions: "1 sample tube cracked (SMP-20260927-00890) — recollection raised",
  },
  {
    id: "PKP-2026-0182", requestedBy: "Medipoint Diagnostics", requesterType: "B2B", parentId: "B2B-003",
    sampleCount: 14, samples: ["SMP-20260926-00875", "SMP-20260926-00876", "+12 more"],
    address: "Nashik Pune Rd, Dwarka", city: "Nashik", requestedAt: "2026-09-26T16:00:00",
    pickupWindow: "27 Sep, 07:00–08:00", courier: "Delhivery Health", riderName: "Ravi Nair",
    riderMobile: "+91 98330 51002", status: "Received at Lab", manifestNo: "MAN-2026-0335",
    receivedAt: "2026-09-27T08:40:00",
  },
];

// ---------- Result entry worklist ----------
export const resultTasks: ResultEntryTask[] = [
  { sampleId: "SMP-20260928-00891", orderId: "ORD-20260928-00125", patientName: "Rahul Sharma", patientId: "PAT-00124", ageSex: "34y / M", testName: "Complete Blood Count", testCode: "CBC", department: "Haematology", status: "Pending", collectedAt: "2026-09-28 08:05", tatDue: "2026-09-28 18:00", resultType: "Numeric" },
  { sampleId: "SMP-20260928-00892", orderId: "ORD-20260928-00125", patientName: "Rahul Sharma", patientId: "PAT-00124", ageSex: "34y / M", testName: "TSH + Lipid Profile", testCode: "TSH", department: "Biochemistry", status: "Pending", collectedAt: "2026-09-28 08:05", tatDue: "2026-09-28 18:00", resultType: "Numeric" },
  { sampleId: "SMP-20260928-00893", orderId: "ORD-20260928-00124", patientName: "Sneha Gupta", patientId: "PAT-00127", ageSex: "31y / F", testName: "HbA1c + Vitamin D", testCode: "HBA1C", department: "Biochemistry", status: "Entered", collectedAt: "2026-09-28 08:30", tatDue: "2026-09-28 20:00", resultType: "Numeric" },
  { sampleId: "SMP-20260928-00894", orderId: "ORD-20260928-00124", patientName: "Sneha Gupta", patientId: "PAT-00127", ageSex: "31y / F", testName: "Fasting Blood Sugar", testCode: "FBS", department: "Biochemistry", status: "Entered", collectedAt: "2026-09-28 08:30", tatDue: "2026-09-28 20:00", resultType: "Numeric" },
  { sampleId: "SMP-20260928-00895", orderId: "ORD-20260928-00123", patientName: "Priya Nair", patientId: "PAT-00125", ageSex: "37y / F", testName: "CBC + ESR + CRP", testCode: "CBC", department: "Haematology", status: "Pending", collectedAt: "2026-09-28 08:45", tatDue: "2026-09-28 18:00", resultType: "Numeric" },
  { sampleId: "SMP-20260928-00898", orderId: "ORD-20260928-00121", patientName: "Geeta Bhandari", patientId: "PAT-00141", ageSex: "43y / F", testName: "TSH + FT4", testCode: "TSH", department: "Hormones", status: "Tech Verified", collectedAt: "2026-09-28 09:55", tatDue: "2026-09-28 21:00", resultType: "Numeric" },
  { sampleId: "SMP-20260928-00899", orderId: "ORD-20260928-00120", patientName: "Shalini Verma", patientId: "PAT-00143", ageSex: "60y / F", testName: "Lipid + KFT", testCode: "LIPID", department: "Biochemistry", status: "Pending", collectedAt: "2026-09-28 10:20", tatDue: "2026-09-28 20:00", resultType: "Numeric" },
  { sampleId: "SMP-20260926-00877", orderId: "ORD-20260926-00109", patientName: "Arjun Singh", patientId: "PAT-00134", ageSex: "40y / M", testName: "CBNAAT (MTB)", testCode: "TRUGENE", department: "Molecular Biology", status: "Entered", collectedAt: "2026-09-26 12:05", tatDue: "2026-09-28 11:45", resultType: "Descriptive" },
  { sampleId: "SMP-20260926-00878", orderId: "ORD-20260926-00110", patientName: "Suresh Menon", patientId: "PAT-00132", ageSex: "64y / M", testName: "Histopathology (Biopsy)", testCode: "BIOPSY", department: "Histopathology", status: "Pending", collectedAt: "2026-09-26 15:20", tatDue: "2026-09-29 15:00", resultType: "Descriptive" },
];

// ---------- Result lines (for entered samples + reports) ----------
export const resultLines: ResultLine[] = [
  // CBC — Rahul Sharma (pending entry example)
  { sampleId: "SMP-20260928-00891", testCode: "CBC", testName: "Complete Blood Count", department: "Haematology", parameter: "Haemoglobin", value: "", unit: "g/dL", refRange: "13.0 – 17.0", flag: "N", method: "Photometric (SLS)", state: "Pending", enteredBy: "", enteredAt: "" },
  { sampleId: "SMP-20260928-00891", testCode: "CBC", testName: "Complete Blood Count", department: "Haematology", parameter: "Total Leucocyte Count", value: "", unit: "/µL", refRange: "4,000 – 11,000", flag: "N", method: "Impedance", state: "Pending", enteredBy: "", enteredAt: "" },
  { sampleId: "SMP-20260928-00891", testCode: "CBC", testName: "Complete Blood Count", department: "Haematology", parameter: "Platelet Count", value: "", unit: "/µL", refRange: "1.5 – 4.1 Lakh", flag: "N", method: "Impedance", state: "Pending", enteredBy: "", enteredAt: "" },
  // HbA1c — Sneha Gupta (entered)
  { sampleId: "SMP-20260928-00893", testCode: "HBA1C", testName: "Glycosylated Haemoglobin", department: "Biochemistry", parameter: "HbA1c", value: "7.8", unit: "%", refRange: "4.0 – 5.6", flag: "H", method: "HPLC", state: "Entered", enteredBy: "Kiran Wagh (Tech)", enteredAt: "2026-09-28 11:40" },
  { sampleId: "SMP-20260928-00893", testCode: "VITD", testName: "Vitamin D (25-OH)", department: "Biochemistry", parameter: "25-OH Vitamin D", value: "14.2", unit: "ng/mL", refRange: "30 – 100", flag: "L", method: "CMIA", state: "Entered", enteredBy: "Kiran Wagh (Tech)", enteredAt: "2026-09-28 11:42" },
  { sampleId: "SMP-20260928-00894", testCode: "FBS", testName: "Fasting Blood Sugar", department: "Biochemistry", parameter: "Glucose Fasting", value: "148", unit: "mg/dL", refRange: "70 – 100", flag: "H", method: "Hexokinase UV", state: "Entered", enteredBy: "Kiran Wagh (Tech)", enteredAt: "2026-09-28 11:44" },
  // TSH/FT4 — Geeta Bhandari (tech verified, pending pathologist)
  { sampleId: "SMP-20260928-00898", testCode: "TSH", testName: "TSH (Ultrasensitive)", department: "Hormones", parameter: "TSH", value: "7.2", unit: "µIU/mL", refRange: "0.4 – 4.0", flag: "H", method: "CMIA", state: "Tech Verified", enteredBy: "Preeti Dalvi (Tech)", enteredAt: "2026-09-28 10:30" },
  { sampleId: "SMP-20260928-00898", testCode: "FT4", testName: "Free T4", department: "Hormones", parameter: "Free Thyroxine", value: "0.7", unit: "ng/dL", refRange: "0.8 – 1.8", flag: "L", method: "CMIA", state: "Tech Verified", enteredBy: "Preeti Dalvi (Tech)", enteredAt: "2026-09-28 10:32" },
  // CBNAAT — Arjun Singh (descriptive, entered)
  { sampleId: "SMP-20260926-00877", testCode: "TRUGENE", testName: "CBNAAT (MTB)", department: "Molecular Biology", parameter: "M. Tuberculosis", value: "Detected", unit: "—", refRange: "Not Detected", flag: "A", method: "Real-time PCR", state: "Entered", enteredBy: "Nilesh Andhare (Tech)", enteredAt: "2026-09-28 09:10" },
  { sampleId: "SMP-20260926-00877", testCode: "TRUGENE", testName: "CBNAAT (MTB)", department: "Molecular Biology", parameter: "Rifampicin Resistance", value: "Not Detected", unit: "—", refRange: "Not Detected", flag: "N", method: "Real-time PCR", state: "Entered", enteredBy: "Nilesh Andhare (Tech)", enteredAt: "2026-09-28 09:10" },
  // Delivered reports — TSH/VitB12 Meera
  { sampleId: "SMP-20260927-00885", testCode: "TSH", testName: "TSH (Ultrasensitive)", department: "Hormones", parameter: "TSH", value: "2.9", unit: "µIU/mL", refRange: "0.4 – 4.0", flag: "N", method: "CMIA", state: "Approved", enteredBy: "Preeti Dalvi (Tech)", enteredAt: "2026-09-27 13:00" },
  { sampleId: "SMP-20260927-00885", testCode: "VITB12", testName: "Vitamin B12", department: "Biochemistry", parameter: "Vitamin B12", value: "168", unit: "pg/mL", refRange: "191 – 663", flag: "L", method: "CMIA", state: "Approved", enteredBy: "Kiran Wagh (Tech)", enteredAt: "2026-09-27 13:05" },
  // PSA — Rajesh Kumar
  { sampleId: "SMP-20260927-00884", testCode: "PSA", testName: "PSA (Total)", department: "Hormones", parameter: "PSA Total", value: "5.8", unit: "ng/mL", refRange: "0 – 4.0", flag: "H", method: "CMIA", state: "Approved", enteredBy: "Preeti Dalvi (Tech)", enteredAt: "2026-09-27 15:20" },
  // CBC/LFT — Vikas Verma delivered
  { sampleId: "SMP-20260927-00883", testCode: "CBC", testName: "Complete Blood Count", department: "Haematology", parameter: "Haemoglobin", value: "13.2", unit: "g/dL", refRange: "13.0 – 17.0", flag: "N", method: "Photometric (SLS)", state: "Approved", enteredBy: "Kiran Wagh (Tech)", enteredAt: "2026-09-27 13:30" },
  { sampleId: "SMP-20260927-00883", testCode: "CBC", testName: "Complete Blood Count", department: "Haematology", parameter: "Total Leucocyte Count", value: "12800", unit: "/µL", refRange: "4,000 – 11,000", flag: "H", method: "Impedance", state: "Approved", enteredBy: "Kiran Wagh (Tech)", enteredAt: "2026-09-27 13:30" },
  { sampleId: "SMP-20260927-00883", testCode: "CBC", testName: "Complete Blood Count", department: "Haematology", parameter: "Platelet Count", value: "2.4", unit: "Lakh/µL", refRange: "1.5 – 4.1", flag: "N", method: "Impedance", state: "Approved", enteredBy: "Kiran Wagh (Tech)", enteredAt: "2026-09-27 13:30" },
  { sampleId: "SMP-20260927-00882", testCode: "LFT", testName: "Liver Function Profile", department: "Biochemistry", parameter: "SGPT (ALT)", value: "62", unit: "U/L", refRange: "5 – 41", flag: "H", method: "IFCC Kinetic", state: "Approved", enteredBy: "Kiran Wagh (Tech)", enteredAt: "2026-09-27 13:35" },
  { sampleId: "SMP-20260927-00882", testCode: "LFT", testName: "Liver Function Profile", department: "Biochemistry", parameter: "SGOT (AST)", value: "38", unit: "U/L", refRange: "5 – 40", flag: "N", method: "IFCC Kinetic", state: "Approved", enteredBy: "Kiran Wagh (Tech)", enteredAt: "2026-09-27 13:35" },
  { sampleId: "SMP-20260927-00882", testCode: "LFT", testName: "Liver Function Profile", department: "Biochemistry", parameter: "Total Bilirubin", value: "0.9", unit: "mg/dL", refRange: "0.3 – 1.2", flag: "N", method: "Diazo", state: "Approved", enteredBy: "Kiran Wagh (Tech)", enteredAt: "2026-09-27 13:35" },
  // HbA1c/LIPID — Pooja Shetty delivered
  { sampleId: "SMP-20260927-00881", testCode: "HBA1C", testName: "HbA1c", department: "Biochemistry", parameter: "HbA1c", value: "5.4", unit: "%", refRange: "4.0 – 5.6", flag: "N", method: "HPLC", state: "Approved", enteredBy: "Kiran Wagh (Tech)", enteredAt: "2026-09-27 14:10" },
  { sampleId: "SMP-20260927-00881", testCode: "LIPID", testName: "Lipid Profile", department: "Biochemistry", parameter: "Total Cholesterol", value: "196", unit: "mg/dL", refRange: "< 200", flag: "N", method: "CHOD-PAP", state: "Approved", enteredBy: "Kiran Wagh (Tech)", enteredAt: "2026-09-27 14:12" },
  { sampleId: "SMP-20260927-00881", testCode: "LIPID", testName: "Lipid Profile", department: "Biochemistry", parameter: "Triglycerides", value: "178", unit: "mg/dL", refRange: "< 150", flag: "H", method: "GPO-PAP", state: "Approved", enteredBy: "Kiran Wagh (Tech)", enteredAt: "2026-09-27 14:12" },
  { sampleId: "SMP-20260927-00881", testCode: "LIPID", testName: "Lipid Profile", department: "Biochemistry", parameter: "HDL Cholesterol", value: "44", unit: "mg/dL", refRange: "> 40", flag: "N", method: "Enzymatic", state: "Approved", enteredBy: "Kiran Wagh (Tech)", enteredAt: "2026-09-27 14:12" },
  { sampleId: "SMP-20260927-00881", testCode: "LIPID", testName: "Lipid Profile", department: "Biochemistry", parameter: "LDL Cholesterol", value: "116", unit: "mg/dL", refRange: "< 100", flag: "H", method: "Friedewald", state: "Approved", enteredBy: "Kiran Wagh (Tech)", enteredAt: "2026-09-27 14:12" },
];

// ---------- Verification queue ----------
export const verificationTasks: VerificationTask[] = [
  { reportId: "REP-2026-001242", sampleId: "SMP-20260928-00898", orderId: "ORD-20260928-00121", patientName: "Geeta Bhandari", ageSex: "43y / F", tests: "TSH + Free T4", department: "Hormones", enteredBy: "Preeti Dalvi (Tech)", enteredAt: "2026-09-28 10:35", status: "Pending Pathologist Approval", priority: "Routine" },
  { reportId: "REP-2026-001241", sampleId: "SMP-20260928-00893", orderId: "ORD-20260928-00124", patientName: "Sneha Gupta", ageSex: "31y / F", tests: "HbA1c + Vit D + FBS", department: "Biochemistry", enteredBy: "Kiran Wagh (Tech)", enteredAt: "2026-09-28 11:45", status: "Pending Pathologist Approval", priority: "Routine" },
  { reportId: "REP-2026-001240", sampleId: "SMP-20260926-00877", orderId: "ORD-20260926-00109", patientName: "Arjun Singh", ageSex: "40y / M", tests: "CBNAAT (MTB)", department: "Molecular Biology", enteredBy: "Nilesh Andhare (Tech)", enteredAt: "2026-09-28 09:15", status: "Pending Technical Review", priority: "Urgent" },
  { reportId: "REP-2026-001239", sampleId: "SMP-20260926-00878", orderId: "ORD-20260926-00110", patientName: "Suresh Menon", ageSex: "64y / M", tests: "Histopathology — Skin Biopsy", department: "Histopathology", enteredBy: "Dr. Farida Contractor", enteredAt: "—", status: "Pending Technical Review", priority: "Routine" },
  { reportId: "REP-2026-001236", sampleId: "SMP-20260927-00884", orderId: "ORD-20260927-00115", patientName: "Rajesh Kumar", ageSex: "57y / M", tests: "PSA (Total)", department: "Hormones", enteredBy: "Preeti Dalvi (Tech)", enteredAt: "2026-09-27 15:25", pathologist: "Dr. Anjali Deshpande", status: "Approved", priority: "Routine" },
  { reportId: "REP-2026-001230", sampleId: "SMP-20260928-00895", orderId: "ORD-20260928-00123", patientName: "Priya Nair", ageSex: "37y / F", tests: "CBC", department: "Haematology", enteredBy: "—", enteredAt: "—", status: "Sent Back", priority: "Routine" },
];

// ---------- Reports registry ----------
export const reports: LabReport[] = [
  { id: "REP-2026-001235", orderId: "ORD-20260927-00116", sampleId: "SMP-20260927-00885", patientId: "PAT-00133", status: "Delivered", tests: ["TSH", "VITB12"], department: "Hormones / Biochemistry", pathologist: "Dr. Anjali Deshpande", pathologistQual: "MD (Pathology)", releasedAt: "2026-09-27 18:40", collectedAt: "2026-09-27 09:35", receivedAt: "2026-09-27 11:10", reportedAt: "2026-09-27 18:40", deliveredVia: "B2B Portal", source: "Maa Diagnostics (via ABC Diagnostics)", qrToken: "APX-VER-77QK4M2Z", interpretation: "TSH within normal limits. Vitamin B12 low — supplementation advised; repeat after 8 weeks of therapy.", comments: "Fasting sample received in good condition.", kind: "Numeric" },
  { id: "REP-2026-001236", orderId: "ORD-20260927-00115", sampleId: "SMP-20260927-00884", patientId: "PAT-00130", status: "Approved", tests: ["PSA"], department: "Hormones", pathologist: "Dr. Anjali Deshpande", pathologistQual: "MD (Pathology)", releasedAt: "2026-09-27 17:20", collectedAt: "2026-09-27 10:15", receivedAt: "2026-09-27 11:30", reportedAt: "2026-09-27 17:20", deliveredVia: "—", source: "ABC Diagnostics", qrToken: "APX-VER-92LM8N4Q", interpretation: "PSA mildly elevated for age. Recommend urological evaluation and repeat with Free PSA ratio.", comments: "", kind: "Numeric" },
  { id: "REP-2026-001237", orderId: "ORD-20260927-00114", sampleId: "SMP-20260927-00883", patientId: "PAT-00136", status: "Delivered", tests: ["CBC"], department: "Haematology", pathologist: "Dr. Anjali Deshpande", pathologistQual: "MD (Pathology)", releasedAt: "2026-09-27 16:05", collectedAt: "2026-09-27 11:00", receivedAt: "2026-09-27 12:20", reportedAt: "2026-09-27 16:05", deliveredVia: "B2B Portal", source: "CityCare Path Labs", qrToken: "APX-VER-15XZ6T8W", interpretation: "Leucocytosis with neutrophilia — suggests bacterial infection. Correlate clinically.", comments: "Peripheral smear reviewed by pathologist.", kind: "Numeric" },
  { id: "REP-2026-001238", orderId: "ORD-20260927-00114", sampleId: "SMP-20260927-00882", patientId: "PAT-00136", status: "Delivered", tests: ["LFT"], department: "Biochemistry", pathologist: "Dr. Vikram Rao", pathologistQual: "MD (Biochemistry), DNB", releasedAt: "2026-09-27 16:30", collectedAt: "2026-09-27 11:00", receivedAt: "2026-09-27 12:20", reportedAt: "2026-09-27 16:30", deliveredVia: "B2B Portal", source: "CityCare Path Labs", qrToken: "APX-VER-63PK9R1V", interpretation: "Isolated SGPT elevation (1.5× ULN). Advise repeat after 4–6 weeks; consider fatty liver workup.", comments: "", kind: "Numeric" },
  { id: "REP-2026-001239", orderId: "ORD-20260927-00113", sampleId: "SMP-20260927-00881", patientId: "PAT-00137", status: "Delivered", tests: ["HBA1C", "LIPID"], department: "Biochemistry", pathologist: "Dr. Vikram Rao", pathologistQual: "MD (Biochemistry), DNB", releasedAt: "2026-09-27 19:45", collectedAt: "2026-09-27 12:10", receivedAt: "2026-09-27 13:40", reportedAt: "2026-09-27 19:45", deliveredVia: "B2B Portal", source: "Kothrud Collection Centre (via CityCare)", qrToken: "APX-VER-48WR2K7C", interpretation: "Glycaemic control within target. Dyslipidaemia with high LDL & TG — lifestyle modification + statin review suggested.", comments: "", kind: "Numeric" },
  { id: "REP-2026-001228", orderId: "ORD-20260926-00108", sampleId: "SMP-20260926-00872", patientId: "PAT-00129", status: "Delivered", tests: ["PKG-FULL-ADV"], department: "Multi-department", pathologist: "Dr. Anjali Deshpande", pathologistQual: "MD (Pathology)", releasedAt: "2026-09-27 20:15", collectedAt: "2026-09-26 09:40", receivedAt: "2026-09-26 11:05", reportedAt: "2026-09-27 20:15", deliveredVia: "B2B Portal", source: "Medipoint Diagnostics", qrToken: "APX-VER-31HN5P9X", interpretation: "Vitamin D deficient (12.4 ng/mL). Rest of the panel within/near normal limits. Start cholecalciferol 60K IU weekly × 8, recheck after 3 months.", comments: "Package report with 62 parameters — summary shown.", kind: "Numeric" },
  { id: "REP-2026-001222", orderId: "ORD-20260924-00105", sampleId: "SMP-20260924-00858", patientId: "PAT-00124", status: "Delivered", tests: ["FBS", "HBA1C"], department: "Biochemistry", pathologist: "Dr. Vikram Rao", pathologistQual: "MD (Biochemistry), DNB", releasedAt: "2026-09-24 19:10", collectedAt: "2026-09-24 09:05", receivedAt: "2026-09-24 10:30", reportedAt: "2026-09-24 19:10", deliveredVia: "Portal", source: "B2C Direct", qrToken: "APX-VER-06BV3L5M", interpretation: "HbA1c 6.1% — pre-diabetes range. Advise MNT referral, 30 min daily activity, repeat HbA1c in 3 months.", comments: "", kind: "Numeric" },
  { id: "REP-2026-001215", orderId: "ORD-20260923-00104", sampleId: "SMP-20260923-00852", patientId: "PAT-00125", status: "Delivered", tests: ["PAP"], department: "Histopathology", pathologist: "Dr. Farida Contractor", pathologistQual: "MD (Pathology), FRCPath", releasedAt: "2026-09-25 12:30", collectedAt: "2026-09-23 13:40", receivedAt: "2026-09-23 15:10", reportedAt: "2026-09-25 12:30", deliveredVia: "B2B Portal", source: "ABC Diagnostics", qrToken: "APX-VER-89QT4D2H", interpretation: "NILM — negative for intraepithelial lesion. Organisms: Candida species seen. Recommend routine screening interval.", comments: "Specimen adequacy: Satisfactory. Endocervical cells present.", kind: "Descriptive" },
];

// ---------- External reference lab ----------
export const externalJobs: ExternalJob[] = [
  { id: "EXT-2026-014", externalLab: "Metropolis Reference Lab — Mumbai", testCode: "BRCA", testName: "BRCA 1 & 2 Mutation Analysis (NGS)", sampleId: "SMP-20260922-00844", orderId: "ORD-20260923-00103", patientName: "Sneha Gupta", dispatchedAt: "2026-09-23 14:30", expectedTat: "14 days (by 07 Oct)", cost: 9500, billedPrice: 16500, margin: 7000, status: "In Progress at External Lab", courier: "BlueDart Med Express" },
  { id: "EXT-2026-013", externalLab: "SRL Neo Diagnostics — Andheri", testCode: "HLA-B27", testName: "HLA B27 by Flow Cytometry", sampleId: "SMP-20260921-00838", orderId: "ORD-20260921-00101", patientName: "Vikas Verma", dispatchedAt: "2026-09-21 15:10", expectedTat: "48 hrs", cost: 900, billedPrice: 1600, margin: 700, receivedAt: "2026-09-22 11:25", status: "Report Verified", courier: "LabRunners" },
  { id: "EXT-2026-012", externalLab: "Dr. Lal PathLabs — Reference", testCode: "PROCALC", testName: "Procalcitonin", sampleId: "SMP-20260920-00831", orderId: "ORD-20260920-00099", patientName: "Imran Sheikh", dispatchedAt: "2026-09-20 16:40", expectedTat: "24 hrs", cost: 1100, billedPrice: 1800, margin: 700, receivedAt: "2026-09-21 10:05", status: "Result Received", courier: "BlueDart Med Express" },
  { id: "EXT-2026-011", externalLab: "Metropolis Reference Lab — Mumbai", testCode: "KARYO", testName: "Karyotyping (Peripheral Blood)", sampleId: "SMP-20260919-00826", orderId: "ORD-20260919-00097", patientName: "Lakshmi Raman", dispatchedAt: "2026-09-19 14:55", expectedTat: "10 days", cost: 3200, billedPrice: 5500, margin: 2300, receivedAt: "2026-09-27 09:30", status: "Result Received", courier: "BlueDart Med Express" },
  { id: "EXT-2026-010", externalLab: "SRL Neo Diagnostics — Andheri", testCode: "ALLERGY", testName: "Allergy Panel (Food + Inhalant, 60)", sampleId: "SMP-20260918-00819", orderId: "ORD-20260918-00095", patientName: "Divya Iyer", dispatchedAt: "2026-09-18 17:20", expectedTat: "72 hrs", cost: 2600, billedPrice: 4500, margin: 1900, receivedAt: "2026-09-20 12:40", status: "Report Verified", courier: "LabRunners" },
  { id: "EXT-2026-015", externalLab: "—", testCode: "FREE-T3", testName: "Free Triiodothyronine (FT3)", sampleId: "SMP-20260928-00911", orderId: "ORD-20260928-00122", patientName: "Lakshmi Raman", dispatchedAt: "—", expectedTat: "24 hrs", cost: 280, billedPrice: 450, margin: 170, status: "Pending Dispatch", courier: "—" },
];

// Patient-facing simplified stages
export function patientStageIndex(status: string): number {
  if (["Booking Confirmed", "Sample Collected", "Pickup Requested", "Picked Up", "In Transit"].includes(status)) return 0;
  if (["Received at Lab", "Sample Accepted", "Assigned to Department", "Test in Progress"].includes(status)) return 1;
  if (["Result Entered"].includes(status)) return 2;
  if (["Verification Pending", "Pathologist Approved", "Sample Rejected", "Recollection Requested"].includes(status)) return 3;
  return 4;
}

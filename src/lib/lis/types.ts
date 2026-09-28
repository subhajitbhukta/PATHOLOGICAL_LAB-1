// ============================================================
// ApexLIS — Referral Lab Network Platform
// Shared type definitions (UI prototype, sample data)
// ============================================================

export type Portal = "landing" | "admin" | "b2b" | "agency" | "patient";

export type Channel = "B2C" | "B2B" | "SUB";

// ---------- Canonical workflow vocabulary ----------
export const ORDER_STATUSES = [
  "Booking Confirmed",
  "Sample Collected",
  "Pickup Requested",
  "Picked Up",
  "In Transit",
  "Received at Lab",
  "Sample Accepted",
  "Assigned to Department",
  "Test in Progress",
  "Result Entered",
  "Verification Pending",
  "Pathologist Approved",
  "Report Generated",
  "Report Delivered",
  "Sample Rejected",
  "Recollection Requested",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const INTERNAL_FLOW: OrderStatus[] = [
  "Booking Confirmed",
  "Sample Collected",
  "Pickup Requested",
  "Picked Up",
  "In Transit",
  "Received at Lab",
  "Sample Accepted",
  "Assigned to Department",
  "Test in Progress",
  "Result Entered",
  "Verification Pending",
  "Pathologist Approved",
  "Report Generated",
  "Report Delivered",
];

export type PayStatus = "Paid" | "Unpaid" | "Partial" | "Credit" | "Refunded";
export type Flag = "H" | "L" | "N" | "A";
export type ResultState = "Pending" | "Entered" | "Tech Verified" | "Approved" | "Rejected";
export type ReportStatus = "Pending Verification" | "Approved" | "Delivered" | "Draft";
export type ActiveState = "Active" | "Inactive" | "Suspended";

// ---------- Masters ----------
export interface Department {
  id: string;
  name: string;
  head: string;
  tests: number;
  tatHours: number;
  status: ActiveState;
}

export interface SampleType {
  id: string;
  name: string;
  abbreviation: string;
  container: string;
  fasting?: string;
  notes?: string;
}

export interface ContainerType {
  id: string;
  name: string;
  color: string;
  additive: string;
  volume: string;
  stock: number;
}

export interface TestRefRange {
  sex: "Male" | "Female" | "Any";
  ageGroup: string;
  range: string;
}

export interface TestMaster {
  code: string;
  name: string;
  shortName: string;
  department: string;
  sampleType: string;
  container: string;
  methodology: string;
  unit: string;
  tatHours: number;
  resultType: "Numeric" | "Text" | "Pos/Neg" | "Descriptive";
  refRanges: TestRefRange[];
  b2cPrice: number;
  group?: string;
  profile?: string;
  status: ActiveState;
  interpretation?: string;
}

export interface TestGroup {
  id: string;
  name: string;
  description: string;
  tests: string[];
  status: ActiveState;
}

export interface PackageItem {
  code: string;
  name: string;
  tests: string[];
  b2cPrice: number;
  tatHours: number;
  includes?: string;
  status: ActiveState;
}

export interface Pathologist {
  id: string;
  name: string;
  qualification: string;
  regNo: string;
  speciality: string;
  mobile: string;
  email: string;
  signatureOnFile: boolean;
  status: ActiveState;
}

export interface Branch {
  id: string;
  name: string;
  type: "Central Lab" | "Collection Centre" | "Processing Unit";
  city: string;
  address: string;
  incharge: string;
  mobile: string;
  status: ActiveState;
}

export interface Courier {
  id: string;
  name: string;
  type: "Agency" | "In-house";
  contactPerson: string;
  mobile: string;
  cities: string;
  dailyTrips: number;
  status: ActiveState;
}

export interface ReportTemplate {
  id: string;
  name: string;
  appliesTo: string;
  format: string;
  header: string;
  footer: string;
  hasQr: boolean;
  hasSignature: boolean;
  status: ActiveState;
}

// ---------- Pricing ----------
export type PriceScope = "B2C" | "B2B" | "SUB";

export interface PriceRule {
  id: string;
  testCode: string;
  testName: string;
  scope: PriceScope;
  scopeId: string; // partner id / sub agency id / "ALL" for B2C
  scopeName: string;
  price: number;
  effectiveFrom: string;
  effectiveTo?: string;
  minQty?: number;
  status: ActiveState;
}

// ---------- Network ----------
export interface SubAgency {
  id: string;
  parentId: string;
  parentName: string;
  name: string;
  city: string;
  contactPerson: string;
  mobile: string;
  email: string;
  joinedOn: string;
  status: ActiveState;
  monthlyBusiness: number;
  outstanding: number;
}

export interface Partner {
  id: string;
  code: string;
  name: string;
  city: string;
  contactPerson: string;
  mobile: string;
  email: string;
  joinedOn: string;
  creditLimit: number;
  openingBalance: number;
  outstanding: number;
  discountPct: number;
  pricingTier: string;
  subAgencies: number;
  status: ActiveState;
  lastSettlement: string;
}

// ---------- Patients ----------
export interface Patient {
  id: string;
  name: string;
  dob: string;
  age: number;
  gender: "Male" | "Female";
  mobile: string;
  email: string;
  address: string;
  city: string;
  idProof: string;
  source: string; // "B2C Walk-in" | partner name | sub agency name
  channel: Channel;
  sourceId?: string;
  registeredOn: string;
}

// ---------- Orders / Samples ----------
export interface OrderItem {
  code: string;
  name: string;
  type: "Test" | "Package" | "Profile";
  qty: number;
  rate: number;
}

export interface Order {
  id: string;
  patientId: string;
  channel: Channel;
  partnerId?: string;
  partnerName?: string;
  subAgencyId?: string;
  subAgencyName?: string;
  items: OrderItem[];
  gross: number;
  discountPct: number;
  discount: number;
  gstPct: number;
  gst: number;
  net: number;
  paymentMode: "UPI" | "Cash" | "Card" | "NetBanking" | "Credit";
  payStatus: PayStatus;
  status: OrderStatus;
  createdAt: string;
  collectedAt?: string;
  referrerDoctor?: string;
  homeCollection: boolean;
  remarks?: string;
  tatDue: string;
}

export interface Sample {
  id: string;
  orderId: string;
  patientId: string;
  patientName: string;
  type: string;
  container: string;
  volume: string;
  collectedAt: string;
  collectedBy: string;
  source: string;
  stage: OrderStatus;
  department: string;
  condition: "Good" | "Damaged" | "Leaking" | "Insufficient";
  receivedAt?: string;
  receivedBy?: string;
  tests: string[];
  remarks?: string;
}

export interface Pickup {
  id: string;
  requestedBy: string; // partner or sub-agency name
  requesterType: "B2B" | "SUB";
  parentId?: string;
  sampleCount: number;
  samples: string[];
  address: string;
  city: string;
  requestedAt: string;
  pickupWindow: string;
  courier: string;
  riderName: string;
  riderMobile: string;
  status: "Requested" | "Assigned" | "Picked Up" | "In Transit" | "Received at Lab";
  manifestNo: string;
  receivedAt?: string;
  exceptions?: string;
}

// ---------- Results / Reports ----------
export interface ResultLine {
  sampleId: string;
  testCode: string;
  testName: string;
  department: string;
  parameter: string;
  value: string;
  unit: string;
  refRange: string;
  flag: Flag;
  method: string;
  state: ResultState;
  enteredBy: string;
  enteredAt: string;
}

export interface ResultEntryTask {
  sampleId: string;
  orderId: string;
  patientName: string;
  patientId: string;
  ageSex: string;
  testName: string;
  testCode: string;
  department: string;
  status: ResultState;
  collectedAt: string;
  tatDue: string;
  resultType: TestMaster["resultType"];
}

export interface VerificationTask {
  reportId: string;
  sampleId: string;
  orderId: string;
  patientName: string;
  ageSex: string;
  tests: string;
  department: string;
  enteredBy: string;
  enteredAt: string;
  pathologist?: string;
  status: "Pending Technical Review" | "Pending Pathologist Approval" | "Approved" | "Sent Back";
  priority: "Routine" | "Urgent" | "STAT";
}

export interface LabReport {
  id: string;
  orderId: string;
  sampleId: string;
  patientId: string;
  status: ReportStatus;
  tests: string[];
  department: string;
  pathologist: string;
  pathologistQual: string;
  releasedAt: string;
  collectedAt: string;
  receivedAt: string;
  reportedAt: string;
  deliveredVia: "Portal" | "Email" | "WhatsApp" | "B2B Portal" | "—";
  source: string;
  qrToken: string;
  interpretation?: string;
  comments?: string;
  kind: "Numeric" | "Descriptive";
}

// ---------- Billing ----------
export interface InvoiceLine {
  description: string;
  hsn: string;
  qty: number;
  rate: number;
}

export interface Invoice {
  id: string;
  date: string;
  dueDate?: string;
  scope: "Patient" | "B2B" | "Sub-Agency";
  billToId: string;
  billTo: string;
  billToSub?: string;
  gstin: string;
  lines: InvoiceLine[];
  subtotal: number;
  discount: number;
  taxable: number;
  cgst: number;
  sgst: number;
  total: number;
  paid: number;
  due: number;
  mode: string;
  status: PayStatus;
  orderId?: string;
}

export interface LedgerEntry {
  id: string;
  partnerId: string;
  partnerName: string;
  date: string;
  ref: string;
  type: "Invoice" | "Payment" | "Credit Note" | "Debit Note" | "Opening";
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface Settlement {
  id: string;
  period: string;
  parentId: string;
  parentName: string;
  childId: string;
  childName: string;
  childType: "B2B" | "Sub-Agency";
  billed: number;
  collected: number;
  marginPct: number;
  margin: number;
  payable: number;
  status: "Open" | "Partially Settled" | "Settled";
  lastPayment: string;
}

// ---------- External reference lab ----------
export interface ExternalJob {
  id: string;
  externalLab: string;
  testCode: string;
  testName: string;
  sampleId: string;
  orderId: string;
  patientName: string;
  dispatchedAt: string;
  expectedTat: string;
  cost: number;
  billedPrice: number;
  margin: number;
  receivedAt?: string;
  status: "Pending Dispatch" | "Dispatched" | "In Progress at External Lab" | "Result Received" | "Report Verified";
  courier: string;
}

// ---------- Notifications ----------
export type NotifChannel = "SMS" | "Email" | "WhatsApp" | "Portal";

export interface NotificationTemplate {
  id: string;
  name: string;
  audience: "Patient" | "B2B" | "Sub-Agency" | "All";
  trigger: string;
  channel: NotifChannel[];
  body: string;
  enabled: boolean;
}

export interface NotificationLog {
  id: string;
  channel: NotifChannel;
  template: string;
  recipient: string;
  audience: string;
  orderId?: string;
  status: "Sent" | "Queued" | "Failed";
  sentAt: string;
}

// ---------- Staff / Users / Roles / Audit ----------
export interface Staff {
  id: string;
  name: string;
  role: string;
  department: string;
  mobile: string;
  shift: "Morning" | "Evening" | "Night" | "General";
  status: ActiveState;
  joinedOn: string;
}

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: string;
  linkedTo?: string;
  lastLogin: string;
  status: ActiveState;
}

export interface RoleDef {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: Record<string, string[]>;
}

export interface AuditLog {
  id: string;
  at: string;
  user: string;
  role: string;
  action: string;
  module: string;
  entity: string;
  ip: string;
  details: string;
}

// ---------- System ----------
export interface SystemConfig {
  labName: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  gstin: string;
  cin: string;
  nablCert: string;
  defaultGstPct: number;
  invoicePrefix: string;
  reportPrefix: string;
  smsSender: string;
  whatsappEnabled: boolean;
  reportFooter: string;
  currency: string;
}

// ---------- Appointments (B2C) ----------
export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  slot: string;
  address: string;
  tests: string;
  phlebotomist: string;
  status: "Scheduled" | "Completed" | "Cancelled";
}

// ---------- MIS ----------
export interface MisDayPoint {
  label: string;
  value: number;
}

export interface MisTestRevenue {
  test: string;
  count: number;
  revenue: number;
}

export interface MisPartnerBusiness {
  name: string;
  type: "B2B" | "Sub-Agency";
  patients: number;
  tests: number;
  revenue: number;
  outstanding: number;
}

export interface MisAgeing {
  bucket: string;
  amount: number;
  partners: number;
}

export interface MisTat {
  department: string;
  withinTat: number;
  delayed: number;
}

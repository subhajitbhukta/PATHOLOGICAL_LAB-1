import type {
  Branch, ContainerType, Courier, Department, PackageItem, Partner, Patient,
  Pathologist, PriceRule, ReportTemplate, SampleType, SubAgency, TestGroup, TestMaster,
} from "./types";

// ============================================================
// CORE MASTER DATA — Apex Reference Laboratories (sample)
// ============================================================

export const LAB = {
  name: "Apex Reference Laboratories",
  short: "Apex Labs",
  tagline: "Central Reference Laboratory Network",
  address: "Plot 14, MIDC Health Square, Andheri East",
  city: "Mumbai 400 093, Maharashtra",
  phone: "+91 22 4890 1234",
  email: "care@apexlabs.in",
  gstin: "27ABCDE1234F1Z5",
  cin: "U85110MH2012PTC234567",
  nabl: "NABL ISO 15189:2022 · Cert No. MC-4521",
  smsSender: "APEXLB",
};

export const departments: Department[] = [
  { id: "DEP-01", name: "Haematology", head: "Dr. Anjali Deshpande", tests: 34, tatHours: 6, status: "Active" },
  { id: "DEP-02", name: "Biochemistry", head: "Dr. Vikram Rao", tests: 58, tatHours: 8, status: "Active" },
  { id: "DEP-03", name: "Clinical Pathology", head: "Dr. Neha Kulkarni", tests: 21, tatHours: 6, status: "Active" },
  { id: "DEP-04", name: "Microbiology", head: "Dr. Sanjay Mukherjee", tests: 27, tatHours: 48, status: "Active" },
  { id: "DEP-05", name: "Serology", head: "Dr. Neha Kulkarni", tests: 16, tatHours: 12, status: "Active" },
  { id: "DEP-06", name: "Immunology", head: "Dr. Vikram Rao", tests: 19, tatHours: 24, status: "Active" },
  { id: "DEP-07", name: "Hormones", head: "Dr. Anjali Deshpande", tests: 23, tatHours: 12, status: "Active" },
  { id: "DEP-08", name: "Histopathology", head: "Dr. Farida Contractor", tests: 12, tatHours: 72, status: "Active" },
  { id: "DEP-09", name: "Molecular Biology", head: "Dr. Sanjay Mukherjee", tests: 14, tatHours: 36, status: "Active" },
];

export const sampleTypes: SampleType[] = [
  { id: "ST-01", name: "Whole Blood EDTA", abbreviation: "WB-EDTA", container: "EDTA Vacutainer (Lavender)", fasting: "Not required", notes: "Invert 8–10 times immediately after collection" },
  { id: "ST-02", name: "Whole Blood Fluoride", abbreviation: "WB-FL", container: "Fluoride Oxalate (Grey)", fasting: "8–10 hrs fasting", notes: "For glucose / HbA1c estimation" },
  { id: "ST-03", name: "Serum", abbreviation: "SER", container: "Plain Vacutainer (Red)", fasting: "10–12 hrs for lipids", notes: "Allow 30 min clotting, centrifuge 3000 rpm" },
  { id: "ST-04", name: "Plasma Citrate", abbreviation: "PC", container: "Sodium Citrate (Blue)", fasting: "Not required", notes: "Fill to 100% draw mark, for coagulation" },
  { id: "ST-05", name: "Urine (Random)", abbreviation: "UR", container: "Sterile Container", fasting: "Not required", notes: "Midstream clean catch preferred" },
  { id: "ST-06", name: "Stool", abbreviation: "ST", container: "Sterile Container", fasting: "Not required" },
  { id: "ST-07", name: "Sputum", abbreviation: "SPU", container: "Sterile Container", fasting: "Morning sample", notes: "Deep cough, not saliva" },
  { id: "ST-08", name: "Throat Swab", abbreviation: "SWB", container: "AFP Swab Stick", notes: "Transport within 2 hrs" },
  { id: "ST-09", name: "Tissue / Block", abbreviation: "TIS", container: "Formalin Pot (10%)", notes: "Ratio 1:10 tissue to formalin" },
  { id: "ST-10", name: "Swab (Viral)", abbreviation: "VSW", container: "VTM Swab", notes: "Store 2–8°C, for molecular panels" },
];

export const containers: ContainerType[] = [
  { id: "CT-01", name: "EDTA Vacutainer", color: "Lavender", additive: "K2 EDTA", volume: "3 mL", stock: 860 },
  { id: "CT-02", name: "Fluoride Oxalate", color: "Grey", additive: "NaF + K Oxalate", volume: "2 mL", stock: 420 },
  { id: "CT-03", name: "Plain Vacutainer", color: "Red", additive: "Clot activator", volume: "5 mL", stock: 1240 },
  { id: "CT-04", name: "Sodium Citrate", color: "Blue", additive: "3.2% Tri-sodium citrate", volume: "2.7 mL", stock: 310 },
  { id: "CT-05", name: "Sterile Container", color: "Transparent", additive: "None", volume: "30 mL", stock: 980 },
  { id: "CT-06", name: "AFP Swab Stick", color: "White", additive: "Charcoal transport", volume: "—", stock: 150 },
  { id: "CT-07", name: "Formalin Pot", color: "White pot", additive: "10% Neutral buffered formalin", volume: "60 mL", stock: 90 },
  { id: "CT-08", name: "VTM Swab", color: "Red cap", additive: "Viral Transport Medium", volume: "3 mL", stock: 240 },
];

export const tests: TestMaster[] = [
  {
    code: "CBC", name: "Complete Blood Count (CBC)", shortName: "CBC", department: "Haematology",
    sampleType: "Whole Blood EDTA", container: "EDTA Vacutainer (Lavender)", methodology: "Flow Cytometry + Impedance",
    unit: "—", tatHours: 6, resultType: "Numeric", b2cPrice: 350, group: "Routine Haematology", status: "Active",
    refRanges: [
      { sex: "Male", ageGroup: "Adult", range: "Hb 13–17 g/dL · TLC 4000–11000 /µL · Platelets 1.5–4.1 L/µL" },
      { sex: "Female", ageGroup: "Adult", range: "Hb 12–15 g/dL · TLC 4000–11000 /µL · Platelets 1.5–4.1 L/µL" },
      { sex: "Any", ageGroup: "Child", range: "Age-specific — see age chart" },
    ],
    interpretation: "Evaluate for anaemia, infection and platelet disorders. Correlate clinically with peripheral smear findings.",
  },
  {
    code: "TSH", name: "Thyroid Stimulating Hormone (TSH)", shortName: "TSH", department: "Hormones",
    sampleType: "Serum", container: "Plain Vacutainer (Red)", methodology: "CMIA (Chemiluminescence)",
    unit: "µIU/mL", tatHours: 12, resultType: "Numeric", b2cPrice: 400, group: "Thyroid", status: "Active",
    refRanges: [
      { sex: "Any", ageGroup: "Adult", range: "0.4 – 4.0" },
      { sex: "Any", ageGroup: "Newborn (1–7 d)", range: "1.0 – 39.0" },
      { sex: "Female", ageGroup: "Pregnancy T1", range: "0.1 – 2.5" },
    ],
    interpretation: "Elevated TSH suggests hypothyroidism; suppressed TSH suggests hyperthyroidism. Confirm with Free T4.",
  },
  {
    code: "FT4", name: "Free Thyroxine (FT4)", shortName: "FT4", department: "Hormones",
    sampleType: "Serum", container: "Plain Vacutainer (Red)", methodology: "CMIA",
    unit: "ng/dL", tatHours: 12, resultType: "Numeric", b2cPrice: 350, group: "Thyroid", status: "Active",
    refRanges: [{ sex: "Any", ageGroup: "Adult", range: "0.8 – 1.8" }],
  },
  {
    code: "HBA1C", name: "Glycosylated Haemoglobin (HbA1c)", shortName: "HbA1c", department: "Biochemistry",
    sampleType: "Whole Blood EDTA", container: "EDTA Vacutainer (Lavender)", methodology: "HPLC (Ion Exchange)",
    unit: "%", tatHours: 8, resultType: "Numeric", b2cPrice: 450, group: "Diabetes", status: "Active",
    refRanges: [
      { sex: "Any", ageGroup: "Non-diabetic", range: "4.0 – 5.6" },
      { sex: "Any", ageGroup: "Pre-diabetic", range: "5.7 – 6.4" },
      { sex: "Any", ageGroup: "Diabetic (control)", range: "< 7.0" },
    ],
    interpretation: "Reflects average blood glucose over prior 8–12 weeks.",
  },
  {
    code: "LFT", name: "Liver Function Profile", shortName: "LFT", department: "Biochemistry",
    sampleType: "Serum", container: "Plain Vacutainer (Red)", methodology: "IFCC Kinetic",
    unit: "—", tatHours: 8, resultType: "Numeric", b2cPrice: 550, group: "Liver", profile: "Liver Profile", status: "Active",
    refRanges: [
      { sex: "Any", ageGroup: "Adult", range: "Bilirubin T 0.3–1.2 · SGPT 5–41 · SGOT 5–40 · ALP 40–129 U/L" },
    ],
  },
  {
    code: "KFT", name: "Kidney Function Profile", shortName: "KFT", department: "Biochemistry",
    sampleType: "Serum", container: "Plain Vacutainer (Red)", methodology: "Enzymatic / Jaffe Kinetic",
    unit: "—", tatHours: 8, resultType: "Numeric", b2cPrice: 550, group: "Kidney", profile: "Renal Profile", status: "Active",
    refRanges: [
      { sex: "Any", ageGroup: "Adult", range: "Urea 17–43 · Creatinine M 0.7–1.3 / F 0.6–1.1 mg/dL · Uric acid 3.5–7.2" },
    ],
  },
  {
    code: "LIPID", name: "Lipid Profile", shortName: "Lipid Profile", department: "Biochemistry",
    sampleType: "Serum", container: "Plain Vacutainer (Red)", methodology: "CHOD-PAP / Enzymatic",
    unit: "mg/dL", tatHours: 8, resultType: "Numeric", b2cPrice: 500, group: "Lipid", profile: "Cardiac Risk Panel", status: "Active",
    refRanges: [
      { sex: "Any", ageGroup: "Adult", range: "Cholesterol < 200 · TG < 150 · HDL > 40 · LDL < 100" },
    ],
    interpretation: "Assess cardiovascular risk. Fasting sample preferred but non-fasting acceptable per current guidelines.",
  },
  {
    code: "FBS", name: "Fasting Blood Sugar (Glucose Fasting)", shortName: "FBS", department: "Biochemistry",
    sampleType: "Whole Blood Fluoride", container: "Fluoride Oxalate (Grey)", methodology: "Hexokinase UV",
    unit: "mg/dL", tatHours: 4, resultType: "Numeric", b2cPrice: 120, group: "Diabetes", status: "Active",
    refRanges: [
      { sex: "Any", ageGroup: "Adult", range: "70 – 100" },
      { sex: "Any", ageGroup: "Diabetic", range: "80 – 130 (ADA target)" },
    ],
  },
  {
    code: "VITD", name: "Vitamin D (25-OH)", shortName: "Vit D", department: "Biochemistry",
    sampleType: "Serum", container: "Plain Vacutainer (Red)", methodology: "CMIA",
    unit: "ng/mL", tatHours: 24, resultType: "Numeric", b2cPrice: 1300, group: "Vitamins", status: "Active",
    refRanges: [
      { sex: "Any", ageGroup: "Adult", range: "30 – 100" },
      { sex: "Any", ageGroup: "Insufficient", range: "20 – 30" },
      { sex: "Any", ageGroup: "Deficient", range: "< 20" },
    ],
  },
  {
    code: "VITB12", name: "Vitamin B12 (Cyanocobalamin)", shortName: "Vit B12", department: "Biochemistry",
    sampleType: "Serum", container: "Plain Vacutainer (Red)", methodology: "CMIA",
    unit: "pg/mL", tatHours: 24, resultType: "Numeric", b2cPrice: 1100, group: "Vitamins", status: "Active",
    refRanges: [{ sex: "Any", ageGroup: "Adult", range: "191 – 663" }],
  },
  {
    code: "FERR", name: "Ferritin", shortName: "Ferritin", department: "Immunology",
    sampleType: "Serum", container: "Plain Vacutainer (Red)", methodology: "CMIA",
    unit: "ng/mL", tatHours: 24, resultType: "Numeric", b2cPrice: 750, group: "Iron Studies", status: "Active",
    refRanges: [
      { sex: "Male", ageGroup: "Adult", range: "30 – 400" },
      { sex: "Female", ageGroup: "Adult", range: "13 – 150" },
    ],
  },
  {
    code: "ESR", name: "Erythrocyte Sedimentation Rate", shortName: "ESR", department: "Haematology",
    sampleType: "Whole Blood EDTA", container: "EDTA Vacutainer (Lavender)", methodology: "Westergren (Automated)",
    unit: "mm/hr", tatHours: 6, resultType: "Numeric", b2cPrice: 150, group: "Routine Haematology", status: "Active",
    refRanges: [
      { sex: "Male", ageGroup: "Adult", range: "0 – 15" },
      { sex: "Female", ageGroup: "Adult", range: "0 – 20" },
    ],
  },
  {
    code: "URINE-R", name: "Urine Routine & Microscopy", shortName: "Urine R/M", department: "Clinical Pathology",
    sampleType: "Urine (Random)", container: "Sterile Container", methodology: "Manual Microscopy + Dipstick",
    unit: "—", tatHours: 6, resultType: "Text", b2cPrice: 200, group: "Routine", status: "Active",
    refRanges: [{ sex: "Any", ageGroup: "Adult", range: "Protein: Nil · Sugar: Nil · Pus cells: 0–4 /HPF · Epithelial cells: 0–2 /HPF" }],
  },
  {
    code: "WIDAL", name: "Widal Test (Typhoid)", shortName: "Widal", department: "Serology",
    sampleType: "Serum", container: "Plain Vacutainer (Red)", methodology: "Slide Agglutination",
    unit: "—", tatHours: 6, resultType: "Text", b2cPrice: 250, status: "Active",
    refRanges: [{ sex: "Any", ageGroup: "Adult", range: "S. Typhi 'O' & 'H' < 1:80 dilution · A H < 1:80" }],
  },
  {
    code: "DENGUE-NS1", name: "Dengue NS1 Antigen", shortName: "Dengue NS1", department: "Serology",
    sampleType: "Serum", container: "Plain Vacutainer (Red)", methodology: "Immunochromatography",
    unit: "—", tatHours: 6, resultType: "Pos/Neg", b2cPrice: 600, group: "Fever Panel", status: "Active",
    refRanges: [{ sex: "Any", ageGroup: "Adult", range: "Negative" }],
  },
  {
    code: "HBSAG", name: "Hepatitis B Surface Antigen", shortName: "HBsAg", department: "Serology",
    sampleType: "Serum", container: "Plain Vacutainer (Red)", methodology: "CMIA",
    unit: "—", tatHours: 12, resultType: "Pos/Neg", b2cPrice: 300, status: "Active",
    refRanges: [{ sex: "Any", ageGroup: "Adult", range: "Non-Reactive ( < 1.0 S/CO )" }],
  },
  {
    code: "HIV", name: "HIV 1 & 2 Antibodies (4th Gen)", shortName: "HIV", department: "Serology",
    sampleType: "Serum", container: "Plain Vacutainer (Red)", methodology: "CMIA",
    unit: "—", tatHours: 12, resultType: "Pos/Neg", b2cPrice: 350, status: "Active",
    refRanges: [{ sex: "Any", ageGroup: "Adult", range: "Non-Reactive ( Index < 1.0 )" }],
  },
  {
    code: "CRP", name: "C-Reactive Protein (hs-CRP)", shortName: "CRP", department: "Immunology",
    sampleType: "Serum", container: "Plain Vacutainer (Red)", methodology: "Immunoturbidimetry",
    unit: "mg/L", tatHours: 6, resultType: "Numeric", b2cPrice: 500, status: "Active",
    refRanges: [{ sex: "Any", ageGroup: "Adult", range: "< 5.0 ( Cardiac risk: < 1.0 low )" }],
  },
  {
    code: "PROCALC", name: "Procalcitonin", shortName: "PCT", department: "Immunology",
    sampleType: "Serum", container: "Plain Vacutainer (Red)", methodology: "CMIA",
    unit: "ng/mL", tatHours: 12, resultType: "Numeric", b2cPrice: 1800, status: "Active",
    refRanges: [{ sex: "Any", ageGroup: "Adult", range: "< 0.05" }],
  },
  {
    code: "CULTURE-UR", name: "Urine Culture & Sensitivity", shortName: "Urine C/S", department: "Microbiology",
    sampleType: "Urine (Random)", container: "Sterile Container", methodology: "Culture + Kirby-Bauer Disc Diffusion",
    unit: "—", tatHours: 48, resultType: "Descriptive", b2cPrice: 650, status: "Active",
    refRanges: [{ sex: "Any", ageGroup: "Adult", range: "No growth after 48 hrs incubation" }],
  },
  {
    code: "AFB", name: "AFB Smear (Ziehl-Neelsen)", shortName: "AFB", department: "Microbiology",
    sampleType: "Sputum", container: "Sterile Container", methodology: "ZN Stain Microscopy",
    unit: "—", tatHours: 24, resultType: "Text", b2cPrice: 300, status: "Active",
    refRanges: [{ sex: "Any", ageGroup: "Adult", range: "No AFB seen" }],
  },
  {
    code: "TRUGENE", name: "CBNAAT (M. Tuberculosis)", shortName: "CBNAAT", department: "Molecular Biology",
    sampleType: "Sputum", container: "Sterile Container", methodology: "Real-time PCR (CBNAAT)",
    unit: "—", tatHours: 36, resultType: "Descriptive", b2cPrice: 2000, status: "Active",
    refRanges: [{ sex: "Any", ageGroup: "Adult", range: "M. TB Not Detected · Rifampicin resistance Not Detected" }],
  },
  {
    code: "BIOPSY", name: "Histopathology Examination (Biopsy)", shortName: "HPE", department: "Histopathology",
    sampleType: "Tissue / Block", container: "Formalin Pot (10%)", methodology: "H&E Sectioning · Gross + Microscopy",
    unit: "—", tatHours: 72, resultType: "Descriptive", b2cPrice: 2500, status: "Active",
    refRanges: [{ sex: "Any", ageGroup: "Any", range: "— Descriptive report —" }],
  },
  {
    code: "PAP", name: "Pap Smear (Liquid Based Cytology)", shortName: "LBC Pap", department: "Histopathology",
    sampleType: "Swab (Viral)", container: "VTM Swab", methodology: "Liquid Based Cytology",
    unit: "—", tatHours: 48, resultType: "Descriptive", b2cPrice: 1400, status: "Active",
    refRanges: [{ sex: "Female", ageGroup: "Adult", range: "Negative for intraepithelial lesion (NILM)" }],
  },
  {
    code: "BRCA", name: "BRCA 1 & 2 Mutation Analysis", shortName: "BRCA", department: "Molecular Biology",
    sampleType: "Whole Blood EDTA", container: "EDTA Vacutainer (Lavender)", methodology: "NGS (Next Generation Sequencing)",
    unit: "—", tatHours: 336, resultType: "Descriptive", b2cPrice: 16500, status: "Active",
    refRanges: [{ sex: "Female", ageGroup: "Adult", range: "No pathogenic variant detected" }],
    interpretation: "Outsourced to Metropolis Reference Lab. Genetic counselling recommended before and after testing.",
  },
  {
    code: "HLA-B27", name: "HLA B27 (Flow Cytometry)", shortName: "HLA-B27", department: "Immunology",
    sampleType: "Whole Blood EDTA", container: "EDTA Vacutainer (Lavender)", methodology: "Flow Cytometry",
    unit: "—", tatHours: 48, resultType: "Pos/Neg", b2cPrice: 1600, status: "Active",
    refRanges: [{ sex: "Any", ageGroup: "Adult", range: "Negative ( < 2% expression )" }],
  },
  {
    code: "INSULIN-F", name: "Fasting Insulin", shortName: "Insulin", department: "Hormones",
    sampleType: "Serum", container: "Plain Vacutainer (Red)", methodology: "CMIA",
    unit: "µIU/mL", tatHours: 12, resultType: "Numeric", b2cPrice: 650, status: "Active",
    refRanges: [{ sex: "Any", ageGroup: "Adult", range: "2.6 – 24.9" }],
  },
  {
    code: "PSA", name: "Prostate Specific Antigen (Total)", shortName: "PSA", department: "Hormones",
    sampleType: "Serum", container: "Plain Vacutainer (Red)", methodology: "CMIA",
    unit: "ng/mL", tatHours: 12, resultType: "Numeric", b2cPrice: 700, status: "Active",
    refRanges: [{ sex: "Male", ageGroup: "Adult (>40 yr)", range: "0 – 4.0" }],
  },
];

export const testGroups: TestGroup[] = [
  { id: "TG-01", name: "Routine Haematology", description: "CBC, ESR, Peripheral Smear and coagulation assays", tests: ["CBC", "ESR"], status: "Active" },
  { id: "TG-02", name: "Thyroid", description: "Thyroid function panel — TSH, FT3, FT4", tests: ["TSH", "FT4"], status: "Active" },
  { id: "TG-03", name: "Diabetes", description: "Glycaemic control and monitoring assays", tests: ["FBS", "HBA1C", "INSULIN-F"], status: "Active" },
  { id: "TG-04", name: "Lipid", description: "Cardiac lipid risk markers", tests: ["LIPID"], status: "Active" },
  { id: "TG-05", name: "Liver", description: "Hepatic function enzymes and bilirubin", tests: ["LFT"], status: "Active" },
  { id: "TG-06", name: "Kidney", description: "Renal function markers", tests: ["KFT"], status: "Active" },
  { id: "TG-07", name: "Vitamins", description: "Nutritional vitamin assays", tests: ["VITD", "VITB12"], status: "Active" },
  { id: "TG-08", name: "Fever Panel", description: "Seasonal fever screening assays", tests: ["DENGUE-NS1", "WIDAL", "CBC"], status: "Active" },
  { id: "TG-09", name: "Iron Studies", description: "Iron deficiency workup", tests: ["FERR"], status: "Active" },
];

export const packages: PackageItem[] = [
  {
    code: "PKG-FULL-ADV", name: "Full Body Checkup — Advanced", b2cPrice: 1999, tatHours: 24,
    tests: ["CBC", "LFT", "KFT", "LIPID", "FBS", "HBA1C", "TSH", "VITD", "VITB12", "URINE-R", "ESR"],
    includes: "62 parameters · Free doctor teleconsult · Fasting 10 hrs",
    status: "Active",
  },
  {
    code: "PKG-DIABETES", name: "Diabetes Care Package", b2cPrice: 1099, tatHours: 24,
    tests: ["FBS", "HBA1C", "LIPID", "KFT", "URINE-R", "INSULIN-F"],
    includes: "Diabetic profile with insulin resistance assessment",
    status: "Active",
  },
  {
    code: "PKG-FEVER", name: "Fever Panel — Basic", b2cPrice: 899, tatHours: 12,
    tests: ["CBC", "DENGUE-NS1", "WIDAL", "URINE-R"],
    includes: "Monsoon fever screening panel",
    status: "Active",
  },
  {
    code: "PKG-THYROID", name: "Thyroid Care Package", b2cPrice: 699, tatHours: 12,
    tests: ["TSH", "FT4", "CBC"],
    includes: "Complete thyroid screening",
    status: "Active",
  },
  {
    code: "PKG-SENIOR", name: "Senior Citizen Package (60+)", b2cPrice: 2499, tatHours: 24,
    tests: ["CBC", "LFT", "KFT", "LIPID", "FBS", "HBA1C", "TSH", "PSA", "VITD", "URINE-R", "ESR"],
    includes: "Age-specific screening · Home collection included",
    status: "Active",
  },
  {
    code: "PKG-WOMEN", name: "Women's Wellness Package", b2cPrice: 2199, tatHours: 24,
    tests: ["CBC", "TSH", "VITD", "VITB12", "FERR", "PAP", "LIPID", "FBS"],
    includes: "Includes LBC Pap smear · Iron studies",
    status: "Active",
  },
];

// ---------- B2B network ----------
export const partners: Partner[] = [
  {
    id: "B2B-001", code: "ABC", name: "ABC Diagnostics", city: "Mumbai", contactPerson: "Rajesh Malhotra",
    mobile: "+91 98200 11223", email: "rajesh@abcdiagnostics.in", joinedOn: "2023-04-12",
    creditLimit: 300000, openingBalance: 42500, outstanding: 118400, discountPct: 40, pricingTier: "Tier 1 — Volume",
    subAgencies: 3, status: "Active", lastSettlement: "2026-09-10",
  },
  {
    id: "B2B-002", code: "HPC", name: "HealthPoint Collection Centre", city: "Thane", contactPerson: "Sunita Rane",
    mobile: "+91 98200 44556", email: "sunita@healthpoint.co.in", joinedOn: "2023-08-03",
    creditLimit: 200000, openingBalance: 0, outstanding: 46750, discountPct: 35, pricingTier: "Tier 2 — Standard",
    subAgencies: 1, status: "Active", lastSettlement: "2026-09-18",
  },
  {
    id: "B2B-003", code: "MDX", name: "Medipoint Diagnostics", city: "Nashik", contactPerson: "Amit Bhalerao",
    mobile: "+91 98220 77889", email: "amit@medipoint.in", joinedOn: "2024-01-25",
    creditLimit: 150000, openingBalance: 12000, outstanding: 89200, discountPct: 32, pricingTier: "Tier 2 — Standard",
    subAgencies: 0, status: "Active", lastSettlement: "2026-08-30",
  },
  {
    id: "B2B-004", code: "CPL", name: "CityCare Path Labs", city: "Pune", contactPerson: "Vivek Joshi",
    mobile: "+91 99220 33445", email: "vivek@citycarepath.com", joinedOn: "2024-06-14",
    creditLimit: 250000, openingBalance: 0, outstanding: 20400, discountPct: 38, pricingTier: "Tier 1 — Volume",
    subAgencies: 2, status: "Active", lastSettlement: "2026-09-22",
  },
  {
    id: "B2B-005", code: "ZHC", name: "Zenith Hospital Collection", city: "Navi Mumbai", contactPerson: "Farida Shaikh",
    mobile: "+91 98920 66778", email: "farida@zenithhosp.in", joinedOn: "2025-02-08",
    creditLimit: 100000, openingBalance: 0, outstanding: 0, discountPct: 30, pricingTier: "Tier 3 — New",
    subAgencies: 0, status: "Active", lastSettlement: "2026-09-25",
  },
  {
    id: "B2B-006", code: "GDX", name: "GreenLeaf Diagnostics", city: "Vasai", contactPerson: "Prakash Naik",
    mobile: "+91 98670 99001", email: "prakash@greenleafdiag.in", joinedOn: "2025-09-01",
    creditLimit: 50000, openingBalance: 0, outstanding: 15800, discountPct: 25, pricingTier: "Tier 3 — New",
    subAgencies: 0, status: "Suspended", lastSettlement: "2026-06-30",
  },
];

export const subAgencies: SubAgency[] = [
  {
    id: "SUB-001", parentId: "B2B-001", parentName: "ABC Diagnostics", name: "XYZ Collection Centre", city: "Mumbai",
    contactPerson: "Imran Qureshi", mobile: "+91 90040 12345", email: "imran@xyzcollection.in", joinedOn: "2024-02-10",
    status: "Active", monthlyBusiness: 184000, outstanding: 22300,
  },
  {
    id: "SUB-002", parentId: "B2B-001", parentName: "ABC Diagnostics", name: "Health Point", city: "Mumbai",
    contactPerson: "Deepa Kamble", mobile: "+91 90040 23456", email: "deepa@healthpoint.in", joinedOn: "2024-05-21",
    status: "Active", monthlyBusiness: 121500, outstanding: 8700,
  },
  {
    id: "SUB-003", parentId: "B2B-001", parentName: "ABC Diagnostics", name: "Maa Diagnostics", city: "Mumbai",
    contactPerson: "Shyam Sunder Gupta", mobile: "+91 90040 34567", email: "shyam@maadiag.in", joinedOn: "2024-11-05",
    status: "Active", monthlyBusiness: 96800, outstanding: 14100,
  },
  {
    id: "SUB-004", parentId: "B2B-002", parentName: "HealthPoint Collection Centre", name: "Sunrise Collection Point", city: "Thane",
    contactPerson: "Nitin Wagh", mobile: "+91 90220 45678", email: "nitin@sunrisecp.in", joinedOn: "2025-03-18",
    status: "Active", monthlyBusiness: 64300, outstanding: 5200,
  },
  {
    id: "SUB-005", parentId: "B2B-004", parentName: "CityCare Path Labs", name: "Kothrud Collection Centre", city: "Pune",
    contactPerson: "Manisha Deshpande", mobile: "+91 91450 56789", email: "manisha@kothrudcc.in", joinedOn: "2025-07-09",
    status: "Active", monthlyBusiness: 78050, outstanding: 6900,
  },
  {
    id: "SUB-006", parentId: "B2B-004", parentName: "CityCare Path Labs", name: "Hadapsar Path Services", city: "Pune",
    contactPerson: "Ganesh Shinde", mobile: "+91 91450 67890", email: "ganesh@hadapsarps.in", joinedOn: "2025-11-27",
    status: "Inactive", monthlyBusiness: 21300, outstanding: 0,
  },
];

// ---------- Patients ----------
export const patients: Patient[] = [
  { id: "PAT-00124", name: "Rahul Sharma", dob: "1992-03-14", age: 34, gender: "Male", mobile: "+91 98331 22001", email: "rahul.sharma@gmail.com", address: "B-702, Orchid Towers, Powai", city: "Mumbai", idProof: "Aadhaar XXXX 4412", source: "B2C Walk-in", channel: "B2C", registeredOn: "2026-08-02" },
  { id: "PAT-00125", name: "Priya Nair", dob: "1988-11-02", age: 37, gender: "Female", mobile: "+91 98331 22002", email: "priya.nair@outlook.com", address: "14, Sea Breeze Apts, Bandra West", city: "Mumbai", idProof: "Aadhaar XXXX 8803", source: "ABC Diagnostics", channel: "B2B", sourceId: "B2B-001", registeredOn: "2026-08-14" },
  { id: "PAT-00126", name: "Amit Patel", dob: "1979-06-28", age: 47, gender: "Male", mobile: "+91 98331 22003", email: "amit.patel@yahoo.in", address: "22, Rushivan Society, Thane West", city: "Thane", idProof: "PAN ABKPP1234L", source: "HealthPoint Collection Centre", channel: "B2B", sourceId: "B2B-002", registeredOn: "2026-08-21" },
  { id: "PAT-00127", name: "Sneha Gupta", dob: "1995-01-19", age: 31, gender: "Female", mobile: "+91 98331 22004", email: "sneha.g@gmail.com", address: "901, Lake Homes, Chandivali", city: "Mumbai", idProof: "Aadhaar XXXX 1298", source: "XYZ Collection Centre", channel: "SUB", sourceId: "SUB-001", registeredOn: "2026-09-01" },
  { id: "PAT-00128", name: "Mohammed Farhan", dob: "1984-09-08", age: 42, gender: "Male", mobile: "+91 98331 22005", email: "m.farhan@gmail.com", address: "5, Noor Manzil, Bhendi Bazaar", city: "Mumbai", idProof: "Aadhaar XXXX 6675", source: "B2C Walk-in", channel: "B2C", registeredOn: "2026-09-03" },
  { id: "PAT-00129", name: "Kavita Joshi", dob: "1971-04-25", age: 55, gender: "Female", mobile: "+91 98331 22006", email: "kavita.joshi@gmail.com", address: "Plot 7, Sainath Nagar, Nashik Rd", city: "Nashik", idProof: "Aadhaar XXXX 3390", source: "Medipoint Diagnostics", channel: "B2B", sourceId: "B2B-003", registeredOn: "2026-09-05" },
  { id: "PAT-00130", name: "Rajesh Kumar", dob: "1968-12-11", age: 57, gender: "Male", mobile: "+91 98331 22007", email: "rajesh.k78@gmail.com", address: "31, Shivaji Housing Soc, Dadar East", city: "Mumbai", idProof: "Aadhaar XXXX 7754", source: "ABC Diagnostics", channel: "B2B", sourceId: "B2B-001", registeredOn: "2026-09-08" },
  { id: "PAT-00131", name: "Anita Desai", dob: "1990-07-30", age: 36, gender: "Female", mobile: "+91 98331 22008", email: "anita.desai@gmail.com", address: "A-1104, Lodha Amara, Thane", city: "Thane", idProof: "Aadhaar XXXX 9912", source: "Sunrise Collection Point", channel: "SUB", sourceId: "SUB-004", registeredOn: "2026-09-10" },
  { id: "PAT-00132", name: "Suresh Menon", dob: "1962-02-17", age: 64, gender: "Male", mobile: "+91 98331 22009", email: "suresh.menon64@gmail.com", address: "8, Silver Oak, Chembur", city: "Mumbai", idProof: "Aadhaar XXXX 2256", source: "B2C Walk-in", channel: "B2C", registeredOn: "2026-09-12" },
  { id: "PAT-00133", name: "Divya Iyer", dob: "1993-10-05", age: 32, gender: "Female", mobile: "+91 98331 22010", email: "divya.iyer@gmail.com", address: "402, Ananta Serene, Kolshet Rd", city: "Thane", idProof: "Aadhaar XXXX 5143", source: "HealthPoint Collection Centre", channel: "B2B", sourceId: "B2B-002", registeredOn: "2026-09-14" },
  { id: "PAT-00134", name: "Arjun Singh", dob: "1986-05-22", age: 40, gender: "Male", mobile: "+91 98331 22011", email: "arjun.singh@gmail.com", address: "C-9, Staff Quarters, SEEPZ", city: "Mumbai", idProof: "PAN ARPS5678K", source: "XYZ Collection Centre", channel: "SUB", sourceId: "SUB-001", registeredOn: "2026-09-16" },
  { id: "PAT-00135", name: "Meera Chatterjee", dob: "1975-08-14", age: 51, gender: "Female", mobile: "+91 98331 22012", email: "meera.c@gmail.com", address: "18, Fairlawn, Wadala West", city: "Mumbai", idProof: "Aadhaar XXXX 8290", source: "Maa Diagnostics", channel: "SUB", sourceId: "SUB-003", registeredOn: "2026-09-18" },
  { id: "PAT-00136", name: "Vikas Verma", dob: "1981-01-09", age: 45, gender: "Male", mobile: "+91 98331 22013", email: "vikas.verma@gmail.com", address: "6, Kunal Icon, Pimple Saudagar", city: "Pune", idProof: "Aadhaar XXXX 4033", source: "CityCare Path Labs", channel: "B2B", sourceId: "B2B-004", registeredOn: "2026-09-19" },
  { id: "PAT-00137", name: "Pooja Shetty", dob: "1996-03-27", age: 30, gender: "Female", mobile: "+91 98331 22014", email: "pooja.shetty@gmail.com", address: "301, Green Park, Kothrud", city: "Pune", idProof: "Aadhaar XXXX 6601", source: "Kothrud Collection Centre", channel: "SUB", sourceId: "SUB-005", registeredOn: "2026-09-20" },
  { id: "PAT-00138", name: "Rohan Mehta", dob: "1998-12-03", age: 27, gender: "Male", mobile: "+91 98331 22015", email: "rohan.mehta@gmail.com", address: "7, Sunrise CHS, Vashi", city: "Navi Mumbai", idProof: "Aadhaar XXXX 7189", source: "Zenith Hospital Collection", channel: "B2B", sourceId: "B2B-005", registeredOn: "2026-09-22" },
  { id: "PAT-00139", name: "Lakshmi Raman", dob: "1957-06-16", age: 69, gender: "Female", mobile: "+91 98331 22016", email: "lakshmi.raman@gmail.com", address: "12, Brindavan Society, Matunga", city: "Mumbai", idProof: "Aadhaar XXXX 0972", source: "B2C Walk-in", channel: "B2C", registeredOn: "2026-09-23" },
  { id: "PAT-00140", name: "Imran Sheikh", dob: "1989-09-21", age: 37, gender: "Male", mobile: "+91 98331 22017", email: "imran.sheikh@gmail.com", address: "44, Mumbra Bypass Rd, Mumbra", city: "Thane", idProof: "Aadhaar XXXX 8845", source: "Health Point", channel: "SUB", sourceId: "SUB-002", registeredOn: "2026-09-24" },
  { id: "PAT-00141", name: "Geeta Bhandari", dob: "1983-02-08", age: 43, gender: "Female", mobile: "+91 98331 22018", email: "geeta.b@gmail.com", address: "9, Shanti Nagar, Sakinaka", city: "Mumbai", idProof: "Aadhaar XXXX 5521", source: "ABC Diagnostics", channel: "B2B", sourceId: "B2B-001", registeredOn: "2026-09-25" },
  { id: "PAT-00142", name: "Nikhil Agarwal", dob: "1991-11-29", age: 34, gender: "Male", mobile: "+91 98331 22019", email: "nikhil.a@gmail.com", address: "802, Marathon Futurex, Lower Parel", city: "Mumbai", idProof: "Aadhaar XXXX 3388", source: "B2C Walk-in", channel: "B2C", registeredOn: "2026-09-26" },
  { id: "PAT-00143", name: "Shalini Verma", dob: "1966-04-03", age: 60, gender: "Female", mobile: "+91 98331 22020", email: "shalini.v@gmail.com", address: "3, Palm Beach Rd, Sanpada", city: "Navi Mumbai", idProof: "Aadhaar XXXX 7702", source: "Zenith Hospital Collection", channel: "B2B", sourceId: "B2B-005", registeredOn: "2026-09-27" },
];

// ---------- Referring doctors ----------
export const doctors = [
  { id: "DR-01", name: "Dr. Suresh Mehta", speciality: "General Physician", hospital: "Mehta Clinic, Powai", referralPct: 10 },
  { id: "DR-02", name: "Dr. Rekha Iyer", speciality: "Endocrinologist", hospital: "Iyer Diabetes Centre, Sion", referralPct: 10 },
  { id: "DR-03", name: "Dr. Aditya Kulkarni", speciality: "Cardiologist", hospital: "HeartCare, Dadar", referralPct: 8 },
  { id: "DR-04", name: "Dr. Farida Contractor", speciality: "Pathologist", hospital: "Apex Labs — In-house", referralPct: 0 },
  { id: "DR-05", name: "Dr. Sameer Bhagwat", speciality: "Oncologist", hospital: "Sion Hospital (Visiting)", referralPct: 8 },
  { id: "DR-06", name: "Dr. Meenakshi Rao", speciality: "Gynaecologist", hospital: "MatriCare, Thane", referralPct: 10 },
];

// ---------- Pathologists ----------
export const pathologists: Pathologist[] = [
  { id: "PATH-01", name: "Dr. Anjali Deshpande", qualification: "MD (Pathology)", regNo: "MMC/2010/24315", speciality: "Haematology & Clinical Pathology", mobile: "+91 98200 71001", email: "anjali.d@apexlabs.in", signatureOnFile: true, status: "Active" },
  { id: "PATH-02", name: "Dr. Vikram Rao", qualification: "MD (Biochemistry), DNB", regNo: "MMC/2008/19204", speciality: "Biochemistry & Immunology", mobile: "+91 98200 71002", email: "vikram.rao@apexlabs.in", signatureOnFile: true, status: "Active" },
  { id: "PATH-03", name: "Dr. Farida Contractor", qualification: "MD (Pathology), FRCPath", regNo: "MMC/2005/11028", speciality: "Histopathology & Cytology", mobile: "+91 98200 71003", email: "farida.c@apexlabs.in", signatureOnFile: true, status: "Active" },
  { id: "PATH-04", name: "Dr. Sanjay Mukherjee", qualification: "MD (Microbiology)", regNo: "MMC/2012/30188", speciality: "Microbiology & Molecular", mobile: "+91 98200 71004", email: "sanjay.m@apexlabs.in", signatureOnFile: false, status: "Active" },
];

// ---------- Branches / Couriers / Templates ----------
export const branches: Branch[] = [
  { id: "BR-01", name: "Central Reference Lab — Andheri", type: "Central Lab", city: "Mumbai", address: "Plot 14, MIDC Health Square, Andheri East", incharge: "Dr. Anjali Deshpande", mobile: "+91 22 4890 1234", status: "Active" },
  { id: "BR-02", name: "Apex Collection Point — Powai", type: "Collection Centre", city: "Mumbai", address: "Shop 9, Galleria Mall, Powai", incharge: "Sarita Kadam", mobile: "+91 98200 71201", status: "Active" },
  { id: "BR-03", name: "Apex Collection Point — Dadar", type: "Collection Centre", city: "Mumbai", address: "217, Ranade Road, Dadar West", incharge: "Mohan Pillai", mobile: "+91 98200 71202", status: "Active" },
  { id: "BR-04", name: "Apex Sample Hub — Thane", type: "Processing Unit", city: "Thane", address: "16, Ghodbunder Industrial Est.", incharge: "Rekha Sawant", mobile: "+91 98200 71203", status: "Active" },
  { id: "BR-05", name: "Apex Collection Point — Vashi", type: "Collection Centre", city: "Navi Mumbai", address: "Station Complex, Sector 17", incharge: "Anthony Dsouza", mobile: "+91 98200 71204", status: "Inactive" },
];

export const couriers: Courier[] = [
  { id: "CUR-01", name: "BlueDart Med Express", type: "Agency", contactPerson: "Sanjay Patil", mobile: "+91 98330 51001", cities: "Mumbai · Thane · Navi Mumbai", dailyTrips: 6, status: "Active" },
  { id: "CUR-02", name: "Delhivery Health", type: "Agency", contactPerson: "Ravi Nair", mobile: "+91 98330 51002", cities: "Pune · Nashik", dailyTrips: 3, status: "Active" },
  { id: "CUR-03", name: "LabRunners", type: "Agency", contactPerson: "Deepak Yadav", mobile: "+91 98330 51003", cities: "Mumbai · Vasai", dailyTrips: 4, status: "Active" },
  { id: "CUR-04", name: "Apex In-house Van", type: "In-house", contactPerson: "Ramesh Bhosale", mobile: "+91 98330 51004", cities: "Andheri · Powai · Dadar routes", dailyTrips: 8, status: "Active" },
];

export const reportTemplates: ReportTemplate[] = [
  { id: "RT-01", name: "Standard Clinical Report", appliesTo: "All routine tests", format: "A4 Portrait", header: "Apex default header with NABL logo", footer: "Report footer with QR + disclaimer", hasQr: true, hasSignature: true, status: "Active" },
  { id: "RT-02", name: "Histopathology Report", appliesTo: "HPE, Cytology, Pap", format: "A4 Portrait (2 page)", header: "Descriptive header with specimen block", footer: "Pathologist signature + gross image note", hasQr: true, hasSignature: true, status: "Active" },
  { id: "RT-03", name: "Microbiology & Culture Report", appliesTo: "Cultures, AFB, CBNAAT", format: "A4 Portrait", header: "Micro header with incubation note", footer: "Standard footer", hasQr: true, hasSignature: true, status: "Active" },
  { id: "RT-04", name: "Molecular / NGS Report", appliesTo: "BRCA, genetic panels", format: "A4 Portrait (4 page)", header: "Genetic disclaimer header", footer: "Genetic counselling note", hasQr: true, hasSignature: true, status: "Active" },
  { id: "RT-05", name: "B2B Bulk Report Format", appliesTo: "B2B partner portal prints", format: "A4 Landscape batch", header: "Partner co-branded header", footer: "Batch footer with page x of y", hasQr: true, hasSignature: true, status: "Active" },
];

// ---------- Pricing rules ----------
// Hierarchy: B2C list price -> B2B price -> Sub-agency price
export const priceRules: PriceRule[] = [
  // B2C (list price mirrors TestMaster.b2cPrice)
  ...tests.map((t, i) => ({
    id: `PR-B2C-${String(i + 1).padStart(3, "0")}`,
    testCode: t.code, testName: t.name, scope: "B2C" as const, scopeId: "ALL", scopeName: "Patient (B2C List)",
    price: t.b2cPrice, effectiveFrom: "2026-04-01", status: "Active" as const,
  })),
  // ABC Diagnostics (Tier 1 ~ 50-55% off list)
  ...[
    ["CBC", 150], ["TSH", 220], ["HBA1C", 250], ["LFT", 300], ["KFT", 300], ["LIPID", 280],
    ["FBS", 80], ["VITD", 650], ["VITB12", 550], ["ESR", 90], ["URINE-R", 110],
    ["DENGUE-NS1", 320], ["WIDAL", 140], ["HBSAG", 170], ["HIV", 190], ["CRP", 280],
    ["FERR", 420], ["PSA", 380], ["PROCALC", 950], ["CULTURE-UR", 360], ["AFB", 170],
    ["TRUGENE", 1050], ["HLA-B27", 850], ["FT4", 190], ["INSULIN-F", 350],
  ].map(([code, price], i) => ({
    id: `PR-B2B-001-${String(i + 1).padStart(3, "0")}`,
    testCode: code as string, testName: tests.find((t) => t.code === code)?.name ?? String(code),
    scope: "B2B" as const, scopeId: "B2B-001", scopeName: "ABC Diagnostics",
    price: price as number, effectiveFrom: "2026-04-01", minQty: 10, status: "Active" as const,
  })),
  // HealthPoint (Tier 2)
  ...[
    ["CBC", 180], ["TSH", 250], ["HBA1C", 290], ["LFT", 340], ["KFT", 340], ["LIPID", 320], ["FBS", 90],
    ["VITD", 720], ["VITB12", 610], ["ESR", 110], ["URINE-R", 130], ["DENGUE-NS1", 380], ["WIDAL", 160],
  ].map(([code, price], i) => ({
    id: `PR-B2B-002-${String(i + 1).padStart(3, "0")}`,
    testCode: code as string, testName: tests.find((t) => t.code === code)?.name ?? String(code),
    scope: "B2B" as const, scopeId: "B2B-002", scopeName: "HealthPoint Collection Centre",
    price: price as number, effectiveFrom: "2026-04-01", status: "Active" as const,
  })),
  // Medipoint (Tier 2)
  ...[
    ["CBC", 190], ["TSH", 265], ["HBA1C", 300], ["LFT", 355], ["KFT", 355], ["LIPID", 335], ["FBS", 95],
    ["VITD", 760], ["WIDAL", 170], ["DENGUE-NS1", 395], ["URINE-R", 140], ["ESR", 115],
  ].map(([code, price], i) => ({
    id: `PR-B2B-003-${String(i + 1).padStart(3, "0")}`,
    testCode: code as string, testName: tests.find((t) => t.code === code)?.name ?? String(code),
    scope: "B2B" as const, scopeId: "B2B-003", scopeName: "Medipoint Diagnostics",
    price: price as number, effectiveFrom: "2026-07-01", status: "Active" as const,
  })),
  // CityCare (Tier 1)
  ...[
    ["CBC", 160], ["TSH", 230], ["HBA1C", 260], ["LFT", 310], ["KFT", 310], ["LIPID", 295], ["FBS", 85],
    ["VITD", 680], ["VITB12", 570], ["PSA", 400], ["URINE-R", 115], ["ESR", 95], ["CRP", 290],
  ].map(([code, price], i) => ({
    id: `PR-B2B-004-${String(i + 1).padStart(3, "0")}`,
    testCode: code as string, testName: tests.find((t) => t.code === code)?.name ?? String(code),
    scope: "B2B" as const, scopeId: "B2B-004", scopeName: "CityCare Path Labs",
    price: price as number, effectiveFrom: "2026-04-01", status: "Active" as const,
  })),
  // Zenith (Tier 3)
  ...[
    ["CBC", 210], ["TSH", 290], ["HBA1C", 320], ["LFT", 380], ["KFT", 380], ["LIPID", 360], ["FBS", 100],
  ].map(([code, price], i) => ({
    id: `PR-B2B-005-${String(i + 1).padStart(3, "0")}`,
    testCode: code as string, testName: tests.find((t) => t.code === code)?.name ?? String(code),
    scope: "B2B" as const, scopeId: "B2B-005", scopeName: "Zenith Hospital Collection",
    price: price as number, effectiveFrom: "2026-02-08", status: "Active" as const,
  })),
  // Sub-agencies under ABC (parent cost + margin)
  ...[
    ["CBC", 180], ["TSH", 260], ["HBA1C", 295], ["LFT", 350], ["KFT", 350], ["LIPID", 330], ["FBS", 95], ["VITD", 730],
  ].map(([code, price], i) => ({
    id: `PR-SUB-001-${String(i + 1).padStart(3, "0")}`,
    testCode: code as string, testName: tests.find((t) => t.code === code)?.name ?? String(code),
    scope: "SUB" as const, scopeId: "SUB-001", scopeName: "XYZ Collection Centre (via ABC)",
    price: price as number, effectiveFrom: "2026-04-01", status: "Active" as const,
  })),
  ...[
    ["CBC", 190], ["TSH", 270], ["HBA1C", 305], ["LFT", 360], ["KFT", 360], ["LIPID", 340], ["FBS", 100],
  ].map(([code, price], i) => ({
    id: `PR-SUB-002-${String(i + 1).padStart(3, "0")}`,
    testCode: code as string, testName: tests.find((t) => t.code === code)?.name ?? String(code),
    scope: "SUB" as const, scopeId: "SUB-002", scopeName: "Health Point (via ABC)",
    price: price as number, effectiveFrom: "2026-04-01", status: "Active" as const,
  })),
  ...[
    ["CBC", 200], ["TSH", 280], ["HBA1C", 315], ["LFT", 370], ["KFT", 370], ["LIPID", 350], ["FBS", 105],
  ].map(([code, price], i) => ({
    id: `PR-SUB-003-${String(i + 1).padStart(3, "0")}`,
    testCode: code as string, testName: tests.find((t) => t.code === code)?.name ?? String(code),
    scope: "SUB" as const, scopeId: "SUB-003", scopeName: "Maa Diagnostics (via ABC)",
    price: price as number, effectiveFrom: "2026-06-15", status: "Active" as const,
  })),
  ...[
    ["CBC", 205], ["TSH", 285], ["HBA1C", 320], ["LFT", 375], ["KFT", 375], ["LIPID", 355],
  ].map(([code, price], i) => ({
    id: `PR-SUB-004-${String(i + 1).padStart(3, "0")}`,
    testCode: code as string, testName: tests.find((t) => t.code === code)?.name ?? String(code),
    scope: "SUB" as const, scopeId: "SUB-005", scopeName: "Kothrud Collection Centre (via CityCare)",
    price: price as number, effectiveFrom: "2026-07-09", status: "Active" as const,
  })),
  // Special promotional price
  {
    id: "PR-SPC-001", testCode: "VITD", testName: "Vitamin D (25-OH)", scope: "B2C", scopeId: "ALL",
    scopeName: "Monsoon Promo — B2C", price: 999, effectiveFrom: "2026-09-01", effectiveTo: "2026-09-30",
    status: "Active",
  },
  {
    id: "PR-SPC-002", testCode: "PKG-FULL-ADV", testName: "Full Body Checkup — Advanced", scope: "B2B",
    scopeId: "B2B-001", scopeName: "ABC Diagnostics — Volume Deal", price: 950, effectiveFrom: "2026-09-15",
    minQty: 25, status: "Active",
  },
];

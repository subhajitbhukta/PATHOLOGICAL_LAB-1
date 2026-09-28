#!/bin/bash
# Generate stub view files for the LIS app
set -e
BASE=/home/z/my-project/src/components/lis

gen() { # dir file exportname title
  cat > "$BASE/$1/$2.tsx" <<EOF
"use client";

export function $3() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-sm font-medium text-slate-600">$4</p>
      <p className="mt-1 text-xs text-muted-foreground">This view is being built as part of the current work package.</p>
    </div>
  );
}
EOF
}

# ---- Admin (agents fill these) ----
gen admin masters-tests AdminMastersTestsView "Test & Package Masters"
gen admin masters-lab AdminMastersLabView "Lab Setup Masters"
gen admin masters-network AdminMastersNetworkView "Network & Template Masters"
gen admin pricing AdminPricingView "Pricing Engine"
gen admin partners AdminPartnersView "B2B & Sub-Agencies"
gen admin patients AdminPatientsView "Patient Directory"
gen admin samples AdminSamplesView "Sample Management"
gen admin logistics AdminLogisticsView "Logistics & Pickups"
gen admin receiving AdminReceivingView "Lab Receiving"
gen admin worklists AdminWorklistsView "Department Worklists"
gen admin results AdminResultsView "Result Entry"
gen admin verification AdminVerificationView "Pathologist Verification"
gen admin reports AdminReportsView "Report Registry"
gen admin billing AdminBillingView "Billing & Invoicing"
gen admin ledger AdminLedgerView "Ledgers & Outstanding"
gen admin settlements AdminSettlementsView "Sub-Agency Settlement"
gen admin external AdminExternalView "External Reference Lab"
gen admin mis AdminMisView "Reports & MIS"
gen admin notifications AdminNotificationsView "Notifications"
gen admin administration AdminAdministrationView "Users, Roles & Config"

# ---- B2B ----
gen b2b dashboard B2bDashboardView "B2B Dashboard"
gen b2b order-new B2bOrderNewView "New Test Order"
gen b2b patients B2bPatientsView "My Patients"
gen b2b orders B2bOrdersView "Orders"
gen b2b samples B2bSamplesView "Samples & Barcodes"
gen b2b pickups B2bPickupsView "Pickup Requests"
gen b2b reports B2bReportsView "Report Download"
gen b2b pricing B2bPricingView "My Pricing"
gen b2b subagencies B2bSubAgenciesView "Sub-Agencies"
gen b2b billing B2bBillingView "Billing & Ledger"

# ---- Sub-Agency ----
gen agency dashboard AgencyDashboardView "Agency Dashboard"
gen agency order-new AgencyOrderNewView "New Test Order"
gen agency patients AgencyPatientsView "My Patients"
gen agency orders AgencyOrdersView "Orders"
gen agency pickups AgencyPickupsView "Pickup Requests"
gen agency reports AgencyReportsView "Reports"
gen agency billing AgencyBillingView "Billing & Payable"

# ---- Patient ----
gen patient dashboard PatientDashboardView "Patient Dashboard"
gen patient book PatientBookTestView "Book a Test"
gen patient tests PatientTestsView "My Tests"
gen patient reports PatientReportsView "My Reports"
gen patient bills PatientBillsView "Bills & Payments"
gen patient appointments PatientAppointmentsView "Appointments"
gen patient profile PatientProfileView "Profile"

echo "Stubs generated"

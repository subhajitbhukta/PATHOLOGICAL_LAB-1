"use client";

import * as React from "react";
// Admin
import { AdminDashboardView } from "./admin/dashboard";
import { AdminOrdersView } from "./admin/orders";
import { AdminOrderNewView } from "./admin/order-new";
import { AdminSamplesView } from "./admin/samples";
import { AdminLogisticsView } from "./admin/logistics";
import { AdminReceivingView } from "./admin/receiving";
import { AdminWorklistsView } from "./admin/worklists";
import { AdminResultsView } from "./admin/results";
import { AdminVerificationView } from "./admin/verification";
import { AdminReportsView } from "./admin/reports";
import { AdminMastersTestsView } from "./admin/masters-tests";
import { AdminMastersLabView } from "./admin/masters-lab";
import { AdminMastersNetworkView } from "./admin/masters-network";
import { AdminPricingView } from "./admin/pricing";
import { AdminPartnersView } from "./admin/partners";
import { AdminPatientsView } from "./admin/patients";
import { AdminBillingView } from "./admin/billing";
import { AdminLedgerView } from "./admin/ledger";
import { AdminSettlementsView } from "./admin/settlements";
import { AdminExternalView } from "./admin/external";
import { AdminMisView } from "./admin/mis";
import { AdminNotificationsView } from "./admin/notifications";
import { AdminAdministrationView } from "./admin/administration";
// B2B
import { B2bDashboardView } from "./b2b/dashboard";
import { B2bOrderNewView } from "./b2b/order-new";
import { B2bPatientsView } from "./b2b/patients";
import { B2bOrdersView } from "./b2b/orders";
import { B2bSamplesView } from "./b2b/samples";
import { B2bPickupsView } from "./b2b/pickups";
import { B2bReportsView } from "./b2b/reports";
import { B2bPricingView } from "./b2b/pricing";
import { B2bSubAgenciesView } from "./b2b/subagencies";
import { B2bBillingView } from "./b2b/billing";
// Sub-Agency
import { AgencyDashboardView } from "./agency/dashboard";
import { AgencyOrderNewView } from "./agency/order-new";
import { AgencyPatientsView } from "./agency/patients";
import { AgencyOrdersView } from "./agency/orders";
import { AgencyPickupsView } from "./agency/pickups";
import { AgencyReportsView } from "./agency/reports";
import { AgencyBillingView } from "./agency/billing";
// Patient
import { PatientDashboardView } from "./patient/dashboard";
import { PatientBookTestView } from "./patient/book";
import { PatientTestsView } from "./patient/tests";
import { PatientReportsView } from "./patient/reports";
import { PatientBillsView } from "./patient/bills";
import { PatientAppointmentsView } from "./patient/appointments";
import { PatientProfileView } from "./patient/profile";

export const VIEW_MAP: Record<string, React.ComponentType> = {
  "admin/dashboard": AdminDashboardView,
  "admin/orders": AdminOrdersView,
  "admin/order-new": AdminOrderNewView,
  "admin/samples": AdminSamplesView,
  "admin/logistics": AdminLogisticsView,
  "admin/receiving": AdminReceivingView,
  "admin/worklists": AdminWorklistsView,
  "admin/results": AdminResultsView,
  "admin/verification": AdminVerificationView,
  "admin/reports": AdminReportsView,
  "admin/masters-tests": AdminMastersTestsView,
  "admin/masters-lab": AdminMastersLabView,
  "admin/masters-network": AdminMastersNetworkView,
  "admin/pricing": AdminPricingView,
  "admin/partners": AdminPartnersView,
  "admin/patients": AdminPatientsView,
  "admin/billing": AdminBillingView,
  "admin/ledger": AdminLedgerView,
  "admin/settlements": AdminSettlementsView,
  "admin/external": AdminExternalView,
  "admin/mis": AdminMisView,
  "admin/notifications": AdminNotificationsView,
  "admin/administration": AdminAdministrationView,
  "b2b/dashboard": B2bDashboardView,
  "b2b/order-new": B2bOrderNewView,
  "b2b/patients": B2bPatientsView,
  "b2b/orders": B2bOrdersView,
  "b2b/samples": B2bSamplesView,
  "b2b/pickups": B2bPickupsView,
  "b2b/reports": B2bReportsView,
  "b2b/pricing": B2bPricingView,
  "b2b/subagencies": B2bSubAgenciesView,
  "b2b/billing": B2bBillingView,
  "agency/dashboard": AgencyDashboardView,
  "agency/order-new": AgencyOrderNewView,
  "agency/patients": AgencyPatientsView,
  "agency/orders": AgencyOrdersView,
  "agency/pickups": AgencyPickupsView,
  "agency/reports": AgencyReportsView,
  "agency/billing": AgencyBillingView,
  "patient/dashboard": PatientDashboardView,
  "patient/book": PatientBookTestView,
  "patient/tests": PatientTestsView,
  "patient/reports": PatientReportsView,
  "patient/bills": PatientBillsView,
  "patient/appointments": PatientAppointmentsView,
  "patient/profile": PatientProfileView,
};

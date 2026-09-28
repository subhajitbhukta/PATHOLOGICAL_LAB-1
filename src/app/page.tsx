"use client";

import * as React from "react";
import { NavContext } from "@/components/lis/nav";
import { LandingHub } from "@/components/lis/landing";
import { PortalShell } from "@/components/lis/shell";
import { VIEW_MAP } from "@/components/lis/registry";
import type { Portal } from "@/lib/lis/types";

const HOME_VIEW: Record<"admin" | "b2b" | "agency" | "patient", string> = {
  admin: "admin/dashboard",
  b2b: "b2b/dashboard",
  agency: "agency/dashboard",
  patient: "patient/dashboard",
};

export default function Page() {
  const [portal, setPortal] = React.useState<Portal>("landing");
  const [view, setView] = React.useState<string>("");

  const nav = React.useMemo(
    () => ({
      portal,
      view,
      go: (v: string) => setView(v),
      exit: () => setPortal("landing"),
      openPortal: (p: Portal) => {
        setPortal(p);
        setView(HOME_VIEW[p as "admin"]);
      },
    }),
    [portal, view],
  );

  if (portal === "landing") {
    return (
      <NavContext.Provider value={nav}>
        <LandingHub />
      </NavContext.Provider>
    );
  }

  const p = portal as "admin" | "b2b" | "agency" | "patient";
  const ViewComp = VIEW_MAP[view] ?? VIEW_MAP[HOME_VIEW[p]];

  return (
    <NavContext.Provider value={nav}>
      <PortalShell portal={p} view={view || HOME_VIEW[p]}>
        <ViewComp />
      </PortalShell>
    </NavContext.Provider>
  );
}

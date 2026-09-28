"use client";

import { createContext, useContext } from "react";
import type { Portal } from "@/lib/lis/types";

export interface NavApi {
  portal: Portal;
  view: string;
  go: (view: string) => void;
  exit: () => void; // back to landing
  openPortal: (p: Portal) => void;
}

export const NavContext = createContext<NavApi>({
  portal: "landing",
  view: "",
  go: () => {},
  exit: () => {},
  openPortal: () => {},
});

export const useLisNav = () => useContext(NavContext);

"use client";

import { createContext, useContext } from "react";
import { useState } from "react";

interface SideBarOpenContextValue {
  sideBarOpen: boolean;
  setSideBarOpen: (value: boolean) => void;
}

export const SideBarOpenContext = createContext<
  SideBarOpenContextValue | undefined
>(undefined);

export function SideBarOpenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sideBarOpen, setSideBarOpen] = useState(false);

  return (
    <SideBarOpenContext.Provider value={{ sideBarOpen, setSideBarOpen }}>
      {children}
    </SideBarOpenContext.Provider>
  );
}

export function useSideBarOpen() {
  const context = useContext(SideBarOpenContext);
  if (context === undefined) {
    throw new Error("useSideBarOpen must be used within a SideBarOpenProvider");
  }
  return context;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <SideBarOpenProvider>{children}</SideBarOpenProvider>;
}

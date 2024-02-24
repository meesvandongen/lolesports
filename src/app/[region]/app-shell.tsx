"use client";

import { Tooltip, UnstyledButton } from "@mantine/core";
import { DoubleNavbar } from "./nav-bar";
import { operations } from "@/api/generated";
import { regions } from "@/data";

export function AppAppShell({
  children,
  regionData,
}: {
  children: React.ReactNode;
  regionData: operations["getLeagues"]["responses"]["200"]["content"]["application/json"]["data"]["leagues"];
}) {
  return (
    <div className="flex">
      {children}
    </div>
  );
}

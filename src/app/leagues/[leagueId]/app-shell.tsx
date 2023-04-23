"use client";

import {
  AppShell,
  Footer,
  Aside,
  Text,
  MediaQuery,
  useMantineTheme,
} from "@mantine/core";
import { AppNavBar } from "./nav-bar";
import { AppHeader } from "./header";
import { components } from "@/api/generated";

export function AppAppShell({
  children,
  tournaments,
}: {
  children: React.ReactNode;
  tournaments: components["schemas"]["tournament"][];
}) {
  return (
    <AppShell
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={<AppNavBar tournaments={tournaments} />}
      header={<AppHeader />}
    >
      {children}
    </AppShell>
  );
}

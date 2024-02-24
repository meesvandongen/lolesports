import { Providers } from "./providers";
import { AppAppShell } from "./app-shell";
import { api } from "@/api/api";
import { notFound } from "next/navigation";
import { regions } from "@/data";
import { Tooltip, UnstyledButton } from "@mantine/core";
import { DoubleNavbar } from "./nav-bar";

export default async function RegionLayout({
  children,
  leagueMenu,
  params: { region },
}: {
  children: React.ReactNode;
  leagueMenu: React.ReactNode;
  params: {
    region: string;
  };
}) {
  const { data } = await api.get("/getLeagues", {
    query: {
      hl: "en-US",
    },
  });

  return (
    <Providers>
      <div className="flex">
        <DoubleNavbar
          regionData={data.leagues}
          region={region}
          leagueMenu={leagueMenu}
        />
        {children}
      </div>
    </Providers>
  );
}

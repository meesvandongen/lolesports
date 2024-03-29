import { Providers } from "./providers";
import { api } from "@/api/api";
import { AppAppShell } from "./app-shell";

export default async function RegionLayout({
  children,
  tournamentMenu,
  params: { regionTag },
}: {
  children: React.ReactNode;
  tournamentMenu: React.ReactNode;
  params: {
    regionTag: string;
  };
}) {
  const { data } = await api.get("/getLeagues", {
    query: {
      hl: "en-US",
    },
  });

  return (
    <Providers>
      <AppAppShell
        allLeagues={data.leagues}
        regionTag={regionTag}
        tournamentMenu={tournamentMenu}
      >
        {children}
      </AppAppShell>
    </Providers>
  );
}

import { Providers } from "./providers";
import { AppAppShell } from "./app-shell";
import { api } from "@/api/api";
import { notFound } from "next/navigation";

export default async function LeagueIdPage({
  children,
  params: { leagueId },
}: {
  children: React.ReactNode;
  params: {
    leagueId: string;
  };
}) {
  const { data } = await api.get("/getTournamentsForLeague", {
    query: {
      leagueId,
      hl: "en-US",
    },
  });

  const tournaments = data.leagues[0]?.tournaments;

  if (!tournaments) {
    notFound();
  }

  tournaments.sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);

    return dateB.getTime() - dateA.getTime();
  });

  return (
    <Providers>
      <AppAppShell tournaments={tournaments}>{children}</AppAppShell>
    </Providers>
  );
}

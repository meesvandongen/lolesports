import { regions } from "@/data";
import { operations } from "./api/generated";

export function combineLeaguesWithRegions(
  leagues: operations["getLeagues"]["responses"]["200"]["content"]["application/json"]["data"]["leagues"]
) {
  return regions.map((regionsItem) => {
    return {
      ...regionsItem,
      leagues: leagues.filter((league) => league.region === regionsItem.region),
    };
  });
}

import kebabcase from "lodash.kebabcase";
import type { League } from "./api/types";

export function getRegionsWithLeagues(leagues: League[]) {
  const regions: {
    name: string;
    tag: string;
    leagues: League[];
  }[] = [];

  for (const league of leagues) {
    const region = regions.find((region) => region.name === league.region);
    if (region) {
      region.leagues.push(league);
    } else {
      regions.push({
        name: league.region,
        tag: kebabcase(league.region),
        leagues: [league],
      });
    }
  }

  return regions.toSorted((a, b) => a.name.localeCompare(b.name));
}

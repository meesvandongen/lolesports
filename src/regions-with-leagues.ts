import { operations } from "./api/generated";
import kebabcase from "lodash.kebabcase";

export function getRegionsWithLeagues(
  leagues: operations["getLeagues"]["responses"]["200"]["content"]["application/json"]["data"]["leagues"]
) {
  const regions: {
    name: string;
    tag: string;
    leagues: operations["getLeagues"]["responses"]["200"]["content"]["application/json"]["data"]["leagues"];
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

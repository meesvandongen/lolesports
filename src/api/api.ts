import { createBaseFetcher } from "./generated";
import ky from "ky";

const baseUrl = `https://esports-api.lolesports.com/persisted/gw`;
const apiKey = `0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z`;

export const api = createBaseFetcher((path, { method, body }) => {
  return ky(path.replace("/", ""), {
    prefixUrl: baseUrl,
    method,
    json: body,
    headers: {
      "x-api-key": apiKey,
    },
    cache: "force-cache",
    next: {
      revalidate: 60 * 60,
    },
  }).json();
});

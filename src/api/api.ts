import { createBaseFetcher } from "./generated";

const baseUrl = `https://esports-api.lolesports.com/persisted/gw`;
// The key lolesports.com itself uses. The API accepts it from any origin.
const apiKey = `0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z`;

async function request(path: string): Promise<unknown> {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`lolesports API responded with ${response.status} for ${url}`);
  }

  // Team and league images come back as http:// URLs, which would be mixed
  // content on the https site; the host serves the same files over https.
  return JSON.parse(
    (await response.text()).replaceAll(
      "http://static.lolesports.com/",
      "https://static.lolesports.com/",
    ),
  );
}

export const api = createBaseFetcher(request);

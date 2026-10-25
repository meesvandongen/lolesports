import { createBaseFetcher } from "./generated";

const baseUrl = `https://esports-api.lolesports.com/persisted/gw`;
const apiKey = `0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z`;

const cacheTtlSeconds = 60 * 60;

// Responses are kept in the Workers Cache API for an hour, replacing the
// `revalidate` option Next.js used to provide.
async function cachedFetch(url: string): Promise<unknown> {
  const cache = typeof caches === "undefined" ? undefined : await caches.open("lolesports-api");
  const cacheKey = new Request(url);

  const cached = await cache?.match(cacheKey);
  if (cached) {
    return cached.json();
  }

  const response = await fetch(url, {
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`lolesports API responded with ${response.status} for ${url}`);
  }

  const body = await response.text();

  await cache?.put(
    cacheKey,
    new Response(body, {
      headers: {
        "content-type": "application/json",
        "cache-control": `public, max-age=${cacheTtlSeconds}`,
      },
    }),
  );

  return JSON.parse(body);
}

export const api = createBaseFetcher((path) => cachedFetch(`${baseUrl}${path}`));

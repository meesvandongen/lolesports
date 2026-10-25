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
    return parse(await cached.text());
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

  return parse(body);
}

function parse(body: string): unknown {
  // Team and league images come back as http:// URLs, which would be mixed
  // content on the https site; the host serves the same files over https.
  return JSON.parse(
    body.replaceAll("http://static.lolesports.com/", "https://static.lolesports.com/"),
  );
}

export const api = createBaseFetcher((path) => cachedFetch(`${baseUrl}${path}`));

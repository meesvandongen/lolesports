import { createBaseFetcher } from "./generated";

const baseUrl = `https://esports-api.lolesports.com/persisted/gw`;
const apiKey = `0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z`;

export const api = createBaseFetcher((path, { method, body }) =>
  fetch(`${baseUrl}${path}`, {
    method,
    body: JSON.stringify(body),
    headers: {
      "x-api-key": apiKey,
    },
    next: {
      revalidate: 60 * 60,
    },
  }).then((res) => res.json())
);

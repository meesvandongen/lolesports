import { createRouter } from "@tanstack/react-router";
import { NotFound } from "./components/not-found";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    // The API data only changes a few times a day and is cached for an hour on
    // the Worker, so there is no need to refetch layouts on every navigation.
    defaultStaleTime: 5 * 60 * 1000,
    defaultNotFoundComponent: () => <NotFound title="Page not found" />,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

import { createRouter } from "@tanstack/react-router";
import { NotFound } from "./components/not-found";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    // Standings change a few times a day at most, so loaded data is reused for a
    // while instead of refetching every layout on each navigation.
    defaultStaleTime: 5 * 60 * 1000,
    defaultNotFoundComponent: () => <NotFound title="Page not found" />,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

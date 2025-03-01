import { createRootRoute, createRoute, Outlet } from "@tanstack/react-router";
import Network from "@/components/network";

// Define the root route
export const rootRoute = createRootRoute({
  component: () => (
    <main className="w-screen h-screen font-main">
      <Outlet />
    </main>
  ),
});

// Create routes for each media type
const showsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shows",
  component: () => <Network mediaType="shows" />,
});

const moviesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/movies",
  component: () => <Network mediaType="movies" />,
});

const musicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/music",
  component: () => <Network mediaType="music" />,
});

// Create a catch-all index route that redirects to shows
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: ({ navigate }) => {
    navigate({ to: "/shows" });
  },
  component: () => null,
});

// Build the route tree
export const routeTree = rootRoute.addChildren([
  indexRoute,
  showsRoute,
  moviesRoute,
  musicRoute,
]);

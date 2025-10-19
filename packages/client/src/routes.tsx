import Network from "@/components/network";
import { Outlet, createRootRoute, createRoute } from "@tanstack/react-router";

export const rootRoute = createRootRoute({
  component: () => (
    <main className="w-screen h-screen font-main">
      <Outlet />
    </main>
  ),
});

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

// const musicRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: "/music/artists",
//   component: () => <Network mediaType="music-artists" />,
// });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: ({ navigate }) => {
    navigate({ to: "/shows" });
  },
  component: () => null,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  showsRoute,
  moviesRoute,
  // musicRoute,
]);

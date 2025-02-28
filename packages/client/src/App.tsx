import ShowNetwork from "@/components/show-network";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <main className="w-screen h-screen font-main">
          <ShowNetwork />
        </main>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

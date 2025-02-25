import ShowNetwork from "@/components/show-network";
import { ThemeProvider } from "@/components/theme-provider";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ShowNetwork />
    </ThemeProvider>
  );
};

export default App;

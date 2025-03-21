import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "dark" | "light" | "system";
export type ComputedTheme = "dark" | "light";

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
};

type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	getComputedTheme: () => ComputedTheme;
};

const initialState: ThemeProviderState = {
	theme: "system",
	setTheme: () => null,
	getComputedTheme: () => "light",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
	children,
	defaultTheme = "system",
	storageKey = "vite-ui-theme",
	...props
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(
		() => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
	);

	// Function to get the current system theme
	const getSystemTheme = (): ComputedTheme =>
		window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";

	// Function to get the computed theme
	const getComputedTheme = (): ComputedTheme => {
		if (theme === "system") {
			return getSystemTheme();
		}
		return theme;
	};

	useEffect(() => {
		const root = window.document.documentElement;

		root.classList.remove("light", "dark");

		const computedTheme = getComputedTheme();
		root.classList.add(computedTheme);
	}, [theme]);

	// Listen for system theme changes when in system mode
	useEffect(() => {
		if (theme !== "system") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handleChange = () => {
			const newSystemTheme = getSystemTheme();
			document.documentElement.classList.remove("light", "dark");
			document.documentElement.classList.add(newSystemTheme);
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	const value = useMemo(
		() => ({
			theme,
			setTheme: (theme: Theme) => {
				localStorage.setItem(storageKey, theme);
				setTheme(theme);
			},
			getComputedTheme,
		}),
		[theme, storageKey],
	);

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);

	if (context === undefined)
		throw new Error("useTheme must be used within a ThemeProvider");

	return context;
};

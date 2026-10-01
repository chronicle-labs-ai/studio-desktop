import { createContext, useContext } from "react";

export type ThemeType = "dark" | "light";

type ContextType = {
  theme: ThemeType;
  toggleTheme: (theme?: ThemeType) => void;
};

export const ThemeContext = createContext<ContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

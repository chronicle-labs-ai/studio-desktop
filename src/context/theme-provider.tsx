import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ThemeContext, type ThemeType } from "./theme-context";

export type { ThemeType } from "./theme-context";

const KEY = "theme";

export default function ThemeProvider({
  children,
}: PropsWithChildren<unknown>) {
  const [theme, setTheme] = useState<ThemeType>("light");

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.className = newTheme;
    await window.outerbaseIpc.setting.set(KEY, newTheme);
  }, [setTheme, theme]);

  useEffect(() => {
    (async () => {
      const savedTheme = await window.outerbaseIpc.setting.get<ThemeType>(KEY);
      if (savedTheme) {
        setTheme(savedTheme);
        document.body.className = savedTheme;
      }
    })();
  }, []);

  const value = useMemo(() => {
    return {
      theme,
      toggleTheme,
    };
  }, [toggleTheme, theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

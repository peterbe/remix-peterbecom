import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";

type HookProps = {
  theme: string | null;
  setTheme: Dispatch<SetStateAction<string | null>>;
};

export function useTheme(): HookProps {
  const [theme, setTheme] = useState<null | string>(null);

  useEffect(() => {
    try {
      const pref = localStorage.getItem("theme");
      if (pref === "light" || pref === "dark") setTheme(pref);
    } catch {}
  }, []);

  return { theme, setTheme };
}

export function ThemeToggler({
  theme,
  setTheme,
}: {
  theme: string | null;
  setTheme: Dispatch<SetStateAction<string | null>>;
}) {
  return (
    <a
      className="theme-toggler"
      href={theme === "dark" ? "#light" : "#dark"}
      role="button"
      onClick={(event) => {
        event.preventDefault();
        let nextTheme: string | null = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
        if (
          nextTheme === "dark" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
          try {
            localStorage.removeItem("theme");
          } catch {}
        } else {
          try {
            localStorage.setItem("theme", nextTheme);
          } catch {}
        }
      }}
    >
      toggle theme
    </a>
  );
}

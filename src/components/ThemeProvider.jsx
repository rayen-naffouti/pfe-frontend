import { createContext, useContext, useEffect, useMemo, useState } from "react"

const ThemeContext = createContext(null)
const STORAGE_KEY = "licentra-theme"

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "dark"
  }

  return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark"
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("light", theme === "light")
    root.classList.toggle("dark", theme === "dark")
    root.style.colorScheme = theme
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}

"use client"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

/** Wrapper directo de `next-themes`. Recibe: `children` + props de `ThemeProviderProps`. Produce: el provider. */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

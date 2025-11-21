/**
 * theme/colors.ts - Single Source of Truth for Theme Colors
 * 
 * PURPOSE:
 * This file defines the actual RGB color values used throughout the React Native app.
 * It is the PRIMARY source of truth for all theme colors in React Native components.
 * 
 * HOW IT'S USED:
 * 1. Components access colors via the `useColorScheme()` hook from `@/lib/useColorScheme`
 *    Example:
 *      const { colors } = useColorScheme();
 *      <View style={{ backgroundColor: colors.background }} />
 *      <Text style={{ color: colors.foreground }} />
 * 
 * 2. The hook automatically selects the correct theme (light/dark) based on NativeWind's colorScheme
 * 
 * ARCHITECTURE:
 * - Unified theme: Single color palette used across all platforms (iOS, Android, Web)
 *   This ensures consistent branding and simplifies maintenance
 * - Theme variants: `light` and `dark` theme objects
 * - Color tokens: Standard semantic color names (background, foreground, primary, etc.)
 * 
 * COLOR TOKENS:
 * - background: Main app background color
 * - foreground: Primary text color
 * - card: Card/container background color
 * - cardForeground: Text color on cards
 * - border: Border color for dividers and borders
 * - primary: Primary brand/accent color (Obsidian green)
 * - secondary: Secondary brand/accent color
 * - muted: Muted/subtle UI elements
 * - accent: Accent/highlight color
 * - destructive: Error/destructive action color
 * - popover: Popover/modal background
 * - input: Input field background
 * - ring: Focus ring color
 * 
 * RELATIONSHIP TO global.css:
 * - This file is used directly by React Native components (the primary method)
 * - `global.css` provides CSS variables for Tailwind classes and web platform
 * - Both should be kept in sync when updating theme colors
 * 
 * WHY TWO SYSTEMS?
 * - React Native doesn't support CSS variables natively
 * - CSS variables in `global.css` are for Tailwind utilities and web platform
 * - Direct RGB values here are for React Native's StyleSheet API
 * - Components use explicit colors from this file via `useColorScheme()` hook
 */

const COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(242, 242, 247)',
    grey5: 'rgb(230, 230, 235)',
    grey4: 'rgb(210, 210, 215)',
    grey3: 'rgb(199, 199, 204)',
    grey2: 'rgb(175, 176, 180)',
    grey: 'rgb(142, 142, 147)',
    background: 'rgb(242, 242, 247)',
    foreground: 'rgb(0, 0, 0)',
    root: 'rgb(255, 255, 255)',
    card: 'rgb(255, 255, 255)',
    cardForeground: 'rgb(8, 28, 30)',
    popover: 'rgb(230, 230, 235)',
    popoverForeground: 'rgb(0, 0, 0)',
    destructive: 'rgb(255, 56, 43)',
    primary: 'rgb(0, 123, 254)',
    primaryForeground: 'rgb(255, 255, 255)',
    secondary: 'rgb(45, 175, 231)',
    secondaryForeground: 'rgb(255, 255, 255)',
    muted: 'rgb(175, 176, 180)',
    mutedForeground: 'rgb(142, 142, 147)',
    accent: 'rgb(255, 40, 84)',
    accentForeground: 'rgb(255, 255, 255)',
    border: 'rgb(230, 230, 235)',
    input: 'rgb(210, 210, 215)',
    ring: 'rgb(230, 230, 235)',
  },
  dark: {
    grey6: 'rgb(26, 26, 26)',
    grey5: 'rgb(51, 51, 51)',
    grey4: 'rgb(51, 51, 51)',
    grey3: 'rgb(51, 51, 51)',
    grey2: 'rgb(153, 153, 153)',
    grey: 'rgb(153, 153, 153)',
    background: 'rgb(10, 10, 10)',
    foreground: 'rgb(236, 237, 238)',
    root: 'rgb(10, 10, 10)',
    card: 'rgb(26, 26, 26)',
    cardForeground: 'rgb(236, 237, 238)',
    popover: 'rgb(26, 26, 26)',
    popoverForeground: 'rgb(236, 237, 238)',
    destructive: 'rgb(244, 67, 54)',
    primary: 'rgb(76, 175, 80)',
    primaryForeground: 'rgb(255, 255, 255)',
    secondary: 'rgb(51, 51, 51)',
    secondaryForeground: 'rgb(236, 237, 238)',
    muted: 'rgb(51, 51, 51)',
    mutedForeground: 'rgb(153, 153, 153)',
    accent: 'rgb(255, 152, 0)',
    accentForeground: 'rgb(255, 255, 255)',
    border: 'rgb(51, 51, 51)',
    input: 'rgb(26, 26, 26)',
    ring: 'rgb(76, 175, 80)',
  },
} as const;

export { COLORS };
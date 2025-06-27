import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Ensure responsive classes are not purged
  safelist: [
    // Responsive breakpoints
    "sm:block",
    "md:block",
    "lg:block",
    "xl:block",
    "2xl:block",
    "sm:hidden",
    "md:hidden",
    "lg:hidden",
    "xl:hidden",
    "2xl:hidden",
    "sm:flex",
    "md:flex",
    "lg:flex",
    "xl:flex",
    "2xl:flex",
    "sm:grid",
    "md:grid",
    "lg:grid",
    "xl:grid",
    "2xl:grid",
    // Common responsive patterns
    "sm:text-sm",
    "md:text-base",
    "lg:text-lg",
    "xl:text-xl",
    "sm:p-2",
    "md:p-4",
    "lg:p-6",
    "xl:p-8",
    "sm:m-2",
    "md:m-4",
    "lg:m-6",
    "xl:m-8",
    // Responsive widths and heights
    "sm:w-full",
    "md:w-1/2",
    "lg:w-1/3",
    "xl:w-1/4",
    "sm:h-auto",
    "md:h-screen",
    "lg:h-full",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // Ensure proper screen breakpoints
      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  // Ensure responsive features work properly
  corePlugins: {
    // Ensure these are enabled
    container: true,
  },
  plugins: [],
} satisfies Config;

import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SubmissionsProvider } from "@/components/SubmissionsProvider";
import "./globals.css";

/*
 * Fonts are declared once, here, and exposed as CSS variables that
 * tailwind.config.js maps to `font-sans` / `font-display`.
 *
 * Previously `Inter` was imported in this file and never applied, while
 * NavBar, Hero, Footer, the sign-in page and the departments page each called
 * next/font individually -- six separate font loaders for three typefaces.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata = {
  title: {
    default: "Recruitment Portal",
    template: "%s | Recruitment Portal",
  },
  description:
    "Apply to join a department. Select up to two departments, answer a short questionnaire, and track your applications.",
  openGraph: {
    title: "Recruitment Portal",
    description: "Apply to join a department.",
    type: "website",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d11" },
  ],
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning is required by next-themes, which sets the
    // `class` attribute on <html> before React hydrates.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href="#main-content"
            className="sr-only-focusable absolute left-4 top-4 z-50 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Skip to main content
          </a>
          <SubmissionsProvider>
            {children}
            <Toaster richColors closeButton />
          </SubmissionsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

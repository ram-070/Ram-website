import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// ── Fonts ──────────────────────────────────────────────────────────────────────
// Space Grotesk: geometric display — used for headings/brand
// Inter: clean, humanist body — readable at any size
// JetBrains Mono: monospace for code/labels
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

// ── Metadata ───────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "Ram Dular Yadav · ML Engineer",
    template: "%s · Ram Dular Yadav",
  },
  description:
    "Machine Learning Engineer specialising in LLMs, NLP pipelines, computer vision, and RAG systems. GCP Certified. Based in Kathmandu, Nepal.",
  keywords: [
    "Machine Learning Engineer",
    "Deep Learning",
    "NLP",
    "Computer Vision",
    "RAG Systems",
    "LLMs",
    "LangChain",
    "Python",
    "TensorFlow",
    "PyTorch",
    "GCP Certified",
    "AI Engineer Nepal",
  ],
  authors: [{ name: "Ram Dular Yadav", url: "https://ram-portfolio.com" }],
  creator: "Ram Dular Yadav",
  metadataBase: new URL("https://ram-portfolio.com"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ram-portfolio.com",
    title: "Ram Dular Yadav · Machine Learning Engineer",
    description:
      "Building intelligent AI systems that ship to production. GCP Certified · Deep Learning · NLP · Computer Vision · RAG.",
    siteName: "Ram's Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ram Dular Yadav — Machine Learning Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ram Dular Yadav · Machine Learning Engineer",
    description:
      "Building intelligent AI systems that ship to production. GCP Certified · Deep Learning · NLP · Computer Vision · RAG.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0b6ef6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ── Layout ─────────────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`
        ${spaceGrotesk.variable}
        ${inter.variable}
        ${jetbrainsMono.variable}
        h-full antialiased scroll-smooth
      `}
    >
      <head>
        {/* Preconnect to font CDNs for faster load */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Structured data — Person schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Ram Dular Yadav",
              jobTitle: "Machine Learning Engineer",
              url: "https://ram-portfolio.com",
              sameAs: [
                "https://github.com/ram-070/",
                "https://www.linkedin.com/in/ram-dular-yadav-1611b0228/",
              ],
              knowsAbout: [
                "Machine Learning",
                "Deep Learning",
                "Natural Language Processing",
                "Computer Vision",
                "LLMs",
                "RAG Systems",
              ],
              address: {
                "@type": "PostalAddress",
                addressLocality: "Kathmandu",
                addressCountry: "NP",
              },
            }),
          }}
        />
      </head>

      <body className="min-h-full flex flex-col bg-[var(--bg-base)] text-[var(--text-1)] selection:bg-[var(--accent-subtle)] selection:text-[var(--accent)]">
        {children}
      </body>
    </html>
  );
}
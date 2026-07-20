import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Schibsted Grotesk: display face for headings and the wordmark
// Inter: body copy
// JetBrains Mono: eyebrows, durations, tags
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-schibsted",
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

export const metadata: Metadata = {
  title: {
    default: "Ram · Machine Learning Engineer",
    template: "%s · Ram",
  },
  description:
    "Machine Learning Engineer specialising in LLMs, NLP pipelines, computer vision, and RAG systems. GCP Certified. Based in Kathmandu, Nepal.",
  keywords: [
    "Machine Learning Engineer",
    "AI Engineer",
    "Data Scientist",
    "Deep Learning",
    "NLP",
    "Computer Vision",
    "RAG Systems",
    "LLMs",
    "Python",
    "TensorFlow",
    "PyTorch",
    "GCP Certified",
  ],
  authors: [{ name: "Ram Dular Yadav", url: "https://ram-portfolio.com" }],
  creator: "Ram Dular Yadav",
  metadataBase: new URL("https://ram-portfolio.com"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ram-portfolio.com",
    title: "Ram · Machine Learning Engineer",
    description:
      "Machine learning that ships to production. LLMs · NLP · Computer Vision · Forecasting. GCP Certified.",
    siteName: "Ram",
  },
  twitter: {
    card: "summary",
    title: "Ram · Machine Learning Engineer",
    description:
      "Machine learning that ships to production. LLMs · NLP · Computer Vision · Forecasting. GCP Certified.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F6F3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${schibsted.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
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

      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

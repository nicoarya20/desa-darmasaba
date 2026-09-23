import "@mantine/core/styles.css";
import "./globals.css"; // Sisanya import di globals.css

import LoadDataFirstClient from "@/app/darmasaba/_com/LoadDataFirstClient";
import { MusicProvider } from "@/app/context/MusicContext";
import {
  ColorSchemeScript,
  MantineProvider,
  createTheme,
  mantineHtmlProps,
  // mantineHtmlProps,
} from "@mantine/core";
import { Metadata, Viewport } from "next";
import { ViewTransitions } from "next-view-transitions";
import { ToastContainer } from "react-toastify";

// ✅ Pisahkan viewport ke export tersendiri
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};


const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_BASE_URL
    : "https://desa-darmasaba-stg.wibudev.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  
  title: {
    default: "Desa Darmasaba",
    template: "%s | Desa Darmasaba",
  },
  description: "Website resmi Desa Darmasaba, Kabupaten Badung, Bali. Informasi layanan publik, berita, dan profil desa.",
  // ❌ HAPUS viewport dari sini
  keywords: [
    "desa darmasaba",
    "darmasaba",
    "badung",
    "bali",
    "desa",
    "pemerintah desa",
    "layanan publik",
    "abang batan desa",
  ],
  authors: [{ name: "Pemerintah Desa Darmasaba" }],
  creator: "Desa Darmasaba",
  publisher: "Desa Darmasaba",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/assets/images/darmasaba-icon.png",
    apple: "/assets/images/darmasaba-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Desa Darmasaba",
    title: "Desa Darmasaba - Kabupaten Badung, Bali",
    description: "Website resmi Desa Darmasaba, Kabupaten Badung, Bali. Informasi layanan publik, berita, dan profil desa.",
    images: [
      {
        url: "/assets/images/darmasaba-icon.png",
        width: 1200,
        height: 630,
        alt: "Desa Darmasaba",
      },
    ],
  },
  category: "government",
  other: {
    "msapplication-TileColor": "#ffffff",
    "theme-color": "#ffffff",
  },
};

const theme = createTheme({
  fontFamily: "San Francisco, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  fontFamilyMonospace: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  headings: { fontFamily: "San Francisco, sans-serif" },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" {...mantineHtmlProps}>
      <head>
        <meta charSet="utf-8" />
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <ViewTransitions>
          <MusicProvider>
            <MantineProvider theme={theme} defaultColorScheme="light">
              {children}
              <LoadDataFirstClient />
              <ToastContainer
                position="bottom-center"
                hideProgressBar
                style={{ zIndex: 9999 }}
              />
            </MantineProvider>
          </MusicProvider>
        </ViewTransitions>
      </body>
    </html>
  );
}
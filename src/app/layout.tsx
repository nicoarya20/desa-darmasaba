import "@mantine/core/styles.css";
import "./globals.css"; // Sisanya import di globals.css

import LoadDataFirstClient from "@/app/(public)/_com/LoadDataFirstClient";
import { GATE_SPLASH_HEAD_SCRIPT } from "@/app/(public)/_com/splash/gate-splash.session";
import { MusicProvider } from "@/app/context/MusicContext";
import {
  ColorSchemeScript,
  MantineProvider,
  createTheme,
  mantineHtmlProps,
  v8CssVariablesResolver,
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
  // Kompatibilitas Mantine 9: pertahankan tampilan v8 — radius default 'sm' (v9 = 'md')
  // dan fontWeights.medium '500' (v9 = '600'). Hapus saat fondasi tema baru diterapkan
  // (docs/decisions/2026-11-04-mantine-8-staged-upgrade.md).
  defaultRadius: "sm",
  fontWeights: { medium: "500" },
  // v8 memakai 600 untuk Button (+ GroupSection), sedangkan label/input dsb. 500. Di v9
  // semuanya memakai --mantine-font-weight-medium, jadi medium '500' saja menipiskan Button.
  // Override var-nya di root (bukan font-weight langsung) agar `fw`/`style`/className
  // pemakai tetap menang seperti di v8. Objek biasa, bukan `.extend()`: layout ini server component.
  components: {
    Button: { styles: { root: { "--mantine-font-weight-medium": "600" } } },
    ButtonGroupSection: { styles: { groupSection: { "--mantine-font-weight-medium": "600" } } },
    ActionIconGroupSection: { styles: { groupSection: { "--mantine-font-weight-medium": "600" } } },
  },
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
        {/* Putuskan splash beranda sebelum paint (lihat gate-splash.session.ts); di root layout agar tak dirender ulang saat navigasi. */}
        <script dangerouslySetInnerHTML={{ __html: GATE_SPLASH_HEAD_SCRIPT }} />
      </head>
      <body>
        <ViewTransitions>
          <MusicProvider>
            {/* v8CssVariablesResolver: pertahankan warna varian light/outline v8 selama migrasi Mantine 9 */}
            <MantineProvider
              theme={theme}
              defaultColorScheme="light"
              cssVariablesResolver={v8CssVariablesResolver}
            >
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
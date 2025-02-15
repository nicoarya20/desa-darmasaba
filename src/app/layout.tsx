// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/carousel/styles.css";
import "@mantine/core/styles.css";
import "animate.css";
import "./globals.css";

import LoadDataFirstClient from "@/com/LoadDataFirstClient";
import {
  ColorSchemeScript,
  MantineProvider,
  createTheme,
  mantineHtmlProps,
} from "@mantine/core";
import { MainLayout } from "../com/MainLayout";
import { ViewTransitions } from "next-view-transitions";
import { WebVitals } from "./_com/WebVitals";

export const metadata = {
  title: "desa darmasaba",
  description: "Desa Darmasaba Kabupaten Badung",
};

const theme = createTheme({
  fontFamily:
    "San Francisco, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  fontFamilyMonospace:
    "SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
  headings: { fontFamily: "San Francisco, sans-serif" },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransitions>
      <html lang="en" {...mantineHtmlProps}>
        <head>
          <ColorSchemeScript />
          <link
            rel="icon"
            href="/assets/images/darmasaba-icon.png"
            sizes="any"
          />
        </head>
        <body>
          <MantineProvider theme={theme}>
            <MainLayout>
              <WebVitals />
              {children}
            </MainLayout>
          </MantineProvider>
        </body>
        <LoadDataFirstClient />
      </html>
    </ViewTransitions>
  );
}

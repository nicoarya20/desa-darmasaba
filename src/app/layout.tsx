// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/carousel/styles.css";
import "@mantine/core/styles.css";
import '@mantine/dropzone/styles.css';
import "animate.css";
import 'react-simple-toasts/dist/style.css';
import 'react-simple-toasts/dist/theme/dark.css';
import "./globals.css";
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/tiptap/styles.css';

import LoadDataFirstClient from "@/app/darmasaba/_com/LoadDataFirstClient";
import {
  ColorSchemeScript,
  MantineProvider,
  createTheme,
  mantineHtmlProps,
} from "@mantine/core";
import { ViewTransitions } from "next-view-transitions";
import { ToastContainer } from "react-toastify";

export const metadata = {
  title: "Desa Darmasaba",
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
            {children}

          </MantineProvider>
          <ToastContainer position="bottom-center" hideProgressBar style={{
          zIndex: 9999
        }} />
        </body>
        <LoadDataFirstClient />
      </html>
    </ViewTransitions>
  );
}

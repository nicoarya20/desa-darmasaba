"use client";

import colors from "@/con/colors";
import { Box, Space, Stack } from "@mantine/core";

import { Navbar } from "@/app/darmasaba/_com/Navbar";
import Footer from "./Footer";
import FixedPlayerBar from "./FixedPlayerBar";
import { ImageErrorRetry } from "./ImageErrorRetryMount";

/** Kerangka halaman publik /darmasaba: navbar, konten, footer, dan pemutar musik. */
export function DarmasabaShell({ children }: { children: React.ReactNode }) {
    return (
            <Stack gap={0} bg={colors.grey[1]}>
                <ImageErrorRetry />
                <Navbar />
                <Space h={{
                    base: "3rem", // = tinggi bar mobile (--m-bar-h 48px)
                    md: "2.75rem" // = tinggi navbar desktop (--nav-h 44px)
                }} />
                <Box>{children}</Box>
                <Footer />
                <FixedPlayerBar />
            </Stack>
    )
}
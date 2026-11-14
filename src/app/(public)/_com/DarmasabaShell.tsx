"use client";

import colors from "@/con/colors";
import { Box, Space, Stack } from "@mantine/core";
import { usePathname } from "next/navigation";

import { Navbar } from "@/app/(public)/_com/Navbar";
import Footer from "./Footer";
import FixedPlayerBar from "./FixedPlayerBar";
import { ImageErrorRetry } from "./ImageErrorRetryMount";
import { isMusikAppPath } from "./musik-route";

/** Kerangka halaman publik (route group (public)): navbar, konten, footer, dan pemutar musik. */
export function DarmasabaShell({ children }: { children: React.ReactNode }) {
    // Aplikasi Musik Desa (/musik/musik-desa/**) tampil seperti aplikasi: tanpa footer situs, dan bar pemutarnya
    // sendiri (NowPlayingBar) menggantikan FixedPlayerBar. Ruang bar diurus MusikApp (--m-bar-space).
    const isMusikApp = isMusikAppPath(usePathname());
    return (
            <Stack gap={0} bg={colors.grey[1]}>
                <ImageErrorRetry />
                <Navbar />
                <Space h={{
                    base: "3rem", // = tinggi bar mobile (--m-bar-h 48px)
                    md: "2.75rem" // = tinggi navbar desktop (--nav-h 44px)
                }} />
                <Box>{children}</Box>
                {!isMusikApp && (
                    <>
                        <Footer />
                        <FixedPlayerBar />
                    </>
                )}
            </Stack>
    )
}
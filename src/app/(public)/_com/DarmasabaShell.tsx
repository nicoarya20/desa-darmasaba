"use client";

import colors from "@/con/colors";
import { Box, Space, Stack } from "@mantine/core";
import { usePathname } from "next/navigation";

import { Navbar } from "@/app/(public)/_com/Navbar";
import Footer from "./Footer";
import FixedPlayerBar from "./FixedPlayerBar";
import { ImageErrorRetry } from "./ImageErrorRetryMount";
import { isMusikAppPath } from "@/app/(public)/(pages)/musik/musik-desa/_com/app/musik-nav.logic";
import { MusikPlayerSpacer } from "@/app/(public)/(pages)/musik/musik-desa/_com/app/MusikPlayerSpacer";

/** Kerangka halaman publik (route group (public)): navbar, konten, footer, dan pemutar musik. */
export function DarmasabaShell({ children }: { children: React.ReactNode }) {
    // Aplikasi Musik Desa (/musik/**) punya bar pemutar sendiri (NowPlayingBar, position fixed):
    // FixedPlayerBar situs tidak dirender di sana, diganti spasi setinggi bar agar footer tak tertutup.
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
                <Footer />
                {isMusikApp ? <MusikPlayerSpacer /> : <FixedPlayerBar />}
            </Stack>
    )
}
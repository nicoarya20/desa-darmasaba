"use client";

import { Box, Space, Stack } from "@mantine/core";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

import { Navbar } from "@/app/(public)/_com/Navbar";
import Footer from "./Footer";
import FixedPlayerBar from "./FixedPlayerBar";
import { ImageErrorRetry } from "./ImageErrorRetryMount";
import { isMusikAppPath } from "./musik-route";

/** Tinggi ruang di bawah navbar tetap: bar mobile (--m-bar-h 48px) dan navbar desktop (--nav-h 44px). */
const NAV_SPACER_HEIGHT = { base: "3rem", md: "2.75rem" } as const;
/**
 * Tinggi minimum konten = sisa layar di bawah navbar. Kebanyakan halaman mengisi kontennya lewat fetch klien, jadi
 * tanpa ini footer sempat tampil di layar lalu terdorong jauh ke bawah saat data tiba (CLS 0,24-0,94 di Lighthouse).
 * `svh` (layar kecil) agar footer tidak ikut terlihat saat bilah alamat ponsel menyusut.
 */
const CONTENT_MIN_HEIGHT = {
    base: `calc(100svh - ${NAV_SPACER_HEIGHT.base})`,
    md: `calc(100svh - ${NAV_SPACER_HEIGHT.md})`,
} as const;

const JennaWidget = dynamic(() => import("./jenna/JennaWidget"), { ssr: false });

/** Kerangka halaman publik (route group (public)): navbar, konten, footer, pemutar musik, dan asisten Jenna. */
export function DarmasabaShell({ children }: { children: React.ReactNode }) {
    // Aplikasi Musik Desa (/musik/musik-desa/**) tampil seperti aplikasi: tanpa footer situs, dan bar pemutarnya
    // sendiri (NowPlayingBar) menggantikan FixedPlayerBar. Ruang bar diurus MusikApp (--m-bar-space).
    const isMusikApp = isMusikAppPath(usePathname());
    return (
            <Stack gap={0} bg="var(--c-page)">
                <ImageErrorRetry />
                <Navbar />
                <Space h={NAV_SPACER_HEIGHT} />
                {/* Aplikasi Musik mengatur tingginya sendiri dan tanpa footer, jadi tidak diberi tinggi minimum. */}
                <Box mih={isMusikApp ? undefined : CONTENT_MIN_HEIGHT}>{children}</Box>
                {!isMusikApp && (
                    <>
                        <Footer />
                        <FixedPlayerBar />
                    </>
                )}
                <JennaWidget />
            </Stack>
    )
}
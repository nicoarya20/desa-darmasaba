'use client'
import DesaAntiKorupsi from "@/app/darmasaba/_com/main-page/desaantikorupsi";
import Kepuasan from "@/app/darmasaba/_com/main-page/kepuasan";
import LandingPage from "@/app/darmasaba/_com/main-page/landing-page";
import Layanan from "@/app/darmasaba/_com/main-page/layanan";
import Penghargaan from "@/app/darmasaba/_com/main-page/penghargaan";
import Potensi from "@/app/darmasaba/_com/main-page/potensi";
import colors from "@/con/colors";
import SDGS from "./_com/main-page/sdgs";

import { Box, Stack } from "@mantine/core";
import Apbdes from "./_com/main-page/apbdes";
import Prestasi from "./_com/main-page/prestasi";
import ScrollToTopButton from "./_com/scrollToTopButton";

import NewsReaderLanding from "./_com/NewsReaderalanding";
import ModernNewsNotification from "./_com/ModernNeewsNotification";
import { useMemo } from "react";
import { useProxy } from "valtio/utils";
import stateDashboardBerita from "../admin/(dashboard)/_state/desa/berita";
import stateDesaPengumuman from "../admin/(dashboard)/_state/desa/pengumuman";
import { useEffect } from "react";


export default function Page() {
  const featured = useProxy(stateDashboardBerita.berita.findFirst);
  const loadingFeatured = featured.loading;
  const pengumuman = useProxy(stateDesaPengumuman.pengumuman.findFirst);
  const loadingPengumuman = pengumuman.loading;

  useEffect(() => {
    if (!featured.data && !loadingFeatured) {
      stateDashboardBerita.berita.findFirst.load();
    }
  }, [featured.data, loadingFeatured]);

  useEffect(() => {
    if (!pengumuman.data && !loadingPengumuman) {
      stateDesaPengumuman.pengumuman.findFirst.load();
    }
  }, [pengumuman.data, loadingPengumuman]);


  const newsData = useMemo(() => {
    const items = [];

    if (featured.data) {
      items.push({
        id: String(featured.data.id || "berita-1"),
        type: "berita" as const,
        title: String(featured.data.judul || "Berita Terbaru"),
        content: String(featured.data.content || ""),
        timestamp: featured.data.createdAt
          ? (typeof featured.data.createdAt === 'string'
            ? featured.data.createdAt
            : new Date(featured.data.createdAt).toISOString())
          : new Date().toISOString(),
      });
    }

    if (pengumuman.data) {
      items.push({
        id: String(pengumuman.data.id || "pengumuman-1"),
        type: "pengumuman" as const,
        title: String(pengumuman.data.judul || "Pengumuman Penting"),
        content: String(pengumuman.data.content || ""),
        timestamp: pengumuman.data.createdAt
          ? (typeof pengumuman.data.createdAt === 'string'
            ? pengumuman.data.createdAt
            : new Date(pengumuman.data.createdAt).toISOString())
          : new Date().toISOString(),
      });
    }

    return items;
  }, [featured.data, pengumuman.data]);


  return (
    <Box id="page-root">
      <Stack
        bg={colors.grey[1]}
        gap={0}
      >
        {/* HAPUS RUNNING TEXT, GANTI DENGAN MODERN NOTIFICATION */}
        <LandingPage />
        <Penghargaan />
        <Layanan />
        <Potensi />
        <DesaAntiKorupsi />
        <Kepuasan />
        <SDGS />
        <Apbdes />
        <Prestasi />
      </Stack>

      {/* Tombol Scroll ke Atas */}
      <ScrollToTopButton />

      <NewsReaderLanding />
      <ModernNewsNotification
        news={newsData}
        autoShowDelay={2000} // Muncul 2 detik setelah load
      />
    </Box>
  );
}
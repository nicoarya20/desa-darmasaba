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
import RunningText from "./_com/RunningText";
import { useProxy } from "valtio/utils";
import stateDashboardBerita from "../admin/(dashboard)/_state/desa/berita";
import { useEffect, useMemo } from "react";
import stateDesaPengumuman from "../admin/(dashboard)/_state/desa/pengumuman";


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

  // Memoize news data untuk performa lebih baik
  const newsData = useMemo(() => {
    const items = [];
    
    // Tambahkan judul berita jika ada
    if (featured.data?.judul) {
      items.push(`📰 BERITA: ${featured.data.judul}`);
    }
    
    // Tambahkan content berita (akan di-strip HTML di component)
    if (featured.data?.content) {
      items.push(featured.data.content);
    }
    
    // Tambahkan judul pengumuman jika ada
    if (pengumuman.data?.judul) {
      items.push(`📢 PENGUMUMAN: ${pengumuman.data.judul}`);
    }
    
    // Tambahkan content pengumuman
    if (pengumuman.data?.content) {
      items.push(pengumuman.data.content);
    }
    
    // Jika tidak ada data, return default message
    if (items.length === 0) {
      return [
        "Selamat datang di Portal Desa Darmasaba",
        "Jam operasional kantor: Senin - Jumat 08:00 - 17:00"
      ];
    }
    
    return items;
  }, [featured.data, pengumuman.data]);

  return (
    <Box>
      <Stack 
        bg={colors.grey[1]} 
        gap={0}
      >
        <RunningText 
          news={newsData}
          autoSpeed={false}
          maxLength={150}  // Potong text panjang
          speed={100}       // Base speed (tidak dipakai jika autoSpeed=true)
          bgColor="#1e5a7e"
          textColor="white"
        />
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
    </Box>
  );
}
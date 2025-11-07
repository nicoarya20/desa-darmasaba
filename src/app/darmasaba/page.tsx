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


export default function Page() {


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

      <NewsReaderLanding/>
      
    </Box>
  );
}
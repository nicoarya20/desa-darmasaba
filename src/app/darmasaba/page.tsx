'use client';

import DesaAntiKorupsi from "@/app/darmasaba/_com/main-page/desaantikorupsi";
import Kepuasan from "@/app/darmasaba/_com/main-page/kepuasan";
import LandingPage from "@/app/darmasaba/_com/main-page/landing-page";
import LayananPotensi from "@/app/darmasaba/_com/main-page/layanan-potensi";
import colors from "@/con/colors";
import SDGS from "./_com/main-page/sdgs";

import { Box, Stack } from "@mantine/core";
import Apbdes from "./_com/main-page/apbdes";
import KabarDesa from "./_com/main-page/kabar-desa";
import Prestasi from "./_com/main-page/prestasi";
import ScrollToTopButton from "./_com/scrollToTopButton";
import GateSplash from "./_com/splash/GateSplash";

import NewsReaderLanding from "./_com/NewsReaderalanding";

export default function Page() {
  return (
    <Box id="page-root">
      <GateSplash />
      <Stack bg={colors.grey[1]} gap={0}>
        <LandingPage />
        <KabarDesa />
        <Apbdes />
        <Prestasi />
        <LayananPotensi />
        <DesaAntiKorupsi />
        <SDGS />
        <Kepuasan />
      <ScrollToTopButton />
      <NewsReaderLanding />
      </Stack>

    </Box>
  );
}

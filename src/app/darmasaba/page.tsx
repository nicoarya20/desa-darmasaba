/* eslint-disable react-hooks/exhaustive-deps */
'use client';

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

import { useEffect, useRef, useState } from "react";
import { useSnapshot } from "valtio";
import stateDashboardBerita from "../admin/(dashboard)/_state/desa/berita";
import stateDesaPengumuman from "../admin/(dashboard)/_state/desa/pengumuman";

import NewsReaderLanding from "./_com/NewsReaderalanding";
import ModernNewsNotification from "./_com/ModernNewsNotification";
import type { NewsItem } from "./_com/ModernNewsNotification"; // pastikan tipe ini diekspor

export default function Page() {
  // Tetap gunakan Valtio untuk card utama (NewsReaderLanding)
  const snap1 = useSnapshot(stateDashboardBerita.berita.findFirst);
  const snap2 = useSnapshot(stateDesaPengumuman.pengumuman.findFirst);
  const featured = snap1;
  const pengumuman = snap2;
  const loadingFeatured = featured.loading;
  const loadingPengumuman = pengumuman.loading;

  // State untuk notifikasi
  const [notificationNews, setNotificationNews] = useState<NewsItem[]>([]);
  const [hasNewContent, setHasNewContent] = useState(false);
  const [newItemCount, setNewItemCount] = useState(0);

  const lastBeritaId = useRef<string | null>(null);
  const lastPengumumanId = useRef<string | null>(null);

  // Inisialisasi dari localStorage
  useEffect(() => {
    const savedBerita = localStorage.getItem("lastSeenBeritaId");
    const savedPengumuman = localStorage.getItem("lastSeenPengumumanId");
    if (savedBerita) lastBeritaId.current = savedBerita;
    if (savedPengumuman) lastPengumumanId.current = savedPengumuman;
  }, []);

  // Load data utama (untuk card)
  useEffect(() => {
    if (!featured.data && !loadingFeatured) {
      stateDashboardBerita.berita.findFirst.load();
    }
  }, []);

  useEffect(() => {
    if (!pengumuman.data && !loadingPengumuman) {
      stateDesaPengumuman.pengumuman.findFirst.load();
    }
  }, []);

  // 🔁 Fetch berita & pengumuman lengkap untuk notifikasi
  const fetchNotificationData = async () => {
    try {
      const res = await fetch("/api/news/latest");
      const result = await res.json();
      if (result.success && Array.isArray(result.news)) {
        const news = result.news as NewsItem[];

        // Ambil ID terbaru
        const latestBerita = news.find((n) => n.type === "berita");
        const latestPengumuman = news.find((n) => n.type === "pengumuman");

        const isNewBerita = latestBerita && lastBeritaId.current !== null && latestBerita.id !== lastBeritaId.current;
        const isNewPengumuman = latestPengumuman && lastPengumumanId.current !== null && latestPengumuman.id !== lastPengumumanId.current;

        // Simpan ID terbaru ke ref
        if (latestBerita) lastBeritaId.current = (latestBerita.id);
        if (latestPengumuman) lastPengumumanId.current = (latestPengumuman.id);

        // Jika ini bukan inisialisasi pertama, tampilkan notifikasi
        if (lastBeritaId.current !== null || lastPengumumanId.current !== null) {
          if (isNewBerita || isNewPengumuman) {
            const count = (isNewBerita ? 1 : 0) + (isNewPengumuman ? 1 : 0);
            setNewItemCount(count);
            setHasNewContent(true);
          }
        } else {
          // Simpan ke localStorage saat pertama kali
          if (latestBerita) localStorage.setItem("lastSeenBeritaId", (latestBerita.id));
          if (latestPengumuman) localStorage.setItem("lastSeenPengumumanId", (latestPengumuman.id));
        }

        setNotificationNews(news);
      }
    } catch (err) {
      console.error("Gagal fetch data notifikasi:", err);
    }
  };

  // Load data notifikasi pertama kali
  useEffect(() => {
    fetchNotificationData();
  }, []);

  // Polling setiap 30 detik
  useEffect(() => {
    const interval = setInterval(fetchNotificationData, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleSeen = () => {
  setHasNewContent(false);
  setNewItemCount(0);
  const latestBerita = notificationNews.find(n => n.type === "berita");
  const latestPengumuman = notificationNews.find(n => n.type === "pengumuman");
  if (latestBerita) localStorage.setItem("lastSeenBeritaId", String(latestBerita.id));
  if (latestPengumuman) localStorage.setItem("lastSeenPengumumanId", String(latestPengumuman.id));
};

  return (
    <Box id="page-root">
      <Stack bg={colors.grey[1]} gap={0}>
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

      <ScrollToTopButton />
      <NewsReaderLanding />

      <ModernNewsNotification
        news={notificationNews}
        hasNewContent={hasNewContent}
        newItemCount={newItemCount}
        onSeen={handleSeen}
        autoShowDelay={2000}
      />
    </Box>
  );
}
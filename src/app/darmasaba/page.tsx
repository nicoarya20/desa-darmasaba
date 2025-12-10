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

  const lastBeritaTimestamp = useRef<string | null>(null);
  const lastPengumumanTimestamp = useRef<string | null>(null);

  // Inisialisasi dari localStorage
  useEffect(() => {
    const savedBeritaTs = localStorage.getItem("lastSeenBeritaTs");
    const savedPengumumanTs = localStorage.getItem("lastSeenPengumumanTs");
    if (savedBeritaTs) lastBeritaTimestamp.current = savedBeritaTs;
    if (savedPengumumanTs) lastPengumumanTimestamp.current = savedPengumumanTs;
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

        const latestBerita = news.find((n) => n.type === "berita");
        const latestPengumuman = news.find((n) => n.type === "pengumuman");

        const latestBeritaTs = latestBerita?.timestamp
          ? new Date(latestBerita.timestamp).toISOString()
          : null;
        const latestPengumumanTs = latestPengumuman?.timestamp
          ? new Date(latestPengumuman.timestamp).toISOString()
          : null;

        // Inisialisasi flag
        let isNewBerita = false;
        let isNewPengumuman = false;

        // Deteksi berita baru
        if (latestBeritaTs) {
          if (lastBeritaTimestamp.current === null) {
            // Pertama kali: simpan tanpa notifikasi
            lastBeritaTimestamp.current = latestBeritaTs;
            localStorage.setItem("lastSeenBeritaTs", latestBeritaTs);
          } else if (latestBeritaTs > lastBeritaTimestamp.current) {
            isNewBerita = true;
            lastBeritaTimestamp.current = latestBeritaTs;
          }
        }

        // Deteksi pengumuman baru
        if (latestPengumumanTs) {
          if (lastPengumumanTimestamp.current === null) {
            // Pertama kali: simpan tanpa notifikasi
            lastPengumumanTimestamp.current = latestPengumumanTs;
            localStorage.setItem("lastSeenPengumumanTs", latestPengumumanTs);
          } else if (latestPengumumanTs > lastPengumumanTimestamp.current) {
            isNewPengumuman = true;
            lastPengumumanTimestamp.current = latestPengumumanTs;
          }
        }

        // 🔔 Trigger notifikasi hanya jika ada yang benar-benar BARU
        if (isNewBerita || isNewPengumuman) {
          const count = (isNewBerita ? 1 : 0) + (isNewPengumuman ? 1 : 0);
          setNewItemCount(count);
          setHasNewContent(true); // ✅ INI YANG KAMU LUPA!
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
    if (latestBerita) {
      localStorage.setItem("lastSeenBeritaTs", new Date(latestBerita.timestamp!).toISOString());
    }
    if (latestPengumuman) {
      localStorage.setItem("lastSeenPengumumanTs", new Date(latestPengumuman.timestamp!).toISOString());
    }
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
      <ScrollToTopButton />
      <NewsReaderLanding />

      <ModernNewsNotification
        news={notificationNews}
        hasNewContent={hasNewContent}
        newItemCount={newItemCount}
        onSeen={handleSeen}
        autoShowDelay={2000}
      />
      </Stack>

    </Box>
  );
}
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

import { useEffect, useMemo, useRef, useState } from "react";
import { useSnapshot } from "valtio";
import stateDashboardBerita from "../admin/(dashboard)/_state/desa/berita";
import stateDesaPengumuman from "../admin/(dashboard)/_state/desa/pengumuman";

import NewsReaderLanding from "./_com/NewsReaderalanding";
import ModernNewsNotification from "./_com/ModernNewsNotification";

export default function Page() {
  const snap1 = useSnapshot(stateDashboardBerita.berita.findFirst);
  const snap2 = useSnapshot(stateDesaPengumuman.pengumuman.findFirst);
  const featured = snap1;
  const pengumuman = snap2;
  const loadingFeatured = featured.loading;
  const loadingPengumuman = pengumuman.loading;

  const [hasNewContent, setHasNewContent] = useState(false);
  const [newItemCount, setNewItemCount] = useState(0);

  const lastBeritaId = useRef<string | null>(null);
  const lastPengumumanId = useRef<string | null>(null);

  // 🔁 Inisialisasi dari localStorage saat mount
  useEffect(() => {
    const savedBerita = localStorage.getItem("lastSeenBeritaId");
    const savedPengumuman = localStorage.getItem("lastSeenPengumumanId");
    if (savedBerita) lastBeritaId.current = savedBerita;
    if (savedPengumuman) lastPengumumanId.current = savedPengumuman;
  }, []);

  // Simpan ID saat data dimuat (termasuk dari API)
  useEffect(() => {
    if (featured.data?.id) lastBeritaId.current = featured.data.id;
    if (pengumuman.data?.id) lastPengumumanId.current = pengumuman.data.id;
  }, [featured.data?.id, pengumuman.data?.id]);

  // Load data awal
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

  // 🔁 Polling untuk cek update setiap 30 detik
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const res = await fetch("/api/check-update");
        const result = await res.json();

        if (!result.success) return;

        const { berita, pengumuman } = result.data;

        // Deteksi hanya jika sudah pernah ada data sebelumnya
        const isNewBerita = berita && lastBeritaId.current !== null && berita.id !== lastBeritaId.current;
        const isNewPengumuman = pengumuman && lastPengumumanId.current !== null && pengumuman.id !== lastPengumumanId.current;

        if (isNewBerita || isNewPengumuman) {
          // Hitung berapa yang benar-benar baru
          const count = (isNewBerita ? 1 : 0) + (isNewPengumuman ? 1 : 0);
          setNewItemCount(count);
          setHasNewContent(true);

          // Reload hanya yang berubah
          if (isNewBerita) stateDashboardBerita.berita.findFirst.load();
          if (isNewPengumuman) stateDesaPengumuman.pengumuman.findFirst.load();
        } else {
          // Jika ini adalah pertama kali (masih null), simpan ID tanpa notifikasi
          if (lastBeritaId.current === null && berita) {
            lastBeritaId.current = berita.id;
            localStorage.setItem("lastSeenBeritaId", berita.id);
          }
          if (lastPengumumanId.current === null && pengumuman) {
            lastPengumumanId.current = pengumuman.id;
            localStorage.setItem("lastSeenPengumumanId", pengumuman.id);
          }
        }
      } catch (err) {
        console.error("Gagal cek update berita/pengumuman:", err);
      }
    };

    const interval = setInterval(checkForUpdates, 30_000);
    return () => clearInterval(interval);
  }, []);

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

  const handleSeen = () => {
    setHasNewContent(false);
    setNewItemCount(0);
    // Simpan ke localStorage saat dilihat
    if (featured.data?.id) localStorage.setItem("lastSeenBeritaId", featured.data.id);
    if (pengumuman.data?.id) localStorage.setItem("lastSeenPengumumanId", pengumuman.data.id);
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
        news={newsData}
        hasNewContent={hasNewContent}
        newItemCount={newItemCount}
        onSeen={handleSeen}
        autoShowDelay={2000}
      />
    </Box>
  );
}
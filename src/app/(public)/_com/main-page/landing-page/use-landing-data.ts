"use client";
import { Prisma } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  getCurrentTime,
  getDayOfWeek,
  getTodayDate,
  getWorkStatus,
  type HolidayInfo,
  type WorkStatus,
} from "./landing.logic";

export type SosmedItem = Prisma.MediaSosialGetPayload<{ include: { image: true } }>;
export type PejabatItem = Prisma.PejabatDesaGetPayload<{ include: { image: true } }>;

const STATUS_REFRESH_MS = 60 * 1000;

async function getJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

/** Data hero beranda: media sosial, profil Perbekel, dan status kantor (diperbarui tiap menit). */
export function useLandingData() {
  const [socialMedia, setSocialMedia] = useState<SosmedItem[]>([]);
  const [profile, setProfile] = useState<PejabatItem | null>(null);
  const [loadingSosmed, setLoadingSosmed] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [holiday, setHoliday] = useState<HolidayInfo | null>(null);
  const [workStatus, setWorkStatus] = useState<WorkStatus | null>(null);

  useEffect(() => {
    // Tiap bagian gagal sendiri-sendiri: bagian itu tampil kosong, hero lainnya tetap jalan.
    getJson("/api/landingpage/mediasosial/findMany")
      .then((result) => setSocialMedia(Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : []))
      .catch(() => setSocialMedia([]))
      .finally(() => setLoadingSosmed(false));

    getJson("/api/landingpage/pejabatdesa/edit")
      .then((result) => setProfile(result.data || null))
      .catch(() => setProfile(null))
      .finally(() => setLoadingProfile(false));

    getJson(`/api/landingpage/harilibur/cek?date=${getTodayDate()}`)
      .then((result) => setHoliday({ isHoliday: Boolean(result.isHoliday), holidayName: result.holidayName ?? null }))
      // Fail-open: kalau gagal ambil data hari libur, anggap bukan hari libur
      // supaya status kantor tetap jalan berdasarkan jam kerja normal.
      .catch(() => setHoliday({ isHoliday: false, holidayName: null }));
  }, []);

  useEffect(() => {
    if (!holiday) return;
    const update = () => setWorkStatus(getWorkStatus(getDayOfWeek(), getCurrentTime(), holiday));
    update();
    const intervalId = setInterval(update, STATUS_REFRESH_MS);
    return () => clearInterval(intervalId);
  }, [holiday]);

  return { socialMedia, profile, loadingSosmed, loadingProfile, workStatus };
}

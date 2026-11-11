import { sosmedMap } from "@/app/admin/(dashboard)/landing-page/profil/_lib/sosmed";

/** Status kantor desa: buka/tutup + keterangan (jam layanan atau nama hari libur). */
export type WorkStatus = { status: "Buka" | "Tutup"; message: string };
export type HolidayInfo = { isHoliday: boolean; holidayName: string | null };

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const FULL_DAYS = ["Senin", "Selasa", "Rabu", "Kamis"];
const FULL_DAY_HOURS = { open: "07:30", close: "15:30" };
const FRIDAY_HOURS = { open: "07:30", close: "12:00" };

/** Nama hari (Indonesia) dari sebuah tanggal. */
export const getDayOfWeek = (date = new Date()): string => DAYS[date.getDay()];

/** Jam `HH:mm` dari sebuah tanggal. */
export const getCurrentTime = (date = new Date()): string =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

/** Tanggal `YYYY-MM-DD` untuk pengecekan hari libur. */
export const getTodayDate = (date = new Date()): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const hoursOf = (day: string) =>
  FULL_DAYS.includes(day) ? FULL_DAY_HOURS : day === "Jumat" ? FRIDAY_HOURS : null;

/** Kantor buka bila bukan hari libur dan jam berada setelah jam buka sampai jam tutup. */
export const isWorkingHours = (day: string, currentTime: string, isHoliday: boolean): boolean => {
  const hours = hoursOf(day);
  if (isHoliday || !hours) return false;
  // "HH:mm" selalu 2 digit, jadi perbandingan string = perbandingan waktu.
  return currentTime > hours.open && currentTime <= hours.close;
};

/** Status kantor untuk hari & jam tertentu; hari libur nasional mengalahkan jam kerja. */
export const getWorkStatus = (day: string, currentTime: string, holiday: HolidayInfo): WorkStatus => {
  if (holiday.isHoliday) {
    return { status: "Tutup", message: holiday.holidayName ?? "Hari Libur Nasional" };
  }
  const hours = hoursOf(day);
  if (!hours) return { status: "Tutup", message: "Libur Akhir Pekan" };

  return {
    status: isWorkingHours(day, currentTime, false) ? "Buka" : "Tutup",
    message: `${hours.open} - ${hours.close}`,
  };
};

/** Keterangan di samping status: jam layanan diberi awalan, nama hari libur ditampilkan apa adanya. */
export const describeWorkStatus = (status: WorkStatus, hoursPrefix: string): string =>
  /^\d{2}:\d{2}/.test(status.message) ? `${hoursPrefix} ${status.message}` : status.message;

/** Sumber ikon media sosial: gambar unggahan admin, lalu ikon bawaan sesuai tipe. */
export const getSosmedIconSrc = (item: {
  icon?: string | null;
  image?: { link?: string | null } | null;
}): string | null => {
  if (item.image?.link) return item.image.link;
  const preset = item.icon ? sosmedMap[item.icon as keyof typeof sosmedMap] : undefined;
  return preset?.src ?? null;
};

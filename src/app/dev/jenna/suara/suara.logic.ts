export type VoiceSwitchState = {
  voiceEnabled: boolean;
  /** Provider suara lengkap dan kunci enkripsi server valid. */
  voiceProviderReady: boolean;
  voiceDailyMinutesGlobal: number;
  chatEnabled: boolean;
};

/** Peringatan (bukan penghalang) saat sakelar suara menyala tapi suara belum bisa dipakai. */
export function voiceSwitchWarnings(s: VoiceSwitchState): string[] {
  if (!s.voiceEnabled) return [];
  const warnings: string[] = [];
  if (!s.voiceProviderReady) warnings.push('Suara belum bisa dipakai: provider suara belum siap.');
  if (s.voiceDailyMinutesGlobal <= 0) warnings.push('Kuota menit suara harian global masih 0.');
  if (!s.chatEnabled) warnings.push('Jenna chat sedang nonaktif.');
  return warnings;
}

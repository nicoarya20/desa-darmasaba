/**
 * Mode ulang pemutar: 'off' berhenti setelah lagu terakhir urutan putar, 'all' melingkar ke awal,
 * 'one' mengulang lagu saat ini ketika selesai (Berikutnya/Sebelumnya manual tetap pindah lagu, melingkar).
 */
export type RepeatMode = 'off' | 'all' | 'one';

const CYCLE: readonly RepeatMode[] = ['off', 'all', 'one'];

/** Siklus tombol Ulang: mati → semua → satu → mati. */
export const nextRepeatMode = (mode: RepeatMode): RepeatMode => CYCLE[(CYCLE.indexOf(mode) + 1) % CYCLE.length];

/** Urutan putar melingkar di ujung? Hanya mode 'off' yang berhenti. */
export const wrapsAround = (mode: RepeatMode): boolean => mode !== 'off';

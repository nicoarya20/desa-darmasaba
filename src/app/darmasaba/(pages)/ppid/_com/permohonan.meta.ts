/** Satu langkah pada alur permohonan PPID. */
export type PermohonanStep = { title: string; desc: string };

/** Ukuran kolom isian formulir permohonan — satu sumber supaya input, dropdown, dan editor seragam. */
export const PERMOHONAN_FIELD = { size: 'md', radius: 'md' } as const;

/** Tinggi kerangka dropdown (px) = label + kolom isian ukuran md, supaya formulir tidak melompat saat opsi termuat. */
export const PERMOHONAN_SELECT_SKELETON_HEIGHT = 67;

export type StatusMuatEdit = 'memuat' | 'gagal' | 'siap';

/** `dimulai` = load untuk `idHalaman` sudah dipanggil; sebelum itu data di state bisa milik CCTV lain. */
export function statusMuatEdit({
  dimulai,
  memuat,
  idTermuat,
  idHalaman,
}: {
  dimulai: boolean;
  memuat: boolean;
  idTermuat: string;
  idHalaman: string;
}): StatusMuatEdit {
  if (!dimulai || memuat) return 'memuat';
  return idHalaman && idTermuat === idHalaman ? 'siap' : 'gagal';
}

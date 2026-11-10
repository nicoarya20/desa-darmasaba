/**
 * Rapikan input `juara` (capaian/peringkat) sebelum disimpan: di-trim, string kosong / null → null
 * (kosongkan), undefined → undefined (field tidak dikirim = tidak diubah saat update).
 */
export function normalizeJuara(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

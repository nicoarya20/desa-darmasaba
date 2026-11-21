import { useEffect, useState } from 'react';

/**
 * Pilihan gambar opsional di form admin: gambar baru (dipratinjau lewat object URL), atau gambar tersimpan yang
 * dilepas. Pengunggahan ke server dilakukan pemanggil (uploadImageFile) saat Simpan.
 */
export function useGambarPilihan(savedUrl: string | null = null) {
  const [baru, setBaru] = useState<{ file: File; url: string } | null>(null);
  const [dilepas, setDilepas] = useState(false);

  // Lepas object URL lama saat pilihan berganti atau form ditutup.
  useEffect(() => {
    if (!baru) return;
    return () => URL.revokeObjectURL(baru.url);
  }, [baru]);

  return {
    /** Berkas gambar yang baru dipilih (belum diunggah); null bila tidak ada pilihan baru. */
    baru: baru?.file ?? null,
    /** True bila gambar tersimpan dilepas dan tidak diganti. */
    dilepas,
    /** Alamat pratinjau: pilihan baru, atau gambar tersimpan selama belum dilepas. */
    previewUrl: baru?.url ?? (dilepas ? null : savedUrl),
    pick: (file: File) => {
      setBaru({ file, url: URL.createObjectURL(file) });
      setDilepas(false);
    },
    remove: () => {
      setBaru(null);
      setDilepas(true);
    },
    reset: () => {
      setBaru(null);
      setDilepas(false);
    },
  };
}

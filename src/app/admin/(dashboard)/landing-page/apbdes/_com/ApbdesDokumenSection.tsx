'use client';
import { Box, Text } from '@mantine/core';
import { DokumenFolderEditor } from '../../desa-anti-korupsi/_com/DokumenFolderEditor';
import type { IsiDraft } from '../../desa-anti-korupsi/_lib/folder-draft';

type Props = { value: IsiDraft; onChange: (next: IsiDraft) => void };

/**
 * Pengelola dokumen APBDes di form create/edit: memakai editor folder Desa Anti Korupsi (folder satu
 * tingkat, unggah banyak berkas, judul, pindah folder, urutan, hapus). Tanpa `programId` sehingga aksi
 * "Salin ke program lain" (khusus DAK) tidak tampil. Perubahan tetap draft sampai Simpan.
 */
export function ApbdesDokumenSection({ value, onChange }: Props) {
  return (
    <Box>
      <Text fw="bold" fz="sm" mb={2}>
        Dokumen APBDes (Opsional)
      </Text>
      <Text fz="xs" c="dimmed" mb="sm">
        Kelompokkan dokumen ke folder (mis. &quot;Semester I&quot;, &quot;Perdes&quot;). Dokumen tanpa folder tampil di &quot;Umum&quot;.
      </Text>
      <DokumenFolderEditor value={value} onChange={onChange} />
    </Box>
  );
}

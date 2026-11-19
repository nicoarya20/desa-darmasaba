'use client'
import { UnifiedTitle } from '@/components/admin/UnifiedTypography';
import { Box } from '@mantine/core';
import { IndeksDesaList } from './_com/IndeksDesaList';
import { INDEKS_DESA_ADMIN_TEXT as T } from './_com/indeks-desa.text';

/** Admin: daftar Indeks Desa Membangun (IDM) per tahun dengan tambah, edit, hapus. */
export default function IndeksDesaAdmin() {
  return (
    <Box>
      <UnifiedTitle order={3}>{T.title}</UnifiedTitle>
      <IndeksDesaList />
    </Box>
  );
}

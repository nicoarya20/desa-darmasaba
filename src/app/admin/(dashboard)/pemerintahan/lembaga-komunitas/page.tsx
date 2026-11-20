'use client'
import { Box } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import HeaderSearch from '../../_com/header';
import { LembagaKomunitasList } from './_com/LembagaKomunitasList';
import { LEMBAGA_KOMUNITAS_ADMIN_TEXT as T } from './_com/lembaga-komunitas.text';

/** Admin: daftar Lembaga & Komunitas desa (PPL, STT, PKK, dll) dengan filter jenis, cari, tambah, edit, hapus. */
export default function LembagaKomunitasAdmin() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title={T.title}
        placeholder={T.searchPlaceholder}
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <LembagaKomunitasList search={search} />
    </Box>
  );
}

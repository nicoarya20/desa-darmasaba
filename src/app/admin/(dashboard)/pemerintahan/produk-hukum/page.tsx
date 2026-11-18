'use client'
import { Box } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import HeaderSearch from '../../_com/header';
import { ProdukHukumList } from './_com/ProdukHukumList';
import { PRODUK_HUKUM_ADMIN_TEXT as T } from './_com/produk-hukum.text';

/** Admin: daftar Produk Hukum (Perdes, Peraturan Perbekel, SK Perbekel, dll) dengan filter kategori, cari, edit, hapus. */
export default function ProdukHukumAdmin() {
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
      <ProdukHukumList search={search} />
    </Box>
  );
}

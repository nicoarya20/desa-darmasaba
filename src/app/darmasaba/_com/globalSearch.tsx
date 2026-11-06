'use client';

import searchState, { debouncedFetch } from '@/app/api/[[...slugs]]/_lib/search/searchState';
import { Box, Center, Loader, Popover, Text, TextInput } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import SearchResultRow from './SearchResultRow';
import searchMenu from './searchMenu';
import getDetailUrl, { normalizeSearchType } from './searchUrl';

type SearchResultItem = (typeof searchState.results)[number];

/** Judul kecil pemisah bagian di dropdown pencarian. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text size="xs" fw={600} c="dimmed" tt="uppercase" px="sm" pt="sm" pb={4}>
      {children}
    </Text>
  );
}

export default function GlobalSearch() {
  const snap = useSnapshot(searchState);
  const [opened, setOpened] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  // Hasil menu dihitung lokal dari config navbar: langsung muncul tanpa menunggu debounce/API.
  const menuResults = searchMenu(snap.query);
  const apiResults = [...snap.results];

  // Buka popover saat ada query
  useEffect(() => {
    setOpened(!!snap.query);
  }, [snap.query]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (nearBottom && !snap.loading) searchState.next();
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [snap.loading]);

  /** Cegah klik ganda; true bila navigasi boleh dimulai. */
  const startNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isNavigating) return false;
    setIsNavigating(true);
    return true;
  };

  /** Tutup popover, kosongkan state pencarian, lalu pindah ke URL (internal maupun link eksternal). */
  const navigateTo = async (url: string) => {
    setOpened(false);
    searchState.query = '';
    searchState.results = [];
    searchState.loading = false;

    // kasih delay biar UI nutup dulu
    await new Promise((r) => setTimeout(r, 100));

    window.location.href = url;
  };

  const handleSelect = async (e: React.MouseEvent, item: SearchResultItem) => {
    if (!startNavigation(e)) return;
  
    try {
      // 🔥 pastikan objek udah “dikeluarkan” dari Proxy valtio
      const rawItem = JSON.parse(JSON.stringify(item));
  
      // 🔥 pastikan type-nya string murni (huruf tidak diubah: kunci peta URL camelCase)
      const type = normalizeSearchType(rawItem.type);
  
      // 🔥 panggil getDetailUrl pakai type yang fix
      let url = getDetailUrl({ ...rawItem, type });
  
      // kalau hasil undefined atau default, fallback ke link eksternal
      if (!url || url === '/darmasaba') {
        if (rawItem.link && rawItem.link.startsWith('http')) {
          url = rawItem.link;
        }
      }
  
      if (!url) {
        console.warn('URL tidak ditemukan untuk item:', rawItem);
        setIsNavigating(false);
        return;
      }
  
      await navigateTo(url);
    } catch (err) {
      console.error('Error saat navigasi:', err);
      setIsNavigating(false);
    }
  };

  const handleSelectMenu = (e: React.MouseEvent, href: string) => {
    if (!startNavigation(e)) return;
    void navigateTo(href);
  };
  

  const clearSearch = () => {
    searchState.query = '';
    searchState.results = [];
    searchState.page = 1;
    searchState.nextPage = null;
    setOpened(false);
    setIsNavigating(false);
  };

  return (
    <Box pos="relative">
      <Popover
        opened={opened && !!snap.query}
        onChange={(isOpen) => {
          if (!isOpen) clearSearch();
          setOpened(isOpen);
        }}
        width="target"
        position="bottom"
        shadow="md"
        withinPortal
        radius="md"
        zIndex={2000}
        closeOnClickOutside={true}
        closeOnEscape={true}
        styles={{
          dropdown: {
            zIndex: 2000,
            borderRadius: 12,
            overflow: 'hidden',
          },
        }}
      >
        <Popover.Target>
          <TextInput
            placeholder="Cari apapun..."
            value={snap.query}
            onChange={(e) => {
              searchState.query = e.currentTarget.value;
              debouncedFetch();
            }}
            radius="xl"
            size="md"
            rightSection={
              snap.query ? (
                <IconX
                  size={16}
                  style={{ cursor: 'pointer' }}
                  onClick={clearSearch}
                />
              ) : undefined
            }
          />
        </Popover.Target>

        <Popover.Dropdown
          p={0}
          style={{
            maxHeight: 350,
            overflowY: 'auto',
            backgroundColor: '#fff',
            border: '1px solid #eee',
          }}
        >
          {menuResults.length > 0 && (
            <>
              <SectionLabel>Halaman</SectionLabel>
              {menuResults.map((item) => (
                <SearchResultRow
                  key={item.id}
                  title={item.label}
                  subtitle={`${item.parent} › ${item.label}`}
                  isNavigating={isNavigating}
                  onClick={(e) => handleSelectMenu(e, item.href)}
                />
              ))}
            </>
          )}

          {apiResults.length > 0 && (
            <>
              {menuResults.length > 0 && <SectionLabel>Konten</SectionLabel>}
              {apiResults.map((item, i) => (
                <SearchResultRow
                  key={i}
                  title={item.name ?? item.nama ?? item.namaPasar ?? item.judul ?? '(Tanpa nama)'}
                  subtitle={`dari modul: ${item.type || '-'}`}
                  isNavigating={isNavigating}
                  onClick={(e) => handleSelect(e, item)}
                />
              ))}
            </>
          )}

          {apiResults.length === 0 && snap.loading && (
            <Center py="md">
              <Loader size="sm" />
            </Center>
          )}

          {apiResults.length === 0 && !snap.loading && menuResults.length === 0 && (
            <Center py="md">
              <Text fz="sm">Tidak ada hasil</Text>
            </Center>
          )}
        </Popover.Dropdown>
      </Popover>
    </Box>
  );
}
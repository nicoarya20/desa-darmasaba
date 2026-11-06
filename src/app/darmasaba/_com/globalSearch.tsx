'use client';

import searchState, { debouncedFetch } from '@/app/api/[[...slugs]]/_lib/search/searchState';
import { Box, Center, Loader, Popover, Text, TextInput } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import getDetailUrl, { normalizeSearchType } from './searchUrl';

type SearchResultItem = (typeof searchState.results)[number];

export default function GlobalSearch() {
  const snap = useSnapshot(searchState);
  const [opened, setOpened] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

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

  const handleSelect = async (e: React.MouseEvent, item: SearchResultItem) => {
    e.preventDefault();
    e.stopPropagation();
  
    if (isNavigating) return;
    setIsNavigating(true);
  
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
  
      // tutup popover dulu
      setOpened(false);
      searchState.query = '';
      searchState.results = [];
      searchState.loading = false;
  
      // kasih delay biar UI nutup dulu
      await new Promise((r) => setTimeout(r, 100));
  
      // navigasi (URL internal maupun link eksternal)
      window.location.href = url;
  
    } catch (err) {
      console.error('Error saat navigasi:', err);
      setIsNavigating(false);
    }
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
          {[...snap.results].length > 0 ? (
            [...snap.results].map((item, i) => (
              <Box
                key={i}
                p="sm"
                className="search-result-item" // Add class untuk prevent close
                style={{
                  borderBottom: '1px solid #f1f1f1',
                  cursor: isNavigating ? 'wait' : 'pointer',
                  background: 'white',
                  transition: 'background 0.2s',
                  opacity: isNavigating ? 0.6 : 1,
                }}
                onMouseEnter={(e) => !isNavigating && (e.currentTarget.style.background = '#f9f9f9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                onClick={(e) => handleSelect(e, item)}
              >
                <Text size="sm" fw={500} lineClamp={1}>
                  {item.name ?? item.nama ?? item.namaPasar ?? item.judul ?? '(Tanpa nama)'}
                </Text>
                <Text size="xs" c="dimmed" lineClamp={1}>
                  dari modul: {item.type || '-'}
                </Text>
              </Box>
            ))
          ) : (
            <Center py="md">
              {snap.loading ? <Loader size="sm" /> : <Text fz="sm">Tidak ada hasil</Text>}
            </Center>
          )}
        </Popover.Dropdown>
      </Popover>
    </Box>
  );
}
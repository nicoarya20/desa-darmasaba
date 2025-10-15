'use client';
import searchState, { debouncedFetch } from '@/app/api/[[...slugs]]/_lib/search/searchState';
import { Box, Center, Loader, Stack, Text, TextInput } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import getDetailUrl from './searchUrl';



export default function GlobalSearch() {
  const snap = useSnapshot(searchState);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (bottom && !snap.loading) searchState.next();
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [snap.loading]);

  return (
    <Stack maw={800} mx="auto">
      {/* 🔍 Search input */}
      <TextInput
        placeholder="Cari apapun..."
        value={snap.query}
        onChange={(e) => (
          searchState.query = e.currentTarget.value,
          debouncedFetch()
        )}
        radius="xl"
        rightSection={
          snap.query ? (
            <IconX
              size={16}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                searchState.query = '';
                searchState.results = [];
              }}
            />
          ) : undefined
        }
      />

      {/* 📄 Hasil pencarian */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {snap.results.map((item, i) => (
        <Box
          key={i}
          p="sm"
          style={{
            borderBottom: '1px solid #eee',
            cursor: 'pointer',
            transition: 'background 0.2s',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          onClick={() => {
            const url = getDetailUrl(item);
            window.location.href = url;
          }}
        >
          <Text size="sm" fw={500}>
            {item.judul || item.namaPasar || item.nama || item.name}
          </Text>
          <Text size="xs" c="dimmed">
            dari modul: {item.type}
          </Text>
        </Box>
      ))}
      </div>

      {/* ⏳ Loader di bawah hasil */}
      {snap.loading && (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      )}
    </Stack>
  );
}


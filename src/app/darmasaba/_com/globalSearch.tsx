'use client';
import searchState, { debouncedFetch } from '@/app/api/[[...slugs]]/_lib/search/searchState';
import { Box, Center, Loader, Modal, Text, TextInput } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import getDetailUrl from './searchUrl';

export default function GlobalSearch() {
  const snap = useSnapshot(searchState);
  const [isOpen, setIsOpen] = useState(false);

  // Toggle modal when there's a query
  useEffect(() => {
    setIsOpen(!!snap.query);
  }, [snap.query]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (bottom && !snap.loading) searchState.next();
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [snap.loading]);

  return (
    <Box style={{ position: 'relative', width: '100%' }}>
      <TextInput
        placeholder="Cari apapun..."
        value={snap.query}
        onChange={(e) => {
          searchState.query = e.currentTarget.value;
          debouncedFetch();
        }}
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

      {/* Modal for search results */}
      <Modal
        opened={isOpen && !!snap.query}
        onClose={() => {
          searchState.query = '';
          searchState.results = [];
        }}
        withCloseButton={false}
        size="lg"
        padding={0}
        radius="md"
        style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000 }}
        styles={{
          content: {  // Changed from 'modal' to 'content'
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '0.5rem',
            maxHeight: '400px',
            overflow: 'hidden',
          },
        }}
      >
        <Box style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
                maxWidth: '100%',
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
          {snap.loading && (
            <Center py="md">
              <Loader size="sm" />
            </Center>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
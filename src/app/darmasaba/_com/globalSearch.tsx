/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import searchState, { debouncedFetch } from '@/app/api/[[...slugs]]/_lib/search/searchState';
import { Box, Center, Loader, Popover, Text, TextInput } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import getDetailUrl from './searchUrl';

export default function GlobalSearch() {
  const snap = useSnapshot(searchState);
  const [opened, setOpened] = useState(false);

  // buka popover saat ada query
  useEffect(() => {
    setOpened(!!snap.query);
  }, [snap.query]);

  // infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (bottom && !snap.loading) searchState.next();
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [snap.loading]);

  const handleSelect = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    e.preventDefault();

    const url = getDetailUrl(item);
    if (!url) return;

    // Immediately close the search dropdown
    setOpened(false);
    searchState.results = [];  // Clear results immediately
    searchState.loading = false;

    // Use window.location for navigation to ensure full page reload
    window.location.href = url;
  };

  return (
    <Box pos="relative">
      <Popover
        opened={opened && !!snap.query}
        onChange={(isOpen) => {
          if (!isOpen) {
            // Clear search state when popover is closed
            searchState.query = '';
            searchState.results = [];
            searchState.page = 1;
            searchState.nextPage = null;
          }
          setOpened(isOpen);
        }}
        width="target"
        position="bottom"
        shadow="md"
        withinPortal
        radius="md"
        zIndex={1000}  // Add this line to ensure it appears above other elements
        styles={{
          dropdown: {
            zIndex: 1000,  // Add this to ensure the dropdown appears above other elements
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
                  onClick={() => {
                    searchState.query = '';
                    searchState.results = [];
                    searchState.page = 1;
                    searchState.nextPage = null;
                    setOpened(false);
                  }}
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
            borderRadius: 12,
            zIndex: 1000, // Add this line to ensure dropdown stays above other elements
            position: 'relative', // Add this to contain child elements
          }}
        >
          {snap.results.length > 0 ? (
            snap.results.map((item, i) => (
              <Box
                key={i}
                p="sm"
                className="search-result-item"  // Add this class
                style={{
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  position: 'relative', // Add this
                  zIndex: 1, // Add this to ensure proper stacking context
                  backgroundColor: 'white', // Ensure background is set
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f7f7f7')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                onClick={(e) => handleSelect(e, item)}  // Pass the event here
              >
                <Text size="sm" fw={500}>
                  {item.judul || item.namaPasar || item.nama || item.name}
                </Text>
                <Text size="xs" c="dimmed">
                  dari modul: {item.type}
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

// src/app/(public)/(pages)/pemerintahan/galery/SearchBar.tsx

'use client';

import { SearchField } from '@/app/(public)/_com/search-field/SearchField';
import { Box, Group } from '@mantine/core';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { GALERY_TEXT } from './galery.text';

export type SearchBarProps = {
  placeholder?: string;
};

/** Kolom cari galeri: tulis `?search=` setelah jeda ketik lalu kabari tab Foto/Video lewat event `searchUpdate`. */
export function SearchBar({ placeholder = GALERY_TEXT.searchPlaceholder }: SearchBarProps) {
  const searchParams = useSearchParams();

  // Get initial search value from URL
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');

  const pathname = usePathname();
  const typingTimeoutRef = useRef<number | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      // Always reset to first page when search changes
      params.set('page', '1');
      
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }

      // Update URL without adding to history
      const newUrl = `${pathname}?${params.toString()}`;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
      
      // Dispatch a custom event that content components can listen to
      window.dispatchEvent(new CustomEvent('searchUpdate', { detail: { search: value } }));
    }, 500);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Group justify='center'>
      <Box w={{ base: '100%', md: '50%' }}>
        <SearchField
          fullWidth
          label={GALERY_TEXT.searchLabel}
          placeholder={placeholder}
          value={searchValue}
          onChange={handleSearchChange}
        />
      </Box>
    </Group>
  );
}
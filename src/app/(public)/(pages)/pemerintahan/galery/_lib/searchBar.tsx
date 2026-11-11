// src/app/(public)/(pages)/pemerintahan/galery/SearchBar.tsx

'use client';

import { Group, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export type SearchBarProps = {
  placeholder?: string;
  searchIcon?: React.ReactNode;
};

export function SearchBar({
  placeholder = "pencarian",
  searchIcon = <IconSearch size={20} />,
}: SearchBarProps) {
  const searchParams = useSearchParams();

  // Get initial search value from URL
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');

  const pathname = usePathname();
  const typingTimeoutRef = useRef<number | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
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
      <TextInput
      radius="lg"
      placeholder={placeholder}
      leftSection={searchIcon}
      w={{ base: '100%', md: '50%' }}
      value={searchValue}
      onChange={handleSearchChange}
    />
    </Group>
  );
}
// src/app/darmasaba/(pages)/desa/galery/SearchBar.tsx

'use client';

import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

export type SearchBarProps = {
  placeholder?: string;
  searchIcon?: React.ReactNode;
};

export function SearchBar({
  placeholder = "pencarian",
  searchIcon = <IconSearch size={20} />,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial search value from URL
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');

  // Handle search input change with debounce
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);

    // Update URL with debounce
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }

    // Only update URL if the search value has actually changed
    if (params.toString() !== searchParams.toString()) {
      router.push(`?${params.toString()}`);
    }
  };

  return (
    <TextInput
      radius="lg"
      placeholder={placeholder}
      leftSection={searchIcon}
      w="100%"
      value={searchValue}
      onChange={handleSearchChange}
    />
  );
}
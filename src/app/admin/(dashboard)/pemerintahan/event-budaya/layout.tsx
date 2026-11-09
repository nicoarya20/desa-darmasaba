'use client';
import { Stack } from '@mantine/core';
import React from 'react';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Stack gap="lg">
      {children}
    </Stack>
  );
}

export default Layout;

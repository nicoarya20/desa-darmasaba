'use client';
import { Stack, Title } from '@mantine/core';
import React from 'react';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Stack gap="lg">
      <Title order={3} fw={700} style={{ color: '#1A1B1E' }}>
        Kalender Event Budaya
      </Title>
      {children}
    </Stack>
  );
}

export default Layout;

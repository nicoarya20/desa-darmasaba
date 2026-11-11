'use client'
import colors from '@/con/colors';
import { ScrollArea, Stack, Tabs, TabsList, TabsTab, Title } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

export type StrukturTab = { label: string; href: string; icon: ReactNode };

type Props = {
  title: string;
  tabs: readonly StrukturTab[];
  children: ReactNode;
};

/**
 * Kerangka tab admin struktur organisasi (Pegawai · Jabatan · Bagan). Tab aktif = href yang sama dengan URL;
 * halaman di luar tab (tambah/detail/edit) tampil tanpa baris tab.
 */
export function StrukturTabs({ title, tabs, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const active = tabs.find((tab) => tab.href === pathname);
  if (!active) return <>{children}</>;

  return (
    <Stack gap="lg">
      <Title order={2} fw={700}>{title}</Title>
      <Tabs
        color={colors['blue-button']}
        variant="pills"
        radius="lg"
        value={active.href}
        onChange={(href) => href && router.push(href)}
      >
        <ScrollArea type="hover" offsetScrollbars>
          <TabsList
            p="sm"
            style={{
              background: 'linear-gradient(135deg, #e7ebf7, #f9faff)',
              borderRadius: '1rem',
              display: 'flex',
              flexWrap: 'nowrap',
              gap: '0.5rem',
              width: 'max-content',
            }}
          >
            {tabs.map((tab) => (
              <TabsTab key={tab.href} value={tab.href} leftSection={tab.icon} fw={600} style={{ flexShrink: 0 }}>
                {tab.label}
              </TabsTab>
            ))}
          </TabsList>
        </ScrollArea>
      </Tabs>
      <Stack
        p={{ base: 'sm', md: 'lg' }}
        style={{
          background: 'linear-gradient(180deg, #ffffff, #f5f6fa)',
          borderRadius: '1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        }}
      >
        {children}
      </Stack>
    </Stack>
  );
}

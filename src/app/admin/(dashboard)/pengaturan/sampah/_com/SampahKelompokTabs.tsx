'use client';
import { Fragment } from 'react';
import { Box, Divider, Text, UnstyledButton } from '@mantine/core';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import type { SampahTab } from '../_lib/sampah-view.logic';

type Props = {
  tabs: readonly SampahTab[];
  aktif: string;
  onChange: (kelompokId: string) => void;
};

/** Bar tab pill tersegmentasi "Nama (n)" dengan pemisah vertikal; bisa di-scroll horizontal di layar sempit. */
export function SampahKelompokTabs({ tabs, aktif, onChange }: Props) {
  const { isDark } = useDarkMode();
  const { colors } = themeTokens(isDark);

  return (
    <Box style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <Box
        role="tablist"
        aria-label="Kelompok Sampah"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: 4,
          borderRadius: 999,
          border: `1px solid ${colors.border.default}`,
          background: colors.bg.surface,
          whiteSpace: 'nowrap',
        }}
      >
        {tabs.map((tab, i) => {
          const selected = tab.id === aktif;
          return (
            <Fragment key={tab.id}>
              {i > 0 && <Divider orientation="vertical" mx={2} my={6} color={colors.border.default} />}
              <UnstyledButton
                role="tab"
                aria-selected={selected}
                data-kelompok={tab.id}
                onClick={() => onChange(tab.id)}
                px="md"
                py={6}
                style={{
                  borderRadius: 999,
                  background: selected ? colors.bg.card : 'transparent',
                  boxShadow: selected ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                  transition: 'background 0.2s ease',
                }}
              >
                <Text fz="sm" fw={selected ? 600 : 400} c={selected ? colors.text.primary : colors.text.secondary}>
                  {tab.label}
                </Text>
              </UnstyledButton>
            </Fragment>
          );
        })}
      </Box>
    </Box>
  );
}

'use client';
import { Box, Group, Text, Title } from '@mantine/core';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';

type Props = { title: string; subtitle?: string; action?: React.ReactNode };

/** Header halaman Developer; aksi turun ke baris baru di layar sempit. */
export function DeveloperPageHeader({ title, subtitle, action }: Props) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  return (
    <Box mb="lg" pb="md" style={{ borderBottom: `1px solid ${tokens.colors.border.soft}` }}>
      <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
        <Box style={{ minWidth: 0, flex: '1 1 260px' }}>
          <Title order={3} c={tokens.colors.text.primary}>
            {title}
          </Title>
          {subtitle && (
            <Text size="sm" c={tokens.colors.text.secondary} mt={4}>
              {subtitle}
            </Text>
          )}
        </Box>
        {action}
      </Group>
    </Box>
  );
}

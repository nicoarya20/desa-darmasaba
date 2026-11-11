'use client'
import colors from '@/con/colors';
import { Box, Group, Stack, Text, Title } from '@mantine/core';
import { ReactNode } from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

/** Header seksi konsisten: accent bar + ikon + judul + subtitle opsional. */
export default function SectionTitle({ title, subtitle, icon }: SectionTitleProps) {
  return (
    <Group gap="sm" align="center" wrap="nowrap">
      <Box
        w={5}
        h={36}
        style={{ borderRadius: 8, background: colors['blue-button'], flexShrink: 0 }}
      />
      {icon && (
        <Box c={colors['blue-button']} style={{ display: 'flex' }}>
          {icon}
        </Box>
      )}
      <Stack gap={0}>
        <Title order={3} fw={700} c={colors['blue-button-7']}>
          {title}
        </Title>
        {subtitle && (
          <Text fz="sm" c="dimmed">
            {subtitle}
          </Text>
        )}
      </Stack>
    </Group>
  );
}

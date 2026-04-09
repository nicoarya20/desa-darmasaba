// components/EdukasiCard.tsx
'use client';

import { Box, Paper, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

interface EdukasiCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color?: string;
}

export function EdukasiCard({ icon, title, description, color = '#1e88e5' }: EdukasiCardProps) {
  return (
    <Paper
      p={{ base: 'md', md: 'lg' }}
      radius="md"
      shadow="sm"
      withBorder
      style={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <Stack h="100%" justify="space-between" gap="md">
        <Box>
          <Stack align="center" gap="xs" mb="md">
            <Box style={{ color }}>{icon}</Box>
            <Title
              order={3}
              fz={{ base: 'sm', md: 'md' }}
              c={color}
              ta="center"
              lineClamp={2}
              style={{
                wordBreak: 'break-word',
                minHeight: '3.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1.2
              }}
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </Stack>
          <Box pl={20}>
            <Text
              fz={{ base: 'sm', md: 'md' }}
              lh={1.5}
              c="gray.7"
              ta="justify"
              style={{
                wordBreak: 'break-word'
              }}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}
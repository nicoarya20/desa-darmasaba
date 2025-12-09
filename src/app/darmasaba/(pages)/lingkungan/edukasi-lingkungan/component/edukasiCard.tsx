// Create a new component: components/EdukasiCard.tsx
'use client';

import { Box, Paper, Stack, Text } from '@mantine/core';
import { ReactNode } from 'react';

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
              <Text 
                fz={{ base: 'h5', md: 'h4' }} 
                fw={700} 
                c={color}
                ta="center"
                lineClamp={2}
                style={{ 
                  wordBreak: 'break-word',
                  minHeight: '3.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                dangerouslySetInnerHTML={{ __html: title }}
              />
          </Stack>
          <Text
            size="sm"
            pl={20}
            style={{
              wordBreak: 'break-word',
              lineHeight: 1.6,
              color: 'var(--mantine-color-gray-7)'
            }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </Box>
      </Stack>
    </Paper>
  );
}
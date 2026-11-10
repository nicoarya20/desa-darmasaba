'use client';
import { Box, Text } from '@mantine/core';

/** Viewer PDF (iframe) yang sama dengan pratinjau dokumen admin sebelumnya. */
export function DokumenPreviewFrame({ src, title }: { src: string; title: string }) {
  return (
    <Box>
      <Text fw="bold" fz="sm" mb={6}>
        Pratinjau: {title}
      </Text>
      <Box
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          overflow: 'hidden',
          height: '500px',
          width: '100%',
        }}
      >
        <iframe src={src} title={title} width="100%" height="100%" style={{ border: 'none' }} />
      </Box>
    </Box>
  );
}

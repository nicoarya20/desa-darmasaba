// components/YoutubeEmbed.tsx
"use client";

import { Box, Text } from "@mantine/core";

type YoutubeEmbedProps = {
  url?: string;
  showRawUrl?: boolean; // opsional, buat nampilin URL mentahnya
};

export default function YoutubeEmbed({ url, showRawUrl = false }: YoutubeEmbedProps) {
  if (!url || !url.includes("embed")) {
    return <Text c="red">Link embed Youtube tidak valid</Text>;
  }

  return (
    <Box>
      <Box
        component="iframe"
        src={url}
        width="100%"
        height={300}
        allowFullScreen
        style={{ borderRadius: 8 }}
      />
      {showRawUrl && (
        <Text fz="sm" c="dimmed" mt={5}>
          {url}
        </Text>
      )}
    </Box>
  );
}

'use client'
import { Box, Stack, Text } from '@mantine/core';
import dynamic from 'next/dynamic';

const PPIDTextEditor = dynamic(() => import('../../_com/PPIDTextEditor').then(mod => mod.PPIDTextEditor), {
  ssr: false,
});

function CreateDasarHukum({
  valueJudul,
  valueContent,
  onJudulChange,
  onContentChange,
  error
} : {
  valueJudul: string;
  valueContent: string;
  onJudulChange: (val: string) => void;
  onContentChange: (val: string) => void;
  error?: string;
}) {
  
  return (
    <Box>
     <Stack gap={"xs"}>
     <Text fw={"bold"}>Judul</Text>
      <PPIDTextEditor
        showSubmit={false}
        onChange={onJudulChange}
        initialContent={valueJudul}
      />
      <Text fw={"bold"}>Content</Text>
      <PPIDTextEditor
        showSubmit={false}
        onChange={onContentChange}
        initialContent={valueContent}
      />
      {error && <Text c="red" size="sm">{error}</Text>}
     </Stack>
    </Box>
  );
}

export default CreateDasarHukum;

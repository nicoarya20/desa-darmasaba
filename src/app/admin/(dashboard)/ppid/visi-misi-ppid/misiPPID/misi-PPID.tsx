'use client'
import { Box, Text } from '@mantine/core';
import { PPIDTextEditor } from '../../_com/PPIDTextEditor';

function MisiPPID({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  return (
    <Box>
      <Text fw={'bold'}>Misi PPID</Text>
      <PPIDTextEditor
        showSubmit={false}
        initialContent={value}
        onChange={onChange}
      />
      {error && <Text c="red" size="sm">{error}</Text>}
    </Box>
  );
}

export default MisiPPID;

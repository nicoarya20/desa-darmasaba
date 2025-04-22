'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Stack, Text, Textarea, Title } from '@mantine/core';

function Page() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <Title order={2}>Layanan</Title>
        <Textarea
          label={<Text>Deskripsi</Text>}
          placeholder='tambah deskripsi'
        />
        <Group>
          <Button
            bg={colors['blue-button']} fz={'md'}>Submit</Button>
        </Group>
      </Stack>
    </Box>
  );
}

export default Page;

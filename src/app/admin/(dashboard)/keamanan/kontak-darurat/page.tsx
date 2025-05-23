import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Title } from '@mantine/core';
import React from 'react';
import CreateKontakDarurat from './create/createKontak';
import ListDataKontakDarurat from './listData/page';

function Page() {
  return (
    <Stack gap={"xs"}>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Box>
          <Paper bg={colors['white-1']} p={'md'} radius={10}>
            <Title order={3}>Kontak Darurat</Title>
          <CreateKontakDarurat/>
          <Group>
            <Button
              mt={10}
              bg={colors['blue-button']}
            >
              Submit
            </Button>
          </Group>
          </Paper>
        </Box>
        <ListDataKontakDarurat/>
      </SimpleGrid>
    </Stack>
  );
}

export default Page;

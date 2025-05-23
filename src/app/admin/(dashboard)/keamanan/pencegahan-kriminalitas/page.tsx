import colors from '@/con/colors';
import { Stack, SimpleGrid, Box, Paper, Title, Group, Button } from '@mantine/core';
import React from 'react';
import CreatePencegahan from './create/createPencegahan';
import ListDataPencegahan from './listData/page';


function Page() {
  return (
    <Stack gap={"xs"}>
    <SimpleGrid cols={{ base: 1, md: 2 }}>
      <Box>
        <Paper bg={colors['white-1']} p={'md'} radius={10}>
          <Title order={3}>Kontak Darurat</Title>
        <CreatePencegahan/>
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
      <ListDataPencegahan/>
    </SimpleGrid>
  </Stack>
  );
}

export default Page;

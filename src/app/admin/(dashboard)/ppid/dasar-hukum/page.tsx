'use client'
import colors from '@/con/colors';
import { Box, Paper, SimpleGrid, Stack, Title } from '@mantine/core';
import CreateDasarHukum from './create/page';
import ListDataDasarHukum from './listData/page';

function Page() {

  return (
    <Stack gap={"xs"}>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Box>
          <Paper bg={colors['white-1']} p={'md'} radius={10}>
          <Title order={3}>Dasar Hukum PPID</Title>
          <CreateDasarHukum/>
          </Paper>
        </Box>
        <ListDataDasarHukum/>
      </SimpleGrid>
    </Stack>
  )
}

export default Page;

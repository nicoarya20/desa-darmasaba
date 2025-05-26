import colors from '@/con/colors';
import { Box, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import React from 'react';
import CreatePenangananDarurat from './ui/tambah_penanganan_darurat/page';
import ListPenangananDarurat from './ui/list_penanganan_darurat/page';

function Page() {
  return (
    <Box>
     <Stack gap={'xs'}>
      <Title order={3}>Penanganan Darurat</Title>
      <Tabs defaultValue="create" color={colors['blue-button']} variant='pills'>
        <TabsList mb={10} bg={colors['BG-trans']} p={'xs'}>
          <TabsTab value="create" >
            Tambah Penanganan Darurat
          </TabsTab>
          <TabsTab value="list" >
            List Penanganan Darurat
          </TabsTab>
        </TabsList>

        <TabsPanel value="create">
          <CreatePenangananDarurat/>
        </TabsPanel>

        <TabsPanel value="list">
          <ListPenangananDarurat/>
        </TabsPanel>
      </Tabs>
      </Stack>
    </Box>
  );
}

export default Page;

import colors from '@/con/colors';
import { Box, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import React from 'react';
import CreateKontakDarurat from './ui/tambah_kontak_darurat/page';
import ListKontakDarurat from './ui/list_kontak_darurat/page';

function Page() {
  return (
    <Box>
     <Stack gap={'xs'}>
      <Title order={3}>Kontak Darurat</Title>
      <Tabs defaultValue="create" color={colors['blue-button']} variant='pills'>
        <TabsList mb={10} bg={colors['BG-trans']} p={'xs'}>
          <TabsTab value="create" >
            Tambah Kontak Darurat
          </TabsTab>
          <TabsTab value="list" >
            List Kontak Darurat
          </TabsTab>
        </TabsList>

        <TabsPanel value="create">
          <CreateKontakDarurat />
        </TabsPanel>

        <TabsPanel value="list">
          <ListKontakDarurat/>
        </TabsPanel>
      </Tabs>
      </Stack>
    </Box>
  );
}

export default Page;

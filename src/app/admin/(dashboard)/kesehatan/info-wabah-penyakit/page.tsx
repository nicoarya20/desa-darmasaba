import colors from '@/con/colors';
import { Box, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import React from 'react';
import CreateInfoWabahPenyakit from './ui/tambah_wabah_penyakit/page';
import ListInfoWabahPenyakit from './ui/list_wabah_penyakit/page';


function Page() {
  return (
    <Box>
     <Stack gap={'xs'}>
      <Title order={3}>Info Wabah/Penyakit</Title>
      <Tabs defaultValue="create" color={colors['blue-button']} variant='pills'>
        <TabsList mb={10} bg={colors['BG-trans']} p={'xs'}>
          <TabsTab value="create" >
            Tambah Info Wabah/Penyakit
          </TabsTab>
          <TabsTab value="list" >
            List Info Wabah/Penyakit
          </TabsTab>
        </TabsList>

        <TabsPanel value="create">
          <CreateInfoWabahPenyakit/>
        </TabsPanel>

        <TabsPanel value="list">
          <ListInfoWabahPenyakit/>
        </TabsPanel>
      </Tabs>
      </Stack>
    </Box>
  );
}

export default Page;

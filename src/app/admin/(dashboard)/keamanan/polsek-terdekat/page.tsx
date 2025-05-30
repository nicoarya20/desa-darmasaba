import colors from '@/con/colors';
import { Box, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import React from 'react';
import CreatePolsekTerdekat from './ui/tambah_polsek_terdekat/page';
import ListPolsekTerdekat from './ui/list_polsek_terdekat/page';


function Page() {
  return (
    <Box>
     <Stack gap={'xs'}>
      <Title order={3}>Polsek Terdekat</Title>
      <Tabs defaultValue="create" color={colors['blue-button']} variant='pills'>
        <TabsList mb={10} bg={colors['BG-trans']} p={'xs'}>
          <TabsTab value="create" >
            Tambah Polsek Terdekat
          </TabsTab>
          <TabsTab value="list" >
            List Polsek Terdekat
          </TabsTab>
        </TabsList>

        <TabsPanel value="create">
          <CreatePolsekTerdekat/>
        </TabsPanel>

        <TabsPanel value="list">
          <ListPolsekTerdekat/>
        </TabsPanel>
      </Tabs>
      </Stack>
    </Box>
  );
}

export default Page;

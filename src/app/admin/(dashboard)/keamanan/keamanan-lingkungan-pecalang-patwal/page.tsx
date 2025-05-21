import colors from '@/con/colors';
import { Box, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import React from 'react';
import CreateKeamananLingkungan from './ui/tambah_keamanan_lingkungan/page';
import ListKeamananLingkungan from './ui/list_keamanan_lingkungan/page';


function Page() {
  return (
    <Box>
     <Stack gap={'xs'}>
      <Title order={3}>Keamanan Lingkungan </Title>
      <Tabs defaultValue="create" color={colors['blue-button']} variant='pills'>
        <TabsList mb={10} bg={colors['BG-trans']} p={'xs'}>
          <TabsTab value="create" >
            Tambah Keamanan Lingkungan 
          </TabsTab>
          <TabsTab value="list" >
            List Keamanan Lingkungan 
          </TabsTab>
        </TabsList>

        <TabsPanel value="create">
          <CreateKeamananLingkungan/>
        </TabsPanel>

        <TabsPanel value="list">
          <ListKeamananLingkungan/>
        </TabsPanel>
      </Tabs>
      </Stack>
    </Box>
  );
}

export default Page;

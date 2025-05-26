import colors from '@/con/colors';
import { Box, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import React from 'react';
import Penghargaan from './ui/penghargaan/page';
import GambarPerhargaan from './ui/gambar_perhargaan/page';

function Page() {
  return (
    <Box py={10}>
      <Stack>
        <Title order={3}>Penghargaan</Title>
        <Tabs color={colors['blue-button']} variant='pills' defaultValue={"Penghargaan"}>
          <TabsList p={"xs"} bg={"#BBC8E7FF"}>
            <TabsTab value="Penghargaan">
              Penghargaan
            </TabsTab>
            <TabsTab value="Gambar Penghargaan">
              Gambar Penghargaan
            </TabsTab>
          </TabsList>

          <TabsPanel value="Penghargaan">
            <Penghargaan/>
          </TabsPanel>
          <TabsPanel value="Gambar Penghargaan">
            <GambarPerhargaan/>
          </TabsPanel>
        </Tabs>
      </Stack>
    </Box>
  );
}

export default Page;

import colors from '@/con/colors';
import { Box, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import React from 'react';
import KolaborasiInovasi from './ui/kolaborasiInovasi/page';
import MitraKolaborasi from './ui/mitraKolaborasi/page';

function Page() {
  return (
    <Box>
      <Stack>
      <Title order={3}>Kolaborasi Inovasi</Title>
        <Tabs color={colors['blue-button']} variant='pills' defaultValue={"Kolaborasi Inovasi"}>
          <TabsList p={"xs"} bg={"#BBC8E7FF"}>
            <TabsTab value="Kolaborasi Inovasi">
               Kolaborasi Inovasi
            </TabsTab>
            <TabsTab value="Mitra Kolaborasi">
              Mitra Kolaborasi
            </TabsTab>
          </TabsList>

          <TabsPanel value="Kolaborasi Inovasi">
            <KolaborasiInovasi/>
          </TabsPanel>

          <TabsPanel value="Mitra Kolaborasi">
            <MitraKolaborasi/>
          </TabsPanel>
        </Tabs>
      </Stack>
    </Box>
  );
}

export default Page;

import colors from '@/con/colors';
import { Stack, Title, Tabs, TabsList, TabsTab, TabsPanel } from '@mantine/core';
import React from 'react';
import SejarahDesa from './ui/sejarah_desa/page';
import VisiMisiDesa from './ui/visi_misi_desa/page';
import LambangDesa from './ui/lambang_desa/page';
import MaskotDesa from './ui/maskot_desa/page';
import ProfilePerbekel from './ui/profile_perbekel/page';

function Page() {
  return (
    <Stack >
    <Title order={3}>Profile Desa</Title>
    <Tabs  color={colors['blue-button']} variant='pills' defaultValue={"Sejarah Desa"}>
      <TabsList p={"xs"} bg={"#BBC8E7FF"}>
        <TabsTab value="Sejarah Desa">
          Sejarah Desa
        </TabsTab>
        <TabsTab value="Visi Misi Desa">
          Visi Misi Desa
        </TabsTab>
        <TabsTab value="Lambang Desa">
          Lambang Desa
        </TabsTab>
        <TabsTab value="Maskot Desa">
          Maskot Desa
        </TabsTab>
        <TabsTab value="Profile Perbekel">
          Profile Perbekel
        </TabsTab>
      </TabsList>

      <TabsPanel value="Sejarah Desa">
        <SejarahDesa/>
      </TabsPanel>
      <TabsPanel value="Visi Misi Desa">
        <VisiMisiDesa/>
      </TabsPanel>
      <TabsPanel value="Lambang Desa">
       <LambangDesa/>
      </TabsPanel>
      <TabsPanel value="Maskot Desa">
       <MaskotDesa/>
      </TabsPanel>
      <TabsPanel value="Profile Perbekel">
        <ProfilePerbekel/>
      </TabsPanel>
    </Tabs>
  </Stack>
  );
}

export default Page;

import colors from '@/con/colors';
import { Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import React from 'react';
import DataSektorUnggulan from './ui/data_sektor_unggulan/page';
import GrafikDataSektor from './ui/grafik_data_sektor/page';

function Page() {
  return (
    <Stack>
      <Title order={3}>Sektor Unggulan Desa</Title>
      <Tabs color={colors['blue-button']} variant='pills' defaultValue={"Data Sektor Unggulan Desa"}>
        <TabsList p={"xs"} bg={"#BBC8E7FF"}>
          <TabsTab value="Data Sektor Unggulan Desa">
            Data Sektor Unggulan Desa
          </TabsTab>
          <TabsTab value="Grafik Data Sektor Unggulan Desa">
            Grafik Data Sektor Unggulan Desa
          </TabsTab>
        </TabsList>

        <TabsPanel value="Data Sektor Unggulan Desa">
          <DataSektorUnggulan />
        </TabsPanel>
        <TabsPanel value="Grafik Data Sektor Unggulan Desa">
          <GrafikDataSektor />
        </TabsPanel>
      </Tabs>
    </Stack>
  );
}

export default Page;

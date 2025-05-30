import colors from '@/con/colors';
import { Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import DataPengangguran from './ui/dataPengangguran/page';
import GrafikDataPengangguran from './ui/grafikDataPengangguran/page';
import DetailDataPengangguran from './ui/detailDataPengangguran/page';

function Page() {
  return (
    <Stack>
      <Title order={3}>Jumlah Pengangguran 2024-2025</Title>
      <Tabs color={colors['blue-button']} variant='pills' defaultValue={"Data Pengangguran Desa"}>
        <TabsList p={"xs"} bg={"#BBC8E7FF"}>
          <TabsTab value="Data Pengangguran Desa">
            Data Pengangguran Desa
          </TabsTab>
          <TabsTab value="Grafik Data Pengangguran Desa">
            Grafik Data Pengangguran Desa
          </TabsTab>
          <TabsTab value="Detail Data Pengangguran Desa">
            Detail Data Pengangguran Desa
          </TabsTab>
        </TabsList>
        <TabsPanel value="Data Pengangguran Desa">
          <DataPengangguran/>
        </TabsPanel>
        <TabsPanel value="Grafik Data Pengangguran Desa">
          <GrafikDataPengangguran/>
        </TabsPanel>
        <TabsPanel value="Detail Data Pengangguran Desa">
          <DetailDataPengangguran/>
        </TabsPanel>
      </Tabs>
    </Stack>
  )
}

export default Page;

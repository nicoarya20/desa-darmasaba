import { Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import React from 'react';
import colors from '@/con/colors';
import GrafikHasilKepuasan from './_ui/grafik_hasil_kepuasan_masyarakat/page';
import GrafikBerdasarkanJenisKelamin from './_ui/grafik_berdasarkan_jenis_kelamin_responden/page';
import GrafikBerdasarkanResponden from './_ui/grafik_berdasarkan_responden/page';
import GrafikBerdasarakanUmur from './_ui/grafik_berdasarkan_umur/page';

function Page() {
  return (
    <Stack >
      <Title order={3}>Indeks Kepuasan Masyarakat (IKM) Desa Darmasaba</Title>
      <Tabs  color={colors['blue-button']} variant='pills' defaultValue={"Grafik Hasil Kepuasan Masyarakat Terhadap Pelayanan Publik"}>
        <TabsList p={"xs"} bg={"#BBC8E7FF"}>
          <TabsTab value="Grafik Hasil Kepuasan Masyarakat Terhadap Pelayanan Publik">
            Grafik Hasil Kepuasan Masyarakat Terhadap Pelayanan Publik
          </TabsTab>
          <TabsTab value="Grafik Berdasarkan Jenis Kelamin Responden">
            Grafik Berdasarkan Jenis Kelamin Responden
          </TabsTab>
          <TabsTab value="Grafik Berdasarkan Pilihan Responden">
            Grafik Berdasarkan Pilihan Responden
          </TabsTab>
          <TabsTab value="Grafik Berdasarkan Umur Responden">
            Grafik Berdasarkan Umur Responden
          </TabsTab>
        </TabsList>

        <TabsPanel value="Grafik Hasil Kepuasan Masyarakat Terhadap Pelayanan Publik">
          <GrafikHasilKepuasan/>
        </TabsPanel>
        <TabsPanel value="Grafik Berdasarkan Jenis Kelamin Responden">
          <GrafikBerdasarkanJenisKelamin/>
        </TabsPanel>
        <TabsPanel value="Grafik Berdasarkan Pilihan Responden">
          <GrafikBerdasarkanResponden/>
        </TabsPanel>
        <TabsPanel value="Grafik Berdasarkan Umur Responden">
          <GrafikBerdasarakanUmur/>
        </TabsPanel>
      </Tabs>
    </Stack>
  );
}

export default Page;

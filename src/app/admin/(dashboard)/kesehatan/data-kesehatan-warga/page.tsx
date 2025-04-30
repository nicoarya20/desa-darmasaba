import colors from '@/con/colors';
import { Stack, Tabs, TabsList, TabsPanel, TabsTab } from '@mantine/core';
import ArtikelKesehatan from './_ui/artikel_kesehatan/page';
import FasilitasKesehatan from './_ui/fasilitas_kesehatan/page';
import GrafikHasilKepuasan from './_ui/grafik_hasil_kepuasan/page';
import JadwalKegiatan from './_ui/jadwal_kegiatan/page';
import PersentaseDataKelahiranKematian from './_ui/persentase_data_kelahiran_kematian/page';


function Page() {
  return (
    <Stack>
      <Tabs color={colors['blue-button']} variant='pills' defaultValue={"Persentase Kelahiran & Kematian"}>
        <TabsList >
          <TabsTab value="Persentase Kelahiran & Kematian">
            Persentase Kelahiran & Kematian
          </TabsTab>
          <TabsTab value="Grafik Hasil Kepuasan">
            Grafik Hasil Kepuasan
          </TabsTab>
          <TabsTab value="Fasilitas Kesehatan">
            Fasilitas Kesehatan
          </TabsTab>
          <TabsTab value="Jadwal Kegiatan">
            Jadwal Kegiatan
          </TabsTab>
          <TabsTab value="Artikel Kesehatan">
            Artikel Kesehatan
          </TabsTab>
        </TabsList>

        <TabsPanel value="Persentase Kelahiran & Kematian">
          <PersentaseDataKelahiranKematian />
        </TabsPanel>
        <TabsPanel value="Grafik Hasil Kepuasan">
          <GrafikHasilKepuasan/>
        </TabsPanel>
        <TabsPanel value="Fasilitas Kesehatan">
          <FasilitasKesehatan/>
        </TabsPanel>
        <TabsPanel value="Jadwal Kegiatan">
          <JadwalKegiatan/>
        </TabsPanel>
        <TabsPanel value="Artikel Kesehatan">
          <ArtikelKesehatan/>
        </TabsPanel>

      </Tabs>
    </Stack>
  );
}

export default Page;
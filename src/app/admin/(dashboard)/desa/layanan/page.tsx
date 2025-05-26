import colors from '@/con/colors';
import { Box, Stack, Tabs, TabsList, TabsPanel, TabsTab, Title } from '@mantine/core';
import SuratKeterangan from './ui/surat_keterangan/page';
import PerizinanUsaha from './ui/perizinan_usaha/page';
import TelunjukSaktiDesa from './ui/telunjuk_sakti_desa/page';
import PendudukNonPermanent from './ui/penduduk_non_permanent/page';

function Page() {
  return (
    <Box py={10}>
      <Stack >
        <Title order={3}>Layanan</Title>
        <Tabs color={colors['blue-button']} variant='pills' defaultValue={"Pelayanan Surat Keterangan"}>
          <TabsList p={"xs"} bg={"#BBC8E7FF"}>
            <TabsTab value="Pelayanan Surat Keterangan">
              Pelayanan Surat Keterangan
            </TabsTab>
            <TabsTab value="Pelayanan Perizinan Berusaha">
              Pelayanan Perizinan Berusaha
            </TabsTab>
            <TabsTab value="Pelayanan Telunjuk Sakti Desa">
              Pelayanan Telunjuk Sakti Desa
            </TabsTab>
            <TabsTab value="Pelayanan Penduduk Non-Permanent">
              Pelayanan Penduduk Non-Permanent
            </TabsTab>
          </TabsList>

          <TabsPanel value="Pelayanan Surat Keterangan">
            <SuratKeterangan />
          </TabsPanel>
          <TabsPanel value="Pelayanan Perizinan Berusaha">
            <PerizinanUsaha />
          </TabsPanel>
          <TabsPanel value="Pelayanan Telunjuk Sakti Desa">
            <TelunjukSaktiDesa />
          </TabsPanel>
          <TabsPanel value="Pelayanan Penduduk Non-Permanent">
            <PendudukNonPermanent />
          </TabsPanel>
        </Tabs>
      </Stack>
    </Box>
  );
}

export default Page;


import { Box, Button, SimpleGrid, Stack, Title } from '@mantine/core';
import InformasiKegiatan from './informasi_kegiatan/page';
import DeskripsiKegiatan from './deskripsi_kegiatan/page';
import LayananTersedia from './layanan_yang_tersedia/page';
import SyaratDanKetentuan from './syarat_dan_ketentuan/page';
import DokumenYangDiperlukan from './dokumen_yang_diperlukan/page';
import Pendaftaran from './pendaftaran/page';

function JadwalKegiatan() {
  return (
    <Stack py={10}>
      <SimpleGrid cols={{
        base: 1, md: 2
      }}>
        <Box>
          <Title order={3}>Jadwal Kegiatan</Title>
          <InformasiKegiatan/>
          <DeskripsiKegiatan/>
          <LayananTersedia/>
          <SyaratDanKetentuan/>
          <DokumenYangDiperlukan/>
          <Pendaftaran/>
          <Button mt={10} fullWidth>Submit</Button>
        </Box>
        <Box>
          <Title order={3}>List Jadwal Kegiatan</Title>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}


export default JadwalKegiatan;

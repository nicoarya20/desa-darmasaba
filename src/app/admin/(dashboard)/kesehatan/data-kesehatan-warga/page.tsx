import { Stack } from '@mantine/core';
import ArtikelKesehatan from './_ui/artikel_kesehatan/page';
import FasilitasKesehatan from './_ui/fasilitas_kesehatan/page';
import JadwalKegiatan from './_ui/jadwal_kegiatan/page';


function Page() {
  return (
    <Stack>
        <FasilitasKesehatan/>
        <JadwalKegiatan/>
        <ArtikelKesehatan/>
    </Stack>
  );
}

export default Page;
//Fasilitas Kesehatan Jadwal Kegiatan Artikel Kesehatan
import stateJadwalKegiatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import { Box, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';

function DeskripsiKegiatan() {
  const deskripsiKegiatanState = useProxy(stateJadwalKegiatan.deskripsiKegiatan)
  return (
    <Box>
      <Text pt={10} fw={"bold"}>Deskripsi Kegiatan</Text>
      <KesehatanEditor
      showSubmit={false}
      onChange={(val) => {
        deskripsiKegiatanState.create.form.deskripsi = val
      }}
      />
    </Box>
  );
}

export default DeskripsiKegiatan;

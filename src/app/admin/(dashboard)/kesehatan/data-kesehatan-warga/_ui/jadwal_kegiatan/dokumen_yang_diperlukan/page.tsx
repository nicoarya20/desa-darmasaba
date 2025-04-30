import stateJadwalKegiatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import { Box, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';

function DokumenYangDiperlukan() {
  const dokumenDiperlukan = useProxy(stateJadwalKegiatan.dokumenjadwalkegiatan)
  return (
    <Box>
      <Text pt={10} fw={"bold"}>Dokumen Yang Diperlukan</Text>
      <KesehatanEditor
      showSubmit={false}
      onChange={(val)=> {
        dokumenDiperlukan.create.form.content = val;
      }}
      />
    </Box>
  );
}

export default DokumenYangDiperlukan;



import stateJadwalKegiatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import { Box, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';

function LayananTersedia() {
  const layananTersediaState = useProxy(stateJadwalKegiatan.layanantersedia)
  return (
    <Box>
      <Text pt={10} fw={"bold"}>Layanan Yang Tersedia</Text>
      <KesehatanEditor
      showSubmit={false}
      onChange={(val) => {
        layananTersediaState.create.form.content = val;
      }}
      />
    </Box>
  );
}

export default LayananTersedia;

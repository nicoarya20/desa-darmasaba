import stateJadwalKegiatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import { Box, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';

function SyaratDanKetentuan() {
  const syaratKetentuan = useProxy(stateJadwalKegiatan.syaratketentuan)
  return (
    <Box>
      <Text pt={10} fw={"bold"}>Syarat dan Ketentuan</Text>
      <KesehatanEditor
      showSubmit={false}
      onChange={(val) => {
        syaratKetentuan.create.form.content = val;
      }}
      />
    </Box>
  );
}

export default SyaratDanKetentuan;

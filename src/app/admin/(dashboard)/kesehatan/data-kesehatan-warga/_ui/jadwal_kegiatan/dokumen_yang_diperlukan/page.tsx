import stateJadwalKegiatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import { Box, Paper, Stack, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';
import colors from '@/con/colors';

function DokumenYangDiperlukan() {
  const dokumenDiperlukan = useProxy(stateJadwalKegiatan.dokumenjadwalkegiatan)
  return (
    <Box>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Text pt={10} fw={"bold"}>Dokumen Yang Diperlukan</Text>
          <KesehatanEditor
            showSubmit={false}
            onChange={(val) => {
              dokumenDiperlukan.create.form.content = val;
            }}
          />
        </Stack>
      </Paper>
    </Box>
  );
}

export default DokumenYangDiperlukan;



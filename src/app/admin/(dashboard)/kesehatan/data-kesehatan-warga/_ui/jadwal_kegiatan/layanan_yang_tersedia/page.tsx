import stateJadwalKegiatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import { Box, Paper, Stack, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';
import colors from '@/con/colors';

function LayananTersedia() {
  const layananTersediaState = useProxy(stateJadwalKegiatan.layanantersedia)
  return (
    <Box>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Text pt={10} fw={"bold"}>Layanan Yang Tersedia</Text>
          <KesehatanEditor
            showSubmit={false}
            onChange={(val) => {
              layananTersediaState.create.form.content = val;
            }}
          />
        </Stack>
      </Paper>
    </Box>
  );
}

export default LayananTersedia;

'use client'
import colors from '@/con/colors';
import { Box, Paper, Stack, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../_com/kesehatanEditor';
import stateJadwalKegiatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';

function SyaratDanKetentuan() {
  const syaratKetentuan = useProxy(stateJadwalKegiatan.syaratketentuan)
  return (
    <Box>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Text pt={10} fw={"bold"}>Syarat dan Ketentuan</Text>
          <KesehatanEditor
            showSubmit={false}
            onChange={(val) => {
              syaratKetentuan.create.form.content = val;
            }}
          />
        </Stack>
      </Paper>
    </Box>
  );
}

export default SyaratDanKetentuan;

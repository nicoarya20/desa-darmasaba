'use client'
import stateJadwalKegiatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import colors from '@/con/colors';
import { Box, Paper, Stack, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../_com/kesehatanEditor';

function DeskripsiKegiatan() {
  const deskripsiKegiatanState = useProxy(stateJadwalKegiatan.deskripsiKegiatan)
  return (
    <Box>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Text pt={10} fw={"bold"}>Deskripsi Kegiatan</Text>
          <KesehatanEditor
            showSubmit={false}
            onChange={(val) => {
              deskripsiKegiatanState.create.form.deskripsi = val
            }}
          />
        </Stack>
      </Paper>
    </Box>
  );
}

export default DeskripsiKegiatan;

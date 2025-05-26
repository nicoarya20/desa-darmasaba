'use client'
import stateFasilitasKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import { Box, Paper, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';
import colors from '@/con/colors';

function LayananUnggulan() {
  const informasiumumState = useProxy(stateFasilitasKesehatan.layananunggulan)
  return <Box>
    <Paper bg={colors['white-1']} p={'md'}>
    <Text fw={"bold"}>Layanan Unggulan</Text>
    <KesehatanEditor 
    showSubmit={false}
    onChange={(val) => {
      informasiumumState.create.form.content = val;
    }} />
    </Paper>
  </Box>
    ;
}

export default LayananUnggulan;

'use client'
import colors from '@/con/colors';
import { Box, Paper, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../_com/kesehatanEditor';
import stateFasilitasKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';

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

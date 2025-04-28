'use client'
import stateFasilitasKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/fasilitasKesehatan';
import { Box, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';

function LayananUnggulan() {
  const informasiumumState = useProxy(stateFasilitasKesehatan.layananunggulan)
  return <Box>
    <Text fw={"bold"}>Layanan Unggulan</Text>
    <KesehatanEditor 
    showSubmit={false}
    onChange={(val) => {
      informasiumumState.create.form.content = val;
    }} />
  </Box>
    ;
}

export default LayananUnggulan;

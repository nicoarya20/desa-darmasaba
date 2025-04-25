'use client'
import { Box, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import stateKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/kesehatan';
import { BeritaEditor } from '@/app/admin/(dashboard)/desa/berita/_com/BeritaEditor';

function LayananUnggulan() {
  const informasiumumState = useProxy(stateKesehatan.layananunggulan)
  return <Box>
    <Text fw={"bold"}>Layanan Unggulan</Text>
    <BeritaEditor onSubmit={(val) => {
      informasiumumState.create.form.content = val
      informasiumumState.create.create()
    }} />
  </Box>
    ;
}

export default LayananUnggulan;

import stateKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/kesehatan';
import { BeritaEditor } from '@/app/admin/(dashboard)/desa/berita/_com/BeritaEditor';
import { Box, Text } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';

function FasilitasPendukung() {
  const fasilitaspendukungState = useProxy(stateKesehatan.fasilitaspendukung)
  return <Box>
    <Text fw={"bold"}>Fasilitas Pendukung</Text>
    <BeritaEditor onSubmit={(val) => {
      fasilitaspendukungState.create.form.content = val
      fasilitaspendukungState.create.create()
    }}/>
  </Box>
}

export default FasilitasPendukung;

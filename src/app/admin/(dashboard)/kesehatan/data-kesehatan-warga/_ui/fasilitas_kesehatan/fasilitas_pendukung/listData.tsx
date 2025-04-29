import { Box, Stack, Text } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';
import stateFasilitasKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import { useShallowEffect } from '@mantine/hooks';

function FasilitasPendukungList() {
  const fasilitaspendukungState = useProxy(stateFasilitasKesehatan.fasilitaspendukung)
  useShallowEffect(() => {
    fasilitaspendukungState.findMany.load()
  }, [])
  return <Stack>
    {fasilitaspendukungState.findMany.data?.map((item) => (
      <Box key={item.id}>
        <Text dangerouslySetInnerHTML={{__html: item.content}}/>
      </Box>
    ))}
  </Stack>
}

export default FasilitasPendukungList;

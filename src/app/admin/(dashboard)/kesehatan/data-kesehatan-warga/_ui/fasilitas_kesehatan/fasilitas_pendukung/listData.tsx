import { Box, Stack, Text } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';
import stateKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/kesehatan';
import { useShallowEffect } from '@mantine/hooks';

function FasilitasPendukungList() {
  const fasilitaspendukungState = useProxy(stateKesehatan.fasilitaspendukung)
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

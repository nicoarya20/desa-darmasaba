'use client'
import React from 'react';
import { useProxy } from 'valtio/utils';
import stateDasarHukumPPID from '../../../_state/ppid/dasar_hukum/dasarHukum';
import { useShallowEffect } from '@mantine/hooks';
import { Box, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import colors from '@/con/colors';

function ListDataDasarHukum() {
  const dataList = useProxy(stateDasarHukumPPID)
  useShallowEffect(() => {
    dataList.findById.load("")
  }, [])

  if(!dataList.findById.data) return <Stack>
    {Array.from({length: 10}).map((v, k) => <Skeleton key={k} h={40} />)}
  </Stack>

const dataArray = Array.isArray(dataList.findById.data)
  ? dataList.findById.data
  : [dataList.findById.data];

  return (
    <Paper bg={colors['white-1']} p={'md'} radius={10}>
    <Stack gap={"xs"}>
    <Title order={3}>List Dasar Hukum PPID</Title>
    {dataArray.map((item) => (
      <Box key={item.id}>
        <Text fw={"bold"}>Judul</Text>
        <Text dangerouslySetInnerHTML={{ __html: item.judul }}></Text>
        <Text fw={"bold"}>Content</Text>
        <Text dangerouslySetInnerHTML={{ __html: item.content }}></Text>
      </Box>
    ))}
    </Stack>
    </Paper>
  );
}

export default ListDataDasarHukum;

'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Title } from '@mantine/core';
import CreateDasarHukum from './create/create';
import ListDataDasarHukum from './listData/page';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import stateDasarHukumPPID from '../../_state/ppid/dasar_hukum/dasarHukum';
import { useEffect, useState } from 'react';

function Page() {
  const dasarHukumState = useProxy(stateDasarHukumPPID)
  const [judul, setJudul] = useState('');
  const [content, setContent] = useState('');

  useShallowEffect(() => {
    if (!dasarHukumState.findById.data) {
      dasarHukumState.findById.initialize(); // biar masuk ke `findFirst` route kamu
    }
  }, []);

  useEffect(() => {
    if (dasarHukumState.findById.data) {
      setJudul(dasarHukumState.findById.data.judul ?? '')
      setContent(dasarHukumState.findById.data.content ?? '')
    }
  }, [dasarHukumState.findById.data])

  const submit = () => {
    if (dasarHukumState.findById.data) {
      dasarHukumState.findById.data.judul = judul;
      dasarHukumState.findById.data.content = content;
      dasarHukumState.update.save(dasarHukumState.findById.data)
    }
  }

  return (
    <Stack gap={"xs"}>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Box>
          <Paper bg={colors['white-1']} p={'md'} radius={10}>
            <Title order={3}>Dasar Hukum PPID</Title>
            <CreateDasarHukum onJudulChange={setJudul} onContentChange={setContent} valueJudul={judul} valueContent={content} />
            <Group>
              <Button
                mt={10}
                bg={colors['blue-button']}
                onClick={submit}
                loading={dasarHukumState.update.loading}
              >
                Submit
              </Button>
            </Group>
          </Paper>
        </Box>
        <ListDataDasarHukum />
      </SimpleGrid>
    </Stack>
  )
}

export default Page;

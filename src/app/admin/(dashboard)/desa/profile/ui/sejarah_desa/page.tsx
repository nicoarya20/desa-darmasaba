'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import DesaEditorText from '../../../_com/desaEditorText';
import ListPage from './listPage';
import { useShallowEffect } from '@mantine/hooks';


function SejarahDesa() {
  const stateSejarah = useProxy(stateProfileDesa.Sejarah)

  useShallowEffect(() => {
    if (!stateSejarah.findById.data) {
      stateSejarah.findById.initialize()
    }
  }, [])

  const submit = () => {
    if (stateSejarah.findById.data?.id && stateSejarah.findById.data.sejarah) {
      stateSejarah.update.save({
        id: stateSejarah.findById.data.id,
        sejarah: stateSejarah.findById.data.sejarah
      })
    }
  }

  return (
    <Box py={10}>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Box>
          <Paper bg={colors['white-1']} p={'md'}>
            <Stack>
              <Title order={3}>Sejarah Desa</Title>
              <Text fw={"bold"}>Deskripsi Sejarah Desa</Text>
              <DesaEditorText
                key={stateSejarah.findById.data?.id ?? 'new'}
                showSubmit={false}
                onChange={(val) => {
                  if (stateSejarah.findById.data) {
                    stateSejarah.findById.data.sejarah = val
                  }
                }}
                initialContent={stateSejarah.findById.data?.sejarah ?? ""}
              />
              <Group>
                <Button
                  mt={10}
                  bg={colors['blue-button']}
                  onClick={submit}
                >
                  Submit
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Box>
        <ListPage />
      </SimpleGrid>
    </Box>
  );
}

export default SejarahDesa;

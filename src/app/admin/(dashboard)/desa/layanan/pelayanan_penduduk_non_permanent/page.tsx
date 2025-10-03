'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Divider,
  Grid,
  GridCol,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import stateLayananDesa from '../../../_state/desa/layananDesa';

function PelayananPendudukNonPermanent() {
  const router = useRouter();
  const pelayananPendudukNonPermanen = useProxy(
    stateLayananDesa.pelayananPendudukNonPermanen
  );

  useShallowEffect(() => {
    pelayananPendudukNonPermanen.findById.load('1');
  }, []);

  if (!pelayananPendudukNonPermanen.findById.data) {
    return (
      <Stack align="center" justify="center" py="xl">
        <Skeleton radius="md" height={800} />
      </Stack>
    );
  }

  const data = pelayananPendudukNonPermanen.findById.data;

  return (
    <Paper bg={colors['white-1']} p="lg" radius="md" shadow="sm">
      <Stack gap="md">
        {/* Header */}
        <Grid align="center">
          <GridCol span={{ base: 12, md: 11 }}>
            <Title order={3} c={colors['blue-button']}>
              Preview Pelayanan Penduduk Non Permanen
            </Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 1 }}>
            <Tooltip label="Edit Data Pelayanan" withArrow>
              <Button
                c="green"
                variant="light"
                leftSection={<IconEdit size={18} stroke={2} />}
                radius="md"
                onClick={() =>
                  router.push(
                    `/admin/desa/layanan/pelayanan_penduduk_non_permanent/${data.id}`
                  )
                }
              >
                Edit
              </Button>
            </Tooltip>
          </GridCol>
        </Grid>

        {/* Content */}
        <Paper p="xl" bg={'white'} withBorder radius="md" shadow="xs">
          <Box px={{ base: 0, md: 50 }} pb="xl">
            <Center>
              <Text
                ta="center"
                fz={{ base: '1.2rem', md: '1.8rem' }}
                fw="bold"
                c={colors['blue-button']}
              >
                {data.name}
              </Text>
            </Center>

            <Divider my="md" color={colors['blue-button']} />

            <Box mt="lg">
              <Text
                py={10}
                ta="justify"
                fz={{ base: '1rem', md: '1.2rem' }}
                dangerouslySetInnerHTML={{ __html: data.deskripsi }}
                style={{wordBreak: "break-word", whiteSpace: "normal"}}
              />
            </Box>
          </Box>
        </Paper>
      </Stack>
    </Paper>
  );
}

export default PelayananPendudukNonPermanent;

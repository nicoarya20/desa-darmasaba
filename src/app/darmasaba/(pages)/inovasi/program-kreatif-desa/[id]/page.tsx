'use client'
import programKreatifState from '@/app/admin/(dashboard)/_state/inovasi/program-kreatif';
import colors from '@/con/colors';
import { Box, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';

import { IconKey, IconMapper } from '@/app/admin/(dashboard)/_com/iconMap';
import BackButton from '../../../desa/layanan/_com/BackButto';

function Page() {
  const stateProgramKreatif = useProxy(programKreatifState);
  const params = useParams();

  useShallowEffect(() => {
    stateProgramKreatif.findUnique.load(params?.id as string);
  }, [params?.id]);

  if (!stateProgramKreatif.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const data = stateProgramKreatif.findUnique.data;

  return (
    <Box px={{ base: 'md', md: 100 }} py="md">
      {/* Tombol Kembali */}
      <Box mb="md">
        <BackButton/>
      </Box>

      {/* Konten Utama */}
      <Paper
        withBorder
        w={{ base: '100%', md: '60%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        mx="auto"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            {data?.name || 'Program Kreatif Desa'}
          </Text>

          {/* Ikon */}
          {data?.icon && (
            <Box>
              <IconMapper
                name={data.icon as IconKey}
                size={40}
                color={colors['blue-button']}
              />
            </Box>
          )}

          {/* Deskripsi Singkat */}
          <Box>
            <Text fz="lg" fw="bold">
              Deskripsi Singkat
            </Text>
            <Text fz="md" c="dimmed">{data?.slug || '-'}</Text>
          </Box>

          {/* Deskripsi Detail */}
          <Box>
            <Text fz="lg" fw="bold">
              Deskripsi
            </Text>
            <Text
              fz="md"
              c="dimmed"
              dangerouslySetInnerHTML={{ __html: data?.deskripsi || '-' }}
              style={{wordBreak: "break-word", whiteSpace: "normal"}}
            />
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Page;
